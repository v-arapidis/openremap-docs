---
title: Calling it
description: >-
  In-process dispatch, the direct function style, JSON-RPC over stdio with real
  requests and responses, binary payloads, and what the GIL release buys you.
tags: [api]
status: stable
---

# Calling it

## In process

```python
import openremap.api as api

result = api.call("identify", {"path": "original.bin"})
print(result["match_key"], result["software_version"])
```

`identify` returns 24 keys; the ones you will reach for first:

```python
{
 "manufacturer": "Bosch",
 "match_key": "EDC17C66::1037541778126241V0",
 "ecu_family": "EDC17",
 "ecu_variant": "EDC17C66",
 "software_version": "1037541778126241V0",
 "hardware_number": None,
 "detection_strength": "strong",
 "detection_evidence": ["EXCLUSION_CLEAR", "DETECTION_SIGNATURE"],
 "confidence": {...},
 "vin": None,
 "sha256": "00f727e8abf62d384acc4420b08fe8e5477f9d004c8d3a697bbaaa08fe2149f5",
 "file_size": 4194304,
}
```

Fields a family does not store are `None`, not `""` — test for `None`.

## Direct functions

Two methods are also plain functions, without the dispatch overhead:

```python
api.ping()        # {'ok': True}
api.version()     # {'version': '0.9.0', 'backend': 'rust'}
```

For everything else, `api.call(name, params)` is the interface. Importing a
command module directly (`from openremap.api.commands.identify import ...`) works
but bypasses the schema check, so don't.

## JSON-RPC over stdio

`openremap-api` is a line-delimited JSON-RPC 2.0 server on stdin/stdout:

- one JSON object **per line**, one response per request;
- **no batching** (an array is rejected);
- optional `"jsonrpc": "2.0"` — it is echoed back if present;
- `"id"` is echoed verbatim; a request without one gets `"id": null`;
- diagnostics go to **stderr**, so stdout stays parseable.

Request:

```
{"jsonrpc": "2.0", "id": 1, "method": "version", "params": {}}
```

Response:

```
{"id": 1, "result": {"version": "0.9.0", "backend": "rust"}}
```

The server runs until stdin closes:

```
[openremap-api] INFO openremap-api started (pid=9)
[openremap-api] INFO stdin closed — shutting down.
```

### Errors over the wire

Three bad lines in, three error objects out — the process stays alive:

```
{"jsonrpc":"2.0","id":3,"method":"no_such_method","params":{}}
{"jsonrpc":"2.0","id":4,"method":"identify","params":{}}
not json

{"id": 3, "error": {"code": -32601, "message": "Unknown method: 'no_such_method'"}}
{"id": 4, "error": {"code": -32602, "message": "identify: missing required param 'path'"}}
{"id": null, "error": {"code": -32700, "message": "Parse error"}}
```

### A client in ten lines

```python
import json
import subprocess

class Engine:
    def __init__(self, cmd=("openremap-api",)):
        self.proc = subprocess.Popen(cmd, stdin=subprocess.PIPE,
                                     stdout=subprocess.PIPE, text=True, bufsize=1)
        self._id = 0

    def call(self, method, **params):
        self._id += 1
        self.proc.stdin.write(json.dumps(
            {"jsonrpc": "2.0", "id": self._id, "method": method, "params": params}) + "\n")
        self.proc.stdin.flush()
        reply = json.loads(self.proc.stdout.readline())
        if "error" in reply:
            raise RuntimeError(f"{reply['error']['code']}: {reply['error']['message']}")
        return reply["result"]

engine = Engine()
print(engine.call("identify", path="original.bin")["ecu_family"])
```

One process, many calls: the model is load and keep, not spawn per call.

## Binary payloads

No method takes or returns raw bytes across the wire. Where a binary comes out —
`apply_strict` produces a patched file — the result carries base64:

```python
applied = api.call("apply_strict", {"path": "original.bin", "recipe_path": "stage1.remap"})

applied["applied"]            # True
applied["patched_sha256"]     # 'b737d34463cc9d25…'
len(applied["patched_b64"])   # 5592408 characters ≈ 4 MB file

import base64
open("patched.bin", "wb").write(base64.b64decode(applied["patched_b64"]))
```

Writing the file is the caller's job — the API never writes to a path you did not
name. A refusal returns `applied: False` and `patched_b64: None`.

## Threads and responsiveness

The CPU-heavy work happens in the native extension, and every native entry point
releases the GIL for the duration (`py.detach`). Consequences for callers:

- a 4 MB `scan_map_axes` holds the interpreter for ~46 ms of wall time, not 6.4 s;
- other Python threads keep running while a scan is in progress;
- an event loop stays responsive if you offload the call with
  `run_in_executor`, but even a plain call no longer freezes unrelated threads.

Memory: a 4 MB analysis is single-pass over the bytes; results are dicts of plain
values, not views into the buffer.

## When to use which

| You are… | Use |
|---|---|
| writing Python in the same process | `api.call` |
| integrating from another language | `openremap-api` over stdio |
| scripting a shell pipeline | `openremap` CLI (it is the same methods) |
| building a UI | the CLI's methods, or the API — the TUI itself calls the API |
