---
title: Rust engine
description: >-
  The native extension behind the hot loops — the crate, every module in it, why
  Python cannot do this work, and how the GIL is released so the process stays
  responsive.
tags: [architecture, internals, rust]
status: stable
---

# Rust engine

`openremap/_rs/` is a Rust crate that compiles into a Python extension module
called **`openremap._rust`**. It exists for the work that is either far too slow in
Python or not expressible there at all (instruction decoding), and it is
**mandatory** — the package will not import without it. That is deliberate: a
silently absent native engine would just be a slow product.

| | |
|---|---|
| Crate name / library | `openremap` / `_rust` (`crate-type = ["cdylib"]`) |
| Binding | `pyo3 0.29`, features `abi3-py310` + `extension-module` |
| Other dependency | `memchr 2` (byte scanning) |
| Build backend | `maturin` (`>=1.8,<2`), configured in `pyproject.toml` |
| Release profile | `opt-level = 3`, `lto = true`, `codegen-units = 1` |
| Size at 0.9.0 | ~3 200 lines across 18 files |

`abi3-py310` means one wheel works on CPython 3.10 and every later version — the
reason the project ships a single wheel per platform instead of a matrix per
Python version.

## What is native, and what it does

| Module | Lines | What it computes |
|---|---|---|
| `maps/map_hunter.rs` | 917 | structural map discovery: monotonic axis runs, candidate tables, scoring |
| `maps/diff_cells.rs` | 311 | the cell-level machinery behind `diff-maps` |
| `maps/layout_scan.rs` | 82 | flash-layout segmentation support |
| `checksums/checksum.rs` | 261 | the checksum primitives shared by the scheme detectors |
| `checksums/denso.rs` | 173 | the Denso Subaru scheme |
| `checksums/nefmoto_scan.rs` | 115 | NefMoto sweep |
| `arch/c166.rs` | 552 | C166 / ST10 instruction decoder |
| `arch/mcs51.rs` | 243 | 8051 (MCS-51) instruction decoder |
| `arch/mcs96.rs` | 201 | MCS-96 (8096) instruction decoder |
| `identify/endian.rs` | 61 | byte-order detection |
| `primitives/entropy.rs` | 61 | Shannon entropy over a window |
| `primitives/crc16.rs` | 34 | CRC-16 primitives |
| `recipes/diff.rs` | 105 | the stock/tuned byte diff behind a recipe |

Everything else — identity decisions, layout policy, confidence, the apply rules —
is Python. Rust computes; Python decides. A native function never sees a path on
disk, never opens a file, and never raises a product-level refusal: it takes bytes
and returns numbers.

## The GIL, and why 0.9.0 was a 140× improvement

Every heavy native function used to hold the interpreter lock for its entire run.
The work was not slower than it is now — but *everything else in the process* had
to wait for it: other threads, any event loop, a host UI. A 4 MB scan blocked the
main thread for about 6.4 seconds.

Each entry point is now a thin shim that releases the lock around its body:

```rust
fn scan_map_axes(...) -> ... {
    py.detach(|| scan_map_axes_inner(...))   // GIL released for the whole computation
}
```

Same work, same total time; the caller simply stays alive. Measured on a 4 MB dump:

| | Before | After |
|---|---|---|
| Main thread held by a map scan | 6.4 s | **46 ms** |
| Analysis pass | ~21 s of blocking | returns immediately, work continues |

That is the whole reason the TUI can show a live progress line and stay
interruptible while a scan runs. A regression test (`tests/api/test_gil_release.py`)
asserts the property rather than the timing, so it cannot drift silently.

## Where Python meets Rust

The Python side never imports native modules directly from feature code. It goes
through a shim module that decides between the native path and the Python fallback
where one exists:

```
core/services/maps/map_hunter.py      →  openremap._rust.scan_map_axes / scan_map_tables
core/services/maps/diff_maps.py       →  openremap._rust.diff_cells
core/services/maps/layout.py          →  openremap._rust.layout_scan
core/services/checksums/*.py          →  openremap._rust.checksum primitives
core/arch/detect.py                   →  openremap._rust.decode_c166 / decode_mcs51 / decode_mcs96
```

`openremap --version` prints the marker that proves it loaded:

```
openremap 0.9.0 (rust)
```

If that says anything else, the native engine is missing and the installation is
incomplete — see [CLI install](../install/cli/index.md#if-something-goes-wrong).

## Building it

Published wheels and `pip` installs need nothing from you. From a
[repo clone](../install/cli/clone.md), `uv sync` builds it once, and after any
Rust change you rebuild in place:

```bash
uv run maturin develop --release
```

Two packaging details carried by 0.9.0 worth knowing if you touch either file:

- `exclude = ["openremap/_rs/target/**"]` keeps the crate's build directory out of
  the wheel, and `include = ["openremap/api/workflows/*.toml"]` puts the shipped
  workflow definitions *in* it — the API can chain methods without extra files on
  disk.
- The wheel tags matter: `manylinux_2_34` for glibc, plus a musl build, because a
  musllinux wheel under a glibc tag is rejected by PyPI.
