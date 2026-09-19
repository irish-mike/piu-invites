# Public interest

The public message counts unique registered email addresses, not submissions. It reuses registration’s email schema: trim, validate, lowercase, and retain dots and plus tags. Invalid/missing emails are ignored. Repeated submissions from the same normalized email count once; different domains and plus-addresses remain distinct. This does not prevent duplicate registration submissions.

Below 30 unique emails, no message renders. Above that threshold, round down to the nearest ten with no upper cap: 30–39 → `30+ spirits are interested`, 47 → `40+ spirits are interested`, 103 → `100+ spirits are interested`, 204 → `200+ spirits are interested`. Only the resulting string reaches the browser; exact counts and emails do not.

## Formspark reads

In ignored `.env.local`, configure:

- `FORMSPARK_FORM_ID`: the existing registration form ID.
- `FORMSPARK_API_TOKEN`: a dashboard-created bearer token with only the `submissions:read` scope needed here. Read access requires an upgraded workspace. Tokens can reach the workspaces their owner belongs to; keep this value server-only and never use a `NEXT_PUBLIC_` prefix.

The adapter calls `GET https://api.formspark.io/public/v1/forms/{formId}/submissions?limit=100`. It follows `hasMore`, passing the opaque `nextCursor` back unchanged as `startingAfter`. The documented endpoint excludes spam and deleted records and offers no field-selection parameter. The adapter discards non-email fields as each page is processed.

A missing/repeated cursor or malformed page fails the whole read. Individual malformed records are skipped. A shared ten-second deadline bounds the complete traversal; a failure never publishes an incomplete count. There is no page-count cap or generic pagination framework.

Official references: [API and plan requirements](https://documentation.formspark.io/api/), [endpoint and scopes](https://documentation.formspark.io/api/reference.html), [pagination](https://documentation.formspark.io/api/pagination.html), [OpenAPI schema](https://api.formspark.io/public/v1/openapi.json).

## Caching and failure

Next.js 16.3 Cache Components are enabled. The interest component uses `io()` within Suspense to keep the optional read out of build-time prerendering and let registration render immediately. A private `use cache` function caches only the milestone string or null; HTTP reads use `no-store`.

The explicit `cacheLife` profile is 300 seconds stale, 300 seconds revalidate, and 600 seconds expire. On the Node server, repeated page loads share the in-process cache. After five minutes a request triggers a background refresh; stale output may appear during that refresh. After ten minutes without a refresh, the optional message waits for fresh data. This is request-driven, not polling or a scheduled job. Restarting the process clears this runtime cache; restart after changing form/token configuration.

An unset, empty, or whitespace-only `FORMSPARK_API_TOKEN` disables the guest count: the component returns nothing before calling the cached reader, with no API request or warning. Other missing configuration or retrieval failures log a single structured server warning per cached attempt, containing only a fixed message, reason, and optional HTTP status. The cached result becomes null, hiding the message on subsequent renders. Visitors receive no error, fabricated count, token, raw response, or email. Registration does not depend on read credentials and never increments or invalidates the milestone in the browser.

The line uses existing muted typography below the privacy copy, within the hero’s existing spacing. The collage does not move when it appears or disappears.

## Verification

`npm test` covers all requested thresholds, milestones above 200, normalization/deduplication, malformed emails, pagination, parsing, and failure paths. Network calls are replaced at the HTTP boundary.

With real credentials, compare Formspark’s normalized unique emails against the displayed rounded milestone, including more than one page and duplicate submissions. Allow a refresh interval before expecting a change. Simulated checks do not verify real token permissions, workspace eligibility, or live data.
