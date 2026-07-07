# BottomButtons

Step 의 **하단 고정 버튼 채널**. `Step.BottomButtons` 배열의 각 항목 = 하나의 `BottomButton` 객체.

## 식별

- 위치: `Scenario.Steps[StepId].BottomButtons[*]`
- 토글: 같은 Step 의 `UseBottomButton: true` (false 면 빈 배열만 허용)
- 부모: **Step 의 직접 자식**. `Contents` / `FixedContentsTop` / `FixedContentsBottom` 의 자식 아님.
- StepSub 에서는 `UseBottomButton: false` 자동 강제 → BottomButtons 사용 불가.

## 스키마

`bottom-buttons.schema.json` — 단일 BottomButton 객체 정의. Step 스키마는 `BottomButtons: { type: "array", items: { $ref: "bottom-buttons.schema.json" } }` 로 합성.

## 핵심 필드

| 키 | 타입 | 비고 |
|---|---|---|
| `Id` | `f_숫자` | 🔴 필수, 시나리오 전체 유일 |
| `ButtonName` | string | 화면 표시 텍스트, 다국어 `{{}}` 권장 |
| `MoveTo` | enum | `Next` \| `None` \| `Prev` \| `Prev_ReStart` \| `Init` |
| `Next` | object | `MoveTo="Next"` 일 때 **필수**. `{ MoveStepOrder: ["StepN"], StepN: "" }` — **슬롯 값은 빈 문자열** |
| `Prev` | object | `MoveTo="Prev"` / `"Prev_ReStart"` 일 때 **필수**. `{ MoveStepOrder: [] }` |
| `Direction` | string | 네비게이션 방향 보조값. Next 버튼 canonical emit 은 `""` |
| `IsRestored` | bool / `""` | 콜렉션 이전 상태로 복원 (취소/Prev 흐름). Flextudio canonical emit 은 `""` |
| `IsIgnoreRequired` | bool | `MoveTo="Next"` 시 필수입력 검증 무시 여부. Flextudio Next 버튼 canonical emit |
| `IsRequired` | bool | `MoveTo="Prev"`/`"Prev_ReStart"` 시 필수입력 보존 여부 |
| `Events` | object | `{ "Click": "핸들러명" }`. UseEvents 토글 없이 직접 사용 |
| `LoadScript` | string | 동적 표시/숨김 (`f.bottom().style().display(...)`) |
| `Width`, `Height` | sizeObject | 버튼 크기 |
| `Padding`, `Margin` | spacing | 여백 |
| `BgStyle`, `FontStyle`, `BorderStyle` | style | 시각 스타일 |
| `ImageStyle` | object | ⚠️ **렌더링 시 적용 제외** (`bottombuttons.js`). 신규 생성 시 누락 권장 |
| `UseFixedSize` | bool | 고정 크기 사용 |
| `UseDesign` | bool | 디자인 묶음 적용 |

## MoveTo 분기 규칙 (상호배타)

| MoveTo | 동작 | top-level 키 (반드시) | top-level 키 (금지) |
|---|---|---|---|
| `Next` | 다음 Step 으로 이동 | `Next.MoveStepOrder` (1개 이상) + 각 StepN 슬롯 `""` | `Prev` |
| `Prev` | 이전 Step 으로 이동 | `Prev` (보통 `{ MoveStepOrder: [] }`) | `Next` |
| `Prev_ReStart` | 이전 Step 이동 + 재시작 | `Prev` | `Next` |
| `None` | 이동 없음, 이벤트만 실행 | (없음) — `Events.Click` 권장 | — |
| `Init` | 시나리오 처음 Step 이동 | (없음) | — |

> ⚠️ **Next 버튼에 placeholder Prev 박지 말 것**. 그 반대도 마찬가지. Flextudio 스튜디오는 한 쪽만 emit 한다.

## 핵심 함정 (LLM 생성 실패 사례)

1. **`Next.Step{N}` 슬롯 값이 빈 객체 `{}` 가 아니라 빈 문자열 `""`**:
   ```jsonc
   // ❌ 잘못됨 — schema 거부
   "Next": { "MoveStepOrder": ["Step2"], "Step2": {} }

   // ✅ canonical
   "Next": { "MoveStepOrder": ["Step2"], "Step2": "" }
   ```
   문자열을 받는 이유는 조건/Direction 등 향후 슬롯 확장 여지가 있기 때문 (현재 엔진 emit 은 `""`).

