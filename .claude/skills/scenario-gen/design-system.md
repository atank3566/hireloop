# Patterns — Design Rationale

A handoff document for picking up the pattern-system discussion across sessions. Captures the reasoning behind decisions, not the implementation details (see `patterns-development-guide-v2.md` for that). Read this when you need to understand *why* the architecture looks the way it does, or when you're about to revisit a decision.

---

## 1. Context: what Flextudio metadata looks like

Flextudio scenarios are deeply nested JSON describing UI controls. A single screen scenario is typically:

- **Depth 7+** — `Sectors[].Controls[].Children[].Children[]...`
- **50kb+** of JSON for a non-trivial screen
- **~30 styling fields per control** — `BgStyle`, `FontStyle`, `BorderStyle`, `Padding`, `Margin`, `Width`, `Height`, plus per-ControlType fields
- **ControlType is the engine primitive** — `Label`, `Group`, `ImageBox`, `TextField`, `Button`, `Icon`, `Checkbox`, `Radio`, etc. Enumerated in `catalog.json`.
- **Tokens live in `DESIGN.md`** — colors as `var(--colorXxx)`, FontWeight as string enums (`Regular`/`Medium`/`SemiBold`/`Bold`), spacing on a scale (`xs`–`xxl` = 4–24 px)
- **`validate.mjs` enforces 16 cross-checks** — naming, ID format, legacy-field bans, image-field defaults, font/border rules, etc. This is the actual contract.
- **Build sequence** — the original MCP server enforced a fixed call order via `build_id`. The CLI replacement (`flex-scenario session start/status/finish`) keeps a build id for traceability but does not force stage order.

The original assumption was that the LLM emits this metadata directly, with `assets.json` providing reference snippets for common shapes.

---

## 2. Why `assets.json` failed

`assets.json` accumulated 174 entries across 9 "kinds" (colors, controls, compositions, layouts, etc.) intended as a reference library. In practice:

1. **Ambiguous positioning** — it tried to be three things simultaneously:
   - Token reference (but DESIGN.md already does this)
   - Pattern library (but compositions are prose, not generation-ready)
   - Search index (but mixing 9 kinds in a flat list fragmented results)
2. **Low LLM utilization** — the workflow `find → get × 5 → translate prose to JSON → maintain 30 fields consistently` puts the LLM on the steps it does worst.
3. **Maintenance cost > value** — sync with DESIGN.md required ongoing effort; only ~10 of 174 entries (deprecated mappings + usage-rank stats) carried real value.

Conclusion: replace with something the LLM can actually consume cheaply.

---

## 3. The core question: how should the LLM produce metadata?

Two models on the table:

### Model A — Hybrid output

```
LLM → [ raw control JSON (escape) , pattern invocation (abstracted) ]
                                                                    → merge → meta
```

LLM freely moves between layers. Some controls drawn raw, others via patterns, all in the same scenario.

**Pros**: Maximum flexibility. LLM can always drop down a level when a pattern doesn't fit (e.g. unusual data binding, one-off event hook).

**Cons**:
- LLM must decide *per control* whether to use a pattern or raw output. This is the kind of judgment LLMs handle worst — and it has to happen continuously.
- Result quality drifts: two cards in the same list end up styled differently (one token-based, one inline hex) because the LLM made different micro-decisions.
- The deep-JSON cost stays — every raw control means ~30 fields the LLM must emit consistently.
- The original principle of the project ("don't push judgment onto the LLM") gets violated.

### Model B — Single layer

```
LLM → pattern invocations only → materializer → meta
```

LLM emits only `{ pattern, props }`. Materializer expands to full metadata.

**Pros**:
- LLM stays in its strong zone — enum selection, shallow schema filling.
- Computing cost moves from LLM token-generation to deterministic materializer.
- Output consistency is enforced by the materializer.
- Validation passes more reliably (materializer produces conformant output by construction).

**Cons**:
- Patterns might not cover every case → need escape hatches.
- The pattern library has to be designed carefully; missing coverage forces escape, which is expensive.

### Decision: Model B, with a visible escape ladder

The deciding factor was **computing cost on deep JSON**. The LLM producing 50kb+ of 7-level-nested metadata under a forced build sequence is the worst possible workload — high token cost, easy to hit tool-call limits, easy to lose consistency mid-output. Model B eliminates that entirely for the 90% case.

Model A's "drop to raw" capability is preserved via an escape ladder (§7), but it's deliberately more expensive than the default path. The cost asymmetry steers the LLM toward patterns.

---

## 4. Layer architecture: why three layers, not two

After deciding on Model B, the next question is how to organize the implementation. Naive version: one materializer per pattern, each producing full metadata directly. This works but two problems emerge:

