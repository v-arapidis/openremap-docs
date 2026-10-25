---
title: Harness
description: >-
  OpenRemap Harness — the desktop app, coming soon as an alpha release. Hex view
  and edit, 2D/3D map visualisation with drag-and-drop editing, and a workflow
  builder. Windows, macOS and Linux.
tags: [harness, roadmap]
status: stable
---

# Harness

> [!IMPORTANT]
> **Coming soon.** OpenRemap Harness ships with **1.0.0** as an **alpha release**.
> There is nothing to download yet, and no date promised. The [CLI](../cli/index.md)
> and the [TUI](../tui/index.md) already do everything described here today.

The same engine as the terminal tool, in a window: a real application for people
who do not work in a terminal, and a workspace for people who do both.

## One app, three platforms

| | |
|---|---|
| **Windows** | Windows 10 and 11, x86-64 |
| **macOS** | current releases, Apple silicon and Intel |
| **Linux** | x86-64, glibc |

One codebase, one engine, identical results on all three. A recipe cooked on
Windows applies on macOS — the files are the same files, and the checks are the
same checks.

## What it will have

| Capability | What it gives you |
|---|---|
| **Hex view and edit** | The file as bytes, with flash regions, table boundaries and changed areas highlighted, and the offset under the cursor. Edit bytes directly instead of writing a patch script. Every edit is recorded as an instruction with its before/after bytes — the same structure a recipe already uses. |
| **2D map visualisation** | A calibration table as a coloured heat map, with the breakpoints stored in the binary on both axes. Zoom, compare two tables side by side, export the picture. |
| **3D map visualisation** | The same table as a rotatable surface, so a shape that is unreadable as numbers becomes obvious. This is the one thing that genuinely needs a GPU. |
| **Drag-and-drop map editing** | Drag a map, a block or a selection directly in the view; selections snap to the map boundaries measured from the file. What changed is written down as bytes, not as an opaque operation. |
| **Workflow creation** | Chain the steps you actually repeat — identify → health-check → diff → cook → apply → verify — into a saved workflow, and run it on the next file in one action. The engine already has a declarative workflow format, so the builder is a face on something that exists, not a new concept. |

## Alpha, and what that means

The first release is labelled **alpha** on purpose:

- it is usable, but features and screens can still change between builds;
- file formats are **not** in flux — recipes stay schema 5.0 and the apply rules do
  not change, so work done in the Harness is readable by the CLI, and vice versa;
- when the Harness and the CLI disagree, **the CLI is the reference**: same engine,
  same methods, one documented surface.

## Offline, by construction

| Promise | How it holds |
|---|---|
| No account | there is no sign-in, no licence key, no activation |
| No telemetry | nothing is measured, sent, or stored about how you use it |
| No network at run time | the app has no reason to open a socket; a locked-down machine is a supported target |
| Your files stay yours | dumps, recipes and patched files are read and written on your disk only |

This is not a setting you have to find and switch off. It is the only mode.

## Safety first, in this version

The Harness is a new face on rules that already exist — a nicer interface does not
skip a check:

- **every write is verified** — original bytes at their recorded offsets, anchored
  position proven, result re-read and confirmed, byte accounting closed;
- **checksums are reported, never corrected** — `ok`, `fail`, or `skip` when no
  scheme is known for that family, and `skip` is never presented as a pass;
- **nothing is written without an explicit action**, and the destination path is
  shown before the action;
- **it never flashes a vehicle** — it writes files, and flashing stays with your
  flash tool;
- **the standing disclaimer is on screen**, because a tune bound for a real car
  needs a tuner's review whatever produced it.

The full position is on [safety](safety.md), and applies to the alpha exactly as it
applies to the CLI today.

## Until then

- [install the CLI](../install/cli/package.md) — one command, today;
- read [the project overview](../introduction/index.md) for what the tool does;
- every command is documented in [the CLI section](../cli/index.md).

## Follow the project

- Project site and release news: **[openremap.com](https://www.openremap.com)**
- Source, issues and releases:
  [github.com/v-arapidis/openremap-core](https://github.com/v-arapidis/openremap-core)
- What changed in each version: [release notes](../project/changelog/index.md)
