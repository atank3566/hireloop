# ImageBox

이미지 표시/업로드 컨트롤. `ImageBoxType` 으로 두 모드 분기.

## 스키마

`control/image-box.schema.json` — `controlBase` + 분기 키 (`ControlType="ImageBox"`, `ImageBoxType`, `ViewGroup`, `EditGroup`).

## ImageBoxType (제한)

| 값 | 동작 | 필수 프로퍼티 |
|---|---|---|
| `"View"` | 읽기 전용 표시 | `ViewGroup` |
| `"Edit"` | 업로드/촬영 + 표시 | `ViewGroup` (placeholder) + `EditGroup` (FlexFile 저장) |

> **원리**: Edit 업로드 → 파일키가 `EditGroup.FlexKey.ckey` 컬렉션 필드에 저장. View 에서 동일 `ImageSrcType: "FlexFile"` + 동일 `FlexKey`/`ckey` 값으로 표시.

## ImageSrcType (ViewGroup.ImageSrcType)

| 값 | 키 | 의미 |
|---|---|---|
| `"FlexFile"` | `FlexKey` + `ckey` | Edit 업로드 이미지 표시 (둘은 같은 값) |
| `"Url"` | `ImageUrl` | 외부 URL. `{=ImageField}` 바인딩 가능 |
| `"Base64"` | `ImageUrl` | Base64 인코딩 인라인 |
| `"Upload"` | — | **Edit 모드 전용** — `ViewGroup` 의 업로드 placeholder. `EditGroup` 와 짝 |

## 시나리오 생성 시 (AI 생성 스켈레톤)

**AI 가 시나리오를 생성할 때는 데이터 바인딩 메타(`ViewGroup` / `EditGroup`)를 생략해도 된다.** FlexFile 키 / 카테고리 필드명 / SharedTarget 등은 스튜디오 또는 사용자가 사후 설정한다.

```jsonc
// AI 생성 — View 스켈레톤 (데이터 미설정)
{
  "ControlType": "ImageBox",
  "ImageBoxType": "View",
  "ControlDefaultName": "ImgView1",
  "ControlName2": "ImgView1",
  "Caption": "ImgView1",
  "Id": "f_41",
  "Width":  { "SizeValue": "80",  "SizeUnit": "px" },
  "Height": { "SizeValue": "80",  "SizeUnit": "px" },
  "isColumnCtrl": false
}
```

```jsonc
// AI 생성 — Edit 스켈레톤 (데이터 미설정)
{
  "ControlType": "ImageBox",
  "ImageBoxType": "Edit",
  "ControlDefaultName": "ImgUpload1",
  "ControlName2": "ImgUpload1",
  "Caption": "ImgUpload1",
  "Id": "f_42",
  "Width":  { "SizeValue": 100,   "SizeUnit": "%" },
  "Height": { "SizeValue": "200", "SizeUnit": "px" },
  "isColumnCtrl": false
}
```

> **원칙**: AI 는 `ImageBoxType` 만 결정하고 데이터 메타는 두지 않는다. 다만 `ViewGroup` / `EditGroup` 을 **굳이 작성한다면** 아래 정식 예시처럼 **유효한 형태로** (ImageSrcType 별 필수 키를 채워서) 작성해야 한다 — 빈 객체 / 누락 키는 schema 차단.

## 예시 — View 모드 (FlexFile)

```jsonc
{
  "ControlType": "ImageBox",
  "ImageBoxType": "View",
  "ViewGroup": {
    "ImageSrcType": "FlexFile",
    "SharedTarget": "tenant",
    "FlexKey": "PhotoUrl",
    "ckey": "PhotoUrl"
  },
  "Width":  { "SizeValue": "80", "SizeUnit": "px" },
  "Height": { "SizeValue": "80", "SizeUnit": "px" },
  "ControlDefaultName": "ImgView",
  "ControlName2": "ImgView",
  "Caption": "ImgView",
  "Id": "f_41",
  "isColumnCtrl": false
}
```

## 예시 — View 모드 (Url)

