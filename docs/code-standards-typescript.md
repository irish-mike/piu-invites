---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
  - "**/*.mjs"
  - "**/*.cjs"
---

# TypeScript and React code standards

TypeScript- and React-specific rules that supplement `code-standards.md`. Repository configuration and framework
requirements remain the source of truth where they define a different convention.

## Tooling

- When configured by the repository, ESLint is the source of truth for linting and Prettier is the source of truth for
  formatting.
- Use the repository's documented commands rather than invoking tools with unrelated settings.
- Do not weaken or bypass configured checks merely to make a change pass.

## Types

- Use strict TypeScript settings in new projects. Follow the repository's configured strictness and do not weaken it to
  make a change pass.
- Avoid `any`; prefer `unknown` with explicit narrowing when the input type is not known.
- Give exported functions and public APIs explicit parameter and return types. Let inference handle obvious local
  values.
- Model meaningful state variants explicitly, using discriminated unions where they make invalid states harder to
  represent.
- Avoid type assertions when narrowing or a more accurate type can express the same fact.
- Avoid non-null assertions (`!`) when the absent case can be handled or the invariant expressed in the type system. Use
  one only when the invariant is clear and locally justified.
- Do not use `@ts-ignore` or `@ts-nocheck` as blanket suppressions. Prefer a specific `@ts-expect-error` with a concise
  explanation when suppression is genuinely necessary.

## Language conventions

- Prefer `const`; use `let` only when reassignment is required.
- Use `async` and `await` when they make asynchronous control flow clearer. Handle rejection, cancellation, and cleanup
  deliberately.
- Avoid module-import side effects unless the framework or runtime explicitly requires them.
- Follow the repository's established module and import conventions.

## React

- Use function components and hooks unless the repository or framework requires another approach.
- Follow the repository or framework's export conventions; prefer named exports where either form is appropriate.
- Keep rendering free from unexpected side effects.
- Keep state as local as practical and derive values rather than storing duplicated state.
- Treat effects as synchronization with external systems, not as a default way to derive values or respond to ordinary
  state changes.
- Follow the framework's rules for hooks and the repository's established approach to data fetching, routing, forms, and
  state management.
- Preserve accessibility semantics and keyboard behavior when changing interactive components.
