---
title: tune — API
description: The tune method of openremap.api — input schema, in-process call, JSON-RPC, error codes.
tags: [tune, api, rpc, recipe]
status: stable
---

# tune — API

> This page is for **developers**. For a plain-English explanation, see the
> [introduction](index.md).

`tune` is one method registered with `openremap.api`. Everything the
[CLI](cli.md) can do, the API can do too — the same three-phase apply.

The method is a **composite**: it orchestrates three operations that are
themselves separate API commands — `validate_before` → `patch` →
`validate_after` — plus the same-file-only policy gate, with fast-fail on
each phase.

## Input schema

```python
{
    "path":           {"type": "str",  "required": True,  "description": "Path to the target binary."},
    "recipe":         {"type": "dict", "required": True,  "description": "Recipe dict to apply."},
    "recipe_name":    {"type": "str",  "description": "Recipe name for the report."},
    "skip_validation": {"type": "bool", "default": False},
    "force":          {"type": "bool", "default": False},
}
```

The schema is the authoritative contract for API callers: it declares each
parameter's type, default and bounds, and the registry validates every call
against it. The CLI declares its own `--flags`, so a schema change reaches the
terminal only when the CLI is updated too — check the live schema with
`list_methods`.

## Calling it in-process (Python)

Load a recipe (for example from the `cook` method, or straight from a
`.remap` file) and apply it:

```python
import base64
import json
import openremap.api as api

with open("recipe.remap") as fh:
    recipe = json.load(fh)

report = api.call(
    "tune",
    {
        "path": "target.bin",
        "recipe": recipe,
        "recipe_name": "recipe.remap",
    },
)

# The result is a plain JSON-serialisable dict. The three-phase report sits
# under "combined"; "all_ok" is the same verdict lifted to the top level.
print(report["all_ok"])                     # True
print(report["combined"]["success"])        # True
print(report["combined"]["phase_2_apply"])  # the patcher report

# The patched binary itself comes back in the reply, base64-encoded —
# None when a phase failed.
patched = base64.b64decode(report["tuned_b64"])
```

The wrapper keys:

| Key | What it holds |
|---|---|
| `combined` | the three-phase report: `phase_1_validate_before`, `phase_2_apply`, `phase_3_validate_after`, `success` |
| `all_ok` | `true` only when every phase that ran passed — the same verdict as `combined.success` |
| `tuned_b64` | the patched binary, base64-encoded (`None` when phase 2 never ran) |
| `target_md5` / `tuned_md5` | md5 of the target and of the patched result |
| `gate_msg` | the same-file-only gate's message |
| `p1_size_warn` / `p1_match_key_warn` | phase 1's size and match-key warnings |
| `apply_error` | the apply step's error, when there is one |

`phase_2_apply` is the **patcher report**:
`{"target_file", "recipe_file", "target_md5", "summary", "results"}`. The
verdict is inside `summary` — `patch_applied` (`true` when nothing failed),
`score_pct`, and the counts `total` / `success` / `failed` / `shifted` /
`ambiguous`, plus `patched_md5`.

## Calling it over JSON-RPC

The same call over the stdio server — usable from any language (the
`recipe` param is a whole JSON object, so client and server must share it):

```bash
echo '{"id": 1, "method": "tune", "params": {"path": "target.bin", "recipe": {...}}}' \
  | python -m openremap.api.transport.stdio
```

## Error handling

| Code | Meaning | Example message |
|---|---|---|
| `-32602` | Invalid params (schema validation) | `tune: missing required param 'recipe'` |
| `-32601` | Method not registered | `Unknown method: 'tunex'` |
| `-32000` | Guard rejection (business rule, not a bug) | same-file-only refusal, empty or undecodable file |
| `-32603` | Unexpected internal failure | — |

**A failed phase is not an error.** Only the same-file-only gate refuses the
call (`-32000`). When phase 1 finds the recipe does not match the target, the
call *succeeds* and returns `all_ok: false`, `combined.success: false` and
`tuned_b64: null` — so branch on the result, not on the error channel.

Nothing is written either way: the patched bytes come back in the reply
(`tuned_b64`), never to disk, so a caller decides what to do with them.

## Discovery — `list_methods`

```python
import openremap.api as api

catalogue = api.call("list_methods", {})
meta = next(m for m in catalogue["methods"] if m["name"] == "tune")
print(meta["kind"])   # "composite"
print(meta["steps"])  # ["validate_before", "patch", "validate_after"]
print(meta["input_schema"])
```

## See also

- [tune — CLI](cli.md) — the same three-phase apply from the terminal
- [`validate` — API](../validate/api.md) — the individual steps as methods
- [Recipe format](../concepts/recipe-format.md) — the `.remap` file spec
- [CLI, API & RPC](../getting-started/interfaces.md) — the three surfaces