1. **Boilerplate repetition** — every materializer that uses a `Label` repeats the same 8–10 ControlType setup fields (`LabelType: "labeltext"`, `Caption`, `ControlStyle: "None"`, `isColumnCtrl: false`, empty `Width`/`Height`/`BgStyle`/`FontStyle` defaults). New atoms get authored by copying an existing one and tweaking — drift inevitable.
2. **Mixing concerns** — design decisions (semantic→token mapping) get tangled with engine contract (which fields the ControlType requires).

Three-layer solution:

| Layer | Responsibility | Example |
|-------|---------------|---------|
| `_base.controls.mjs` | Engine contract — "to emit ControlType X, the metadata must look like this" | `makeLabel({ text, name })` |
| `_base.style.mjs` | Design system — "this token translates to this metadata object" | `font({ size, weight, color })` |
| `<pattern>.materialize.mjs` | Design decision — "this pattern uses control X with tokens Y" | StatusChip = Label + semantic bg + pill |

### Why factory is separate from token helper

Two different domains:
- Factory answers: "what fields does the engine require for this ControlType?"
- Token helper answers: "what styling object does this design token become?"

Mixing them produces design-aware factories like `makeStatusChip()`, which:
- Duplicate the pattern schema's responsibility
- Hide design decisions inside a helper (materializer becomes one-liner `makeStatusChip(label, color)` with no visible reasoning)
- Force factories to know about design tokens, blurring the layer boundary

Keeping them split lets the materializer remain the single, readable place where "this pattern is this design" is expressed.

### Why factory ≠ atom

This is subtle but important. A factory is *not* a tiny atom. A factory is an internal author-facing helper. An atom is an LLM-facing semantic primitive. They serve different audiences:

- Factory: visible to whoever writes `<pattern>.materialize.mjs`
- Atom: visible to the LLM via schema

Confusing them led to the brief consideration of "one atom per ControlType" — which fails because:
- ControlType is engine-level (~10–15 enums)
- Atom is design-level (`StatusChip`, `Avatar`, `BadgePill` — meaningful units the LLM picks by intent)
- The relationship is N:M, not 1:1 (one Label → multiple atoms; one Avatar might use ImageBox + Label fallback)

---

## 5. Atom qualification: what earns atom status

Three tests (must satisfy ≥1):

1. **Semantic pickability** — the LLM would meaningfully choose this by intent. "Status indicator" → `status-chip`. But "text" → `label` is not a meaningful pick; the LLM doesn't think "I need a label," it thinks "I need this card's title."
2. **Slot suitability** — fits inside an organism's slot as a self-contained unit.
3. **Absorbs design decisions** — owns semantic→token mapping, geometry choices, or interaction state. Beyond just "wrap a ControlType with styling."

Fails all three → factory helper instead. This is why Label, Heading, Caption, Divider, Spacer are factories, not atoms — they're styling wrappers, not design primitives.

### Practical consequence

The first atom batch isn't "one atom per ControlType" (would be a bloated list of trivial wrappers). It's the design-schema primitives decided in the prior session:

`Button`, `Chip`, `Checkbox`, `RadioGroup`, `TextField`, `Switch`, `Tab`, `IconButton`

