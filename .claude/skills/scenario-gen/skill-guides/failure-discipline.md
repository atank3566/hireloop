# Failure Discipline

This file extends `SKILL.md` for the validate-failure path. Where
`output-discipline` covers the emit step after `validate` returns `ok:true`,
this file covers what happens when it returns `ok:false` — or returns
something you did not expect. The failure mode here is not a broken delivery;
it is wasted cycles chasing the wrong cause.

## The prior

**`ok:false` means your input is wrong, not the tool.** The schema is ground
truth. `flex-scenario`, `ajv`, and the schema compiler are not under
suspicion. Start every recovery from "the JSON I generated violates the
contract" and stay there until the report proves otherwise.

**A tool-bug hypothesis is the last resort, never the first.** "Maybe ajv
mishandles cross-document `$ref`," "maybe `unevaluatedProperties` is a known
limitation," "maybe the spec is ambiguous" — these are the most expensive and
least likely explanations. If one forms, it is a signal that the prior has
flipped. Re-suspect the input before opening any `node_module`.

**Surprising output is still your output.** A materialized result that looks
wrong, a fragment validation that comes back empty, a count you did not
expect — treat it as a fact about what you produced, not a fault in the
reporter.

## Reading the report

**`errorCount` is volume, not severity.** One violation can emit hundreds of
errors. A report of hundreds errors is not the problems — it is usually one cause
plus its cascade. Never let the headline number set the response.

**Group by `kind` first, then read `schema`-kind from the deepest
`instancePath` up.** The `schema` errors point at concrete contract
violations (`must have required property 'X'`, `must match "then" schema`,
`must be equal to constant`). The deepest path is closest to the real cause;
shallower errors are usually consequences of it.

**Treat `strict-fields` / `unevaluatedProperties` as derivative.** When a
`oneOf` fails to resolve a branch, the strict variant flags *every* field —
including valid ones like `ControlType` — as undefined. These are cascade
noise, not the cause. Read them last, or not at all, until the `schema`
errors are resolved.

**A control that fails every branch failed the branch it was trying to be.**
A node with `ControlType: "InputDate"` reporting `missing 'ContentsType'`
(the Group branch) and `must be equal to constant` ×18 (the other control
branches) is one failure refracted through the discriminator. Read only the
InputDate branch's `schema` errors; discard the other branches' output.

## Diagnose before editing

**Read the actual cause before changing a byte.** No structural rewrite
precedes diagnosis. "Rewrite it to match a known-good example" before knowing
what failed produces the same failure with new line numbers.

**Cheapest test first.** Before opening `validators.mjs`, `schemas.mjs`, or
any validator internal: key-diff your failing node against the nearest passing
example in `examples/`. The difference is almost always one field, and the
diff finds it faster than reading the engine that reports it.

## One change, re-validate

**One minimal edit at the deepest violation, then re-run.** Fix the single
`schema` error closest to the leaf, re-validate, re-read. Do not batch fixes
or rewrite a whole control — batching destroys the mapping between a change
and its effect, and a rewrite reintroduces causes you already cleared.

## Recovery cues

The following are drift signals — when any appears, stop the current line of
investigation and return to the prior.

**About to hypothesize a bug in `ajv`, `flex-scenario`, or the schema
compiler.** The prior has flipped. Re-suspect your input. The cause is in the
report, not the engine.

**About to open `validators.mjs`, `schemas.mjs`, or a file under
`node_modules/`.** Did you read the `schema`-kind errors at the deepest
`instancePath` first? The validator internals explain *why noise is emitted*;
they do not contain the fix. The fix is the one contract violation that
triggered the cascade.

**The error count is large and urgency rises.** Count is cascade volume.
Collapse the `strict-fields` errors, find the handful of `schema` errors,
work the deepest one. Panic scales with the number; the work does not.

**About to rewrite a whole control, group, or step.** You have not isolated a
single cause. Narrow to one `instancePath`, fix that, re-validate. Rewriting
is diagnosis avoidance.

**The thought "I'm going in circles" appears.** That *is* the signal — not a
prompt to theorize harder. Stop. Either run a key-diff against a passing
example, or make the single deepest-error edit and re-validate. Action on one
concrete error beats another pass over the theory.