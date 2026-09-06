---
title: checksum
description: Check whether an ECU file's checksums are still valid — OK or STALE. Detection only, it never fixes them.
tags: [checksum, cli, safety]
status: stable
---

# checksum

A **checksum** is a small value stored inside an ECU file that acts like a
fingerprint for a block of data. If someone edits the data and does not
update the checksum, the ECU can tell something is wrong — and may refuse
to start, or worse.

`checksum` reads a file and checks whether its stored checksums still
match the data. Each one comes back **OK** (matches) or **STALE** (does
not match — the data was changed after the checksum was written).

> [!IMPORTANT]
> `checksum` only **checks**. It never fixes. Correcting checksums after a
> modification is done by your flashing/checksum tool (ECM Titanium,
> WinOLS, …) — OpenRemap deliberately leaves that to you.

## When do I need it?

- **Before you flash anything.** A tuned file with stale checksums can
  brick an ECU. Verify first.
- **After any modification.** `health` flags stale checksums; run
  `checksum` to see exactly which scheme is stale.
- **On a downloaded file you do not trust.** Most freely-shared dumps carry
  stale or stripped checksums — the command will tell you.

## Try it (2 minutes)

```bash
openremap checksum my-file.bin
```

If the file's checksums are intact you will see lines like
`Bosch ME7 main checksum: OK`. If something was edited after the checksum
was written, the line says `STALE`. Files of families OpenRemap does not
have a checksum scheme for may simply report that no known scheme matched.

## Understanding the answer

| The output says… | In plain words |
|---|---|
| **OK** | The stored checksum matches the data — this block is untouched |
| **STALE** | The stored value differs from the recomputed one — the data was edited after the checksum was written |
| **absent** | The structure that would hold this checksum is missing from this file |
| **no scheme(s) matched** | This file's family is not covered by a known checksum scheme — nothing to compare |

Schemes are checked per ECU family: Bosch ME7 (main, multipoint, rolling,
multirange), IronFelix family profiles (VAG ME7.XX, M3.x, …), Siemens
GS20/SMG2 and MS43, and Denso Subaru descriptor tables. Not every check
runs on every file — only the schemes that fit the file's family.

## For developers

The same detection is one method of `openremap.api` — same schemes, same
`OK`/`STALE` result:

| Way of using it | Where to look | Example |
|---|---|---|
| Terminal (CLI) | [checksum — CLI](cli.md) | `openremap checksum my-file.bin` |
| Python code | [checksum — API](api.md) | `api.call("checksum", {"path": "my-file.bin"})` |
| Any language (JSON-RPC) | [checksum — API](api.md) | a request with `"method": "checksum"` |

## Where to go next

| You want to… | Go to |
|---|---|
| See every option and the scheme-by-scheme reference | [checksum — CLI](cli.md) |
| Call `checksum` from your own code | [checksum — API](api.md) |
| Run the six-check safety pass that includes checksums | [`health`](../health/index.md) |
| First identify the file before checking it | [`identify`](../identify/index.md) |
