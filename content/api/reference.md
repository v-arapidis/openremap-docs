---
title: Reference
description: >-
  Every one of the 41 API methods with its kind, its steps and its exact input
  schema — generated from the live registry, not transcribed by hand.
tags: [api, reference]
status: stable
---

# Reference

All **41 methods** registered in `openremap.api`, grouped by `kind`. `kind` is not
decoration: `command` is one cohesive operation, `composite` is several steps that
must return one report, `workflow` is a `.toml` pipeline.

This page was produced by walking the registry, so it matches the installed
version. Regenerate it after an upgrade with:

```python
import json
import openremap.api as api

print(json.dumps(api.list_methods(), indent=1, default=str))
```

Type shorthand below: `str`, `int`, `float`, `bool`, `dict`, `list`, `bytes`.
`**required**` means the call fails with `-32602` if it is missing; `default` is
applied by the registry before your handler runs.

> [!NOTE]
> Parameter descriptions are shown where the registry carries one. Methods whose
> description is empty in the registry are documented by their CLI page instead —
> the registry is the source of truth, and it is not always chatty.


---

## Commands — one operation each (31)

### `audit`

Verify that a stock binary, tuned binary, and recipe belong together.

| | |
|---|---|
| kind | `command` |
| params | `stock_path`: `str` · **required**<br>`tuned_path`: `str` · **required**<br>`recipe`: `dict` · **required**<br>`recipe_name`: `str` |

### `checksum`

Detect which checksum schemes a binary satisfies and their OK/STALE status.

| | |
|---|---|
| kind | `command` |
| params | `path`: `str` · **required** |

### `classify_file`

Classify one binary with every registered extractor (a batch step).

| | |
|---|---|
| kind | `command` |
| params | `path`: `str` · **required** |

### `contribute_check`

Run the contribution review bar over an existing extractor source file: does it still claim its own fixture, does it steal another family's, does it clear evidence on a miss, does it declare what it reports.

| | |
|---|---|
| kind | `command` |
| params | `path`: `str` · **required** |

### `contribute_extractor`

Measure one or more of your own ECU dumps for a new family and render the artifacts a pull request needs: a committable fixture recipe, an extractor skeleton, a test, and a report. Runs the rendered skeleton against every known-family fixture and refuses to call it verified if it steals one.

| | |
|---|---|
| kind | `command` |
| params | `paths`: `list` · **required**<br>`brand`: `str`<br>`family`: `str`<br>`marker`: `str`<br>`marker_hex`: `str`<br>`measure_only`: `bool` · default `false` |

### `convert`

Normalise an ECU binary image (Intel HEX / S-Record / raw) to flat bytes.

| | |
|---|---|
| kind | `command` |
| params | `path`: `str` · **required**<br>`format`: `str` · default `"auto"` |

### `families`

List the supported ECU families as a reference (era, typical size, vehicles, identifier). Optionally one family by name or alias.

| | |
|---|---|
| kind | `command` |
| params | `name`: `str` |

### `generate_dump`

Generate a deterministic synthetic ECU-like dump from scratch (no OEM data).  Returns the bytes as base64 plus the planted ground truth. Generated files have no manufacturer fingerprints, so identify reports Unknown for them — by design.

| | |
|---|---|
| kind | `command` |
| params | `size`: `int` · default `262144` · range 4096…∞<br>`maps`: `int` · default `1` · range 0…64<br>`seed`: `int` · default `7`<br>`cell_width`: `int` · default `2` · range 1…2<br>`byte_order`: `str` · default `"little"`<br>`layout`: `list` · default `["code", "calibration", "erased", "code"]` |

### `hex_region`

Return a byte range of a binary as lowercase hex.

| | |
|---|---|
| kind | `command` |
| params | `path`: `str` · **required**<br>`offset`: `int` · **required** · range 0…∞<br>`length`: `int` · **required** · range 1…16384 |

### `identify`

Identify an ECU binary — manufacturer, family, confidence, VIN.

| | |
|---|---|
| kind | `command` |
| params | `path`: `str` · **required** |

### `layout`

Segment an ECU binary into its flash-layout blocks.

| | |
|---|---|
| kind | `command` |
| params | `path`: `str` · **required**<br>`min_run`: `int` · default `64` · range 1…∞ |

### `list_methods`

List all registered methods (commands, composites and workflows) with metadata.  Optional 'kind' narrows the listing to one kind; an unrecognised kind returns an empty list rather than an error.

| | |
|---|---|
| kind | `command` |
| params | `kind`: `str` |

### `map_grid`

Read one detected table as a grid of cell values (for previews).

| | |
|---|---|
| kind | `command` |
| params | `path`: `str` · **required**<br>`table`: `dict` · **required** |

### `map_image`

Render one detected table as an SVG picture (values + axes + legend).

