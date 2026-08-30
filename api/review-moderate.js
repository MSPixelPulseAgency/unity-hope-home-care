import {
  inspectModerationRequest,
  moderateReview,
} from "./_reviews.js";
import { escapeHtml, normalizeText } from "./_request-security.js";

const responseHeaders = (response) => {
  response.setHeader("Content-Type", "text/html; charset=utf-8");
  response.setHeader("Cache-Control", "no-store, max-age=0");
  response.setHeader("Referrer-Policy", "no-referrer");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'");
};

const page = ({ title, heading, message, body = "", status = 200 }) => ({
  status,
  html: `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${escapeHtml(title)}</title>
<style>body{margin:0;background:#f8f4fb;color:#21182a;font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:1.7}.shell{min-height:100vh;display:grid;place-items:center;padding:24px}.card{width:min(680px,100%);box-sizing:border-box;padding:clamp(28px,6vw,52px);border:1px solid #eadff1;border-top:7px solid #d59a19;border-radius:22px;background:#fff;box-shadow:0 18px 48px rgba(48,16,91,.12)}.brand{margin:0 0 10px;color:#8a5700;font-size:14px;font-weight:700;letter-spacing:.09em;text-transform:uppercase}h1{margin:0 0 16px;color:#30105b;font-size:clamp(30px,6vw,44px);line-height:1.15}p{margin:0 0 18px}.review{margin:24px 0;padding:20px;border-left:5px solid #d59a19;border-radius:12px;background:#fff9ed}.actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:26px}.button{min-height:52px;display:inline-flex;align-items:center;justify-content:center;padding:12px 22px;border:2px solid #30105b;border-radius:10px;background:#30105b;color:#fff;font:inherit;font-weight:700;cursor:pointer;text-decoration:none}.button-decline{border-color:#a62121;background:#fff;color:#8d1c1c}.button:focus-visible{outline:4px solid #e3ac27;outline-offset:3px}.fine{color:#625968;font-size:16px}</style></head>
<body><main class="shell"><article class="card"><p class="brand">Unity &amp; Hope Home Care LLC</p><h1>${escapeHtml(heading)}</h1><p>${escapeHtml(message)}</p>${body}</article></main></body></html>`,
});

const invalidPage = (reason) => page({
  title: "Review Link Unavailable",
  heading: "This review link is unavailable.",
  message: reason === "expired"
    ? "For security, this approval link has expired. The review remains private."
    : "The link is invalid, has already been used, or the review was already processed. No review was changed.",
  body: '<p class="fine">You may close this page. Contact Unity &amp; Hope directly if you need help.</p>',
  status: reason === "expired" ? 410 : 400,
});

const readFormBody = (request) => {
  if (typeof request.body === "string") return Object.fromEntries(new URLSearchParams(request.body));
  return request.body && typeof request.body === "object" ? request.body : {};
};

export default async function handler(request, response) {
  responseHeaders(response);
  if (!new Set(["GET", "POST"]).has(request.method)) {
    const result = invalidPage("invalid");
    return response.status(405).send(result.html);
  }

  const body = request.method === "POST" ? readFormBody(request) : {};
  const action = normalizeText(request.method === "POST" ? body.action : request.query?.action);
  const token = normalizeText(request.method === "POST" ? body.token : request.query?.token);
  if (!new Set(["approve", "decline"]).has(action) || !token) {
    const result = invalidPage("invalid");
    return response.status(result.status).send(result.html);
  }

  try {
    if (request.method === "GET") {
      const inspected = await inspectModerationRequest({ token, action });
      if (inspected.error) {
        const result = invalidPage(inspected.error);
        return response.status(result.status).send(result.html);
      }

      const review = inspected.value.review;
      const rating = review.rating ? `${review.rating} out of 5 stars` : "No rating provided";
      const actionLabel = action === "approve" ? "Approve Review" : "Decline Review";
      const reviewBody = escapeHtml(review.review_text).replaceAll("\n", "<br>");
      const result = page({
        title: `Confirm ${actionLabel}`,
        heading: `Confirm ${actionLabel.toLowerCase()}`,
        message: action === "approve"
          ? "Approving will publish this review on the Unity & Hope website."
          : "Declining will keep this review private and prevent it from appearing publicly.",
        body: `<div class="review"><strong>${escapeHtml(review.name)}</strong><br><span>${escapeHtml(review.relationship)} · ${escapeHtml(rating)}</span><p>${reviewBody}</p></div><form method="post" action="/api/review-moderate"><input type="hidden" name="action" value="${escapeHtml(action)}"><input type="hidden" name="token" value="${escapeHtml(token)}"><div class="actions"><button class="button ${action === "decline" ? "button-decline" : ""}" type="submit">Confirm ${escapeHtml(actionLabel)}</button><a class="button button-decline" href="https://uhhomehealth.com/">Cancel</a></div></form><p class="fine">This confirmation step prevents automated email scanners from changing review status.</p>`,
      });
      return response.status(result.status).send(result.html);
    }

    const moderated = await moderateReview({ token, action });
    if (moderated.error) {
      const result = invalidPage(moderated.error);
      return response.status(result.status).send(result.html);
    }

    const approved = action === "approve";
    const result = page({
      title: approved ? "Review Approved" : "Review Declined",
      heading: approved ? "The review is approved." : "The review is declined.",
      message: approved
        ? "The approved review is now available to appear on the Unity & Hope website."
        : "The review remains private and will not appear on the website.",
      body: '<div class="actions"><a class="button" href="https://uhhomehealth.com/">Visit the website</a></div>',
    });
    return response.status(result.status).send(result.html);
  } catch (error) {
    console.error("Review moderation failed", { code: error?.name || "UNKNOWN" });
    const result = page({
      title: "Review Update Unavailable",
      heading: "We could not update this review.",
      message: "No review was changed. Please try again later or contact Unity & Hope directly.",
      status: 503,
    });
    return response.status(result.status).send(result.html);
  }
}
