---
id: profile-mypage
domain: 공통
feature: 마이페이지 — 단건 정적 표시(구조 미제공 추론, route A)
screenKind: input
route: A
events: []
steps:
  - { id: Step1, role: 단일화면 }
keyRoles:
  이름: none
  사번: none
  부서: none
  직급: none
  이메일: none
  연락처: none
  입사일: none
assumptions:
  - 구조 미제공 — 단건 표시 화면으로 추론, 반복/선택 데이터 없음 → 정적 A
  - 마이페이지 = 프로필 요약 + 알림 설정 2섹션으로 추론
provisional:
  - { field: 부서, guess: none, why: 선택(Combo)일 수도 있으나 단서 없어 정적 표시로 둠 }
  - { field: 알림수신, guess: none, why: 토글(CheckBox)일 수 있으나 프로토타입 표시값으로 둠 }
expect:
  - 모든 표시 항목은 Label(LabelType:"labeltext" + labeltext 리터럴), DataConnection/Ckeys/UseDataConnection:true 미사용
  - 모든 Group 에 UseDataConnection:false 명시
  - 섹션 구분(프로필/알림설정)이 Group 으로 분리, 섹션 제목 Label
  - Collections:{} 유지, validate 통과
---
구조가 주어지지 않은 단순 표시 화면. 반복·선택지 데이터가 없으므로 **정적(A)** 으로 만든다.

# Step 1 — 마이페이지

## 프로필 헤더 (Group, 정적)
- 프로필 이미지 — ImageBox(View). 원형.
- 이름 — Label(labeltext: "홍길동"). 굵게/큰 글씨.
- 직급/부서 — Label(labeltext: "선임 · 개발팀"). 보조 텍스트.   # 부서: provisional(선택형일 수 있음)

## 기본 정보 (Group, 정적 — 라벨:값 행 반복 아님, 각 행 개별 Label 쌍)
- 사번 — 라벨 Label "사번" + 값 Label(labeltext: "20231045").
- 이메일 — 라벨 Label "이메일" + 값 Label(labeltext: "hong@example.com").
- 연락처 — 라벨 Label "연락처" + 값 Label(labeltext: "010-1234-5678").
- 입사일 — 라벨 Label "입사일" + 값 Label(labeltext: "2023-03-02").

## 알림 설정 (Group, 정적)
- 섹션 제목 Label "알림 설정".
- 공지 알림 — 라벨 Label + 상태 Label(labeltext: "수신").   # provisional: 토글일 수 있음
- 결재 알림 — 라벨 Label + 상태 Label(labeltext: "수신").
- "수정" 버튼 — Button(동작은 프로토타입 범위 밖).

# 규칙
- 정적 표시는 Label.labeltext. DataConnection/Ckeys/UseDataConnection:true 박지 말 것.
- 모든 Group(섹션·래퍼 포함)에 UseDataConnection:false 명시 · Collections:{} 유지 · validate 통과
- 나중에 반복/선택 데이터가 확인되면(예: 알림 토글, 부서 선택) B 경로로 재진화 — 이 가정은 lint 로 보고한다.
