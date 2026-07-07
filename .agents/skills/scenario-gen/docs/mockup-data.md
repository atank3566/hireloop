# 목업 데이터 (Mockup Data)

스킬 생성 모드(외부 Service/API 차단)에서 화면이 그릴 **유일한 데이터 출처**. 시작 Step (`StartSteps[0]`) 의 `Events.Init` 핸들러가 `f.Collection.addSector({...}, '<카테고리>')` 로 카테고리 섹터 데이터를 박는 방식이다.

> **이 데이터는 `DataSource` 가 아니다.** 시나리오 `DataSources` 와 무관하게, 카테고리(`scenario.Panel.Category` 정의 또는 `DataConnection.CategoryName` 명시) 의 **섹터 누적**으로 표현된다. 단순 선택지 목록(Combo/Radio 옵션 등)이 필요하면 [Data Sources](data-sources.md) 의 `Fixed`/`Grid` 를 사용한다.

## 큰 그림

```
[1] 그룹/컨트롤이 카테고리 사용
    UseDataConnection: true + DataConnection.CategoryName='CtgX'
       ↓
[2] 시작 Step.Events.Init 가 카테고리에 mock 섹터 N건 박음
    f.Collection.addSector({...키:값...}, 'CtgX')
       ↓
[3] DataConnection 으로 자동 반복 렌더링 — 같은 컨트롤이 섹터 수만큼 반복
```

`[mock-init]` cross-check 가 이 정합을 강제 — 시나리오에서 사용되는 카테고리(`DataConnection.CategoryName`) 에 대해 시작 Step 의 Init 핸들러가 `addSector` 호출을 1회 이상 포함해야 통과. `LinkedEvent` 로 위임된 보조 핸들러도 함께 추적된다.

> **예외 — `DataUsage:"new"` (신규입력) 는 Init mock 불필요.** 신규입력 그룹은 **진입 시 빈 섹터가 자동 생성**되어 그 섹터에 입력값이 바인딩되므로(data-objects.md §1.2), 시작 Step Init 에서 따로 `addSector` 를 박지 않아도 된다. `[mock-init]` 도 `new` 로만 쓰인 카테고리는 요구 대상에서 제외한다. 단, **같은 카테고리가 어딘가에서 `query`/`update`/`detail`/`default` 등 읽기 용도로도 쓰이면** 그 읽기 화면이 그릴 데이터가 필요하므로 Init mock 이 여전히 필요하다.

## ★ 짝 규칙 — DC 그룹 하위 데이터 항목은 콜렉션키 바인딩 필수

`[mock-init]` 이 강제하는 건 **정방향**(카테고리 → Init 에서 mock 섹터 박기)뿐이다. 그 짝이 되는 **역방향** 도 반드시 지켜야 한다:

> **mock 을 박은 DataConnection 그룹 하위에서, 데이터가 연결되어야 하는 항목들은 콜렉션키(Ckey)가 지정되어 있어야 한다.**

addSector 로 섹터에 넣은 필드(`fName`, `fPrice` 등)는 그룹 하위 컨트롤이 **콜렉션키로 바인딩**해야 화면에 그려진다. 바인딩 키 없이 정적 텍스트(`Label.labeltext`, 정적 `Caption`)만 두면 **mock 데이터는 들어가지만 화면에는 고정 텍스트만 나오고 데이터는 죽는다** (DC 그룹이 섹터 수만큼 복제되어도 모든 카드가 똑같은 정적 문구를 반복).

| 항목 유형 | 데이터 표시/입력 시 채워야 할 콜렉션키 |
|---|---|
| `Label` (값 표시) | `LabelType: "LabelCKey"` + `LabelCKey: "<섹터 필드명>"` (정적 라벨은 `labeltext` 그대로 OK) |
| `InputText` / `InputNumber` / `InputMask` / `InputDate` / `MultiInputBox` | `Ckeys: ["<섹터 필드명>"]` (update/new 그룹에서 입력값 ↔ 섹터 매핑) |
| `Combo` / `Search` | `Ckeys` + `SaveValueKey` / `CtrlDisplayCkey` (rules.md §5.5) |
| `CheckBox` / `RadioBox` | `Ckeys` |
| `Button` (값 표시) | `ButtonValueCKey` |

