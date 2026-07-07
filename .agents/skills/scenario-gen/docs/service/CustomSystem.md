# CustomSystem Service (CustomSystem.schema.json) — Action='API' 와 짝

사용자 정의 시스템 (외부 마이크로서비스 / 인증 시스템 / 별도 도메인 백엔드 등) 호출. 워크스페이스 콘솔에서 등록한 [API 연동 템플릿](https://docs.flextudio.com/flextudio/workspace/interface/data/api) 을 이벤트로 등록한 결과 메타.

스튜디오 UI 의 **이벤트 → API 추가** 가 메타에서는 `Action: 'API'` + `SystemType: 'CustomSystem'` 으로 박힘. **`fEventKey` + `fEvent` (= docs.flextudio.com 의 "Event Config Key") 로 외부 라우팅** 정의.

> **참고**: [docs.flextudio.com — API 호출](https://docs.flextudio.com/flextudio/scenario/dev-mode/event/api), [API 연동 템플릿](https://docs.flextudio.com/flextudio/workspace/interface/data/api).
> **스킬 생성에서는 사용 금지** — `[no-service]` 가 차단.

각 fEvent 값은 [대체 스크립트 `{% %}`](https://docs.flextudio.com/flextudio/concept/alternative) 로 동적 치환. docs.flextudio.com 의 "Event Config Key" 항목이 본 schema 의 `fEventKey` 배열에 해당.

## 1. 사용 시점

- 워크스페이스 콘솔에서 등록한 CustomSystem (이름: `New_01`, `New_02`, `New_05`, ...) 으로의 라우팅.
- Custom REST 와 차이: URL/Method 직접 노출 X. 시스템 식별자(`New_NN`) + 모듈 GUID + fEvent 매핑으로 추상화.
- 회사 내부 마이크로서비스, 다른 시나리오 / 도메인 호출.

## 2. 식별 필드

| 필드 | 값 / 패턴 | 비고 |
|---|---|---|
| `SystemID` | `^New_[0-9]+$` | 실 샘플: `New_01`, `New_02`, `New_05` |
| `SystemType` | `"CustomSystem"` (고정) | const |
| `ModuleID` | GUID v4 (`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`) | 워크스페이스가 발급 |
| `fEventKey` | string[] | 사용할 키 이름 배열 |
| `fEvent` | { [key]: string } | 키 → 값 매핑 |

## 3. fEventKey + fEvent 페어링

`fEventKey` 에 나열한 키들이 `fEvent` 객체의 키와 일치해야 한다 (워크스페이스 라우팅이 fEventKey 기준으로 fEvent 값을 추출).

```jsonc
"fEventKey": ["companySeq", "memSeq", "groupSeq", "url", "mapping"],
"fEvent": {
  "companySeq": "{%_c.userInfo[0].companySeq%}",
  "memSeq":     "{%_c.userInfo[0].memSeq%}",
  "groupSeq":   "{%_c.activeGroup[0].groupSeq%}",
  "url":        "{%_base.flextudio.serviceUrl%}",
  "mapping":    "ideation/getmanualmembers"
}
```

### fEvent 값 종류

| 형태 | 의미 |
|---|---|
| 정적 문자열 (`"ideation/newideation"`) | 외부 시스템의 endpoint path 또는 라우팅 코드 |
| `{%_base.X.Y%}` | 시스템 컨텍스트 — `_base.User`, `_base.Company`, `_base.flextudio.serviceUrl` 등 |
| `{%_c.<Cat>[0].<field>%}` | 컬렉션 첫 섹터의 필드 |
| `{%_c.<Cat>.activeSector.<field>%}` | 활성 섹터의 필드 |

### 표준 fEventKey 항목

실 샘플에서 자주 등장하는 키:

| 키 | 용도 |
|---|---|
| `url` | 외부 시스템 base URL (`{%_base.flextudio.serviceUrl%}`) |
| `mapping` | 라우팅 path (정적 문자열, 예: `"ideation/clickend"`) |
| `companySeq` / `fBaseCompanyID` | 회사 식별자 |
| `memSeq` / `fBaseUserNo` | 사용자 식별자 |
| `groupSeq` | 그룹/조직 식별자 |
| `ideationSeq` | 기능별 도메인 키 |

## 4. 형태

```jsonc
"ServiceBinding": {
  "newIdeation": {
    "SystemID":       "New_05",
    "SystemType":     "CustomSystem",
    "ModuleID":       "59f96601-69c3-411f-93b7-b0b230523fa2",
    "SetCategory":    true,
    "UsePKey":        true,
    "UseParamBlock":  true,
    "UseResultBlock": true,
    "NotSeperateInnerBlock": true,
    "fEventKey":      ["url", "mapping"],
    "fEvent": {
      "url":     "{%_base.flextudio.serviceUrl%}",
      "mapping": "ideation/newideation"
    }
  }
}
```

## 5. Action 인라인 형태

ServiceBinding 을 별도 등록하지 않고 Action 안에 인라인 박는 패턴:

```jsonc
"Events": {
  "doStuff": [{
    "Action": "API",
    "ModuleID":      "13be8848-501d-4fa4-a0c7-e5a5b0bcb5e6",
    "SystemID":      "New_05",
    "SystemType":    "CustomSystem",
    "UseCategory":   true,
    "UseParamBlock": true,
    "UseResultBlock":true,
    "UsePKey":       true,
    "SetCategory":   true,
    "NotSeperateInnerBlock": true,
    "fEventKey":     ["fBaseCompanyID", "fBaseUserNo", "url", "mapping"],
    "fEvent": {
      "fBaseCompanyID": "{%_base.Company.fBaseCompanyID%}",
      "fBaseUserNo":    "{%_base.User.fBaseUserNo%}",
      "url":            "{%_base.flextudio.serviceUrl%}",
      "mapping":        "member/userinfo"
    },
    "ParamBlocks":  [],
    "ResultBlocks": [{ "TargetType":"replace", "CategoryName":"userInfo" }]
  }]
}
```

`Action: 'API'` 로 적는 게 실 샘플 패턴 (CustomSystem 은 API 호출 형태로 표기).

## 6. API 연동 흐름

```
[1] Action='API' SystemType='CustomSystem' → 워크스페이스 라우팅
[2] fEventKey 의 각 키에 대해 fEvent[key] 템플릿 평가
    (예: {%_base.flextudio.serviceUrl%} → 실제 URL 치환)
[3] {url}/{mapping} 으로 HTTP 요청 (백엔드 자동 정의된 Method)
[4] ParamBlocks → 요청 본문
[5] 응답 → ResultBlocks 카테고리 반영
```

## 7. 검증 규칙 (스키마 강제)

| 규칙 | 동작 |
|---|---|
| `SystemID` 패턴 `^New_[0-9]+$` | `New_NN` 외 거부 |
| `SystemType === 'CustomSystem'` const | |
| `ModuleID` GUID v4 패턴 | 잘못된 형식 거부 |
| `fEventKey` 항목 패턴 `^[A-Za-z_][A-Za-z0-9_]*$` | 식별자 형태 |
| `fEvent` 모든 값 string | 객체/숫자/null 금지 |
| `fEventKey` ↔ `fEvent.keys()` 일치 | $comment — 후검증 후크 (TODO) |