These each carry real design decisions (8px radius for CTA, pill geometry as Switch's intentional exception, dual focus-ring system, four IconButton variants) that an atom is the right place to encode.

---

## 6. Tier structure: why Atomic Design

Atomic Design (atom/molecule/organism) maps cleanly to Flextudio's compositional structure:

- **atom** — 1 control, no slots, 2–4 props. Engine-leaf primitives with design opinion.
- **molecule** — 2–5 controls, no slots, 4–8 props. Fixed compositions (`InfoRow` = label + value).
- **organism** — composition with slots. The unit of screen-level structure (`ListCard`, `FormSection`).

### Why the constraints

- **Atom has no slot** — if you need composition, you've crossed into molecule/organism territory. Keeps atoms a clear primitive.
- **Molecule has no slot** — same reason, applied to the next level. Composition is the organism's job. Allowing slots in molecules would create a third "composable" tier and blur the boundary.
- **Organism slots accept atom/molecule only** — preventing organism-in-organism keeps the composition tree at most three levels deep. Screen-level reuse is a different concern (a separate composition pipeline, not nesting).
- **Slot names are semantic** (`trailing`, `leading`, `footer` — not `slot1`/`slot2`) — the LLM picks slots by meaning; positional names force it to reason about layout, which is the pattern's job.

---

## 7. Escape hatches: a cost ladder

Coverage gaps are inevitable. The question is how the escape behaves.

Design principle: **escape must exist, but must cost more than the default path.** Otherwise the LLM will gravitate to raw output whenever it's faster — and we're back to Model A.

| Level | Mechanism | LLM cost | When |
|-------|-----------|----------|------|
| L0 | `pattern + props` | Lowest | Pattern fits |
| L1 | `pattern + props + override` (named-anchor deep-merge patch on materialized nodes) | Slightly higher (must pick an anchor + reason about field shape) | Pattern's structure fits, but needs a field the props don't expose (e.g. `UseMove`/`MoveSteps`, a data connection) or a small tweak |
| L2 | `pattern.escape.raw-control` | Much higher (must emit full control metadata, no token helpers available) | No pattern fits; one-off binding or event |
| L3 | Add a new pattern | Author cost, not LLM cost | L2 recurs for the same shape |

### Why this shape

- **L1 (override)** absorbs two cases without forcing pattern proliferation: the common "90% of pattern + small tweak" *and* injecting engine metadata the simplified props deliberately don't expose (data binding, navigation, one-off flags). Both are the same mechanism — a deep-merge patch onto a materialized node.
  - The patch is keyed by **anchor name**, not by mirroring the output tree. Every pattern supports `root` (the result's top node); multi-node patterns (molecules/organisms) expose semantic anchors for their children — e.g. `input-action` has `root` / `input` / `iconButton` / `badge`. The available anchors are listed in each schema's `override.propertyNames`.
  - Anchors exist because a naive root-only deep-merge can't reach into array children (`Contents[]` gets replaced wholesale, not merged). The materializer knows which built node is which anchor and merges there directly — see `_base.additional-meta.mjs`.
  - Validation: an injected field passes `[strict-fields]` as long as the field name is defined in *some* engine schema (the global `knownProps` union). A field defined nowhere (a typo) is still rejected — the escape is for real engine fields, not arbitrary keys. Caveat: the field must also be valid on the *node type* it lands on — e.g. `UseMove`/`MoveSteps` (Step navigation) is a Group-level feature, so inject it on a Group anchor (a molecule's `root` / a raw Group), not on an atom control. A field whose nested dynamic keys aren't covered by the target node's schema (e.g. `MoveSteps.StepN` on a Label) will fail strict validation on those keys.
  - Cheap to specify: `{ "input": { "UseDataConnection": true } }` or `{ "root": { "FontStyle": { "FontSize": "16" } } }`.
- **L2 (raw-control)** is the (A)-model raw-output capability, reframed as a single named escape pattern. The reframing matters: it makes the cost visible (LLM must populate ~30 fields with no helpers), and it routes through the same validate / materialize path as everything else.
- **L3** is the maintenance signal: if the same L2 invocation recurs, the pattern library has a gap. Add the pattern; remove the escape.

### Measurement as a coverage signal

In Phase 4 validation (rewriting 4 example scenarios), L1 and L2 usage rates become a coverage metric:
- L1 > 10% → pattern shapes don't quite match real cases; add variants or relax schema
- L2 > 1% → real coverage gaps; add atoms/molecules

This is the feedback loop that grows the library to fit actual usage, instead of guessing.

---

## 8. Documentation philosophy

Decision: **no separate `.md` files per pattern.** The schema's `description` field is the doc.

Reasoning:
- Two-file maintenance (`.schema.json` + `.md`) inevitably drifts.
- Schema descriptions can be multi-paragraph; nothing forces them to be one-liners.
- The LLM consumes schemas by reading the static skill assets (`schemas/`, `patterns/`); putting docs anywhere else means the LLM never sees them.
- `examples` field carries concrete usage; `x-related` carries cross-references. Together with `description` this matches the information density of a typical component `.md`.

The cost is that schema files become longer (~30–80 lines for a typical atom). The benefit is single-source documentation that's actually used.

---

## 9. Migration sequencing: why strict order

The deprecation must happen *after* the replacement is built. Specifically: removing `assets.json` before the pattern library is functional destroys the `deprecated → replacedBy` token mappings (gray, gray-middle, gray-light, gray-6) that normalize legacy metadata.

Order:
1. Build pattern library (helpers → atoms → molecules → organisms)
2. Wire the CLI (`flex-scenario`) + skill assets
3. Salvage migration data into `migrations.json`
4. Verify on real scenarios
5. Only then deprecate

Phase 1 has its own internal order: factories must exist before atoms can use them; `_base.materialize.mjs` (slot resolution) must exist before organisms can be authored. Building atoms before factories means writing raw metadata literals, defeating the purpose.

---

## 10. Reading order for re-entry

If you're picking up this work in a future session:

1. This document (rationale)
2. `patterns-development-guide-v2.md` (implementation brief)
3. `DESIGN.md` (tokens — single source of truth)
4. `catalog.json` (engine enums)
5. `examples/enhanced/search-period-popup.json` (a working scenario; ground truth for what valid metadata looks like)
6. `validate.mjs` (the actual contract — 16 cross-checks)