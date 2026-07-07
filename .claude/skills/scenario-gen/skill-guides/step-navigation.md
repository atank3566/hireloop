# Step 이동 가이드

> 헤더 뒤로가기·하단 버튼·리스트 카드 클릭 등 Step 간 이동을 메타 채널로 표현하는 법.
> 진실원본: [schema/v1/step.md](../schema/v1/step.md) · [runtime/v1/script/scenario-gen-rules.md §3](../runtime/v1/script/scenario-gen-rules.md) · [core/validators.mjs](../core/validators.mjs) (`checkBackButtonStandard`, `checkStepNavigationSources`)

## 개념 — 이동은 전부 메타 선언

스크립트의 `Current.step.moveToNext(...)` / `moveToPrev(...)` 같은 명령형 호출은 **모두 금지**. 모든 Step 이동은 다음 4 채널 중 하나로 선언한다.

| 트리거 | 메타 채널 | 사용처 |
|---|---|---|
| **헤더 뒤로가기** | `Step.UseBackButton:true` + `Step.BackButton:{...}` | 상단 헤더의 ◀ 백 버튼. iOS/Android 스와이프 백과 함께 표준 |
| **하단 버튼** | `Step.BottomButtons[*].MoveTo:"Next"\|"Prev"\|"Prev_ReStart"` + `Next.MoveStepOrder:[...]` | 풋터 영역의 "다음" / "취소" / "재시작" 버튼 |
| **리스트 카드 클릭** | 카드 Group 에 `UseMove:true` + `MoveSteps.MoveStepOrder:[...]` + 각 Step 의 `MoveTo:"Next"` | 리스트 항목 탭 → 상세 진입 |
| **탭 전환** | `Tab.Items[].LinkedStepId` | Tab 컨트롤의 하위 Step 진입 |

> Step 자체의 `Next` 배열에 선언된 모든 타깃은 위 4 채널 중 하나로 **트리거가 살아 있어야** 한다. validator `[step-nav]` 가 정합 검사.

## 권장 방식 — 기본적으로 이렇게

### A. 상세/편집/카트 Step 의 뒤로가기 — 표준 헤더 백버튼

```jsonc
"Step3": {
  "UseStepHeader": true,
  "StepTitle":     "메뉴 상세",
  "UseBackButton": true,
  "BackButton": {
    "Next":           "None",
    "IsRestored":     true,
    "BackButtonMode": "Step",
    "BackButtonEvent":"undefined"
  },
  // ...
}
```

- `Next: "None"` → 직전 스텝(PrevStack) 으로. 명시 StepId 도 가능하지만 보통 `"None"`.
- `IsRestored: true` → 뒤로갈 때 컬렉션 상태 복원.
- `BackButtonMode: "Step"` 이 기본. 커스텀 로직(저장 확인 등) 이 필요하면 `"event"` + `BackButtonEvent`.

### B. 하단 "이전" / "확인" 버튼

```jsonc
"BottomButtons": [
  {
    "ContentsName": "ConfirmBtn",
    "MoveTo": "Next",
    "Next": { "MoveStepOrder": ["Step5"], "Step5": { "Condition": "" } },
    // ...
  },
  {
    "ContentsName": "CancelBtn",
    "MoveTo": "Prev",
    // ...
  }
]
```

### C. 리스트 카드 → 상세 (서브그룹 이동 패턴)

```jsonc
// Step2 (리스트) 의 카드 Group
{
  "ContentsType": "Group",
  "ContentsName": "MenuCard",
  "UseDataConnection": true,
  "UseMove": true,
  "MoveSteps": {
    "MoveStepOrder": ["Step3"],
    "Step3": { "Condition": "", "MoveTo": "Next" }
  },
  // ... 카드 본문 컨트롤
}
```

## 더 좋게 — 한 단계 끌어올리는 법

- **헤더 뒤로가기는 무조건 표준 채널**. `UseBackButton:true` 한 줄로 끝나는 걸 커스텀 Group + UseMove + MoveTo:"Prev" 로 7줄 박지 말 것.
- **`IsRestored` 의도 분명히**. 폼 저장 후 메인 리스트로 돌아갈 때 입력 임시 상태가 남아 있으면 안 되면 `IsRestored:true`, 카트처럼 누적 상태를 유지하고 싶으면 `false`.
- **`BackButtonMode:"event"` 는 진짜 필요한 경우만**. "저장 안 한 변경 있음, 정말 나가시겠습니까?" 같은 confirm 흐름에서만. 단순 뒤로가기는 `"Step"`.
- **`Next.MoveStepOrder` 의 순서가 곧 의도된 분기 우선순위**. `Condition` 평가는 위에서 아래.

## 자주 틀리는 점 — 짧은 체크리스트

- [ ] **헤더 백버튼을 커스텀 Group 으로 대체** — `Step.UseBackButton:false` + `FixedContentsTop` 안의 "◀ 뒤로" 라벨이 박힌 Group + `UseMove:true` + `MoveTo:"Prev"` 조합. validator `[back-button]` 가 차단. 교정: `UseBackButton:true` + `BackButton:{Next:"None",IsRestored:true,BackButtonMode:"Step",BackButtonEvent:"undefined"}`.
- [ ] `Current.step.moveToNext(...)` / `moveToPrev(...)` / `restart()` 스크립트 호출 — 메타 채널로 (validator `[script-allow]` 가 차단).
- [ ] `Step.Next` 에 적힌 타깃이 어떤 트리거에도 안 연결됨 — `[step-nav]` 위반. 위 4 채널 중 하나로 트리거 추가.
- [ ] `BackButton.Next` 가 자기 자신 StepId — 거부. `"None"` 또는 본인 외 StepId.
- [ ] 카드 Group 의 `MoveSteps.MoveStepOrder` 가 비어있거나 `MoveTo` 가 누락 — 클릭은 되지만 이동 안 됨.
- [ ] `StepSub` Step 에서 `UseBackButton:true` 설정 — 자동 false 강제. StepSub 는 임베드 전용.

## 가짜 뒤로가기 그룹을 발견하면

1. Step 의 `UseBackButton` 을 `true` 로.
2. `BackButton` 객체 추가: `{ Next:"None", IsRestored:true, BackButtonMode:"Step", BackButtonEvent:"undefined" }`.
3. FixedContentsTop 의 커스텀 백버튼 Group 제거 (헤더 타이틀만 남기거나 통째 삭제).
4. 만약 헤더 자체를 디자인 커스터마이즈해야 한다면 `UseStepHeader:false` 로 헤더를 끄고 별도 처리 — 단, 표준 백버튼도 같이 잃는 트레이드오프 자각.
