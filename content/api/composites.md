---
title: Composites
description: >-
  The methods that answer with one report — cook, apply, health, analyze, diff —
  and the refusal-as-data contract that keeps a policy decision out of exceptions.
tags: [api]
status: stable
---

# Composites

A composite runs several engine calls and returns **one coherent report**. Nine
exist at 0.9.0:

| Method | steps |
|---|---|
| `analyze` | identify → checksums → scan_map_tables → segment → scan_vins |
| `health` | identify → checksums → scan_map_tables → segment → scan_vins |
| `diff_maps` | two scans → match by axis fingerprint → cell diff |
| `cook_strict` | size guard → identity guard → diff + anchors → annotate → maps/regions → contract |
| `cook_forced` | same, anchors may repeat |
| `apply_strict` | recipe checks → identity gate → exact bytes → anchor search → verify |
| `apply_shift` | same, ±2048-byte displacement allowed |
| `apply_unique` | same, no identity requirement, exact bytes required |
| `apply_any` | same, loosest |

## Two shapes you will code against

### `cook_strict` returns a recipe, it does not write one

```python
cook = api.call("cook_strict", {
    "stock_path": "original.bin",
    "tuned_path": "stage1.bin",
})

cook.keys()                       # dict_keys(['recipe', 'report'])
cook["report"]["contract"]        # {'identity_floor': 'any', 'anchors_unique': True, ...}
cook["report"]["counts"]          # {'size': 4194304, 'instructions': 79, 'bytes_changed': 7828, ...}
cook["report"]["result"]          # {'produced': True, 'schema': '5.0', 'instructions': 79, …}

# you write the file:
import json, pathlib
pathlib.Path("stage1.remap").write_text(json.dumps(cook["recipe"], indent=1))
```

The same is true of every producer: the API hands back the document, the caller
decides where it goes.

### `apply_strict` always returns, it never raises a refusal

```python
result = api.call("apply_strict", {"path": target, "recipe_path": "stage1.remap"})

result.keys()      # ['applied', 'patched_b64', 'patched_sha256', 'report']
```

**Success:**

```python
{
  "applied": True,
  "patched_b64": "…5592408 chars…",
  "patched_sha256": "b737d34463cc9d259fdd6d4df5d3ac2d795ffba9b112a7243656ab247c20c444",
  "report": {
    "result": {
      "applied": True,
      "input_sha256": "00f727e8abf62d38…",
      "output_sha256": "b737d34463cc9d25…",
      "bytes_written": 7828,
      "checksums": {
        "corrected": False,
        "status": "skip",
        "message": "no known checksum scheme detected",
        "check_with": "openremap checksum <written file>"
      },
      "disclaimer": "OpenRemap does not correct checksums automatically. …"
    },
    "policy": {"identity": "firmware", "shift": "must be zero",
               "ambiguity": "reported", "positions": "exact"},
    "checks": [{"id": "A1–A5", "name": "recipe valid",
                "verdict": "pass", "detail": "schema 5.0 · the contract agrees…"}, …]
  }
}
```

**Refusal** — same keys, different values:

```python
{
  "applied": False,
  "patched_b64": None,
  "patched_sha256": None,
  "report": {
    "refusal": {
      "check": "Γ2",
      "message": "Different firmware: recipe=EDC17C66::1037541778126241V0 · target=EDC17C60::08001508446612B.",
      "detail": {"recipe_match_key": "EDC17C66::…", "target_match_key": "EDC17C60::…"}
    },
    "next_step": "Different firmware. Applying across firmwares is possible but deliberate — no apply command on this ladder will do it.",
    "checks": [ … 6 checks, none of them a failure … ]
  }
}
```

The rule, stated once: **a refusal is a value, an exception is a bug.** If you get
an exception from an `apply_*` composite, either the payload was structurally
broken (`GuardError`) or something is wrong in the engine.

## Branching on a refusal

`report.refusal.check` carries the rule id, and the id is the decision input — the
TUI's APPLY screen works this way, offering a looser command only when the rule
says one can help:

```python
LOOSER = {
    "Γ2": "apply_unique",   # identity failed  → drop the identity requirement
    "Γ7": "apply_shift",    # displaced change  → allow ±2048
    "Γ8": "apply_any",      # ambiguous anchor  → accept the report
}

result = api.call("apply_strict", {"path": target, "recipe_path": recipe})
if not result["applied"]:
    check = result["report"]["refusal"]["check"]
    looser = LOOSER.get(check)
    if looser is None:
        print("no looser rung helps:", result["report"]["next_step"])
    else:
        print("retry with", looser, "— it gives up:", result["report"]["next_step"])
```

Note what is *not* in the table: `Γ1` (size), `Γ4` (bytes not in place), `Γ6`
(anchor not found) have no looser rung. Neither does a recipe that fails its own
checks (`A*`). Reporting that honestly is the composite's job, not yours.

## Reading `checks`

Every entry is `{"id", "name", "verdict", "detail"}`:

| `verdict` | Meaning |
|---|---|
| `pass` | the check ran and succeeded |
| `info` | measured, but not a pass/fail question |
| `fail` | the check ran and failed — usually accompanied by `report.refusal` |

An empty `fail` list on a refused result is normal: the refusal short-circuits, and
the report says *where* it stopped rather than inventing failures for checks that
never ran.

## `health` and `analyze`

Both are one-pass reports over a single file, and both are composites because six
independent checks must produce one verdict. `health` returns the six checks with
their verdicts; `analyze` returns the sections of the full picture. Use `analyze`
when a human will read the output, `health` when something will gate on it.
