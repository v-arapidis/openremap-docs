---
title: Inside a recipe
description: >-
  Every part of a .remap file explained in plain words — the instructions, the
  anchor bytes, the contract, the fingerprint, and the one thing it never stores.
tags: [recipe]
status: stable
---

# Inside a recipe

A recipe is a JSON file — text that both people and programs can read. It has four
kinds of content: **what it came from**, **what it needs**, **the changes**, and
**what changed around them**.

## 1. Where it came from

```json
"source": {
  "filename": "original.bin",
  "size": 4194304,
  "sha256": "00f727e8abf62d38…",
  "identity": {
    "match_key": "EDC17C66::1037541778126241V0",
    "manufacturer": "Bosch",
    "ecu_family": "EDC17",
    "software_version": "1037541778126241V0"
  }
},
"tune": {
  "filename": "stage1.bin",
  "size": 4194304,
  "sha256": "b737d34463cc9d25…"
}
```

Two files, each with a fingerprint (a `sha256` — a number that changes if even one
byte changes). Plus the identity of the stock file: which ECU it is and which
software version. That identity is what later decides whether the recipe may be
applied to another car.

## 2. What it needs — the contract

```json
"contract": {
  "identity_floor": "any",
  "anchors_unique": true,
  "sections": ["maps", "regions"]
}
```

This is the recipe stating its own requirements, so nothing has to be guessed:

| Field | Meaning in plain words |
|---|---|
| `identity_floor` | the *minimum* identity a tool must check: `any` (byte positions are proof enough), `firmware` (the software version must match), `file` (byte-identical file) |
| `anchors_unique` | can every change be found uniquely in the file it came from? |
| `sections` | which optional parts are present (`maps`, `regions`) |

Two of those three are **re-computable from the changes themselves**. A recipe whose
contract says one thing and whose instructions say another is refused as doctored or
stale — the tool checks, it does not trust.

## 3. The changes

The heart of the file. One entry per change:

| Field | Plain words |
|---|---|
| `offset` | where it is, as a number |
| `offset_hex` | the same address, in the form people say out loud (`0x225A13`) |
| `ob` | the **o**riginal **b**ytes — what must be there before |
| `mb` | the **m**odified **b**ytes — what gets written |
| `ctx` | the bytes *before* the change, used to find the spot again |
| `context_after` | the bytes *after* it, ditto |
| `ctx_unique` | was that pattern found exactly once? |
| `ctx_expanded` | was the context widened until it was unique? |
| `region` | which part of the file: `calibration`, `code`, `erased`, `mixed` |
| `flags` | anything worth a human look — `CODE_AREA`, `WEAK_ANCHOR`, `VIN_SUSPECT` |
| `description` | a sentence anyone can read: *"Byte at 0x225A13: 0x01 -> 0x00"* |

`ob` and `mb` are the change. `ctx` and `context_after` are the *proof of place*:
they are why the tool can say "I found the exact spot" instead of "I found something
that looked close".

**A flag is not a filter.** A change with `CODE_AREA` is still applied — the flag
means "this touched program code, you may want to look".

## 4. What changed around them

```json
"regions": { "tagged": 79, "risky": 41,
             "by_region": { "calibration": 38, "mixed": 40, "erased": 1 } }
```

A summary of where the changes sit, kept so a tool can say *"40 of 79 changes are
outside clean calibration data"* without re-scanning the whole file.

## 5. The fingerprint

```json
"fingerprint": "sha256:46877bc95cd8b13d…"
```

A fingerprint over the ordered changes only — deliberately blind to names,
descriptions and other decoration. Adding a comment does not change it; changing a
single byte does. That is what makes "is this the same recipe?" a one-line check.

## What it deliberately does **not** store: checksums

No checksum regions. No "checksum bytes were excluded" list. Nothing.

Two reasons, and the second is the important one:

1. a tuner recomputes checksums after flashing anyway, so a donor's checksum bytes
   are harmless;
2. a **wrong** stored checksum region would silently drop real tune bytes — and
   that is the one failure nobody can see and nobody can undo.

So checksums stay a live measurement (`openremap checksum`, and the verdict every
apply prints), never data carried inside the recipe.

## The short version

```
source + tune       → which files, proven by fingerprints
contract            → what the recipe requires (self-checked)
instructions        → what changes, where, and the bytes that prove the place
maps / regions      → what those changes sit in
fingerprint         → a seal over the changes themselves
```
