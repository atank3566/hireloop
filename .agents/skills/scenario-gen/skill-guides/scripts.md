# Script 본문 가이드

> 이벤트 핸들러의 `Action:'Script'` 본문은 **intent short-form 을 1순위로 사용**한다. raw JS 본문은 intent 가 표현 못 하는 분기/조건이 있을 때만 escape hatch.
>
> 정본:
> - **intent 카탈로그**: [runtime/v1/intent-system/INTENT.md](../runtime/v1/intent-system/INTENT.md) (슬롯·scope·kind 매트릭스)
> - **intent 인프라**: [runtime/v1/intent-system/README.md](../runtime/v1/intent-system/README.md)
> - raw API 진실원본 (fallback 참고용): [scenario-gen-rules.md](../runtime/v1/script/scenario-gen-rules.md) · [_c.md](../runtime/v1/collection/_c.md) · [f_messagebox.md](../runtime/v1/script/f_messagebox.md) · [f_collection.md](../runtime/v1/script/f_collection.md) · [f_content.md](../runtime/v1/script/f_content.md)
> - 검증: [core/validators.mjs](../core/validators.mjs) `SCRIPT_DENY_PATTERNS` (펼침 후 결과까지 검사)

## 의도 → intent 매핑 (1순위)

| 의도 | intent 표기 | scope |
|---|---|---|
| Init 단계 mock 데이터 박기 | `intent.mock: { CtgX: [{...}, ...] }` | `event-script-init` (Step.Events.Init Action) |
| 활성 섹터의 N개 필드 일괄 갱신 | `intent.script: { kind:'updateActive', cat, set:{...}, reload? }` | `event-script` |
| 활성 섹터 삭제 | `intent.script: { kind:'deleteActive', cat, reload? }` | `event-script` |
| 카테고리 통째로 비우기 | `intent.script: { kind:'clearCategory', cat, reload? }` | `event-script` |
| 그룹 부분 재렌더만 | `intent.script: { kind:'reloadGroup', fid }` | `event-script` |
| 모달 다이얼로그 (확인/취소·에러) | `intent.script: { kind:'dialog', type, title, body?, buttons:[...] }` | `event-script` |

> Categories 정의 / `Collections` 슬롯 / `Panel.*` 은 **스튜디오 자동 재생성** — AI 단에서 채우지 않음. 카테고리 사용 사실은 `intent.mock` 의 카테고리명 + `DataConnection.CategoryName` 으로 cross-check 가 자동 추출.

이 매트릭스의 의도면 intent 로 표현 가능. **intent 펼침 결과가 raw 와 동등** — `[script-allow]` / `[mock-init]` / `[event-ref]` cross-check 모두 통과.

## intent 사용 — 6 가지 표준 패턴

### A. Init mock 데이터 — `intent.mock`

```jsonc
{
  "Steps": {
    "Step1": {
      "Events": {
        "Init": [{
          "Action": "Script",
          "intent": {
            "mock": {
              "CtgEmployee": [
                { "fName": "홍길동", "fAge": 30 },
                { "fName": "김철수", "fAge": 25 }
              ]
            }
          }
        }]
      }
    }
  }
}
```

가드: 카테고리명 `^Ctg[A-Z]…` / 섹터 키는 [naming-objects.schema.json](../schema/v1/naming-objects.schema.json) 의 `sectorReservedKeys` + `jsReservedWords` 와 case-insensitive 충돌 차단 (`Status` / `STATUS` / `Length` 등).

### B. 활성 섹터 일괄 갱신 — `intent.script.updateActive`

```jsonc
{ "Action": "Script", "intent": { "script": {
    "kind": "updateActive",
    "cat": "CtgList",
    "set": { "fStatus": "확정", "fApprovedAt": "2024-01-01" },
    "reload": "f_3"
}}}
```

펼침 결과: 가드 2단 (`if (!_c.CtgList) return; … if (!cur) return;`) + 직접 대입 N + `f.Content('f_3').reload();`

### C. 활성 섹터 완전삭제 — `intent.script.deleteActive`

```jsonc
{ "Action": "Script", "intent": { "script": {
    "kind": "deleteActive", "cat": "CtgCart", "reload": "f_5"
}}}
```

펼침 결과: 가드 2단 + `cur.release();` (완전삭제) + reload. ★ raw `.delete()` 는 added 가 아닌 섹터를 deleted 상태로 남겨 집계/루프를 오염시키므로 금지 (`[script-allow]` 차단) — 완전삭제는 `release()`.

### D. 카테고리 비우기 — `intent.script.clearCategory`

```jsonc
{ "Action": "Script", "intent": { "script": {
    "kind": "clearCategory", "cat": "CtgOrderHistory", "reload": "f_3"
}}}
```

### E. 그룹 재렌더만 — `intent.script.reloadGroup`

```jsonc
{ "Action": "Script", "intent": { "script": { "kind": "reloadGroup", "fid": "f_3" } } }
```

### F. 모달 다이얼로그 — `intent.script.dialog`

```jsonc
{ "Action": "Script", "intent": { "script": {
    "kind": "dialog",
    "type": "Alert",
    "title": "삭제하시겠습니까?",
    "body": "이 작업은 되돌릴 수 없습니다.",
    "buttons": [
      { "label": "확인", "event": "DeleteConfirmEvent" },
      { "label": "취소", "color": "sub" }
    ]
}}}
```

