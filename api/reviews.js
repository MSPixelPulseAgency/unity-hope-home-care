import {
  createPendingReview,
  createReviewNotificationEmail,
  enforceReviewRateLimit,
  listApprovedReviews,
  removePendingReview,
  reviewSecret,
  validateReviewSubmission,
  withdrawReview,
} from "./_reviews.js";
import {
  isAllowedRequestOrigin,
  normalizeText,
  requestClientKey,
} from "./_request-security.js";
import { createMailTransporter, getEmailConfig, safeMailError } from "./_email.js";

const siteUrl = () => normalizeText(process.env.SITE_URL || "https://uhhomehealth.com").replace(/\/$/, "");

export default async function handler(request, response) {
  response.setHeader("X-Content-Type-Options", "nosniff");

  if (request.method === "GET") {
    try {
      const reviews = await listApprovedReviews();
      response.setHeader("Cache-Control", "no-store, max-age=0");
      return response.status(200).json({ reviews });
    } catch (error) {
      console.error("Approved reviews could not be loaded", { code: error?.name || "UNKNOWN" });
      return response.status(503).json({ error: "Reviews are temporarily unavailable." });
    }
  }

  if (request.method === "DELETE") {
    if (!isAllowedRequestOrigin(request.headers.origin)) return response.status(403).json({ error: "This request origin is not allowed." });
    let deleteBody;
    try {
      deleteBody = typeof request.body === "string" ? JSON.parse(request.body || "{}") : (request.body || {});
    } catch {
      return response.status(400).json({ error: "Please send a valid withdrawal request." });
    }
    const token = normalizeText(deleteBody.token);
    if (!token || !process.env.BLOB_READ_WRITE_TOKEN) return response.status(400).json({ error: "This withdrawal request is invalid." });
    try {
      const withdrawn = await withdrawReview({ token });
      if (withdrawn.error) return response.status(withdrawn.error === "expired" ? 410 : 400).json({ error: "This withdrawal link is invalid, expired or already used." });
      return response.status(200).json({ message: "The review was removed." });
    } catch (error) {
      console.error("Review withdrawal failed", { code: error?.name || "UNKNOWN" });
      return response.status(503).json({ error: "The review could not be removed. Please try again later." });
    }
  }

  if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed." });
  if (!isAllowedRequestOrigin(request.headers.origin)) return response.status(403).json({ error: "This request origin is not allowed." });

  let body;
  try {
    body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : (request.body || {});
  } catch {
    return response.status(400).json({ error: "Please send a valid review." });
  }

  if (body.website) return response.status(200).json({ message: "Thank you. Your review was received for approval." });

  const validation = validateReviewSubmission(body);
  if (validation.error) return response.status(400).json({ error: validation.error });

  let emailConfig;
  let secret;
  try {
    emailConfig = getEmailConfig();
    secret = reviewSecret();
  } catch {
    return response.status(503).json({ error: "Review delivery is being configured. Please try again later." });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return response.status(503).json({ error: "Review delivery is being configured. Please try again later." });
  }

  const allowed = await enforceReviewRateLimit({
    clientKey: requestClientKey(request),
    secret,
  });
  if (!allowed) return response.status(429).json({ error: "Please wait a minute before submitting another review." });

  const pending = await createPendingReview({ data: validation.value, secret });
  if (pending.duplicate) return response.status(200).json({ message: "Thank you. We already received this review for approval." });

  const baseUrl = siteUrl();
  const approveUrl = `${baseUrl}/api/review-moderate?action=approve&token=${encodeURIComponent(pending.approveToken)}`;
  const declineUrl = `${baseUrl}/api/review-moderate?action=decline&token=${encodeURIComponent(pending.declineToken)}`;
  const email = createReviewNotificationEmail({ review: pending.review, approveUrl, declineUrl });
  const transporter = createMailTransporter(emailConfig);

  try {
    await transporter.sendMail({
      from: { name: "Unity & Hope Website", address: emailConfig.gmailUser },
      to: emailConfig.adminEmail,
      replyTo: emailConfig.adminEmail,
      subject: email.subject,
      html: email.html,
      text: email.text,
      messageId: `<unity-hope-review-${pending.review.id}@uhhomehealth.com>`,
    });
  } catch (error) {
    await removePendingReview({ id: pending.review.id, etag: pending.etag }).catch(() => {});
    console.error("Review approval email failed", safeMailError(error));
    return response.status(502).json({ error: "We could not submit your review. Please try again later." });
  }

  return response.status(201).json({
    message: "Thank you. Your review was received and will remain private until it is approved.",
    withdrawalToken: pending.withdrawalToken,
  });
}
