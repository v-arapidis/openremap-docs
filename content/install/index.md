---
title: Install
description: >-
  Two ways to run OpenRemap — the terminal app you can install today, and the
  desktop Harness that is coming with 1.0.0.
tags: [install, getting-started]
status: stable
---

# Install

OpenRemap runs in two shapes. Pick the one that fits how you work:

| Way | Available | What it is |
|---|---|---|
| [**CLI**](cli/index.md) — the terminal app | **today** | A full-screen interface plus every command, on Windows, macOS and Linux. One install, no account. |
| [**Harness**](../harness/index.md) — the desktop app | coming soon, **alpha** with 1.0.0 | A complete desktop application: 2D and 3D map rendering, hex view, map dragging and workflows — no terminal at all. |

## What you need

- **Windows, macOS or Linux** — all three are supported, and the terminal app runs
  fully offline once installed.
- **Python 3.10 or newer** — but only if you install with `pip`. The recommended
  installer, [uv](https://astral.sh), fetches a suitable Python for you.
- **No administrator rights and no account.** Nothing is uploaded, before or
  after installation.

## Install in one command

The terminal app is a package called `openremap`. Either of these installs it —
same tool, same result, pick whichever you already use:

**uv** — recommended, and it needs no Python of its own:

```bash
uv tool install openremap
```

**pip** — needs Python 3.10 or newer:

```bash
pip install openremap
```

Then check that it worked, from any folder:

```bash
openremap --version
```

```
openremap 0.9.0 (rust)
```

The `(rust)` in brackets means the bundled native engine loaded — the part that
makes a 4 MB scan take milliseconds. If it is missing, read
[the CLI page](cli/index.md#if-something-goes-wrong).

Windows, macOS and Linux all work; on Windows use PowerShell. Full step-by-step
instructions, including installing uv itself, are in
[Install from the package](cli/package.md).

## Which install should I pick?

| If you… | Use |
|---|---|
| just want to use the tool | [Install the package](cli/package.md) — one command |
| want to change the code, or run the unreleased version | [Install from a repo clone](cli/clone.md) |
| would rather not use a terminal at all | wait for the [Harness](../harness/index.md) |

Not sure? Start with the package — you can always switch later, and the two
installs do not interfere with each other.
