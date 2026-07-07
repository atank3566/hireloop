# Flextudio scenario styling
 
## Modes — pattern / design / raw

For each unit in `Contents[]`, pick ONE styling mode:

| Mode | Form | When |
|---|---|---|
| **Pattern** (preset) | `{ "<patternName>": { ...props } }` | Recurring unit, consistency matters (every CTA, every status badge). Pattern owns its style. |
| **`design` key on raw control** | `{ "ControlType": "Label", "labeltext": "...", "design": { font: "body-large", color: "body" } }` | One-off control. Default for ad-hoc visuals. |
| **Raw style fields** | `{ "ControlType": "Label", "labeltext": "...", "FontStyle": { ... }, "Width": { ... } }` | Only when `design` cannot express the case |

The materializer expands `design` to raw style fields before validation.

```jsonc
// Same Label, three forms
{ "button": { "label": "확인", "variant": "primary", "width": "full" } }                          // pattern
{ "ControlType": "Label", "labeltext": "확인", "design": { "font": "title-medium", "w": "full" } } // design
{ "ControlType": "Label", "labeltext": "확인", "FontStyle": { "UseFont": true, ... } }             // raw — verbose
```

## The `design` key

A short stylesheet attached to any raw control or raw Group.

## `design` key — slots
 
| key | format | maps to |
|---|---|---|
| `font` | typography role | `FontStyle.FontSize` + `FontWeight` |
| `color` | text color slot | `FontStyle.FontColor` |
| `align` | `start` / `center` / `end` | `FontStyle.FontAlign` |
| `w`, `h` | `full` / `text` / `<n>px` / `<n>%` / `<n>vh` / `<n>vw` | `Width` / `Height` |
| `p`, `m` | CSS shorthand `"16"` / `"16 20"` / `"16 20 8 4"` (TRBL) or `{t,r,b,l}` | `Padding` / `Margin` |
| `bg` | surface color slot | `BgStyle.BgColor` (auto `UseBackground:true`) |
| `border` | slot \| `false` \| `"none"` \| `{ color, type?, size? \| sides? }` | `BorderStyle` |
| `radius` | non-neg int string, or `{ tl?, tr?, br?, bl? }` | `BorderStyle.BorderRadius` (uniform or per-corner) |
| `elevation` | `rect-shadow` / `radius-shadow` | `ContentStyle` |
| `flex` | `{ dir, gap?, align?, valign? }` — **Group only** | `DisplayStyle` |
| `caption` | `{ text?, font?, color?, pos?, align? }` | `text`→root `Caption` (content); 나머지→`CaptionStyle` (auto `UseDesign:true`). 한 행에서 다른 컨트롤과 묶을 땐 캡션 대신 라벨을 상위로 — §Layout "Captioned input in a row" |
| `abs` | `{ t?, r?, b?, l? }` | `UseAbsoluteLayout:true` + `AbsolutePosition` |
| `opacity` | int 0..100 | `UseOpacity:true` + `OpacityValue` |
| `itemBg` | color slot — CheckBox/RadioBox only | `ItemBgStyle` |
| `tabHeader` | `{ container?, selectedContainer?, item?, selectedItem? }` — Tab only | `TabHeader*` family |
| `fixed` | boolean | `UseFixedSize` |
| `surface` | `flat` / `outlined` / `elevated` — **Group only** | expands to `bg`+`border`+`radius`+`elevation` |
 
For inner shape details (`border.sides`, `flex.dir/gap/align/valign`, `caption.pos`, `tabHeader.*`), read `design.schema.json` or validate with `flex-scenario validate --schema design`.

## Slot enums (names only — pixel mappings in §Colors / §Typography below)
 
**Color** (text / bg / border share one enum; slot taxonomy guides intent):
- Brand: `main`, `main-light`, `sub`, `sub-light`
- Surface: `canvas`, `card`, `subtle`, `surface-strong`, `dark`
- Hairline (border): `hairline`, `hairline-soft`, `hairline-strong`
- Text (color): `ink`, `body`, `body-soft`, `muted`, `on-brand`
- Semantic: `warning`, `preview`, `success`, `error`
**Typography roles** (`font`): `display-large/medium/small`, `title-large/medium`, `body-large` (default body anchor), `body-medium`, `body-small`, `caption`, `micro`. Closed enum — no separate weight override. For non-listed combos (e.g. 14px SemiBold), escape to raw `FontStyle`.
 
