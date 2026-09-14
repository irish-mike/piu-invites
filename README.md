# PIÙ Invites

An event interest-registration website for **Hocus Pocus Halloween Party 2026**, organised by PIÙ.
Registering will express interest, not a commitment to attend.

**Status: Stage 1 — project foundation. Development is local only.**
The root page is a development placeholder. Registration, event design, Formspark, analytics, and deployment
are intentionally deferred.

## Stack

Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS 4, and ESLint.
Zod and Motion are installed as requested foundation dependencies but are not used yet.
shadcn/ui initialization is deferred until the first component is needed.

## Local development

Prerequisites: Node.js 20.9 or newer and npm. Use a supported Node.js release.
No environment variables, credentials, or external services are needed for Stage 1.

```sh
npm ci
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). Local servers bind to the loopback interface.
Use `npm install` when intentionally changing dependencies and include `package-lock.json` with those changes.

## Verification

```sh
npm run lint
npm run typecheck
npm run build
```

Linting rejects warnings. Type checking generates Next.js route types before running TypeScript, so it also works
before the first build. The build does not replace the lint command.
To inspect the production build locally, run `npm start` after building and open the same local URL.

## Architecture and guidance

Keep the application small: KISS, readability, meaningful DRY, and abstraction only when justified.
Use vertical feature slices as real behavior arrives; the current source needs only `src/app`.
There is no multi-event platform, database, global state library, or separate backend.

Read [architecture](docs/architecture.md) for project decisions and planned boundaries.
The [documentation index](docs/README.md) distinguishes general guidance from project decisions;
start with [code standards](docs/code-standards.md) and
[TypeScript and React standards](docs/code-standards-typescript.md) before changing code.
