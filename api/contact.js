import nodemailer from "nodemailer";
import { isAllowedRequestOrigin } from "./_request-security.js";

const rateLimit = new Map();
const submissions = new Map();

const FORM_TYPES = new Set(["contact", "request-care", "career"]);
const SERVICE_NAMES = new Set([
  "Personal Care Assistance",
  "Companionship",
  "Meal Preparation",
  "Light Housekeeping",
  "Medication Reminders",
  "Respite Care",
  "Errands",
  "Not Sure",
]);
const RELATIONSHIPS = new Set(["Myself", "Parent", "Spouse", "Relative", "Friend", "Other"]);
const CONTACT_METHODS = new Set(["Phone", "Email", "Either"]);
const TRANSPORTATION_OPTIONS = new Set(["Yes", "No", "Prefer to discuss"]);
const EMPLOYMENT_PREFERENCES = new Set(["Full-time", "Part-time", "PRN / As needed", "Open to options"]);
const CAREER_ROLES = new Set(["Caregiver", "Personal Care Assistant", "Companion", "Other care role"]);
const CERTIFICATIONS = new Set(["CPR", "First Aid", "STNA / CNA", "Other"]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const IDEMPOTENCY_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;
export const MAX_RESUME_BYTES = 3 * 1024 * 1024;

const RESUME_TYPES = {
  ".pdf": {
    mime: "application/pdf",
    signature: (buffer) => buffer.subarray(0, 5).toString() === "%PDF-",
  },
  ".doc": {
    mime: "application/msword",
    signature: (buffer) => buffer.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])),
  },
  ".docx": {
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    signature: (buffer) => buffer.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]))
      && buffer.includes(Buffer.from("[Content_Types].xml"))
      && buffer.includes(Buffer.from("word/")),
  },
};

const FORM_DETAILS = {
  contact: {
    label: "Website Inquiry",
    subject: (name) => `[Unity & Hope] New Website Inquiry - ${name}`,
    confirmationSubject: "We Received Your Message - Unity & Hope Home Care",
    confirmationHeading: "We received your message",
    confirmationCopy: "Thank you for contacting Unity & Hope Home Care LLC. We received your information successfully. A member of our team will review your message and follow up with you.",
    callLabel: "Call Customer",
    emailLabel: "Reply by Email",
  },
  "request-care": {
    label: "Care Request",
    subject: (name) => `[Unity & Hope] New Care Request - ${name}`,
    confirmationSubject: "We Received Your Care Request - Unity & Hope Home Care",
    confirmationHeading: "We received your care request",
    confirmationCopy: "Thank you for contacting Unity & Hope Home Care LLC. We received your care request successfully. A member of our team will review the information and follow up with you.",
    callLabel: "Call Care Request",
    emailLabel: "Reply by Email",
  },
  career: {
    label: "Caregiver Application",
    subject: (name) => `[Unity & Hope] New Caregiver Application - ${name}`,
    confirmationSubject: "We Received Your Application - Unity & Hope Home Care",
    confirmationHeading: "We received your application",
    confirmationCopy: "Thank you for your interest in caregiving opportunities with Unity & Hope Home Care LLC. We received your application successfully and our team will review it.",
    callLabel: "Call Applicant",
    emailLabel: "Email Applicant",
  },
};

const FIELD_LABELS = {
  name: "Full Name",
  phone: "Phone",
  email: "Email",
  relationship: "Who Needs Care",
  services: "Services Interested In",
  schedule: "Preferred Schedule",
  startDate: "Preferred Start Date",
  location: "Address / City",
  contactMethod: "Preferred Contact Method",
  bestTime: "Best Time to Contact",
  city: "City",
  experience: "Caregiving Experience",
  availability: "Availability",
  transportation: "Transportation Access",
  roleInterest: "Role of Interest",
  employmentPreference: "Employment Preference",
  certifications: "Certifications",
  resume: "Resume",
  message: "Message",
};

const ALLOWED_KEYS = {
  contact: ["name", "phone", "email", "message"],
  "request-care": ["name", "phone", "email", "relationship", "services", "schedule", "startDate", "location", "contactMethod", "bestTime", "message"],
  career: ["name", "phone", "email", "city", "experience", "availability", "transportation", "roleInterest", "employmentPreference", "certifications", "resume", "message"],
};

