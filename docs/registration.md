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

## Duplicate and failure behavior

The browser blocks repeat submissions while a request is pending. That is not email deduplication across visits or requests. Formspark’s [duplicate-submission guidance](https://documentation.formspark.io/troubleshooting/common-issues.html) describes separate accepted entries, and its [API reference](https://documentation.formspark.io/api/reference.html) does not document an atomic email-uniqueness operation for submissions. We have not implemented “already on the list”: scanning past submissions would add expense and race conditions, and a database is outside scope.

The adapter times out after 10 seconds and never retries automatically. A lost response can mean the registration was saved even though the browser could not confirm it; a manual retry can therefore duplicate it. HTTP acceptance also cannot verify inbox delivery or downstream spam decisions. No local registration data or raw upstream errors are logged or persisted.

## Verification

Run the commands in the repository README. Automated tests cover schema rules, normalized forwarding, invalid JSON and media types, field errors, missing configuration, HTTP failure, and network/timeout failure. Only the external HTTP boundary is replaced in tests; no test data reaches Formspark.

Before relying on real registrations:

- Set a real test form ID and submit a name and email you control. Confirm the name is trimmed and email lowercased in Formspark.
- Confirm the page shows “YOU’RE ON THE LIST” and the dashboard autoresponder arrives with the intended copy and reply destination.
- Check repeated-email behavior in that form; the application currently promises no deduplication.

Local simulated success is not evidence of Formspark storage or email delivery. Rate limiting, honeypot protection, animation, analytics, and deployment remain deferred. The separate [public interest feature](interest.md) deduplicates read submissions without changing registration behavior.
