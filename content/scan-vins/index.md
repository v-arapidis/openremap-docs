---
title: scan-vins
description: Find car ID numbers (VINs) inside an ECU file, and score how believable each one is.
tags: [scan-vins, cli]
status: stable
---

# scan-vins

A **VIN** is a car's 17-character ID number — and many ECUs store it in
their memory. `scan-vins` hunts through a file for VIN-shaped strings and
scores each one, so you can tell a real VIN from random noise.

ECU files are full of strings that *look* like VINs (part numbers,
serials, calibration IDs). So `scan-vins` never just claims "this is a
VIN" — it gives every candidate a **confidence score** from 0.0 to 1.0,
built from structural evidence: a known manufacturer prefix, a valid
checksum digit, a plausible year character, and so on.

## When do I need it?

- **Checking a dump matches its car.** The file should contain your car's
  VIN — if it shows a *different* one, the dump may be from another car.
- **Auditing a clone or merge.** Two distinct, high-confidence VINs in one
  file is the classic sign of a merged or cloned dump.
- **Following up a `health` warning.** `health` warns about duplicate VINs;
  this command shows you exactly what it found.

## Try it (2 minutes)

```bash
openremap scan-vins my-file.bin
```

You will see a table — one row per candidate at or above the confidence
cut-off (0.4 by default): the offset in the file, the VIN, its confidence
score, and the evidence behind it. Strong candidates (≥ 0.6) are
highlighted. Real VINs that OpenRemap could decode are tagged
*(decoded, unverified)* — the manufacturer, country and year come from a
public database, so treat them as a hint, not proof.

## Understanding the answer

| The output says… | In plain words |
|---|---|
| **Confidence 0.0–1.0** | How much structural evidence supports this candidate. It is a score, never a yes/no claim |
| **Evidence** | The reasons: known manufacturer prefix (WMI), valid check digit, plausible year, numeric tail, inside an ident block, mirrored elsewhere in the file |
| **mirrored** | The same VIN appears more than once in the file — ECUs often store it in several places |
| **decoded, unverified** | vininfo's public database matched the prefix to a maker/country/year — informative, not proof |

Measured on real files, natural lookalikes score **≤ 0.45**, while real
injected VINs in ident blocks score **≥ 0.9** — so the score separates them
cleanly. Candidates with fewer than 6 different characters (fills like
`99999999999999999`) are rejected up front.

## For developers

The same scan is one method of `openremap.api`. Note the spelling: the API
method is **`scan_vins`** (underscore), while the terminal command is
`scan-vins` (dash):

| Way of using it | Where to look | Example |
|---|---|---|
| Terminal (CLI) | [scan-vins — CLI](cli.md) | `openremap scan-vins my-file.bin` |
| Python code | [scan-vins — API](api.md) | `api.call("scan_vins", {"path": "my-file.bin"})` |
| Any language (JSON-RPC) | [scan-vins — API](api.md) | a request with `"method": "scan_vins"` |

## Where to go next

| You want to… | Go to |
|---|---|
| See every option, the scoring table and the JSON output | [scan-vins — CLI](cli.md) |
| Call `scan-vins` from your own code | [scan-vins — API](api.md) |
| Run the safety pass that warns about duplicate VINs | [`health`](../health/index.md) |
| Sort a whole folder of files first | [`scan`](../scan/index.md) |
