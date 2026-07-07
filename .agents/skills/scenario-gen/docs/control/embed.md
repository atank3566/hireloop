# Embed

> 공식 가이드: <https://docs.flextudio.com/flextudio/scenario/component/control/embed>

raw HTML 을 화면에 직접 삽입하는 컨트롤. `Embed` 속성에 HTML 문자열을 두면 그대로 렌더된다 — 내장 컨트롤로 표현이 어려운 비디오/iframe/외부 라이브러리 캔버스/style 주입 등에 사용.

## 스키마

`control/embed.schema.json` — `controlBase` + `Embed` (raw HTML).

## 필수 / 핵심 규칙

| 속성 | 비고 |
|---|---|
| `Embed` | ★ raw HTML 문자열. `<video>` / `<iframe>` / `<canvas>` / `<div>` / `<style>` 등. 섹터 값 바인딩은 `{%return Load.sector.Field; %}` (LoadScript 토큰) — **`{=Field}` 는 Embed 안에서 치환되지 않음, 사용 금지 (`[embed-bind]`)**. |
| `Caption` | ★ **반드시 빈 문자열 `""`** — Embed 본체에 그대로 표시되므로 ControlDefaultName 등 내부명 두면 노출됨 (스키마 const "" 강제). |
| `Width` / `Height` | 콘텐츠에 맞게. style-only Embed 는 0px × 0px (보이지 않게). |

## 기본 예시 — 비디오 임베드

```jsonc
{
  "ControlType": "Embed",
  "Id": "f_46",
  "ControlDefaultName": "Embed1",
  "ControlName2": "Embed1",
  "Caption": "",
  "Width":  { "SizeValue": 100,  "SizeUnit": "%" },
  "Height": { "SizeValue": "200", "SizeUnit": "px", "MatchText": false },
  "isColumnCtrl": false,
  "Embed": "<video src=\"https://example.com/{%return Load.sector.flexFileKey; %}\" style=\"width:100%;height:100%\" controls></video>"
}
```

## 섹터 값 바인딩 — `{%return Load.sector.Field; %}`

Embed raw HTML 안에서 섹터 값을 표시하려면 **LoadScript 토큰** `{% ... %}` 을 쓴다 — DC 그룹 안의 Embed 면 그 행의 섹터가 `Load.sector` 로 주입된다 (LoadScript 컨텍스트와 동일, [events.md](../events.md) §2.1 / [runtime/v1/collection/_c.md §6.5](../../../runtime/v1/collection/_c.md)).

```jsonc
// DC 그룹 (CategoryName: "CtgDeptPick") 안의 Embed
"Embed": "<div>선택 부서: <b>{%return Load.sector.DeptPickName; %}</b></div>"
```

> ⛔ **`{=Field}` 금지 (`[embed-bind]`)** — `{=Field}` 는 Label.labeltext / Button text 류 **display 전용 토큰**으로 Embed raw HTML 에서는 치환되지 않고 문자 그대로 노출된다. `checkEmbedSectorBinding()` 이 차단.

### ★ 토큰만으로는 연결이 보장되지 않는다 — 보장 조건 3가지

`Load.sector` 는 엔진의 전역 렌더 커서(`Current.sector`)를 읽는 getter 일 뿐이다 (engine publicscript.js). Embed 렌더는 다른 컨트롤과 달리 **sector 인자 없이** `replaceExpressions(embedHTML)` 를 타므로 (engine control.js `createEmbedVideo` — `{=Field}` 가 안 되는 이유이기도 함), `{%Load.sector.ckey%}` 가 실제 그 행의 값으로 평가되려면 다음이 모두 성립해야 한다:

