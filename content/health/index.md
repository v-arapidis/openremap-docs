---
title: health
description: The check-engine light for an ECU file — six safety checks in one go, with a simple healthy / issues verdict.
tags: [health, cli, safety]
status: stable
---

# health

`health` is the **check-engine light** for an ECU file. You give it one
binary and it runs six safety checks in a single pass, then gives you a
simple verdict: **healthy**, or **issues found**.

Think of it as taking the file for an MOT test before you trust it. It
does not change the file — it only reads it and reports.

## When do I need it?

- **Before you cook or tune a file.** If the file has problems (wiped
  areas, broken checksums, duplicate VINs), you want to know *before* you
  build a recipe on top of it.
- **When a file looks suspicious.** `identify` said SUSPICIOUS? Run
  `health` to see exactly what is wrong.
- **In scripts and CI.** `health` exits with a clear code: `0` when the
  file is healthy, `1` when something failed — so a build or a batch job
  can stop automatically on a bad file.

## Try it (2 minutes)

```bash
openremap health my-file.bin
```

You will see a header line with the file name, its size, the ECU family
(if known) and the overall verdict — `HEALTHY` or `ISSUES FOUND` — followed
by one line per check, each marked `ok`, `warn`, `fail` or `skip`:

```
  my-file.bin  •  2,097,152 bytes  •  EDC17  •  HEALTHY

  IDENTITY      OK    ...
  CHECKSUMS     OK    ...
  AXIS SANITY   ...
  MAP COUNT     ...
  ERASED BLOCKS ...
  VIN DUPLICATE ...
```

(Output shortened — the exact lines and their `ok`/`warn`/`fail` results
depend on your file.)

## Understanding the answer

| Check | In plain words |
|---|---|
| **Identity** | Is the ECU family recognised, with a believable software version? |
| **Checksums** | Are the file's built-in "fingerprints" (checksums) still valid? A *checksum* is a small stored value that proves a block of data was not corrupted or edited |
| **Axis sanity** | Do the tuning tables' axes (RPM, load…) contain believable values, not garbage? |
| **Map count** | Is the number of tables found roughly what this ECU family normally has? Too few = wiped calibration; way too many = scanner noise |
| **Erased blocks** | Are there large erased/empty areas inside the data where they should not be? |
| **VINs** | Are there duplicate car ID numbers (VINs) in one file — a sign of a cloned or merged dump? |

A file is **healthy** only when no check fails. A **`warn`** (yellow) is
"look at this, but it is not necessarily a problem" — some ECUs legitimately
warn on erased regions or checksums. A **`fail`** (red) is a real concern.

> [!NOTE]
> `health` checks, it does not fix. A file that fails the checksum check
> still needs its checksums corrected by your flashing/checksum tool after
> any modification — see the [checksum](../checksum/index.md) page.

## For developers

The same six-check pass is one method of `openremap.api`, available from
code or over JSON-RPC — same checks, same result:

| Way of using it | Where to look | Example |
|---|---|---|
| Terminal (CLI) | [health — CLI](cli.md) | `openremap health my-file.bin` |
| Python code | [health — API](api.md) | `api.call("health", {"path": "my-file.bin"})` |
| Any language (JSON-RPC) | [health — API](api.md) | a request with `"method": "health"` |

## Where to go next

| You want to… | Go to |
|---|---|
| See every option and all the checks in detail | [health — CLI](cli.md) |
| Call `health` from your own code | [health — API](api.md) |
| First identify the file, then health-check it | [`identify`](../identify/index.md) |
| Understand what checksums are and how to fix them | [`checksum`](../checksum/index.md) |
| Check the whole pipeline end to end | [How it works](../concepts/how-it-works.md) |
