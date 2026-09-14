# Architecture

## Scope

A one-page event interest-registration website for **Hocus Pocus Halloween Party 2026**, organised by PIÙ.
Registration will express interest, not a commitment to attend.
Multi-event support is outside the current scope.

Stage 2 builds on the project foundation with a static event page: typography, background photography, a presentation-only registration form, and footer. Everything described below as planned is unimplemented.
Development is local only. The eventual hostname is `hocus-pocus-halloween-party.piuinvites.org`;
no hostname or deployment configuration is introduced here.

## Runtime architecture

Eventually one Next.js Node application will render the page and handle server-side requests.
There is no separate frontend/backend application, microservice, database, or CMS.
The static event page is prerendered; this does not commit the project to a static export.

## Application architecture

Use Next.js App Router, React, strict TypeScript, and Tailwind CSS.
Introduce small vertical feature slices only when real code needs them. Framework entry points stay thin;
feature-specific presentation, behavior, types, and tests stay with the feature that owns them.
Code becomes shared only when more than one feature genuinely needs it.

`src/app` holds the thin page entry point, root layout, font setup, metadata, and global Tailwind tokens. `src/features/event/event-page.tsx` owns the event composition, background, and footer. `src/features/registration/registration-form.tsx` owns the static form. No empty integration or shared folders are needed.

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
- Native labels and inputs meet the current form needs without shadcn/ui or React Hook Form. No UI library or generic component system is needed.
- Do not add a test framework to test framework behavior or static copy. Lint, type checking, a build, and browser checks of responsive layout, keyboard interaction, and inert submission are proportionate to this stage. Apply the testing standards as application behavior arrives.

## Static visual foundation

- Cinzel provides display typography, Libre Baskerville editorial text, and Inter form/UI text. `next/font/google` downloads fonts at compile time and self-hosts them; visitors do not request fonts from Google.
- A small set of Tailwind colour and font tokens establishes black, warm off-white, muted secondary text, and amber accents. There is no theme provider.
- `/images/background.jpeg` is the decorative background. Its actual subject is carved pumpkins; the explicitly named asset is used rather than substituting a crowd photograph. A separate oversized `next/image` layer uses cover cropping and 4px blur, with a black overlay that fades into the footer. Mobile positioning is 43% horizontally; desktop is centred horizontally at 55% vertically. Originals are not modified.
- Mobile uses a deliberately two-line title; wider layouts use a one-line title. Form inputs each occupy their own row at every width, with centred labels. Content can grow beyond the viewport without clipping controls. No empty gallery placeholders are added.
- The event page stays a Server Component. The form alone is a Client Component to prevent default submission, with no React state, request, validation schema, or success handling. Native validation on submit is disabled for this presentation-only stage; fields still expose their required semantics.
- Metadata includes a title, description, and `noindex, nofollow`. This is a crawler directive, not access control.
- All six DSCF photographs are reserved for a later collage, without an assigned visual priority or order.

### Tooling compatibility to review

The Next.js 16.3.5 starter selects ESLint 9. npm marks ESLint 9.39.5 as unsupported, but the current
`eslint-plugin-react` and `eslint-plugin-jsx-a11y` dependencies in Next.js's configuration do not declare ESLint 10
compatibility. Retain the starter's compatible ESLint 9 setup for now, without forced peer overrides or disabled
rules. This upstream support gap remains a maintenance concern for review.

## Feature boundaries

- Event presentation: the current static content and page experience.
- Registration: current form presentation; validation, submission, and result states remain planned.
- Interest: planned interest calculation and restrained milestone display.
- Formspark integration: planned server-side HTTP access to the external registration source.

The first two boundaries now have code in `src/features/event` and `src/features/registration`. Introduce `src/features/interest` and `src/integrations` only when they have real work to own; no empty scaffolding is needed.

## Planned Formspark boundary

Formspark will store registration submissions and be the source of truth.
Next.js server-side code will validate input and forward submissions over HTTP; no SDK is currently justified.
Formspark secrets must remain on the server and must never be exposed through browser code or public environment variables.

## Planned registration flow

Browser → Next.js endpoint → server-side validation → anti-spam / rate limiting → Formspark.

The planned fields are required full name and email.
Only the form presentation exists. There is no registration endpoint, validation schema, or spam protection.

## Planned interest flow

Formspark data → server-side interest calculation → rounded milestone → page render.

The interest-count definition remains deferred. Hide the count below 30; display rounded milestones once eligible.
Initial interest can likely be loaded directly by a Server Component without a browser-facing interest API.
No interest fetching, calculation, caching, or display is implemented now.

## Deferred concerns

Stage 2 does **not** implement:

- Photo collage or Polaroid treatment.
- Functional registration, registration API, Zod registration schema, or Formspark integration.
- Duplicate detection, interest calculation, autoresponder, honeypot, or rate limiting.
- Success states or blackout/flicker/glitch animation.
- Analytics.
- Apache configuration, Cloudflare Tunnel configuration, systemd, or GitHub Actions deployment.
- Docker, SSH deployment, or production environment configuration.

## Future reuse

The repository is named `piu-invites` and may eventually serve future PIÙ events.
Keep the architecture focused on this event until reuse requirements are real.
Do not introduce a generic event platform, tenant system, hostname-based event resolution, multi-event routing,
CMS-driven event definitions, or reusable theme system.
