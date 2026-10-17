---
title: contribute
description: Add support for an ECU family the toolkit does not recognise — measure your own dump for a usable signature, without ever sharing the dump.
tags: [contribute, cli, contribution]
status: stable
---

# contribute

You own a dump of an ECU family OpenRemap does not recognise. `contribute` is
the wizard that turns that dump into a **pull request** — and it never asks you
to send the dump.

The hard part is not writing the code. It is knowing **which bytes are stable
in your family and absent from every family the engine already recognises**.
You cannot answer that by looking at your own file: a byte string that looks
unique in your dump may be exactly how three other families are recognised.
That is the question this command exists to answer.

## When do I need it?

- **`identify` says `Unknown`** and you own the car, so you can help.
- **You want support for a family added** and you are willing to open a pull
  request, but you have no idea where to start.
- **You are curious what the engine makes of a file** it does not recognise —
  use `--measure-only`, which needs nothing but the file.

## The two halves — and only one needs a clone

The wizard is deliberately split in two. One half is pure local computation,
the other needs the repository.

| | **With a clone** (default) | **Without a clone** (`--measure-only`) |
|---|---|---|
| Needs a checkout of `openremap-core` | Yes — for its fixture corpus | **No** |
| Who claims your dump today | Yes | Yes |
| Signature candidates and their collisions | Yes — tested against **all 89 known-family fixtures** | Partly — the candidates, but **unchecked** |
| A recommended marker | Yes | No — nothing is recommended |
| Writes files | Only with `--write` | Never |
| Needs `--brand` / `--family` | Yes | **No** |

Why the asymmetry? Checking a candidate signature means asking "does this also
fire on another family's file?" — which requires those files. They live in the
repository (`_dev/contrib/recipes/`), are committed, and are deliberately **not**
copied into the installed package. Contributing means opening a pull request, so
a clone is a given. Without one, the wizard says what it could not check instead
of guessing.

> [!IMPORTANT]
> **Your dump never leaves your machine.** Nothing here uploads anything, and
> the artifacts it writes never contain your binary — only a small *recipe*
> (a fill byte plus a handful of planted byte strings, a few hundred bytes)
> from which an equivalent fixture can be rebuilt. The repository has a
> standing "no ECU firmware, ever" rule.

> [!NOTE]
> What the fixtures prove is **internal consistency, not truth**. Every fixture
> was written by reading the engine's own extractors, so "no collision" means
> "this marker does not overlap how we recognise another family" — a strong
> warning, never proof about real ECUs.

## Try it — a first look, no clone needed

```bash
openremap contribute extractor my_dump.bin --measure-only
```

You will see a measurement report:

```
  MEASUREMENT ONLY — no collision check, no marker recommended, nothing written.
  This machine has no checkout of openremap-core (_dev/contrib/recipes/), which is what
  the collision check needs. Everything below is local computation and stands.
  my_dump.bin                    262,144 bytes   not claimed by any extractor today
      identify: Unknown — no extractor matched, so the engine knows nothing about this family yet
```

followed by the byte runs that are stable across every dump you gave it, and the
identity fields it could decode. If you pass two or more dumps with `--also`,
stability is actually verified rather than assumed — which is the difference
between a guess and evidence.

## Try it — the full run, inside a clone

```bash
openremap contribute extractor my_dump.bin --also my_other_dump.bin \
    --brand Acme --family AC3000
```

This adds the part the measurement cannot do: every candidate signature is
tested against all 89 known-family fixtures, the report ranks them by safety,
and it names the one to use. Add `--write` to get the four files a pull request
needs:

| File | What it is |
|---|---|
| a fixture recipe | a few hundred bytes that rebuild a file the extractors accept — **this is what you commit instead of your dump** |
| an extractor skeleton | a starting `extractor.py` that already satisfies the review bar: measured marker, size gate, exclusion guards harvested from whichever family collided, evidence tags on every `return False` |
| a test | a fixture-driven test for that extractor |
| a PR report | what was measured, what collided, the mechanical checks, and a **Not verified** section |

The wizard does not hand you an unrun file: it **executes the skeleton it just
rendered** against every known fixture before calling anything verified, and
exits non-zero when no marker is collision-free. A generated file that has never
been run is worse than no file.

## Checking an extractor that already exists

Reviewers — and you, before pushing — run the same bar over a finished
extractor:

```bash
openremap contribute check openremap/core/manufacturers/acme/ac3000/extractor.py
```

It verifies that the extractor still claims its own fixture, accepts no other
family's, leaves no stale evidence behind when it rejects a file, and is
actually reachable from the registry.

## For developers

Both halves are methods of `openremap.api`:

| Way of using it | Where to look | Example |
|---|---|---|
| Terminal (CLI) | [contribute — CLI](cli.md) | `openremap contribute extractor my.bin --measure-only` |
| Python code | [contribute — API](api.md) | `api.call("contribute_extractor", {"paths": ["my.bin"], "measure_only": True})` |
| Any language (JSON-RPC) | [contribute — API](api.md) | a request with `"method": "contribute_extractor"` |

## Where to go next

| You want to… | Go to |
|---|---|
| See every flag | [contribute — CLI](cli.md) |
| Call it from your own code | [contribute — API](api.md) |
| Know what the review bar checks | [Contributing](../project/contributing.md) |
| Generate a test file to play with first | [`synth`](../synth/index.md) |
| Understand how extractors are detected | [Architecture](../concepts/architecture.md) |
