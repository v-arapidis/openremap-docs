---
title: API workflows
description: Declarative .toml pipelines in openremap.api — structure, $input / $prev / $as references, the shipped identify_cook example, and how to load your own.
tags: [api, workflow]
status: stable
---

# Workflows — declarative pipelines in TOML

A **workflow** is a `kind="workflow"` method, but with a twist: it is a
**data file** (TOML), not Python. You declare a linear, unconditional list
of steps — each step *calls* a registered method with data plumbed between
steps — and OpenRemap compiles that into a callable method.

Rules of thumb:

- No code, no branching, no loops. A workflow is strictly **linear and
  unconditional**.
- If a pipeline needs control flow (flags, gates, fail-fast, coherence),
  make it a **composite** instead — see [concepts](concepts.md#the-three-kinds).

> [!NOTE]
> Not the terminal guide! The API **workflow** (this page) is unrelated to
> `openremap workflow`, the CLI command that prints a step-by-step guide in
> your terminal ([getting-started/workflow](../getting-started/workflow.md)).
> They share only the name.

## Anatomy of a workflow file

```toml
name = "identify_cook"            # required — becomes the registered method name
description = "..."               # optional — shown by list_methods
# output = "original_id"          # optional — which bound step's result to return
                                  # (default: the last step's result)

[[steps]]
call = "identify"                 # required — a registered method name
params = { path = "$input.path" } # optional — merged params (references allowed)
as = "original_id"                # optional — bind the result under this name
```

Per file:

- **`name`** — required; must be a non-empty string. It is the method name
  you call with `api.call(name, params)`.
- **`description`** — optional; surfaced by `list_methods`.
- **`output`** — optional; the name of a bound step (`as = "…"`) whose
  result is returned. Default: the **last step's** result.
- **`[[steps]]`** — one or more steps, in order. Each has a **`call`**
  (registered method name), optional **`params`** (a table, merged and
  resolved per call), and optional **`as`** to bind the result for later
  steps.

> [!TIP]
> Keep `params` on **one** line when you write it inline: TOML does not allow
> a line break inside `{ … }`, so the wrapped form is a parse error. When a
> step has several parameters — or you want a comment next to one of them —
> use a `[steps.params]` sub-table instead, as the last example below does.

The registered input schema of the workflow is derived automatically: every
`$input.<key>` referenced anywhere becomes a **required** parameter of the
workflow call.

## The shipped example: `identify_cook`

OpenRemap ships one reference workflow (`openremap/api/workflows/identify_cook.toml`)
that identifies *both* binaries and then cooks a recipe — three steps in one
call:

```toml
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
call = "cook"
params = { original_path = "$input.original_path", modified_path = "$input.modified_path" }
```

Walking through it:

1. **Step 1** calls `identify` with `$input.original_path` and binds the
   whole result as `original_id`.
2. **Step 2** does the same for the modified binary, bound as `modified_id`.
3. **Step 3** calls `cook` with the two paths straight from `$input`.

No `output` is declared, so the workflow returns the **last step's result** —
the cooked recipe. The two `as` bindings are there to demonstrate plumbing;
this workflow doesn't use them downstream, but a real one would (e.g. feed
`$original_id.match_key` into a later step).

Both `original_path` and `modified_path` become **required** inputs, collected
from the `$input.*` references. No type is declared: a workflow's schema comes
from a data file, so the registry reports `{"required": true}` for each input
and nothing more. What each value must be is decided by the step that consumes
it.

### Running it

```python
import openremap.api as api

recipe = api.call("identify_cook", {
    "original_path": "stock.bin",
    "modified_path": "stage1.bin",
})
```

…or over [JSON-RPC](transport.md):

```bash
echo '{"id": 1, "method": "identify_cook", "params": {"original_path": "stock.bin", "modified_path": "stage1.bin"}}' \
  | python -m openremap.api.transport.stdio
```

## References: plumbing data between steps

Inside `params` you can reference values with `$source.key`:

| Source | Meaning |
|---|---|
| `$input.<key>` | A parameter of the workflow call itself |
| `$prev.<key>` | The **immediately previous** step's result |
| `$<as>.<key>` | The result of the step bound with `as = "<as>"` |

Two resolution modes:

- **Whole-string reference** — the entire value is `$source.key`: the value
  is substituted **type-preserving** (a number stays a number).
- **Embedded reference** — `$source.key` appears *inside* a larger string:
  it is **string-substituted** (always becomes text inside the string).

```toml
[[steps]]
call = "cook"

# whole-string → keeps its type (a number stays a number)
# embedded → substituted into the surrounding text
[steps.params]
original_path = "$input.original_path"
label = "sw $input.sw_version"
```

`as` names that would shadow the special sources are reserved — you cannot
bind a step as `input` or `prev`.

## Loading and extending

Importing `openremap.api` **auto-loads every `*.toml` in the built-in
workflow directory** (`openremap/api/workflows/`) and registers each one.
The built-in directory **fails fast**: a malformed shipped workflow is a
bug and raises immediately.

Extra user directories load tolerantly:

```python
import openremap.api as api
from openremap.api.workflows import load_workflows

load_workflows(["/path/to/my/workflows"])   # returns the names registered
```

or via the `OPENREMAP_WORKFLOW_DIRS` environment variable
(colon-separated paths on POSIX, `os.pathsep`-separated generally):

```bash
export OPENREMAP_WORKFLOW_DIRS="/my/workflows:/shared/workflows"
python -c 'import openremap.api as api; print(api.call("list_methods", {}))'
```

Rules for extra directories:

- A malformed or invalid `.toml` is **skipped with a warning** — one bad
  third-party file cannot break `import openremap.api`.
- On a **name collision, a later directory overrides an earlier one**
  (user dirs override the built-ins).
- Only files that parse and validate register; the rest warn.

## Errors

| Situation | In-process | On the wire |
|---|---|---|
| Missing required input | `InvalidParamsError("workflow: missing input 'original_path'")` | `-32602` |
| Reference to a step/value that is not available | `InvalidParamsError("workflow: $prev.foo is not available")` | `-32602` |
| Unknown reference source (`$nope.x`) | `InvalidParamsError("workflow: unknown reference source $nope")` | `-32602` |
| Malformed file at load (bad TOML, no `name`, no `[[steps]]`, bad step) | `WorkflowError` — built-in dir raises at import; user dirs skip with a warning | — |

Because the input schema is collected from the file at load time, missing
`$input.*` keys are caught by normal schema validation before the first
step runs. Misconfigured files are rejected at load, so a workflow that
registered successfully should not hit a runtime misconfiguration.

## See also

- [API concepts](concepts.md) — the registry and the `command`/`composite`/`workflow` kinds
- [Reference](reference.md) — which methods you can call from a step
- [Transport (JSON-RPC)](transport.md) — calling a workflow over stdio
- [Getting started — `openremap workflow`](../getting-started/workflow.md) — the *other* workflow (terminal guide)
