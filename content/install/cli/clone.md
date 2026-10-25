---
title: Repo clone
description: >-
  Install OpenRemap from its source repository — for trying unreleased changes,
  running the test suite, or contributing. Needs git, uv and a Rust toolchain.
tags: [install, cli, development]
status: stable
---

# Install from a repo clone

Use this when you want to **change the code**, run the tests, or use something
that has not been released yet. For everyday use, the
[package install](package.md) is faster and simpler.

Everything below happens inside one folder. It does not affect a package install
you may already have, and it does not touch anything else on your computer.

## What you need

| Tool | Why | How |
|---|---|---|
| **git** | to clone the repository | [git-scm.com/downloads](https://git-scm.com/downloads) |
| **uv** | manages the environment and Python | [astral.sh/uv](https://astral.sh/uv) |
| **Rust toolchain** | the engine's hot loops are written in Rust, and you are building them from source | [rustup.rs](https://rustup.rs) |

Installing Rust is one command — `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
on macOS/Linux, or the installer from [rustup.rs](https://rustup.rs) on Windows.
First build takes a few minutes; later ones are quick.

## Clone and set up

```bash
git clone https://github.com/v-arapidis/openremap-core.git
cd openremap-core
uv sync
```

`uv sync` creates a virtual environment in `.venv/`, installs every dependency at
the versions pinned in `uv.lock`, and builds the native extension.

## Build the native engine

```bash
uv run maturin develop --release
```

Run this after **any change to the Rust code** (everything under
`openremap/_rs/`). For Python-only changes it is not needed.

## Run it

Two equivalent ways — pick whichever suits you:

```bash
# a) prefix each command — nothing to activate
uv run openremap --version
uv run openremap identify my_file.bin

# b) activate the environment once per terminal session
source .venv/bin/activate     # macOS / Linux
.venv\Scripts\activate        # Windows
openremap --version
```

With no arguments, `openremap` opens the full-screen interface, exactly as the
installed package does. `uv run openremap` does the same from inside the clone.

## Run the tests

```bash
uv run pytest tests/ -q          # the whole suite
uv run pytest tests/cli -q       # one area
uv run pytest tests/tuning/manufacturers/test_edc17_extractor.py -v   # one file
```

Some tests need a local corpus of dumps, which is not part of the repository. They
skip cleanly when it is absent, so the suite runs anywhere — including CI.

## Staying up to date

```bash
git pull
uv sync          # picks up new or changed dependencies
```

## Where things live

| Path | What it is |
|---|---|
| `openremap/cli/` | the command-line interface |
| `openremap/tui/` | the full-screen interface, one module per screen |
| `openremap/api/` | the method registry, JSON-RPC transport, workflows |
| `openremap/core/` | the engine — identity, maps, checksums, recipes, apply |
| `openremap/_rs/` | the Rust extension (built with maturin) |
| `tests/` | the test suite; `docs/internal/` holds dated audits |

Contributions are welcome — read
[contributing](../../project/contributing.md) first, especially the section on
adding a new ECU family without sharing a dump.
