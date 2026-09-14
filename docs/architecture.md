# Architecture

## Scope

A one-page event interest-registration website for **Hocus Pocus Halloween Party 2026**, organised by PIÙ.
Registration will express interest, not a commitment to attend.
Multi-event support is outside the current scope.

Stage 4 adds functional registration to the approved event composition. The form validates and submits full name and email through Next.js to Formspark, with plain success and error states. Everything described below as planned is unimplemented.
Development is local only. The eventual hostname is `hocus-pocus-halloween-party.piuinvites.org`;
no hostname or deployment configuration is introduced here.

## Runtime architecture

One Next.js Node application renders the page and handles server-side registration requests.
There is no separate frontend/backend application, microservice, database, or CMS.
The static event page is prerendered; this does not commit the project to a static export.

## Application architecture

Use Next.js App Router, React, strict TypeScript, and Tailwind CSS.
Introduce small vertical feature slices only when real code needs them. Framework entry points stay thin;
feature-specific presentation, behavior, types, and tests stay with the feature that owns them.
Code becomes shared only when more than one feature genuinely needs it.

`src/app` holds the thin page entry point, root layout, font setup, metadata, and global Tailwind tokens. `src/features/event/event-page.tsx` owns the event composition, background, and footer. Its sibling `photo-collage.tsx` and CSS module own the collage. `src/features/registration` owns the form, registration schemas, response contract, and schema tests. `src/app/api/register/route.ts` handles HTTP parsing and orchestration, with boundary tests alongside it. `src/integrations/formspark.ts` owns server-only submission HTTP. No service or repository layers are needed.

## Principles

1. KISS: use the simplest solution that meets the current requirements.
2. Readability: prefer obvious code and clear ownership.
3. Meaningful DRY: share knowledge, not every repeated class or short expression.
4. Avoid premature abstraction: no service layers, repository patterns, dependency injection, or global state library.

## Foundation decisions

- Use npm and commit its lockfile for reproducible installation; no package manager was previously established.
- Use stable framework defaults, without opt-in experimental features or React Compiler configuration.
- Use ESLint with Next.js Core Web Vitals and TypeScript rules, and a separate TypeScript check.
- Zod validates registrations on the server and API responses in the client. Motion remains installed for the later animation stage and is not imported.
- Native labels and inputs meet the current form needs without shadcn/ui or React Hook Form. No UI library or generic component system is needed.
- Use Node’s built-in test runner with the small `tsx` development dependency to execute TypeScript tests on the supported Node baseline. No Jest/Vitest, DOM test environment, or coverage machinery is needed. The `react-server` test condition permits the `server-only` import guard when exercising the route outside Next.js. Tests use real validation and integration code, replacing only external HTTP.

## Static visual foundation

- Cinzel provides display typography, Libre Baskerville editorial text, and Inter form/UI text. `next/font/google` downloads fonts at compile time and self-hosts them; visitors do not request fonts from Google.
- A small set of Tailwind colour and font tokens establishes black, warm off-white, muted secondary text, and amber accents. There is no theme provider.
- `/images/background.jpeg` is the decorative hero background. Its actual subject is carved pumpkins; the explicitly named asset is used rather than substituting a crowd photograph. A separate oversized `next/image` layer uses cover cropping and 4px blur, with a black overlay that fades into the black collage area. Mobile positioning is 43% horizontally; desktop is centred horizontally at 55% vertically. Originals are not modified.
- Mobile uses a deliberately two-line title; wider layouts use a one-line title. Form inputs each occupy their own row at every width, with visually hidden labels and visible placeholders. Content can grow beyond the viewport without clipping controls. No empty gallery placeholders are added.
- The event page stays a Server Component. The form alone is a Client Component, with local idle/submitting/success/error state. Inputs are 44px tall and occupy separate rows. Native validation on submit is disabled so trimmed input reaches the authoritative server schema and errors can be presented consistently; required semantics, autocomplete, labels, focus styling, and field error associations remain.
- Metadata includes a title, description, and `noindex, nofollow`. This is a crawler directive, not access control.

## Photo collage

