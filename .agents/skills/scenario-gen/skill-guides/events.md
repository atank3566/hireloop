# 이벤트(Events) 가이드

> 핸들러가 어떻게 정의·연결·실행되는지, 그리고 더 깔끔하게 구성하는 법.
> 진실원본: [schema/v1/events.md](../schema/v1/events.md) · [core/validators.mjs](../core/validators.mjs)

## 개념 — 이벤트가 동작하는 방식

이벤트는 세 부분으로 나뉜다.

1. **핸들러 맵** — `scenario.Events` 는 `이름 → Action 배열` 맵이다. Action 은 위에서
   아래로 순차 실행된다.
2. **호출자 연결** — Step/Group/Control/BottomButton 이 자신의 `Events.<eventKey>` 값에
   핸들러 이름을 적어 연결한다.
3. **실행 등록** — 호출자의 `*EventOrder` 배열(`StepEventOrder`, `ComboOrder` …)에 올라간
   이벤트만 실제로 호출된다. 정의만 하고 EventOrder 에 없으면 동작하지 않는다.

```jsonc
"Events": {
  "Init":    [ { "Action": "Script", "Script": "Current.step.set('UserName', '홍길동');" } ],
  "getList": [ { "Action": "Script", "Script": "f.Content('f_3').reload();" } ]
}
// 호출자 — EventOrder 에 등록해야 실제 호출됨
"Steps": { "Step1": { "StepEventOrder": ["Init"], "Events": { "Init": "Init", "Loaded": "getList" } } }
```

## 권장 방식 — 기본적으로 이렇게

- **Action 은 `Script` 또는 `LinkedEvent` 만** 쓴다. 서버 호출(`Service`/`API`)은 운영 단계에서
  사용자가 추가한다 — 생성 단계에서는 화면 동작과 샘플 데이터만 표현한다.
- **Script 본문은 JSON 문자열 한 줄**로 박고 줄바꿈은 `\n` 이스케이프로 표현한다.
  JS `+` 연결이나 raw newline 은 파싱을 깨뜨린다.
  - ✓ `"Script": "if (cond) return;\nf.Content('f_3').reload();"`
- **핸들러 이름은 영문**(`^[A-Za-z_][A-Za-z0-9_.]*$`). 한국어·공백·하이픈은 쓰지 않는다.
- **Combo / Search / InputDate 의 이벤트는 자식 Dialog 안**(`Dialog.Layouts[0].Controls[0]`)에
  둔다. 본체(root)에 `Events`/`UseEvents` 를 붙이지 않는다.

## 더 좋게 — 한 단계 끌어올리는 법

- **핸들러를 작게 쪼개고 `LinkedEvent` 로 조합한다.** 한 핸들러에 모든 로직을 몰아넣기보다
  `validate → save → reloadList` 처럼 의미 단위로 나누면 재사용·가독성이 올라간다.

  ```jsonc
  "userCheck": [
    { "Action": "Script",      "Script": "if (f.Setting.UserId === '') return;" },
    { "Action": "LinkedEvent", "EventName": "getList" }
  ]
  ```
- **이름으로 의도를 드러낸다.** `e1`·`onClick2` 대신 `SaveBookingEvent`·`reloadOrderList` 처럼
  무엇을 하는지 이름만 봐도 읽히게 짓는다.
- **EventOrder 를 흐름 문서처럼 쓴다.** `["Init", "Loaded"]` 순서가 곧 화면 생애주기다 —
  순서를 읽으면 동작이 보이도록 정렬한다.
- **데이터 갱신은 범위를 최소로.** 전체 Step reload(`Current.step.reload()`)보다 영향받는
  그룹만 `f.Content('f_3').reload()` 로 갱신하면 깜빡임과 비용이 준다.

## 자주 틀리는 점 — 짧은 체크리스트

- [ ] 핸들러를 만들었는데 `*EventOrder` 에 안 넣음 → 호출 안 됨
- [ ] `Events.<key>` / `LinkedEvent.EventName` 값이 `scenario.Events` 키와 불일치(오타) → `[event-ref]`
- [ ] Combo/Search/InputDate **본체**에 이벤트 부착 → `[event]`
- [ ] Action 에 `Service`/`API` 사용 → 생성 금지(`[no-service]`)
- [ ] Script 를 `+` 연결/여러 줄로 작성 → 파싱 실패
