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

# Code standards

Concrete rules for how code is written — the checkable counterpart to `engineering-principles.md`.

Where a formatter, linter, or type checker enforces a rule — for example Ruff, mypy, ESLint, or Prettier — its
repository configuration is the source of truth. This file captures intent and rules that tools cannot enforce; it does
not repeat settings such as line length. Follow the repository's configured tools and commands.

Language-specific standards:

- TypeScript and React: `code-standards-typescript.md`

Follow the applicable language standard in addition to this document. Repository instructions and configured tooling
take precedence when they define a different convention.

Covered elsewhere: [tests](testing-standards.md), [logging](logging-standards.md), and the reasoning behind these rules
([engineering principles](engineering-principles.md)). The comment rules below also guide in-code documentation;
no separate documentation skill is required by this repository.

## Naming

- Use clear, descriptive names and prefer full words over abbreviations. Well-understood short names are fine when their
  meaning is clear in context (`i` for a loop index, `id`, `db`).
- Use American English in code identifiers and user-facing technical terms unless the product or domain requires another
  spelling.
- Name booleans as predicates (`is_active`, `has_access`, `should_retry`).
- Follow the language, framework, and repository's established casing conventions.
- Replace unexplained or repeated magic values with named constants or domain concepts. Keep obvious, local literals
  inline when a name would add no useful meaning.

## Control flow and readability

Code is read more often than it is written; optimize for the reader.

- Prefer guard clauses and early returns when they reduce nesting. Extract or reorganize deeply nested logic when doing
  so makes the control flow easier to follow.
- Break long method chains into named steps when intermediate values or operations carry useful meaning. Keep a chain
  intact when it remains short, conventional, and easy to read.
- Break dense expressions into named intermediate steps when it makes intent clearer.
- Favor clarity over cleverness. Avoid dense expressions, metaprogramming, and implicit magic when a plainer version
  reads better.
- Represent invalid, missing, optional, and empty states intentionally rather than silently ignoring them.

## Comments

Write few comments. Most code needs none.

- Add a comment only when it adds significant value: a non-obvious reason, a business rule, a constraint, a tradeoff, a
  surprising decision. If it does not clear that bar, do not write it.
- Never explain obvious code. A comment that restates the line it sits on must not exist.
- Keep a comment to one short sentence. Longer is allowed only for an algorithm, protocol, or workaround that is
  genuinely hard to follow.
- Use simple, direct, common words. Cut every word that does not change the meaning, and never at the cost of clarity.
- No historical context. Git holds the history, so never record what the code used to do, when it changed, who changed
  it, or why it changed.
- No ticket numbers except in a `TODO` or `FIXME`, which states in one sentence what remains and why.
- No decorative banners, dividers, or section headers.
- Never commit commented-out code. Delete it.
- Keep comments true. Update or delete a comment when the behavior it describes changes.

## Types

- Maintain type safety. Do not weaken a type merely to silence an error.
- Suppress a type error only narrowly and with a specific, documented reason. Never use a blanket suppression.
- Follow the repository's configured level of type checking. Do not reduce it as an incidental way to make a change
  pass.

## Error handling

- Fail visibly. Never silently swallow errors or discard failures.
- Handle errors at the layer that has enough context to recover, translate, or report them meaningfully. Otherwise,
  propagate them.
- Provide enough context for a failure to be understood and acted on without exposing secrets or sensitive data.
- Treat expected outcomes as normal control flow rather than logging them as errors. Log only when the current layer
  owns that operational concern.
- Handle expected failure modes and meaningful edge cases explicitly.
- Validate untrusted input at system boundaries.
- Suppress warnings, validation, or errors only when the reason is understood and documented.

## Languages, frameworks, and libraries

- Follow the repository's established patterns first. Where the repository has no convention, follow the idioms and
  official documentation for the language, framework, or library in use.
- Check the version used by the repository and consult documentation that applies to that version. Do not assume the
  latest API or recommended setup is available.
- Prefer supported public APIs over internal, private, deprecated, or undocumented behavior.
- Use a library according to its intended abstractions rather than recreating functionality it already provides.
- When established repository practice conflicts with current official guidance, preserve the existing approach unless
  changing it is part of the requested work. Surface important security, correctness, or deprecation concerns.

## Contracts and compatibility

- Preserve compatibility for public APIs, data formats, configuration keys, command-line interfaces, and other
  cross-boundary contracts unless the requested change intentionally alters them. This includes interfaces consumed
  across services or packages, not only internet-facing APIs.
- Make observable behavior changes deliberate and account for important compatibility effects.
- Treat changes to schemas, persisted data, events, and external contracts as compatibility changes, not ordinary
  refactors.
- When a breaking change is intentional, make it explicit and provide an appropriate migration or deprecation path.

## Reuse and dependencies

- Before adding a helper, abstraction, or dependency, check whether the repository or an existing dependency already
  provides the capability.
- Do not introduce a second library for a capability the project already has without a clear reason.
- Do not add, replace, or substantially upgrade a dependency as an incidental part of an unrelated change.

## Generated and vendored code

- Do not manually edit generated or vendored files unless the repository explicitly requires it.
- Change the source, schema, template, or generator and regenerate the output using the repository's documented command.
- Commit generated output only when the repository normally tracks it.

## Resources and side effects

- Make ownership and lifetime clear for files, connections, transactions, locks, subscriptions, and other resources.
- Release resources reliably on success, failure, cancellation, and early return, using the language's established
  resource-management constructs.
- Keep side effects deliberate. Avoid unexpected work during imports, module initialization, constructors, or property
  access.
