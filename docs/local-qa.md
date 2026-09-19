# Local readiness checks

Stage 7 review, 15 September 2026. No deployment, live Formspark submission, read credentials, or autoresponder configuration was used. This records the checks at that stage; a development-only `REGISTRATION_PREVIEW` flag was subsequently added for local animation previews (see [registration setup](registration.md#verification)).

## Runtime and failure checks

- Removed the temporary Node preload script and restarted the normal production server without its environment override. No simulation flag or success bypass is present in the application or package scripts.
- A disposable loopback proxy on a separate port supplied browser QA responses and image failures. It did not contact Formspark and was removed after verification.
- Missing form configuration returns a generic, retryable 503. Missing read configuration hides the interest message while the page renders. Existing tests cover read failures, malformed pages, and failed pagination without partial counts.
- The honeypot accepts empty/omitted values and rejects populated or malformed values before any upstream request. Rejection uses generic copy and never identifies the honeypot. Validated forwarding contains only name and email.
- Browser checks covered validation errors, first-invalid-field focus, retained name/email after failure, pending disabled controls, one request for a double-click, upstream failure, malformed JSON, network interruption, and retry into success. Failures never displayed the animation.
- Missing animation images and stalled image requests both settle on `YOU’RE ON THE LIST`; the latter uses the new five-second deadline. Focus reaches success and the overlay disappears.
- The approved animation timings, colors, movement, and two brief white flashes are unchanged. No additional flashes or continuous loops were introduced. Success state guards prevent replay. This was a timing/code and visual review, not a formal photosensitivity certification.

## Responsive checks

Initial and final states were inspected in the in-app browser at each width. Inputs remained within the viewport, success text stayed readable, and there was no horizontal overflow. Collage position before and after success was identical:

| Width | Input width | Collage top before/after |
| --- | --- | --- |
| 375px | 327px | 665.84px |
| 430px | 382px | 682.16px |
| 768px | 512px | 683.10px |
| 1024px | 512px | 702.30px |
| 1440px | 512px | 743.50px |

The decorative overlay covered the viewport, the supplied animated asset played, and the final state remained scrollable through the collage and footer. No changes to the approved layout or collage were needed.

## Accessibility, metadata, and privacy

- One page h1, followed by the success h2 when appropriate. Inputs have labels and field-error descriptions. Keyboard focus has the existing visible 2px amber outline. The honeypot is absent from the accessibility tree and ordinary tab order.
- Pending is announced through the existing status region. Success receives focus without scroll movement and is not repeated in that live region. Decorative background, animation, and flash layers are hidden from assistive technology; collage photographs retain descriptive alt text.
- Reduced-motion bypass passes the reducer test. Preference changes are handled during animation, including a preference change between response handling and listener setup. The OS-enabled browser check was explicitly skipped at the user's request; actual screen-reader speech was not tested.
- Solid palette samples against black: parchment 17.48:1, muted text 9.82:1, button amber 5.88:1, focus amber 7.64:1, and input borders 4.04:1. This does not certify every photographic background pixel.
- Title, description, English document language, and `noindex, nofollow` are present. No starter/demo content, starter favicon, public preview URL, or debug text was found. No custom favicon is currently configured.
- The only application logging is a fixed interest-availability warning with a reason code and optional HTTP status. Submitted names/emails, tokens, raw response bodies, and raw errors are not logged. Both Formspark configuration values remain server-only.
- All installed direct dependencies have an active runtime or tooling use. No new package or framework was added. `npm audit --omit=dev` reported zero production dependency advisories; the documented ESLint 9 upstream support concern remains unchanged.

## Validation and remaining checks

Lint, type checking, all 52 tests, production build, and diff checks passed. Three tests were added for honeypot rejection, omitted-field compatibility, and malformed response envelopes; the existing forwarding test now also checks an empty honeypot is stripped upstream.

Real Formspark storage, authenticated interest reads, repeated-email behavior, autoresponder delivery, and production infrastructure remain unverified and out of scope. Before launch, review the animation and final confirmation on actual target devices and with assistive technology, then perform the live checks in [registration setup](registration.md) and [interest setup](interest.md).
