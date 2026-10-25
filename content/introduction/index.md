---
title: Project overview
description: >-
  OpenRemap is a free, offline tool that opens the file inside your car's engine
  computer — what it is, whether it is healthy, and exactly what a tune changed.
tags: [overview, introduction, beginner]
status: stable
---

# Project overview

**Your engine runs on a file.** The computer that controls it keeps its whole
program — and every tuning table — in one plain file, usually a few megabytes.

Most of the time that file is a mystery. A tuner hands you one back and you have
no easy way to see what they changed.

**OpenRemap opens it.** Free, open source, and it runs on your own computer: no
account, no telemetry, nothing uploaded.

## What you can do with it

- **Find out what a file is.** Which manufacturer made the ECU, which family it
  belongs to, which software version it runs — in about a second, without an
  internet lookup.
- **See if it is healthy.** Checksums, tuning tables, empty regions, duplicated
  VINs — one command, one verdict.
- **See what a tune changed.** Byte by byte and table by table: which maps moved,
  and by how much.
- **Keep the change.** Save it as a **recipe** — a small, readable text file of
  "at this spot, these bytes become those bytes" — and apply it to another file
  of the same software, with a check at every step.
- **Know what it doesn't know.** Where a table has no name, you get its offset and
  the values that were measured — never a guess dressed up as a fact.

## Why it's different

Most tuning workflows are a black box: you hand over a file, you get one back,
and nobody shows you the middle. OpenRemap is the opposite.

- **The answers come with evidence.** Every identification carries the signals
  behind it and a confidence tier, so you can disagree with it.
- **Nothing is hidden.** The code that recognises an ECU family is open and
  readable, and the recipe it writes is plain JSON — not a proprietary blob.
- **Your files stay yours.** It works offline and never uploads a dump, not even
  when you contribute support for a new ECU family.

## Who it is for

- **You bought or inherited a tuned file** and want to know what is in it before
  it goes anywhere near your car.
- **You are learning about tuning** and want to see the actual bytes, not a
  wizard's summary screen.
- **You work with dumps all day** and want an offline, scriptable tool that
  explains its answers.

No knowledge of tuning or programming is needed to start — the
[glossary](glossary.md) defines every word as it comes up.

## What it does not do

- **It does not flash your car.** OpenRemap writes files; it never talks to a
  vehicle.
- **It does not correct checksums.** It reports whether they are still valid
  (`ok`, `fail`, or `skip` when it knows no scheme for that family) and leaves the
  correction to your tuning tool.
- **It does not create tunes.** It records the changes a person made and replays
  them faithfully.
- **It does not make a tune safe.** A file that will be flashed into a real car
  needs a qualified tuner's review first.

> [!WARNING]
> OpenRemap is a research and education project, not a tool for defeating
> emissions equipment or any other modification the law where you live does not
> allow. See the [disclaimer](disclaimer.md).

## Ways to use it

| Way | Start it | Who it is for |
|---|---|---|
| **TUI** — full-screen terminal app | `openremap` | looking around: open a dump, see everything on one screen |
| **CLI** — one command at a time | `openremap identify my_file.bin` | scripts, batch work, repeatable runs |
| **API** — for developers | `import openremap.api` · `openremap-api` | your own tools, in Python or over JSON-RPC |
| **Harness** — graphical desktop app | coming in **1.0.0** | 2D/3D maps, hex view, workflows — no terminal at all |

The TUI, CLI and API are available today; the Harness is the next milestone.
All of them need Python 3.10 or newer, on Windows, macOS or Linux.

No dump to experiment with? `openremap synth --output demo.bin` writes a
synthetic ECU-like file you can point any of them at.

## Where the project stands

Version **0.9.0**, MIT licensed: 38 extractors covering the ECU families of six
manufacturers — from 1980s Bosch LH-Jetronic to modern Bosch EDC17 and the Denso
/ Hitachi units in Subarus. What changed recently:
[release notes](../project/changelog/index.md).

## Where to go next

| You want to… | Go to |
|---|---|
| install it and try it | [Quick start](/cli) |
| learn the words first | [Glossary](glossary.md) |
| find a command | [CLI reference](/cli) |
| know if your ECU is supported | [Manufacturers](/architecture/manufacturers) |
| browse everything | [Index](all-pages.md) |