**Radius**: `"0"` / `"4"` / `"8"` / `"12"` / `"16"` (default cards) / `"20"` / `"9999"` (pill — auto `RadiusSet:"None"`)
 
**Spacing** (base 4px): `4` / `8` / `12` / `16` / `20` / `24` in `p`, `m`, `flex.gap`.

## Rules
 
- **Slot-only inside `design`.** Raw `var(--...)` / hex / arbitrary px are Ajv-rejected. Use slot names; escape to raw style fields if truly needed.
- **`design` wins on overlap** (leaf-level merge). Non-overlapping raw leaves preserved.
- **`flex` and `surface` are Group-only.** Putting either on a Control raises `kind:"design"` error.
- **Column is default.** Omit `flex` for vertical stacks.
- **Border / radius uniform vs per-side mutually exclusive.** `border` rejects `size` + `sides` together; `radius` rejects string + `{tl,tr,br,bl}` together.

### Layout & sizing semantics

- **Step padding.** Every Step body comes with 20px horizontal padding out of the box (no need to set it). For edge-to-edge content, set the Step padding to **0**:

```json
"Padding": {
  "All": "0",
  "SizeUnit": "px",
  "UseEach": "false",
  "UseAuto": "true"
}
```

Add this inside the Step JSON.
- **Row sibling width rule.** Inside `design: { flex: { dir:"row", ... } }`, the renderer can stretch any *content-sized* child (anything not declaring an explicit `w`) to claim leftover flex space, which squeezes a sibling that asked for `w: "full"`. To prevent this, set `design: { fixed: true }` on every content-sized child in a row. Children with explicit `%` widths (`"50%"`, etc.) need no `fixed` flag.

- **Gap defaults to 0.** Multi-child rows need explicit `flex.gap`. Omit only when (a) a child has `w: "full"` (claims the row alone), or (b) `align:"between"` (renderer distributes inter-child space).
- **Reach for molecule patterns first.** `input-button`, `input-pair` encode gap + `fixed` invariants internally — author hand-rolled rows only after checking the pattern catalog (`patterns/index.json`).

- **Captioned input in a row — lift the label out.** `design.caption` (default `pos:"top"`) grows the control's *box* by the caption height (the materializer adds ~24px to a px `h` to keep the input body at its intended size). Fine for a standalone field, but inside `flex: { dir:"row" }` it breaks vertical alignment: a sibling — typically a button — centers against the *caption-inflated* box, so it sits too low relative to the input body. When an input shares a row with another control, **do not put the label on the input via `design.caption`.** Lift the label to a sibling Label above the row:

```jsonc
// field block — label on top, input + action centered in the row below
{ "ContentsType": "Group",
  "design": { "flex": { "dir": "column", "gap": 4 }, "w": "full" },
  "Contents": [
    { "ControlType": "Label", "labeltext": "부서",
      "design": { "font": "body-small", "color": "body-soft", "w": "full", "h": "text" } },
    { "ContentsType": "Group",
      "design": { "flex": { "dir": "row", "gap": 8, "valign": "center" }, "w": "full" },
      "Contents": [
        { "ControlType": "InputText", "Placeholder": "부서명 검색",
          "design": { "w": "full", "h": "48px", "border": "hairline-strong", "radius": "8" } },   // no caption
        { "ControlType": "Button", "labeltext": "검색",
          "design": { "h": "48px", "fixed": true } } ] } ] }
```

  Row rules: give the input and the adjacent control the **same explicit `h`** (e.g. `"48px"`), set `valign:"center"`, set `fixed:true` on the content-sized control (Row sibling width rule), and space label↔row with the column `gap:4`. Keep `design.caption` only for a **standalone** input with no adjacent control in the same row.

### Elevation patterns (composition of slots)

| Level | Compose with | Use |
|---|---|---|
| Flat (canvas) | (no `bg`, no `border`) | Step body |
| Card | `bg: "card"` + `border: "hairline"` + `radius: "16"` | Content cards |
| Subtle band | `bg: "subtle"` | Section grouping |
| Hairline-only outline | `border: "hairline"` + `radius: "12"` | Card outline without fill |
| Shadow card | above + `elevation: "rect-shadow"` (or `"radius-shadow"`) | Floating cards |
| Dark inversion | `bg: "dark"` + `color: "on-brand"` | Strong CTAs, featured cards |

