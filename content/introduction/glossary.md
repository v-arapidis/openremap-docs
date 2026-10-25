---
title: Glossary
description: >-
  Every word OpenRemap uses, defined once in plain English — ECU, dump, recipe,
  match key, anchor, identity floor, the four apply rungs, checksum verdicts, and
  the rule ids you see in a refusal.
tags: [glossary, reference, introduction]
status: stable
---

# Glossary

One line per term, alphabetical inside each group, each linked to the page that
goes deeper. If you are reading this wiki for the first time, you only need the
first group; the rest is here so that nothing on any page is ever undefined.

> [!TIP]
> A refusal or a report often names a **rule id** — `Γ4`, `A2`, `Δ1`. Those are
> listed at the bottom of this page. They are worth learning: a rule id tells you
> exactly *why* OpenRemap stopped.

---

## 1. The file on your disk

**Container** — the wrapper a dump arrives in. A raw `.bin` is flat bytes; Intel
HEX and Motorola S-Record are text files that carry addresses and a checksum per
line. OpenRemap sniffs the content, so you can pass any of them.

**Dump** — the contents of an ECU's flash memory, saved as a file. Also called a
*firmware image*, a *binary*, or (when it is the file a car came with) a *read*.
Typically 64 KB to 8 MB.

**ECU (Engine Control Unit)** — the computer that runs the engine. Its program
and calibration tables are what a dump contains.

**Stock file** — the unmodified dump: what the factory (or the current tune)
contains. The starting point of every comparison.

**Tuned file** — a stock file after somebody changed calibration values in it. A
tuned file is *not* something OpenRemap produces; it is something you bring.

**Workspace** — the folder the TUI writes into: `~/Documents/OpenRemap` (falling
back to `~/OpenRemap`), with `ecus/`, `recipes/`, `tunes/` and `exports/` inside.
Nothing outside it is ever touched without you choosing the path.

---

## 2. Identity — *what is this file?*

**Manufacturer (OEM)** — who built the ECU: Bosch, Siemens, Delphi, Magneti
Marelli, Denso, Hitachi. OpenRemap currently recognises 38 families across these
six.

**Family** — the manufacturer's ECU platform, e.g. Bosch `EDC17`, Siemens `MS43`,
Denso `SH7058`. Families share a design and usually a file size; a family is
*not* a car model.

**Variant** — the specific member of a family, e.g. `EDC17C66` inside `EDC17`.

**Software version** — the software revision string the family stores, e.g.
`1037541778126241V0`. Two dumps of the same software understand the same maps at
the same offsets; that is why it matters.

**Hardware number** — the part number of the physical ECU board.

**OEM part number** — the car maker's own part number for that ECU.

**Calibration ID** — the identifier of the calibration data set, where the family
stores one.

**Match key** — OpenRemap's name tag for a software version, built as
`VARIANT::IDENTIFIER` (e.g. `EDC17C66::1037541778126241V0`). Two files with the
same match key are the same software. This is what an apply command compares.

**Extractor** — the small piece of code that recognises one family and pulls its
identity fields out of a dump. Adding one is how support for a new family arrives;
see [contribute](/cli/contribute).

**Confidence tier** — how strongly an identification was established:
`HIGH`, `MEDIUM`, `LOW`, `SUSPICIOUS`, `UNKNOWN`. It is built from **signals**, never
from a coin flip; see [confidence](/architecture/extractors).

**Signal / detection tag** — one piece of evidence behind a tier (a detector
signature fired, a canonical software-version pattern matched, a variant was
named). Listed in the report so you can disagree with it.

**Coherence** — whether independent checks agree (identity vs checksums vs code
references). `agree` / `gap` / `conflict`; a conflict means at least one of them is
wrong, and the report says which.

**VIN (Vehicle Identification Number)** — the car's 17-character identity, often
stored in the dump. Candidates are scored: a string is only reported as a VIN when
its check digit decodes; otherwise it is labelled as a *candidate* with its
confidence (e.g. `~0.45`).

---

## 3. What is inside a dump

**Map (table)** — a calibration table: fuel, boost, ignition timing and so on,
stored as a grid of numbers. "Map" and "table" are used interchangeably here.

**Axis** — the row or column labels of a map: the RPM and load breakpoints the
grid is indexed by. If a table's axis is not stored next to it, the table has
"no axis" and its percentages must not be trusted.

**Breakpoint (axis point)** — one stored axis value. OpenRemap reads them from the
binary rather than assuming them, which is why a picture it draws can be checked.

**Cell** — one number in a map, and **cell width** its size in bytes (usually
2).

**Byte order** — how a multi-byte cell is stored: `little` or `big` endian.

**Region / region tag** — the kind of memory a byte sits in: `calibration` (tables
and their data), `code` (the program), `erased` (blank flash), `mixed`, `ident`
(identity blocks). A change in `code` is revision-fragile; that is what the
`CODE_AREA` flag means.

