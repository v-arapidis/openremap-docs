---
title: Release notes
description: What's new in recent OpenRemap releases, in user terms, with links to the docs that explain each feature — the full history lives on GitHub.
---

# Release notes

What changed in the recent releases, explained for users — each item links
to the docs page that covers it. The complete, technical history lives in
the repository: [CHANGELOG.md on GitHub](https://github.com/v-arapidis/openremap-core/blob/main/CHANGELOG.md).

## 0.7.7 — 2026-10-17

- **New [`synth`](../../synth/index.md) command** — build an ECU-*like* binary
  from scratch, with no ECU file involved. It is deterministic (same settings
  and seed → byte-identical file), so it works as a demo, a test fixture, or a
  reproducible case in a bug report. Generated files identify as `Unknown` by
  design: they carry no manufacturer fingerprints.
- **New [`contribute`](../../contribute/index.md) command — the contribution
  wizard.** Own a dump of an ECU family the engine does not recognise? It
  measures your dump for a byte pattern that is stable in that family and absent
  from every family already supported, then (with `--write`) writes the fixture,
  an extractor skeleton, a test and a PR report. **Your dump never leaves your
  machine** — only a few hundred bytes of fixture recipe travel. `--measure-only`
  gives a first look that needs neither a clone nor the family name.
- **Fixtures instead of ROMs** — an 89-file mimic corpus (`_dev/contrib/`) that
  the wizard checks candidate signatures against, and a golden corpus
  (`tests/corpus/`) built on synthetic dumps that runs in CI with no ECU data.
- **Correctness fixes**, two of which change results on real binaries:
  the VAG part-number scan no longer stops at an all-digit lookalike (some
  EDC15/16/17/EDC3.x dumps now report the part number they always had), and the
  cached two-stage map scan no longer returns a previous call's tables when the
  thresholds change.
- **HEX / S-Record input** now decodes in the two-stage map scan, as it already
  did everywhere else, and `list_methods` honours its `kind` filter.

## 0.7.6 — 2026-09-06

- **Two new ECU families** gained full support: Bosch **ME7.9.x** (ME7.9.10,
  Fiat/Alfa/Lancia 1.4 T-Jet + PSA) and Siemens **GS20** (BMW automatic
  gearbox). See the [ME7.9.x](../../manufacturers/bosch/me79.md) and
  [GS20](../../manufacturers/siemens/gs20.md) pages.
- **`analyze --xref-mode v2`** — an opt-in, stricter code-reference mode
  (a table earns the confirmation bonus only when it is already
  high-confidence *and* referenced by code).
- **Fixes to VAG part-number detection** across the EDC15/16/17/3.x
  extractors.
- **Docs:** Denso family labels corrected to the real CPUs, and the
  decoder-coverage picture updated (see [Decoders](../../concepts/decoders.md)).

## 0.7.5 — 2026-08-30

- **New [`routine`](../../routine/index.md) command** — read a code routine as
  readable pseudo-code, no Ghidra needed.
- **Much wider CPU coverage for the code-reference signal**: the decoder
  census now maps 31 of 38 families, adding Rust decoders for the
  8051/MCS-51 and MCS-96 families that had none before
  (see [Decoders](../../concepts/decoders.md)).
- Every family's CPU was audited, so it is clear what is covered and what
  still needs work.
- Security: the Rust↔Python bridge (PyO3) was upgraded to close two
  vulnerability advisories.

## 0.7.4 — 2026-08-28

- The documentation release: the wiki and README brought in line with the
  0.7.3 decoder work (new [Decoders](../../concepts/decoders.md) page, MS43
  promoted to a full extractor entry, corrected extractor counts).
- No runtime-code changes.
