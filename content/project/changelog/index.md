---
title: Release notes
description: What's new in recent OpenRemap releases, in user terms, with links to the docs that explain each feature — the full history lives on GitHub.
---

# Release notes

What changed in the recent releases, explained for users — each item links
to the docs page that covers it. The complete, technical history lives in
the repository: [CHANGELOG.md on GitHub](https://github.com/v-arapidis/openremap-core/blob/main/CHANGELOG.md).

## 0.9.0 — 2026-10-24

**The apply engine and TUI release.** The largest change since the project began:
applying a recipe was rebuilt around an explicit identity policy, the recipe file
moved to schema 5.0, and the terminal app was rewritten screen by screen.

- **Applying became a ladder of four commands**, from strictest to loosest:
  [`tune-strict`](/cli/apply#tune-strict) → `tune-shift` → `tune-unique` →
  `tune-any`. There is no `--force` and no `--skip-validation` anywhere — the
  command you pick *is* the policy, so a looser rung can never be reached by
  accident. The old `tune` command was deleted only after 47 real tune pairs proved
  the new engine produced byte-identical output.
- **Making a recipe became two commands**: [`cook-strict`](/cli/cook#cook-strict)
  (its result applies to any dump of the family) and `cook-forced` (when a change
  sits in repeated bytes, so it needs the same firmware). `cook` and
  `cook-volatile` are gone.
- **[Schema 5.0](/recipe/schema) recipes** — the format now declares what it
  requires in a checked `contract` instead of the overloaded 4.x "portability"
  stamp. Old 4.x recipes are still readable by `audit` and `merge`, and refused for
  application with a clear message pointing at the new producers.
- **[The TUI](/tui) was rebuilt from scratch** — eleven screens on the API
  gate instead of one 2 625-line module. See [why that matters](/tui).
- **The native engine no longer freezes the process.** Every Rust call now releases
  the GIL for its duration: a 4 MB scan holds the process for **46 ms instead of
  6.4 s**. Same work, same time, responsive application.
- **[`recipe-info`](/cli/cook#recipe-info) and [`map-image`](/cli/maps#map-image)**
  — read a recipe without applying it, and draw a table as a real SVG picture.
- **Every apply says what it does not do**: the checksum verdict on the output
  (`ok` / `fail` / `skip`) and a standing disclaimer. Nothing in this engine rewrites
  a checksum, ever.
- **Console output is UTF-8 by default** (Windows redirected output used to die on
  the first em dash), and the TUI's file picker lists drives on Windows.

> [!NOTE]
> **There is no 0.8.x, on purpose.** That line was going to relocate a calibration
> between different firmware revisions. It was dropped: doing that safely needs a
> professional tuner validating every result, and without one the output would be
> dangerous by default. A roadmap entry is not worth a destroyed engine.

## 0.7.7 — 2026-10-17

- **New [`synth`](/cli/batch-and-fixtures#synth) command** — build an ECU-*like* binary
  from scratch, with no ECU file involved. It is deterministic (same settings
  and seed → byte-identical file), so it works as a demo, a test fixture, or a
  reproducible case in a bug report. Generated files identify as `Unknown` by
  design: they carry no manufacturer fingerprints.
- **New [`contribute`](/cli/contribute) command — the contribution
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
  gearbox). See the [ME7.9.x](/architecture/manufacturers/bosch/me79) and
  [GS20](/architecture/manufacturers/siemens/gs20) pages.
- **`analyze --xref-mode v2`** — an opt-in, stricter code-reference mode
  (a table earns the confirmation bonus only when it is already
  high-confidence *and* referenced by code).
- **Fixes to VAG part-number detection** across the EDC15/16/17/3.x
  extractors.
- **Docs:** Denso family labels corrected to the real CPUs, and the
  decoder-coverage picture updated (see [Decoders](/architecture/decoders)).

## 0.7.5 — 2026-08-30

- **New [`routine`](/cli/convert-and-routine#routine) command** — read a code routine as
  readable pseudo-code, no Ghidra needed.
- **Much wider CPU coverage for the code-reference signal**: the decoder
  census now maps 31 of 38 families, adding Rust decoders for the
  8051/MCS-51 and MCS-96 families that had none before
  (see [Decoders](/architecture/decoders)).
- Every family's CPU was audited, so it is clear what is covered and what
  still needs work.
- Security: the Rust↔Python bridge (PyO3) was upgraded to close two
  vulnerability advisories.

## 0.7.4 — 2026-08-28

- The documentation release: the wiki and README brought in line with the
  0.7.3 decoder work (new [Decoders](/architecture/decoders) page, MS43
  promoted to a full extractor entry, corrected extractor counts).
- No runtime-code changes.