```jsonc
{
  "ControlType": "ImageBox",
  "ImageBoxType": "View",
  "ViewGroup": {
    "ImageSrcType": "Url",
    "ImageUrl": "{=ImageField}"
  },
  "ControlDefaultName": "ImgUrl",
  "ControlName2": "ImgUrl",
  "Caption": "ImgUrl",
  "Id": "f_42",
  "isColumnCtrl": false
}
```

## 예시 — Edit 모드

```jsonc
{
  "ControlType": "ImageBox",
  "ImageBoxType": "Edit",
  "ViewGroup": {
    "ImageSrcType": "Upload"
  },
  "EditGroup": {
    "ImageSrcType": "FlexFile",
    "SharedTarget": "tenant",
    "FlexKey": { "ckey": "PhotoUrl", "Name": "" },
    "Module": "FlexFile"
  },
  "UseCondition": "false",
  "UseMultiData": "false",
  "UseEvents": "false",
  "Events": {},
  "Width":  { "SizeValue": 100,    "SizeUnit": "%" },
  "Height": { "SizeValue": "200",  "SizeUnit": "px" },
  "ControlDefaultName": "ImgUpload",
  "ControlName2": "ImgUpload",
  "Caption": "ImgUpload",
  "Id": "f_43",
  "isColumnCtrl": false
}
```

> **Edit 모드 필수**: `ViewGroup`(`ImageSrcType: "Upload"`) + `EditGroup`(FlexFile 저장) 둘 다. `UseCondition`/`UseMultiData`/`UseEvents`/`Events` 함께 작성하는 것이 실 샘플 패턴 (값은 문자열 `"false"` 도 통과).

## 이벤트 (제한)

`Events` 는 `_base.schema.json#/$defs/imageBoxEvents` 적용. `ImageEventOrder` 에 `Click` 만. EventOrder ↔ 핸들러 일치 강제.

```jsonc
{
  "UseEvents": true,
  "Events": {
    "ImageEventOrder": ["Click"],
    "Click": "ON_IMAGE_CLICK_E"
  }
}
```

## FlexKey 형태

| 모드 | 형태 | 비고 |
|---|---|---|
| `View` | string (필드명) | `ckey` 와 동일 값으로 동시에 작성 |
| `Edit.EditGroup` | `{ "ckey": "...", "Name": "" }` | `ckey` 가 저장 대상 필드명 |

## SharedTarget

`"tenant"` (테넌트 공유, 일반) / `"user"` (사용자 전용) / `"global"` (전역 공유). 실 샘플 대부분 `"tenant"`.

## `UseDefaultValue` — 기본(폴백) 이미지

`UseDefaultValue` 는 **단일 boolean 키**(`engine const K.USE_DEFAULTVALUE='UseDefaultValue'`) 지만 `ImageBoxType` 별로 의미가 다르다. property-data.js 가 두 개의 UI 토글(`createUseDefault` / `createUseDefaultView`)로 노출하지만 둘 다 같은 키에 기록.

