---
title: Format reference
description: >-
  The .remap schema 5.0 in full — every top-level section, every instruction
  field, the reader rules, and the compatibility policy.
tags: [recipe, reference]
status: stable
---

# Format reference

Schema **5.0**. Producers: `cook-strict`, `cook-forced`. Consumers: `tune-strict`,
`tune-shift`, `tune-unique`, `tune-any`.

## Top level

```json
{
  "type": "recipe",
  "schema_version": "5.0",
  "contract": { … },
  "producer": { … },
  "source": { … },
  "tune": { … },
  "fingerprint": "sha256:…",
  "author": { … },
  "metadata": { … },
  "statistics": { … },
  "instructions": [ … ],
  "maps": [ … ],
  "regions": { … }
}
```

| Key | Required | Contents |
|---|---|---|
| `type` | yes | the literal `"recipe"` — the first thing a reader checks |
| `schema_version` | yes | `"5.0"`; the **major** is what a consumer must understand |
| `contract` | yes | `identity_floor`, `anchors_unique`, `sections` |
| `producer` | yes | `engine`, `version`, `command`, `created_at`, `warnings` |
| `source` | yes | the stock file: `filename`, `size`, `sha256`, full `identity` |
| `tune` | yes | the tuned file: `filename`, `size`, `sha256` |
| `fingerprint` | yes | `sha256:` over the ordered `(offset, ob, mb)` tuples |
| `instructions` | yes | the changes — one object each |
| `maps`, `regions` | no | declared in `contract.sections` when present |
| `author`, `metadata`, `statistics` | no | human-facing; never read by the apply engine |

`metadata` carries `name`, `description`, `tags`, `tune_id`. `statistics` carries the
counts (`total_changes`, `total_bytes_changed`, `percentage_changed`,
`single_byte_changes`, `multi_byte_changes`, `largest_change_size`,
`smallest_change_size`, `min_context_size`, `max_context_size`).

## `contract`

| Field | Type | Meaning |
|---|---|---|
| `identity_floor` | `"any" \| "firmware" \| "file"` | the **minimum** identity an apply command must verify |
| `anchors_unique` | bool | every instruction's anchor occurs exactly once in the source |
| `sections` | list\[str\] | the optional top-level sections present, sorted |

Derivation: all anchors unique → `any`; any non-unique anchor → `firmware`. `file`
is reserved for a producer that demands byte identity; nothing emits it today.

Re-derivable: `anchors_unique` from `all(inst.ctx_unique)` and `sections` from
presence. A contract that disagrees with the payload is refused.

## `instructions[]`

Split by class — this distinction is what the reader enforces:

| Class | Fields | Rule |
|---|---|---|
| **semantic** | `offset` (int), `size` (int), `ob`, `mb`, `ctx`, `context_after` | missing or unknown → **refuse** |
| **annotation** | `offset_hex`, `context_size`, `ctx_entropy`, `ctx_unique`, `ctx_expanded`, `description`, `flags`, `region`, `needs_review` | ignored by the engine, reported to humans |

`ob`, `mb`, `ctx`, `context_after` are uppercase hex strings. `size` is redundant
with the `ob`/`mb` lengths and kept as a fast guard. `flags` is a list of objects
(`{"kind": "CODE_AREA", "…": …}`); `region` is one of `calibration`, `code`,
`mixed`, `erased`, `ident`, `unknown`.

`needs_review` is reserved: it marks a change an exclusion rule could only partially
account for. The 5.0 producers exclude nothing, so it is not set by them.

## Reader rules

1. `type` must be `"recipe"`; the `schema_version` major must be `5`.
   A 4.x recipe is refused with `A2` and a pointer to `cook-strict` / `cook-forced`.
2. A top-level section outside the known set, and not listed in `contract.sections`,
   is refused (`A3`).
3. An instruction field outside the semantic + annotation sets is refused (`A4`).
4. The contract is re-derived and compared; disagreement is refused (`A5`).

`audit` and `merge` still *read* 4.x documents — that is what keeps old provenance
legible. The apply engine does not: 4.x is retired for application, not erased.

## Compatibility policy

| Change | Version effect |
|---|---|
| new optional field or section | stays **5.x** (declare it in `contract.sections`) |
| meaning of an existing field changes | **6.0** |
| a semantic field removed or renamed | **6.0** |

Reserved for a future major: revision-independent locators (map fingerprint +
row/column), checksum-repair instructions, and signing. The first two change the
meaning of applied bytes; signing is additive and could ship as an optional section.

## Committed invariants

These bind the producers and the engine, and are asserted by tests rather than by
good intentions:

- **exclusion requires full containment** — a partially covered change is kept and
  marked, never dropped;
- **no silent loss** — kept bytes + excluded bytes must equal the diff blocks;
- **a field nobody reads is a field that can only lie** — which is why there is no
  checksum data anywhere in 5.0;
- **no auto-repair** — recomputing a checksum is a separate capability over a binary.

Read [inside a recipe](anatomy.md) for the plain-words version of all of this.
