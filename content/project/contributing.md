---
title: Contributing to OpenRemap
description: How to contribute — the rules that apply to everything, the per-domain guides, and how to add an ECU family without sharing your dump.
tags: [contributing, development]
---
# Contributing to OpenRemap

First off, thank you for taking the time to contribute. This project is designed
from the ground up to be extended — especially by people who have hands-on
experience with ECU families that are not yet supported.

This page holds the rules that apply to **everything** you might contribute.
Each area of the code has its own conventions and its own review bar, so the
guides are split by domain — see [Ways to contribute](#ways-to-contribute).

> [!TIP]
> **Adding an ECU family? Start with the wizard, not the code.**
> `openremap contribute` measures your own dump for a byte pattern that is
> stable in that family and absent from every family already supported, then
> writes the fixture, an extractor skeleton, a test and a PR report. It never
> asks for your dump. See [contribute](../contribute/index.md).

---

## 🛡️ Contributor Safety Notice

**Please read this before contributing anything.** To keep OpenRemap sustainable, legally sound, and trustworthy as an open-source project, all contributors must follow these rules.

### No Binary Distribution

Never upload, attach, or link to ECU binary files (`.bin`, `.ori`, `.kp`, `.ols`) in pull requests, issues, or any other part of this repository. ECU firmware is proprietary intellectual property. Do not add any binary files to this repository.

### Original Heuristics Only

All extraction patterns, byte sequences, and regex logic you contribute must be the result of your own independent research or derived from publicly available documentation. Do not copy detection logic, offsets, or patterns from other tools without verifying they are openly licensed.

### No Reverse-Engineered Commercial Logic

Do not submit code, offsets, or algorithms that have been reverse-engineered from commercial or closed-source tuning software (WinOLS, ECM Titanium, Alientech, KESS, and similar). If you are unsure whether your source is acceptable, open an issue and ask before submitting.

### No Damos or A2L Derived Logic

Damos (`.dam`) and A2L files are proprietary Bosch calibration data formats that describe the exact memory layout, addresses, and scaling of ECU parameters. They are not publicly available and are covered by strict NDAs and licensing agreements.

All extraction patterns, byte offsets, and detection logic contributed to this project must be derived from **your own independent analysis of binary files** — not from Damos, A2L, or any other proprietary calibration data source. If anyone asks, and they may, your patterns came from staring at hex dumps, not from a calibration file someone emailed you.

This is not a technicality. Submitting logic derived from proprietary calibration data exposes both you and the project to serious intellectual property claims.

### Research Focus — No Emissions Delete Tools

This project is strictly for research and educational purposes. Pull requests that implement or enable the bypassing of emissions systems, DPF/EGR delete functionality, or any other modification that is illegal under environmental regulations will not be accepted.

### Independent Verification Reminder

Any output produced by this tool — recipes, patched binaries, or identification results — must be verified by a qualified professional and run through a standalone checksum corrector before being flashed to any vehicle. If your contribution changes patch behaviour or output format, update the documentation accordingly.

---

## Ways to contribute

| Type | Guide | Examples |
|---|---|---|
| **New ECU family** | [contribute](../contribute/index.md) → `contributing/extractors.md` | A family `identify` reports as `Unknown` |
| **Checksum profile** | `contributing/checksums.md` | A family whose stored checksum cannot be verified yet |
| **CPU / arch decoder** | `contributing/decoders.md` | A CPU capstone does not cover, or better coverage of one it does |
| **Map hunting / scoring** | `contributing/map-scoring.md` | Fewer false positives, better axis pairing, faster scans |
| **Instruction scanner** | `contributing/scanners.md` | A new advisory flag on changed instructions |
| **Tests** | `contributing/tests.md` | Coverage for any extractor or service — no ECU dump needed |
| **Bug fix** | — | A crash, a wrong identification, a validation logic error |
| **Documentation** | — | This wiki, the README, docstrings |

The per-domain guides live in the engine repository under `contributing/`;
`CONTRIBUTING.md` there is their index.

---

## Getting the project running locally

### Prerequisites

- Python 3.10+
- [uv](https://github.com/astral-sh/uv)
- git

### Steps

```bash
# 1. Fork the repository on GitHub, then clone your fork
git clone https://github.com/your-username/openremap-core.git
cd openremap-core

# 2. Install all dependencies
uv sync

# 3. Build the mandatory Rust extension
uv run --with maturin maturin develop --release

# 4. Run the test suite to confirm everything works
uv run pytest
```

That is all that is needed to work on the engine and CLI. No server, no
database, no environment file required.

`maturin` is a *build* tool, not a project dependency, which is why `--with
maturin` is there: it makes uv fetch it for the command without adding it to the
lockfile. **Rebuild the extension whenever you change anything under
`openremap/_rs/`** — otherwise you are testing the previous binary.

---

## Adding a new ECU family

This is the single most impactful contribution. The whole pipeline —
identification, scanning, recipes, validation, patching — is
manufacturer-agnostic, so teaching the engine one new family makes all of it
work for that family.

### Step 1 — measure, don't guess

```bash
openremap contribute extractor my_dump.bin --also my_second_dump.bin \
    --brand Acme --family AC3000 --write
```

Two dumps are how *stability* is actually proven; with one file the run can only
report what looks stable. The wizard writes the four files a PR needs and
prints the manual steps that remain — because **position is behaviour**: the
registry calls `can_handle()` in order and the **first** extractor that returns
`True` wins.

See [contribute](../contribute/index.md) for what it measures and why the
collision check needs a checkout.

### Step 2 — where an extractor lives

```
openremap/core/manufacturers/
├── base.py                      ← BaseManufacturerExtractor (ABC)
├── __init__.py                  ← BUILTIN_EXTRACTORS: the brand order
└── <brand>/
    ├── __init__.py              ← EXTRACTORS: the intra-brand order
    └── <family>/
        ├── __init__.py          ← empty
        ├── extractor.py         ← can_handle() + extract()
        └── patterns.py          ← regex patterns and search regions (recommended)
```

For example, a Siemens SID206 extractor lives at
`openremap/core/manufacturers/siemens/sid206/extractor.py`.

### Step 3 — implement it

```python
from openremap.core.manufacturers.base import BaseManufacturerExtractor
from openremap.core.manufacturers.base import FAMILY_STRING, SIZE_MATCH
from typing import Dict, List

class AcmeAC3000Extractor(BaseManufacturerExtractor):

    @property
    def name(self) -> str:
        return "Acme"

    @property
    def supported_families(self) -> List[str]:
        return ["AC3000"]

    def can_handle(self, data: bytes) -> bool:
        evidence: list[str] = []

        # Fast, bounded check only — this runs on every binary, for every extractor.
        if len(data) != 0x40000:
            self._set_evidence()          # a miss clears the evidence
            return False
        evidence.append(SIZE_MATCH)

        if b"AC3000" not in data[:0x10000]:
            self._set_evidence()
            return False
        evidence.append(FAMILY_STRING)

        self._set_evidence(evidence)      # a hit records *why*
        return True

    def extract(self, data: bytes, filename: str = "unknown.bin") -> Dict:
        ...   # see below
```

### Step 4 — the evidence-tag contract

The confidence scorer does not read a self-declared quality label. It reads the
**evidence tags** your `can_handle()` collected. Two rules, both enforced by the
review bar:

1. **On every `return True`**, call `self._set_evidence(evidence)` with the tags
   that justified the match.
2. **On every `return False`**, call `self._set_evidence()` with nothing — a
   rejected binary must not leave stale evidence behind.

The standard tags are module-level constants in
`openremap/core/manufacturers/base.py`: `SIZE_MATCH`, `MAGIC_MATCH`,
`HEADER_MATCH`, `POINTER_TABLE`, `LAYOUT_FINGERPRINT`, `BOOT_BLOCK`,
`IDENT_BLOCK`, `FAMILY_STRING`, `FAMILY_ANCHOR`, `DETECTION_SIGNATURE`,
`SYNC_MARKER`, `MANUFACTURER_CONFIRM`, `EXCLUSION_CLEAR`, `FILL_PATTERN`. You may
also emit free-form tags of your own for family-specific checks. Structural tags
are worth more than soft ones — see
[Confidence scoring](../concepts/confidence.md#detection-quality-baseline).

`detection_strength` still exists but is **deprecated**: it is only a fallback
for an extractor that has not been migrated.

### Step 5 — register it (the human decision)

If the brand already exists, add your extractor to
`openremap/core/manufacturers/<brand>/__init__.py` in the right position:

```python
EXTRACTORS = [
    ...,
    AcmeAC3000Extractor(),   # after X — it must not outrank the family it overlaps
]
```

If it is a **new brand**, you need three edits, in this order:

1. create `openremap/core/manufacturers/<brand>/__init__.py` with an `EXTRACTORS` list;
2. import the brand and unpack it into `BUILTIN_EXTRACTORS` in
   `openremap/core/manufacturers/__init__.py`;
3. only then add the extractor itself.

```python
# openremap/core/manufacturers/__init__.py
BUILTIN_EXTRACTORS: list[BaseManufacturerExtractor] = [
    *bosch.EXTRACTORS,
    *siemens.EXTRACTORS,
    *acme.EXTRACTORS,     # add your brand here
]
```

Leave a comment on the line explaining **why** that position — what it could
overlap. The reviewer will ask.

### Step 6 — verify

```bash
openremap contribute check openremap/core/manufacturers/acme/ac3000/extractor.py
uv run pytest tests/tuning/manufacturers/test_ac3000_extractor.py
```

`contribute check` is the same review bar a reviewer runs: it compiles, claims
its own fixture, steals no other family's, clears evidence on a miss, declares
the family it reports, and is reachable from the registry.

### Tips for a good `can_handle()`

- **Keep it fast.** It runs on every binary, for every registered extractor.
  Scan bounded regions (`data[:0x10000]`) rather than the whole file.
- **Be exclusive, not just inclusive.** If your family shares a signature with
  another, add explicit guards. The wizard harvests them for you from the
  colliding family's own ident token.
- **File size is a strong discriminator.** Many older families have a fixed
  size (32 KB, 64 KB, 256 KB…). Use it as a cheap pre-filter — but check whether
  the extractor you are copying actually has a size gate before you claim one.

### Tips for a good `extract()`

- **Extract `software_version` if at all possible** — it is the primary
  component of the match key.
- **Use `_run_all_patterns()` and `_search()` from the base class.** They handle
  region slicing, regex iteration, error suppression and deduplication.
- **Use `build_match_key()`.** Do not build the key string by hand: the base
  method normalises whitespace and handles the `ecu_variant` vs `ecu_family`
  priority.
- **Keep patterns in `patterns.py`** so the logic stays readable and the
  patterns can be updated independently.

---

## Other contributions

### Fixing an existing extractor

If a family is identified incorrectly (wrong family, wrong software version,
wrong match key), open an issue first describing the file — its size, and any
readable ASCII strings near the offset 0. That is usually enough to diagnose the
problem without the binary itself.

### Writing tests

Tests live under `tests/`, and the extractor ones are flat files:

```
tests/tuning/manufacturers/
├── test_edc17_extractor.py
├── test_sid801_extractor.py
└── test_declared_families.py     ← bookkeeping: every declared family is reportable
```

You do not need an ECU dump to write one. Generate a fixture instead:

```bash
uv run openremap synth --output demo.bin --maps 4
```

Or ask the wizard for the extracted fixture recipe — the 89-file mimic corpus in
`_dev/contrib/` exists exactly so detection can be tested without real ROMs. See
[`synth`](../synth/index.md).

Run the suite with:

```bash
uv run pytest
```

---

## Code style

- **Python 3.10+ type hints everywhere.** Use `str | None` rather than `Optional[str]` for new code.
- **Docstrings on all public methods.** Follow the style already present in `base.py` and the validator services — short summary line, then `Args:` / `Returns:` blocks where the function is non-trivial.
- **No bare `except`.** Catch specific exceptions or use `except Exception` with a comment explaining why.
- **No abbreviations in variable names** unless they are universally understood in the domain (`ob`, `mb`, `ctx`, `ecu`, `sw`).
- **Hex strings are always uppercase.** Use `.hex().upper()` and uppercase literals (`"AABBCCDD"`, not `"aabbccdd"`).

---

## Submitting a pull request

1. **Fork** the repository and create a branch from `main`:
   ```bash
   git checkout -b feat/acme-ac3000-extractor
   ```

2. **Make your changes.** Keep each PR focused on one thing — one extractor, one
   bug fix, one feature. Mixed PRs are harder to review and slower to merge.

3. **Test your changes** — an automated test, or a manual run against at least
   one real file of the target family.

4. **Use the pull request template.** It carries the review bar this repository
   already applies to itself: the registry position and why, evidence cleared on
   every `False`, the fixture recipe included and the corpus in sync, and a
   **Not verified** section saying what you could not check.

5. **Open the PR** against the `main` branch.

For an extractor PR, this should be green before you push:

```bash
openremap contribute check openremap/core/manufacturers/acme/ac3000/extractor.py
```

---

## Reporting a bug or a wrong identification

Open a GitHub issue with the command you ran, the output you got, what you
expected, and the file size — **do not attach the binary** (see below).

The issue forms ask for exactly that:

| Form | Use it for |
|---|---|
| **Bug report** | A crash, a wrong result, a regression — including which *kind* of file was involved, with an explicit "describe it, do not attach it" option for real-car dumps |
| **New ECU family request** | "Please support my ECU" — it asks for the output of `openremap contribute extractor --measure-only`, the vehicle, and how many dumps you have |

That one command is all a family request needs at first: it works from a plain
install, needs no checkout and no family name, and tells the maintainer what the
engine currently makes of your file.

---

## A note on ECU binary files

**Do not attach ECU binary files to issues or pull requests.**

ECU firmware is proprietary. The binaries contain intellectual property belonging to the ECU manufacturer (Bosch, Siemens, Delphi, etc.) and potentially the vehicle OEM. Distributing them publicly — even for debugging — is legally risky for you and for this project.

If you need to share a binary to reproduce a bug, do so privately (e.g. via a direct message to a maintainer) and only after confirming you are the legal owner of the data.

There are no binary files in this repository. Most tests use synthetic in-memory
data from the helpers in `tests/conftest.py`; a few behavioural tests
additionally use real dumps when a local (git-ignored) `tests/data/` corpus is
present, and skip cleanly when it is not.

No ECU dump of your own? Generate one — it needs no ECU data at all:

```bash
uv run openremap synth --output demo.bin --size 262144 --maps 6 --seed 42
```

Generated files are deterministic (same settings and seed ⇒ same bytes), so they
are safe to commit and to attach to an issue. They carry no manufacturer
fingerprints, so `identify` reports `Unknown` for them — by design.
