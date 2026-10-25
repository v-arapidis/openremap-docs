---
title: Sharing and copyright
description: >-
  What a recipe is and is not, in plain words — why it is not a copy of anyone's
  software, what you can hand to another person, and where the real limits are.
tags: [recipe, legal]
status: stable
---

# Sharing and copyright

Short version: **a recipe is a list of changes, not a copy of anybody's program.**
That single fact answers most of the questions people have about sharing one.

> [!IMPORTANT]
> This page explains how the file works. It is not legal advice, and rules differ
> between countries. The project's own position is the
> [disclaimer](../introduction/disclaimer.md).

## What a recipe contains

| Contains | Does not contain |
|---|---|
| addresses (numbers like `0x225A13`) | the manufacturer's program |
| a few bytes before and after each change | the full firmware file |
| the values that changed | any copyrighted source code |
| a fingerprint of the two files it was made from | the files themselves |

You can see the mechanism: an instruction says *"the bytes around here are these,
and this one became that"*. It is a diff — the same kind of thing `git` shows you
when a line of code changes. A diff is not a copy of the file, and it is useless
without the file.

## Why a recipe alone is harmless

Try to do something with a recipe without the matching file: nothing works.

- the tool needs the **stock file** to apply it to;
- the recipe's own addresses only mean something inside a file of that exact size
  and layout;
- the anchors must be found — otherwise it refuses.

So a recipe is not a way to distribute firmware. It is a way to describe an edit.

## What you can hand over

| You want to… | Fine? | Note |
|---|---|---|
| keep your own recipes as a backup | yes | they are your notes about your own car |
| share a recipe for **your own** tune | usually yes | it describes an edit you paid for or made |
| share a recipe **a tuner made for you** | ask them | tuning shops treat their calibrations as their work product; a recipe shows exactly what they did |
| publish a recipe for a **known commercial stage tune** | ask the shop | same reason — respect their business |
| share your **dump / firmware file** | be careful | that is a copy of manufacturer software, and that is a different question from sharing a diff |
| share a **patched file** | be careful | same as above, plus it is a modified copy |

Note the pattern: the recipe explains; the firmware file copies. OpenRemap is built
around the first one.

## Where OpenRemap's own licence sits

- **The tool is MIT licensed.** You can use it, change it and ship it, including
  commercially, as long as the copyright notice travels with it. See
  [License](../introduction/license.md).
- **Your files stay yours.** The tool does not claim anything over your dumps, your
  recipes or your patched files, and it uploads nothing.
- **Contributions are different.** When you contribute support for a new ECU family,
  what gets committed is a small synthetic file carrying only the marker — never
  your dump. See [Contribute](../cli/contribute.md).

## The one thing to remember

A recipe is a description of an edit, written in text, that only works on the file it
belongs to. That is why it can be read, reviewed, archived and shared — and why it is
not a copy of anyone's software.
