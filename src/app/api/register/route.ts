import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import {
  createRegistrationCookie,
  getRegistrationCookieContext,
  getRegistrationCookieName,
  isRegistrationCookieValid,
} from "@/features/registration/registration-cookie";
import { registrationSchema, type RegistrationResult } from "@/features/registration/registration-schema";
import { submitRegistration } from "@/integrations/formspark";

// Share an ongoing write when two tabs submit before either receives its cookie.
const pendingRegistrations = new Map<string, ReturnType<typeof submitRegistration>>();

function respond(result: RegistrationResult, status: number): NextResponse {
  return NextResponse.json(result, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest): Promise<Response> {
  if (process.env.NODE_ENV === "development" && process.env.REGISTRATION_PREVIEW === "true") {
    return respond({ ok: true }, 200);
  }

  const contentType = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();

  if (contentType !== "application/json") {
    return respond({ ok: false, message: "Please submit using the registration form with JavaScript enabled." }, 415);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return respond({ ok: false, message: "We couldn’t read your registration. Please try again." }, 400);
  }

  if (typeof body === "object" && body !== null && "website" in body && body.website !== "") {
    return respond({ ok: false, message: "We couldn’t confirm your registration. Please try again shortly." }, 400);
  }

  const registration = registrationSchema.safeParse(body);

  if (!registration.success) {
    return respond({
      ok: false,
      message: "Please check your name and email address.",
      fieldErrors: z.flattenError(registration.error).fieldErrors,
    }, 422);
  }

  const cookieContext = getRegistrationCookieContext(registration.data.email);
  if (!cookieContext) {
    console.warn("Registration unavailable", { reason: "missing_configuration" });
    return respond({ ok: false, message: "We couldn’t confirm your registration. Please try again shortly." }, 503);
  }

  const cookieName = getRegistrationCookieName(cookieContext);
  if (isRegistrationCookieValid(request.cookies.get(cookieName)?.value, cookieContext)) {
    return respond({ ok: true, alreadyRegistered: true }, 200);
  }

  const existingSubmission = pendingRegistrations.get(cookieName);
  const submission = existingSubmission ?? submitRegistration(registration.data);
  if (!existingSubmission) pendingRegistrations.set(cookieName, submission);

  try {
    const result = await submission;
    if (result !== "accepted") {
      return respond({ ok: false, message: "We couldn’t confirm your registration. Please try again shortly." }, 503);
    }

    const response = respond({ ok: true }, 200);
    response.cookies.set(createRegistrationCookie(cookieContext));
    return response;
  } catch {
    console.warn("Registration unavailable", { reason: "submission_failed" });
    return respond({ ok: false, message: "We couldn’t confirm your registration. Please try again shortly." }, 503);
  } finally {
    if (!existingSubmission) pendingRegistrations.delete(cookieName);
  }
}
