---
title: Extractors
description: >-
  How OpenRemap recognises an ECU family — the extractor registry, the base
  class contract, evidence tags, match keys and the confidence scorer that ranks
  competing claims.
tags: [architecture, internals, extractor]
status: stable
---

# Extractors

An **extractor** is the only piece of code that knows one ECU family. It answers
two questions and nothing else: *does this binary belong to my family?* and *what
identity does it carry?*

38 extractors cover 6 manufacturers: Bosch 19, Siemens 8, Magneti Marelli 4,
Denso 4, Delphi 2, Hitachi 1.

## The registry

`openremap/core/manufacturers/__init__.py` builds one flat list:

```python
BUILTIN_EXTRACTORS: list[BaseManufacturerExtractor] = [
    *bosch.EXTRACTORS,
    *siemens.EXTRACTORS,
    *delphi.EXTRACTORS,
    *marelli.EXTRACTORS,
    *denso.EXTRACTORS,
    *hitachi.EXTRACTORS,
]

def get_extractors() -> list[BaseManufacturerExtractor]:
    return BUILTIN_EXTRACTORS
```

Each OEM package owns an **ordered** `EXTRACTORS` list. Order matters: within a
family group the more specific extractor comes first, so a general pattern cannot
claim a binary that a precise one recognises. Adding support for a new family is
adding a module and one line to that list — no central registry to edit, no
`if family ==` anywhere.

## The contract — `BaseManufacturerExtractor`

An extractor implements two abstract methods and inherits everything else:

| Member | Kind | What it does |
|---|---|---|
| `name` | property (abstract) | the human-readable manufacturer, e.g. `"Bosch"` |
| `supported_families` | property | the family strings this extractor can produce |
| `can_handle(data) -> bool` | abstract | does this binary belong to me? also records *evidence* |
| `extract(data, filename) -> dict` | abstract | the identity fields, as a dict |
| `build_match_key(...)` | base class | builds `VARIANT::IDENTIFIER` from the extracted fields |
| `_set_evidence(tags)` / `last_detection_evidence` | base class | how `can_handle()` records *why* it matched |
| `_run_all_patterns`, `_search`, `_first_hit`, `extract_raw_strings` | base class | the byte-searching helpers every extractor uses |

The two-method split is deliberate: `can_handle()` must be cheap enough to run
against every binary, and `extract()` only runs for the extractor that claimed the
file.

## Evidence, not a strength rating

Older extractors declared a static `DetectionStrength` — `STRONG`, `MODERATE` or
`WEAK`. That field is **deprecated**: a hand-assigned word is an opinion, and it
cannot be checked. Extractors now append *evidence tags* during detection, and the
confidence scorer turns the tag set into a bonus.

Standard tags, from `base.py`:

| Category | Tags |
|---|---|
| Structural | `SIZE_MATCH`, `MAGIC_MATCH`, `HEADER_MATCH`, `POINTER_TABLE`, `LAYOUT_FINGERPRINT`, `BOOT_BLOCK` |
| Identity | `FAMILY_STRING`, `DETECTION_SIGNATURE`, `IDENT_BLOCK`, `FAMILY_ANCHOR` |
| Cross-check | `EXCLUSION_CLEAR`, `FILL_PATTERN`, `SYNC_MARKER`, `MANUFACTURER_CONFIRM` |

The pattern is uniform:

```python
def can_handle(self, data: bytes) -> bool:
    evidence: list[str] = []
    if len(data) == 0x400000:
        evidence.append(SIZE_MATCH)
    if b"MAG" in data[:0x200]:
        evidence.append(MANUFACTURER_CONFIRM)
    ...
    self._set_evidence(evidence)
    return True
```

Every `return False` path calls `self._set_evidence()` with nothing, so a stale
tag list can never survive a failed detection. Extractors that have not been
upgraded yet return an empty tuple, and the scorer falls back to the old static
value — that is the migration path, not a separate mode.

## Match keys

A match key is the identity of a **software version**, not of a car:

```
VARIANT::IDENTIFIER        EDC17C66::1037541778126241V0
```

`build_match_key()` composes it from `ecu_variant` and the software version, with
one documented escape hatch: `match_key_fallback_field`. Some architectures never
store a software version (Bosch LH-Jetronic Format A is the example) — such an
extractor names another extracted field to use as the identifier. Software version
always wins when present; the fallback is only consulted when it is absent and
non-empty.

Why it matters: the apply ladder's `Γ2` check is a match-key comparison. A match
key built from a truncated string can never match, which is why 0.9.0 fixed the
Bosch software-version pattern that read `1037541778126241V0` as
`10375417781262`.

## The identification pipeline

| Step | Module | What happens |
|---|---|---|
| 1 | `services/identify/identify_binary.py` | `identify_binary(data, filename, container)` — the entry point every consumer calls |
| 2 | `manufacturers/scan.py` | runs every extractor's `can_handle()` and keeps the claims |
| 3 | `services/identify/identifier.py` | `identify_ecu()` — asks the winner for `extract()`, builds the identity dict (`_to_identity`, or `_unknown_identity` when nobody claims the file) |
| 4 | `services/identify/confidence.py` | `score_identity()` — tiers the result from signals |
| 5 | `services/coherence.py` | cross-checks identity against checksums and code references: `agree` / `gap` / `conflict` |

When two extractors claim the same file, the batch scan calls it **contested**
rather than silently picking one — the classification vocabulary is `scanned`
(identified with a software version), `sw_missing` (family recognised, version
absent), `contested`, `unknown`, and unreadable.

## Confidence scoring

`score_identity()` returns a `ConfidenceResult` with a tier and the
`ConfidenceSignal` list that produced it. Signals are additive and each one is
printable, which is why the CLI can show this:

```
  Tier   MEDIUM
  Signal  +  detection evidence (2 tags: EXCLUSION_CLEAR, DETECTION_SIGNATURE)
  Signal  +  canonical SW version
  Signal  +  ECU variant identified (EDC17C66)
```

The scorer awards the evidence bonus from the tag set, a canonical-software-version
bonus per family profile, and ident-block cross-checks; it subtracts for
contradictions. Tiers map from the total: `HIGH`, `MEDIUM`, `LOW`, `SUSPICIOUS`,
`UNKNOWN`. Details of the tier semantics are on
[confidence scoring](/architecture/extractors).

## Writing one

The contributor path is automated — `openremap contribute extractor` measures your
own dumps for a marker that is stable in your family and absent from every family
already supported, then writes the fixture, an extractor skeleton, a test and a PR
description. What travels is the *pattern*, never a measured value: a literal value
copied into `can_handle()` would match exactly one calibration.

See [contribute](/cli/contribute) for the workflow, and
[contributing](../project/contributing.md) for the review bar.
