---
title: CLI
description: >-
  The terminal app — install it with one command, then type `openremap` to open
  the full-screen interface. Windows, macOS and Linux.
tags: [install, cli]
status: stable
---

# CLI

The CLI is the terminal side of OpenRemap: a full-screen interface when you type
`openremap` on its own, and one command per task when you want to script it.

One install gives you three commands:

| Command | What it does |
|---|---|
| `openremap` | Opens the full-screen interface. With arguments, it runs that command (`openremap identify my_file.bin`). |
| `openremap-tui` | Opens the interface directly, even if you pass arguments. |
| `openremap-api` | Speaks JSON-RPC over stdin/stdout, so other programs can drive the engine. |

## Requirements

| | |
|---|---|
| Operating system | Windows 10 or 11, macOS, or Linux |
| Python | 3.10 or newer — only needed for the `pip` install; `uv` brings its own |
| Disk | about 100 MB, including the native Rust engine |
| Administrator rights | not required |
| Internet | needed once, to install; the tool itself works offline |

## Pick how to install

| Method | When to use it |
|---|---|
| [**Package**](package.md) — from PyPI, one command | the normal case; you want to use the tool |
| [**Repo clone**](clone.md) — from the source repository | you want to modify the code, run the tests, or use unreleased changes |

Most people want the package, which is one command with either tool:

```bash
uv tool install openremap      # recommended — brings its own Python
pip install openremap          # needs Python 3.10 or newer
```

Both are safe to have at the same time: each install lives in its own
environment and never touches the other.

## Check it worked

```bash
openremap --version
```

```
openremap 0.9.0 (rust)
```

The `(rust)` in brackets says the native engine loaded, which is what makes
scanning and analysis fast. If it is missing, the install is incomplete — see
[troubleshooting](#if-something-goes-wrong).

Then just type:

```bash
openremap
```

A full-screen interface opens. Nothing else to configure.

## If something goes wrong

| Symptom | What it means |
|---|---|
| `openremap: command not found` | The install directory is not on your `PATH`. Restart the terminal first; if that does not help, re-read the "verify" step of whichever install you used. |
| `openremap --version` prints no `(rust)` | The native engine did not build or load. With a clone, build it: `uv run maturin develop --release`. |
| The interface looks broken, or colours are missing | Use a modern UTF-8 terminal (Windows Terminal, iTerm2, GNOME Terminal). Very old consoles cannot draw it. |
| `UnicodeEncodeError` when redirecting output | Fixed in 0.9.0, which forces UTF-8 output. Upgrade: `uv tool upgrade openremap`. |