| # | 조건 | 깨졌을 때 증상 | 보장 수단 |
|---|---|---|---|
| 1 | **조상 DC 그룹** — `UseDataConnection:true + CategoryName` 그룹 아래에 Embed 가 있어야 함. 조상 DC 가 섹터별 렌더 중일 때만 `Current.sector` 가 그 행을 가리킴 (engine layout.js) | DC 밖이면 `Load.sector` = undefined → `{% %}` try/catch 가 삼켜 **조용히 빈 문자열** | `[embed-bind]` 가 정적 차단 |
| 2 | **ckey 가 그 카테고리 섹터에 실제 존재** — Init mock(`intent.mock`/addSector) 또는 컨트롤 쓰기(Ckeys/CollectionMapper)로 채워져야 함 | 키 없으면 undefined → 빈 문자열 (에러 없음) | [mockup-data.md](../mockup-data.md) ★ 짝 규칙 (정적 검증 없음 — 직접 확인) |
| 3 | **값 변경 시 재평가** — `{% %}` 는 렌더 시점 1회 평가 | 값 바뀌어도 화면 그대로 | 아래 "값 변경 시 갱신" — fid+sector 타겟 리로드 |

### 🔴 값 변경 시 갱신 — fid+sector 타겟 리로드 필수

`{% %}` 토큰은 **렌더 시점에 1회 평가**된다 — 바인딩한 키의 컬렉션 값이 바뀌어도 Embed 는 자동 갱신되지 않는다. 값을 바꾸는 이벤트(Tree Selected / Combo change / 입력 change 등)에서 **해당 영역의 부모그룹을, 그 그룹을 그리는 섹터까지 한 번에** 타겟 리로드해야 한다:

```js
f.Content('<Embed 영역 부모그룹 fid>', <그 그룹을 그린 섹터>).reload();
```

- `fid` 만 주고 `sector` 를 빼면 안 된다 — DC 컨텍스트 안의 인스턴스를 섹터(SUID)로 좁혀야 그 행의 `Load.sector` 로 재평가된다 ([runtime/v1/script/f_content.md §3-1](../../../runtime/v1/script/f_content.md)).
- **DC 그룹 자체 fid 는 reload 금지** (복제 문제 — group.md 함정). Embed 를 **비연결 래퍼 그룹**으로 감싸고 그 래퍼 fid 를 리로드한다.

```jsonc
// 패턴: Tree 선택 → 배너 Embed 갱신
// [DC 그룹 f_3010 (CtgDeptPick)] > [TreeCard] + [BannerWrap f_3014 (UseDataConnection:false)] > [Embed]
// Tree.Events.Selected: "DeptTreeSelect_E"
"DeptTreeSelect_E": [
  { "Action": "Script", "Script": "f.Content('f_3014', _c.CtgDeptPick[0]).reload()" }
]
```

## ★ 외부 라이브러리 연동 패턴 (Chart / 지도 / QR 등)

> **핵심:** `<script>` 태그는 `Embed` 안에 **직접 넣을 수 없다.** 외부 라이브러리 URL 은 **`Scenario.StyleURLs` 배열에 등록하는 것이 표준** — 시나리오 진입 시 자동 로드되므로 별도 로딩 호출이 필요 없다.

### 표준 흐름

1. **유니크한 id 부여한 `<div>` / `<canvas>`** 를 Embed 안에 둔다.
2. 외부 라이브러리 URL 은 **`Scenario.StyleURLs`** 배열에 추가한다 (권장 — 진입 시 자동 로드).
   - `f.Script.load(url, callbackEventName)` 도 화이트리스트상 허용되지만, **정적으로 알 수 있는 라이브러리는 `StyleURLs` 에 두는 것을 우선**한다. `f.Script.load` 는 런타임에 동적으로만 결정되는 URL 등 부득이한 경우로 한정.
3. Step **`Loaded`** (DOM 준비 완료) 이벤트에서 `document.getElementById(uniqueId)` 로 DOM 을 잡아 **실제로 렌더**한다. (`StyleURLs` 로 미리 로드돼 있으므로 라이브러리 전역 객체를 바로 사용.)

> 🔴 **CRITICAL — 로드 ≠ 렌더 (`[embed-render]`)**: 라이브러리를 `StyleURLs`(또는 `f.Script.load`)로 불러오는 것만으로는 **아무것도 안 그려진다.** `<canvas>` / 빈 `<div id=…>` 를 둔 Embed 는 **반드시** host Step 의 `Loaded` 핸들러에서 `document.getElementById(...)` 로 DOM 을 잡아 `new Chart(...)` / `new naver.maps.Map(...)` 등 **렌더 코드를 직접 실행**해야 한다. 로딩 호출만 넣고 그리기를 빼먹으면 빈 영역만 남는다 — `checkEmbedRender()` 가 이 누락을 차단(`strict_embed_render:false` 로 비활성).

