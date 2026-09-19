"use client";

import { useEffect, useReducer, useRef, type ReactElement, type ReactNode, type SubmitEvent } from "react";

import { registrationResultSchema } from "./registration-schema";
import { registrationReducer } from "./registration-state";
import { RegistrationSuccess } from "./registration-success";

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

export function RegistrationForm({ children }: { children: ReactNode }): ReactElement {
  const [state, dispatch] = useReducer(registrationReducer, { status: "idle" });
  const isRequestPending = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isSubmitting = state.status === "submitting";
  const hasSucceeded = state.status === "animating-success" || state.status === "success";
  const error = state.status === "error" ? state.error : undefined;
  const fullNameError = error?.fieldErrors?.fullName?.[0];
  const emailError = error?.fieldErrors?.email?.[0];

  useEffect(() => {
    if (state.status === "error") {
      formRef.current?.querySelector<HTMLElement>("[aria-invalid='true'], [role='alert']")?.focus();
    }
  }, [state]);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (isRequestPending.current || hasSucceeded) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    isRequestPending.current = true;
    dispatch({ type: "submit" });

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ fullName: data.get("fullName"), email: data.get("email"), website: data.get("website") }),
        signal: AbortSignal.timeout(requestTimeoutMs),
      });
      const body: unknown = await response.json();
      const result = registrationResultSchema.safeParse(body);

      if (!result.success) {
        dispatch({ type: "failed" });
        return;
      }

      dispatch({
        type: "response",
        result: result.data,
        httpOk: response.ok,
        reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        contentHeight: contentRef.current?.getBoundingClientRect().height ?? form.getBoundingClientRect().height,
      });
    } catch {
      dispatch({ type: "failed" });
    } finally {
      isRequestPending.current = false;
    }
  }

  return (
    <div ref={contentRef} className="flow-root text-center font-sans">
      {hasSucceeded ? (
        <RegistrationSuccess
          isAnimating={state.status === "animating-success"}
          contentHeight={state.contentHeight}
          onAnimationComplete={() => dispatch({ type: "animation-finished" })}
        />
      ) : (
        <>
          {children}
          <form
            ref={formRef}
            className="mx-auto mt-7 max-w-lg"
            aria-label="Register your interest"
            aria-describedby="registration-intro registration-privacy"
            aria-busy={isSubmitting}
            action="/api/register"
            method="post"
            noValidate
            onSubmit={handleSubmit}
          >
            <div className="sr-only" aria-hidden="true">
              <label htmlFor="registration-website">Leave this field empty</label>
              <input id="registration-website" name="website" type="text" autoComplete="off" tabIndex={-1} disabled={isSubmitting} />
            </div>
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
        </>
      )}
      <p role="status" className="sr-only">
        {isSubmitting ? "Submitting your registration." : ""}
      </p>
    </div>
  );
}
