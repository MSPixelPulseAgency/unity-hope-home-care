import assert from "node:assert/strict";
import test from "node:test";
import {
  REVIEW_TOKEN_LIFETIME_MS,
  createModerationToken,
  createReviewId,
  createReviewNotificationEmail,
  parseModerationToken,
  validateReviewSubmission,
} from "../api/_reviews.js";

const now = Date.now();
const secret = "controlled-review-secret-that-is-long-enough-for-tests";

const baseReview = (overrides = {}) => ({
  idempotencyKey: "review_submission_12345",
  startedAt: now - 2500,
  name: "Family Member",
  relationship: "Family member",
  rating: "5",
  reviewText: "Unity and Hope treated our family with kindness and respect.",
  consent: true,
  ...overrides,
});

test("validates, normalizes and sanitizes a review submission", () => {
  const result = validateReviewSubmission(baseReview({
    name: "  Family\u0000   Member  ",
    reviewText: "  Unity and Hope treated our family with kindness.\n\n\n  We felt supported.  ",
  }), now);

  assert.equal(result.error, undefined);
  assert.equal(result.value.name, "Family Member");
  assert.equal(result.value.rating, 5);
  assert.equal(result.value.reviewText, "Unity and Hope treated our family with kindness.\n\nWe felt supported.");
});

test("rejects unapproved relationships, ratings, short text and missing consent", () => {
  assert.match(validateReviewSubmission(baseReview({ relationship: "Owner" }), now).error, /relationship/i);
  assert.match(validateReviewSubmission(baseReview({ rating: "6" }), now).error, /one to five/i);
  assert.match(validateReviewSubmission(baseReview({ reviewText: "Too short" }), now).error, /few sentences/i);
  assert.match(validateReviewSubmission(baseReview({ consent: false }), now).error, /publish/i);
});

test("creates deterministic private ids without exposing the submission key", () => {
  const id = createReviewId("review_submission_12345", secret);
  assert.match(id, /^[a-f0-9]{32}$/);
  assert.equal(id, createReviewId("review_submission_12345", secret));
  assert.notEqual(id, "review_submission_12345");
});

test("creates action-specific signed moderation tokens that expire safely", () => {
  const id = createReviewId("review_submission_12345", secret);
  const expiresAt = new Date(now + REVIEW_TOKEN_LIFETIME_MS).toISOString();
  const approveToken = createModerationToken({ id, action: "approve", expiresAt, secret, nonce: "controlled_nonce_for_token_tests" });

  const valid = parseModerationToken({ token: approveToken, action: "approve", now, secret });
  assert.equal(valid.error, undefined);
  assert.equal(valid.value.id, id);
  assert.equal(valid.value.action, "approve");
  assert.equal(parseModerationToken({ token: approveToken, action: "decline", now, secret }).error, "invalid");
  assert.equal(parseModerationToken({ token: `${approveToken}x`, action: "approve", now, secret }).error, "invalid");
  assert.equal(parseModerationToken({ token: approveToken, action: "approve", now: now + REVIEW_TOKEN_LIFETIME_MS + 1, secret }).error, "expired");

  const withdrawalToken = createModerationToken({ id, action: "withdraw", expiresAt, secret, nonce: "controlled_withdrawal_nonce" });
  assert.equal(parseModerationToken({ token: withdrawalToken, action: "withdraw", now, secret }).value.action, "withdraw");
  assert.equal(parseModerationToken({ token: withdrawalToken, action: "approve", now, secret }).error, "invalid");
});

test("builds branded review approval HTML and text without HTML injection", () => {
  const review = {
    name: "Family <Member>",
    relationship: "Family member",
    rating: 5,
    review_text: "Kind <script>alert(1)</script> care.",
  };
  const email = createReviewNotificationEmail({
    review,
    approveUrl: "https://uhhomehealth.com/api/review-moderate?action=approve&token=example",
    declineUrl: "https://uhhomehealth.com/api/review-moderate?action=decline&token=example",
  });

  assert.match(email.subject, /New Review Awaiting Approval/i);
  assert.match(email.html, /Approve Review/);
  assert.match(email.html, /Decline Review/);
  assert.doesNotMatch(email.html, /<script>/);
  assert.match(email.html, /&lt;script&gt;/);
  assert.match(email.text, /Approve Review:/);
  assert.match(email.text, /Decline Review:/);
});
