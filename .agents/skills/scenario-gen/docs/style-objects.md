# Style Objects (style-objects.schema.json)

Group / Control / BottomButton 등에서 **반복적으로 등장하는 디자인/레이아웃 객체**를 한 곳에 모은 카탈로그. 다른 schema는 `$ref` 로 참조한다. 모든 정의는 `style-objects.schema.json#/$defs/<name>` 형태.

> **데이터 관련 객체** (`dataConnection`, `sectorFilter`, DataUsage 분기, Filter 카탈로그) 는 별도 `data-objects.{schema.json,md}` 에 정의됨. 본 파일은 디자인/레이아웃만 다룸.

## 1. `sizeObject` — Width / Height

```jsonc
{
  "MatchText": false,
  "SizeValue": 100,        // number 또는 string
  "SizeUnit": "%"          // %, px, vh, vw, text
}
```

규칙:
- `MatchText: true` → 컨텐츠에 맞춤. `SizeValue` 는 무시되고 보통 빈 문자열 `""`.
- `SizeUnit: "text"` → MatchText 모드에서 자주 사용 (예: 라벨 너비 = 텍스트 길이).
- `calc()` 표현 사용 가능: `"SizeValue": "calc(100% - 40px)"` (`+`/`-` 좌우 공백 필수).

## 2. `spacing` — Padding / Margin / AbsolutePosition

```jsonc
{
  "UseAuto": true,
  "UseEach": true,
  "All": "",
  "Top": "10",
  "Right": "8",
  "Btm": "10",
  "Left": "8",
  "SizeUnit": "px"
}
```

규칙:
- **하단 키 명명: `Btm`** 사용 (Padding/Margin/AbsolutePosition). BorderStyle만 `Bottom` 사용.
- 사용하지 않는 방향은 키 자체를 **생략**. 빈 문자열 `""` 은 "미설정"으로 동작 안 함.
- `UseEach: true` → 방향별로 다른 값. `UseEach: false` → `All` 만 사용.

## 3. `absolutePosition` — 절대 위치 오버레이

`spacing` 과 동일 구조. 사용처:

```jsonc
{
  "UseAbsoluteLayout": true,
  "AbsolutePosition": { "Btm": "20", "Right": "20", "SizeUnit": "px" }
}
```

상단/하단, 좌측/우측 동시 설정 불가 (한쪽만).

## 4. `displayStyle` — Flex/Display 레이아웃

```jsonc
{
  "UseDisplay": true,
  "DisplayType": "Flex",
  "FlexDirection": "column",          // row | column | wrap
  "FlexWrap": false,
  "DisplayAlign": "Left",             // Left | Center | Right | Between
  "DisplayVerticalAlign": "Top",      // Top | Center | Bottom
  "flexBoxType": "align",
  "columnGapValue": "8", "columnGapUnit": "px",
  "rowGapValue": "8",    "rowGapUnit": "px"
}
```

## 5. `fontStyle`

```jsonc
{
  "UseFont": true,
  "FontColor": "var(--colorBlack)",   // 권장 토큰 (§10 컬러 카탈로그). legacy @colorBlack 도 통용.
  "FontSize": "14",
  "FontWeight": "Medium",             // Regular | Medium | SemiBold | Bold
  "FontAlign": "flex-start",          // flex-start | center | flex-end
  "UseBold": false
}
```

## 6. `borderStyle`

```jsonc
{
  "Useborder": true,
  "BorderColor": "var(--colorGray3)",
  "BorderSize": 1,
  "BorderType": "solid",
  "SizeSet": "All",                   // All | Top | Right | Bottom | Left
  "BorderRadius": "8",
  "RadiusSet": "All"
}
```

**주의:** BorderStyle은 하단 키를 `Bottom` 으로 쓴다 (Padding/Margin/AbsolutePosition은 `Btm`).

## 7. `bgStyle`

```jsonc
{
  "UseBackground": true,
  "BgColor": "var(--colorWhite)",
  "UseImage": false,
  "Image": {}
}
```

## 8. `captionStyle`

