import nodemailer from "nodemailer";
import {
  createPendingReview,
  createReviewNotificationEmail,
  enforceReviewRateLimit,
  listApprovedReviews,
  removePendingReview,
  reviewSecret,
  validateReviewSubmission,
} from "./_reviews.js";
import {
  isAllowedRequestOrigin,
  normalizeText,
  requestClientKey,
} from "./_request-security.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createTransporter = ({ gmailUser, gmailAppPassword }) => nodemailer.createTransport({
  service: "gmail",
  auth: { user: gmailUser, pass: gmailAppPassword },
});

const safeMailError = (error) => ({
  code: typeof error?.code === "string" ? error.code : "UNKNOWN",
  responseCode: Number.isFinite(error?.responseCode) ? error.responseCode : undefined,
});

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

  const gmailUser = normalizeText(process.env.GMAIL_USER).toLowerCase();
  const gmailAppPassword = normalizeText(process.env.GMAIL_APP_PASSWORD).replaceAll(" ", "");
  const contactTo = normalizeText(process.env.CONTACT_TO_EMAIL).toLowerCase();
  let secret;
  try {
    secret = reviewSecret();
  } catch {
    return response.status(503).json({ error: "Review delivery is being configured. Please try again later." });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN || !EMAIL_PATTERN.test(gmailUser) || !gmailAppPassword || !EMAIL_PATTERN.test(contactTo)) {
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
  const transporter = createTransporter({ gmailUser, gmailAppPassword });

  try {
    await transporter.sendMail({
      from: { name: "Unity & Hope Website", address: gmailUser },
      to: contactTo,
      replyTo: contactTo,
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

  return response.status(201).json({ message: "Thank you. Your review was received and will remain private until it is approved." });
}
