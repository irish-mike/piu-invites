import assert from "node:assert/strict";
import { afterEach, beforeEach, mock, test } from "node:test";

import {
  createRegistrationCookie,
  getRegistrationCookieContext,
  getRegistrationCookieName,
  isRegistrationCookieValid,
} from "./registration-cookie";

const originalEnvironment = { ...process.env };

beforeEach(() => {
  process.env.FORMSPARK_FORM_ID = "test-form";
  process.env.REGISTRATION_COOKIE_SECRET = "test-cookie-secret-with-at-least-32-bytes";
});

afterEach(() => {
  mock.restoreAll();
  process.env = { ...originalEnvironment };
});

function context(email = "guest@example.com") {
  const result = getRegistrationCookieContext(email);
  assert.ok(result);
  return result;
}

test("issues a private signed receipt with a bounded lifetime and verifies it", () => {
  const identity = context();
  const cookie = createRegistrationCookie(identity);
  assert.equal(isRegistrationCookieValid(cookie.value, identity), true);
  assert.equal(cookie.httpOnly, true);
  assert.equal(cookie.sameSite, "strict");
  assert.equal(cookie.path, "/api/register");
  assert.equal(cookie.maxAge, 180 * 24 * 60 * 60);
  assert.ok(cookie.expires.getTime() > Date.now());
  assert.equal(JSON.stringify(cookie).includes(identity.email), false);
  assert.equal(JSON.stringify(cookie).includes(identity.secret), false);
});

test("rejects malformed, forged, and altered receipts", () => {
  const identity = context();
  const cookie = createRegistrationCookie(identity);
  const [version, expiry] = cookie.value.split(".");
  for (const value of [
    undefined, "", "true", `${version}.${expiry}.${"0".repeat(64)}`,
    cookie.value.replace(expiry, String(Number(expiry) + 1)),
    `${cookie.value}extra`, cookie.value.slice(0, -1),
  ]) {
    assert.equal(isRegistrationCookieValid(value, identity), false);
  }
});

test("rejects an expired receipt even if it is sent manually", () => {
  const identity = context();
  const cookie = createRegistrationCookie(identity);
  mock.method(Date, "now", () => cookie.expires.getTime());
  assert.equal(isRegistrationCookieValid(cookie.value, identity), false);
});

test("keeps different emails independent and binds receipts to the form and secret", () => {
  const identity = context();
  const cookie = createRegistrationCookie(identity);
  for (const other of [
    context("other@example.com"), context("guest+party@example.com"),
    { ...identity, formId: "another-form" }, { ...identity, secret: "another-secret-with-at-least-32-bytes" },
  ]) {
    assert.notEqual(getRegistrationCookieName(other), cookie.name);
    assert.equal(isRegistrationCookieValid(cookie.value, other), false);
  }
});

test("requires valid configuration before registration can be submitted", () => {
  for (const secret of ["", "   ", "too-short"]) {
    process.env.REGISTRATION_COOKIE_SECRET = secret;
    assert.equal(getRegistrationCookieContext("guest@example.com"), null);
  }
  delete process.env.REGISTRATION_COOKIE_SECRET;
  assert.equal(getRegistrationCookieContext("guest@example.com"), null);
  process.env.REGISTRATION_COOKIE_SECRET = "test-cookie-secret-with-at-least-32-bytes";
  delete process.env.FORMSPARK_FORM_ID;
  assert.equal(getRegistrationCookieContext("guest@example.com"), null);
});

test("requires HTTPS for production cookies and permits local development HTTP", () => {
  const identity = context();
  Object.assign(process.env, { NODE_ENV: "production" });
  assert.equal(createRegistrationCookie(identity).secure, true);
  Object.assign(process.env, { NODE_ENV: "development" });
  assert.equal(createRegistrationCookie(identity).secure, false);
});
