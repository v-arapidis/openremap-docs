---
title: Contribute
description: >-
  Add support for an ECU the tool does not recognise — by measuring your own dumps,
  which never leave your machine.
tags: [cli]
status: stable
---

# Contribute

If your ECU comes out as `Unknown`, you can add it. The wizard measures **your own
files** and writes what a developer needs — your binary is never uploaded or shared.

## `contribute extractor`

**What it is:** reads one or more of your dumps, finds byte patterns that are stable
across them, and (with `--write`) generates the files a pull request needs.

Start with a look — no repository, no family name, nothing written:

```bash
openremap contribute extractor dump_a.bin dump_b.bin --measure-only
```

```
  MEASUREMENT ONLY — no collision check, no marker recommended, nothing written.

  GS20_90C0_64KB.bin             65,536 bytes   claimed by openremap…siemens.gs20.extractor
      identify: Siemens GS20 · strong · sw=7557997
  GS20_90C0_64KB_mod_tcc.bin     65,536 bytes   claimed by openremap…siemens.gs20.extractor
      identify: Siemens GS20 · strong · sw=7557997

  What your dumps can prove  ONE calibration
      Every dump identifies as the same calibration (GS20::7557997).
      What is stable across them may be that calibration's version string rather than
      the family's signature — bring a dump from a different year/model to prove it.

  note: an extractor already claims this dump — the engine knows this family.

  Runs stable across your dumps (unranked — not checked for collisions)
     104  'G2210_0090C0AD10G2210_0090C0AD10G2210_0090C0AD10'
     104  'N{4{4{4{4{4{4{4R8fF33333333333333'
     100  'B30E46ECE.C6TDGADC89_J'
```

Notice what it says about the two files above: they are **one calibration**, and an
extractor already knows this family. Two dumps of one calibration cannot prove a
pattern is family-wide — that is why the verdict line exists.

Then, from a checkout with the family name:

```bash
openremap contribute extractor dump_a.bin dump_b.bin \
    --brand X --family Y --write
```

That writes four artifacts: an extractor, a test, a report, and a **synthetic
fixture** carrying only the marker — never your dump.

## `contribute check`

**What it is:** runs the review bar over an extractor somebody wrote, and says
whether it still passes.

```bash
openremap contribute check path/to/extractor.py
```

Useful before opening a pull request, and after changing an extractor that is
already merged.

## What travels, and what does not

| Travelled | Never travelled |
|---|---|
| a short byte pattern (the marker) | your dump |
| which identity fields were measured | your VIN or serial numbers |
| a synthetic fixture built from the marker | anything from the file that is not the marker |

## Where to go next

| You want to… | Go to |
|---|---|
| understand what an extractor is | [Extractors](../architecture/extractors.md) |
| read the contributor guide | [Contributing](../project/contributing.md) |
| do the same thing with keys | [CONTRIBUTE screen](../tui/contribute.md) |
