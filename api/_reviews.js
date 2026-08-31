import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import {
  BlobPreconditionFailedError,
  del,
  get,
  list,
  put,
} from "@vercel/blob";
import { escapeHtml, normalizeText } from "./_request-security.js";

export const REVIEW_RELATIONSHIPS = [
  "Client",
  "Family member",
  "Friend",
  "Caregiver",
  "Community member",
  "Other",
];

export const REVIEW_TOKEN_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;
export const REVIEW_RATE_LIMIT_MS = 60 * 1000;
const REVIEW_PREFIX = "reviews/";
const RATE_PREFIX = "review-rate/";
const REVIEW_ID_PATTERN = /^[a-f0-9]{32}$/;
const IDEMPOTENCY_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;
const TOKEN_PATTERN = /^[A-Za-z0-9._-]{80,500}$/;
const VALID_ACTIONS = new Set(["approve", "decline", "withdraw"]);

const removeControlCharacters = (value) => Array.from(value)
  .filter((character) => {
    const code = character.charCodeAt(0);
    return code === 9 || code === 10 || code === 13 || (code >= 32 && code !== 127);
  })
  .join("");

const cleanSingleLine = (value) => removeControlCharacters(normalizeText(value).normalize("NFKC"))
  .replace(/\s+/g, " ");

const cleanMultiline = (value) => removeControlCharacters(normalizeText(value).normalize("NFKC"))
  .replace(/\r\n?/g, "\n")
  .split("\n")
  .map((line) => line.replace(/[ \t]+/g, " ").trim())
  .join("\n")
  .replace(/\n{3,}/g, "\n\n");

export const sha256 = (value) => createHash("sha256").update(String(value)).digest("hex");

export const reviewSecret = () => {
  const secret = normalizeText(process.env.REVIEW_TOKEN_SECRET);
  if (secret.length < 32) throw new Error("Review moderation is not configured.");
  return secret;
};

const hmac = (secret, value) => createHmac("sha256", secret).update(value).digest("base64url");

export const createReviewId = (idempotencyKey, secret = reviewSecret()) => createHmac("sha256", secret)
  .update(`review:${idempotencyKey}`)
  .digest("hex")
  .slice(0, 32);

export const createModerationToken = ({ id, action, expiresAt, secret = reviewSecret(), nonce }) => {
  if (!REVIEW_ID_PATTERN.test(id) || !VALID_ACTIONS.has(action)) throw new Error("Invalid review token input.");
  const expiry = new Date(expiresAt).getTime();
  if (!Number.isFinite(expiry)) throw new Error("Invalid review token expiry.");
  const tokenNonce = nonce || randomBytes(24).toString("base64url");
  const payload = `${id}.${action}.${expiry}.${tokenNonce}`;
  return `${payload}.${hmac(secret, payload)}`;
};

