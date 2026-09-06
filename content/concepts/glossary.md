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
[`scan-maps`](../scan-maps/index.md).

**Extractor** — code that recognises a specific manufacturer family and pulls
identity fields (software version, hardware number, calibration ID) out of a
binary. See [Manufacturers](../manufacturers/index.md).

**Family** — a manufacturer's ECU platform (e.g. Bosch ME7, Siemens MS43). The
registry behind [`identify`](../identify/index.md) and
[`families`](../getting-started/families.md).

## Detection & safety

**Checksum** — a stored validation value that must match the block it protects.
[`checksum`](../checksum/index.md) verifies schemes (no correction);
[`health`](../health/index.md) flags mismatches.

**VIN (Vehicle Identification Number)** — the car's 17-character identifier,
often stored in the firmware. [`scan-vins`](../scan-vins/index.md)
locates and scores candidates.

**Volatile bytes** — firmware locations that legitimately differ per vehicle
(VIN, checksum stores, immobiliser data). [`cook-volatile`](../cook-volatile/index.md)
excludes them to make a recipe car-portable.

**Confidence** — how reliably OpenRemap identified a binary, expressed as a tier
built from signals and warnings. See [Confidence scoring](confidence.md).

**Evidence** — the detection tags, signals, labels, and provenance that explain
*why* OpenRemap reached a result. See [Evidence](evidence.md).

**Decoder** — a CPU instruction-set decoder used to cross-reference code and
confirm or detect a family. See [Decoders](decoders.md).

## The pipeline

**Identify** — read one binary and report manufacturer, family, software,
hardware, and confidence. [`identify`](../identify/index.md)

**Cook** — diff stock vs tuned into a portable recipe. [`cook`](../cook/index.md)

**Tune** — apply (and re-verify) a recipe to a target binary, one shot.
[`tune`](../tune/index.md)

**Merge** — combine two recipes against a common stock binary.
[`merge`](../merge/index.md)

**Validate** — the individual before / check / after steps.
[`validate`](../validate/index.md)

**Audit** — the receipt check that stock, tuned, and recipe belong together.
[`audit`](../audit/index.md)

**Analyze** — one pass that describes a whole binary: identity, VIN, layout,
maps, code references, checksums, and a health verdict.
[`analyze`](../analyze/index.md)

The full list of every command lives in the
[CLI reference](../getting-started/cli.md).
