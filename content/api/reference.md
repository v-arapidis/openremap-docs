---
title: API reference
description: The complete openremap.api method catalogue — every registered method by kind (command / composite / workflow), its input parameters, and its documentation page.
tags: [api, reference]
status: stable
---

# API reference — the method catalogue

Every method registered with `openremap.api`, grouped by `kind`. **30
methods**: 23 `command`, 6 `composite`, 1 `workflow`.

This page mirrors the registry at the time of writing. The registry is the
live source of truth — run `list_methods` (see [concepts](concepts.md)) to
see the current catalogue, schemas and descriptions:

```python
import openremap.api as api
for m in api.call("list_methods", {})["methods"]:
    print(m["name"], m["kind"])
```

Parameter shorthand below: `name: type` + **(required)** means no default;
`= default` shows the default; ranges like `(8–128)` are numeric bounds.

---

## Atomic commands (`kind="command"`) — 23

Each is one cohesive operation in one domain.

**Identity & inspection**

- **`identify`** — identify an ECU binary: manufacturer, family, confidence, VIN.
  `path: str` **(required)** → [identify — API](../identify/api.md)
- **`checksum`** — detect which checksum schemes a binary satisfies and their OK/STALE status.
  `path: str` **(required)** → [checksum — API](../checksum/api.md)
- **`layout`** — segment a binary into its flash-layout blocks.
  `path: str` **(required)** · `min_run: int = 64 (≥1)` → [layout — API](../layout/api.md)
- **`scan_vins`** — locate VIN candidates in a binary and score them.
  `path: str` **(required)** · `min_confidence: float = 0.4 (0–1)` → [scan-vins — API](../scan-vins/api.md)
- **`routine`** — read a code routine around an offset as readable pseudo-code.
  `path: str` **(required)** · `offset: int` **(required)** · `arch: str` (c166\|tricore\|sh\|x86\|m680x\|m68k\|ppc) · `before: int = 8` · `after: int = 60` → [routine — API](../routine/api.md)

**Files & scanning**

- **`convert`** — normalise an ECU image (Intel HEX / S-Record / raw) to flat bytes.
  `path: str` **(required)** · `format: str = "auto"` (auto\|ihex\|srec\|bin) → [convert — API](../convert/api.md)
- **`scan`** — batch-classify every file in a directory (never moves files).
  `directory: str` **(required)** · `recursive: bool = False` → [scan — API](../scan/api.md)
- **`scan_maps`** — one-shot scan for calibration map axes and 2D tables (CLI-shaped).
  `path: str` **(required)** · `region_start/region_end: int` · `min_score: float = 0.85 (0–1)` · `max_series_tables: int = 16` · `whole_file: bool = False` · `top: int = 20` · `classify: bool = False` · `xrefs: bool = False` → [scan-maps — API](../scan-maps/api.md)
- **`scan_classify`** — scan and annotate tables with probabilistic content labels.
  `path: str` **(required)** · `min_score = 0.85` · `max_series_tables = 16` · `whole_file = False` · `top = 20`
- **`scan_map_axes`** — stage 1 of the two-stage scan: detect axes only (cached).
  `path: str` **(required)** · `min_axis_length: int = 4` · `max_axis_length: int = 32` · `min_step: int = 1` · `max_step: int = 10000`
- **`scan_map_tables`** — stage 2 of the two-stage scan: pair axes into tables (cached).
  `path: str` **(required)** · `min_table_score: float = 0.55` · `max_series_tables: int = 16` · `min_axis_length: int = 4` · `max_axis_length: int = 32` · `min_step: int = 1` · `max_step: int = 10000`

> The last three are the building blocks composites compose
> (`analyze`, `diff_maps` and `health` list them in their `steps`). They have
> no dedicated wiki page yet; their schemas are above.

**Recipes**

- **`validate_before`** — pre-flight strict check that the recipe's original bytes are at the recorded offsets.
  `path: str` **(required)** · `recipe: dict` **(required)** · `recipe_name: str` → [validate — API](../validate/api.md)
- **`validate_check`** — diagnostic: search the whole binary for the recipe's original bytes.
  `path: str` **(required)** · `recipe: dict` **(required)** · `recipe_name: str` → [validate — API](../validate/api.md)
- **`validate_after`** — post-tune confirmation that the modified bytes were written correctly.
  `path: str` **(required)** · `recipe: dict` **(required)** · `recipe_name: str` → [validate — API](../validate/api.md)
- **`audit`** — verify that a stock binary, tuned binary and recipe belong together.
  `stock_path: str` **(required)** · `tuned_path: str` **(required)** · `recipe: dict` **(required)** · `recipe_name: str` → [audit — API](../audit/api.md)
- **`merge`** — merge two recipes built from the same family of originals into one.
  `recipe_a: dict` **(required)** · `recipe_b: dict` **(required)** · `name_a: str` · `name_b: str` · `stock_path: str` · `strict: bool = False` → [merge — API](../merge/api.md)
- **`patch`** — atomically apply a recipe to a target binary (no validation phases).
  `path: str` **(required)** · `recipe: dict` **(required)** · `recipe_name: str` · `skip_validation: bool = False`

> `patch` has no dedicated wiki page yet. The safe three-phase `tune`
> composite (below) wraps exactly this apply step between its validations.

**Fixtures & contribution**

- **`generate_dump`** — build a deterministic synthetic ECU-like dump from scratch (no OEM data).
  `size: int = 262144 (≥4096)` · `maps: int = 1 (0–64)` · `seed: int = 7` · `cell_width: int = 2 (1–2)` · `byte_order: str = "little"` · `layout: list = ["code","calibration","erased","code"]` → [synth — API](../synth/api.md)
