const rateLimit = new Map();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sanitize = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const label = (key) => ({
  formType: "Form Type",
  name: "Name",
  phone: "Phone",
  email: "Email",
  relationship: "Who Needs Care",
  services: "Services",
  schedule: "Preferred Schedule",
  startDate: "Preferred Start Date",
  location: "Address / City",
  city: "City",
  experience: "Caregiving Experience",
  availability: "Availability",
  transportation: "Transportation Access",
  message: "Message",
}[key] || key);

export default async function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed." });

  const allowedOrigin = process.env.ALLOWED_ORIGIN;
  const origin = request.headers.origin;
  if (allowedOrigin && origin && origin !== allowedOrigin && !origin.startsWith("http://127.0.0.1") && !origin.startsWith("http://localhost")) {
    return response.status(403).json({ error: "This request origin is not allowed." });
  }

  let body;
  try {
    body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : (request.body || {});
  } catch {
    return response.status(400).json({ error: "Please send a valid form submission." });
  }
  if (body.website) return response.status(200).json({ message: "Thank you. Your message has been received." });

  const elapsed = Date.now() - Number(body.startedAt || 0);
  if (!Number.isFinite(elapsed) || elapsed < 1200 || elapsed > 172800000) {
    return response.status(400).json({ error: "Please refresh the page and try again." });
  }

  if (!body.name?.trim() || !body.phone?.trim() || !body.email?.trim() || !body.message?.trim() || body.consent !== true) {
    return response.status(400).json({ error: "Please complete all required fields and consent to contact." });
  }
  if (!emailPattern.test(body.email) || body.name.length > 120 || body.message.length > 5000) {
    return response.status(400).json({ error: "Please check the email address and message length." });
  }
  if (body.formType === "request-care" && !body.relationship) {
    return response.status(400).json({ error: "Please tell us who needs care." });
  }
  if (body.formType === "career" && (!body.city || !body.availability || !body.transportation)) {
    return response.status(400).json({ error: "Please complete the required career fields." });
  }

  const forwarded = request.headers["x-forwarded-for"];
  const clientKey = Array.isArray(forwarded) ? forwarded[0] : String(forwarded || "unknown").split(",")[0].trim();
  const lastRequest = rateLimit.get(clientKey) || 0;
  if (Date.now() - lastRequest < 30000) return response.status(429).json({ error: "Please wait a moment before sending another message." });
  rateLimit.set(clientKey, Date.now());

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL || "uhhomehealthllc@gmail.com";
  if (!apiKey || !from) {
    return response.status(503).json({ error: "Online delivery is being configured. Please call 937-221-9764 or email uhhomehealthllc@gmail.com." });
  }

  const typeNames = { "request-care": "Care Request", career: "Caregiver Application", contact: "Website Contact" };
  const subject = `[Unity & Hope] ${typeNames[body.formType] || "Website Inquiry"} from ${body.name}`;
  const excluded = new Set(["website", "consent", "startedAt"]);
  const rows = Object.entries(body)
    .filter(([key, value]) => !excluded.has(key) && value !== "" && !(Array.isArray(value) && value.length === 0))
    .map(([key, value]) => `<tr><th style="padding:10px;text-align:left;border-bottom:1px solid #eadff2;vertical-align:top">${sanitize(label(key))}</th><td style="padding:10px;border-bottom:1px solid #eadff2">${sanitize(Array.isArray(value) ? value.join(", ") : value).replaceAll("\n", "<br>")}</td></tr>`)
    .join("");

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: body.email,
      subject,
      html: `<div style="font-family:Arial,sans-serif;max-width:720px;margin:auto;color:#21182a"><div style="background:#30105b;color:white;padding:22px 26px"><h1 style="margin:0;font-size:24px">Unity & Hope Home Care LLC</h1></div><table style="width:100%;border-collapse:collapse">${rows}</table><p style="font-size:12px;color:#655e6b">Submitted through unityhope.vercel.app. Reply directly to contact ${sanitize(body.name)}.</p></div>`,
    }),
  });

  if (!resendResponse.ok) {
    console.error("Resend delivery failed", resendResponse.status, await resendResponse.text());
    return response.status(502).json({ error: "We could not send your message. Please call 937-221-9764 or try again later." });
  }

  return response.status(200).json({ message: "Thank you. Your message was sent successfully, and Unity & Hope will follow up soon." });
}
