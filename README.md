# HireLoop Flextudio Assets

`HireLoop ERP (standalone) (2).html`을 Flextudio에서 수정/붙여넣기 쉬운 형태로 분리한 산출물입니다.

## 폴더 구성

| 경로 | 설명 |
|---|---|
| `original/` | 원본 standalone HTML 백업 |
| `extracted_bundle/` | 원본 번들을 해제한 template/assets |
| `flextudio_steps/` | Flextudio init 이벤트에 붙여넣는 자급형 JS 파일 |

## 미리보기

```bash
cd flextudio_steps
python3 -m http.server 5173 --bind 127.0.0.1
```

브라우저에서 `http://127.0.0.1:5173/preview.html`을 엽니다.
