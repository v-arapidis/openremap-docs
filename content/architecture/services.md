---
title: Services
description: >-
  The engine's service modules — identification, maps, checksums, recipes and
  apply, the contribution wizard, and the analysis passes that join them.
tags: [architecture, internals, engine]
status: stable
---

# Services

`openremap/core/services/` is the engine proper: five domains, each a package, plus
a handful of single-purpose passes. Every one of them takes bytes (or a path, at
its own boundary) and returns a dictionary — no printing, no terminal, no policy
that belongs to a UI.

## Identification — `services/identify/`

| Module | Role |
|---|---|
| `identify_binary.py` | `identify_binary(data, filename, container)` — the entry point everything calls |
| `identifier.py` | `identify_ecu()` and the identity dict; `_to_identity` / `_unknown_identity` |
| `confidence.py` | `score_identity()` → tier + signals (`ConfidenceResult`, `ConfidenceSignal`) |
| `vin_scanner.py` | finds 17-character VIN *candidates* and scores them |
| `vin_report.py` | the VIN section of a report |

Identity is the foundation of every other domain: the recipe's `identity_floor`, the
apply ladder's `Γ2` check and the health verdict all read it. That is why
`identify_binary` is the most-called function in the package and why its result
shape is stable.

## Maps — `services/maps/`

| Module | Role |
|---|---|
| `scan_maps.py` | one-shot scan, the CLI-shaped entry point |
| `map_hunter.py` | the two-stage scan (axes, then tables), native-backed |
| `layout.py` | flash segmentation: code / calibration / erased / mixed / ident |
| `diff_maps.py` | match two dumps' tables by axis fingerprint and diff cells |
| `map_classifier.py` | probabilistic content labels (never a claim) |
| `map_exporter.py` | CSV rendering |
| `map_svg.py` | the SVG renderer behind `map-image` |
| `table_grid.py` | one table as a grid of values (`map_grid` method) |
| `xrefs.py`, `xrefs_v2.py` | code references [see decoders](decoders.md) |

Two rules shape this domain. **The scan is structural** — no family knowledge is
needed, which is how maps are found in an unsupported ECU. And **a label is
probabilistic**: `label: duration, label_confidence: 0.64` says what the classifier
thinks, not what the table is.

## Checksums — `services/checksums/`

| Module | Role |
|---|---|
| `checksum.py` | scheme detection across the known families |
| `ironfelix.py`, `nefmoto.py`, `ms43.py`, `denso.py` | one scheme per module |
| `report.py` | the `ok` / `fail` / `skip` verdict shape |

**Nothing here writes a checksum.** The modules verify and report; correction is
explicitly out of scope, and that is enforced by there being no such function.
`health.check_checksums` (public since 0.9.0) is the one-pass detector the apply
engine asks about the file it just wrote — 22–62 ms on a 4 MB dump.

The tri-state verdict is the honest part: `skip` means *no known scheme for this
family*, which is different from `ok`. Bosch EDC17 is the standing example — on the
real EDC17C66 pair, zero schemes verify across the whole sweep and no family
detector recognises the file, so the answer is `skip`, and it is never presented as
a pass.

## Recipes — `services/recipes/`

The largest domain, and the one with the most structure. It is split by direction:

```
recipes/
├── recipe_builder.py     stock + tuned  →  diff blocks
├── annotator.py          flags: CODE_AREA, WEAK_ANCHOR, LOW_ENTROPY_CTX, VIN_SUSPECT
├── recipe_regions.py     which flash region each change sits in
├── recipe_maps.py        which tables each change touches
├── patcher.py            writes a change at a resolved position
├── validate.py           the shared check primitives
├── validate_strict.py    ECUStrictValidator
├── validate_exists.py    ECUCheckExistsValidator
├── validate_patched.py   ECUPatchedValidator
├── preflight.py          the pre-apply gate
├── audit.py              the three-way receipt check
├── recipe_merge.py       two recipes into one
├── recipe_facts.py       provenance, source-first with a 4.x fallback
├── recipe_info.py        read a recipe without applying it
├── volatile.py           the legacy 4.5 volatile classifier (audit still reads 4.x)
├── produce/              build a schema-5.0 recipe  (builder, contract, modes, report)
└── apply/                consume one                  (contract, policy, engine, report)
```

Two structural facts matter more than the file list:

1. **The producers and the consumers are separate packages.** `produce/` writes
   5.0 and verifies its own output against the apply-side reader before writing the
   file. `apply/` reads 5.0 only, and refuses anything else with rule `A2`. They
   share `contract.py`-shaped knowledge, not code, which is why a producer bug
   cannot quietly loosen a consumer check.
2. **The apply engine composes the existing primitives.** `apply/engine.py` runs
   `ECUStrictValidator` → `ECUPatcher` → `ECUPatchedValidator` rather than
   reimplementing byte checks. The ladder's four rungs are four `Rules` objects —
   `identity`, `exact_bytes`, `zero_shift`, `ambiguity_blocks`, `accounting` — over
   *one* pipeline:

   | Rung | identity | exact bytes (`Γ4`) | zero shift (`Γ7`) | ambiguity blocks (`Γ8`) |
   |---|---|---|---|---|
   | `tune-strict` | firmware | yes | yes | no |
   | `tune-shift` | firmware | no | no | **yes** |
   | `tune-unique` | any | yes | yes | no |
   | `tune-any` | any | no | no | no |

   A new rung would be a new `Rules` object, not a new engine.

## The wizard — `services/wizard/`

| Module | Role |
|---|---|
| `plan.py` | what the measurement will do, decided up front |
| `fields.py` | which identity fields the dumps can decide |
| `signatures.py` | candidate stable byte runs, with `repeated_motif()` guarding against a pattern made of padding |
| `collisions.py` | does the candidate marker appear in any known family's fixture? |
| `fixtures.py` | the synthetic fixture that will be committed |
| `emit.py` | renders the extractor, test and report |
| `verify.py` | executes the generated extractor against the fixture corpus |
| `check.py`, `report.py` | the review bar and the PR description |

The wizard is the only place where code is generated, and it is the only place
where that is allowed to happen — the review bar in `check.py` is executed against
the rendered source before the wizard calls it verified.

## The single-purpose passes

| Module | What it answers |
|---|---|
| `analyze.py` | the whole picture in one pass: container, identity, VIN, layout, maps, checksums, health |
| `health.py` | six checks, one verdict; `check_checksums` is the reusable detector |
| `coherence.py` | do identity, checksums and code references agree? `agree` / `gap` / `conflict` |
| `convert.py` | Intel HEX / S-Record → flat bytes (content sniffed) |
| `entropy.py` | entropy windows, used for scoring and for `LOW_ENTROPY_CTX` |
| `vin_decode.py` | VIN check-digit and WMI decoding |
| `scan_organize.py` | which files a scan covers, what must not be re-scanned, where a file would be filed, the copy/move itself |

`scan_organize.py` is worth singling out: those rules used to live in
`cli/commands/scan.py`, which meant the TUI could not share them. Moving them into
a service is what made the BATCH screen and `openremap scan` give the same answer.

## Synth — `core/synth/`

`generator.py` writes a deterministic ECU-*like* binary: configurable size, sector
layout kind, planted maps, seed. It carries no manufacturer data, so its output
identifies as `Unknown` by design — which makes it safe to commit as a fixture and
useful as a demonstration.

The golden corpus in `tests/corpus/` is built on it, which is why CI can run map,
layout and recipe tests without an ECU dump anywhere in the repository.