```jsonc
{
  "UseDesign": true,
  "FontWeight": "SemiBold",
  "CaptionPosition": "",              // "" | Left | Top
  "FontSize": "13",
  "FontAlign": "flex-start"
}
```

`CaptionPosition` 값:
- `""` — `styleInputValueLine` 기본 (스타일이 캡션 자체 렌더링)
- `"Left"` — 입력 옆
- `"Top"` — 입력 위 (row 레이아웃)

## 9. 데이터 바인딩은 별도 파일

`dataConnection`, `sectorFilter`, DataUsage 분기, Filter 카탈로그 등 **데이터 관련 객체는 `data-objects.{schema.json,md}` 로 분리**되어 있다. 본 파일은 디자인/레이아웃 객체만 다룸.

## 10. `colorToken` — 권장 컬러 토큰 카탈로그

`$defs/colorToken` 에 enum 으로 정의. AI 생성 시 `BgColor`, `FontColor`, `BorderColor` 에 이 토큰 사용 권장. 실 메타는 hex(`#000`), legacy(`@colorBlack`), 임의 `var()` 도 통용 — schema 는 string 으로 유지.

| 토큰 | 용도 |
|---|---|
| `var(--colorMain)` | Primary brand color |
| `var(--colorMainLight)` | Primary light background |
| `var(--colorWhite)` | White |
| `var(--colorBlack)` | Black (강조 텍스트, 아이콘) |
| `var(--colorGray1)` | Darkest gray (primary text) |
| `var(--colorGray2)` | Dark gray (secondary text) |
| `var(--colorGray3)` | Medium gray (tertiary text) |
| `var(--colorGray4)` | Light gray (disabled, placeholder) |
| `var(--colorGray5)` | Lighter gray (border, divider) |
| `var(--colorGray9)` | Near-white gray (background) |
| `var(--colorGray10)` | Lightest gray (tag background) |
| `var(--colorRed)` | Error / Delete |
| `var(--colorRedLight)` | Error background |
| `var(--colorBlue)` | Info / Link |
| `var(--colorBlueLight)` | Info background |
| `var(--colorGreen)` | Success / Approved |
| `var(--colorGreenLight)` | Success background |
| `var(--colorOrange)` | Warning / Required indicator |
| `var(--colorPurple)` | Accent |
| `var(--colorPurpleLight)` | Accent background |
| `var(--colorYellow)` | Caution / Pending |
| `var(--colorYellowLight)` | Caution background |
| `var(--colorMint)` | Mint / Complete |
| `var(--colorMintLight)` | Mint background |
| `var(--colorSub0)` | Supplementary color 0 |
| `var(--colorSub0Light)` | Supplementary color 0 background |
| `var(--colorSub1)` | Supplementary color 1 |
| `var(--colorSub3)` | Supplementary color 3 |

총 28개 토큰. catalog.json `colorTokens` 와 동기화.

### 허용되는 색상 값 형태

`BgColor` / `FontColor` / `BorderColor` 등 모든 색상 필드는 `type: string` 으로 자유. 다음 형태 모두 허용:

| 형태 | 예시 | 비고 |
|---|---|---|
| 권장 토큰 | `var(--colorMain)`, `var(--colorOrange)` | 위 28개 |
| Hex | `#333333`, `#000`, `#abc` | 3/6 자리 모두 OK |
| Hex + alpha | `#33333380` | 8자리 |
| RGB / RGBA | `rgb(255, 0, 0)`, `rgba(33, 21, 7, 0.654)` | |
| HSL / HSLA | `hsl(0, 100%, 50%)`, `hsla(0, 100%, 50%, 0.5)` | |
| Legacy 토큰 | `@colorBlack`, `@colorMain` | 운영 메타에서 등장 |
| CSS keyword | `red`, `white`, `transparent` | |

→ schema 는 strict enum 강제 안 함. `$defs/colorToken` 은 **AI 생성 가이드** 역할이며, AI가 우선 권장 토큰 중 선택하고, 토큰에 없는 디자인 요청(예: "정확히 #ff5733") 만 hex/rgba 로 폴백.
