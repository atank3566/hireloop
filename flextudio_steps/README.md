# HireLoop ERP Flextudio Step Scripts

작성일: 2026-07-08

이 폴더는 `HireLoop ERP (standalone) (1).html` 번들을 Flextudio init 이벤트에 붙여넣기 쉬운 정적 HTML/CSS/JS 산출물로 변환한 결과입니다.

## 파일 구성

| 파일 | 용도 |
|---|---|
| `hireloop_shared.js` | 공통 CSS, 샘플 채용/성과 데이터, 화면 렌더 함수 |
| `01_dashboard_init.js` | 채용 품질 대시보드 init |
| `02_review_init.js` | 서류 검토 init |
| `03_interview_init.js` | 면접/평가 init |
| `04_final_init.js` | 최종 판정 init |
| `05_workforce_init.js` | 입사자 분석 init |
| `06_performance_init.js` | 성과 분석 init |
| `preview.html` | 브라우저 미리보기 |

## Flextudio에 붙이는 방식

외부 파일 설정 없이 각 스텝 init 이벤트에 해당 `*_init.js` 파일 전체를 붙여넣으면 됩니다. 각 init 파일은 `hireloop_shared.js` 전체와 화면별 렌더 호출이 합쳐진 자급형 파일입니다.

## 원본 보존

원본 standalone HTML과 `extracted_bundle/` 산출물은 수정하지 않았습니다.
