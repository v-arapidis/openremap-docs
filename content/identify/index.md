---
title: identify
description: Tell identify what an ECU file is — the maker, the family, the software version inside, and how sure OpenRemap is. For beginners first.
tags: [identify, cli, api]
status: stable
---

# identify

If you have a file that came from a car's computer — an **ECU** — `identify`
tells you what that file is.

Think of it as showing the file to an expert who reads the ECU's name tag.
The expert tells you:

- **who made the ECU** (Bosch, Siemens, Delphi, …),
- **which family** it belongs to (the ECU's model line, like "EDC17"),
- **the software version** stored inside,
- and **how sure they are** about all of this.

That last part matters: OpenRemap can only work with ECUs it already knows.
`identify` is the honest first step — it tells you whether your file is
supported before you try anything else.

It never changes the file. It only reads it.

## When do I need it?

- **Before anything else.** Every workflow starts with `identify`, because
  the next steps need to know which ECU they are dealing with.
- **When you want to reuse a tune on another car.** OpenRemap matches tunes
  to ECUs by a name tag (the *match key*). If the tags don't match, the tune
  does not apply. `identify` shows you the tag.
- **When you have a mystery file.** Run it and see: supported file, or not?

## Try it (2 minutes)

Put a file next to the command and run:

```bash
openremap identify my-file.bin
```

If the file is a known ECU, you will see something like this (shortened):

```
  my-file.bin
  Bosch · EDC17

  Manufacturer      Bosch
  ECU Family        EDC17
  Match Key         EDC17C66::1037541778
  File Size         2,097,152 bytes

  ── Confidence ─────────────────────────────────────────────────────────────
  Tier   HIGH
```

If every field says `unknown`, OpenRemap does not know this ECU yet — see
[Does OpenRemap support my file?](#does-openremap-support-my-file).

## Understanding the answer

| The output says… | In plain words |
|---|---|
| **Manufacturer / ECU Family** | Who made it, and which model line it is |
| **Software Version** | The version of the software inside the ECU |
| **Match Key** | The ECU's name tag — used to match tunes to the right ECU |
| **Confidence (tier)** | How sure OpenRemap is: HIGH / MEDIUM / LOW / SUSPICIOUS / UNKNOWN |
| **Signals (+ / −)** | The reasons behind that confidence, listed one by one |
| **VIN candidate** | A car's ID number found inside the file (only shown when it is a believable match) |

You only need to remember two things:

1. **HIGH or MEDIUM confidence with a match key** → good to go. You can cook
   and tune this file.
2. **Suspicious confidence or a missing match key** → slow down. OpenRemap
   will tell you what looks wrong and why.

For the full story on confidence, see
[Confidence scoring — in depth](../concepts/confidence.md).

## Does OpenRemap support my file?

If everything comes back `unknown`, the file is probably from an ECU family
that OpenRemap does not know yet. That is not the end of the road:

- You can still look at it with other tools (like the map scanner).
- If you are comfortable helping, adding a new family is open source work —
  see [Contributing](../../CONTRIBUTING.md).

## For developers

`identify` is one action on the engine, and the same action is available in
all three ways of using OpenRemap:

| Way of using it | Where to look | Example |
|---|---|---|
| Terminal (CLI) | [identify — CLI](cli.md) | `openremap identify my-file.bin` |
| Python code | [identify — API](api.md) | `api.call("identify", {"path": "my-file.bin"})` |
| Any language (JSON-RPC) | [identify — API](api.md) | a request with `"method": "identify"` |

New to the three ways? See
[CLI, API & RPC — the three interfaces](../getting-started/interfaces.md).

## Where to go next

| You want to… | Go to |
|---|---|
| See every option and all the example outputs | [identify — CLI](cli.md) |
| Call `identify` from your own code | [identify — API](api.md) |
| Understand confidence tiers and signals | [Confidence scoring](../concepts/confidence.md) |
| Check the file is healthy next | [`health`](../health/index.md) |
