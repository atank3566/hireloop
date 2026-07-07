# intent-system

> 런타임 영역 (컬렉션/섹터/카테고리/스크립트) 에서 자주 쓰는 idiom 을 **선언적 short-form** 으로 작성하면 `materialize.mjs` 가 raw 메타/Script 본문으로 펼친다. [design-system](../../../schema/v1/design-system/README.md) 과 짝 — 디자인은 컨트롤 단위 스타일을 펼치고, intent 는 데이터/행동 영역을 펼친다.

## 왜 필요한가

LLM 이 `f.Collection.addSector({...}, 'Ctg…')` / `f.MessageBox(...)...show()` 같은 본문을 직접 박으면:

- 종결자 오타 (`.send()` vs `.show()`)
- 가짜 메서드 (`f.Message().chain()`, `_c.<Cat>.clear()`)
- 인자 순서 뒤집기 (`addSector('카테고리', {...})`)
- inline function 콜백
- 가드 누락 (`activeSector` 가 undefined 인 상태)

이런 실수가 반복된다. `core/validators.mjs` 가 후검증으로 차단하지만, **작성 시점에 의도만 적고 펼침은 자동화** 하면 실수 자체가 발생하지 않는다.

## 위치 — 디자인 시스템과 다른 점

| | design-system | intent-system |
|---|---|---|
| 폴더 | `schema/v1/design-system/` | `runtime/v1/intent-system/` |
| 키 위치 | 컨트롤/그룹 노드 안 (`design:{...}`) | 영역별 — Action / Step.Events / scenario root (`intent:{...}`) |
| Walker | `schema/v1/patterns/_base.materialize.mjs` 의 `applyDesign` | 동일 entry — `applyIntentToScenario` 를 마지막에 호출 |
| 펼침 결과 | raw 스타일 필드 (FontStyle / Padding / …) | raw Script 본문 또는 raw 메타 (Categories / Events 배열) |
| Schema | `design.schema.json` (slot enum) | `intent.schema.json` (kind enum) |
| 빌드 산출물 | `skill/design-rules.md` / `skill/design-system.md` | `skill/intent-rules.md` (Phase 5 에서 매핑) |

런타임 폴더에 두는 이유는 — `intent` 가 다루는 영역(컬렉션·섹터·카테고리·스크립트) 의 **진실원본이 이미 runtime/v1/ 에 모여 있고**, intent 슬롯의 펼침 규칙이 그 문서들과 1:1 정렬되어야 하기 때문.

## 도입 Phase 요약

| Phase | 영역 | 상태 |
|---|---|---|
| 1 | 인프라 — walker / schema / scope / report | ✅ 완료 |
| 2 | `intent.mock` (Init 단계 mock 데이터) | ✅ 활성 |
| 3a / 3b | `intent.script` (5 kind: dialog / reloadGroup / clearCategory / deleteActive / updateActive) | ✅ 활성 |
| 4 | `intent.categories` — Collections type 맵 | ⛔ 도입 후 폐기 (스튜디오 자동 재생성) |
| 5 | 확장 구조 (kinds/ 디렉토리) + case-insensitive 예약어 강화 | ✅ 완료 |

활성 슬롯은 [INTENT.md](./INTENT.md) 의 "슬롯 ⨯ Scope 매트릭스" 참조. `intent.categories` 키는 `unknown-slot` 에러.

## Phase 1 동작

- `intent` 키가 트리에 없으면 → **변화 없음** (기존 시나리오 100% 호환).
- `intent` 키가 있으면 → Phase 1 의 walker 가 발견하고 report 의 `intentsSeen` 카운터를 올린 뒤, 키를 트리에서 제거. **펼침 결과는 빈 객체** (Phase 2-4 에서 실제 펼침 로직 채움).
- 알려지지 않은 slot 이 들어오면 → `errors` 에 `kind:'intent', phase:'unknown-slot'` 으로 보고.

## 사용 시점 (Phase 2 이후 예고)

```jsonc
// Phase 2 — Step.Events.Init 안 Action 의 mock
{
  "Action": "Script",
  "intent": {
    "mock": {
      "CtgEmployee": [
        { "fName": "홍길동", "fAge": 30 },
        { "fName": "김철수", "fAge": 25 }
      ]
    }
  }
}
// → 펼친 후:
{
  "Action": "Script",
  "Script": "f.Collection.addSector({fName:'홍길동', fAge:30}, 'CtgEmployee')\nf.Collection.addSector({fName:'김철수', fAge:25}, 'CtgEmployee')"
}
```

```jsonc
// Phase 3 — Click 핸들러 안 Action 의 script idiom
{
  "Action": "Script",
  "intent": {
    "script": {
      "kind": "dialog",
      "type": "Alert",
      "title": "삭제하시겠습니까?",
      "body": "이 작업은 되돌릴 수 없습니다.",
      "buttons": [
        { "label": "확인", "event": "DeleteConfirmEvent" },
        { "label": "취소" }
      ]
    }
  }
}
// → 펼친 후:
{
  "Action": "Script",
  "Script": "f.MessageBox('Alert').setTitle('삭제하시겠습니까?').setDescription('이 작업은 되돌릴 수 없습니다.').addBtn('확인','DeleteConfirmEvent').addBtn('취소',null,true).show()"
}
```

## 파일 구조

```
runtime/v1/intent-system/
├── README.md             ← 본 파일 (역할 / 위치 / 4 Phase 도입)
├── INTENT.md             ← 슬롯 / Scope / Kind 카탈로그 + 추가 가이드
├── intent.schema.json    ← ajv 용 슬롯 schema (categoryName / ckey 는 naming-objects.schema.json $ref)
├── materialize.mjs       ← walker + slot dispatcher (mock / script / categories) + kind registry 부트
└── kinds/                ← script kind 별 펼침 함수 (자동 디스커버리)
    ├── _base.mjs         ← 공통 헬퍼 (jsString, jsValue, 패턴, 예약어 검사 — naming-objects schema 진실원본 정합)
    ├── dialog.mjs        ← f.MessageBox(...)...show()
    ├── reloadGroup.mjs   ← f.Content(fid).reload()
    ├── clearCategory.mjs ← f.Collection.removeSector('all', cat) + reload
    ├── deleteActive.mjs  ← 가드 2단 + cur.release() (완전삭제) + reload
    └── updateActive.mjs  ← 가드 2단 + 직접 대입 N + reload
```

새 script kind 추가는 `kinds/<name>.mjs` 파일 1개 추가 + INTENT.md / intent.schema.json 1줄 갱신으로 끝 — materialize.mjs 의 dispatcher 코드는 수정 불필요 (부팅 시 자동 스캔). 상세는 [INTENT.md "새 script kind 추가하기"](./INTENT.md) 절.

## 정본 참조

- 컬렉션 API: [../collection/_c.md](../collection/_c.md), [../collection/category.md](../collection/category.md), [../collection/sector.md](../collection/sector.md)
- 스크립트 API: [../script/f_collection.md](../script/f_collection.md), [../script/f_messagebox.md](../script/f_messagebox.md), [../script/current_step.md](../script/current_step.md), [../script/f_content.md](../script/f_content.md)
- Script 화이트리스트: [../script/scenario-gen-rules.md](../script/scenario-gen-rules.md)
- mock-init cross-check: `core/validators.mjs` `checkMockInit`
