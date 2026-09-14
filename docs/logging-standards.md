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

# Logging standards

How we produce useful, searchable logs without creating noise or exposing sensitive data.

Each repository defines its logging platform, format, transport, reserved attributes, and field vocabulary. This file
covers conventions shared across repositories.

## Structure

- Prefer structured logs: a short, static event message plus variable data as key/value fields. Do not interpolate
  values into the message.
- Keep event messages stable and reuse the repository's established field vocabulary rather than inventing
  near-duplicates.
- Include established correlation context when available, such as request, trace, job, or operation identifiers. Prefer
  automatic context propagation.
- Use the logging framework rather than `print` or its equivalent outside CLIs and scripts.

## Levels

- Choose the level by operational impact and whether someone needs to act: `error` for failed operations, `warning` for
  unexpected degraded conditions, `info` for significant expected events, and `debug` for detailed diagnostic
  information.
- Do not log routine expected outcomes at `warning` or `error`.

## Sensitive data

- Never log secrets, credentials, tokens, cryptographic material, or raw sensitive data.
- Follow the repository's data-classification and redaction policy. Log only the minimum safe fields needed for the
  operational purpose; do not log complete payloads, headers, objects, or records by default.

## Volume

- Avoid high-volume logging that obscures signal or affects performance. Summarize, sample, or rate-limit repeated
  events while preserving their frequency and impact.
- Do not duplicate access, audit, metric, or tracing data without a clear operational reason.

## Errors and exceptions

- Log a failure once, at the layer that handles it or can add meaningful operational context. Do not catch an exception
  solely to log and rethrow it.
- Include stack traces for unexpected exceptions using the framework's exception-logging facility. Expected failures
  need a stack trace only when it aids diagnosis.
- Include enough context to identify the failed operation and its impact without exposing sensitive data.
