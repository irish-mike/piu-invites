# PIÙ Invites

An event interest-registration website for **Hocus Pocus Halloween Party 2026**, organised by PIÙ.
Registering expresses interest, not a commitment to attend.

**Status: Stage 6 — registration success experience. Development is local only.**
The event page submits full name and email through a server-validated endpoint to Formspark. Confirmed success runs a blackout and an animated jump scare with a shifting, flickering entrance and exit before settling on the final copy; reduced motion skips the effect. A server-rendered interest message shows rounded milestones from unique emails, hidden below 30. It refreshes roughly every five minutes and disappears if retrieval fails. Spam protection, analytics, and deployment remain deferred. Real Formspark submission, read access, and confirmation-email delivery require configuration and live verification.

## Stack

Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS 4, and ESLint.
Zod validates registrations and the API response contract. Motion controls the success blackout, animated-image entrance and exit, and text reveal. A local CSS module handles framing.
The form uses native HTML controls; shadcn/ui is not needed for this stage.

## Local development

Prerequisites: Node.js 20.9 or newer and npm. Use a supported Node.js release.
`next/font/google` downloads Cinzel, Libre Baskerville, and Inter during compilation, so the first development run or an uncached build needs access to Google Fonts. Fonts are then served locally to the browser.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). Local servers bind to the loopback interface.
Use `npm install` when intentionally changing dependencies and include `package-lock.json` with those changes.
Set `FORMSPARK_FORM_ID` in `.env.local` to enable registration, then restart the server. No API token is needed, and the variable must not use a `NEXT_PUBLIC_` prefix. With an empty ID, the page still runs and submissions return a recoverable error. See [registration setup](docs/registration.md) for Formspark dashboard configuration and the live verification checklist.
For public interest, also set server-only `FORMSPARK_API_TOKEN` with the `submissions:read` scope. Formspark reads require an upgraded workspace. Missing read configuration hides the optional message without affecting registration. See [interest setup](docs/interest.md).

## Verification

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

Linting rejects warnings. Type checking generates Next.js route types before running TypeScript, so it also works
before the first build. The build does not replace the lint command.
To inspect the production build locally, run `npm start` after building and open the same local URL.
Tests use Node’s built-in runner with `tsx` for TypeScript. They cover registration, success state transitions including reduced motion, unique-email counting, milestone boundaries, and Formspark pagination/failures. External HTTP is replaced; tests never access a real Formspark account. See [registration verification](docs/registration.md#verification) for visual and accessibility checks.

## Architecture and guidance

Keep the application small: KISS, readability, meaningful DRY, and abstraction only when justified.
`src/app` contains framework entry points, fonts, metadata, and global visual tokens. Event presentation lives in `src/features/event`; the form, schemas, and response contract live in `src/features/registration`. `src/features/interest` owns the calculation and cached Server Component. Both features use the server-only adapter in `src/integrations/formspark.ts`. Photography is in `public/images`.
There is no multi-event platform, database, global state library, or separate backend.

Read [architecture](docs/architecture.md) for project decisions and planned boundaries.
The [documentation index](docs/README.md) distinguishes general guidance from project decisions;
start with [code standards](docs/code-standards.md) and
[TypeScript and React standards](docs/code-standards-typescript.md) before changing code.