- `PhotoCollage` is a Server Component within event presentation. Its private `PrintedPhoto` component shares the frame and Next.js image markup; the six photographs and their placements remain explicit. There is no gallery framework, state, interaction, or new dependency.
- The CSS module keeps frame treatment and the three responsive compositions together. Warm paper (#e4dac8), a faint corner tint, subtly uneven corner radii, and restrained shadows provide the aged-print effect. Padding is 2–3px along the top/sides and 3–5px below, plus a 1px edge. Images have no colour filter or added texture.
- The group landscape uses a 3:2 frame. The goblet and top-hat portraits use 3:4 crops positioned at 58% and 38% vertically. The DJ and cyclist use 4:5 crops positioned at 66% and 42% to reduce empty background and foreground while retaining faces and costume details. The masked landscape uses a slightly tighter 1.45:1 ratio at 57% horizontally. Clipped image windows allow additional zoom of 14% for PIÙ, 30% for the DJ, and 25% for the cyclist, with individual transform origins keeping the subjects visible. These are CSS presentation changes; source files remain unchanged. The same crops work across all three compositions.
- Desktop (960px and up) uses the three-person landscape as the largest, upper-centre anchor. The top-hat portrait sits to the left, PIÙ with the goblet sits at the far right, and the masked close-up supports the centre. The cyclist sits at lower left and the DJ at lower right. Explicit layering joins all six into one compact cluster; the DJ sits behind the skull-mask photo and shifts right by 15% of its own width on tablet and desktop. The mobile horizontal position stays within the narrower composition. Sizes follow the subjects and composition, not filenames or a permanent priority system.
- Mobile puts the group landscape first, then the top-hat and PIÙ portraits as an overlapping pair, the masked landscape, and the cyclist and DJ as a final overlapping pair. PIÙ and the DJ occupy the right-hand positions. At 640–959px, a separate tablet arrangement widens the anchor and brings the lower portraits together. Uneven overlaps, varied rotations from 0.7–3.3 degrees, and black space around the cluster maintain the physical-print treatment.
- The collage is capped at 1080px. Its reserved aspect ratio changes with the composition to keep absolute photo placement clear of the closing note. Negative top margins of 24px, 32px, and 40px pull the prints into the hero's lower spacing at mobile, tablet, and desktop widths, while keeping the form clear.
- A small centred Cinzel closing note, “COSTUMES ENCOURAGED.”, follows the collage with controlled breathing room. A short amber line leads into the quiet attribution footer; there is no full-width divider or additional CTA.
- All six images use Next.js responsive delivery with intrinsic dimensions, layout-specific `sizes`, and default lazy loading. Only the decorative hero image is preloaded. Original assets remain unchanged.
- Concise alt text describes visible subjects and costumes. The collage has an accessible section label without a visible heading; photographs are noninteractive and add no keyboard stops.

Files used: `group.webp` (three friends), `piu.webp` (goblet), `witchdoctor.webp` (top hat), `skeloton.webp` (skull mask), `dj.webp` (DJ), and `bike.webp` (cyclist).

### Tooling compatibility to review

The Next.js 16.3.5 starter selects ESLint 9. npm marks ESLint 9.39.5 as unsupported, but the current
`eslint-plugin-react` and `eslint-plugin-jsx-a11y` dependencies in Next.js's configuration do not declare ESLint 10
compatibility. Retain the starter's compatible ESLint 9 setup for now, without forced peer overrides or disabled
rules. This upstream support gap remains a maintenance concern for review.

## Feature boundaries

- Event presentation: the current static content and page experience.
- Registration: form presentation, validation, submission, and result states.
- Interest: planned interest calculation and restrained milestone display.
- Formspark integration: server-only HTTP submission to the external registration source.

Event, registration, and Formspark boundaries contain real code. Interest remains deferred; no empty scaffolding is needed.

## Registration flow

Browser → POST /api/register → Zod validation → Formspark submission → JSON result → local form state.

- The API accepts JSON only. Malformed JSON returns 400, unsupported media types return 415, validation errors return 422 with field messages, and missing configuration or upstream failure returns 503 with safe retry copy. Success returns 200 with `{ ok: true }`; failures return `{ ok: false, message, fieldErrors? }`. Responses are not cached and never echo submitted data or upstream errors.
- Full name is trimmed, required, at most 120 characters, must contain a Unicode letter, and cannot contain control characters. Single-word names, international letters, punctuation, and internal spaces are preserved; no two-word assumption is made.
- Email is trimmed, required, at most 254 characters, validated with Zod’s email validator, and lowercased. Dots and plus tags are retained. Unknown request fields are stripped before forwarding.
- The client validates the JSON result before using it, locks submission immediately with a ref, disables controls while pending, and announces loading and success through a live region. Failures preserve values and show an alert plus associated field errors; focus moves to the first invalid input or the failure alert. Success focuses the live message and replaces the form with “YOU’RE ON THE LIST” until reload; there is no animation or persistent browser state.
- Submission requires JavaScript. The form specifies POST so a non-JavaScript submission cannot put personal data into a query string; the JSON-only endpoint returns an explanatory error in that case.

## Formspark boundary

Formspark stores registrations and remains the source of truth. The server-only adapter uses native fetch against `https://submit-form.com/<form-id>` with JSON Content-Type and Accept headers. Only fullName and email are forwarded; no SDK, management API token, submission scanning, or local persistence is used.

`FORMSPARK_FORM_ID` is read at request time on the server. Missing configuration keeps the page/build usable but makes submission fail safely. The adapter has a 10-second timeout, rejects redirects, and does not retry writes automatically. The browser waits at most 15 seconds. A lost response or timeout can leave the result uncertain even if Formspark stored it; a manual retry may create a duplicate.

No documented atomic email uniqueness or idempotency capability was found in the submission interface. The in-flight guard prevents repeat clicks only; repeat registrations across requests are accepted by Formspark. Reliable duplicate detection is deferred rather than adding a scan-and-submit race or a database. Confirmation email uses the dashboard autoresponder, not application email infrastructure. See [registration setup](registration.md) for configuration, official references, and live verification.

## Planned interest flow

Formspark data → server-side interest calculation → rounded milestone → page render.

The interest-count definition remains deferred. Hide the count below 30; display rounded milestones once eligible.
Initial interest can likely be loaded directly by a Server Component without a browser-facing interest API.
No interest fetching, calculation, caching, or display is implemented now.

## Deferred concerns

Stage 4 does **not** implement:

- Duplicate detection, interest calculation, honeypot, or rate limiting.
- Custom confirmation-email infrastructure; dashboard autoresponder setup is manual.
- Blackout/flicker/glitch animation or the final animated success experience.
- Analytics.
- Apache configuration, Cloudflare Tunnel configuration, systemd, or GitHub Actions deployment.
- Docker, SSH deployment, or production environment configuration.

## Future reuse

The repository is named `piu-invites` and may eventually serve future PIÙ events.
Keep the architecture focused on this event until reuse requirements are real.
Do not introduce a generic event platform, tenant system, hostname-based event resolution, multi-event routing,
CMS-driven event definitions, or reusable theme system.
