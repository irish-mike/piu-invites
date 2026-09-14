import { z } from "zod";

import { registrationSchema, type RegistrationResult } from "@/features/registration/registration-schema";
import { submitRegistration } from "@/integrations/formspark";

function respond(result: RegistrationResult, status: number): Response {
  return Response.json(result, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request): Promise<Response> {
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

  const registration = registrationSchema.safeParse(body);

  if (!registration.success) {
    return respond({
      ok: false,
      message: "Please check your name and email address.",
      fieldErrors: z.flattenError(registration.error).fieldErrors,
    }, 422);
  }

  const result = await submitRegistration(registration.data);

  if (result !== "accepted") {
    return respond({ ok: false, message: "We couldn’t confirm your registration. Please try again shortly." }, 503);
  }

  return respond({ ok: true }, 200);
}