| | |
|---|---|
| kind | `command` |
| params | `path`: `str` · **required**<br>`table`: `dict` · **required**<br>`include_values`: `bool`<br>`width`: `int` · default `960` · range 400…∞ |

### `merge`

Merge two recipes built from the same family of originals into one.

| | |
|---|---|
| kind | `command` |
| params | `recipe_a`: `dict` · **required**<br>`recipe_b`: `dict` · **required**<br>`name_a`: `str`<br>`name_b`: `str`<br>`stock_path`: `str`<br>`strict`: `bool` · default `false` |

### `organize_apply`

Copy (default) or move a scan's files into their folders.

| | |
|---|---|
| kind | `command` |
| params | `directory`: `str` · **required**<br>`rows`: `list` · **required**<br>`nested`: `bool` · default `true`<br>`move`: `bool` · default `false` |

### `organize_preview`

Where a scan's results would be filed, without touching anything.

| | |
|---|---|
| kind | `command` |
| params | `directory`: `str` · **required**<br>`rows`: `list` · **required**<br>`nested`: `bool` · default `true` |

### `ping`

Liveness check — always returns {'ok': True}.

| | |
|---|---|
| kind | `command` |
| params | *(no parameters)* |

### `recipe_info`

Read a .remap file and report what it declares: schema, instruction count, identity floor, the files it was cooked from.

| | |
|---|---|
| kind | `command` |
| params | `path`: `str` · **required**<br>`include_instructions`: `bool` · default `false` |

### `routine`

Read a code routine as readable pseudo-code.

| | |
|---|---|
| kind | `command` |
| params | `path`: `str` · **required**<br>`offset`: `int` · **required**<br>`arch`: `str`<br>`before`: `int` · default `8` · range 0…∞<br>`after`: `int` · default `60` · range 0…∞ |

### `scan`

Batch-scan a directory of ECU binaries through all registered extractors.

| | |
|---|---|
| kind | `command` |
| params | `directory`: `str` · **required**<br>`recursive`: `bool` · default `false` |

### `scan_candidates`

List the files a batch scan would classify in a folder (no work done).

| | |
|---|---|
| kind | `command` |
| params | `directory`: `str` · **required**<br>`recursive`: `bool` · default `false` |

### `scan_classify`

Scan a binary and annotate tables with probabilistic content labels.

| | |
|---|---|
| kind | `command` |
| params | `path`: `str` · **required**<br>`min_score`: `float` · default `0.85` · range 0.0…1.0<br>`max_series_tables`: `int` · default `16` · range 1…∞<br>`whole_file`: `bool` · default `false`<br>`top`: `int` · default `20` · range 1…∞ |

### `scan_map_axes`

Stage 1 of the two-stage scan: detect axes only (cached).

| | |
|---|---|
| kind | `command` |
| params | `path`: `str` · **required**<br>`min_axis_length`: `int` · default `4`<br>`max_axis_length`: `int` · default `32`<br>`min_step`: `int` · default `1`<br>`max_step`: `int` · default `10000` |

### `scan_map_tables`

Stage 2 of the two-stage scan: pair axes into tables (cached).

| | |
|---|---|
| kind | `command` |
| params | `path`: `str` · **required**<br>`min_table_score`: `float` · default `0.55` · range 0.0…1.0<br>`max_series_tables`: `int` · default `16` · range 1…∞<br>`min_axis_length`: `int` · default `4`<br>`max_axis_length`: `int` · default `32`<br>`min_step`: `int` · default `1`<br>`max_step`: `int` · default `10000` |

### `scan_maps`

Scan a binary for calibration map axes and 2D tables (one-shot, CLI-shaped).

| | |
|---|---|
| kind | `command` |
| params | `path`: `str` · **required**<br>`region_start`: `int`<br>`region_end`: `int`<br>`min_score`: `float` · default `0.85` · range 0.0…1.0<br>`max_series_tables`: `int` · default `16` · range 1…∞<br>`whole_file`: `bool` · default `false`<br>`top`: `int` · default `20` · range 1…∞<br>`classify`: `bool` · default `false`<br>`xrefs`: `bool` · default `false` |

### `scan_vins`

Locate VIN candidates in an ECU binary and score them.

| | |
|---|---|
| kind | `command` |
| params | `path`: `str` · **required**<br>`min_confidence`: `float` · default `0.4` · range 0.0…1.0 |

### `validate_after`

Post-tune confirmation — verify mb bytes were written correctly.

| | |
|---|---|
| kind | `command` |
| params | `path`: `str` · **required**<br>`recipe`: `dict` · **required**<br>`recipe_name`: `str` |

### `validate_before`

Pre-flight strict check — verify ob bytes are at recorded offsets.

| | |
|---|---|
| kind | `command` |
| params | `path`: `str` · **required**<br>`recipe`: `dict` · **required**<br>`recipe_name`: `str` |