export const parseModerationToken = ({ token, action, now = Date.now(), secret = reviewSecret() }) => {
  const rawToken = normalizeText(token);
  if (!TOKEN_PATTERN.test(rawToken) || !VALID_ACTIONS.has(action)) return { error: "invalid" };
  const parts = rawToken.split(".");
  if (parts.length !== 5) return { error: "invalid" };
  const [id, tokenAction, expiryText, nonce, signature] = parts;
  if (!REVIEW_ID_PATTERN.test(id) || tokenAction !== action || !nonce) return { error: "invalid" };
  const expiry = Number(expiryText);
  if (!Number.isFinite(expiry) || expiry <= now) return { error: "expired" };
  const payload = `${id}.${tokenAction}.${expiryText}.${nonce}`;
  const expected = hmac(secret, payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return { error: "invalid" };
  return { value: { id, action, expiresAt: new Date(expiry).toISOString(), tokenHash: sha256(rawToken) } };
};

export const validateReviewSubmission = (rawBody = {}, now = Date.now()) => {
  if (!rawBody || typeof rawBody !== "object" || Array.isArray(rawBody)) return { error: "Please send a valid review." };

  const startedAt = Number(rawBody.startedAt);
  const elapsed = now - startedAt;
  if (!Number.isFinite(elapsed) || elapsed < 1200 || elapsed > 172800000) {
    return { error: "Please refresh the page and try again." };
  }

  const idempotencyKey = cleanSingleLine(rawBody.idempotencyKey);
  if (!IDEMPOTENCY_PATTERN.test(idempotencyKey)) return { error: "Please refresh the page and try again." };

  const name = cleanSingleLine(rawBody.name);
  const relationship = cleanSingleLine(rawBody.relationship);
  const reviewText = cleanMultiline(rawBody.reviewText);
  const ratingValue = rawBody.rating === "" || rawBody.rating === null || rawBody.rating === undefined
    ? null
    : Number(rawBody.rating);

  if (name.length < 2 || name.length > 80) return { error: "Please enter your name." };
  if (!REVIEW_RELATIONSHIPS.includes(relationship)) return { error: "Please choose your relationship to Unity & Hope." };
  if (ratingValue !== null && (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5)) {
    return { error: "Please choose a rating from one to five stars, or leave it blank." };
  }
  if (reviewText.length < 20) return { error: "Please share at least a few sentences about your experience." };
  if (reviewText.length > 2000) return { error: "Please keep your review under 2,000 characters." };
  if (rawBody.consent !== true) return { error: "Please confirm that we may review and publish your feedback." };

  return {
    value: {
      idempotencyKey,
      name,
      relationship,
      rating: ratingValue,
      reviewText,
    },
  };
};

const reviewPath = (id) => `${REVIEW_PREFIX}${id}.json`;
const ratePath = (clientKey, secret) => `${RATE_PREFIX}${createHmac("sha256", secret).update(clientKey).digest("hex")}.json`;

const readJson = async (pathname) => {
  const result = await get(pathname, { access: "private", useCache: false });
  if (!result || result.statusCode !== 200 || !result.stream) return null;
  const raw = await new Response(result.stream).text();
  return { value: JSON.parse(raw), etag: result.blob.etag };
};

export const readReview = (id) => readJson(reviewPath(id));

export const enforceReviewRateLimit = async ({ clientKey, now = Date.now(), secret = reviewSecret() }) => {
  const pathname = ratePath(clientKey, secret);
  const current = await readJson(pathname);
  if (current && now - Number(current.value.lastSubmissionAt) < REVIEW_RATE_LIMIT_MS) return false;

  const body = JSON.stringify({ lastSubmissionAt: now });
  try {
    await put(pathname, body, {
      access: "private",
      contentType: "application/json",
      cacheControlMaxAge: 60,
      ...(current ? { allowOverwrite: true, ifMatch: current.etag } : {}),
    });
    return true;
  } catch (error) {
    const latest = await readJson(pathname).catch(() => null);
    if (latest && now - Number(latest.value.lastSubmissionAt) < REVIEW_RATE_LIMIT_MS) return false;
    if (error instanceof BlobPreconditionFailedError) return false;
    throw error;
  }
};

export const createPendingReview = async ({ data, now = Date.now(), secret = reviewSecret() }) => {
  const id = createReviewId(data.idempotencyKey, secret);
  const existing = await readReview(id);
  if (existing) return { duplicate: true, review: existing.value };

  const createdAt = new Date(now).toISOString();
  const tokenExpiresAt = new Date(now + REVIEW_TOKEN_LIFETIME_MS).toISOString();
  const approveToken = createModerationToken({ id, action: "approve", expiresAt: tokenExpiresAt, secret });
  const declineToken = createModerationToken({ id, action: "decline", expiresAt: tokenExpiresAt, secret });
  const withdrawalToken = createModerationToken({ id, action: "withdraw", expiresAt: tokenExpiresAt, secret });
  const review = {
    id,
    name: data.name,
    relationship: data.relationship,
    rating: data.rating,
    review_text: data.reviewText,
    consent: true,
    status: "pending",
    published: false,
    created_at: createdAt,
    approved_at: null,
    rejected_at: null,
    approval_token_hash: sha256(approveToken),
    rejection_token_hash: sha256(declineToken),
    withdrawal_token_hash: sha256(withdrawalToken),
    token_expires_at: tokenExpiresAt,
  };

  try {
    const result = await put(reviewPath(id), JSON.stringify(review), {
      access: "private",
      contentType: "application/json",
      cacheControlMaxAge: 60,
    });
    return { duplicate: false, review, etag: result.etag, approveToken, declineToken, withdrawalToken };
  } catch (error) {
    const duplicate = await readReview(id).catch(() => null);
    if (duplicate) return { duplicate: true, review: duplicate.value };
    throw error;
  }
};

export const removePendingReview = async ({ id, etag }) => {
  await del(reviewPath(id), { ifMatch: etag });
};

const publicReview = (review) => ({
  id: review.id,
  name: review.name,
  relationship: review.relationship,
  rating: review.rating,
  reviewText: review.review_text,
  approvedAt: review.approved_at,
});

export const listApprovedReviews = async () => {
  const blobs = [];
  let cursor;
  do {
    const page = await list({ prefix: REVIEW_PREFIX, limit: 500, cursor });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor && blobs.length < 1000);

  const records = await Promise.all(blobs.slice(0, 1000).map((blob) => readJson(blob.pathname).catch(() => null)));
  return records
    .map((record) => record?.value)
    .filter((review) => review?.status === "approved" && review.consent === true && review.published !== false)
    .sort((a, b) => String(b.approved_at).localeCompare(String(a.approved_at)))
    .slice(0, 24)
    .map(publicReview);
};

const adminReview = (review) => ({
  id: review.id,
  name: review.name,
  relationship: review.relationship,
  rating: review.rating,
  reviewText: review.review_text,
  consent: review.consent === true,
  status: review.status === "approved" && review.published === false ? "hidden" : review.status,
  published: review.status === "approved" && review.published !== false,
  createdAt: review.created_at,
  approvedAt: review.approved_at,
  rejectedAt: review.rejected_at,
  hiddenAt: review.hidden_at || null,
});

export const listAllReviews = async () => {
  const blobs = [];
  let cursor;
  do {
    const page = await list({ prefix: REVIEW_PREFIX, limit: 500, cursor });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor && blobs.length < 1000);
  const records = await Promise.all(blobs.slice(0, 1000).map((blob) => readJson(blob.pathname).catch(() => null)));
  return records
    .map((record) => record?.value)
    .filter((review) => review?.id)
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
    .map(adminReview);
};

export const adminModerateReview = async ({ id, action }) => {
  if (!REVIEW_ID_PATTERN.test(String(id)) || !new Set(["approve", "decline", "hide", "publish"]).has(action)) return null;
  const current = await readReview(id);
  if (!current) return null;
  const timestamp = new Date().toISOString();
  const approved = action === "approve" || action === "publish";
  const declined = action === "decline";
  const updated = {
    ...current.value,
    status: approved ? "approved" : (declined ? "rejected" : current.value.status),
    published: approved ? true : false,
    approved_at: approved ? (current.value.approved_at || timestamp) : current.value.approved_at,
    rejected_at: declined ? timestamp : current.value.rejected_at,
    hidden_at: action === "hide" ? timestamp : null,
    approval_token_hash: approved || declined ? null : current.value.approval_token_hash,
    rejection_token_hash: approved || declined ? null : current.value.rejection_token_hash,
  };
  try {
    await put(reviewPath(id), JSON.stringify(updated), {
      access: "private",
      contentType: "application/json",
      cacheControlMaxAge: 60,
      allowOverwrite: true,
      ifMatch: current.etag,
    });
    return adminReview(updated);
  } catch (error) {
    if (error instanceof BlobPreconditionFailedError) return null;
    throw error;
  }
};

export const adminDeleteReview = async (id) => {
  if (!REVIEW_ID_PATTERN.test(String(id))) return false;
  const current = await readReview(id);
  if (!current) return false;
  await del(reviewPath(id), { ifMatch: current.etag });
  return true;
};

const expectedTokenHash = (review, action) => (action === "approve"
  ? review.approval_token_hash
  : review.rejection_token_hash);

export const inspectModerationRequest = async ({ token, action, now = Date.now(), secret = reviewSecret() }) => {
  const parsed = parseModerationToken({ token, action, now, secret });
  if (parsed.error) return parsed;
  const stored = await readReview(parsed.value.id);
  if (!stored) return { error: "invalid" };
  const review = stored.value;
  if (review.status !== "pending") return { error: "used" };
  if (new Date(review.token_expires_at).getTime() <= now) return { error: "expired" };
  if (expectedTokenHash(review, action) !== parsed.value.tokenHash) return { error: "invalid" };
  return { value: { review, etag: stored.etag, tokenHash: parsed.value.tokenHash } };
};

export const moderateReview = async ({ token, action, now = Date.now(), secret = reviewSecret() }) => {
  const inspected = await inspectModerationRequest({ token, action, now, secret });
  if (inspected.error) return inspected;

  const timestamp = new Date(now).toISOString();
  const updated = {
    ...inspected.value.review,
    status: action === "approve" ? "approved" : "rejected",
    published: action === "approve",
    approved_at: action === "approve" ? timestamp : null,
    rejected_at: action === "decline" ? timestamp : null,
    approval_token_hash: null,
    rejection_token_hash: null,
  };

  try {
    await put(reviewPath(updated.id), JSON.stringify(updated), {
      access: "private",
      contentType: "application/json",
      cacheControlMaxAge: 60,
      allowOverwrite: true,
      ifMatch: inspected.value.etag,
    });
    return { value: updated };
  } catch (error) {
    if (error instanceof BlobPreconditionFailedError) return { error: "used" };
    throw error;
  }
};

export const withdrawReview = async ({ token, now = Date.now(), secret = reviewSecret() }) => {
  const parsed = parseModerationToken({ token, action: "withdraw", now, secret });
  if (parsed.error) return parsed;
  const stored = await readReview(parsed.value.id);
  if (!stored) return { error: "used" };
  if (new Date(stored.value.token_expires_at).getTime() <= now) return { error: "expired" };
  if (stored.value.withdrawal_token_hash !== parsed.value.tokenHash) return { error: "invalid" };

  try {
    await del(reviewPath(parsed.value.id), { ifMatch: stored.etag });
    return { value: { id: parsed.value.id } };
  } catch (error) {
    if (error instanceof BlobPreconditionFailedError) return { error: "used" };
    throw error;
  }
};

export const createReviewNotificationEmail = ({ review, approveUrl, declineUrl }) => {
  const rating = review.rating ? `${review.rating} out of 5 stars` : "Not provided";
  const reviewText = escapeHtml(review.review_text).replaceAll("\n", "<br>");
  return {
    subject: `[Unity & Hope] New Review Awaiting Approval - ${review.name}`,
    html: `<!doctype html>
<html lang="en"><body style="margin:0;padding:0;background:#f5f0f8;font-family:Arial,Helvetica,sans-serif;color:#21182a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0f8;"><tr><td align="center" style="padding:28px 14px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;background:#ffffff;border:1px solid #eadff1;border-radius:18px;overflow:hidden;">
      <tr><td style="padding:28px 30px;background:#30105b;border-bottom:5px solid #d59a19;color:#ffffff;">
        <div style="font-size:13px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#f4d58a;">Unity &amp; Hope Home Care LLC</div>
        <h1 style="margin:9px 0 4px;font-size:25px;line-height:1.25;color:#ffffff;">New Review Awaiting Approval</h1>
      </td></tr>
      <tr><td style="padding:28px 30px;">
        <p style="margin:0 0 18px;font-size:16px;line-height:1.7;">A visitor submitted feedback for review. It will remain private unless approved.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eadff1;border-radius:12px;border-collapse:separate;border-spacing:0;overflow:hidden;">
          <tr><th style="width:30%;padding:13px 15px;text-align:left;background:#fbf8fd;color:#30105b;">Name</th><td style="padding:13px 15px;">${escapeHtml(review.name)}</td></tr>
          <tr><th style="padding:13px 15px;text-align:left;background:#fbf8fd;color:#30105b;">Relationship</th><td style="padding:13px 15px;">${escapeHtml(review.relationship)}</td></tr>
          <tr><th style="padding:13px 15px;text-align:left;background:#fbf8fd;color:#30105b;">Rating</th><td style="padding:13px 15px;">${escapeHtml(rating)}</td></tr>
          <tr><th style="padding:13px 15px;text-align:left;vertical-align:top;background:#fbf8fd;color:#30105b;">Review</th><td style="padding:13px 15px;line-height:1.65;">${reviewText}</td></tr>
        </table>
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:24px;"><tr>
          <td style="padding:0 10px 10px 0;"><a href="${escapeHtml(approveUrl)}" style="display:inline-block;padding:13px 18px;border-radius:9px;background:#30105b;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;">Approve Review</a></td>
          <td style="padding:0 0 10px;"><a href="${escapeHtml(declineUrl)}" style="display:inline-block;padding:12px 18px;border:1px solid #a62121;border-radius:9px;color:#8d1c1c;text-decoration:none;font-size:15px;font-weight:700;">Decline Review</a></td>
        </tr></table>
        <p style="margin:12px 0 0;color:#625968;font-size:13px;line-height:1.6;">For safety, each link opens a confirmation page before changing the review. Links expire after 30 days and can be used only once.</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`,
    text: `UNITY & HOPE HOME CARE LLC\nNEW REVIEW AWAITING APPROVAL\n\nName: ${review.name}\nRelationship: ${review.relationship}\nRating: ${rating}\nReview: ${review.review_text}\n\nApprove Review: ${approveUrl}\n\nDecline Review: ${declineUrl}\n\nEach link opens a confirmation page. Links expire after 30 days and can be used only once.`,
  };
};
