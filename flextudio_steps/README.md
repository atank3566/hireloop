# HireLoop ERP Flextudio Step Scripts

작성일: 2026-07-08

이 폴더는 `original/HireLoop ERP (standalone) (3).html` 기준으로 다시 생성한 Flextudio init 이벤트용 산출물입니다.

## 파일 구성

| 파일 | 용도 |
|---|---|
| `hireloop_shared.js` | v3 standalone HTML을 iframe으로 렌더링하는 공통 런타임 |
| `01_dashboard_init.js` | 대시보드 init |
| `02_review_init.js` | 서류 검토 init |
| `03_interview_init.js` | 면접/평가 init |
| `04_final_init.js` | 최종 판정 init |
| `05_workforce_init.js` | 입사자/인력 분석 init |
| `06_performance_init.js` | 성과 분석 init |
| `preview.html` | 로컬 미리보기 |

## 미리보기

```bash
cd flextudio_steps
python3 -m http.server 5173 --bind 127.0.0.1
```

브라우저에서 `http://127.0.0.1:5173/preview.html`을 엽니다.