### `validate_check`

Diagnostic — search the whole binary for the recipe's ob bytes.

| | |
|---|---|
| kind | `command` |
| params | `path`: `str` · **required**<br>`recipe`: `dict` · **required**<br>`recipe_name`: `str` |

### `version`

API/library version and the active native backend.

| | |
|---|---|
| kind | `command` |
| params | *(no parameters)* |

## Composites — several steps, one report (9)

### `analyze`

Describe a whole ECU binary: identity, VIN, layout, maps, checksums, health.

| | |
|---|---|
| kind | `composite` |
| steps | `identify` → `scan_map_axes` → `scan_map_tables` → `check_coherence` → `health` |
| params | `path`: `str` · **required**<br>`fast`: `bool` · default `false`<br>`skip_maps`: `bool` · default `false`<br>`xref_mode`: `str` · default `"v1"` |

### `apply_any`

Apply a recipe with no identity requirement — shift and ambiguity relaxed.

| | |
|---|---|
| kind | `composite` |
| steps | `recipe checks` → `size` → `anchor search` → `verify` |
| params | `path`: `str` · **required**<br>`recipe`: `dict`<br>`recipe_path`: `str`<br>`recipe_name`: `str` |

### `apply_shift`

Apply a recipe when the target is the same firmware but the change is found at a displaced offset (±2048 bytes). Shift is reported; a non-unique anchor is refused.

| | |
|---|---|
| kind | `composite` |
| steps | `recipe checks` → `identity gate` → `anchor search` → `shift report` → `verify` |
| params | `path`: `str` · **required**<br>`recipe`: `dict`<br>`recipe_path`: `str`<br>`recipe_name`: `str` |

### `apply_strict`

Apply a recipe only when every check passes: valid recipe, same firmware, exact original bytes, anchor at the expected offset, and a verified result. No flags loosen it.

| | |
|---|---|
| kind | `composite` |
| steps | `recipe checks` → `identity gate` → `exact bytes` → `anchor search` → `verify` |
| params | `path`: `str` · **required**<br>`recipe`: `dict`<br>`recipe_path`: `str`<br>`recipe_name`: `str` |

### `apply_unique`

Apply a recipe with no identity requirement, requiring exact offsets and unique anchors.

| | |
|---|---|
| kind | `composite` |
| steps | `recipe checks` → `size` → `anchor search` → `verify` |
| params | `path`: `str` · **required**<br>`recipe`: `dict`<br>`recipe_path`: `str`<br>`recipe_name`: `str` |

### `cook_forced`

Build a schema-5.0 recipe accepting non-unique anchors (change inside blank flash/padding). Declares identity_floor: firmware.

| | |
|---|---|
| kind | `composite` |
| steps | `size guard` → `identity guard` → `diff + anchors` → `annotate` → `maps/regions` → `contract` |
| params | `stock_path`: `str` · **required**<br>`tuned_path`: `str` · **required**<br>`context_size`: `int` · default `32` · range 8…128<br>`description`: `str` |

### `cook_strict`

Build a schema-5.0 recipe from stock/tuned, requiring unique anchors. Declares identity_floor: any, so every apply command can use it.

| | |
|---|---|
| kind | `composite` |
| steps | `size guard` → `identity guard` → `diff + anchors` → `annotate` → `maps/regions` → `contract` |
| params | `stock_path`: `str` · **required**<br>`tuned_path`: `str` · **required**<br>`context_size`: `int` · default `32` · range 8…128<br>`description`: `str` |

### `diff_maps`

Find matching calibration maps between two binaries and diff them cell-by-cell.

| | |
|---|---|
| kind | `composite` |
| steps | `scan_map_axes` → `scan_map_tables` → `match_by_axis` → `diff_cells` |
| params | `stock_path`: `str` · **required**<br>`tuned_path`: `str` · **required**<br>`region_start`: `int`<br>`region_end`: `int`<br>`min_score`: `float` · default `0.55` · range 0.0…1.0<br>`threshold`: `float` · default `0.0`<br>`top`: `int` · default `50` · range 1…∞<br>`whole_file`: `bool` · default `false`<br>`max_series_tables`: `int` · default `16` · range 1…∞<br>`recipe`: `dict` |

### `health`

One-shot calibration health check (identity, checksums, maps, layout, VIN).

| | |
|---|---|
| kind | `composite` |
| steps | `identify` → `checksums` → `scan_map_tables` → `segment` → `scan_vins` |
| params | `path`: `str` · **required** |

## Workflows — data, not code (1)

### `identify_cook`

Identify both binaries, then cook a recipe in one call.

| | |
|---|---|
| kind | `workflow` |
| steps | `identify` → `identify` → `cook_strict` |
| params | `modified_path`: `any` · **required**<br>`original_path`: `any` · **required** |