const text = (value = "") => String(value).trim();

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const safeFilename = (value = "") => text(value)
  .replaceAll("\\", "/")
  .split("/")
  .pop()
  .split("")
  .filter((character) => {
    const code = character.charCodeAt(0);
    return code >= 32 && code !== 127;
  })
  .join("")
  .replace(/[^A-Za-z0-9._ -]/g, "_")
  .slice(0, 120);

const getExtension = (filename) => {
  const index = filename.lastIndexOf(".");
  return index >= 0 ? filename.slice(index).toLowerCase() : "";
};

const checkLength = (value, maximum, fieldName) => {
  if (text(value).length > maximum) return `${fieldName} is too long.`;
  return null;
};

const validateResume = (resume) => {
  if (!resume) return { value: null };
  if (typeof resume !== "object" || Array.isArray(resume)) return { error: "Please choose a valid resume file." };

  const filename = safeFilename(resume.name);
  const extension = getExtension(filename);
  const expected = RESUME_TYPES[extension];
  if (!filename || !expected || resume.type !== expected.mime) {
    return { error: "Resume must be a PDF, DOC or DOCX file." };
  }
  if (typeof resume.content !== "string"
    || resume.content.length % 4 !== 0
    || !/^[A-Za-z0-9+/]+={0,2}$/.test(resume.content)) {
    return { error: "The resume file could not be read. Please choose it again." };
  }

  const buffer = Buffer.from(resume.content, "base64");
  if (!buffer.length || buffer.length > MAX_RESUME_BYTES) return { error: "Resume must be 3 MB or smaller." };
  if (!expected.signature(buffer)) return { error: "The resume file type does not match its extension." };

  return {
    value: {
      filename,
      content: resume.content,
      contentType: expected.mime,
      size: buffer.length,
    },
  };
};