2. **MoveTo=Next 인데 placeholder `Prev: { MoveStepOrder: [] }` 까지 emit** → schema 거부.

3. **MoveTo=Next 인데 `Direction` / `IsIgnoreRequired` 누락** — schema 가 강제하진 않지만 Flextudio canonical 형태에 맞추려면 함께 emit.

## Canonical 키 순서 (Flextudio emit 순서)

JSON 자체는 키 순서를 강제하지 않지만, 가능하면 Flextudio 스튜디오 emit 순서로 작성:

```
Id → ButtonName → MoveTo → (스타일 키: Width/Height/Padding/Margin/BgStyle/BorderStyle/FontStyle)
   → IsRestored → IsIgnoreRequired → Direction → Next | Prev
```

## 예시

### 1) 다음 Step 으로 이동 (canonical)

```jsonc
{
  "Id": "f_7",
  "ButtonName": "{{등록}}",
  "MoveTo": "Next",
  "Width": { "SizeValue": 100, "SizeUnit": "%" },
  "BgStyle": { "UseBackground": true, "BgColor": "var(--colorMain)" },
  "IsRestored": "",
  "IsIgnoreRequired": false,
  "Direction": "",
  "Next": {
    "MoveStepOrder": ["Step2"],
    "Step2": ""
  }
}
```

### 2) 이전 Step (저장 후 복귀)

```jsonc
{
  "Id": "f_13",
  "ButtonName": "{{취소}}",
  "MoveTo": "Prev",
  "Width": { "SizeValue": 100, "SizeUnit": "%" },
  "IsRestored": "",
  "Prev": { "MoveStepOrder": [] }
}
```

### 3) 이벤트만 실행 (이동 없음)

```jsonc
{
  "Id": "f_2",
  "ButtonName": "{{승인}}",
  "MoveTo": "None",
  "Events": { "Click": "saveAndApprove" }
}
```

## Step 트리에서의 위치

```
Steps[StepN]
├── UseBottomButton: true        ← 토글
├── StepButton: { ... }          ← 영역(컨테이너) 스타일
├── BottomButtons: [             ← 본 스키마
│     { Id, ButtonName, MoveTo, ... },
│     ...
│   ]
├── Contents: [...]              ← 별개 (메인 영역)
├── FixedContentsTop: [...]
└── FixedContentsBottom: [...]
```

`StepButton` 은 BottomButtons 영역 자체(컨테이너)의 스타일 묶음이며, 개별 버튼은 BottomButtons 배열의 각 항목이 본인 스타일(`BgStyle` 등)을 따로 가진다.

## 제약

1. **Id 유일성**: 시나리오의 모든 컨트롤/버튼과 충돌 금지 (`^f_[1-9][0-9]*$`).
2. **StepSub 금지**: StepSub Step 은 자체 화면이 없으므로 BottomButtons 비어있어야 함.
3. **MoveTo 별 키 상호배타**: `MoveTo="Next"` 이면 top-level `Next` 만, `MoveTo="Prev"/"Prev_ReStart"` 이면 top-level `Prev` 만 (반대편 키 emit 금지 — schema if/then 으로 강제).
4. **`MoveTo='Next'` + `Next.MoveStepOrder` 1개 이상**: 후보 Step 이 없으면 클릭 시 동작 없음.
5. **`Next.Step{N}` 슬롯 = 문자열**: canonical 빈 문자열 `""`. 빈 객체 `{}` 는 schema 가 거부.
6. **자기 자신 Step 참조**: BottomButton 의 `Next` 객체는 임의 Step 참조 가능 (`Step.Next` 의 forward-only 규칙과 별개). 단, 자기 자신 StepId 참조는 후검증에서 차단.
7. **ImageStyle 효과 없음**: 런타임(`bottombuttons.js`) 이 의도적으로 ImageStyle 적용을 건너뜀.

## 런타임 매핑

- 메타 키 ↔ 런타임 상수 (`public/engine/common/const.js`)
  - `BottomButtons` ↔ `K_BOTTOMBUTTONS`
  - `UseBottomButton` ↔ `K_USE_BTMBUTTON`
  - `ButtonName` ↔ `K_BUTTONNAME`
  - 컴포넌트 단위 ↔ `COMPONENT_UNIT.BOTTOMBUTTON = 'BottomButton'`
- 렌더러: `public/engine/runtime/bottombuttons.js` `renderBottomButtons()`
- fquery 컨트롤 함수: `fControlFuncs['bottom']` (`name()`, `style()` 등) + `fControlFuncs['common']`
