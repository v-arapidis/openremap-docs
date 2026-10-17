---
title: Confidence Scoring
description: >-
  Every `openremap identify` result and every `openremap scan` line includes a
  confidence assessment — a measure of how reliably the system detected and
  identified the ECU binary, based on detection quality, extracted identity
  fields, filename heuristics, and map-structure analysis.
---
# Confidence Scoring

Every `openremap identify` result and every `openremap scan` line includes a
confidence assessment — a measure of how reliably the system detected and
identified the ECU binary, based on detection quality, extracted identity
fields, filename heuristics, and map-structure analysis.

> **What confidence measures:** The score reflects identification quality —
> how many expected identity fields were successfully extracted and how
> rigorous the detection cascade was.  It does **not** measure whether the
> binary content has been modified.  A tuned file with all ident blocks
> intact will score just as highly as an unmodified one.

---

## Tiers

| Tier | What it means |
|---|---|
| **HIGH** | All key identifiers present and consistent — strong identification |
| **MEDIUM** | Most identifiers present, minor gaps |
| **LOW** | Some identifiers missing, or a mild filename concern |
| **SUSPICIOUS** | Significant identification gaps or filename red flags — inspect before use |
| **UNKNOWN** | No extractor matched the binary — family not supported |

---

## Example output

### HIGH — Bosch EDC17, all identifiers present

```
  ── Confidence ─────────────────────────────────────
  Tier   HIGH
  Signal  +  detection evidence (5 tags: MAGIC_MATCH, IDENT_BLOCK, SIZE_MATCH, FAMILY_STRING…)
  Signal  +  canonical SW version
  Signal  +  hardware number present (0261209352)
  Signal  +  ECU variant identified (EDC17C66)
```

### HIGH — Delphi Multec S, all identifiers present

```
  ── Confidence ─────────────────────────────────────
  Tier   HIGH
  Signal  +  detection evidence (5 tags: SIZE_MATCH, BOOT_BLOCK, POINTER_TABLE, FAMILY_STRING…)
  Signal  +  canonical SW version
  Signal  +  hardware number present (09391237)
```

### SUSPICIOUS — stop and check

```
  ── Confidence ─────────────────────────────────────
  Tier   SUSPICIOUS
  Signal  +  detection evidence (2 tags: SIZE_MATCH, EXCLUSION_CLEAR)
  Signal  -  SW ident absent — no match key produced
  Signal  -  tuning/modification keywords in filename
  ⚠  IDENT BLOCK MISSING
  ⚠  TUNING KEYWORDS IN FILENAME
```

> [!NOTE]
> The terminal prints only the **sign** of each delta. The numeric score and the
> per-signal values live in the JSON output (`confidence.score`), and the table
> row above the section carries a one-line summary of the three strongest
> signals *with* their numbers — e.g. `canonical SW version (+30), hardware
> number present (0261209352) (+20), detection evidence (5 tags: …) (+15)`.

---

## Signals

Each signal line shows what contributed to the tier. A `+` prefix raised
confidence; a `-` prefix lowered it.

### Detection quality baseline

The extractor's `can_handle()` collects **evidence tags** as it checks the
binary — `MAGIC_MATCH`, `IDENT_BLOCK`, `SIZE_MATCH`, and so on. Each tag is
worth 2–4 points and the total is capped, so the baseline reflects how much the
extractor could actually prove:

| Evidence | Delta | Tags |
|---|---|---|
| Structural | +4 each | `MAGIC_MATCH`, `HEADER_MATCH`, `POINTER_TABLE`, `LAYOUT_FINGERPRINT`, `IDENT_BLOCK`, `BOOT_BLOCK`, `FAMILY_ANCHOR` |
| Identity / detection | +3 each | `FAMILY_STRING`, `DETECTION_SIGNATURE`, `SYNC_MARKER`, `MANUFACTURER_CONFIRM` |
| Soft | +2 each | `SIZE_MATCH`, `EXCLUSION_CLEAR`, `FILL_PATTERN` |
| Family-specific | +2 each | any free-form tag an extractor defines |
| **Cap** | **+20** | a long tag list cannot inflate the score |

