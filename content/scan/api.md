---
title: scan — API
description: >-
  The scan method of openremap.api — input schema, in-process call,
  JSON-RPC, error codes. The API classifies; it never moves files.
tags: [scan, api, rpc]
status: stable
---

# scan — API

> This page is for **developers**. If you just want to sort a folder from
> the terminal, the [plain-English introduction](index.md) is the better
> place to start.

`scan` is one method registered with `openremap.api`. It batch-classifies
every candidate file in a directory through all registered extractors and
returns the results.

> [!IMPORTANT]
> The API method only **classifies and reports**. It never moves, renames
> or organises files — moving files into `scanned/`, `scanned/Bosch/…`,
> `trash/` and so on is a [terminal-only feature](cli.md). If you need the
> files actually sorted, use the CLI.

The method is a `command`: one cohesive operation in one domain (atomic).

## Input schema

```python
{
    "directory": {"type": "str", "required": True, "description": "Directory to scan."},
    "recursive": {"type": "bool", "default": False},
}
```

Note the difference from most other methods: the input is a **directory**
(not a file `path`), and an optional `recursive` flag. Defaults and
validation live **in the schema**, in the registry — every consumer reads
the same contract via `list_methods`.

## Result shape

The result is a JSON-safe dict:

```python
{
    "directory": "./my_bins",
    "files_scanned": 5,
    "results": [
        {
            "file": "./my_bins/ecu.bin",
            "destination": "scanned",        # one of the five outcomes
            "detail": "...",                  # extractor/family/sw/hw/key line
            # + identification fields when an extractor matched:
            # manufacturer, ecu_family, software_version, match_key, ...
        }
    ],
    "errors": [{"file": "...", "error": "READ ERR: ..."}],
}
```

`destination` is one of `scanned`, `sw_missing`, `contested`, `unknown` or
`trash` (the same five outcomes the CLI prints). Files that fail to read or
decode are collected under `errors` instead of aborting the scan.

## Calling it in-process (Python)

```python
import openremap.api as api

result = api.call("scan", {"directory": "./my_bins"})
# result is a plain JSON-serialisable dict

for row in result["results"]:
    print(row["file"], "→", row["destination"])
print("errors:", result["errors"])
```

## Calling it over JSON-RPC

```bash
echo '{"id": 1, "method": "scan", "params": {"directory": "./my_bins"}}' \
  | python -m openremap.api.transport.stdio
```

Response (one JSON object per line):

```json
{"id": 1, "result": {"directory": "./my_bins", "files_scanned": 2, "results": [{"file": "./my_bins/ecu.bin", "destination": "scanned", "detail": "..."}], "errors": []}}
```

Errors come back as JSON-RPC error objects — clients branch on `code`:

```json
{"id": 1, "error": {"code": -32602, "message": "scan: missing required param 'directory'"}}
```

## Error handling

| Code | Meaning | Example message |
|---|---|---|
| `-32602` | Invalid params (schema validation) | `scan: missing required param 'directory'` |
| `-32601` | Method not registered | `Unknown method: 'scanx'` |
| `-32000` | Guard rejection (business rule, not a bug) | — |
| `-32603` | Unexpected internal failure | — |

A directory that does not exist or is not readable is reported per-file
under `errors` where possible; a schema-invalid call (for example a missing
`directory`) raises `-32602` before any work starts.

## Discovery — `list_methods`

```python
import openremap.api as api

catalogue = api.call("list_methods", {})
meta = next(m for m in catalogue["methods"] if m["name"] == "scan")
print(meta["kind"])          # "command"
print(meta["input_schema"])  # the schema above
```

## Quick smoke test

```bash
echo '{"id": 1, "method": "ping", "params": {}}' | python -m openremap.api.transport.stdio
# → {"id": 1, "result": {"ok": true}}
```

## See also

- [scan — CLI](cli.md) — the same classification plus file moving and reports
- [CLI, API & RPC](../getting-started/interfaces.md) — the three surfaces and when to use which
- [identify — API](../identify/api.md) — the single-file identification method
