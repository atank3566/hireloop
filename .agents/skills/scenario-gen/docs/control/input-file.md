# InputFile

파일 첨부 컨트롤. `Module` 값으로 저장 백엔드를 결정하고 그에 맞는 `Attributes` shape 를 사용한다.

## 스키마

`control/input-file.schema.json` — `controlBase` + 분기 키 (`ControlType="InputFile"`, `Module`, `Title`, `Description`, `Limit`, `AllowExtensions`, `UseClickdownload`, `Attributes`, `UseEvents`, `Events`).

## 필수 / 핵심 속성

| 속성 | 필수 | 설명 |
|---|---|---|
| `ControlType` | ★ | const `"InputFile"`. |
| `Module` | ★ | 저장 백엔드 식별 — 5종 enum. 기본 `"FlexFile"`. |
| `Attributes` | (Module 별 분기) | 모듈별 백엔드 옵션. shape 가 `Module` 값에 의존. |
| `Title` | | 컨트롤 제목 (식별/문서용). |
| `Description` | | 컨트롤 설명 텍스트. |
| `Limit` | | 업로드 제한 (개수). `0`/미설정=런타임 기본. |
| `AllowExtensions` | | 허용 확장자 화이트리스트 (string 배열, 소문자+숫자만). 일부 모듈만 노출 (아래 표). |
| `UseClickdownload` | | **소문자 'd' 표기** 주의 — `'UseClickdownload'` (engine const). HostingFolder 외 모듈에서 노출. |
| `UseEvents` / `Events` | | KsystemPayPDF 외 모듈에서 사용 가능. |

## Module 5종 (engine const `FILE_MODULE`)

| 값 | 워크스페이스 가시성 | Attributes 핵심 키 |
|---|---|---|
| `"FlexFile"` | 모든 ws | `UseCategory`(기본 true) / `CategoryName` 또는 `InnerCKey` / `FlexKey.ckey` / `SharedTarget` / `Directory` |
| `"KsystemFile"` | 모든 ws | `UseCategory`(기본 false) / `Ckeys` / `Const` / `InnerCKey` 또는 `CategoryName` |
| `"KsystemPayPDF"` | 모든 ws | `Ckeys` / `Const` (이벤트 미지원) |
| `"HostingFolder"` | flex / okong / hallim / bhidev | `UseCategory`(기본 true) / `CategoryName` / `FlexKey.ckey` / `FileName` / `FolderRoute` |
| `"ServerkitFile"` | flex / okong / hallim / bhidev | `UseCategory`(기본 true) / `CategoryName` / `FlexKey.ckey` / `FileName` / `FolderRoute` |

> Module 전환 시 스튜디오가 `Attributes` 를 해당 모듈의 `FILEATTR` 기본형으로 초기화 + `UseEvents`/`Events` 도 리셋.

## 모듈별 옵션 가시성

| 옵션 | FlexFile | KsystemFile | KsystemPayPDF | HostingFolder | ServerkitFile |
|---|:---:|:---:|:---:|:---:|:---:|
| `AllowExtensions` | ✓ | — | — | ✓ | ✓ |
| `UseClickdownload` | ✓ | ✓ | ✓ | — | ✓ |
| `UseEvents` / `Events` | ✓ | ✓ | — | ✓ | ✓ |
| `Limit` | ✓ | ✓ | ✓ | ✓ | ✓ |

## `AllowExtensions` 규칙

런타임 검증 — `/^[a-z0-9]+$/` 정규식 통과해야 하고, 차단 리스트에 없어야 함. 잘못된 값은 자동 필터링.

**차단 확장자**: `exe`, `msi`, `bat`, `cmd`, `com`, `ps1`, `vbs`, `js`, `jar`, `sh`, `apk`, `dmg`, `docm`, `xlsm`, `pptm`

```jsonc
"AllowExtensions": ["jpg", "png", "pdf", "docx"]   // OK
"AllowExtensions": ["JPG", "EXE"]                  // 런타임 필터링 — JPG 는 소문자로, EXE 는 차단 리스트라 제거됨
```

## `UseClickdownload` — 키 표기 함정

```jsonc
"UseClickdownload": true     // ✓ 진실원본 (engine const K.FILE.USE_CLICK_DOWNLOAD)
"UseClickDownload": true     // ✗ 잘못된 표기 — 대문자 'D' 쓰지 말 것
```

소문자 'd' 가 정상. boolean strict — 문자열 `"true"`/`"false"` 금지.

## 예시 — Module='FlexFile' (가장 일반)

```jsonc
{
  "ControlType": "InputFile",
  "Id": "f_42",
  "ControlDefaultName": "InputFile1",
  "ControlName2": "InputFile1",
  "Caption": "InputFile1",
  "Title": "사진 첨부",
  "Description": "지원 형식: jpg, png. 최대 5장.",
  "Module": "FlexFile",
  "Limit": 5,
  "AllowExtensions": ["jpg", "jpeg", "png"],
  "UseClickdownload": true,
  "Attributes": {
    "UseCategory": true,
    "CategoryName": "CtgPhotos",
    "FlexKey": { "ckey": "PhotoKey" },
    "SharedTarget": "tenant"
  },
  "Width":  { "SizeValue": 100, "SizeUnit": "%" },
  "Height": { "MatchText": true, "SizeValue": "" },
  "isColumnCtrl": false
}
```

## 예시 — Module='KsystemFile'

