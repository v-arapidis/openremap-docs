---
title: Why it matters
description: >-
  What a written change list buys you that a patched file cannot — readable,
  provable, portable, honest, and impossible to fake.
tags: [recipe]
status: stable
---

# Why it matters

Most tuning stays in a black box: a file goes to a tuner, a different file comes
back, and nobody can show you what happened in between. A recipe is the opposite of
that — a change you can read, check and hand over.

Five things follow, and each one is a plain consequence of the format.

## 1. You can check it before you trust it

A recipe is text. Open it in any editor and you see every change, with a sentence
describing each one. You do not need OpenRemap installed to read one, and you do not
need anyone's permission.

That is the difference between *"the tuner says it raises boost a little"* and *"here
are 79 changes, 38 of them in calibration tables, 41 with a flag that says the change
touched program code"*.

## 2. It proves where it belongs

Two independent things stop a recipe from being applied to the wrong car:

- the **original bytes** (`ob`) must be exactly where the recipe says they are;
- the **surrounding bytes** (`ctx`, `context_after`) must be findable again.

If either fails, the tool refuses. It does not "try anyway", and there is no flag to
make it. This is why applying a tune to a *different* car of the same software is
possible at all — and why applying it to the wrong software is refused.

## 3. It is small, and it ages well

A firmware file is 2 to 8 MB. A recipe for one is a few tens to hundreds of
kilobytes, and it stays useful for years: it is versioned (`schema_version: "5.0"`),
and a version mismatch is reported instead of misread.

The format also has a rule that keeps it small and honest: **additions stay in the
5.x line; only a semantic change earns 6.0.** So a new optional field cannot silently
break an old recipe.

## 4. It is honest by construction

Three deliberate choices, all of them about not lying to you:

| Choice | What it prevents |
|---|---|
| **No exclusion of bytes.** Boundaries are not carved out of a recipe; anything suspicious becomes a *flag* | a change quietly vanishing because a rule decided it was "volatile" |
| **No checksum data stored** | a stale stored region silently dropping real tune bytes |
| **Refusal is an answer, not a failure** | a half-applied file, or a "success" that is not one |

The refusals even name their rule (`Γ2`, `Γ4`, `Γ6`, `Δ4`), so you can look up
exactly why it stopped.

## 5. It is nobody's lock-in

The format is plain JSON, documented in this wiki, produced by an open-source tool
under the MIT licence. Nothing about it is tied to OpenRemap: if the project
disappeared tomorrow, the recipes would still be readable, still comparable, and
still convertible by hand.

That matters more than it sounds. A tune that lives in a vendor's proprietary format
lives for as long as that vendor's format does.

## What a recipe cannot tell you

Being clear about the limits is part of the point:

- **it does not tell you what a table is called.** It tells you where it is and which
  bytes changed — not whether it is a torque limiter. Names come from people.
- **it does not correct checksums.** It says whether they still verify.
- **it does not make a tune safe.** A written list of changes still needs a
  professional to review it before it goes into a vehicle.

Those three sentences are also on [the disclaimer](../introduction/disclaimer.md),
and they are not negotiable in any version.
