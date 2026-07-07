# skill-guides — 화면 생성 보편 가이드

> scenario 생성(scenario-gen) 시 참고하는 **주제별 보편 가이드** 모음(진실원본).
> 각 주제의 개념·권장 방식·"더 좋게 만드는 법"을 한곳에서 본다.
> 스킬에 주입되어 생성 품질을 끌어올리는 보조 자료다 — 실수 목록이 아니라
> "이렇게 하면 잘 되고, 한 단계 더 좋게 하려면 이렇게" 를 담는다.

## 위치와 흐름

```
[진실원본]                          [빌드]                                  [미러]
meta-contract/skill-guides/    ──build-skill-payload.mjs──▶  skill/skill-guides/   ──cp -R──▶  .claude/skills/scenario-gen/skill-guides/
  events.md                        (walk + index.json 생성)     events.md                       (setup-bench.sh 5단계에서 자동)
  ...                                                           index.json
```

- **이 디렉토리가 유일한 진실원본.** `skill/skill-guides/`, `.claude/skills/.../skill-guides/` 는 전부
  빌드 산출물 — 직접 고치면 다음 빌드에 덮어쓰인다. ([SOURCE-MAP.md](../SOURCE-MAP.md) 참고)
- `*.md` 와 이 `README.md` 만 빌드 대상. `index.json` 은 빌드가 생성한다(수기 작성 불필요).

## 작성 규약

1. **주제 1개 = 파일 1개.** 파일명은 주제(kebab-case): `events.md`, `data-connection.md`,
   `layout.md` … 한 주제 한 파일.
2. 각 파일은 아래 골격을 따른다 — **개념 → 권장 → 더 좋게** 순서:

   ```markdown
   # <주제> 가이드

   > 한 줄 요약 + 관련 진실원본 링크.

   ## 개념 — 무엇이고 어떻게 동작하나
   ## 권장 방식 — 기본적으로 이렇게
   ## 더 좋게 — 한 단계 끌어올리는 법
   ## (선택) 자주 틀리는 점 — 짧은 체크리스트
   ```
3. **진실원본 위임** — 상세 규칙·제약은 `schema/v1/*.md` / `core/validators.mjs` 가 권위.
   skill-guides 는 그 규칙을 "어떻게 잘 쓰나" 관점으로 풀어줄 뿐, 규칙 자체를 새로
   만들지 않는다. 근거 위치를 링크한다.

## 항목 추가·승격

새 주제는 이 디렉토리에 `.md` 1개 추가하면 다음 setup에 자동 반영된다.
`feedback/` 에서 **반복적으로 도움이 된 권장 패턴**을 사람이 검토해 해당 주제 파일로
승격할 수도 있다(수동 게이트). 승격된 내용만 빌드/생성에 반영된다.

## SKILL.md 와의 관계

SKILL.md 의 "절대 금지" 섹션은 **별개로 관리**한다(통합하지 않음). skill-guides 는
생성 시 품질을 끌어올리는 참고 가이드다.
