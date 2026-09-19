import "server-only";

import { request } from "node:https";

import type { Registration } from "@/features/registration/registration-schema";

const submissionTimeoutMs = 10_000;

type SubmissionResult = "accepted" | "unavailable";

function sendRegistration(formId: string, registration: Registration): Promise<boolean> {
  const body = JSON.stringify({ fullName: registration.fullName, email: registration.email });

  return new Promise((resolve) => {
    let isSettled = false;
    const finish = (isAccepted: boolean): void => {
      if (isSettled) return;
      isSettled = true;
      resolve(isAccepted);
    };

    const upstreamRequest = request({
      protocol: "https:",
      hostname: "submit-form.com",
      path: `/${encodeURIComponent(formId)}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    }, (response) => {
      response.resume();
      const status = response.statusCode ?? 0;
      finish(status >= 200 && status < 300);
    });

    upstreamRequest.setTimeout(submissionTimeoutMs, () => {
      upstreamRequest.destroy(new Error("Formspark submission timed out"));
    });
    upstreamRequest.on("error", () => finish(false));
    upstreamRequest.end(body);
  });
}

export async function submitRegistration(registration: Registration): Promise<SubmissionResult> {
  const formId = process.env.FORMSPARK_FORM_ID?.trim();
  if (!formId) return "unavailable";

  // A timed-out submission may already be stored, so never retry automatically.
  return await sendRegistration(formId, registration) ? "accepted" : "unavailable";
}