export const validateSubmission = (rawBody = {}, now = Date.now()) => {
  if (!rawBody || typeof rawBody !== "object" || Array.isArray(rawBody)) return { error: "Please send a valid form submission." };

  const formType = text(rawBody.formType);
  if (!FORM_TYPES.has(formType)) return { error: "Please choose a valid form type." };

  const startedAt = Number(rawBody.startedAt);
  const elapsed = now - startedAt;
  if (!Number.isFinite(elapsed) || elapsed < 1200 || elapsed > 172800000) {
    return { error: "Please refresh the page and try again." };
  }

  const idempotencyKey = text(rawBody.idempotencyKey);
  if (!IDEMPOTENCY_PATTERN.test(idempotencyKey)) return { error: "Please refresh the page and try again." };

  const name = text(rawBody.name);
  const phone = text(rawBody.phone);
  const email = text(rawBody.email).toLowerCase();
  const message = text(rawBody.message);
  if (!name || !phone || !email || !message || rawBody.consent !== true) {
    return { error: "Please complete all required fields and consent to contact." };
  }
  if (name.length < 2) return { error: "Please enter your full name." };
  if (!EMAIL_PATTERN.test(email) || email.length > 254) return { error: "Please enter a valid email address." };
  const phoneDigits = phone.replace(/\D/g, "");
  if (phoneDigits.length < 7 || phoneDigits.length > 15 || phone.length > 30) return { error: "Please enter a valid phone number." };
  if (message.length < 10) return { error: "Please add a little more detail to your message." };

  const lengthError = [
    checkLength(name, 120, "Full name"),
    checkLength(message, 5000, "Message"),
    checkLength(rawBody.location, 240, "Address or city"),
    checkLength(rawBody.city, 120, "City"),
    checkLength(rawBody.schedule, 200, "Preferred schedule"),
    checkLength(rawBody.bestTime, 120, "Best time to contact"),
    checkLength(rawBody.experience, 1000, "Caregiving experience"),
    checkLength(rawBody.availability, 500, "Availability"),
  ].find(Boolean);
  if (lengthError) return { error: lengthError };

  const data = { formType, name, phone, email, message };

  if (formType === "request-care") {
    const relationship = text(rawBody.relationship);
    if (!RELATIONSHIPS.has(relationship)) return { error: "Please tell us who needs care." };
    const services = Array.isArray(rawBody.services) ? [...new Set(rawBody.services.map(text).filter(Boolean))] : [];
    if (services.some((service) => !SERVICE_NAMES.has(service))) return { error: "Please choose services from the available list." };
    const contactMethod = text(rawBody.contactMethod);
    if (!CONTACT_METHODS.has(contactMethod)) return { error: "Please choose a preferred contact method." };
    const startDate = text(rawBody.startDate);
    if (startDate && !DATE_PATTERN.test(startDate)) return { error: "Please choose a valid preferred start date." };
    Object.assign(data, {
      relationship,
      services,
      schedule: text(rawBody.schedule),
      startDate,
      location: text(rawBody.location),
      contactMethod,
      bestTime: text(rawBody.bestTime),
    });
  }

  if (formType === "career") {
    const city = text(rawBody.city);
    const availability = text(rawBody.availability);
    const transportation = text(rawBody.transportation);
    const roleInterest = text(rawBody.roleInterest);
    const employmentPreference = text(rawBody.employmentPreference);
    if (!city || !availability) return { error: "Please complete the required career fields." };
    if (!TRANSPORTATION_OPTIONS.has(transportation)) return { error: "Please choose a transportation option." };
    if (!CAREER_ROLES.has(roleInterest)) return { error: "Please choose the role that interests you." };
    if (!EMPLOYMENT_PREFERENCES.has(employmentPreference)) return { error: "Please choose an employment preference." };
    const certifications = Array.isArray(rawBody.certifications) ? [...new Set(rawBody.certifications.map(text).filter(Boolean))] : [];
    if (certifications.some((item) => !CERTIFICATIONS.has(item))) return { error: "Please choose certifications from the available list." };
    const resumeResult = validateResume(rawBody.resume);
    if (resumeResult.error) return { error: resumeResult.error };
    Object.assign(data, {
      city,
      experience: text(rawBody.experience),
      availability,
      transportation,
      roleInterest,
      employmentPreference,
      certifications,
      resume: resumeResult.value,
    });
  }

  return { value: { data, idempotencyKey } };
};

const displayValue = (key, value) => {
  if (key === "resume" && value) return `${value.filename} (${(value.size / 1024 / 1024).toFixed(2)} MB)`;
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
};

const visibleEntries = (data) => ALLOWED_KEYS[data.formType]
  .filter((key) => data[key] !== "" && data[key] !== null && !(Array.isArray(data[key]) && data[key].length === 0))
  .map((key) => [FIELD_LABELS[key], displayValue(key, data[key])]);

const formatSubmittedAt = () => new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "America/New_York",
}).format(new Date());

