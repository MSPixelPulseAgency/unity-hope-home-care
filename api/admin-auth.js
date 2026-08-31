import {
  adminEmail,
  adminSiteUrl,
  allowPasswordResetRequest,
  authenticateAdminRequest,
  checkLoginRateLimit,
  clearLoginRate,
  clearSessionCookieHeader,
  consumePasswordReset,
  createAdminSession,
  createPasswordReset,
  destroyAdminSession,
  finishPasswordReset,
  isAllowedAdminOrigin,
  recordLoginFailure,
  sessionCookieHeader,
  setAdminPassword,
  validatePassword,
  verifyAdminPassword,
} from "./_admin-auth.js";
import {
  createMailTransporter,
  createPasswordResetEmail,
  getEmailConfig,
  safeMailError,
} from "./_email.js";
import { normalizeText } from "./_request-security.js";

const readBody = (request) => {
  if (typeof request.body === "string") return JSON.parse(request.body || "{}");
  return request.body && typeof request.body === "object" ? request.body : {};
};

const resetMessage = "If that email matches the configured owner, a reset link has been sent.";

const isAdminHost = (request) => {
  const host = String(request.headers.host || "").split(":")[0].toLowerCase();
  if (host === "localhost" || host === "127.0.0.1") return true;
  try {
    return host === new URL(adminSiteUrl()).hostname;
  } catch {
    return false;
  }
};

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store, max-age=0");
  response.setHeader("X-Content-Type-Options", "nosniff");
  if (!isAdminHost(request)) return response.status(404).json({ error: "Not found." });

  if (request.method === "GET") {
    const session = await authenticateAdminRequest(request).catch(() => null);
    if (!session) return response.status(401).json({ authenticated: false });
    return response.status(200).json({ authenticated: true, email: session.email, csrf: session.csrf, expiresAt: session.expiresAt });
  }

  if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed." });
  if (!isAllowedAdminOrigin(request.headers.origin)) return response.status(403).json({ error: "This request origin is not allowed." });

  let body;
  try {
    body = readBody(request);
  } catch {
    return response.status(400).json({ error: "Please send a valid request." });
  }
  const action = normalizeText(body.action);

  if (action === "login") {
    const email = normalizeText(body.email).toLowerCase();
    const rate = await checkLoginRateLimit(request, email);
    if (!rate.allowed) return response.status(429).json({ error: "Too many sign-in attempts. Please wait 15 minutes or reset the password." });
    const valid = await verifyAdminPassword(email, body.password).catch(() => false);
    if (!valid) {
      await recordLoginFailure(rate);
      return response.status(401).json({ error: "The email or password is incorrect." });
    }
    await clearLoginRate(rate);
    const session = await createAdminSession();
    response.setHeader("Set-Cookie", sessionCookieHeader(session.token));
    return response.status(200).json({ authenticated: true, email: session.email, csrf: session.csrf, expiresAt: session.expiresAt });
  }

  if (action === "logout") {
    const session = await authenticateAdminRequest(request, { csrf: true }).catch(() => null);
    if (!session) return response.status(401).json({ error: "Your session has expired." });
    await destroyAdminSession(request);
    response.setHeader("Set-Cookie", clearSessionCookieHeader());
    return response.status(200).json({ message: "You are signed out." });
  }

  if (action === "request-reset") {
    const email = normalizeText(body.email).toLowerCase();
    if (email === adminEmail() && await allowPasswordResetRequest(request, email)) {
      try {
        const config = getEmailConfig();
        const reset = await createPasswordReset();
        const resetUrl = `${adminSiteUrl()}/reset-password?token=${encodeURIComponent(reset.token)}`;
        const message = createPasswordResetEmail({ resetUrl });
        const transporter = createMailTransporter(config);
        await transporter.sendMail({
          from: { name: "Unity & Hope Admin", address: config.gmailUser },
          to: config.adminEmail,
          replyTo: config.adminEmail,
          subject: message.subject,
          html: message.html,
          text: message.text,
          messageId: `<unity-hope-admin-reset-${Date.now()}@uhhomehealth.com>`,
        });
      } catch (error) {
        console.error("Admin password reset email failed", safeMailError(error));
      }
    }
    return response.status(200).json({ message: resetMessage });
  }

  if (action === "reset-password") {
    const passwordError = validatePassword(body.password);
    if (passwordError) return response.status(400).json({ error: passwordError });
    const reset = await consumePasswordReset(body.token);
    if (!reset) return response.status(400).json({ error: "This reset link is invalid, expired or already used." });
    try {
      await setAdminPassword(body.password);
      await finishPasswordReset(reset);
      response.setHeader("Set-Cookie", clearSessionCookieHeader());
      return response.status(200).json({ message: "Your password has been updated. You can now sign in." });
    } catch {
      return response.status(503).json({ error: "The password could not be updated. Please request a new reset link." });
    }
  }

  return response.status(400).json({ error: "Unknown authentication action." });
}
