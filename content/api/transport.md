---
title: API transport
description: JSON-RPC 2.0 over stdio — the wire protocol, how to run python -m openremap.api.transport.stdio, exact request / response / error lines, and the error mapping.
tags: [api, rpc]
status: stable
---

# Transport — JSON-RPC over stdio

The API speaks **JSON-RPC 2.0 over stdio**: one request per line in, one
response per line out, no batching. That makes the same methods that Python
calls in-process available to **any language** — Rust, Go, C++, Electron,
shell scripts — by running OpenRemap as a subprocess and talking to its
stdin/stdout.

> [!TIP]
> The results are byte-for-byte the same as an in-process
> `api.call(...)` — both go through the same dispatcher.

## Wire protocol

```
Request  → {"id": <any>, "method": "<name>", "params": {<object>}}
Response ← {"id": <id>, "result": <json>}
         | {"id": <id>, "error": {"code": <int>, "message": "<str>"}}
```

- **One object per line**, newline-delimited (NDJSON). No batching.
- **`params`** is optional and defaults to `{}`.
- The response echoes your **`id`** (use it to match replies).
- Errors are **objects with a `code`**, never bare strings.

## Starting the server

```bash
python -m openremap.api.transport.stdio
```

- Reads one request per line from **stdin**, writes one response per line to
  **stdout**.
- **stdout carries nothing but responses.** Logging goes to stderr.
- Exits when stdin closes.
- POSIX niceties, applied silently: restores the default `SIGPIPE` handler
  (a broken stdout pipe terminates cleanly) and runs at lower OS priority
  (`os.nice(10)`) so a background job does not compete with a UI.

## A worked session

The transport is stateless — each line is independent, so a pipe is the
simplest client:

```bash
echo '{"id": 1, "method": "ping", "params": {}}' \
  | python -m openremap.api.transport.stdio
```

Response:

```json
{"id": 1, "result": {"ok": true}}
```

A real method over the same pipe:

```bash
echo '{"id": 2, "method": "identify", "params": {"path": "stock.bin"}}' \
  | python -m openremap.api.transport.stdio
```

```json
{"id": 2, "result": {"manufacturer": "Bosch", "ecu_family": "EDC17", "match_key": "EDC17C66::1037541778", "confidence": {"tier": "High", "...": "..."}}}
```

Several requests in one session (one response per input line):

```bash
printf '%s\n' \
  '{"id": 1, "method": "ping", "params": {}}' \
  '{"id": 2, "method": "version", "params": {}}' \
  | python -m openremap.api.transport.stdio
```

```json
{"id": 1, "result": {"ok": true}}
{"id": 2, "result": {"version": "...", "backend": "..."}}
```

## Error mapping (verified behaviour of `handle_line`)

| What you send | Response |
|---|---|
| Not valid JSON | `{"id": null, "error": {"code": -32700, "message": "Parse error"}}` |
| Valid JSON but not an object (array, string, number…) | `{"id": null, "error": {"code": -32600, "message": "Invalid request"}}` |
| Object with no / non-string `method` | `{"id": <id>, "error": {"code": -32600, "message": "Invalid request: missing method"}}` |
| `params` present but not an object | `{"id": <id>, "error": {"code": -32602, "message": "Invalid params: must be an object"}}` |
| Unknown method name | `{"id": <id>, "error": {"code": -32601, "message": "Unknown method: 'identifyx'"}}` |
| Schema validation failure | `{"id": <id>, "error": {"code": -32602, "message": "identify: missing required param 'path'"}}` |
| Guard rejection (expected business rule) | `{"id": <id>, "error": {"code": -32000, "message": "Binary file 'stock.bin' is empty."}}` |
| Any unexpected exception | logged server-side; `{"id": <id>, "error": {"code": -32603, "message": "Internal error"}}` — never a traceback to the client |

Every code is a JSON-RPC 2.0 standard code except `-32000` (guard
rejection), which lives in the application range `-32000…-32099`.

> [!IMPORTANT]
> The **guard rejection** (`-32000`) is the API telling you an *expected*
> rule fired — an empty file, an image that fails to decode, recipe anchors
> that are not unique. Treat it as a normal business answer, not a crash.

## From other languages

The protocol is just lines of JSON, so any language that can spawn a
subprocess can be a client. The pattern is always the same:

1. Spawn `python -m openremap.api.transport.stdio`.
2. Write one request line to its stdin.
3. Read one response line from its stdout (match on your `id`).

There is no handshake, no HTTP, no server process to manage — the "server"
dies when the client does.

## Framing is shared — http can come later

`openremap.api.transport.jsonrpc` owns the framing: it parses the line,
looks the method up in the registry, maps errors, and formats the response.
It knows nothing about the domain. **Every transport (stdio today, http
later) shares it**, so moving to a network server later does not change the
protocol or the method catalogue.

### A note on the legacy daemon

`openremap.api.transport.stdio` is the **replacement for the legacy
`openremap/server.py` daemon** — and that module no longer exists in the
package. Two contract differences to know if you port an old client:

- The legacy server returned a bare error *string*; the new transport
  returns a JSON-RPC **error object** with a `code`, so clients can branch
  on it.
- Methods and results are otherwise equivalent.

The CLI reference page keeps the historical note:
[the old `openremap-server`](../getting-started/cli.md#the-old-openremap-server-daemon-replaced).

## See also

- [API index](index.md) — three ways in, one path out
- [Reference](reference.md) — every method you can call over the wire
- [Workflows](workflows.md) — declarative pipelines, callable over RPC
- [CLI, API & RPC](../getting-started/interfaces.md) — the three surfaces for humans