| ImageBoxType | 토글 UI 위치 | UseDefaultValue=true 효과 | 추가 키 |
|---|---|---|---|
| `Edit` | `createUseDefault` (id `UseDefault`) — Edit 그룹 안 | EditGroup 업로드 실패/미설정 시 `ViewGroup` 의 이미지를 placeholder 로 표시 ([imagebox.js:42-45](public/engine/control/imagebox.js#L42)) | `ViewGroup` (기존) |
| `View` | `createUseDefaultView` (id `UseDefaultView`) — View 그룹 안 | `ViewGroup` 의 FlexFile/Base64 로드가 비어있을 때 `DefaultViewGroup` 의 이미지를 fallback 으로 표시 | `DefaultViewGroup` 추가 |

> **View 모드의 토글 표시 조건** (property-data.js line 11780): `ViewGroup.ImageSrcType ∈ { "FlexFile", "Base64" }` 일 때만 스튜디오 프로퍼티 패널에 노출. `Url` 일 때는 표시 안 됨 (URL 은 외부 리소스라 fallback 의미 약함).

### `DefaultViewGroup` 형태

`ViewGroup` 과 **완전히 동일한 shape** — `_base.schema.json#/$defs/imageBoxViewGroup` 그대로 재사용. 즉 `ImageSrcType` 분기에 따라 `FlexKey`/`ckey`/`ImageUrl` 등이 같은 규약으로 채워진다.

```jsonc
// View 모드 + UseDefaultValue=true (운영 메타 예 — AI 생성에는 두지 말 것)
{
  "ControlType": "ImageBox",
  "ImageBoxType": "View",
  "ViewGroup": {
    "ImageSrcType": "FlexFile",
    "SharedTarget": "tenant",
    "FlexKey": "PhotoUrl",
    "ckey":    "PhotoUrl"
  },
  "UseDefaultValue": true,
  "DefaultViewGroup": {
    "ImageSrcType": "Url",
    "ImageUrl": "/imagesCommon/avatar-placeholder.png"
  },
  "Id": "f_60"
}
```

→ `_collections` 에서 `PhotoUrl` 이 비어있거나 FlexFile 다운로드가 실패하면 `DefaultViewGroup` 의 placeholder URL 이 대신 표시.

### Edit 모드 — `UseDefaultValue=true` 만 두는 케이스

```jsonc
{
  "ControlType": "ImageBox",
  "ImageBoxType": "Edit",
  "ViewGroup": {
    "ImageSrcType": "Url",
    "ImageUrl": "/imagesCommon/upload-placeholder.png"
  },
  "EditGroup": {
    "ImageSrcType": "FlexFile",
    "FlexKey": { "ckey": "PhotoUrl", "Name": "" },
    "Module":  "FlexFile"
  },
  "UseDefaultValue": true,
  "Id": "f_61"
}
```

→ 업로드 전에는 `ViewGroup` 의 placeholder URL 이 보이고, 업로드 후에는 그 자리에 업로드한 이미지가 표시. Edit 모드에서는 `DefaultViewGroup` 을 두지 않는다 — `ViewGroup` 자체가 placeholder 역할.

### ★ AI 생성 정책

- `UseDefaultValue` 는 **boolean strict** (CHECKBOX 진실원본). 문자열 `"true"`/`"false"` 금지.
- `DefaultViewGroup` 은 **AI 생성 시 미포함** — 운영에서 placeholder 이미지를 정한 다음 사용자가 수동 설정. AI 가 굳이 placeholder 경로를 추측하지 않는다. ([control.md §AI 샘플 생성 금지 키](../control.md#ai-critical) 단일 진실원본 표 등재 — `AI_GEN_STRICT=1` 시 validate.mjs `[ai-gen]` 태그 차단.)
- AI 생성 스켈레톤 단계에서는 둘 다 생략 권장. ImageBoxType 만 결정.

## Edit ↔ View 연동

- Edit 업로드 시 → `EditGroup.FlexKey.ckey` 컬렉션 필드에 파일키 저장.
- View 에서 표시할 때 → `ImageSrcType: "FlexFile"` + 같은 `FlexKey`/`ckey` 값.
- View 에서 `ImageSrcType: "Url"` 로 두면 FlexFile 파일키는 표시 못 함 — 외부 URL 만.

## 함정

- `ControlName2` 누락 = 런타임 에러. `ControlDefaultName` 과 같은 값.
- `isColumnCtrl: false` 항상 명시 (Sheet 컬럼 모드는 OtherControl).
- AI 생성 단계에서는 `ViewGroup` / `EditGroup` 을 생략해도 schema 통과 (스켈레톤). 운영에 투입하려면 사후 설정 필수.
- Edit 모드 운영 시 `ViewGroup` 누락 → 업로드 후 표시 영역 비어 있음. `ImageSrcType: "Upload"` 로 placeholder 명시.
- Edit 모드 `EditGroup.FlexKey` 는 **객체** (`{ ckey, Name }`), View 모드 `FlexKey` 는 **string**. 혼동 주의.
- `Ckeys` 미사용 — 데이터 바인딩은 `ViewGroup.ckey` / `EditGroup.FlexKey.ckey` 로 처리 (별도 `Ckeys` 배열은 두지 않는다).
