# Registration setup

## Local configuration

Copy `.env.example` to `.env.local` and set `FORMSPARK_FORM_ID` to the ID at the end of the form’s submission URL, not the full URL. Restart the local server after changing it. Keep `.env.local` ignored by Git. The page and build work without this value, but valid submissions return a recoverable 503 error until it is set.

Registration submission uses Formspark’s [HTTP submission interface](https://documentation.formspark.io/examples/ajax.html). It needs only a form ID, not a management API token. It sends JSON with both required headers and treats a successful HTTP status as acceptance. No configuration is exposed through public environment variables, browser requests, or response bodies. There is no SDK or custom email provider.

## Formspark dashboard

1. Create or select the intended event form and copy its submission form ID into `.env.local`.
2. Confirm the form is active and the workspace has submission capacity. Use a test form while verifying the integration.
3. For confirmation email, use an upgraded workspace and open the form’s **Settings** to create an autoresponder template. Set the event confirmation copy there. The submitted `email` field supplies the recipient. Configure the form’s first notification recipient to receive replies.
4. Send a test registration and verify both the stored fields and actual email delivery. Spam-flagged submissions do not trigger an autoresponse. The autoresponder is for transactional confirmations, not the later marketing/update emails.

These settings are manual; application code does not enable or verify the [Formspark autoresponder](https://documentation.formspark.io/dashboard/autoresponder.html). Challenge-based spam protection is not wired into this stage, so enabling a dashboard challenge would require corresponding application work.

## Basic spam protection

The form includes an off-screen `website` honeypot with `aria-hidden`, `tabIndex={-1}`, and autocomplete disabled. It is sent in the JSON request but never forwarded to Formspark. A populated or malformed value returns a generic 400 failure before any upstream call. Empty or omitted values allow normal validation and submission. This is a lightweight filter; stronger rate limiting remains infrastructure work.

## Duplicate and failure behavior

The browser blocks repeat submissions while a request is pending. That is not email deduplication across visits or requests. Formspark’s [duplicate-submission guidance](https://documentation.formspark.io/troubleshooting/common-issues.html) describes separate accepted entries, and its [API reference](https://documentation.formspark.io/api/reference.html) does not document an atomic email-uniqueness operation for submissions. We have not implemented “already on the list”: scanning past submissions would add expense and race conditions, and a database is outside scope.

The adapter times out after 10 seconds and never retries automatically. A lost response can mean the registration was saved even though the browser could not confirm it; a manual retry can therefore duplicate it. HTTP acceptance also cannot verify inbox delivery or downstream spam decisions. No local registration data or raw upstream errors are logged or persisted.

## Verification

Run the commands in the repository README. Automated tests cover schema rules, normalized forwarding, invalid JSON and media types, field errors, missing configuration, HTTP failure, network/timeout failure, honeypot rejection before upstream access, and malformed/empty-error API responses. Reducer tests cover pending, confirmed success, completion, height retention, reduced-motion bypass, failure/retry, and protection against replay. Only the external HTTP boundary is replaced in integration tests; no test data reaches Formspark.

For a local success preview without credentials, run `REGISTRATION_PREVIEW=true npm run dev`, or set the flag in `.env.local` and restart the development server. Click submit to trigger success, even with empty fields; preview skips validation and the honeypot. No registration is sent to Formspark, stored, or emailed. Refresh to replay. The flag defaults off and is ignored in production (`npm start`). For failure fixtures, use an isolated, disposable loopback QA fixture outside the application and remove it afterward. Check desktop and mobile: submission stays pending before acceptance, then the animated-image entrance, playback, and exit sequence settles on the large success heading and removes the form, event details, and registration introduction. Confirm the collage stays in place, the page scrolls, focus reaches the success section without moving the viewport, and success persists. Simulate a failed response and retry to confirm errors retain their accessible treatment and never animate. Enable the system’s reduced-motion preference and repeat: final success should appear directly, without blackout or animated imagery. Also check a preference change during the sequence. Animation frames are reviewed visually rather than pixel-tested.

Before relying on real registrations:

- Set a real test form ID and submit a name and email you control. Confirm the name is trimmed and email lowercased in Formspark.
- Confirm the page shows “YOU’RE ON THE LIST” and the dashboard autoresponder arrives with the intended copy and reply destination.
- Check repeated-email behavior in that form; the application currently promises no deduplication.

Local simulated success is not evidence of Formspark storage or email delivery. Stronger rate limiting, analytics, and deployment remain deferred. The separate [public interest feature](interest.md) deduplicates read submissions without changing registration behavior.

The jump-scare asset can fail independently of registration. A missing image skips directly to confirmation; a request that stalls is bounded by five seconds. Neither case retries registration or loses the confirmed success. See [local QA](local-qa.md) for observed results.
