import test from "node:test";
import assert from "node:assert/strict";
import {
  createPasswordRecord,
  encodePasswordRecord,
  validatePassword,
} from "../api/_admin-auth.js";

test("requires a long admin password with mixed character classes", () => {
  assert.match(validatePassword("short"), /14 characters/);
  assert.match(validatePassword("onlylettersarehere"), /letter, number and symbol/);
  assert.equal(validatePassword("CareWithDignity!2026"), null);
});

test("creates a salted scrypt password record without storing plaintext", async () => {
  const password = "CareWithDignity!2026";
  const first = await createPasswordRecord(password, "owner@example.com");
  const second = await createPasswordRecord(password, "owner@example.com");

  assert.equal(first.email, "owner@example.com");
  assert.notEqual(first.salt, second.salt);
  assert.notEqual(first.hash, second.hash);
  assert.ok(!JSON.stringify(first).includes(password));
  assert.match(encodePasswordRecord(first), /^scrypt:[A-Za-z0-9_-]+:[A-Za-z0-9_-]+$/);
});