No custom shadows, gradients, or blurs. `elevation` accepts engine-preset slots only.

### `surface` preset — named elevation recipe (Paper)

`design.surface` packages the elevation recipe above into one named handle, so every elevated container is consistent (MUI Paper 영감). **Group only** — it styles a container surface; on a Control it raises a `kind:"design"` error. Expands to `bg`+`border`+`radius`+`elevation`:

| `surface` | expands to | Use |
|---|---|---|
| `flat` | `bg:"card"` + `radius:"16"` | Filled surface, no outline/shadow |
| `outlined` | `bg:"card"` + `border:"hairline"` + `radius:"16"` | Card outline |
| `elevated` | `bg:"card"` + `radius:"16"` + `elevation:"radius-shadow"` | Floating card (Paper) |

The preset is a **baseline** — any explicit `bg`/`border`/`radius`/`elevation` key on the same `design` overrides it (`{ "surface":"elevated", "radius":"20" }` → elevated recipe with 20px corners). The engine has no shadow-depth scale (only `rect-shadow`/`radius-shadow`, differing by corner shape), so `surface` is a closed 3-variant enum, not a numeric elevation.

```jsonc
// Elevated Paper container — styled Group, freeform children
{ "ContentsType": "Group",
  "design": { "surface": "elevated", "p": "16", "flex": { "dir": "column", "gap": 12 } },
  "Contents": [ /* patterns · raw controls · nested Groups */ ] }
```

`surface` is Group-only, same as `flex`. Wrap content in a Group; do not put `surface` on a Control.

---

## Colors

The slot enum for `design.color` (text), `design.bg` (surface), `design.border` (outline).

### Brand & Accent
- **`main`** (`var(--colorMain)`) — Primary CTA fill, active state. Default green; per-tenant overridable.
- **`main-light`** (`var(--colorMainLight)`) — Soft primary surface (selected zone, hover).
- **`sub`** (`var(--colorSub0)`) — Secondary accent. Default purple; per-tenant overridable. Never on a CTA.
- **`sub-light`** (`var(--colorSub0Light)`) — Soft accent surface.

### Surface
- **`canvas`** (`var(--colorWhite)`) — Pure white screen floor.
- **`card`** (`var(--colorWhite)`) — Default card / sheet fill.
- **`subtle`** (`var(--colorGray9)`) — Section background.
- **`surface-strong`** (`var(--colorGray10)`) — Chip / badge default fill.
- **`dark`** (`var(--colorBlack)`) — Dark feature cards, emphasized featured rows.

### Hairlines (border slot)
- **`hairline`** (`var(--colorGray5)`) — Default 1px divider, card outline.
- **`hairline-soft`** (`var(--colorGray9)`) — Lighter divider — section breaks within a card.
- **`hairline-strong`** (`var(--colorGray4)`) — Stronger panel outline — interactive boundary, focus.

### Text (color slot)
- **`ink`** (`var(--colorBlack)`) — Strong emphasis, icon stroke.
- **`body`** (`var(--colorGray1)`) — Heading / body emphasis.
- **`body-soft`** (`var(--colorGray3)`) — Subtitle, label, caption — most used.
- **`muted`** (`var(--colorGray4)`) — Placeholder, disabled, soft meta.
- **`on-brand`** (`var(--colorWhite)`) — Text on Main / Sub / Semantic fill.

### Semantic
- **`warning`** (`var(--colorSub4)`) — Caution / pending state.
- **`preview`** (`var(--colorSub3)`) — "Preview" tag, in-progress flag.
- **`success`** (`var(--colorSub1)`) — Confirmation, approved state.
- **`error`** (`var(--colorSub2)`) — Validation error, destructive action.

