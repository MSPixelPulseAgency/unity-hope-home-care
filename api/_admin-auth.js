import {
  createHash,
  createHmac,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import {
  BlobPreconditionFailedError,
  deletePrivatePath,
  listPrivateJson,
  readPrivateJson,
  writePrivateJson,
} from "./_blob-json.js";
import { normalizeText, requestClientKey } from "./_request-security.js";

const scrypt = promisify(scryptCallback);
const AUTH_PATH = "admin/auth.json";
const SESSION_PREFIX = "admin/sessions/";
const RATE_PREFIX = "admin/login-rate/";
const RESET_RATE_PREFIX = "admin/reset-rate/";
const RESET_PREFIX = "admin/password-resets/";
const SESSION_COOKIE = "unityhope_admin_session";
const SESSION_LIFETIME_MS = 8 * 60 * 60 * 1000;
const RESET_LIFETIME_MS = 30 * 60 * 1000;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 6;

const sha256 = (value) => createHash("sha256").update(String(value)).digest("hex");
const base64url = (value) => Buffer.from(value).toString("base64url");
const hmac = (value, secret = sessionSecret()) => createHmac("sha256", secret).update(value).digest("base64url");

const equal = (left, right) => {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
};

export const adminEmail = () => normalizeText(process.env.ADMIN_EMAIL || process.env.CONTACT_TO_EMAIL).toLowerCase();
export const adminSiteUrl = () => normalizeText(process.env.ADMIN_ORIGIN || "https://admin.uhhomehealth.com").replace(/\/$/, "");

export const sessionSecret = () => {
  const secret = normalizeText(process.env.ADMIN_SESSION_SECRET);
  if (secret.length < 32) throw new Error("Admin sessions are not configured.");
  return secret;
};

export const isAllowedAdminOrigin = (origin) => {
  if (!origin) return false;
  if (origin.startsWith("http://127.0.0.1") || origin.startsWith("http://localhost")) return true;
  return origin === adminSiteUrl();
};

const parseCookies = (header = "") => Object.fromEntries(String(header).split(";")
  .map((part) => part.trim())
  .filter(Boolean)
  .map((part) => {
    const index = part.indexOf("=");
    return index < 0 ? [part, ""] : [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
  }));

export const sessionCookieHeader = (token, maximumAge = Math.floor(SESSION_LIFETIME_MS / 1000)) => [
  `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
  "Path=/",
  "HttpOnly",
  "Secure",
  "SameSite=Strict",
  `Max-Age=${maximumAge}`,
].join("; ");

export const clearSessionCookieHeader = () => sessionCookieHeader("", 0);

export const validatePassword = (password) => {
  const value = String(password || "");
  if (value.length < 14 || value.length > 128) return "Use at least 14 characters.";
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value) || !/[^A-Za-z0-9]/.test(value)) {
    return "Include a letter, number and symbol.";
  }
  return null;
};

export const createPasswordRecord = async (password, email = adminEmail()) => {
  const salt = randomBytes(24).toString("base64url");
  const derived = await scrypt(String(password), salt, 64);
  return {
    version: 1,
    email,
    salt,
    hash: Buffer.from(derived).toString("base64url"),
    updatedAt: new Date().toISOString(),
  };
};

export const encodePasswordRecord = (record) => `scrypt:${record.salt}:${record.hash}`;

const envPasswordRecord = () => {
  const encoded = normalizeText(process.env.ADMIN_PASSWORD_HASH);
  const [algorithm, salt, hash] = encoded.split(":");
  if (algorithm !== "scrypt" || !salt || !hash) return null;
  return { version: 1, email: adminEmail(), salt, hash, source: "environment" };
};

export const readPasswordRecord = async () => {
  const stored = await readPrivateJson(AUTH_PATH);
  return stored?.value || envPasswordRecord();
};

export const verifyAdminPassword = async (email, password) => {
  const expectedEmail = adminEmail();
  if (!expectedEmail || !equal(normalizeText(email).toLowerCase(), expectedEmail)) return false;
  const record = await readPasswordRecord();
  if (!record?.salt || !record?.hash) return false;
  const derived = await scrypt(String(password || ""), record.salt, 64);
  return equal(Buffer.from(derived).toString("base64url"), record.hash);
};

const revokeAllSessions = async () => {
  const sessions = await listPrivateJson(SESSION_PREFIX, 500);
  const paths = sessions.map((session) => session?.blob?.pathname).filter(Boolean);
  if (paths.length) await deletePrivatePath(paths);
};

export const setAdminPassword = async (password) => {
  const error = validatePassword(password);
  if (error) throw new Error(error);
  const current = await readPrivateJson(AUTH_PATH);
  const record = await createPasswordRecord(password);
  await writePrivateJson(AUTH_PATH, record, current);
  await revokeAllSessions();
  return record;
};

const sessionPath = (sid) => `${SESSION_PREFIX}${sha256(sid)}.json`;

export const createAdminSession = async () => {
  const sid = randomBytes(32).toString("base64url");
  const csrf = randomBytes(24).toString("base64url");
  const expiresAt = Date.now() + SESSION_LIFETIME_MS;
  const payload = { sid, csrf, email: adminEmail(), expiresAt };
  const encoded = base64url(JSON.stringify(payload));
  const token = `${encoded}.${hmac(encoded)}`;
  await writePrivateJson(sessionPath(sid), {
    sidHash: sha256(sid),
    email: payload.email,
    csrfHash: sha256(csrf),
    createdAt: new Date().toISOString(),
    expiresAt: new Date(expiresAt).toISOString(),
  });
  return { token, csrf, email: payload.email, expiresAt };
};

const parseSessionToken = (token) => {
  const [encoded, signature, ...rest] = String(token || "").split(".");
  if (!encoded || !signature || rest.length || !equal(signature, hmac(encoded))) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (!payload.sid || !payload.csrf || !payload.email || !Number.isFinite(payload.expiresAt)) return null;
    if (payload.expiresAt <= Date.now() || payload.email !== adminEmail()) return null;
    return payload;
  } catch {
    return null;
  }
};

export const authenticateAdminRequest = async (request, { csrf = false } = {}) => {
  let secretReady = true;
  try {
    sessionSecret();
  } catch {
    secretReady = false;
  }
  if (!secretReady) return null;
  const cookie = parseCookies(request.headers.cookie || "")[SESSION_COOKIE];
  const payload = parseSessionToken(cookie);
  if (!payload) return null;
  const stored = await readPrivateJson(sessionPath(payload.sid));
  if (!stored?.value || stored.value.expiresAt <= new Date().toISOString()) return null;
  if (stored.value.sidHash !== sha256(payload.sid) || stored.value.csrfHash !== sha256(payload.csrf)) return null;
  if (csrf) {
    const supplied = normalizeText(request.headers["x-csrf-token"]);
    if (!supplied || !equal(supplied, payload.csrf)) return null;
  }
  return { ...payload, sessionPath: sessionPath(payload.sid) };
};

export const destroyAdminSession = async (request) => {
  const session = await authenticateAdminRequest(request).catch(() => null);
  if (session) await deletePrivatePath(session.sessionPath).catch(() => {});
};

const ratePath = (prefix, request, email) => `${prefix}${hmac(`${requestClientKey(request)}|${normalizeText(email).toLowerCase()}`).slice(0, 48)}.json`;

export const checkLoginRateLimit = async (request, email) => {
  const pathname = ratePath(RATE_PREFIX, request, email);
  const current = await readPrivateJson(pathname);
  const now = Date.now();
  const windowStartedAt = Number(current?.value?.windowStartedAt || 0);
  const attempts = now - windowStartedAt < LOGIN_WINDOW_MS ? Number(current?.value?.attempts || 0) : 0;
  return { allowed: attempts < LOGIN_MAX_ATTEMPTS, pathname, current, attempts, windowStartedAt: attempts ? windowStartedAt : now };
};

export const recordLoginFailure = async (rate) => {
  const value = { attempts: rate.attempts + 1, windowStartedAt: rate.windowStartedAt, updatedAt: Date.now() };
  try {
    await writePrivateJson(rate.pathname, value, rate.current);
  } catch (error) {
    if (!(error instanceof BlobPreconditionFailedError)) throw error;
  }
};

export const clearLoginRate = async (rate) => {
  if (rate.current) await deletePrivatePath(rate.pathname, { ifMatch: rate.current.etag }).catch(() => {});
};

export const allowPasswordResetRequest = async (request, email) => {
  const pathname = ratePath(RESET_RATE_PREFIX, request, email);
  const current = await readPrivateJson(pathname);
  const lastSentAt = Number(current?.value?.lastSentAt || 0);
  if (Date.now() - lastSentAt < 10 * 60 * 1000) return false;
  await writePrivateJson(pathname, { lastSentAt: Date.now() }, current);
  return true;
};

export const createPasswordReset = async () => {
  const token = randomBytes(32).toString("base64url");
  const pathname = `${RESET_PREFIX}${sha256(token)}.json`;
  await writePrivateJson(pathname, {
    email: adminEmail(),
    tokenHash: sha256(token),
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + RESET_LIFETIME_MS).toISOString(),
    usedAt: null,
  });
  return { token, pathname };
};

export const consumePasswordReset = async (token) => {
  const tokenHash = sha256(normalizeText(token));
  const pathname = `${RESET_PREFIX}${tokenHash}.json`;
  const current = await readPrivateJson(pathname);
  if (!current?.value || current.value.usedAt || current.value.tokenHash !== tokenHash) return null;
  if (current.value.expiresAt <= new Date().toISOString() || current.value.email !== adminEmail()) return null;
  try {
    await writePrivateJson(pathname, { ...current.value, usedAt: new Date().toISOString() }, current);
  } catch (error) {
    if (error instanceof BlobPreconditionFailedError) return null;
    throw error;
  }
  return { pathname };
};

export const finishPasswordReset = async (reset) => {
  if (reset?.pathname) await deletePrivatePath(reset.pathname).catch(() => {});
};
