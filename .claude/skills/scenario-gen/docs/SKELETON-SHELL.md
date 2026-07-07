# Scenario shell — outer wrap of every scenario JSON

> The outer wrap — ScenarioMeta + `Steps` map + each Step's metadata — is **always raw**. Use the skeleton below; schemas (`scenario.schema.json`, `step.schema.json`, `bottom-buttons.schema.json`) are the validation contract.

## 1. Canonical scenario skeleton (copy → fill `…`)

```jsonc
{
  // ─── ScenarioMeta — top-level fixed slots (DO NOT vary const fields) ───
  "modules":           {},                    // ★ const {}
  "htmlkey":           "stephtml",            // ★ const "stephtml"
  "ScenarioTitle":     "",                    // ★ const "" — display name lives in fScenarioName
  "fConverterVersion": 1,                     // ★ const number 1 (not string)
  "fScenarioName":     "…",                   // display name (free string)
  "Collections":       {},                    // ★ const {} — engine fills at runtime
  "FlexSQLService":    {},                    // ★ const {}
  "ServiceBinding":    {},                    // ★ const {} — [no-service] strict

  // ─── Steps routing ───
  "StartSteps":        ["Step1"],             // ≥1 required when Steps non-empty

  // ─── Steps map (keys: ^Step[1-9][0-9]*$) ───
  "Steps": {
    "Step1": {
      "StepName":   "…",                       // internal name
      "StepType":   "StepView",                // "StepView" | "StepSub". Always author explicitly
      "StepRow":    0,
      "StepCol":    0,
      "Contents":   [                          // pattern invocations + raw Groups
        // { "<patternName>": { ...props } }
        // { "ContentsType": "Group", "UseDataConnection": false, "Contents": [ … ] }   // raw Group fallback — UseDataConnection 필수(생략 시 [group-dc])
      ],
      "Next":            ["Step2"],            // forward-only StepIds. [] for terminal
      "UseStepHeader":   false,                // true ⇒ author StepTitle
      "UseBackButton":   false,                // StepSub forces false
      "UseBottomButton": false,                // StepSub forces false
      "UseEvents":       false,                // true ⇒ Events is object (§3); false ⇒ Events is []
      "Events":          []
    }
  },

  // ─── Optional top-level slots ───
  "Language":     {},                          // i18n map for {{key}} substitution
  "Events":       {},                          // scenario-level handlers — Script / LinkedEvent only (NO Service/API)
  "DataSources":  {},                          // for Combo / RadioBox / Search / Tree
  "Scenario":     { "StyleURLs": [] },         // external JS lib URLs
  "Panel": {                                   // data model slot — AI emits empty shapes
    "Collection":    { "Ckeys": [] },
    "Category":      {},
    "CategoryOrder": [],
    "Table":         [],
    "ExternalTable": [],
    "AuthKey":       []
  }
}
```

**Common rejections by `flex-scenario validate`:**
- ❌ Scenario name in `ScenarioTitle` → must be `""`; use `fScenarioName`
- ❌ `fConverterVersion: "1"` string → must be number `1`
- ❌ `ServiceBinding: { ... }` non-empty → must be `{}` ([no-service])
- ❌ Missing `StartSteps` when `Steps` non-empty
- ❌ `Collections` or `Panel.Collection.Ckeys` non-empty
- ❌ Authoring `EmbedScenarioPrefix` → schema forbids the key

## 2. Step shape

StepId pattern: `^Step[1-9][0-9]*$`. Always author `StepType: "StepView"` explicitly unless embedding a sub-scenario.

| Field | Type | Notes |
|---|---|---|
| `StepName` | `string` | Always author — internal display name |
| `StepType` | `"StepView"` \| `"StepSub"` | Omit ⇒ runtime treats as StepView |
| `Contents` | `Group[]` | Page body — patterns + raw Groups |
| `Next` | `string[]` | Forward-only StepIds. `[]` for terminal |
| `StepTitle` | `string` | Only with `UseStepHeader: true` |
| `UseStepHeader` | `boolean` | Top header toggle |
| `FixedContentsTop` | `Group[]` | Sticky top region (top-bar pattern) |
| `FixedContentsBottom` | `Group[]` | Sticky bottom — canonical place for primary `button` atom |
| `UseBackButton` | `boolean` | + author `BackButton` block. **StepSub forces false** |
| `UseBottomButton` | `boolean` | + author `BottomButtons[]` for fixed-bottom CTAs. **StepSub forces false**. For *inline body* buttons use the `button` pattern instead |
| `UseEvents` | `boolean` | See §3. **StepSub forces false** |

Step-level styling (`Padding` / `Margin` / `BgStyle`, plus dialog-only `Width` / `Height`) uses **raw** shapes. Engine defaults usually fit — author only when overriding. Read `step.schema.json` for shapes.

## 3. `Step.Events` shape

```jsonc
// UseEvents: true → Events is an OBJECT
{
  "UseEvents": true,
  "Events": {
    "StepEventOrder": ["Init", "Loaded"],     // enum the events that fire
    "Init":           "handlerName_a",        // required for each entry in StepEventOrder (matching key)
    "Loaded":         "handlerName_b"
  }
}

// UseEvents: false → Events MUST be an empty ARRAY (not {})
{ "UseEvents": false, "Events": [] }
```

Event enum (6): `Init` / `Loaded` / `OnBackLoaded` / `OnLeave` / `OnForeground` / `ScrollEnd`.
Each handler name must exist in scenario-level `Events` — else `[event-ref]` fails.

**Common mistakes:**
- ❌ `UseEvents: false, Events: {}` → must be `[]`
- ❌ Listing `"Init"` in `StepEventOrder` without the matching `"Init": "handler"` key
- ❌ Authoring `"Init"` handler key but omitting it from `StepEventOrder` (won't fire)

## 4. When to fetch full schemas

The §1 skeleton covers ~95%. Read the schema file directly for edge cases:

- `scenario.schema.json` — top-level scenarioMeta
- `step.schema.json` — single Step. Required for **StepSub** (`Protocol` block) and **Dialog variants** (`StepDialogType: "SlideUp"` / `"PopUp"` — unlocks `useDim` / `dimTransp` / `Width` / `Height` / `PopupPosition`)
- `bottom-buttons.schema.json` — BottomButtons[] item
- `group.schema.json` — raw Group
- `data-sources.schema.json` — DataSources map
- `events.schema.json` — Action shapes for scenario-level Events