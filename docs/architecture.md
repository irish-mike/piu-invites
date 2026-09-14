# Architecture

## Scope

A one-page event interest-registration website for **Hocus Pocus Halloween Party 2026**, organised by PIÙ.
Registration will express interest, not a commitment to attend.
Multi-event support is outside the current scope.

Stage 1 establishes the project foundation only: a minimal development placeholder, framework configuration,
local verification commands, and documentation. Everything described below as planned is unimplemented.
Development is local only. The eventual hostname is `hocus-pocus-halloween-party.piuinvites.org`;
no hostname or deployment configuration is introduced here.

## Runtime architecture

Eventually one Next.js Node application will render the page and handle server-side requests.
There is no separate frontend/backend application, microservice, database, or CMS.
Stage 1 can prerender the placeholder; this does not commit the project to a static export.

## Application architecture

Use Next.js App Router, React, strict TypeScript, and Tailwind CSS.
Introduce small vertical feature slices only when real code needs them. Framework entry points stay thin;
feature-specific presentation, behavior, types, and tests stay with the feature that owns them.
Code becomes shared only when more than one feature genuinely needs it.

The current source structure is just `src/app`: the root layout, placeholder page, and Tailwind stylesheet.
No empty feature, integration, or shared folders are needed.

## Principles

1. KISS: use the simplest solution that meets the current requirements.
2. Readability: prefer obvious code and clear ownership.
3. Meaningful DRY: share knowledge, not every repeated class or short expression.
4. Avoid premature abstraction: no service layers, repository patterns, dependency injection, or global state library.

## Foundation decisions

- Use npm and commit its lockfile for reproducible installation; no package manager was previously established.
- Use stable framework defaults, without opt-in experimental features or React Compiler configuration.
- Use ESLint with Next.js Core Web Vitals and TypeScript rules, and a separate TypeScript check.
- Install Zod and Motion as explicitly requested for Stage 1, without schemas, animation code, or client imports yet.
- Defer shadcn/ui initialization until a real component is needed; a placeholder does not justify generated UI helpers
  or a theme. No React Hook Form is needed.
- Do not add a test framework to test framework behavior or static copy. Lint, type checking, a build, and a local
  page smoke check are proportionate to this foundation. Apply the testing standards as application behavior arrives.

### Tooling compatibility to review

The Next.js 16.3.5 starter selects ESLint 9. npm marks ESLint 9.39.5 as unsupported, but the current
`eslint-plugin-react` and `eslint-plugin-jsx-a11y` dependencies in Next.js's configuration do not declare ESLint 10
compatibility. Retain the starter's compatible ESLint 9 setup for now, without forced peer overrides or disabled
rules. This upstream support gap remains a maintenance concern for review.

## Planned feature boundaries

- Event presentation: event content and the page experience.
- Registration: input handling, validation, submission, and result states.
- Interest: potential-attendee estimation and restrained milestone display.
- Formspark integration: server-side HTTP access to the external registration source.

These are logical boundaries. Future code may live in `src/features/event`, `src/features/registration`,
`src/features/interest`, and `src/integrations` when justified. They do not require empty scaffolding now.

## Planned Formspark boundary

Formspark will store registration submissions and be the source of truth.
Next.js server-side code will validate input and forward submissions over HTTP; no SDK is currently justified.
Formspark secrets must remain on the server and must never be exposed through browser code or public environment variables.

## Planned registration flow

Browser → Next.js endpoint → server-side validation → anti-spam / rate limiting → Formspark.

The planned fields are required full name and email, with optional likely party size (1, 2, 3, or 4+).
No form, endpoint, validation schema, or spam protection exists in Stage 1.

## Planned interest flow

Formspark data → server-side interest calculation → rounded milestone → page render.

Estimate potential attendees rather than submitted forms: omitted party size counts as 1; 1, 2, and 3 count as
their values; 4+ counts conservatively as 4. Hide the count below 30; display rounded milestones once eligible.
Initial interest can likely be loaded directly by a Server Component without a browser-facing interest API.
No interest fetching, calculation, caching, or display is implemented now.

## Deferred concerns

Stage 1 does **not** implement:

- Final visual design, production event page, fonts, hero photography, or collage.
- Registration form, registration API, Zod registration schema, or Formspark integration.
- Duplicate detection, interest calculation, autoresponder, honeypot, or rate limiting.
- Success states, flicker/glitch animation, or the final footer.
- Analytics.
- Apache configuration, Cloudflare Tunnel configuration, systemd, or GitHub Actions deployment.
- Docker, SSH deployment, or production environment configuration.

## Future reuse

The repository is named `piu-invites` and may eventually serve future PIÙ events.
Keep the architecture focused on this event until reuse requirements are real.
Do not introduce a generic event platform, tenant system, hostname-based event resolution, multi-event routing,
CMS-driven event definitions, or reusable theme system.