> ⚠️ **`Loaded` vs `Init`** — Chart/Canvas 처럼 DOM 이 그려진 뒤 즉시 작업하면 `Loaded`. 지도처럼 라이브러리 콜백으로 진입하는 패턴은 `Init` 에서 처리.
>
> ⛔ **Tab 컨트롤 내부 LinkedStep 에는 Embed 자체를 두지 말 것** (`[tab-embed]`) — 탭 내부 Step 은 `Loaded`/`Init` 이 미실행이라 위 초기화 흐름이 돌지 않는다. [control/tab.md](tab.md) 참조.
>
> `Loaded` 이벤트가 있는 Step 으로 **뒤로 돌아가는 BottomButton 은 `Prev_ReStart`** 사용 (재진입 시 차트/지도/캔버스 재초기화).

### 예시 A — Chart.js (Step Loaded)

```jsonc
// Embed control
{
  "ControlType": "Embed",
  "Id": "f_chart",
  "ControlDefaultName": "ChartEmbed", "ControlName2": "ChartEmbed",
  "Caption": "",
  "Width":  { "SizeValue": 100,  "SizeUnit": "%" },
  "Height": { "SizeValue": "300", "SizeUnit": "px", "MatchText": false },
  "isColumnCtrl": false,
  "Embed": "<canvas id=\"myChart\"></canvas>"
}
```

**권장 — 라이브러리는 `Scenario.StyleURLs` 에 등록** (진입 시 자동 로드, 별도 로딩 호출 불요):

```jsonc
{
  "Scenario": {
    "StyleURLs": [
      "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.8.0/Chart.bundle.min.js"
    ]
  }
}
```

```javascript
// Step Loaded 이벤트 — StyleURLs 로 이미 로드돼 있으므로 Chart 전역을 바로 사용.
var ctx = document.getElementById('myChart').getContext('2d');
new Chart(ctx, {
  type: 'bar',
  data: { labels: ['1월','2월','3월'], datasets: [{ label: '매출', data: [120, 190, 300] }] },
  options: { responsive: true }
});
```

> `f.Script.load('https://.../Chart.bundle.min.js', null, null)` 도 허용되지만, 위처럼 정적 URL 은 `StyleURLs` 등록을 우선한다.

### 예시 B — 네이버지도 (StyleURLs + Step Loaded 렌더)

```jsonc
// 라이브러리: Scenario.StyleURLs 에 등록 (진입 시 자동 로드)
{ "Scenario": { "StyleURLs": ["https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=YOUR_KEY"] } }

// Embed control
{
  "ControlType": "Embed",
  "Id": "f_map",
  "Caption": "",
  "Width":  { "SizeValue": 100,  "SizeUnit": "%" },
  "Height": { "SizeValue": "300", "SizeUnit": "px", "MatchText": false },
  "Embed": "<div id=\"naverMap\" style=\"width:100%;height:100%;\"></div>"
}
```

```javascript
// Step Loaded 핸들러 — getElementById 로 DOM 잡고 지도를 실제로 렌더 (로드는 StyleURLs 가 끝냄)
var el = document.getElementById('naverMap');
var lat = _c.activeSector.Latitude;
var lng = _c.activeSector.Longitude;
var map = new naver.maps.Map(el, { center: new naver.maps.LatLng(lat, lng), zoom: 16 });
new naver.maps.Marker({ position: new naver.maps.LatLng(lat, lng), map });
```

### 예시 C — QR 코드 (StyleURLs + Step Loaded 렌더)

