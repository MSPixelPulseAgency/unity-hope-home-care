export const normalizeText = (value = "") => String(value ?? "").trim();

export const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

export const configuredOrigins = () => normalizeText(process.env.ALLOWED_ORIGIN)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const isAllowedRequestOrigin = (origin) => {
  if (!origin) return true;
  if (origin.startsWith("http://127.0.0.1") || origin.startsWith("http://localhost")) return true;
  const allowedOrigins = configuredOrigins();
  return !allowedOrigins.length || allowedOrigins.includes(origin);
};

export const requestClientKey = (request) => {
  const forwarded = request.headers["x-forwarded-for"];
  const address = Array.isArray(forwarded)
    ? forwarded[0]
    : String(forwarded || request.socket?.remoteAddress || "unknown").split(",")[0].trim();
  const userAgent = String(request.headers["user-agent"] || "unknown").slice(0, 300);
  return `${address}|${userAgent}`;
};
