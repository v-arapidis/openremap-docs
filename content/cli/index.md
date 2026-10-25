---
title: CLI
description: >-
  Every command OpenRemap has, what it does, and what it prints — one command at a
  time, in a terminal.
tags: [cli, overview]
status: stable
---

# CLI

The command line is the same tool as the [TUI](../tui/index.md), driven one command
at a time. Type a command, read the answer, move on. It is what you use when you
want to repeat something, script it, or check something quickly.

```bash
openremap identify my_file.bin
```

## Everything is listed, always

Three commands describe the tool itself. You never need this wiki to find a
command:

| Command | What you get |
|---|---|
| [`openremap commands`](getting-oriented.md#commands) | every command, one line each |
| [`openremap workflow`](getting-oriented.md#workflow) | a walkthrough in plain English, in order |
| [`openremap families`](getting-oriented.md#families) | every ECU family the tool knows |

And any command explains itself:

```bash
openremap tune-strict --help
```

## How to read the output

Every command prints the same way: a **title line naming the file**, then the
facts, then a **verdict** with a `✓`, `⚠` or `✗`. When a command writes a file it
prints the full path so you know exactly what was produced.

Long lists are shortened with `…` or by a count — and it says so, so you never
mistake a summary for the whole thing.

## Exit codes — how to know if it worked

| Code | Means | Typical case |
|---|---|---|
| `0` | it worked | a file was written, a check passed |
| `1` | it refused, or the check failed | a recipe does not fit the file |
| `2` | the command itself was used wrongly | a missing file, a bad flag |

A refusal is **not** a crash. It is the tool saying
`✗ REFUSED at Γ4 — the recipe's original bytes are not in place`, with a code of
`1`, so a script can tell a refusal from a bug.

## Machine-readable output

Most commands accept `--json` and print one JSON object instead of the pretty
report, for use in scripts. Several also accept `--report <path>` to also write the
report to a file.

## File types it accepts

`.bin`, `.ori`, `.hex` (Intel HEX), `.s17` (Motorola S-Record) — plus `.remap`
files, which are recipes. The format is detected from the content, not the
extension, so a raw dump named `.bin` and a text HEX file both work.

## Every command, by task

**Start here**

| Command | What it does |
|---|---|
| [`commands`](getting-oriented.md#commands) | one-line list of everything |
| [`workflow`](getting-oriented.md#workflow) | the whole job, step by step, in words |
| [`families`](getting-oriented.md#families) | supported ECU families, or details for one |

**Understand a file**

| Command | What it does |
|---|---|
| [`identify`](look-at-a-file.md#identify) | what is this file? |
| [`analyze`](look-at-a-file.md#analyze) | everything about it in one pass |
| [`health`](look-at-a-file.md#health) | is it healthy? six checks |
| [`checksum`](look-at-a-file.md#checksum) | do its check numbers still match? |
| [`layout`](look-at-a-file.md#layout) | how it is organised, region by region |
| [`scan-vins`](look-at-a-file.md#scan-vins) | any vehicle ID numbers inside it? |
| [`convert`](convert-and-routine.md#convert) | HEX / S-Record → flat binary |
| [`routine`](convert-and-routine.md#routine) | read the code at one address |

**Tables and maps**

| Command | What it does |
|---|---|
| [`scan-maps`](maps.md#scan-maps) | find the tuning tables |
| [`diff-maps`](maps.md#diff-maps) | compare two files, table by table |
| [`map-image`](maps.md#map-image) | draw one table as a picture |

**Make a recipe**

| Command | What it does |
|---|---|
| [`cook-strict`](cook.md#cook-strict) | stock + tuned → recipe (safe by construction) |
| [`cook-forced`](cook.md#cook-forced) | the same, when a change sits in repeated bytes |
| [`recipe-info`](cook.md#recipe-info) | what does a recipe say about itself? |
| [`merge`](cook.md#merge) | two recipes → one |

**Apply a recipe**

| Command | What it does |
|---|---|
| [`tune-strict`](apply.md#tune-strict) | apply only if every check passes |
| [`tune-shift`](apply.md#tune-shift) | …when a change sits at a slightly different place |
| [`tune-unique`](apply.md#tune-unique) | …when the file cannot be identified at all |
| [`tune-any`](apply.md#tune-any) | the loosest option |

**Check the result**

| Command | What it does |
|---|---|
| [`validate before`](verify.md#validate) | are the original bytes where the recipe says? |
| [`validate check`](verify.md#validate) | find a recipe's bytes anywhere in a file |
| [`validate after`](verify.md#validate) | were the changes actually written? |
| [`audit`](verify.md#audit) | do stock, tuned and recipe belong together? |

**Folders and test files**

| Command | What it does |
|---|---|
| [`scan`](batch-and-fixtures.md#scan) | classify a whole folder |
| [`synth`](batch-and-fixtures.md#synth) | generate a fake ECU file to practise on |
| [`contribute`](contribute.md) | add support for an ECU the tool does not know |

> [!NOTE]
> This wiki section documents the commands of **0.9.0**. If a command here
> disagrees with `openremap <command> --help`, the program is right and this page
> is out of date — please report it.
