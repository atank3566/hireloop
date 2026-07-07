# Flextudio Service (Flextudio.schema.json)

`SystemID:'Flextudio'` — flextudio 워크스페이스 내장 시스템 호출. const.js `SYSTEM_ID.FLEXTUDIO='Flextudio'`. 사용자/메시지 도메인 내장 기능.

런타임 구현: [`public/system/flextudio/flextudio.js`](../../../../public/system/flextudio/flextudio.js).

> **스킬 생성에서는 사용 금지** — `[no-service]` 가 차단.
> **`Flextudio API` ([`Flextudio API.md`](Flextudio%20API.md)) 와 다름!** 같은 도메인이지만 SystemID 가 다른 별개 시스템.

## 1. ModuleID 3종

| ModuleID | 동작 |
|---|---|
| `GetUserList` | 워크스페이스 회원/조직원 목록 조회 |
| `QueryMessage` | 메시지 목록 조회 |
| `SendMessage` | 메시지 발송 (푸시 등) |

> 결재자 조회 등에서 흔히 사용 (`SystemID:'Flextudio'`, `ModuleID:'GetUserList'`).

## 2. 식별 필드

| 필드 | 값 | 비고 |
|---|---|---|
| `SystemID` | `"Flextudio"` (고정) | const |
| `ModuleID` | enum 3종 | |

## 3. 형태 — GetUserList (결재자 조회 패턴)

```jsonc
"ServiceBinding": {
  "GetApprovalUsers": {
    "SystemID":       "Flextudio",
    "ModuleID":       "GetUserList",
    "SetCategory":    true,
    "UsePKey":        true,
    "UseParamBlock":  true,
    "UseResultBlock": true
  }
}
```

호출 측 Action:

```jsonc
{
  "Action":         "Service",
  "ServiceBinding": "GetApprovalUsers",
  "ServiceName":    "GetUserList",
  "SystemID":       "Flextudio",
  "ParamBlocks": [
    {
      "CategoryName": "filterUser",
      "UseFilter":    false,
      "UserData":     ["DepartmentSeq"]
    }
  ],
  "ResultBlocks": [
    { "TargetType": "replace", "CategoryName": "approvalUserList" }
  ]
}
```

## 4. SendMessage 패턴

푸시/메시지 발송용 Service Action. ParamBlock 으로 발송 대상 + 본문을 명시한다. (런타임 모달 다이얼로그는 `f.MessageBox(...)...show()` — 정본: [runtime/v1/script/f_messagebox.md](../../runtime/v1/script/f_messagebox.md).)

## 5. API 연동 흐름

```
[1] Action='Service' SystemID='Flextudio' → flextudio.js 라우팅
[2] ModuleID 분기 (GetUserList / QueryMessage / SendMessage)
[3] 워크스페이스 내부 사용자/메시지 데이터 조회/발송
[4] 결과 → ResultBlocks 카테고리 반영
```

## 6. `Flextudio` vs `Flextudio API` 차이

| 항목 | Flextudio | Flextudio API |
|---|---|---|
| SystemID | `'Flextudio'` | `'Flextudio API'` (공백 포함) |
| 인증 | 워크스페이스 세션 (자동) | `flexApiKey` 필요 |
| 모듈 | 3종 (GetUserList / QueryMessage / SendMessage) | 3종 (User / Message / Group) + SubModuleID |
| 호출 형태 | 내장 라우팅 | REST 호출 (`/v1/company/.../users`) |
| 런타임 | `flextudio.js` | `flextudio_api.js` |
| 용도 | 시나리오 내부 사용자/메시지 헬퍼 | 외부 API Key 기반 사용자/메시지/그룹 CRUD |

자세한 차이는 [`Flextudio API.md`](Flextudio%20API.md) 참조.