export const createNotificationEmail = (data) => {
  const details = FORM_DETAILS[data.formType];
  const submittedAt = formatSubmittedAt();
  const entries = visibleEntries(data);
  const rows = entries.map(([key, value], index) => `
    <tr>
      <th style="width:34%;padding:14px 16px;text-align:left;vertical-align:top;border-bottom:1px solid #eadff1;background:${index % 2 ? "#ffffff" : "#fbf8fd"};color:#30105b;font-size:14px;line-height:1.5;">${escapeHtml(key)}</th>
      <td style="padding:14px 16px;border-bottom:1px solid #eadff1;background:${index % 2 ? "#ffffff" : "#fbf8fd"};color:#21182a;font-size:15px;line-height:1.6;overflow-wrap:anywhere;">${escapeHtml(value).replaceAll("\n", "<br>")}</td>
    </tr>`).join("");
  const plainDetails = entries.map(([key, value]) => `${key}: ${value}`).join("\n");
  const phoneHref = data.phone.replace(/[^+\d]/g, "");

  return {
    subject: details.subject(data.name),
    html: `<!doctype html>
<html lang="en"><body style="margin:0;padding:0;background:#f5f0f8;font-family:Arial,Helvetica,sans-serif;color:#21182a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0f8;"><tr><td align="center" style="padding:28px 14px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;background:#ffffff;border:1px solid #eadff1;border-radius:18px;overflow:hidden;">
      <tr><td style="padding:28px 30px;background:#30105b;border-bottom:5px solid #d59a19;color:#ffffff;">
        <div style="font-size:13px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#f4d58a;">Unity &amp; Hope Home Care LLC</div>
        <h1 style="margin:9px 0 4px;font-size:25px;line-height:1.25;color:#ffffff;">New ${escapeHtml(details.label)}</h1>
        <p style="margin:0;color:#eee5f5;font-size:14px;line-height:1.5;">Submitted ${escapeHtml(submittedAt)} ET</p>
      </td></tr>
      <tr><td style="padding:26px 30px 16px;">
        <p style="margin:0 0 18px;font-size:16px;line-height:1.6;">A new ${escapeHtml(details.label.toLowerCase())} was submitted through the Unity &amp; Hope website.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eadff1;border-radius:12px;border-collapse:separate;border-spacing:0;overflow:hidden;">${rows}</table>
      </td></tr>
      <tr><td style="padding:10px 30px 28px;">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td style="padding:0 10px 10px 0;"><a href="tel:${escapeHtml(phoneHref)}" style="display:inline-block;padding:12px 17px;border-radius:9px;background:#30105b;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;">${escapeHtml(details.callLabel)}</a></td>
          <td style="padding:0 0 10px;"><a href="mailto:${escapeHtml(data.email)}" style="display:inline-block;padding:11px 17px;border:1px solid #d59a19;border-radius:9px;color:#30105b;text-decoration:none;font-size:15px;font-weight:700;">${escapeHtml(details.emailLabel)}</a></td>
        </tr></table>
        <p style="margin:12px 0 0;color:#625968;font-size:12px;line-height:1.6;">Reply to this notification to respond directly to ${escapeHtml(data.email)}. Do not forward sensitive applicant or client information unnecessarily.</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`,
    text: `UNITY & HOPE HOME CARE LLC\nNEW ${details.label.toUpperCase()}\nSubmitted ${submittedAt} ET\n\n${plainDetails}\n\nReply to this email to contact ${data.name} at ${data.email}.`,
  };
};

export const createConfirmationEmail = (data) => {
  const details = FORM_DETAILS[data.formType];
  const firstName = data.name.split(/\s+/)[0] || data.name;
  return {
    subject: details.confirmationSubject,
    html: `<!doctype html>
<html lang="en"><body style="margin:0;padding:0;background:#f5f0f8;font-family:Arial,Helvetica,sans-serif;color:#21182a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0f8;"><tr><td align="center" style="padding:28px 14px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border:1px solid #eadff1;border-radius:18px;overflow:hidden;">
      <tr><td style="padding:28px 30px;background:#30105b;border-bottom:5px solid #d59a19;color:#ffffff;">
        <div style="font-size:13px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#f4d58a;">Unity &amp; Hope Home Care LLC</div>
        <h1 style="margin:9px 0 0;font-size:25px;line-height:1.25;color:#ffffff;">${escapeHtml(details.confirmationHeading)}</h1>
      </td></tr>
      <tr><td style="padding:30px;">
        <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">Hello ${escapeHtml(firstName)},</p>
        <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">${escapeHtml(details.confirmationCopy)}</p>
        <p style="margin:0 0 22px;font-size:16px;line-height:1.7;">For immediate questions, call <a href="tel:+19372219764" style="color:#461273;font-weight:700;">937-221-9764</a>.</p>
        <p style="margin:0;padding-top:20px;border-top:1px solid #eadff1;color:#625968;font-size:14px;line-height:1.7;">Unity &amp; Hope Home Care LLC<br>Compassion. Dignity. Care.</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`,
    text: `Hello ${firstName},\n\n${details.confirmationCopy}\n\nFor immediate questions, call 937-221-9764.\n\nUnity & Hope Home Care LLC\nCompassion. Dignity. Care.`,
  };
};

const createTransporter = ({ gmailUser, gmailAppPassword }) => nodemailer.createTransport({
  service: "gmail",
  auth: { user: gmailUser, pass: gmailAppPassword },
});

