---
paths:
  - "**/*.py"
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
  - "**/*.mjs"
  - "**/*.cjs"
  - "**/*.php"
  - "**/*.go"
  - "**/*.rs"
  - "**/*.java"
  - "**/*.rb"
  - "**/*.cs"
  - "**/*.sql"
---

# Engineering principles

How we think about designing, architecting, and writing software. Good code is **easy to understand and easy to change**
— when these principles pull in different directions, favor whichever leaves a future reader able to grasp and safely
modify the code.

These are *principles, not rules*. They are defaults that good judgment can override in context. Concrete, checkable
rules for how code is written live in `code-standards.md`.

## Code has a carrying cost

Every line and dependency adds something to understand, maintain, and verify. Prefer solving problems with less
machinery, and remove code whose value no longer justifies its cost.

Optimize for fewer concepts and moving parts, not fewer characters. Tests, validation, types, and explicit code can add
lines while reducing overall risk and complexity.

## KISS — keep it simple

Prefer the simplest solution that actually solves the problem. Complexity has to earn its place, but simplicity does not
mean cleverness or terseness. Don't compress logic until it becomes cryptic or hide complexity that is genuinely
necessary.

## YAGNI — you aren't gonna need it

Solve today's problem, not one you imagine you might have. Speculative flexibility usually becomes dead weight that
still has to be maintained.

Think ahead where decisions are expensive to reverse — data models, public contracts, and core architecture — not
everywhere.

## Prefer reversible decisions

When several approaches are adequate, prefer the one that is easier to change, remove, or replace. Avoid premature
commitment to irreversible decisions, and record the reasoning behind consequential choices when it will help future
maintainers.

Don't add indirection solely to make every decision theoretically reversible. Some stable choices are clearer when made
directly.

## DRY — don't repeat yourself

Give each meaningful piece of knowledge a single source of truth, so a change is made in one place. Do not force
superficially similar code into a shared abstraction: a little duplication is better than coupling unrelated behavior.
Wait for the real pattern to emerge.

## Single responsibility

A module, class, or function should have a coherent responsibility and as few independent reasons to change as
practical. Focused units are easier to name, test, and reason about, but do not split code into fragments that have no
independent meaning and must always be read together.

## Manage complexity behind clear boundaries

Support comprehension and local reasoning by hiding internal complexity so a caller can work at one level of detail
without holding the whole system in their head. A boundary should express the operation in domain terms so callers do
not need to understand its internal mechanics.

Encapsulate to reveal intent, not to add ceremony or obscure behavior.

## Make behavior and dependencies explicit

Prefer code whose inputs, outputs, dependencies, state changes, and failure modes are visible. Keep side effects
deliberate and close to system boundaries; avoid hidden global state, surprising mutation, and silently discarded
errors.

Not every implementation detail belongs in every signature. Encapsulate incidental detail when doing so preserves clear
behavior and local reasoning.

## Modular design — keep related things together

Organize code into cohesive modules grouped by feature or domain, so things that change together, live together —
related code, its tests, and its types close at hand. Aim for high cohesion within a module and loose coupling between
modules.

Genuinely cross-cutting concerns belong in a common place rather than duplicated into every module. Do not force
unrelated things together merely because they sit in the same folder.

## Design for change at real boundaries

Contain volatility by isolating dependencies that are genuinely external or likely to change — services, storage, public
contracts, and volatile business rules. Keep their details from spreading through the system, and introduce explicit
interfaces when multiple implementations, meaningful substitution, or isolation of an unstable external boundary
justifies them.

Don't wrap everything “just in case.” A boundary should contain a real dependency or protect a meaningful design
decision, not merely add another layer.

## Leave touched code better

When working in an area, make small, clearly safe improvements that make the code easier to understand or change. Remove
clearly dead code, improve misleading names, simplify unnecessary complexity, and align touched code with established
conventions. Preserve existing behavior and keep the improvement proportionate to the requested change.

Don't turn a focused change into an unrelated refactor. Separate improvements that materially increase scope, risk, or
review burden into their own change. If behavior is unclear or insufficiently protected, prefer a focused test or leave
the code alone.
