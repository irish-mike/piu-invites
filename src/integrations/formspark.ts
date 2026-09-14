import "server-only";

import type { Registration } from "@/features/registration/registration-schema";

const submissionTimeoutMs = 10_000;

type SubmissionResult = "accepted" | "unavailable";

export async function submitRegistration(registration: Registration): Promise<SubmissionResult> {
  const formId = process.env.FORMSPARK_FORM_ID?.trim();

  if (!formId) {
    return "unavailable";
  }

  try {
    const response = await fetch(`https://submit-form.com/${encodeURIComponent(formId)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ fullName: registration.fullName, email: registration.email }),
      signal: AbortSignal.timeout(submissionTimeoutMs),
      redirect: "error",
      cache: "no-store",
    });

    await response.body?.cancel();
    return response.ok ? "accepted" : "unavailable";
  } catch {
    // A timed-out submission may already be stored, so never retry automatically.
    return "unavailable";
  }
}