All four color slot groups share one enum — `design.bg: "ink"` is technically accepted (Ajv won't reject), but semantically use Surface for `bg`, Text for `color`, Hairlines for `border`. The slot taxonomy guides intent.

---

## Typography

The role enum for `design.font`. Anchored at **16px body** (1rem).

| Role | `FontSize` | `FontWeight` | Use |
|---|---|---|---|
| `display-large` | `"28"` | `"SemiBold"` | Step header, hero title |
| `display-medium` | `"24"` | `"SemiBold"` | Section heads |
| `display-small` | `"20"` | `"SemiBold"` | Sub-section heads |
| `title-large` | `"18"` | `"SemiBold"` | Card group titles |
| `title-medium` | `"16"` | `"SemiBold"` | Card titles, list labels |
| `body-large` | `"16"` | `"Regular"` | Default body — anchor |
| `body-medium` | `"14"` | `"Regular"` | Sub body, input text |
| `body-small` | `"13"` | `"Regular"` | Caption, secondary meta |
| `caption` | `"12"` | `"Regular"` | Photo captions, footer text |
| `micro` | `"11"` | `"Medium"` | Section labels, badges (sparing) |

---

## Shapes — `design.radius` scale

Emit as integer **string** to `design.radius`. The materializer sets `BorderStyle.BorderRadius` directly; pill geometry gets `RadiusSet: "None"` auto-applied.

| `design.radius` | Use |
|---|---|
| `"0"` | Flat — no radius |
| `"4"` | Inline tags |
| `"8"` | Form inputs, CTA buttons, chips |
| `"12"` | Default cards, code blocks |
| `"16"` | Main cards — most used |
| `"20"` | Strong cards, sheets |
| `"9999"` | Badges and avatar plates (pill) — auto `RadiusSet:"None"` |

---

## Spacing system

The integer values emitted in `design.p` / `design.m` / `design.row.gap`.

- **Base unit:** 4px. Padding / margin values are quantized to **4×n**.
- **Allowed values:** `4` · `8` · `12` · `16` · `20` · `24`. Author other values only with strong reason.
- Every Group and Control already carries an engine-default inset — only set `p` / `m` when the design demands tighter or looser fit.

Typical gap values: `"8"` for tight pairs, `"12"`–`"16"` for card grids.

You need to know the step has a default 20px horizontal padding.

---

## Raw escape — when `design` cannot express it
 
Read the full raw shape from `group.schema.json` / `control/<name>.schema.json`.
 
| Need | Raw target |
|---|---|
| Non-default FontWeight (14px SemiBold etc.) | `FontStyle: { FontSize, FontWeight, ... }` |
| `LetterSpacing` (자간) | `FontStyle.LetterSpacing` |
| Image background | `BgStyle: { UseImage:true, Image:{...} }` |
| Non-slot color (brand hex) | raw `FontColor` / `BgColor` |
| Mixed `BorderType` per side | `BorderStyle` directly |
| `FlexWrap` independent of `dir` | `DisplayStyle: { ..., FlexWrap:true }` |
| Per-item CheckBox/RadioBox styling | author `Items[*]` raw |
| Tab legacy `ArrangeItems` | raw string field |
 
**Raw field-name traps** (strict-fields rejects invented variants):
- `Padding` / `Margin` use **`Btm`**; `BorderStyle` uses **`Bottom`** (asymmetric)
- `BorderStyle` toggle is **`Useborder`** (lowercase `b`)
- `CaptionStyle` toggle is **`UseDesign`** (not `UseCaption`)
- No `UseMargin` / `UseBorder` / `UseCaption`

## Examples
 
```jsonc
// Body Label
{ "ControlType": "Label", "labeltext": "{=Name}",
  "design": { "font": "body-large", "color": "body", "w": "full", "h": "text" } }
 
// Card Group — padded white surface with hairline outline
{ "ContentsType": "Group",
  "design": { "p": "16", "bg": "card", "border": "hairline", "radius": "16" },
  "Contents": [ ... ] }
 
// Row with space-between + 8px gap
{ "ContentsType": "Group",
  "design": { "flex": { "dir": "row", "align": "between", "valign": "center", "gap": 8 }, "p": "12 16" },
  "Contents": [ ... ] }
 
// Tab with underline selection
{ "ControlType": "Tab",
  "design": {
    "tabHeader": {
      "container":    { "arrange": { "type": "equal" }, "bg": "card", "p": "0 16" },
      "item":         { "font": "body-medium", "color": "body-soft", "align": "center", "p": "12 0" },
      "selectedItem": { "color": "main", "border": { "color": "main", "sides": { "b": "2" } } }
    }
  } }
```