- 바인딩 대상은 **그 섹터에서 실제로 보여줄/입력받을 필드들** — 카드 안의 장식용 정적 라벨까지 전부 바꾸라는 뜻은 아니다. 데이터가 흘러야 하는 항목만 콜렉션키를 채운다.
- 콜렉션키를 가진 컨트롤은 조상 어딘가에 `UseDataConnection:true` 그룹이 있어야 한다 (`[bind]` / rules.md §5.1).
- 어떤 콜렉션키도 안 쓰는 순수 정적 UI 라면 애초에 DataConnection / mock 을 두지 말 것 → `[proto]` 모드(`Ckeys`/`DataConnection`/`LabelCKey` 금지).

## 기본 예시

```jsonc
// 시작 Step
"Step1": {
  "Events": {
    "UseEvents": true,
    "StepEventOrder": ["Init"],
    "Init": "InitMockData"
  },
  "Contents": [
    {
      "ContentsType": "Group",
      "UseDataConnection": true,
      "DataConnection": { "TargetType": "category", "DataUsage": "query", "CategoryName": "CtgItemList" },
      "Contents": [
        // 카드 안 데이터 항목은 addSector 가 박은 필드(fName/fPrice)를 콜렉션키로 바인딩.
        { "ControlType": "Label", "LabelType": "LabelCKey", "LabelCKey": "fName",  /* ... */ },
        { "ControlType": "Label", "LabelType": "LabelCKey", "LabelCKey": "fPrice", /* ... */ }
        // ✗ LabelType:"labeltext" + labeltext:"사과" 로 두면 모든 카드가 '사과' 만 반복 — mock 이 죽음.
      ]
    }
  ]
}

// scenario.Events — 한 카테고리의 모든 섹터는 Script 액션 하나에 모은다.
//   addSector 호출마다 \n 으로 줄바꿈하고, 객체 필드도 \n 들여쓰기로 (Ctrl+K+F 수준 가독성).
//   섹터 1건당 {Action:Script} 를 따로 만들지 말 것.
"Events": {
  "InitMockData": [
    {
      "Action": "Script",
      "Script": "f.Collection.addSector({\n  fId: 'i1',\n  fName: '사과',\n  fPrice: 1000\n}, 'CtgItemList');\nf.Collection.addSector({\n  fId: 'i2',\n  fName: '바나나',\n  fPrice: 1500\n}, 'CtgItemList');"
    }
  ]
}
```

> 카테고리 자체는 `Panel.Category` 정의 또는 `DataConnection.CategoryName` 명시로 자유롭게 만들 수 있다 — 카테고리 생성에는 제한 없음.

## 카테고리 리셋 패턴 (재진입 안전)

`Init` 이 여러 번 도는 경우(`moveToFirst` 등) 섹터가 중복으로 박힐 수 있으므로 리셋 + 재생성 순서를 권장한다.

```jsonc
"STEP1_Init_E": [
  { "Action": "Script", "Script": "f.Collection.removeCategory('CtgItemList');\nf.Collection.createCategory('CtgItemList');\n_c.CtgItemList.addSector({ Title:'A' });\n_c.CtgItemList.addSector({ Title:'B' });" }
]
```

> **CRITICAL** — `_c.CtgX[0].set(...)` 호출 전에 반드시 `removeCategory + createCategory` 선행. 없으면 TypeError. (system-prompt-v2.md §4644)

## `[script-allow]` — Init 핸들러 제한

Init 은 mock 섹터를 박는 단계이므로 화면 갱신/푸시/외부 스크립트 로드 호출이 차단된다.

