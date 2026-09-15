import assert from "node:assert/strict";
import { test } from "node:test";

import { registrationResultSchema, registrationSchema } from "./registration-schema";

test("accepts a valid registration", () => {
  const registration = { fullName: "Aoife O’Neill", email: "aoife@example.com" };
  assert.deepEqual(registrationSchema.parse(registration), registration);
});

test("accepts international and single-word names", () => {
  for (const fullName of ["李明", "José García", "Prince", "محمد"]) {
    assert.equal(registrationSchema.safeParse({ fullName, email: "guest@example.com" }).success, true);
  }
});

test("rejects missing, blank, non-text, numeric and control-character names", () => {
  for (const fullName of [undefined, "", "   ", 42, "1234", "---", "Aoife\nO’Neill"]) {
    assert.equal(registrationSchema.safeParse({ fullName, email: "guest@example.com" }).success, false);
  }
});

test("rejects missing and invalid emails", () => {
  for (const email of [undefined, "", "  ", "guest", "guest@", "guest @example.com"]) {
    assert.equal(registrationSchema.safeParse({ fullName: "Aoife O’Neill", email }).success, false);
  }
});

test("trims both fields and lowercases email without removing dots or plus tags", () => {
  assert.deepEqual(registrationSchema.parse({
    fullName: "  Aoife  O’Neill  ",
    email: "  Aoife.ONeill+Party@Example.COM  ",
  }), { fullName: "Aoife  O’Neill", email: "aoife.oneill+party@example.com" });
});

test("limits field lengths and strips unrecognized fields", () => {
  const registration = { fullName: "Aoife", email: "guest@example.com" };
  assert.equal(registrationSchema.safeParse({ ...registration, fullName: "A".repeat(121) }).success, false);
  assert.equal(registrationSchema.safeParse({ ...registration, email: `${"a".repeat(250)}@example.com` }).success, false);
  assert.deepEqual(registrationSchema.parse({ ...registration, _replyto: "other@example.com" }), registration);
});

test("rejects malformed API responses including empty error messages", () => {
  for (const response of [null, {}, { ok: "true" }, { ok: false }, { ok: false, message: "   " }, {
    ok: false, message: "Try again.", fieldErrors: { email: "Invalid email" },
  }]) {
    assert.equal(registrationResultSchema.safeParse(response).success, false);
  }
  assert.deepEqual(registrationResultSchema.parse({ ok: true }), { ok: true });
});
