---
title: Method contract
description: >-
  How a method is registered, how its input schema is validated, how results are
  serialised, and which JSON-RPC code each failure maps to.
tags: [api]
status: stable
---

# Method contract

The registry (`openremap/api/registry.py`) is ~140 lines and has four public
functions. Everything else in the API layer is handlers.

## `register`

```python
from openremap.api.registry import register

@register(
    "identify",
    kind="command",
    description="Identify an ECU binary — manufacturer, family, confidence, VIN.",
    input_schema={
        "path": {"type": "str", "required": True},
        "include_vin": {"type": "bool", "default": False},
    },
)
def identify_cmd(params: dict) -> dict:
    ...
```

| Argument | Meaning |
|---|---|
| `name` | the string callers dispatch on; registering a duplicate replaces it |
| `kind` | `"command"` (default), `"composite"` or `"workflow"` |
| `description` | one line, shown by `list_methods` and by the TUI's HELP screen |
| `input_schema` | parameter contract — see below |
| `steps` | optional list of step names, for composites; surfaced as metadata only |

A handler takes **one positional `dict`** and returns a `dict`. It is not called
with keyword arguments, and it does not receive `self`, a context, or a session.
That is what makes the same handler usable in-process and over a pipe.

## `list_methods`

```python
import openremap.api as api

for m in api.list_methods(kind="composite"):
    print(m["name"], len(m["input_schema"]), "params")
```

Returns metadata only — `name`, `kind`, `description`, `input_schema`, `steps` —
sorted by name. The handler is never included, so the result is JSON-safe and can
be published. This is what the TUI's HELP page renders, which is why a new method
appears in the app without anyone editing a list.

## `dispatch` and `call`

```python
api.dispatch("identify", {"path": "a.bin"})   # same thing
api.call("identify", {"path": "a.bin"})       # in-process convenience wrapper
```

Order of operations inside dispatch:

1. method lookup — unknown name raises `UnknownMethodError` (`-32601`);
2. **defaults are merged in** from the schema, so a handler never sees a missing
   optional parameter;
3. every declared parameter is type-checked and range-checked
   → `InvalidParamsError` (`-32602`);
4. the handler runs;
5. the return value passes through `to_json_safe()`.

Note the consequence: **validation happens before your code**, so a handler can
assume its parameters are the declared types.

## Input schema spec

An entry is `{"type": ..., "required": ..., "default": ..., "min": ..., "max": ...}`.

| Key | Type | Notes |
|---|---|---|
| `type` | `"str" \| "int" \| "float" \| "bool" \| "bytes" \| "dict" \| "list"` | checked with an exact predicate |
| `required` | `bool` | missing **and** no default → `-32602` |
| `default` | any | merged in before validation |
| `min` / `max` | number | numeric bounds, applied to `int`/`float` |

Validation details that matter in practice:

- `bool` is rejected where `int` is expected — Python's `True == 1` does not let a
  boolean through a numeric parameter;
- `list` also accepts tuples, so callers may pass either;
- an undeclared parameter is **not** rejected. Handlers take a dict; extra keys are
  simply ignored. If you need strictness, validate inside the handler.

## Serialisation

```python
from openremap.api.serialize import to_json_safe, SerializationError
```

One boundary, one conversion. Enums become their value, `bytes` become
base64-capable structure, dataclasses become dicts, tuples become lists, paths
become strings. `SerializationError` is raised only for something genuinely
unrepresentable — which is a bug in a handler, not a caller's fault.

Because of this, **the in-process result and the RPC result are identical**. That is
not a convention, it is asserted by the tests.

## Errors → JSON-RPC codes

| Exception | `code` | When |
|---|---|---|
| `UnknownMethodError` | `-32601` | no such method name |
| `InvalidParamsError` | `-32602` | missing or wrong-typed parameter |
| `GuardError` | `-32603` | the domain refused, unexpectedly — normally a refusal is *data* |
| `InternalError` | `-32603` | a bug |
| *(parse failure in transport)* | `-32700` | the line was not JSON |

`ApiError` is the base class; each carries `.code` and a message. Typical messages
are literal about the fix:

```
-32601  Unknown method: 'no_such_method'
-32602  identify: missing required param 'path'
-32700  Parse error
```

## The three kinds, precisely

| Kind | Where it lives | Definition |
|---|---|---|
| `command` | `api/commands/` | one cohesive operation; path I/O + exception translation at most |
| `composite` | `api/composite/` | several engine calls that must produce **one** coherent report; a refusal is returned, not raised |
| `workflow` | `api/workflows/*.toml` | a linear list of `call`s with data plumbing; loaded at import |

If a pipeline needs branching or a loop, it is a composite (code), not a workflow —
the workflow format deliberately has no control flow.