const pruneMaps = () => {
  const cutoff = Date.now() - 86400000;
  for (const [key, value] of submissions) if (value.createdAt < cutoff) submissions.delete(key);
  for (const [key, value] of rateLimit) if (value < cutoff) rateLimit.delete(key);
};

const safeMailError = (error) => ({
  code: typeof error?.code === "string" ? error.code : "UNKNOWN",
  responseCode: Number.isFinite(error?.responseCode) ? error.responseCode : undefined,
});

export default async function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed." });

  const origin = request.headers.origin;
  if (!isAllowedRequestOrigin(origin)) {
    return response.status(403).json({ error: "This request origin is not allowed." });
  }

  let body;
  try {
    body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : (request.body || {});
  } catch {
    return response.status(400).json({ error: "Please send a valid form submission." });
  }
  if (body.website) return response.status(200).json({ message: "Thank you. Your message has been received." });

  const validation = validateSubmission(body);
  if (validation.error) return response.status(400).json({ error: validation.error });
  const { data, idempotencyKey } = validation.value;

  const gmailUser = text(process.env.GMAIL_USER).toLowerCase();
  const gmailAppPassword = text(process.env.GMAIL_APP_PASSWORD).replaceAll(" ", "");
  const contactTo = text(process.env.CONTACT_TO_EMAIL).toLowerCase();
  if (!EMAIL_PATTERN.test(gmailUser) || !gmailAppPassword || !EMAIL_PATTERN.test(contactTo)) {
    return response.status(503).json({ error: "Online delivery is being configured. Please call 937-221-9764 or email uhhomehealthllc@gmail.com." });
  }

  pruneMaps();
  const priorSubmission = submissions.get(idempotencyKey);
  if (priorSubmission?.state === "complete") {
    return response.status(200).json({ message: "Thank you. We already received this submission." });
  }
  if (priorSubmission?.state === "sending") {
    return response.status(409).json({ error: "This submission is already being sent. Please wait a moment." });
  }

  const forwarded = request.headers["x-forwarded-for"];
  const clientKey = Array.isArray(forwarded) ? forwarded[0] : String(forwarded || "unknown").split(",")[0].trim();
  const lastRequest = rateLimit.get(clientKey) || 0;
  if (Date.now() - lastRequest < 30000) return response.status(429).json({ error: "Please wait a moment before sending another message." });
  rateLimit.set(clientKey, Date.now());
  submissions.set(idempotencyKey, { state: "sending", createdAt: Date.now() });

  const transporter = createTransporter({ gmailUser, gmailAppPassword });
  const notification = createNotificationEmail(data);
  const attachments = data.resume ? [{
    filename: data.resume.filename,
    content: Buffer.from(data.resume.content, "base64"),
    contentType: data.resume.contentType,
  }] : undefined;

  try {
    await transporter.sendMail({
      from: { name: "Unity & Hope Website", address: gmailUser },
      to: contactTo,
      replyTo: { name: data.name, address: data.email },
      subject: notification.subject,
      html: notification.html,
      text: notification.text,
      attachments,
      messageId: `<unity-hope-notification-${idempotencyKey}@uhhomehealth.com>`,
    });
    submissions.set(idempotencyKey, { state: "complete", createdAt: Date.now() });
  } catch (error) {
    submissions.delete(idempotencyKey);
    console.error("Business notification email failed", safeMailError(error));
    return response.status(502).json({ error: "We could not send your message. Please call 937-221-9764 or try again later." });
  }

  const confirmation = createConfirmationEmail(data);
  try {
    await transporter.sendMail({
      from: { name: "Unity & Hope Home Care LLC", address: gmailUser },
      to: data.email,
      replyTo: contactTo,
      subject: confirmation.subject,
      html: confirmation.html,
      text: confirmation.text,
      messageId: `<unity-hope-confirmation-${idempotencyKey}@uhhomehealth.com>`,
    });
  } catch (error) {
    console.error("Customer confirmation email failed", safeMailError(error));
  }

  return response.status(200).json({ message: "Thank you. Your submission was received successfully." });
}