```jsonc
{
  "ControlType": "InputFile",
  "Id": "f_43",
  "ControlDefaultName": "KsysFile1",
  "ControlName2": "KsysFile1",
  "Caption": "KsysFile1",
  "Module": "KsystemFile",
  "Limit": 1,
  "Attributes": {
    "Ckeys": ["FileSeq"],
    "Const": "DOC_MODULE_X",
    "UseCategory": false,
    "InnerCKey": "FileBlock"
  },
  "Width":  { "SizeValue": 100, "SizeUnit": "%" },
  "Height": { "MatchText": true, "SizeValue": "" },
  "isColumnCtrl": false
}
```

## 예시 — Module='HostingFolder'

```jsonc
{
  "ControlType": "InputFile",
  "Id": "f_44",
  "ControlDefaultName": "Hosting1",
  "ControlName2": "Hosting1",
  "Caption": "Hosting1",
  "Module": "HostingFolder",
  "AllowExtensions": ["pdf"],
  "Attributes": {
    "UseCategory": true,
    "CategoryName": "CtgDocs",
    "FlexKey":    { "ckey": "DocKey" },
    "FileName":   "DocFileName",
    "FolderRoute":"contracts/2026/"
  },
  "Width":  { "SizeValue": 100, "SizeUnit": "%" },
  "Height": { "MatchText": true, "SizeValue": "" },
  "isColumnCtrl": false
}
```

> `FolderRoute` 는 스튜디오가 입력 시 선행/후행 슬래시를 자동 정규화해 `"foo/bar/"` 형태로 저장. 메타에 박을 때도 같은 형태 권장.

## `Attributes` 키 의미

| 키 | 적용 모듈 | 의미 |
|---|---|---|
| `UseCategory` | FlexFile / KsystemFile / HostingFolder / ServerkitFile | true=별도 카테고리 누적 / false=InnerCKey 단일 |
| `CategoryName` | UseCategory=true 일 때 | `scenario.Panel.Category` 에 정의된 카테고리명 |
| `InnerCKey` | UseCategory=false 일 때 | 부모 섹터의 InnerBlock 키 |
| `Ckeys` | KsystemFile / KsystemPayPDF | 파일 시퀀스 저장 컬렉션 필드들 |
| `Const` | KsystemFile / KsystemPayPDF | 백엔드 상수 식별자 |
| `FlexKey` | FlexFile / HostingFolder / ServerkitFile | `{ ckey: '...' }` — 파일키 저장 필드명 |
| `SharedTarget` | FlexFile | `"user"` (사용자 전용) / `"tenant"` (테넌트 공유, 기본) |
| `Directory` | FlexFile (선택) | 저장 경로 디렉토리 |
| `FileName` | HostingFolder / ServerkitFile | 저장 파일명 컬렉션 필드명 |
| `FolderRoute` | HostingFolder / ServerkitFile | 저장 폴더 경로 (`"foo/bar/"` 형태) |

## 이벤트

`Events` 는 `_base.schema.json#/$defs/inputFileEvents` 적용. `InputFileOrder` 에 등록한 이벤트마다 동명 핸들러 필수 (if/then).

| 이벤트 | 발화 | 비고 |
|---|---|---|
| `change` | 파일 추가/제거 | `EVENT_CHANGE='change'` (소문자) |
| `Click` | 컨트롤 클릭 | `EVENT_CLICK='Click'` (대문자 C) |
| `upload` | 업로드 완료 | `EVENT_UPLOAD='upload'` (소문자) |

```jsonc
{
  "UseEvents": true,
  "Events": {
    "InputFileOrder": ["change", "upload"],
    "change": "ON_FILE_CHANGE_E",
    "upload": "ON_FILE_UPLOAD_E"
  }
}
```

> Module='KsystemPayPDF' 에서는 스튜디오 프로퍼티 패널이 Event 섹션을 노출하지 않는다 — UseEvents/Events 두지 말 것.

## 데이터 바인딩

- `Attributes.FlexKey.ckey` (FlexFile / HostingFolder / ServerkitFile) 또는 `Attributes.Ckeys` (Ksystem 계열) 사용 시 **상위 Group 계층 어딘가에** `UseDataConnection: true` + `DataConnection` 필요.
- `Attributes.UseCategory: true` 면 첨부 메타가 `Attributes.CategoryName` 카테고리 섹터들로 추가/삭제됨 — `scenario.Panel.Category` 에 사전 등록 필요.

## 함정

- `ControlName2` 누락 = 런타임 에러. `ControlDefaultName` 과 같은 값.
- `isColumnCtrl: false` 항상 명시.
- **`UseClickdownload` 표기** — 소문자 'd' (`UseClickDownload` 아님). 대문자로 쓰면 런타임이 인식 못 함.
- `AllowExtensions` 값은 모두 소문자 알파벳/숫자만 — 대문자/특수문자 들어가면 런타임이 필터링.
- Module 전환 시 `Attributes` 가 새 모듈의 기본형으로 자동 초기화되므로 이전 모듈 키가 남아있으면 운영 메타. AI 생성 시에는 Module 에 맞는 키만 채울 것.
- `Module='KsystemPayPDF'` 는 `UseEvents`/`Events` 두지 말 것 (프로퍼티 패널 비노출).
- `Attributes.UseCategory: true` 인데 `CategoryName` 빠뜨리면 schema if/then 차단.
- `Attributes.FlexKey` 는 **객체** `{ ckey: '...' }` — string 으로 두지 말 것 (ImageBox.EditGroup.FlexKey 와 동일 형태).