- **`contribute_extractor`** — measure your own dump(s) and render the files a new-family PR needs.
  `paths: list` **(required)** · `brand: str` · `family: str` · `marker: str` · `marker_hex: str` · `measure_only: bool = False` → [contribute — API](../contribute/api.md)
- **`contribute_check`** — run the contribution review bar over an existing extractor file.
  `path: str` **(required)** → [contribute — API](../contribute/api.md)

> `brand` and `family` are required unless `measure_only` is set: a first look at
> an unsupported dump should not need the family name it is trying to produce.
> `measure_only` is also the half that works without a checkout (no collision
> check, no recommended marker, no artifacts).

**Meta**

- **`ping`** — liveness check, always returns `{"ok": True}`. No params. → [API index](index.md#the-same-call-on-each-surface)
- **`version`** — API/library version and the active native backend. No params. → [API index](index.md)
- **`list_methods`** — the live catalogue: every method's name, kind, description, schema and steps.
  `kind: str` (optional — `command` \| `composite` \| `workflow`) → [concepts](concepts.md#list-methods-output-shape)

---

## Composites (`kind="composite"`) — 6

Hand-written orchestrations of independent operations/domains, with control
flow or coherence that a declarative workflow cannot express. Each lists the
methods it composes in its `steps`.

- **`analyze`** — describe a whole binary: identity, VIN, layout, maps, checksums, health.
  `path: str` **(required)** · `fast: bool = False` · `skip_maps: bool = False` · `xref_mode: str = "v1"` ("v1"\|"v2")
  steps: `identify → scan_map_axes → scan_map_tables → check_coherence → health` → [analyze — API](../analyze/api.md)
- **`health`** — one-shot calibration health check.
  `path: str` **(required)**
  steps: `identify → checksums → scan_map_tables → segment → scan_vins` → [health — API](../health/api.md)
- **`cook`** — diff an original and a modified binary into a `.remap` recipe.
  `original_path: str` **(required)** · `modified_path: str` **(required)** · `context_size: int = 32 (8–128)` · `require_unique: bool = True` · `annotate_maps: bool = True` · `description: str`
  steps: `diff → scan_map_tables → attach_maps → tag_instruction_regions` → [cook — API](../cook/api.md)
- **`cook_volatile`** — cook a car-portable recipe (volatile instructions classified + excluded).
  `original_path: str` **(required)** · `modified_path: str` **(required)** · `context_size: int = 32 (8–128)` · `require_unique: bool = True` · `no_exclude: bool = False` · `exclude_uncertain: bool = False` · `annotate_maps: bool = True`
  steps: `diff → classify_volatile → scan_map_tables → attach_maps → tag_instruction_regions` → [cook-volatile — API](../cook-volatile/api.md)
- **`diff_maps`** — find matching calibration maps between two binaries and diff them cell-by-cell.
  `stock_path: str` **(required)** · `tuned_path: str` **(required)** · `region_start/region_end: int` · `min_score: float = 0.55` · `threshold: float = 0.0` · `top: int = 50` · `whole_file: bool = False` · `max_series_tables: int = 16` · `recipe: dict`
  steps: `scan_map_axes → scan_map_tables → match_by_axis → diff_cells` → [diff-maps — API](../diff-maps/api.md)
- **`tune`** — the safe three-phase tune: validate before → apply → validate after.
  `path: str` **(required)** · `recipe: dict` **(required)** · `recipe_name: str` · `skip_validation: bool = False` · `force: bool = False`
  steps: `validate_before → patch → validate_after` → [tune — API](../tune/api.md)

---

## Workflows (`kind="workflow"`) — 1

Declarative `.toml` pipelines (no code) — see [workflows](workflows.md).

Workflow inputs are **untyped**: the schema is collected from the `.toml`, so
the registry reports `{"required": true}` for each `$input.*` and no type at
all. That is why the shorthand below shows no `: type` for this kind.

- **`identify_cook`** — identify both binaries, then cook a recipe in one call.
  inputs: `original_path` **(required)** · `modified_path` **(required)**
  steps: `identify (as original_id) → identify (as modified_id) → cook` → [workflows](workflows.md#the-shipped-example-identify-cook)

---

## Method pages and surface coverage

Every command's API face lives next to its CLI page at
`content/<cmd>/api.md`; the catalogue above links them. Points worth noting:

- **API-only methods (no CLI command of the same name):** the meta trio
  `ping` / `version` / `list_methods`, the atomic `patch`, the staged map
  methods `scan_classify` / `scan_map_axes` / `scan_map_tables`, and the
  `identify_cook` workflow.
- **CLI-only commands (no API method):** `families`, the `workflow` terminal
  guide and the `commands` cheat-sheet — see
  [getting-started](../getting-started/index.md).
- `scan_maps` is the CLI `scan-maps` method; the three `validate_*` methods
  are exposed to the terminal as `openremap validate before|check|after`.
- **`synth` and `contribute` are the two CLI commands that dispatch *through*
  the registry**, like any other API client (`generate_dump`,
  `contribute_extractor`, `contribute_check`). Every other CLI command calls the
  engine services directly and declares its own `--flags`.

## See also

- [API concepts](concepts.md) — registry, schema contract, kinds, errors
- [API index](index.md) — how to call any of these methods
- [Workflows](workflows.md) — writing your own declarative pipelines
- [Transport (JSON-RPC)](transport.md) — the same catalogue over stdio