**Code reference (xref)** — a place where the program loads the address of a map.
It is evidence that a table is real, and it also hints at where the calibration
area begins.

**Decoder** — a CPU instruction-set decoder (C166, TriCore, SuperH, M68K, PowerPC,
…) used to read code and cross-reference it. See [decoders](/architecture/decoders).

**Score** — a structural plausibility number for a candidate axis or table
(0–1). It is not a probability, and a high score is not a name: OpenRemap does not
tell you that a table *is* a torque limiter.

---

## 4. Checksums

**Checksum** — a stored number that must match the block it protects; a cheap way
for the ECU to notice corruption or tampering.

**Scheme (profile)** — one known way of computing that number, named after the
family or its origin (ME7, IronFelix, NefMoto, MS43, GS20/SMG2, Denso Subaru).

**Stale** — the stored value no longer matches the data, e.g. because a tune
changed bytes and nobody recomputed it. A stale checksum does not make a recipe
wrong; it makes the file **unflashable**.

**Verdict: `ok` / `fail` / `skip`** — what the apply engine can say about the file
it just wrote. `ok` = a known scheme verifies; `fail` = it does not; **`skip` = no
known scheme for this family, so nothing was checked** — never read as a pass.

**Correction** — recomputing a checksum. OpenRemap deliberately **does not** do
this; your flash/calibration tool does. See [checksum](/cli/look-at-a-file#checksum).

---

## 5. Tune, recipe, and apply — the core vocabulary

**Tune** — the set of changes a tuner made to a stock file. Informally, also the
resulting file.

**Recipe (`.remap`)** — the change list, saved as a plain JSON file: every byte
that differs, where it is, and what proves the position. Readable in any text
editor. See [recipe format](../recipe/index.md).

**Instruction** — one line of a recipe: `offset`, `ob` (the **o**riginal **b**ytes,
what must be there), `mb` (the **m**odified **b**ytes, what gets written), and an
anchor.

**Anchor (`ctx` + `ob` + `context_after`)** — the bytes around a change, used to
find it again. The more context, the less chance of finding the pattern twice.

**Unique anchor** — an anchor that occurs exactly once in the source dump. A
unique anchor is *proof of position*: nothing else in the file looks like it.

**Schema version** — which recipe format the file uses. Current: **5.0**. Recipes
from the old commands (4.x) are still read by `audit` and `merge`, and refused by
the apply side with rule `A2`.

**Contract** — the block a 5.0 recipe uses to declare what it needs, instead of
leaving it to be guessed. Three fields, each checkable against the recipe's own
contents:

| Field | Meaning |
|---|---|
| `identity_floor` | the **minimum** identity an apply command must verify: `any`, `firmware` or `file` |
| `anchors_unique` | whether every anchor occurs exactly once in the source |
| `sections` | which optional sections are present (`maps`, `regions`) |

**Identity floor** — the identity a recipe *demands*, derived from its anchors: all
anchors unique → `any` (the byte match is self-verifying); any anchor repeated →
`firmware` (only the software version can carry the guarantee). A command may
always be **stricter** than the floor, never looser.

**Fingerprint** — a hash over the recipe's ordered instructions, independent of
annotation. `audit` re-cooks and compares it: if it matches, the recipe honestly
describes that pair.

**Provenance** — the recorded link back to the two files a recipe was made from:
names, sizes, `sha256`, and the producer's version. `audit` is the provenance
check.

**Producer** — which command wrote the recipe (`cook-strict`, `cook-forced`,
`merge`) and when, plus any warnings from that run.

**Cooking** — building a recipe by comparing a stock and a tuned file. Two
commands, mirroring the apply side:

| Command | Anchors | Declares | Consequence |
|---|---|---|---|
| `cook-strict` | every anchor must be unique | `identity_floor: any` | the result applies to **any** dump of the family, even one that cannot be identified |
| `cook-forced` | repeated anchors allowed (a change inside blank flash) | `identity_floor: firmware` | only commands that verify the **match key** will accept it |

Neither excludes anything: no VIN, no checksum store, no "volatile" bytes.
Anything suspicious becomes an instruction **flag** instead.

**Applying** (also *patching*, or *tuning* a file) — writing a recipe's changes
into a copy of a target dump. Four commands, a **ladder** from strictest to
loosest. There are no safety flags: the command *is* the policy.

| Rung | Identity required | Original bytes must be at the recorded offset | Displaced anchor allowed | Ambiguous anchor |
|---|---|---|---|---|
| `tune-strict` | same firmware (match key) | yes | no (`shift` must be 0) | reported |
| `tune-shift` | same firmware | no — the anchor proves position | yes, ±2048 bytes, reported | **refused** |
| `tune-unique` | **none** | yes | no | reported |
| `tune-any` | **none** | no | yes | reported |

The rule behind the table: *ambiguity is decisive only where a shift is
allowed* — that is the only place the engine actually chooses between candidates.

**Shift** — how far a found anchor sits from where the recipe recorded it. Zero
means "found where expected".

**Byte accounting** — the last apply check: every byte that changed must lie
inside a declared instruction range. Nothing changes silently.

**Flag** — an instruction annotation pointing at something worth a human look:
`CODE_AREA` (the change sits in the program, not the calibration),
`WEAK_ANCHOR` (uniqueness could not be verified), `LOW_ENTROPY_CTX` (the
surrounding bytes are repetitive), `VIN_SUSPECT` (the change touches something
that looks like a VIN). **Never a filter** — a flagged change is still applied.

**Exit codes** — every apply command: `0` = applied, `1` = refused, `2` = bad
input. A refusal is an expected answer, not a crash.

---

## 6. Retired vocabulary you may still meet

You will find these in older pages, older recipes, and older forum posts. They are
listed so that they read as history rather than as instructions.

**`tune` (command)** — the old flag-driven apply (`--force`, `--skip-validation`).
Deleted in 0.9.0 after four policy commands proved byte-for-byte identical
results on 47 real pairs.

**`cook` / `cook-volatile` (commands)** — the old 4.x recipe producers. Replaced by
`cook-strict` / `cook-forced`.

**Volatile bytes** — firmware locations that legitimately differ per vehicle (VIN,
immobiliser data, checksum stores). The old `cook-volatile` excluded them to make a
recipe car-portable. 5.0 recipes store **no** exclusion data at all: a tuner
recomputes checksums after flashing anyway, while a wrong exclusion would silently
drop real tune bytes — the one failure that is neither visible nor recoverable.

**`same_file_only` / `metadata.portability`** — the 4.x stamp that tried to say two
different things at once ("are the anchors unique?" and "what identity does apply
need?"). 5.0 splits it into the `contract` fields above.

---

## 7. Tooling words

**TUI (Terminal User Interface)** — the full-screen app you get from `openremap`
with no arguments. Eleven screens, keyboard first, no browser.

**CLI (Command Line Interface)** — one command at a time in a terminal, e.g.
`openremap identify x.bin`.

**API (Application Programming Interface)** — the same engine called from code:
`openremap.api` in Python, or JSON-RPC over stdio with `openremap-api`.

**JSON-RPC** — a small text protocol ("call this method with these arguments") that
lets any language drive the API without Python bindings.

**Method** — one callable in the API registry (41 of them: 31 commands, 9
composites, 1 workflow). The TUI's HELP screen lists them from the registry
itself, so it cannot go stale.

**Composite** — an API method that runs several steps as one decision (e.g.
`health`), as opposed to a **command**, which is one cohesive operation.

**Workflow** — a declarative `.toml` pipeline that chains methods by name; see
[workflows](../api/workflows.md).

**Batch (scan)** — classifying a whole folder of dumps, one file at a time, with
the option to file them into sub-folders afterwards. Classifying never moves
anything; organising is a second, explicit step.

**Synthetic dump** — a generated ECU-*like* file with no manufacturer data in it,
useful as a demo or a test fixture. It identifies as `Unknown` on purpose. See
[synth](/cli/batch-and-fixtures#synth).

**Pseudo-code / `routine`** — one-line-per-instruction reading of a code region, so
you can see what the program does around an address without a decompiler. See
[routine](/cli/convert-and-routine#routine).

---

## 8. Safety words

**Tuner shop** — a professional calibration business. A tune produced with this
tool that will run in a real vehicle is meant to be reviewed by one.

**Right to repair / track racing** — the two uses this project supports: keeping
your own hardware serviceable, and cars that do not have to pass road emissions.
See the [disclaimer](disclaimer.md).

**Unflashable** — the state of a file whose stored checksum no longer matches its
contents. Not "wrong data" — just not ready to be written to an ECU.

---

## Rule ids you see in a refusal

The apply engine names the rule that stopped it. Roughly, in reading order:

| Prefix | Group | Examples |
|---|---|---|
| `A` | checks on the **recipe** itself | `A1` not a recipe · `A2` wrong/old schema · `A3` unknown section · `A5` contract disagrees with contents |
| `Γ` | checks of the recipe **against the target** | `Γ1` size · `Γ2` identity (match key / floor) · `Γ3` file identity (sha256) · `Γ4` original bytes not in place · `Γ6` anchor not found · `Γ7` shift · `Γ8` anchor ambiguity |
| `Δ` | checks **after writing** | `Δ1` modified bytes verified · `Δ4` byte accounting (nothing changed outside declared ranges) |

A refusal also prints the next step that could help — and when no looser rung can
help (wrong size, wrong file, already patched), it says that instead of offering a
key that would not work.
