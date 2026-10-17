---
title: contribute — CLI
description: The openremap contribute command — both verbs, every flag, the two modes, what --write produces, and the exit codes.
tags: [contribute, cli, contribution]
status: stable
---

# `openremap contribute`

Contribute a new ECU family: measure your own dump, find a signature that is
stable in that family and absent from every family the engine already
recognises, then generate the files a pull request needs.

New here? Read the [plain-English introduction](index.md) first.

The wizard has **two verbs**:

```bash
openremap contribute extractor my_dump.bin --measure-only
openremap contribute check openremap/core/manufacturers/acme/ac3000/extractor.py
```

The same logic is available from [Python code](api.md) and
[JSON-RPC](api.md#calling-it-over-json-rpc).

## `contribute extractor`

```bash
openremap contribute extractor DUMP [--also PATH]... [--brand NAME] [--family KEY]
                                    [--marker TEXT | --marker-hex HEX]
                                    [--write] [--out DIR] [--measure-only] [--json]
```

| Argument | Required | Description |
|---|---|---|
| `DUMP` | Yes | Your dump — the family you want added. |

| Option | Default | Description |
|---|---|---|
| `--brand NAME` | — | Manufacturer name, e.g. `Siemens`. Required unless `--measure-only`. |
| `--family KEY` | — | Family key, e.g. `SID206`. Required unless `--measure-only` — a first look should not need the answer it is trying to produce. |
| `--also PATH` | — | Another dump of the **same** family. Repeatable. Two or more dumps are how marker stability is actually verified, so it is worth the extra file. |
| `--marker TEXT` | recommended one | Use this signature instead of the recommended one. |
| `--marker-hex HEX` | — | Same, for signatures with non-ASCII bytes. Mutually exclusive with `--marker`. |
| `--write` | off | Write the generated files into the repository. |
| `--out DIR` | current directory | Where the report goes when `--write` is used. |
| `--measure-only` | off | Measure without the collision check. Needs no checkout, recommends no marker, and writes nothing. |
| `--json` | off | Print the raw result as JSON. |

### The two modes

| | Default (`contribute`) | `--measure-only` |
|---|---|---|
| Fixture corpus needed | Yes (`_dev/contrib/recipes/`) | No |
| Collision check | Against all 89 known-family fixtures | **Skipped** — reported as unchecked |
| Marker recommended | Yes | No |
| Writes anything | Only with `--write` | Never |
| `--brand` / `--family` | Required | Not needed |

Outside a checkout the default mode refuses rather than degrading, because
generating an extractor from an unchecked marker is how a contribution ends up
stealing binaries from a family that already worked. The error tells you the two
ways forward: clone the repository, or add `--measure-only`.

> [!TIP]
> Pass the same family's dump twice with `--also`. With one file the run can only
> report what *looks* stable; with two or more it can say what *is* stable across
> your dumps — which is the difference between a guess and evidence.

### What `--write` produces

| Artifact | Where it goes |
|---|---|
| Fixture recipe | `_dev/contrib/recipes/<name>.mimic` |
| Extractor skeleton | `openremap/core/manufacturers/<brand>/<family>/extractor.py` (plus `__init__.py` files) |
| Test | `tests/tuning/manufacturers/test_<family>_extractor.py` |
| PR report | `<family>-contribution.md` in `--out` |

None of these contain your binary. The recipe is a fill byte plus a handful of
planted byte strings — that is all that travels.

### Example output

Shortened — the real output lists every candidate and every check:

```
  Siemens SID206
  my_dump.bin                    262,144 bytes   not claimed by any extractor today
      identify: Unknown — no extractor matched, so the engine knows nothing about this family yet

  Signature
  marker      '5WP4'
  first at    0x1F2A0
  sizes       0x40000

  Candidates (checked against 89 fixtures)
    84  '5WP4'                                     no collision
    52  'SID206'                                   also in 3 fixtures

  Identity fields
  software_version  '1037501234'                    constant — usable in can_handle() or a fixed field

  Review bar (the rendered extractor was executed to check this)
  ✓ compiles: the rendered source is valid Python
  ✓ claims its own fixture: SID206
  ✓ steals no other family: tried against 89 fixtures
  ✓ clears evidence on a miss: every rejection path resets the evidence
  ✓ declares the family it reports: SID206
```

With `--write` the run ends with the files it wrote and a numbered list of the
remaining manual steps — registering the extractor in the brand package, which
is a decision only a human can make, because **position is behaviour**: the
first extractor that returns `True` wins.

## `contribute check`

```bash
openremap contribute check PATH [--json]
```

| Argument | Required | Description |
|---|---|---|
| `PATH` | Yes | Path to an `extractor.py`. |

What it verifies:

| Check | Meaning |
|---|---|
| `compiles` | The module parses as Python |
| `claims its own fixture` | It still recognises the file it is supposed to |
| `steals no other family` | It accepts none of the other families' fixtures |
| `clears evidence on a miss` | A rejected binary leaves no stale evidence behind (checked by parsing the module, not by matching text) |
| `declares the family it reports` | `supported_families` matches what `extract()` actually returns |
| `reachable from the registry` | The module is imported by a brand package — an unimported extractor identifies nothing |

This is the review bar a reviewer runs on a branch.

## Exit codes

| Code | Meaning |
|---|---|
| `0` | The run succeeded — and, for the default mode, the rendered extractor passed the review bar |
| `1` | A refusal or a failed check: no collision-free marker, no usable guard, a rejected check, or a missing fixture corpus |
| `2` | Usage error — an unknown option or a missing argument |

## See also

- [contribute — API](api.md) — the same two methods from Python and JSON-RPC
- [contribute — introduction](index.md) — what the wizard is for and why it is split
- [Contributing](../project/contributing.md) — the repository's own contribution rules
- [`synth` — CLI](../synth/cli.md) — generate a file to experiment with
