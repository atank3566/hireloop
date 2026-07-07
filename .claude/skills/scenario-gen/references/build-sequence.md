# build-sequence — 빌드 시퀀스 상세 (CLI 모드)

SKILL.md §9 만으론 막힐 때 본다. 이 Skill 에는 강제 stage / build_id 개념이 없다 — 본 문서는 **빌드 작업의 자연스러운 순서**를 정리한 것.

## 작업 순서 (강제 stage 없음)

| # | 작업 | 도구 |
|---|---|---|
| 1 | 화면 종류 식별 | 사고만 (요청 텍스트 읽기) |
| 2 | 가장 가까운 example 결정 | `flex-scenario examples list` → `flex-scenario examples cat <name>` (또는 `Read`) |
| 3 | 적용 패턴 결정 | `patterns-cheatsheet.md` `Read` |
| 4 | enum 카탈로그 확인 (필요 시) | `flex-scenario catalog --section controlTypes` 등 |
| 5 | 시나리오 초안 작성 | `Write` (또는 직접 출력) |
| 6 | 단편 검증 (선택) | `flex-scenario validate --schema <name> <fragment-file>` |
| 7 | 전체 검증 | `flex-scenario validate <scenario-file>` |
| 8 | 통과까지 4~7 반복 | — |

강제 stage 가 없으므로 6번은 생략 가능. 7번이 통과하면 끝.

## CLI 인자 요약

```bash
flex-scenario catalog --section <name>
   sections: controlTypes / dataUsages / dataSourceTypes / stepTypes / stepDialogTypes /
             controlKeys / sectorStatuses / conditionOperators / colorTokens /
             inputTextTypes / inputNumberTypes / inputMaskMaskTypes / controlEvents /
             stepEvents / calendarSelectTypes (catalog.json 의 키들)

flex-scenario examples list
flex-scenario examples cat <relative-path>

flex-scenario validate <scenario.json>                # 전체 검증
flex-scenario validate --schema <name> <fragment.json> # 단편 검증
   schema names: scenario / step / group / control / data-source / ...
```

## 검증 실패 시 회복

- `validate --schema=<x>` fragment 단위로 단축 — 큰 시나리오에서 한 위치만 빠르게 점검.
- `errors[*].kind`:
  - `schema` / `strict-fields` — JSON Schema 위반 (정의되지 않은 필드 또는 enum/type 불일치). 같은 instancePath 위치를 schema 정의에 맞게 수정.
  - 그 외 (`step-nav`/`mock-init`/`no-inner-block`/`v1-only`/`no-service`/...) — cross-check 룰. SKILL.md `§금지` 절의 동일 분류명 확인.
- 같은 에러가 두 번 = 가장 가까운 example 의 해당 영역 다시 본다 (`flex-scenario examples cat`).
- `errors` 가 가짜로 늘어난다고 느끼면 노이즈 가능성 — 처음 1~2 건만 고치고 재검증.

## 자주 빠뜨리는 부분 (cross-check 관점)

- `Step.Next` 적었으면 트리거 (BottomButton MoveTo:"Next" 또는 Group/Control UseMove:true + MoveSteps) 필수 (`[step-nav]`).
- 시작 Step.Init 에 사용 카테고리 mock 섹터 (`f.Collection.addSector(..., '<카테고리>')`) 강제 (`[mock-init]`).
- 카테고리명 `Ctg` 접두 + PascalCase (`[category-name]`).
- Script Action 본문 화이트리스트 위반 (`[script-allow]`).
- v1 컨트롤 외 사용 — `catalog.json` 의 `controlTypes` 가 진실원본 (`[v1-only]`).
- `Service`/`API`/`Collection` DataSourceType 또는 `EmbedScenarioPrefix` 키 등장 (`[no-service]`).
- `UseInnerBlock`/`InnerBlockKey`/`RepeatStyle` 등장 (`[no-inner-block]`).
- 같은 ID 가 두 군데 — Dialog 안 Control 까지 합쳐서 (`[id]`).
