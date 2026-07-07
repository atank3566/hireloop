# Search (Code Help / Lookup)

검색형 선택 컨트롤. **자식 트리 보유** (`Dialog.Layouts[*].Controls[*]` = List). 키워드 검색 + DataSource 기반 lookup.

## 사용 기준 (vs Combo)

- **Search**: 항목 8개 초과 또는 동적으로 늘어나는 데이터 (고객/사용자/거래처/품목 등). DataSource = `Collection`/`Service`.
- **Combo**: 8개 이하 고정 목록. DataSource = `Fixed`.

## ★ 필수 체크리스트 (생성 전 반드시 확인)

> Search 는 **항상 DataSource 기반**. 모델이 자주 빠뜨리는 항목 — **누락 시 schema 에러(`CollectionMapper`/`KeywordSearchCkey` 필수) 또는 런타임 빈 칸**. 값이 데이터 의존이라 자동 보정 안 됨(`KeywordSearchCkey` 만 표시필드로 보정) — 직접 채운다.
>
> ★ **골격만 만들지 말 것 (조회 화면 다중 Search 주의)** — 조회 화면은 검색조건 Search 를 여러 개 둔다. 각 Search 를 `ControlType` 만 있는 빈 껍데기(`Ckeys`/`DataSourceName`/`CtrlDisplayCkey` 미설정)로 두면, 같은 누락이 **컨트롤 수만큼 곱으로 폭증**한다(N개 Search → required `DataSourceName` + `[dsref]` + `[bind]` + `[display-key]` ≈ 4N 에러). **Search 하나를 끝까지 완결**(자식 List `Ckeys`+`DataSourceName`+`CollectionMapper`, 본체 `CtrlDisplayCkey`(또는 `DisplayValue`), `scenario.DataSources` 에 `Fixed`/`Grid` 정의)**한 뒤 복제**하라. ★ **본체(Search 루트)에는 `Ckeys` 를 두지 않는다** — `Ckeys` 는 자식 List 의 속성 (`[combo-body-ckeys]`).

**본체 (Search 루트)**
1. ★ 루트에는 **`Ckeys` 를 두지 않는다** — `Ckeys` 는 자식 List 의 속성 (`[combo-body-ckeys]`). 스튜디오 속성 패널에도 루트 Ckeys 입력이 없다.
2. `CtrlDisplayCkey` (또는 비어있지 않은 `DisplayValue:"{=표시Ckey}"`) — 선택 후 표시. 비우면 빈 칸 (`[display-key]`).
   - 루트에 `Title`/`SubTitle`/`CollectionMapper`/`Items`/`Ckeys` 두지 않기 — List 내부에만.

**자식 List (`Dialog.Layouts[*].Controls[0]`)**
3. `DataSourceName` — 선택지 데이터 소스 (**required**).
4. `Ckeys: [값키, 표시키]` — 저장 대상 컬렉션키 (value 키 + name 키 둘 다).
5. `CollectionMapper: { 대상Ckey: 원본필드, ... }` — `UseDataSource:true` 를 **명시하면 필수**. 매핑을 채울 수 없으면 `UseDataSource` 키를 생략한다 (런타임 default=true, 요구 안 됨). 둘 중 하나로 일관되게.
6. `UseKeywordSearch: true` → `KeywordSearchCkey: 원본필드` (검색 대상, 보통 표시 필드). 누락 시 materialize 가 `Title` 로 보정하지만 명시 권장.

## 스키마

`control/search.schema.json` — `controlBase` + `inputBase` + 분기 키 (`ControlType="Search"`, `DisplayValue`, `Dialog`).

내부 List 는 `_base.schema.json#/$defs/searchListControl` 가 `dialogLayout` 의 if/then 으로 자동 적용.

## 예시

```jsonc
{
  "ControlType": "Search",
  "ControlStyle": "styleInputValueLine",
  "ControlDefaultName": "SearchCustomer",
  "ControlName2": "SearchCustomer",
  "Caption": "고객 검색",
  "Id": "f_60",
  "Placeholder": "고객을 검색하세요",
  "DisplayValue": "{=CustomerName}",
  "isColumnCtrl": false,
  "Dialog": {
    "Layouts": [{
      "ContentsType": "Layout",
      "Controls": [{
        "Id": "f_61",
        "ControlType": "List",
        "Title": "CompanyName",
        "SubTitle": "ContactName",
        "DataSourceName": "CustomerDS",
        "UseKeywordSearch": true,
        "KeywordSearchCkey": "CompanyName",
        "CollectionMapper": {
          "MapperOrder": ["CustomerNo", "CustomerName"],
          "CustomerNo": "CustomerNo",
          "CustomerName": "CompanyName"
        },
        "Ckeys": ["CustomerNo", "CustomerName"],
        "UseMultiData": false,
        "isColumnCtrl": false
      }]
    }]
  }
}
```

## Search ↔ List 구조 규칙

**Search 루트에 두면 안 되는 키**: `Ckeys`(루트), `Dialog.Items`, `Dialog.Ckeys`, `Dialog.UseMultiData`, `CollectionMapper`(루트), `Title`(루트), `SubTitle`(루트), `PopupHeight`/`PopupWidth`. `Ckeys` 와 선택값 매핑은 자식 List 내부에서만 처리 (`[combo-body-ckeys]`).

