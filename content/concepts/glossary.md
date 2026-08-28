---
title: Glossary
description: >-
  A quick-reference glossary of OpenRemap terms — ECU, recipe, map, extractor,
  checksum, VIN, confidence, decoder, and the rest of the pipeline vocabulary.
tags: [concept, glossary]
---

# Glossary

The vocabulary of OpenRemap and ECU tuning, defined once and linked to the
pages that go deeper.

## Core concepts

**ECU (Engine Control Unit)** — the computer that runs the engine. Its firmware
is what OpenRemap reads, identifies, and patches. See [How it works](how-it-works.md).

**Binary / firmware image** — the raw flash contents of an ECU, usually a
`.bin`, `.ori`, or Intel HEX / S-Record file. See [Setup](../getting-started/setup.md).

**Recipe (`.remap`)** — a portable JSON file describing every byte-level change
between an original and a tuned binary. The central data structure of the whole
pipeline. See [Recipe format](recipe-format.md).

**Map** — a calibration table (or its axis) inside the firmware — fuel, boost,
ignition timing, and so on. See [How it works](how-it-works.md) and
[`scan-maps`](../commands/scan-maps/index.md).

**Extractor** — code that recognises a specific manufacturer family and pulls
identity fields (software version, hardware number, calibration ID) out of a
binary. See [Manufacturers](../manufacturers/index.md).

**Family** — a manufacturer's ECU platform (e.g. Bosch ME7, Siemens MS43). The
registry behind [`identify`](../commands/identify/index.md) and
[`families`](../commands/families/index.md).

## Detection & safety

**Checksum** — a stored validation value that must match the block it protects.
[`checksum`](../commands/checksum/index.md) verifies schemes (no correction);
[`health`](../commands/health/index.md) flags mismatches.

**VIN (Vehicle Identification Number)** — the car's 17-character identifier,
often stored in the firmware. [`scan-vins`](../commands/scan-vins/index.md)
locates and scores candidates.

**Volatile bytes** — firmware locations that legitimately differ per vehicle
(VIN, checksum stores, immobiliser data). [`cook-volatile`](../commands/cook-volatile/index.md)
excludes them to make a recipe car-portable.

**Confidence** — how reliably OpenRemap identified a binary, expressed as a tier
built from signals and warnings. See [Confidence scoring](confidence.md).

**Evidence** — the detection tags, signals, labels, and provenance that explain
*why* OpenRemap reached a result. See [Evidence](evidence.md).

**Decoder** — a CPU instruction-set decoder used to cross-reference code and
confirm or detect a family. See [Decoders](decoders.md).

## The pipeline

**Identify** — read one binary and report manufacturer, family, software,
hardware, and confidence. [`identify`](../commands/identify/index.md)

**Cook** — diff stock vs tuned into a portable recipe. [`cook`](../commands/cook/index.md)

**Tune** — apply (and re-verify) a recipe to a target binary, one shot.
[`tune`](../commands/tune/index.md)

**Merge** — combine two recipes against a common stock binary.
[`merge`](../commands/merge/index.md)

**Validate** — the individual before / check / after steps.
[`validate`](../commands/validate/index.md)

**Audit** — the receipt check that stock, tuned, and recipe belong together.
[`audit`](../commands/audit/index.md)

**Analyze** — one pass that describes a whole binary: identity, VIN, layout,
maps, code references, checksums, and a health verdict.
[`analyze`](../commands/analyze/index.md)

See the [commands overview](../commands/index.md) for the full table.
