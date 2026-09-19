import assert from "node:assert/strict";
import { test } from "node:test";

import { registrationReducer, type RegistrationState } from "./registration-state";
import type { RegistrationResult } from "./registration-schema";

const acceptedResponse = {
  type: "response",
  result: { ok: true },
  httpOk: true,
  reducedMotion: false,
  contentHeight: 184,
} as const;

test("stays pending until a successful API response starts the animation", () => {
  const pending = registrationReducer({ status: "idle" }, { type: "submit" });
  assert.deepEqual(pending, { status: "submitting" });
  assert.deepEqual(registrationReducer(pending, { type: "animation-finished" }), pending);
  assert.deepEqual(registrationReducer(pending, acceptedResponse), { status: "animating-success", contentHeight: 184 });
});

test("settles after the animation and retains the measured registration-area height", () => {
  const animating = registrationReducer({ status: "submitting" }, acceptedResponse);
  const final = registrationReducer(animating, { type: "animation-finished" });
  assert.deepEqual(final, { status: "success", contentHeight: 184 });
  assert.deepEqual(registrationReducer(final, { type: "submit" }), final);
  assert.deepEqual(registrationReducer(final, { type: "failed" }), final);
});

test("reduced motion goes directly from a successful response to the final state", () => {
  assert.deepEqual(registrationReducer({ status: "submitting" }, {
    ...acceptedResponse, reducedMotion: true,
  }), { status: "success", contentHeight: 184 });
});

test("a recognized registration shows confirmation without replaying the animation", () => {
  const response = { ...acceptedResponse, result: { ok: true, alreadyRegistered: true } } as const;
  assert.deepEqual(registrationReducer({ status: "submitting" }, response), { status: "success", contentHeight: 184 });
  assert.equal(registrationReducer({ status: "submitting" }, { ...response, httpOk: false }).status, "error");
});

test("validation failure retains field errors and allows retry without animation", () => {
  const result = {
    ok: false, message: "Check your email.", fieldErrors: { email: ["Enter a valid email address."] },
  } satisfies RegistrationResult;
  const failed = registrationReducer({ status: "submitting" }, { ...acceptedResponse, result, httpOk: false });
  assert.deepEqual(failed, { status: "error", error: result });
  assert.deepEqual(registrationReducer(failed, { type: "animation-finished" }), failed);
  assert.deepEqual(registrationReducer(failed, { type: "submit" }), { status: "submitting" });
});

test("HTTP failure or an unsuccessful result cannot trigger success", () => {
  assert.equal(registrationReducer({ status: "submitting" }, { ...acceptedResponse, httpOk: false }).status, "error");
  assert.equal(registrationReducer({ status: "submitting" }, {
    ...acceptedResponse, result: { ok: false, message: "Try again." },
  }).status, "error");
  assert.equal(registrationReducer({ status: "submitting" }, { type: "failed" }).status, "error");
});

test("responses outside a pending request cannot replay the success sequence", () => {
  const states: RegistrationState[] = [
    { status: "idle" }, { status: "error", error: { ok: false, message: "Try again." } },
    { status: "animating-success", contentHeight: 184 }, { status: "success", contentHeight: 184 },
  ];
  for (const state of states) assert.deepEqual(registrationReducer(state, acceptedResponse), state);
});