- 종결자는 항상 펼침 단계에서 `.show()` — `.send()` 오타 불가능.
- 버튼 액션은 `event` 문자열 (scenario.Events 키) 또는 생략 (닫기만). inline function 표현 불가.

## intent + raw 머지

같은 Action 안에 `intent` 와 raw `Script` 가 공존 가능. **펼침 결과가 raw 앞에 prepend**:

```jsonc
{
  "Action": "Script",
  "Script": "// 후속 로직 (intent 가 표현 못 하는 부분)",
  "intent": { "script": { "kind": "updateActive", "cat": "CtgX", "set": { "fA": 1 } } }
}
```

펼친 결과:
```
if (!_c.CtgX) return;
const cur = _c.CtgX.activeSector;
if (!cur) return;
cur.fA = 1;
// 후속 로직 (intent 가 표현 못 하는 부분)
```

## raw escape hatch — intent 미지원 영역

intent 매트릭스에 없는 의도는 raw 본문으로. 대표적인 경우:

| 의도 | raw 표기 | 정본 |
|---|---|---|
| 런타임 단건 섹터 추가 (Init 외) | `f.Collection.addSector({...}, 'CtgX')` | [f_collection.md](../runtime/v1/script/f_collection.md) |
| 다중 카테고리에 상태 조건부 섹터 제거 | `f.Collection.removeSector('deleted', 'CtgX')` | 동상 |
| 분기 조건 (`if (_c.CtgX.length > 5) { ... }`) | raw JS — 절제 사용 | [_c.md](../runtime/v1/collection/_c.md) |
| 날짜 계산 | `f.Date('${rawDate}').format('YYYY-MM-DD')` | [scenario-gen-rules.md §2-3](../runtime/v1/script/scenario-gen-rules.md) |
| 다음 이벤트 호출 / 중단 | `f.Event(name).runNext()` / `.break()` | 동상 |
| 외부 스크립트 로드 | `f.Script.load('https://...', null, null)` | 동상 |
| Step 전체 재렌더 | `Current.step.reload()` | [current_step.md](../runtime/v1/script/current_step.md) |
| 섹터로 좁힌 부분 재렌더 (Embed `{%Load.sector%}` 바인딩 갱신 등) | `f.Content('<부모그룹 fid>', <그 그룹을 그린 섹터>).reload()` — sector 인자 필수, DC 그룹 자체 fid 금지(비연결 래퍼로) | [f_content.md §3-1·§5-4](../runtime/v1/script/f_content.md), [embed.md](../schema/v1/control/embed.md) |

raw 본문 작성 시 가드:
- **`activeSector` 사용 전 카테고리 + active 가드 2단** — intent.script.updateActive / deleteActive 는 자동 emit, raw 는 직접 적기.
- **다량 변경은 직접 대입 + 마지막 한 번만 reload**. `set` 호출 매번 reload 트리거하지 말 것.
- **카테고리명 / 컬렉션키 예약어 충돌 검사** — [naming-objects.schema.json](../schema/v1/naming-objects.schema.json) 의 두 enum. `Status` / `Length` / `IsActive` 등 case-insensitive 충돌은 `[script-allow]` 가 차단하지 않으므로 raw 작성 시 직접 회피.

## 자주 틀리는 점 — 짧은 체크리스트

- [ ] `intent.script.dialog` 가 표현 가능한 다이얼로그를 raw `f.MessageBox()` 로 박음 — **intent 우선**, raw 는 표현 한계 시 (예: 동적 button label).
- [ ] `intent.mock` 대신 raw `addSector` 를 Init 에 박음 — intent 가 카테고리명 / 예약어 / 인자 순서 모두 자동 가드.
- [ ] `f.MessageBox().send(...)` / `.setBody(...)` / `.chain(...)` — **가짜 메서드**. intent 사용 시 구조적으로 차단.
- [ ] `_c.<Cat>.clear()` / `_c.<Cat>.deleteActiveSector()` / `_c.<Cat>.activeSector()` / `_c.<Cat>.sectors()` — 가짜. intent.script.clearCategory / deleteActive 권장.
- [ ] `f.Message()` (인스턴스) — 차단된 채널. `f.MessageBox` 또는 intent.script.dialog 만.
- [ ] `f.Notification` — 전체 발송 차단. 다이얼로그는 intent.script.dialog.
- [ ] `Current.step.moveToNext(...)` 같은 명령형 흐름 제어 — 메타 채널 (`BottomButton.MoveTo` / `UseMove + MoveSteps`).
- [ ] `f.Frame.popUp(...)` — 같은 시나리오 PopUp 은 메타 (`StepDialogType`).
- [ ] `{=Field}` 가 event Script 본문에 박힘 — display 토큰 전용. event Script 안에서는 `_c.<Cat>.activeSector.<Field>` 로 명시 참조.

## 가짜 핸들이 의심될 때

1. **intent 매트릭스에 의도가 있나?** 있으면 intent 사용.
2. **본 파일의 raw escape 표에 있나?** 있으면 raw fallback OK.
3. **공식 자동완성에 잡히나?** 스튜디오 IDE 에서 `f.<X>().` / `_c.<Cat>.` 를 쳐서 노출되는 것 외엔 가짜.
4. **`runtime/v1/script/` 또는 `runtime/v1/collection/` 에 명시되어 있나?** 없으면 가짜.

그래도 모호하면 `feedback/` 에 한 줄 머지 → ready-to-promote → 검증.
