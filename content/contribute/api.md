---
title: contribute — API
description: The contribute_extractor and contribute_check methods of openremap.api — input schemas, the two modes, the result shape, and error codes.
tags: [contribute, api, rpc, contribution]
status: stable
---

# contribute — API

> This page is for **developers**. For a plain-English explanation, see the
> [introduction](index.md).

Two methods, both thin gates over the same engine the
[CLI](cli.md) drives:

| Method | `kind` | What it does |
|---|---|---|
| `contribute_extractor` | `command` | Measure one or more dumps and render the contribution artifacts |
| `contribute_check` | `command` | Run the same review bar over an extractor that already exists |

Neither writes a file. The CLI decides where artifacts go, so a host can diff
them first — that is what keeps the "never commit a ROM" rule enforceable at the
one place that touches the filesystem.

## `contribute_extractor` — input schema

```python
{
    "paths":        {"type": "list", "required": True},
    "brand":        {"type": "str"},
    "family":       {"type": "str"},
    "marker":       {"type": "str"},
    "marker_hex":   {"type": "str"},
    "measure_only": {"type": "bool", "default": False},
}
```

| Parameter | Notes |
|---|---|
| `paths` | Your dump(s). All must be the **same** family. |
| `brand` | Manufacturer name. Required unless `measure_only` — measurement does not need to know the answer. |
| `family` | Family key. Required unless `measure_only`. |
| `marker` | Override the chosen signature (text). Default: the top collision-free candidate. |
| `marker_hex` | Override it as hex, for non-ASCII bytes. Mutually exclusive with `marker`. |
| `measure_only` | Measure without the collision check. Needs no checkout, recommends no marker, produces no artifacts. |

The schema is the authoritative contract for API callers: it declares each
parameter's type, default and bounds, and the registry validates every call
against it. The CLI declares its own `--flags`, so a schema change reaches the
terminal only when the CLI is updated too — check the live schema with
`list_methods`.

## The two modes

The method returns a `mode` field telling you which one ran:

```python
{"mode": "measure", "spec": None, "analysis": {...},
 "artifacts": None, "verification": None, "paths": {}}
```

```python
{"mode": "contribute", "spec": {...}, "analysis": {...},
 "artifacts": {...}, "verification": {...}, "paths": {...}}
```

**`measure`** is what you get with `measure_only` and no fixture corpus
available: pure local computation, no recommendation, no artifacts. **`contribute`**
runs the collision check against every known-family fixture and renders the
artifacts. Without `measure_only`, a missing corpus is an error — not a silent
downgrade.

## Calling it in-process (Python)

A first look, no checkout and no family name:

```python
import openremap.api as api

measured = api.call(
    "contribute_extractor",
    {"paths": ["my_dump.bin"], "measure_only": True},
)

print(measured["mode"])                       # "measure"
print(measured["analysis"]["collisions_checked"])   # False
for dump in measured["analysis"]["dumps"]:
    print(dump["name"], dump["claimed_by"])
for candidate in measured["analysis"]["candidates"][:5]:
    print(candidate["score"], candidate["marker"])   # unranked by safety
```

The full run:

```python
result = api.call(
    "contribute_extractor",
    {
        "paths": ["my_dump.bin", "my_other_dump.bin"],
        "brand": "Acme",
        "family": "AC3000",
    },
)

print(result["mode"])                            # "contribute"
print(result["spec"]["marker"])                  # the chosen signature
print(result["analysis"]["fixtures_checked"])    # 89
print(result["verification"]["ok"])              # True only if every check passed
for check in result["verification"]["checks"]:
    print("ok" if check["ok"] else "FAIL", check["name"], check["detail"])
```

Nothing was written — `result["artifacts"]` holds the rendered text and
`result["paths"]` says where the CLI would put it.

## Result shape

### `analysis`

| Key | What it holds |
|---|---|
| `dumps` | Per-dump `{name, size, sha256, claimed_by, identity}` |
| `already_handled` | `True` when an extractor already claims **every** dump — the change belongs in that extractor, not a new one |
| `candidates` | Ranked markers: `{marker, score, collisions, collision_families, clean, verdict}` |
| `recommended` | The marker to use (`None` in measure mode) |
| `collisions_checked` | `False` in measure mode — the ranking is then unranked by safety |
| `fixtures_checked` | How many known-family fixtures were tried (`0` without a corpus) |
| `fields` | Candidate identity fields, split into family constants and per-dump values |
| `suggestions` | Family names the dump's own descriptors suggest |
| `notes` | Human-readable observations |