The signal reads `detection evidence (N tags: …)`, listing at most the first
four tags. An extractor that runs four or more structural checks reaches the cap.

> [!NOTE]
> An extractor can also declare a static `detection_strength`
> (`strong` +15 / `moderate` +10 / `weak` +5). That attribute is
> **deprecated** — it is only a fallback for an extractor that has not been
> migrated to evidence tags, and all of them have been, so in practice you
> will only ever see the evidence signal.

### Software version

| Signal | Delta | Notes |
|---|---|---|
| `canonical SW version` | +30 | Matches the manufacturer's format (see below) |
| `SW version present (…)` | +15 | A SW number was found but does not match the expected format |
| `SW ident absent — no match key produced` | -15 | The family normally stores SW and no fallback matched (also raises the ident-block warning) |
| `SW version absent (match key from fallback field)` | -10 | The family normally stores SW, but a fallback key was produced |
| *(no signal)* | 0 | The family's profile does not expect a SW version — no penalty |

### Other identity fields

| Signal | Delta |
|---|---|
| `hardware number present (…)` | +20 |
| `ECU variant identified (…)` | +10 |
| `calibration ID present (…)` | +10 |
| `OEM part number present (…)` | +5 |

The variant bonus is skipped when the reported variant is just the family name.

### Cross-checks against the binary

Two more bonuses come from checking the extracted identity against the binary
itself:

| Signal | Delta | Notes |
|---|---|---|
| `identity field(s) located in ident block (n/m)` | +5 per field, cap +10 | The extracted SW / HW / calibration strings really do sit inside a declared ident block |
| `cross-signal agreement (identity/checksum/arch)` | +10 | **`analyze` only** |
| `conflicting identity/checksum/arch signals` | -15 | adds the `⚠  SIGNAL CONFLICT` warning — **`analyze` only** |

The coherence pair needs a cross-check report that only `openremap analyze`
builds, so `identify`, `scan` and `health` never add or subtract these points.
A third coherence case — a stale checksum on a tuned file — changes no points
and only raises `⚠  CHECKSUM STALE (tuned file)`.

### Filename signals

These are the only signals that relate to file originality rather than
identification quality.  They flag filenames that suggest the binary may
have been modified or provide no identifying context.

| Signal | Delta |
|---|---|
| `tuning/modification keywords in filename` (`stage`, `remap`, `tuned`, `disable`, …) | -25 |
| `generic numbered filename` (`1.bin`, `42.bin`, …) | -15 |

Only one of the two applies: the tuning-keyword check runs first and, on a
match, the generic-filename check is skipped.

---

## Warnings

Warnings flag specific concerns, independent of the tier score:

| Warning | What it means |
|---|---|
| `⚠  IDENT BLOCK MISSING` | SW version absent for a family that always stores one — the ident block may be wiped or unreadable |
| `⚠  TUNING KEYWORDS IN FILENAME` | Filename contains words associated with modified files (`stage`, `remap`, `tuned`, `evc`, `disable`, …) |
| `⚠  GENERIC FILENAME` | Bare numbered filename (`1.bin`, `42.bin`) provides no identifying context |
| `⚠  SIGNAL CONFLICT` | Identity, checksum and disassembly disagree — **`analyze` only** |
| `⚠  CHECKSUM STALE (tuned file)` | The checksum does not match, which is expected on a modified file — **`analyze` only** |

---

## How the score is calculated

Each signal carries a positive or negative delta. The deltas are summed into a
raw numeric score, which is then mapped to a tier:

| Score range | Tier |
|---|---|
| ≥ 55 | HIGH |
| 25 – 54 | MEDIUM |
| 0 – 24 | LOW |
| < 0 | SUSPICIOUS |
| no extractor matched | UNKNOWN |

