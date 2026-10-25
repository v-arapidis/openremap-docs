---
title: Apply
description: >-
  Four commands on one ladder — each drops exactly one safety rail, so you always
  know what you gave up.
tags: [cli]
status: stable
---

# Apply

Applying a recipe writes its changes into a **copy** of another file. Four commands
do this, from strictest to loosest. There are no `--force` flags: the command you
choose **is** the policy.

| Command | Needs the same software? | Needs exact byte positions? | Ambiguous change |
|---|---|---|---|
| [`tune-strict`](#tune-strict) | yes | yes | reported |
| [`tune-shift`](#tune-shift) | yes | no (±2048 bytes) | **refuses** |
| [`tune-unique`](#tune-unique) | no | yes | reported |
| [`tune-any`](#tune-any) | no | no | reported |

## `tune-strict`

**What it is:** applies only if everything lines up — same software, original bytes
exactly where the recipe says, and the result verified.

```bash
openremap tune-strict original.bin stage1.remap -o patched.bin
```

```
  tune-strict  ·  original.bin
  POLICY        identity=firmware · positions=exact · shift=must be zero · ambiguity=reported
  SCHEMA        5.0
  RECIPE KEY    EDC17C66::1037541778126241V0
  TARGET KEY    EDC17C66::1037541778126241V0

  A1–A5      PASS schema 5.0 · the contract agrees with the contents
  Γ2-floor   PASS recipe floor=any · command=firmware
  Γ4         PASS 79/79
  Γ6         PASS 79/79 found
  Δ1         PASS 79/79

  ✅ APPLIED
  sha256 out     b737d34463cc9d259fdd6d4df5d3ac2d795ffba9b112a7243656ab247c20c444
  bytes written 7,828
  saved to      patched.bin
```

(Trimmed — the real report shows all fourteen checks.) Then the two blocks that
always follow:

```
  checksums     NOT CORRECTED
                no known scheme for this family — nothing was checked
                verify with  openremap checksum patched.bin
  disclaimer    OpenRemap does not correct checksums automatically.
                A tune that will run in a real vehicle must be reviewed by a
                dedicated tuner shop.
```

**Your input file is never modified.** The result goes to the output path you gave.

## `tune-shift`

**What it is:** for the same software, when a change sits at a slightly different
place (±2048 bytes). In exchange, an ambiguous change becomes a refusal.

```bash
openremap tune-shift target.bin stage1.remap -o out.bin
```

On a file of a **different** software version it refuses:

```
  POLICY        identity=firmware · positions=anchor ±2048 · shift=allowed, reported

  ✗ REFUSED at Γ2
    Different firmware: recipe=EDC17C66::1037541778126241V0 · target=EDC17C60::08001508446612B.
  → Different firmware. Applying across firmwares is possible but deliberate —
    no apply command on this ladder will do it.
[exit 1]
```

## `tune-unique`

**What it is:** for a file that cannot be identified at all — an obscure dump, or one
that was already modified. It requires two independent proofs of position instead:
exact bytes **and** every anchor unique.

```bash
openremap tune-unique target.bin stage1.remap -o out.bin
```

```
  POLICY        identity=any · positions=exact · shift=must be zero · ambiguity=reported

  ✗ REFUSED at Γ4
    The recipe's original bytes are not in place: 79 of 79 instruction(s) do not match
    (e.g. #1 at 0x225A13).
  → The recipe's original bytes are not in place — this target is not the file the
    recipe describes.
[exit 1]
```

## `tune-any`

**What it is:** the loosest rung — no identity check, displaced positions accepted,
ambiguity reported instead of refused. It will happily try a different firmware, so
read the identity line before you flash anything.

```bash
openremap tune-any target.bin stage1.remap -o out.bin
```

```
  POLICY        identity=any · positions=anchor ±2048 · shift=allowed, reported

  ✗ REFUSED at Γ6
    The anchor search failed — 79/79 instruction(s) failed to apply.
      #  1  0x00225A13  ctx+ob+ctx_after pattern not found near 0x225A13 …
      # 79  0x002C04CE  … (ob bytes found elsewhere in binary — map likely shifted)
  → The anchor was not found in the target — probably a different revision.
[exit 1]
```

Even the loosest command still checks the recipe's own validity, the file size, that
every anchor was found, and that the result verifies. It refuses rather than
guessing — which is why you see `REFUSED` and not a half-written file.

## Reading a refusal

| Prefix | Group | Example |
|---|---|---|
| `A` | the recipe itself | `A2` old schema, `A5` contract disagrees with contents |
| `Γ` | recipe vs target | `Γ1` size, `Γ2` identity, `Γ4` bytes not in place, `Γ6` anchor missing, `Γ8` ambiguity |
| `Δ` | after writing | `Δ1` changes verified, `Δ4` byte accounting |

Every refusal ends with a `→` line telling you what it means or what to try. When no
looser option can help, it says that instead of suggesting a key that would not work.

## Where to go next

| You want to… | Go to |
|---|---|
| check the result afterwards | [`validate after`](verify.md#validate) |
| prove all three artifacts belong together | [`audit`](verify.md#audit) |
| do the same thing with a screen and keys | [APPLY screen](../tui/apply.md) |