| 프로퍼티 | 위치 | 설명 |
|---|---|---|
| `DisplayValue` | Search 루트 | 선택 후 표시 텍스트. `"{=CkeyName}"` 형식 |
| `CtrlDisplayCkey` | Search 루트 | (대안) 표시할 컬렉션키 등록 |
| `Title` | List 내부 | 선택지에 표시할 **원본 데이터 필드명** |
| `SubTitle` | List 내부 | (선택) 보조 텍스트로 표시할 원본 필드명 |
| `CollectionMapper` | List 내부 | `{ MapperOrder, 대상Ckey: 원본필드, ... }` |
| `Ckeys` | List 내부 | 대상 카테고리에 저장할 키 `[값키, 표시키]` |
| `DataSourceName` | List 내부 | 선택지 데이터 소스 |
| `UseKeywordSearch` | List 내부 | `true` 면 검색 입력 활성화 |
| `KeywordSearchCkey` | List 내부 | 검색 대상 필드명 (`UseKeywordSearch=true` 일 때 필수) |
| `UseMultiData` | List 내부 | 다중 선택 (대부분 false) |

## ★ DisplayType / CtrlDisplayCkey / DisplayValue (Search 본체)

Search 본체에 선택값을 어떻게 표시할지 결정. ★ **`DisplayType` 미지정 시 default = `"CtrlDisplayCkey"`** ([property-data.js:5705](public/javascripts/scenario-studio/property-data.js#L5705)).

> ★ **필수 (`[display-key]` 검증)** — Search 는 항상 DataSource 기반이므로 본체에 `CtrlDisplayCkey` 또는 `DisplayValue` (비어있지 않은 값) 가 **반드시 함께 채워져 있어야 한다**. 둘 다 비우면 선택 후 본체가 빈 칸이 된다. 자세히는 [rules.md §5.5](../../../rules.md#55-combo--search-본체-표시-키-필수-display-key).

| 모드 | 짝 키 | 의미 |
|---|---|---|
| `"CtrlDisplayCkey"` (default) | `CtrlDisplayCkey: "FieldName"` | 컬렉션 필드값을 그대로 표시. **표시 컬렉션키 등록 필수**. |
| `"DisplayValue"` | `DisplayValue: "{=Field}"` 또는 `"{% JS %}"` | 표현식으로 표시 — Search 에서 가장 흔한 패턴 (i18n + 바인딩). |

두 키는 **상호배타** — 모드를 정한 다음 그쪽 키만 채우고 다른 쪽은 두지 않는다.

### 모드 1 — `CtrlDisplayCkey` (컬렉션키 등록 패턴)

```jsonc
{
  "ControlType": "Search",
  "DisplayType": "CtrlDisplayCkey",   // 생략 가능 (default)
  "CtrlDisplayCkey": "CompanyName",   // ★ 표시 컬렉션키 등록 (Ckeys 는 자식 List 에)
  ...
}
```

`DisplayType` 키를 생략해도 default 가 `CtrlDisplayCkey` 라 동일 동작. `CtrlDisplayCkey` 키만 채우면 충분.

### 모드 2 — `DisplayValue` (표현식, 흔한 패턴)

```jsonc
{
  "ControlType": "Search",
  "DisplayType": "DisplayValue",
  "DisplayValue": "{=CustomerName}",   // 정적 바인딩
  ...
}
```

운영 메타에서 Search 의 표시는 다국어/포맷 처리가 많아 `DisplayValue` 모드가 자주 등장. 단순히 한 필드만 표시하면 `CtrlDisplayCkey` 가 더 짧다.

## 내부 List 제한값

| 키 | 제한 |
|---|---|
| `ControlType` | const `List` |
| `DataSourceName` | required (Search 의 List 는 항상 DataSource 기반) |
| `isColumnCtrl` | const `false` |

조건부 강제:
- `UseKeywordSearch=true` → `KeywordSearchCkey` 필수.

## 이벤트 (제한)

**Search 본체가 아니라 자식 List (`Dialog.Layouts[0].Controls[0]`) 안에 둠.** 본체에 `UseEvents`/`Events` 두면 validate.mjs `[event]` cross-check 로 차단.

`Events` 는 `_base.schema.json#/$defs/searchEvents` 가 적용. `SearchOrder` enum: `change` / `Delete` / `DialogClose`.

```jsonc
{
  "ControlType": "List",
  "UseEvents": true,
  "Events": {
    "SearchOrder": ["change", "Delete", "DialogClose"],
    "change": "ON_SEARCH_SELECTED",
    "Delete": "ON_SEARCH_CLEARED",
    "DialogClose": "ON_SEARCH_CLOSED"
  }
}
```

## 함정

- Search 루트에 `Title`/`SubTitle`/`CollectionMapper` 두지 않기 — List 내부에만.
- `KeywordSearchCkey` 는 **원본 데이터 필드명** (대상 Ckey 가 아님).
- `UseMultiData=true` 는 거의 사용 안 함 — Search 는 단일 선택이 일반.
- DataSource 가 Fixed 라면 Search 가 아니라 Combo 사용.
- `Ckeys` 사용 시 **상위 Group 계층 어딘가에** `UseDataConnection: true` + `DataConnection` 필요.