The raw score is available in JSON output (`openremap identify --json`) under
`confidence.score`, alongside the `tier` string and the full `signals` array —
each entry carrying its own `delta` and `label`. The terminal prints the tier
upper-case (`HIGH`); the JSON value is title-case (`"High"`).

---

## Family field profiles

An ECU family can declare a **field profile** — the set of identity fields that
the ECU architecturally stores in its binary. Fields not in the profile are
never penalized when absent.

For example, the IAW 1AP family only stores a calibration fingerprint. It does
not contain a discrete software version or hardware number in the binary. Under
the old scoring system this absence would have incurred penalties, dragging the
tier down unfairly. With field profiles, the absence of SW and HW for IAW 1AP
scores **0** instead of a penalty, allowing these families to reach their
natural tier based on the fields they *do* provide.

Families like Bosch EDC17 declare SW, HW, variant and calibration, so all four
are expected and scored accordingly. Bosch ME7 declares SW, HW and calibration
but **not** variant — a missing variant is never held against it. Siemens
EMS2000 declares an **empty** profile, so no field is ever expected from it and
none of the absence penalties apply.

A family with **no** profile registered is treated conservatively: every field
is assumed to be expected, so an absent SW is flagged rather than silently
ignored.

---

## Detection quality

The extractor's `can_handle()` varies in rigour across families. One that
checks magic bytes, block boundaries, address maps and internal checksums
collects many evidence tags; a shallow heuristic that only compares the file
size and one byte pattern collects few.

That difference is what the baseline measures — a tag sum, not a label:

- **Many structural tags** (a deep, multi-check cascade such as Multec S or
  IAW 1AV): reaches the +20 cap. A match is very likely correct.
- **Several mixed tags** (a family that checks size, a marker string and an
  ident block): lands in the +10–16 range. Solid but not exhaustive.
- **One or two soft tags** (a size match plus an exclusion check): +4 or less.
  Plausible, less certain.

The [Detection quality baseline](#detection-quality-baseline) above has the
per-tag weights, and its note explains the deprecated static
`detection_strength`.

---

## Manufacturer-aware scoring

The confidence system is **manufacturer-aware** — each manufacturer has its own
canonical software version pattern, and each ECU family declares its own field
profile. This ensures that all manufacturers can reach HIGH tier when their
binaries contain the expected identifiers.

### Canonical SW version formats by manufacturer

| Manufacturer | Canonical format | Examples |
|---|---|---|
| **Bosch** | Prefix `1037`, `1039`, `1267`, `1277`, `2227` or `2537`, then six digits | `1037374218`, `1267355678` |
| **Delphi** | 8-digit GM-style SW number | `12345678`, `09391237` |
| **Siemens** | 9-digit serial or `5WK9`-prefixed | `5WK91234A`, `123456789` |
| **Magneti Marelli** | Family-specific short formats | varies by ECU family |

> [!NOTE]
> The Bosch check is a prefix **plus six digits**: a suffix letter is not
> accepted, so a SW number such as `1039S65581` falls into the non-canonical
> bucket (+15) rather than the canonical one (+30). That is the current
> behaviour, not a typo in the table above.

Any SW version that matches its manufacturer's canonical format earns +30.
A SW version that is present but does not match the expected format earns +15.
This replaces the previous approach where only Bosch `1037`-prefixed versions
received the full canonical bonus and all other manufacturers were capped at
the non-canonical score.

---

## Using confidence in practice

```bash
# Full per-signal breakdown for a single file
openremap identify ecu.bin

# Confidence as JSON — score, tier, signals array, warnings
openremap identify ecu.bin --json

# Triage an entire folder — confidence tag on every line
openremap scan ./my_bins/

# Export confidence scores and warnings for every file to CSV
openremap scan ./my_bins/ --report report.csv
```

A `SUSPICIOUS` result is not a verdict — it is a prompt to look closer.
Run `openremap identify` on any flagged file for the full signal breakdown
before deciding whether to use it.

---

← [Back to CLI reference](../getting-started/cli.md)
