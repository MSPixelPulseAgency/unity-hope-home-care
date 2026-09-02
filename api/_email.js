import nodemailer from "nodemailer";
import { escapeHtml, normalizeText } from "./_request-security.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const getEmailConfig = () => {
  const gmailUser = normalizeText(process.env.GMAIL_USER).toLowerCase();
  const gmailAppPassword = normalizeText(process.env.GMAIL_APP_PASSWORD).replaceAll(" ", "");
  const contactEmail = normalizeText(process.env.CONTACT_TO_EMAIL).toLowerCase();
  const adminEmail = normalizeText(process.env.ADMIN_EMAIL || contactEmail).toLowerCase();
  if (!EMAIL_PATTERN.test(gmailUser) || !gmailAppPassword || !EMAIL_PATTERN.test(contactEmail) || !EMAIL_PATTERN.test(adminEmail)) {
    throw new Error("Email delivery is not configured.");
  }
  return { gmailUser, gmailAppPassword, contactEmail, adminEmail };
};

export const createMailTransporter = ({ gmailUser, gmailAppPassword } = getEmailConfig()) => nodemailer.createTransport({
  service: "gmail",
  auth: { user: gmailUser, pass: gmailAppPassword },
});

export const safeMailError = (error) => ({
  code: typeof error?.code === "string" ? error.code : "UNKNOWN",
  responseCode: Number.isFinite(error?.responseCode) ? error.responseCode : undefined,
});

export const createPasswordResetEmail = ({ resetUrl }) => ({
  subject: "Reset Your Unity & Hope Admin Password",
  html: `<!doctype html><html lang="en"><body style="margin:0;background:#f5f0f8;font-family:Arial,Helvetica,sans-serif;color:#21182a"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:30px 16px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fff;border:1px solid #eadff1;border-radius:18px;overflow:hidden"><tr><td style="padding:28px 30px;background:#30105b;border-bottom:5px solid #d59a19;color:#fff"><div style="font-size:13px;font-weight:700;letter-spacing:1.3px;text-transform:uppercase;color:#f4d58a">Unity &amp; Hope Home Care LLC</div><h1 style="margin:9px 0 0;font-size:25px;line-height:1.3;color:#fff">Reset your admin password</h1></td></tr><tr><td style="padding:30px"><p style="margin:0 0 18px;font-size:16px;line-height:1.7">A password reset was requested for the Unity &amp; Hope website dashboard.</p><p style="margin:0 0 24px"><a href="${escapeHtml(resetUrl)}" style="display:inline-block;padding:14px 20px;border-radius:9px;background:#30105b;color:#fff;text-decoration:none;font-size:16px;font-weight:700">Choose a New Password</a></p><p style="margin:0;color:#625968;font-size:14px;line-height:1.6">This one-time link expires in 30 minutes. If you did not request it, no action is needed.</p></td></tr></table></td></tr></table></body></html>`,
  text: `RESET YOUR UNITY & HOPE ADMIN PASSWORD\n\nUse this one-time link within 30 minutes:\n${resetUrl}\n\nIf you did not request it, no action is needed.`,
});

export const createSubmissionReplyEmail = ({ name, subject, message, businessEmail = "uhhomehealthllc@gmail.com" }) => {
  const safeName = escapeHtml(normalizeText(name) || "there");
  const safeBusinessEmail = escapeHtml(normalizeText(businessEmail).toLowerCase());
  const safeSubject = normalizeText(subject).replace(/[\r\n]+/g, " ").slice(0, 160);
  const plainMessage = String(message ?? "").trim().slice(0, 5000);
  const htmlMessage = escapeHtml(plainMessage).replaceAll("\n", "<br />");
  return {
    subject: safeSubject,
    html: `<!doctype html><html lang="en"><body style="margin:0;background:#f5f0f8;font-family:Arial,Helvetica,sans-serif;color:#21182a"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:30px 16px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fff;border:1px solid #eadff1;border-radius:18px;overflow:hidden"><tr><td style="padding:28px 30px;background:#30105b;border-bottom:5px solid #d59a19;color:#fff"><div style="font-size:13px;font-weight:700;letter-spacing:1.3px;text-transform:uppercase;color:#f4d58a">Unity &amp; Hope Home Care LLC</div><h1 style="margin:9px 0 0;font-size:25px;line-height:1.3;color:#fff">A message from our care team</h1></td></tr><tr><td style="padding:30px"><p style="margin:0 0 18px;font-size:16px;line-height:1.7">Hello ${safeName},</p><div style="font-size:16px;line-height:1.75">${htmlMessage}</div><p style="margin:24px 0 0;color:#625968;font-size:14px;line-height:1.6">Unity &amp; Hope Home Care LLC<br />937-221-9764 · ${safeBusinessEmail}</p></td></tr></table></td></tr></table></body></html>`,
    text: `Hello ${normalizeText(name) || "there"},\n\n${plainMessage}\n\nUnity & Hope Home Care LLC\n937-221-9764\n${normalizeText(businessEmail).toLowerCase()}`,
  };
};
