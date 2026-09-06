---
title: CLI Reference
description: The openremap command-line reference — every command with a one-line description, a worked example session, and a note on the legacy server it replaced.
---

# CLI Reference

Full reference for the `openremap` command-line interface. For interactive
use, just run `openremap` with no arguments to launch the TUI.

No server, no database, no internet connection required — install and run
anywhere. ([Install](setup.md))

> **New to the terminal?** Run `openremap workflow` first. It prints a
> complete plain-English walkthrough with the exact commands to type and
> what to look for at each step. No reading required.
>
> **Know the commands already?** Run `openremap commands` for a
> one-line-per-command cheat-sheet.

---

## Commands

Every command supports `--help` for a quick reminder of its arguments and
options. Each command has a plain-English **intro** page, a **CLI**
reference with every flag and example, and (for programmatic use) an
**API** page.

| Command | What it does | Reference |
|---|---|---|
| `commands` | Compact cheat-sheet — all commands at a glance | [→ this reference](cli.md#commands) |
| `workflow` | Step-by-step guide — start here if you are new | [→ workflow](workflow.md) |
| `families` | List every supported ECU family with era, size, and notes | [→ families](families.md) |
| `identify` | Read an ECU binary and print everything extracted from it | [→ identify](../identify/index.md) |
| `analyze` | Describe a whole binary — identity, VIN, layout, maps, checksums, health | [→ analyze](../analyze/index.md) |
| `convert` | Normalise HEX / S-Record images to flat bytes | [→ convert](../convert/index.md) |
| `health` | One-shot calibration health check — CI-gateable | [→ health](../health/index.md) |
| `checksum` | Verify known checksum schemes (OK/STALE, no correction) | [→ checksum](../checksum/index.md) |
| `scan` | Classify a folder of ECU files by manufacturer and family | [→ scan](../scan/index.md) |
| `scan-vins` | Locate VIN candidates and score them | [→ scan-vins](../scan-vins/index.md) |
| `layout` | Flash-layout block map — erased/code/calibration/ident regions | [→ layout](../layout/index.md) |
| `scan-maps` | Structural scan — find calibration map axes and 2D tables | [→ scan-maps](../scan-maps/index.md) |
| `diff-maps` | Compare two binaries at map level — match by axis fingerprint | [→ diff-maps](../diff-maps/index.md) |
| `routine` | Read a code routine as readable pseudo-code | [→ routine](../routine/index.md) |
| `cook` | Compare a stock and a tuned binary and save the difference as a recipe | [→ cook](../cook/index.md) |
| `cook-volatile` | Car-portable recipe — excludes volatile bytes (VIN, checksum stores) with evidence | [→ cook-volatile](../cook-volatile/index.md) |
| `merge` | Combine two recipes into one, validated against a common stock | [→ merge](../merge/index.md) |
| `tune` | **One-shot:** validate before → apply → validate after | [→ tune](../tune/index.md) |
| `validate before` | Pre-flight check — run before tuning (or use `tune`) | [→ validate](../validate/index.md) |
| `validate check` | Diagnostic — run when `validate before` fails | [→ validate](../validate/index.md) |
| `validate after` | Post-tune confirmation — run after tuning (or use `tune`) | [→ validate](../validate/index.md) |
| `audit` | The receipt check — do stock, tuned, and recipe belong together? | [→ audit](../audit/index.md) |

> **`validate strict` / `validate exists` / `validate tuned`** are
> deprecated aliases for `validate before` / `validate check` /
> `validate after`. They still work but print a rename notice. Update
> your scripts when convenient.

---

## Typical session

```bash
# New here? Print the full step-by-step guide first
openremap workflow

# Need a quick reminder of all commands?
openremap commands

# Not sure if your ECU is supported?
openremap families
openremap families --family EDC16

# (Optional) Sort a folder of binaries into a tidy library
openremap scan ./my_bins/                    # preview — nothing moves
openremap scan ./my_bins/ --move --organize  # sort into Bosch/EDC17/ etc.

# (Optional) Discover calibration maps in an unsupported or unknown ECU
openremap scan-maps ecu.bin
openremap scan-maps ecu.bin --region 0x10000-0x80000 --min-score 0.85 --show-series

# (Optional) Diff two binaries at map level — which maps changed, by how much
openremap diff-maps stock.bin stage1.bin
openremap diff-maps stock.bin stage1.bin --threshold 5 --json

# 1. Read the stock binary — confirm it is a supported ECU
openremap identify stock.bin

# 2. Health-check it — checksums, axes, map counts, VINs
openremap health stock.bin

# 3. Extract the tune — diff stock vs tuned and save as a recipe
openremap cook stock.bin stage1.bin --output recipe.remap

# 3b. Applying to ANOTHER CAR of the same SW revision?
#     Use cook-volatile — it excludes VIN / checksum-store bytes with evidence
openremap cook-volatile stockA.bin stage1.bin --output portable.remap

# (Optional) Combine small mods — egr_off + stage1 into one recipe
openremap merge egr_off.remap stage1.remap --stock stock.bin -o both.remap

# 4. One-shot: validate before → apply → validate after
openremap tune target.bin recipe.remap

# (Optional) Receipt check — do stock, tuned, and recipe belong together?
openremap audit stock.bin stage1.bin recipe.remap

# If tune fails at Phase 1 — diagnose why
openremap validate check target.bin recipe.remap

# 5. MANDATORY — correct checksums with ECM Titanium, WinOLS, or equivalent
#    before flashing the tuned binary to any vehicle
```

---

## The old `openremap-server` daemon (replaced)

> **⚠ Historical — do not build new integrations on this.** The legacy
> `openremap-server` daemon has been **replaced** by the new API transport,
> and its module (`openremap/server.py`) no longer exists in the package.

`openremap-server` used to start a long-running JSON-RPC daemon that
non-Python applications (desktop editors, IDE plugins, automation tools
written in Rust, Go, C++, Electron, etc.) could use to call the openremap
pipeline without cold-starting a Python interpreter on every request.

The replacement is the [API transport](../api/transport.md): the same
JSON-RPC calls, served one request per line over stdin/stdout. See
[API — the programmatic surface](../api/index.md) and the
[method reference](../api/reference.md) for what you can call today.

Two things to know if you are porting an old client:

- `python -m openremap.server` no longer exists — run
  `python -m openremap.api.transport.stdio` instead. It stays alive until
  stdin is closed, exactly like the old daemon.
- The legacy daemon returned bare error *strings*; the new transport returns
  JSON-RPC error **objects** — `{"id": <id>, "error": {"code": <int>,
  "message": "<str>"}}` — so clients can branch on the code instead of
  parsing prose.

---

## Other documentation

| Document | Contents |
|---|---|
| [Getting started](index.md) | The wiki home — who this is for, five-minute path, command map |
| [How it works](../concepts/how-it-works.md) | The full pipeline, step by step |
| [Confidence scoring](../concepts/confidence.md) | Confidence scoring — tiers, signals, warnings, and score breakdown |
| [Recipe format](../concepts/recipe-format.md) | The recipe format spec (.remap) — fields, structure, versioning |
| [Manufacturers](../manufacturers/) | Supported ECU families per OEM |
| [About OpenRemap](about.md) | The project's identity and aims |
| [Contributing](../../CONTRIBUTING.md) | How to add a new ECU extractor, code style, submitting a PR |
| [Disclaimer](../../DISCLAIMER.md) | Liability, intended use, professional review requirements |
