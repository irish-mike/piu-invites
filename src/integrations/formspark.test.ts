import assert from "node:assert/strict";
import { afterEach, beforeEach, mock, test } from "node:test";

import { getInterestMessage } from "@/features/interest/interest";
import { getSubmissionEmails } from "./formspark";

const originalFormId = process.env.FORMSPARK_FORM_ID;
const originalToken = process.env.FORMSPARK_API_TOKEN;

beforeEach(() => {
  process.env.FORMSPARK_FORM_ID = "test-form";
  process.env.FORMSPARK_API_TOKEN = "test-read-token";
});

afterEach(() => {
  mock.restoreAll();
  if (originalFormId === undefined) delete process.env.FORMSPARK_FORM_ID;
  else process.env.FORMSPARK_FORM_ID = originalFormId;
  if (originalToken === undefined) delete process.env.FORMSPARK_API_TOKEN;
  else process.env.FORMSPARK_API_TOKEN = originalToken;
});

test("reads every page with bearer auth and opaque cursors, keeping only email values", async () => {
  const firstPage = Array.from({ length: 100 }, (_, index) => ({
    id: `submission-${index}`, data: { email: `person${index}@example.com`, fullName: "Private name" },
  }));
  const upstream = mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = new URL(String(input));
    if (!url.searchParams.has("startingAfter")) {
      return Response.json({ data: firstPage, hasMore: true, nextCursor: "opaque+/=cursor" });
    }
    assert.equal(url.searchParams.get("startingAfter"), "opaque+/=cursor");
    return Response.json({
      data: [{ data: { email: " PERSON0@EXAMPLE.COM " } }, { data: { email: "new@example.com" } }],
      hasMore: false, nextCursor: null,
    });
  });

  const result = await getSubmissionEmails();
  assert.equal(upstream.mock.callCount(), 2);
  assert.ok(result.ok);
  assert.equal(result.emails.length, 102);
  assert.equal(result.emails[0], "person0@example.com");
  assert.equal(result.emails[101], "new@example.com");
  assert.equal(getInterestMessage(result.emails), "100+ spirits are interested");
  for (const call of upstream.mock.calls) {
    const [url, options] = call.arguments;
    assert.ok(String(url).startsWith("https://api.formspark.io/public/v1/forms/test-form/submissions?limit=100"));
    assert.deepEqual(options?.headers, { Authorization: "Bearer test-read-token", Accept: "application/json" });
    assert.equal(options?.cache, "no-store");
    assert.equal(options?.redirect, "error");
  }
});

test("ignores malformed records without losing valid emails", async () => {
  mock.method(globalThis, "fetch", async () => Response.json({
    data: [null, {}, { data: null }, { data: {} }, { data: { email: "valid@example.com" } }],
    hasMore: false, nextCursor: null,
  }));
  assert.deepEqual(await getSubmissionEmails(), { ok: true, emails: ["valid@example.com"] });
});

test("returns an empty successful result for an empty form", async () => {
  mock.method(globalThis, "fetch", async () => Response.json({ data: [], hasMore: false, nextCursor: null }));
  assert.deepEqual(await getSubmissionEmails(), { ok: true, emails: [] });
});

test("reports missing configuration without making an HTTP request", async () => {
  const upstream = mock.method(globalThis, "fetch", async () => Response.json({}));
  delete process.env.FORMSPARK_API_TOKEN;
  assert.deepEqual(await getSubmissionEmails(), { ok: false, reason: "missing_configuration" });
  process.env.FORMSPARK_API_TOKEN = "test-read-token";
  delete process.env.FORMSPARK_FORM_ID;
  assert.deepEqual(await getSubmissionEmails(), { ok: false, reason: "missing_configuration" });
  assert.equal(upstream.mock.callCount(), 0);
});

test("discards partial results if a later page fails without exposing its response body", async () => {
  const upstream = mock.method(globalThis, "fetch", async () => Response.json({
    data: [{ data: { email: "person@example.com" } }], hasMore: true, nextCursor: "next-page",
  }));
  upstream.mock.mockImplementationOnce(async () => new Response("Private details", { status: 403 }), 1);
  assert.deepEqual(await getSubmissionEmails(), { ok: false, reason: "http", status: 403 });
  assert.equal(upstream.mock.callCount(), 2);
});

test("rejects malformed page envelopes and JSON", async () => {
  const upstream = mock.method(globalThis, "fetch", async () => Response.json({ data: [], hasMore: "false" }));
  assert.deepEqual(await getSubmissionEmails(), { ok: false, reason: "invalid_response" });
  upstream.mock.mockImplementation(async () => new Response("{"));
  assert.deepEqual(await getSubmissionEmails(), { ok: false, reason: "invalid_response" });
});

test("terminates repeated cursors rather than returning an incomplete count", async () => {
  const upstream = mock.method(globalThis, "fetch", async () => Response.json({
    data: [{ data: { email: "person@example.com" } }], hasMore: true, nextCursor: "repeated",
  }));
  assert.deepEqual(await getSubmissionEmails(), { ok: false, reason: "invalid_pagination" });
  assert.equal(upstream.mock.callCount(), 2);
});

test("rejects missing cursors or empty pages when more records are claimed", async () => {
  const upstream = mock.method(globalThis, "fetch", async () => Response.json({
    data: [{ data: { email: "person@example.com" } }], hasMore: true, nextCursor: null,
  }));
  assert.deepEqual(await getSubmissionEmails(), { ok: false, reason: "invalid_pagination" });
  upstream.mock.mockImplementation(async () => Response.json({ data: [], hasMore: true, nextCursor: "next" }));
  assert.deepEqual(await getSubmissionEmails(), { ok: false, reason: "invalid_pagination" });
});

test("handles network failures and a shared pagination deadline", async () => {
  const upstream = mock.method(globalThis, "fetch", async () => { throw new Error("Private network error"); });
  assert.deepEqual(await getSubmissionEmails(), { ok: false, reason: "network" });
  mock.method(AbortSignal, "timeout", () => AbortSignal.abort());
  assert.deepEqual(await getSubmissionEmails(), { ok: false, reason: "timeout" });
  assert.equal(upstream.mock.callCount(), 1);
});
