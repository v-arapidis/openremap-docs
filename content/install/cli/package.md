---
title: Package
description: >-
  Install OpenRemap from PyPI with one command — `uv tool install openremap` or
  `pip install openremap` — then update or remove it just as easily.
tags: [install, cli, pypi]
status: stable
---

# Install from the package

The published package is called **`openremap`** on
[PyPI](https://pypi.org/project/openremap/), Python's public package index.
Installing it takes one command and affects nothing else on your computer.

## The short version

If you already have [uv](https://astral.sh) (recommended) or Python 3.10 or newer
with `pip`:

```bash
uv tool install openremap
```

```bash
openremap --version
```

```
openremap 0.9.0 (rust)
```

That is the whole install. `openremap` now works from any folder.

## Step by step, from nothing

### 1. Open a terminal

- **Windows** — press the Windows key, type `PowerShell`, press Enter.
- **macOS** — press ⌘ Space, type `Terminal`, press Enter.
- **Linux** — Ctrl+Alt+T, or look for *Terminal* in your applications menu.

### 2. Install uv (skip if you prefer `pip`)

uv is a free package manager that keeps each tool in its own isolated space and
fetches a suitable Python for it.

```bash
# macOS (Homebrew)
brew install uv

# macOS or Linux (curl installer)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Arch / Manjaro
pacman -S uv
```

```powershell
# Windows (PowerShell) — the official uv installer
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

Close and reopen the terminal afterwards, then check it:

```bash
uv --version
```

### 3. Install OpenRemap

```bash
uv tool install openremap
```

Or, with an existing Python 3.10+ and `pip`:

```bash
pip install openremap
```

> [!TIP]
> `pip` may need `pip3` or `python -m pip` depending on your system, and on some
> Linux distributions it refuses to install outside a virtual environment
> (`externally-managed-environment`). uv avoids all of that — that is why it is the
> recommended route.

### 4. Check it worked

```bash
openremap --version
openremap --help
```

Both must work from *any* folder, not just the one you installed from. If they do
not, see [troubleshooting](../cli/index.md#if-something-goes-wrong).

### 5. Start it

```bash
openremap
```

The full-screen interface opens. No account, no configuration file, and the tool
works offline from here on.

## Updating

```bash
uv tool upgrade openremap      # uv
pip install --upgrade openremap   # pip
```

## Uninstalling

```bash
uv tool uninstall openremap    # uv
pip uninstall openremap        # pip
```

Your files are not touched — OpenRemap only reads the dumps you point it at, and
writes results where you tell it to.

## Optional extras

**Tab completion** for command and flag names (bash, zsh, fish):

```bash
openremap --install-completion
```

Restart the terminal afterwards, then `openremap id<Tab>` completes to
`openremap identify`.

**Every command, printed once:**

```bash
openremap commands
```

## What the package contains

- the Python engine, the CLI and the full-screen interface;
- a bundled **native Rust extension** — this is what makes a 4 MB scan take
  milliseconds instead of seconds, and it is why the `(rust)` marker appears in
  `--version`;
- the shipped workflow definitions, so `openremap-api` can chain methods without
  extra files.

Nothing is downloaded at run time. The package is self-contained and offline.

## Two ways to install Python packages — a note

| | `uv tool install` | `pip install` |
|---|---|---|
| Needs Python already installed | no | yes, 3.10+ |
| Kept isolated from other tools | yes | no — installs into the active environment |
| Command on your PATH | yes, automatically | sometimes needs `PATH` setup |
| Works when the system blocks `pip` | yes | no |

Both produce the same commands. If you are unsure, use uv.
