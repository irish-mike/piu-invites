"use client";

import { useEffect, useRef, useState, type ReactElement, type SubmitEvent } from "react";

import { registrationResultSchema, type RegistrationResult } from "./registration-schema";

const inputClasses = `
  h-11 w-full rounded-xs border border-rule bg-ink/65 px-3
  text-left text-base text-parchment placeholder:text-muted
  focus-visible:border-amber-hover aria-invalid:border-amber-hover disabled:opacity-70
`;

const submitButtonClasses = `
  mt-5 min-h-12 w-full cursor-pointer rounded-xs bg-amber px-5 py-4
  text-xs font-semibold tracking-[0.18em] text-ink hover:bg-amber-hover
  disabled:cursor-wait disabled:opacity-70
`;

const fieldErrorClasses = "mt-2 text-left text-xs leading-5 text-parchment";
const requestTimeoutMs = 15_000;
const requestError = "We couldn’t confirm your registration. Please try again shortly.";

type FormState =
  | { status: "idle" | "submitting" | "success" }
  | { status: "error"; error: Extract<RegistrationResult, { ok: false }> };

export function RegistrationForm(): ReactElement {
  const [state, setState] = useState<FormState>({ status: "idle" });
  const isRequestPending = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const isSubmitting = state.status === "submitting";
  const error = state.status === "error" ? state.error : undefined;
  const fullNameError = error?.fieldErrors?.fullName?.[0];
  const emailError = error?.fieldErrors?.email?.[0];

  useEffect(() => {
    if (state.status === "error") {
      formRef.current?.querySelector<HTMLElement>("[aria-invalid='true'], [role='alert']")?.focus();
    } else if (state.status === "success") {
      statusRef.current?.focus();
    }
  }, [state]);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (isRequestPending.current) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    isRequestPending.current = true;
    setState({ status: "submitting" });

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ fullName: data.get("fullName"), email: data.get("email") }),
        signal: AbortSignal.timeout(requestTimeoutMs),
      });
      const body: unknown = await response.json();
      const result = registrationResultSchema.safeParse(body);

      if (!result.success || (result.data.ok && !response.ok)) {
        setState({ status: "error", error: { ok: false, message: requestError } });
        return;
      }

      if (result.data.ok) {
        setState({ status: "success" });
        return;
      }

      setState({ status: "error", error: result.data });
    } catch {
      setState({ status: "error", error: { ok: false, message: requestError } });
    } finally {
      isRequestPending.current = false;
    }
  }

  return (
    <div className="mt-7 text-center font-sans">
      {state.status !== "success" && (
        <form
          ref={formRef}
          aria-label="Register your interest"
          aria-describedby="registration-intro registration-privacy"
          aria-busy={isSubmitting}
          action="/api/register"
          method="post"
          noValidate
          onSubmit={handleSubmit}
        >
          <div className="grid gap-3">
            <div>
              <label htmlFor="full-name" className="sr-only">
                Full name
              </label>
              <input
                id="full-name"
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder="Full name"
                required
                disabled={isSubmitting}
                aria-invalid={Boolean(fullNameError)}
                aria-describedby={fullNameError ? "full-name-error" : undefined}
                className={inputClasses}
              />
              {fullNameError && <p id="full-name-error" className={fieldErrorClasses}>{fullNameError}</p>}
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Email address"
                required
                disabled={isSubmitting}
                aria-invalid={Boolean(emailError)}
                aria-describedby={emailError ? "email-error" : undefined}
                className={inputClasses}
              />
              {emailError && <p id="email-error" className={fieldErrorClasses}>{emailError}</p>}
            </div>
          </div>

          {error && <p role="alert" tabIndex={-1} className="mt-4 text-sm text-parchment">{error.message}</p>}
          <button type="submit" className={submitButtonClasses} disabled={isSubmitting}>
            {isSubmitting ? "SUBMITTING…" : "KEEP ME UPDATED"}
          </button>
          <p id="registration-privacy" className="mt-4 text-center text-[0.7rem] leading-5 text-muted">
            We’ll only contact you about this event.
          </p>
        </form>
      )}
      <p
        ref={statusRef}
        role="status"
        tabIndex={-1}
        className={state.status === "success" ? "py-12 text-sm tracking-[0.18em]" : "sr-only"}
      >
        {isSubmitting ? "Submitting your registration." : state.status === "success" ? "YOU’RE ON THE LIST" : ""}
      </p>
    </div>
  );
}