| 차단되는 호출 | 사유 |
|---|---|
| `Current.step.reload(WithAnimation)` | DOM 아직 안 그려졌음 — Loaded 이후에서 호출 |
| `f.Content(fid).reload(WithAnimation)` | 동일 |
| `f.Event(...).runNext()` / `.break()` | Init 은 단순 mock 생성만 |
| `f.MessageBox(...)` | 모달 다이얼로그 표시는 Loaded 이후에서 |
| `f.Script.load(...)` | 외부 라이브러리 로드는 Loaded 또는 별도 이벤트 |

허용 호출: `f.Collection.addSector` / `_c.<Cat>.addSector` / `_c.<Cat>[*].set(...)` / `f.Date()` 등.

## Tab + LinkedStep 패턴

탭이 있는 부모 Step 의 Init 에서 모든 샘플 데이터를 한 번에 로딩. LinkedStep 의 Init 에 두면 탭 전환마다 `removeCategory + createCategory` 가 다시 돌아 데이터가 초기화된다 (LinkedStep 의 Step 이벤트는 미실행이므로 부모 Step 에 박는 것이 표준).

```jsonc
// 부모 Step (탭이 있는 Step) — 모든 카테고리 한 번에 로딩
"Step1": {
  "Events": { "UseEvents": true, "StepEventOrder": ["Init"], "Init": "InitAllMock" }
}
// LinkedStep 들은 Events: [] (탭이 자체적으로 그릴 데이터는 부모 Step 의 Init 결과를 공유)
```

## `[proto]` 모드와의 관계

DataSources 도 비어있고 Init 에도 `f.Collection.addSector` 가 전혀 없다면 진짜 정적 UI 목업 — `[proto]` 모드가 발동해 `Ckeys` / `DataConnection` / `LabelCKey` 사용을 금지한다. 표준 흐름은 [mock-init] + DC 반복 렌더링이므로 보통은 Init 에서 mock 섹터를 박는 쪽으로 작성한다.

## Script 본문 표기 규칙

`Action: "Script"` 의 `Script` 값은 **한 줄 JSON 문자열로 박고 줄바꿈은 `\n` 이스케이프**로 표현한다. JS 문자열 `+` 연결로 여러 줄에 걸쳐 두지 말 것.

```jsonc
// ✓ 정상 — 한 줄 + \n
{ "Action": "Script", "Script": "f.Collection.removeCategory('CtgX');\nf.Collection.createCategory('CtgX');\n_c.CtgX.addSector({ Title:'A' });" }

// ✗ 잘못 — JS + 연결 (JSON 파서가 받을 수 없음)
{ "Action": "Script", "Script":
  "f.Collection.removeCategory('CtgX');" +
  "f.Collection.createCategory('CtgX');"
}
```

### addSector 작성 규칙 (★ 필수)

**1. 인자 순서 — `addSector(객체, '카테고리')`**
첫 인자는 섹터 데이터 **객체**, 둘째 인자는 **카테고리명 문자열**이다. 순서를 뒤집은 `addSector('카테고리', {...})` 는 틀린 호출 — `[mock-init]` 이 카테고리를 인식하지 못해 "addSector 된 카테고리: (없음)" 으로 판정되고, 실제로도 섹터가 안 박혀 화면에 데이터가 안 나온다.

```js
// ✓ f.Collection.addSector({ orderNo: 'ORD-001' }, 'CtgOrderList')
// ✗ f.Collection.addSector('CtgOrderList', { orderNo: 'ORD-001' })   ← 인자 역전, 동작 안 함
```

**2. 카테고리 단위로 묶기 — 섹터마다 액션을 쪼개지 말 것**
한 카테고리에 박을 섹터가 여러 건이어도 **Script 액션 하나** 안에 `addSector` 호출들을 `\n` 으로 이어 담는다. 섹터 1건당 `{ "Action": "Script" }` 를 따로 만들면 안 된다. **카테고리가 2개면 Script 액션 2개** — 카테고리당 하나씩.

**3. 줄바꿈/들여쓰기 가독성 (Ctrl+K+F 수준)**
`addSector` 호출 사이는 `\n`, 객체 필드는 `\n  ` 들여쓰기로 한 필드씩 — 사람이 보기 쉽게 포맷한다. 여러 `addSector` 를 한 줄에 `;` 로 다닥다닥 붙이지 말 것.

