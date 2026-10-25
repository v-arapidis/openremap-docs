---
title: Workflows
description: >-
  The .toml pipeline format — a linear list of calls with $input / $prev / $as
  plumbing, the shipped identify_cook reference, and how to add your own.
tags: [api]
status: stable
---

# Workflows

A workflow is a **data file**, not code: a linear, unconditional list of steps, each
a call to a registered method, with data piped between them. No branching, no loops.
If you need control flow, write a composite instead.

## The shipped reference

`openremap/api/workflows/identify_cook.toml`, verbatim:

```toml
# identify_cook — reference workflow: identify both binaries, then cook.
# Demonstrates multi-step linear composition + $input.* plumbing + `as` binding.

name = "identify_cook"
description = "Identify both binaries, then cook a recipe in one call."

[[steps]]
call = "identify"
params = { path = "$input.original_path" }
as = "original_id"

[[steps]]
call = "identify"
params = { path = "$input.modified_path" }
as = "modified_id"

[[steps]]
call = "cook_strict"
params = { stock_path = "$input.original_path", tuned_path = "$input.modified_path" }
```

It registers itself when the package is imported, so it is callable like any other
method:

```python
import openremap.api as api

result = api.call("identify_cook", {
    "original_path": "original.bin",
    "modified_path": "stage1.bin",
})
result.keys()      # dict_keys(['recipe', 'report'])
```

The result is the **last step's** result — here `cook_strict`'s `{recipe, report}`.
The earlier `identify` results are bound to `original_id` and `modified_id` and are
available to later steps, but they are not returned unless a step outputs them.

Confirm it is loaded:

```python
print([m["name"] for m in api.list_methods(kind="workflow")])
# ['identify_cook']
print([m["name"] for m in api.list_methods() if m["name"] == "identify_cook"][0]["steps"])
# ['identify', 'identify', 'cook_strict']
```

## File format

| Key | Required | Meaning |
|---|---|---|
| `name` | yes | the method name it registers as |
| `description` | no | one line, shown in `list_methods` |
| `output` | no | which bound name to return; default is the last step's result |
| `[[steps]]` | yes (≥1) | one call per step, in order |
| `steps[].call` | yes | the method to dispatch |
| `steps[].params` | no | its parameters, with references allowed |
| `steps[].as` | no | bind this step's result under a name |

## References

Three forms, resolved at run time:

| Form | Resolves to |
|---|---|
| `"$input.<key>"` | the workflow's own input parameter |
| `"$prev.<key>"` | the previous step's result |
| `"$<as>.<key>"` | a step bound earlier with `as = "<as>"` |

Two resolution modes, and the difference matters:

- a **whole-string** reference (`path = "$input.original_path"`) returns the
  referenced value with its type intact — a dict stays a dict;
- an **embedded** reference (`path = "/data/$input.name.bin"`) is string
  interpolation, so the value is stringified into the larger string.

## Loading rules

- importing `openremap.api` loads every `*.toml` in the built-in directory;
- extra directories come from `load_workflows(path)` or the colon-separated
  `OPENREMAP_WORKFLOW_DIRS` environment variable;
- a later directory overrides an earlier one **on name collision**;
- a malformed file in the **built-in** directory fails fast (a broken shipped
  workflow is a bug); a malformed file in a **user** directory is skipped with a
  warning, so one bad third-party file cannot break `import openremap.api`;
- the definitions are packaged into the wheel (`include =
  ["openremap/api/workflows/*.toml"]`), so they exist on a machine with no source
  tree.

## Writing one

Drop a `.toml` in `openremap/api/workflows/` (to ship it) or in a directory you add
at run time. A minimal two-step example that identifies a file and then health-checks
it:

```toml
name = "identify_health"
description = "Identify a dump, then run the six health checks."

[[steps]]
call = "identify"
params = { path = "$input.path" }
as = "identity"

[[steps]]
call = "health"
params = { path = "$input.path" }
```

```python
result = api.call("identify_health", {"path": "original.bin"})
result["checks"]     # the health report (last step's result)
```

## What workflows are not

| Not this | Because |
|---|---|
| a scheduler | there is no timing, retry or persistence |
| conditional | no `if`; a step either runs or the pipeline stops |
| parallel | steps are strictly sequential |
| a place for policy | a refusal inside a step propagates as that step's result; the workflow does not reinterpret it |

Anything that needs those belongs in `api/composite/`, where it is code and can be
tested.

> [!NOTE]
> The CLI's `openremap workflow` command ([`getting-oriented`](../cli/getting-oriented.md)) prints a
> human walkthrough of the tuning job. It is a *guide text*, not a workflow
> definition — the two share a word, not an implementation.
