import assert from "node:assert/strict";
import { test } from "node:test";

import { countUniqueEmails, getInterestMessage } from "./interest";

const milestones: Array<[number, string | null]> = [
  [0, null], [1, null], [29, null],
  [30, "30+ spirits are interested"], [31, "30+ spirits are interested"],
  [39, "30+ spirits are interested"], [40, "40+ spirits are interested"],
  [41, "40+ spirits are interested"], [49, "40+ spirits are interested"],
  [50, "50+ spirits are interested"], [58, "50+ spirits are interested"],
  [67, "60+ spirits are interested"], [99, "90+ spirits are interested"],
  [100, "100+ spirits are interested"], [103, "100+ spirits are interested"],
  [137, "130+ spirits are interested"], [204, "200+ spirits are interested"],
  [1057, "1050+ spirits are interested"],
];

for (const [count, message] of milestones) {
  test(`${count} unique emails produce ${message ?? "no message"}`, () => {
    const emails = Array.from({ length: count }, (_, index) => `person${index}@example.com`);
    assert.equal(getInterestMessage(emails), message);
  });
}

test("deduplicates identical, mixed-case and whitespace-padded email addresses", () => {
  assert.equal(countUniqueEmails([
    "person@example.com", "person@example.com", "Person@Example.com", "  person@example.com  ",
  ]), 1);
});

test("keeps plus tags, dots, and different domains distinct", () => {
  assert.equal(countUniqueEmails([
    "person@example.com", "person+guest@example.com", "per.son@example.com", "person@another.com",
  ]), 4);
});

test("ignores missing, non-string and invalid emails", () => {
  assert.equal(countUniqueEmails([
    undefined, null, "", "   ", "invalid", "person@", "person @example.com", 42,
    { email: "person@example.com" }, ["person@example.com"], true,
    `${"a".repeat(250)}@example.com`, "valid@example.com",
  ]), 1);
});

test("duplicates and malformed emails cannot cross a public milestone", () => {
  const emails: unknown[] = Array.from({ length: 29 }, (_, index) => `person${index}@example.com`);
  emails.push(" PERSON0@EXAMPLE.COM ", "person1@example.com", null, "invalid");
  assert.equal(getInterestMessage(emails), null);
  emails.push("new@example.com");
  assert.equal(getInterestMessage(emails), "30+ spirits are interested");
});