```jsonc
// 라이브러리: Scenario.StyleURLs 에 등록
{ "Scenario": { "StyleURLs": ["https://cdn.jsdelivr.net/npm/qrcode@1.4.4/build/qrcode.min.js"] } }

// Embed control
{
  "ControlType": "Embed",
  "Id": "f_qr",
  "ControlDefaultName": "QrEmbed", "ControlName2": "QrEmbed",
  "Caption": "",
  "Width":  { "SizeValue": "200", "SizeUnit": "px", "MatchText": false },
  "Height": { "SizeValue": "200", "SizeUnit": "px", "MatchText": false },
  "Embed": "<div id=\"qrcode\"></div>"
}
```

```javascript
// Step Loaded 핸들러 — getElementById 로 DOM 잡고 QR 을 실제로 렌더
QRCode.toDataURL(data, function(err, url) {
  document.getElementById('qrcode').innerHTML = '<img src="' + url + '">';
});
```

## 숨김 style-only Embed

CSS 주입 용도 — Width/Height 0px 로 보이지 않게.

```jsonc
{
  "ControlType": "Embed",
  "Caption": "",
  "Width":  { "SizeValue": "0", "SizeUnit": "px", "MatchText": false },
  "Height": { "SizeValue": "0", "SizeUnit": "px", "MatchText": false },
  "Embed": "<style>.custom-class { color: red; }</style>"
}
```

## 함정

- **`{=Field}` 디스플레이 토큰 금지 (`[embed-bind]`)** — Embed raw HTML 안에서는 `{=Field}` 가 치환되지 않고 문자 그대로 노출된다. 섹터 값은 `{%return Load.sector.Field; %}` (LoadScript 토큰) 로 바인딩 — DC 그룹 안의 Embed 면 그 행의 섹터가 `Load.sector` 로 주입됨.
- **`<script>` 직접 삽입 금지** — 외부 라이브러리는 **`Scenario.StyleURLs` 등록을 우선**(정적 URL). `f.Script.load()` 는 동적 URL 등 부득이한 경우로 한정.
- **`Caption: ""` 반드시 빈 문자열** — 스키마 const 강제. ControlDefaultName 같은 값을 두면 화면에 그대로 출력됨.
- DOM 조작은 **부모 Step 의 Loaded/Init 이벤트** 에서. Embed 본체에는 별도 이벤트 없음.
- 🔴 **로드만 하고 렌더를 빼먹지 말 것 (`[embed-render]`)** — `StyleURLs`/`f.Script.load` 로 라이브러리를 불러오는 것만으로는 canvas/빈 div 에 아무것도 안 그려진다. `<canvas>`/빈 `<div id=…>` Embed 는 반드시 host Step 의 `Loaded` 핸들러에서 `document.getElementById(...)` 로 잡아 `new Chart()`/`new naver.maps.Map()` 등 **렌더 코드를 직접 실행**해야 한다. `checkEmbedRender()` 가 누락을 차단.
- **`Tab` 컨트롤 내부 LinkedStep 에는 Embed 금지 (`[tab-embed]`)** — 탭 내부 Step 은 Step 이벤트(`Init`/`Loaded`)가 미실행이라 DOM 초기화 시점을 잡을 수 없다 (예: 통계 탭의 차트). 빈 영역만 그려지거나 차트가 안 뜬다. `Items[].LinkedStepId` 로 띄우는 Step 의 Contents 에 Embed 가 있으면 `checkTabLinkedStepEmbed()` 가 거부. Embed 가 필요한 화면은 **탭이 아닌 별도 Step** 으로 분리. ([control/tab.md](tab.md) "탭 내부 LinkedStep 에는 Embed 컨트롤 금지" 참조.)
- 외부 라이브러리 callback 은 Events 섹션에 **동일한 이름** 으로 등록 필수 (불일치 시 콜백 미호출).
- `Loaded` 이벤트로 진입하는 Step 으로 뒤로 가는 BottomButton 은 `Prev_ReStart` 사용 — 일반 `Prev` 면 차트/지도가 재초기화 안 됨.
- 지도: 한국 시나리오 → 네이버지도 JavaScript API, 해외 → Google Maps. iframe 방식은 간단 표시용으로만 (해외).
- div/canvas 의 id 는 시나리오 내 **유니크** 해야 함 (DOM querySelector 충돌 방지).
