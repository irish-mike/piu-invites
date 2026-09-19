import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

const cookieLifetimeSeconds = 180 * 24 * 60 * 60;

type RegistrationCookieContext = {
  email: string;
  formId: string;
  secret: string;
};

type RegistrationCookie = {
  name: string;
  value: string;
  httpOnly: true;
  secure: boolean;
  sameSite: "strict";
  path: string;
  maxAge: number;
  expires: Date;
};

export function getRegistrationCookieContext(email: string): RegistrationCookieContext | null {
  const secret = process.env.REGISTRATION_COOKIE_SECRET?.trim();
  const formId = process.env.FORMSPARK_FORM_ID?.trim();
  if (!secret || Buffer.byteLength(secret) < 32 || !formId) return null;

  return { email, formId, secret };
}

function sign(context: RegistrationCookieContext, purpose: string, expiresAt?: number): string {
  return createHmac("sha256", context.secret)
    .update(JSON.stringify([purpose, context.formId, context.email, expiresAt]))
    .digest("hex");
}

export function getRegistrationCookieName(context: RegistrationCookieContext): string {
  return `piu_registered_${sign(context, "name")}`;
}

export function isRegistrationCookieValid(value: string | undefined, context: RegistrationCookieContext): boolean {
  if (!value) return false;
  const match = /^v1\.(\d{10})\.([a-f0-9]{64})$/.exec(value);
  if (!match) return false;

  const expiresAt = Number(match[1]);
  if (expiresAt <= Math.floor(Date.now() / 1000)) return false;

  const expected = Buffer.from(sign(context, "receipt", expiresAt), "hex");
  return timingSafeEqual(Buffer.from(match[2], "hex"), expected);
}

export function createRegistrationCookie(context: RegistrationCookieContext): RegistrationCookie {
  const expiresAt = Math.floor(Date.now() / 1000) + cookieLifetimeSeconds;
  return {
    name: getRegistrationCookieName(context),
    value: `v1.${expiresAt}.${sign(context, "receipt", expiresAt)}`,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/register",
    maxAge: cookieLifetimeSeconds,
    expires: new Date(expiresAt * 1000),
  };
}
