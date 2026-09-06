---
title: layout
description: Show how an ECU file is organised — where the code, calibration area, empty pages and ID blocks are. For beginners first.
tags: [layout, cli, api]
status: stable
---

# layout

An ECU file is not one uniform blob. It has "neighbourhoods": empty flash
pages, the **code** the ECU runs, the **calibration** area where the
tuning tables (maps) live, and small **ID blocks** holding the software
and hardware numbers.

`layout` reads a file and draws you the map of those neighbourhoods —
where each one starts and ends.

Think of it as looking at the floor plan of the file before you start
working inside it. It is a read-only tool; it never changes the file.

## When do I need it?

- **When you want to understand a file's structure** — before scanning for
  maps or reverse-engineering.
- **When `analyze` shows a layout you want to inspect in detail.**
- **When you work with an ECU family you do not know** — `layout` needs no
  manufacturer database; it segments purely from the data itself.

One honest caveat: the labels are the tool's *best guess* with a
confidence value — not verified names. "Calibration" here means "dense in
tuning tables", not "this is definitely tunable".

## Try it (2 minutes)

```bash
openremap layout my-file.bin
```

You will see a table like this (shortened):

```
  my-file.bin  •  1,048,576 bytes  •  3 region(s)  •  1 ident block(s)

     Start       End        Size          Kind    Fill    Ent   Tbls   Conf
  0x000000  0x080000     524,288        erased    0xC3   0.00      0   0.95
  0x080000  0x0C0000     262,144          code       —   6.75      0   0.70
  0x0C0000  0x100000     262,144   calibration       —   4.93     55   0.68
  0x0CC51B  0x0CC57C          97         ident       —   1.07      0   0.50
```

This example shows the classic layout of a Bosch EDC15 file: an erased
first half (that family's erase byte is `0xC3`), code in the middle, and
the calibration area with its ID records on top.

## Understanding the answer

| Kind | In plain words |
|---|---|
| **erased** | Empty flash — pages of one repeated byte (the family's "erase byte", often `FF`) |
| **code** | The ECU's program — busy data with no tuning tables |
| **calibration** | The tunable area — dense with maps |
| **ident** | Small readable blocks — software/hardware numbers, VIN |
| **mixed** | No clear signal — low confidence |

The **Conf** column is how sure the tool is about that label. **Ent** is a
data-busyness measure (higher = more "random-looking" = code-like). **Tbls**
is how many high-confidence tables were found in the region.

## For developers

The same segmentation is one method of `openremap.api`:

| Way of using it | Where to look | Example |
|---|---|---|
| Terminal (CLI) | [layout — CLI](cli.md) | `openremap layout my-file.bin` |
| Python code | [layout — API](api.md) | `api.call("layout", {"path": "my-file.bin"})` |
| Any language (JSON-RPC) | [layout — API](api.md) | a request with `"method": "layout"` |

## Where to go next

| You want to… | Go to |
|---|---|
| See every flag and the JSON output | [layout — CLI](cli.md) |
| Call `layout` from your own code | [layout — API](api.md) |
| Find the tuning tables inside those regions | [`scan-maps`](../scan-maps/index.md) |
| See layout as one section of the full report | [`analyze`](../analyze/index.md) |
