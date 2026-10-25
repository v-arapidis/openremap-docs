---
title: Safety
description: >-
  What the Harness guarantees about every write, what it refuses to do, and why
  those rules do not change between the terminal, the API and the desktop app.
tags: [harness, safety]
status: stable
---

# Safety

The Harness is a graphical front end to the same engine the [CLI](../cli/index.md)
and the [API](../api/index.md) use. These rules are properties of that engine, so
they hold in the alpha as well.

## Every write, checked the same way

| Check | Question it answers |
|---|---|
| recipe validity | is this a real 5.0 recipe, and does its contract match its own contents? |
| identity floor | does the recipe allow a target at this identity level? |
| size | is the target the declared size? |
| firmware identity | is it the same software (match key)? |
| original bytes | are the "before" bytes exactly at their recorded offsets? |
| anchor search | can the change be found again, and how often? |
| post-verification | were the new bytes written where they were found? |
| byte accounting | did anything change outside the declared ranges? |

A failure anywhere means **nothing is written** — not a partial file, not a
warning-and-continue. That is why the app can afford to be a GUI: the dangerous part
is not in the GUI.

## Checksums are reported, never corrected

| Verdict | Meaning |
|---|---|
| `ok` | a known scheme verifies on the file that was produced |
| `fail` | a known scheme does not verify |
| `skip` | no scheme is known for this family — **nothing was checked** |

`skip` is a real answer for families whose checksum has never been cracked (Bosch
EDC17 among them), and it is never shown as a pass. Correcting a checksum is your
tuning tool's job; a tune bound for a vehicle also needs a tuner shop to review it.

## What it will not do

- **It will not flash a vehicle.** The Harness writes files. Flashing stays with
  your flash tool, and with you.
- **It will not correct a checksum.** There is no code path that does.
- **It will not move a tune between different software revisions.** That was the
  planned 0.8.x line and it was dropped: without a professional tuner validating the
  result, such output would be dangerous by default.
- **It will not decide a tune for you.** Dragging a map changes numbers; it does not
  tell you what the numbers should be.
- **It will not upload anything.** No account, no telemetry, no network at run time.

> [!WARNING]
> A tune that will run in a real vehicle must be reviewed by a dedicated tuner shop,
> whichever tool produced it. The supported uses are right to repair and track
> racing. The full legal and safety position is the
> [disclaimer](../introduction/disclaimer.md).

## What "alpha" does not change

An alpha label covers the **interface**: screens, shortcuts, menu layout and
wording can change between builds. It does not cover the engine:

- the recipe format stays **schema 5.0**;
- the apply ladder keeps its four rungs and their rules;
- a file produced in the Harness is readable by the CLI, and the reverse.

If a future version ever weakens one of these, it will be a documented change with a
version number, not an alpha surprise.
