"use client";

import type { ReactElement } from "react";

const inputClasses = `
  h-12 w-full rounded-xs border border-rule bg-ink/65 px-3
  text-left text-base text-parchment focus-visible:border-amber-hover
`;

const submitButtonClasses = `
  mt-7 min-h-13 w-full cursor-pointer rounded-xs bg-amber px-5 py-4
  text-xs font-semibold tracking-[0.18em] text-ink hover:bg-amber-hover
`;

export function RegistrationForm(): ReactElement {
  return (
    <form
      aria-label="Register your interest"
      aria-describedby="registration-intro registration-privacy"
      className="mt-7 text-center font-sans"
      noValidate
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="grid gap-5">
        <div>
          <label htmlFor="full-name" className="mb-2 block text-xs text-parchment">
            Full name <span className="text-muted">(required)</span>
          </label>
          <input
            id="full-name"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-2 block text-xs text-parchment">
            Email address <span className="text-muted">(required)</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={inputClasses}
          />
        </div>
      </div>

      <button type="submit" className={submitButtonClasses}>
        KEEP ME UPDATED
      </button>
      <p id="registration-privacy" className="mt-4 text-center text-[0.7rem] leading-5 text-muted">
        We’ll only contact you about this event.
      </p>
    </form>
  );
}