```jsonc
// ✓ 정상 — 카테고리 2개 → Script 액션 2개, 각 액션 안에서 줄바꿈/들여쓰기
"Init": [
  {
    "Action": "Script",
    "Script": "f.Collection.addSector({\n  fOrderNo: 'ORD-001',\n  fOrderDate: '2024-01-15',\n  fTotalAmt: '150000'\n}, 'CtgOrder');\nf.Collection.addSector({\n  fOrderNo: 'ORD-002',\n  fOrderDate: '2024-01-16',\n  fTotalAmt: '85000'\n}, 'CtgOrder');"
  },
  {
    "Action": "Script",
    "Script": "f.Collection.addSector({\n  fOrderNo: 'ORD-001',\n  fItemName: '노트북',\n  fQty: '1'\n}, 'CtgOrderItem');\nf.Collection.addSector({\n  fOrderNo: 'ORD-002',\n  fItemName: '키보드',\n  fQty: '1'\n}, 'CtgOrderItem');"
  }
]

// ✗ 잘못 — 섹터마다 Script 액션을 쪼갬 (한 줄에 ; 로 붙이거나 액션 7개로 분산)
"Init": [
  { "Action": "Script", "Script": "f.Collection.addSector({fOrderNo:'ORD-001',...}, 'CtgOrder');" },
  { "Action": "Script", "Script": "f.Collection.addSector({fOrderNo:'ORD-002',...}, 'CtgOrder');" },
  { "Action": "Script", "Script": "f.Collection.addSector({fOrderNo:'ORD-001',...}, 'CtgOrderItem');" }
]
```

## 함정

- **`DataSourceType: "Script"` 는 존재하지 않음** — 동적으로 만드는 화면 데이터는 카테고리 섹터로 표현한다.
- 카테고리에 mock 섹터를 박지 않으면 컨트롤이 DC 로 반복되어도 화면에 아무것도 안 그려짐 → `[mock-init]` cross-check fail. **단 `DataUsage:"new"` 신규입력 그룹은 빈 섹터가 자동 생성되므로 Init mock 불필요** — 빈 입력 폼을 위해 `addSector({필드:''}, ...)` 로 빈 섹터를 억지로 박지 말 것.
- **반대로** mock 은 박았는데 DC 그룹 하위 데이터 항목이 콜렉션키 없이 정적 텍스트(`labeltext` / 정적 `Caption`)뿐이면, 모든 카드가 같은 고정 문구를 반복하고 mock 데이터는 화면에 안 나옴 → 위 ★ 짝 규칙 위반. 데이터가 흘러야 하는 항목은 `LabelCKey` / `Ckeys` / `SaveValueKey` 등으로 바인딩.
- `moveToFirst` 로 시작 Step 으로 돌아가면 Init 이 재실행되어 사용자 입력이 날아갈 수 있다 — 카테고리 리셋 패턴 필요. (system-prompt-v2.md §4730)
- LinkedStep 의 Init 에 mock 을 박지 말 것 — Step 이벤트가 미실행이라 데이터가 안 들어감.
- `Script` 값에 raw newline 박지 말 것 — JSON 파싱 실패. 줄바꿈은 항상 `\n` 이스케이프.
- **`addSector` 인자 순서 역전** — `addSector('카테고리', {...})` 는 틀림. 항상 `addSector({...}, '카테고리')` (객체 먼저, 카테고리 마지막). 역전하면 `[mock-init]` 이 카테고리를 못 잡아 통과 실패 + 섹터도 안 박힘. (위 "addSector 작성 규칙 §1")
- **섹터마다 Script 액션을 쪼개지 말 것** — 한 카테고리의 여러 섹터는 Script 액션 하나에 `\n` 으로 모은다. 카테고리 수만큼만 Script 액션을 둔다 (카테고리 2개 → 액션 2개). 섹터 N건을 액션 N개로 분산하면 가독성·구조 모두 나쁘다. (위 "addSector 작성 규칙 §2")
