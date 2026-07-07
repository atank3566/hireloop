# Node

`Group | Control` 의 discriminated union. `Group.Contents[]` 의 자식으로 사용.

## 식별

| 노드 | 분기 필드 | 값 |
|---|---|---|
| Group | `ContentsType` | `"Group"` |
| Control | `ControlType` | catalog.json `controlTypes[].value` 또는 v1 외 |

Step은 Scenario 의 `Steps` 객체 직속이므로 이 union에 포함되지 않는다.

## 트리 위치

| 위치 | 자식 |
|---|---|
| `Step.Contents[]` | Group (Control 직접 자식 불가) |
| `Step.FixedContentsTop[]` | Group |
| `Step.FixedContentsBottom[]` | Group |
| `Group.Contents[]` | Group \| Control (=`node.schema.json`) |
| `Control(InputDate, Combo).Dialog.Layouts[0].Controls[]` | Control |

## oneOf 동작

- Group 분기: `ContentsType` 가 있으면 매치 → `group.schema.json` 검증
- Control 분기: `ControlType` 가 있으면 매치 → `control.schema.json` 검증
- 한 노드에 두 필드 동시 존재 시 oneOf 실패 (정확히 1개만 매치)

## 검증 시 주의

JSON Schema의 `discriminator` 키워드는 OpenAPI 확장이므로, 표준 호환 ajv 등에서는 `oneOf` + `required` + `const` 패턴만 사용한다.
