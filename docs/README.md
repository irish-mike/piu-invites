# Documentation

Start with [architecture](architecture.md) for this project's scope, current setup, and planned boundaries.
The repository [README](../README.md) contains the local setup and verification commands.

## General guidance

These documents are shared engineering guidance, not requirements to add tooling or architecture.
Apply them where relevant; explicit stage requirements and KISS take priority. The `paths` metadata in some
documents describes language applicability, not automatic enforcement by an editor or coding agent.

| Document | Purpose and applicability |
| --- | --- |
| [Agent operating instructions](agent-operating-instructions.md) | How to inspect, change, and verify work within the authorized scope. |
| [Engineering principles](engineering-principles.md) | Design judgment: simplicity, readability, and meaningful boundaries. |
| [Code standards](code-standards.md) | General implementation rules, including comments, errors, and dependencies. |
| [TypeScript and React standards](code-standards-typescript.md) | Language guidance for this Next.js application; read alongside code standards. |
| [Testing standards](testing-standards.md) | How to select and maintain useful tests; registration and interest have calculation and HTTP boundary tests alongside lint, types, builds, and browser inspection. |
| [Logging standards](logging-standards.md) | Safe, useful logging when application logging is needed; no logging library is required now. |

Principles explain why; code and language standards explain how. Their overlap is intentional.
References to optional tools in the general standards are conditional on those tools being configured; they are not setup requirements.

## Project-specific decisions

[Architecture](architecture.md) records the agreed direction and explicitly distinguishes the current stage from planned work.
Keep project decisions there rather than adding them to the general standards.
See [registration setup](registration.md) for Formspark environment configuration, autoresponder setup, limitations, and live verification.
See [interest setup](interest.md) for authenticated reads, unique-email milestones, caching, and failure behavior.
