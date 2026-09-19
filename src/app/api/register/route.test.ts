import assert from "node:assert/strict";
import { afterEach, beforeEach, mock, test } from "node:test";

import { POST } from "./route";

const originalEnvironment = process.env;
const registration = { fullName: "Aoife O’Neill", email: "aoife@example.com" };

beforeEach(() => {
  process.env = { ...originalEnvironment, NODE_ENV: "test", FORMSPARK_FORM_ID: "test-form" };
  delete process.env.REGISTRATION_PREVIEW;
});

afterEach(() => {
  mock.restoreAll();
  process.env = originalEnvironment;
});

function request(body: unknown): Request {
  return new Request("http://localhost/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

test("previews valid registrations in development without contacting Formspark", async () => {
  process.env = { ...process.env, NODE_ENV: "development", REGISTRATION_PREVIEW: "true" };
  delete process.env.FORMSPARK_FORM_ID;
  const upstream = mock.method(globalThis, "fetch", async () => Response.json({}));

  const response = await POST(request(registration));

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(upstream.mock.callCount(), 0);
});

test("preview allows empty fields and populated honeypots without contacting Formspark", async () => {
  process.env = { ...process.env, NODE_ENV: "development", REGISTRATION_PREVIEW: "true" };
  const upstream = mock.method(globalThis, "fetch", async () => Response.json({}));

  for (const body of [{ fullName: "", email: "" }, { ...registration, website: "spam" }]) {
    const response = await POST(request(body));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });
  }
  assert.equal(upstream.mock.callCount(), 0);
});

test("uses real submission unless preview is explicitly enabled in development", async () => {
  const upstream = mock.method(globalThis, "fetch", async () => new Response(null, { status: 503 }));
  for (const environment of [
    { NODE_ENV: "production", REGISTRATION_PREVIEW: "true" },
    { NODE_ENV: "test", REGISTRATION_PREVIEW: "true" },
    { NODE_ENV: "development", REGISTRATION_PREVIEW: "false" },
    { NODE_ENV: "development", REGISTRATION_PREVIEW: "" },
  ] satisfies NodeJS.ProcessEnv[]) {
    process.env = { ...process.env, ...environment };
    assert.equal((await POST(request(registration))).status, 503);
  }
  assert.equal(upstream.mock.callCount(), 4);
  process.env = { ...process.env, NODE_ENV: "production", REGISTRATION_PREVIEW: "true" };
  assert.equal((await POST(request({ email: "invalid" }))).status, 422);
  assert.equal((await POST(request({ ...registration, website: "spam" }))).status, 400);
  assert.equal(upstream.mock.callCount(), 4);
});

test("forwards only validated, normalized fields using the Formspark JSON interface", async () => {
  const upstream = mock.method(globalThis, "fetch", async () => Response.json({}));
  const response = await POST(request({
    fullName: "  Aoife O’Neill  ", email: "  Aoife@Example.COM ", website: "", _replyto: "other@example.com",
  }));

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(upstream.mock.callCount(), 1);
  const [url, options] = upstream.mock.calls[0].arguments;
  assert.equal(url, "https://submit-form.com/test-form");
  assert.equal(options?.method, "POST");
  assert.deepEqual(options?.headers, { "Content-Type": "application/json", Accept: "application/json" });
  assert.deepEqual(JSON.parse(String(options?.body)), registration);
  assert.ok(options?.signal instanceof AbortSignal);
  assert.equal(options?.redirect, "error");
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("rejects a populated or malformed honeypot without forwarding or revealing the reason", async () => {
  const upstream = mock.method(globalThis, "fetch", async () => Response.json({}));
  for (const website of ["https://spam.example", " ", null, false, 0, [], {}]) {
    const response = await POST(request({ ...registration, website }));
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), {
      ok: false, message: "We couldn’t confirm your registration. Please try again shortly.",
    });
  }
  assert.equal(upstream.mock.callCount(), 0);
});

test("permits clients that omit the honeypot without adding it to the upstream payload", async () => {
  const upstream = mock.method(globalThis, "fetch", async () => Response.json({}));
  const response = await POST(request(registration));
  assert.equal(response.status, 200);
  assert.deepEqual(JSON.parse(String(upstream.mock.calls[0].arguments[1]?.body)), registration);
});

test("returns field errors without contacting Formspark for invalid registration", async () => {
  const upstream = mock.method(globalThis, "fetch", async () => Response.json({}));
  const response = await POST(request({ email: "invalid" }));
  const body = await response.json();

  assert.equal(response.status, 422);
  assert.equal(body.ok, false);
  assert.deepEqual(body.fieldErrors, {
    fullName: ["Enter your full name."], email: ["Enter a valid email address."],
  });
  assert.equal(upstream.mock.callCount(), 0);
});

test("rejects malformed JSON and unsupported content types without forwarding", async () => {
  const upstream = mock.method(globalThis, "fetch", async () => Response.json({}));
  const malformed = await POST(new Request("http://localhost/api/register", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: "{",
  }));
  const unsupported = await POST(new Request("http://localhost/api/register", {
    method: "POST", body: "fullName=Aoife",
  }));

  assert.equal(malformed.status, 400);
  assert.equal((await malformed.json()).ok, false);
  assert.equal(unsupported.status, 415);
  assert.equal((await unsupported.json()).ok, false);
  assert.equal(upstream.mock.callCount(), 0);
});

test("returns a recoverable error when configuration is missing", async () => {
  delete process.env.FORMSPARK_FORM_ID;
  const upstream = mock.method(globalThis, "fetch", async () => Response.json({}));
  const response = await POST(request(registration));

  assert.equal(response.status, 503);
  assert.equal((await response.json()).ok, false);
  assert.equal(upstream.mock.callCount(), 0);
});

test("hides upstream failure details and does not retry rejected submissions", async () => {
  const upstream = mock.method(globalThis, "fetch", async () => new Response("Private upstream details", { status: 500 }));
  const response = await POST(request(registration));

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    ok: false, message: "We couldn’t confirm your registration. Please try again shortly.",
  });
  assert.equal(upstream.mock.callCount(), 1);
});

test("handles network failures and timeouts without automatic retries", async () => {
  const upstream = mock.method(globalThis, "fetch", async () => { throw new TypeError("Private network details"); });
  const networkFailure = await POST(request(registration));
  upstream.mock.mockImplementation(async () => { throw new DOMException("Timed out", "TimeoutError"); });
  const timeout = await POST(request(registration));

  assert.equal(networkFailure.status, 503);
  assert.equal(timeout.status, 503);
  assert.deepEqual(await networkFailure.json(), await timeout.json());
  assert.equal(upstream.mock.callCount(), 2);
});
