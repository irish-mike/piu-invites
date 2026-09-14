import "server-only";

import { z } from "zod";

import type { Registration } from "@/features/registration/registration-schema";

const submissionTimeoutMs = 10_000;
const retrievalTimeoutMs = 10_000;

const submissionsPageSchema = z.object({
  data: z.array(z.unknown()),
  hasMore: z.boolean(),
  nextCursor: z.string().nullable(),
});

const submissionEmailSchema = z.object({
  data: z.object({ email: z.unknown() }),
});

type SubmissionEmailsResult =
  | { ok: true; emails: unknown[] }
  | {
    ok: false;
    reason: "missing_configuration" | "http" | "invalid_response" | "invalid_pagination" | "timeout" | "network";
    status?: number;
  };

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

export async function getSubmissionEmails(): Promise<SubmissionEmailsResult> {
  const formId = process.env.FORMSPARK_FORM_ID?.trim();
  const token = process.env.FORMSPARK_API_TOKEN?.trim();

  if (!formId || !token) {
    return { ok: false, reason: "missing_configuration" };
  }

  const emails: unknown[] = [];
  const seenCursors = new Set<string>();
  const signal = AbortSignal.timeout(retrievalTimeoutMs);
  let cursor: string | null = null;

  try {
    do {
      signal.throwIfAborted();
      const url = new URL(`https://api.formspark.io/public/v1/forms/${encodeURIComponent(formId)}/submissions`);
      url.searchParams.set("limit", "100");
      if (cursor) url.searchParams.set("startingAfter", cursor);

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        cache: "no-store",
        redirect: "error",
        signal,
      });

      if (!response.ok) {
        await response.body?.cancel();
        return { ok: false, reason: "http", status: response.status };
      }

      const body: unknown = await response.json();
      const page = submissionsPageSchema.safeParse(body);
      if (!page.success) return { ok: false, reason: "invalid_response" };

      for (const record of page.data.data) {
        const submission = submissionEmailSchema.safeParse(record);
        if (submission.success) emails.push(submission.data.data.email);
      }

      if (!page.data.hasMore) return { ok: true, emails };

      cursor = page.data.nextCursor;
      if (!cursor || seenCursors.has(cursor) || page.data.data.length === 0) {
        return { ok: false, reason: "invalid_pagination" };
      }
      seenCursors.add(cursor);
    } while (cursor);
  } catch (error) {
    if (signal.aborted) return { ok: false, reason: "timeout" };
    return { ok: false, reason: error instanceof SyntaxError ? "invalid_response" : "network" };
  }

  return { ok: false, reason: "invalid_pagination" };
}