A candidate is `clean` only when the marker occurs in **no** known-family
fixture. Otherwise `verdict` names the families it collides with.

### `spec` (contribute mode only)

`{brand, family, marker, marker_hex, marker_offset, sizes, exclusions, collides_with}`.
`exclusions` are the guards harvested from the colliding family's own ident
token — the wizard knows that string because it built the fixture containing it.

### `verification`

`{ok, checks: [{name, ok, detail}]}`. The checks are the review bar:

| Check | What must hold |
|---|---|
| `compiles` | The rendered source is valid Python |
| `claims its own fixture` | It recognises the fixture built from your dumps |
| `steals no other family` | It accepts none of the other fixtures |
| `clears evidence on a miss` | Every rejection path resets the evidence |
| `declares the family it reports` | `supported_families` matches `extract()` |

The rendered skeleton is **executed** against all 89 fixtures to produce this —
a generated file that has never been run is worse than no file.

### `artifacts` and `paths`

| `artifacts` key | `paths` key | Destination |
|---|---|---|
| `recipe` | `recipe` | `_dev/contrib/recipes/<name>.mimic` |
| `extractor` | `extractor` | `openremap/core/manufacturers/<brand>/<family>/extractor.py` |
| `test` | `test` | `tests/tuning/manufacturers/test_<family>_extractor.py` |
| `report` | `report` | `<family>-contribution.md` |
| — | `package` | the package directory, for the import lines |

## `contribute_check`

```python
{
    "path": {"type": "str", "required": True,
             "description": "Path to the extractor module (…/extractor.py)."}
}
```

```python
import openremap.api as api

report = api.call(
    "contribute_check",
    {"path": "openremap/core/manufacturers/acme/ac3000/extractor.py"},
)
print(report["ok"], report["family"])
for check in report["checks"]:
    print("ok" if check["ok"] else "FAIL", check["name"], check["detail"])
```

The result is `{ok, module, family, checks, stolen, path}`. Besides the five
runtime checks above it also runs static findings and a
`reachable from the registry` check — an unimported extractor identifies
nothing.

## Calling them over JSON-RPC

```bash
echo '{"id": 1, "method": "contribute_extractor", "params": {"paths": ["my_dump.bin"], "measure_only": true}}' \
  | python -m openremap.api.transport.stdio
```

```bash
echo '{"id": 1, "method": "contribute_check", "params": {"path": "openremap/core/manufacturers/acme/ac3000/extractor.py"}}' \
  | python -m openremap.api.transport.stdio
```

## Error handling

| Code | Meaning | Example message |
|---|---|---|
| `-32602` | Invalid params | `contribute_extractor: brand and family are required to generate a contribution; pass measure_only for a measurement that needs neither` |
| `-32601` | Method not registered | `Unknown method: 'contribute_extractorx'` |
| `-32603` | Unexpected internal failure | — |

Caller-side problems all arrive as `-32602` with something actionable:

| Situation | Message |
|---|---|
| No `paths` | `contribute_extractor: at least one path is required` |
| Missing file | `contribute_extractor: …` (the loader's message) |
| Both markers | `contribute_extractor: pass marker or marker_hex, not both` |
| Bad hex | `contribute_extractor: bad marker_hex: …` |
| No corpus, not `measure_only` | `contribute_extractor: no fixture recipes found (_dev/contrib/recipes/): …` |
| No `contribute_check` file | `contribute_check: no such file: …` |

## Discovery — `list_methods`

```python
import openremap.api as api

for m in api.call("list_methods", {"kind": "command"})["methods"]:
    if m["name"].startswith("contribute"):
        print(m["name"], m["input_schema"])
```

## See also

- [contribute — CLI](cli.md) — the same two methods from the terminal
- [contribute — introduction](index.md) — why the wizard is split in two
- [Contributing](../project/contributing.md) — the review bar in prose
- [`synth` — API](../synth/api.md) — generate a file instead of measuring one
