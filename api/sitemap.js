import { loadManagedContent } from "./_cms.js";

const SITE_URL = "https://uhhomehealth.com";
const escapeXml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

const entry = (path, changefreq, priority, lastmod) => `  <url><loc>${escapeXml(new URL(path, SITE_URL).toString())}</loc>${lastmod ? `<lastmod>${escapeXml(lastmod)}</lastmod>` : ""}<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;

export default async function handler(request, response) {
  if (request.method !== "GET") return response.status(405).send("Method not allowed");
  try {
    const { content } = await loadManagedContent();
    const lastmod = /^\d{4}-\d{2}-\d{2}/.test(content.updatedAt || "") ? content.updatedAt.slice(0, 10) : "";
    const urls = [
      entry("/", "weekly", "1.0", lastmod),
      entry("/about", "monthly", "0.8", lastmod),
      entry("/services", "monthly", "0.9", lastmod),
      ...content.services.filter((service) => !service.hidden).map((service) => entry(`/services/${service.slug}`, "monthly", "0.8", lastmod)),
      entry("/service-areas", "monthly", "0.8", lastmod),
      entry("/request-care", "monthly", "0.9"),
      entry("/contact", "monthly", "0.8", lastmod),
      entry("/careers", "monthly", "0.6"),
      entry("/reviews", "weekly", "0.7"),
      entry("/resources", "weekly", "0.8", lastmod),
      ...content.resources.filter((resource) => resource.status === "published").map((resource) => entry(`/resources/${resource.slug}`, "monthly", "0.7", resource.updatedAt?.slice(0, 10) || resource.publishedDate)),
      entry("/privacy", "yearly", "0.3"),
    ];
    response.setHeader("Content-Type", "application/xml; charset=utf-8");
    response.setHeader("Cache-Control", "public, max-age=0, s-maxage=300, stale-while-revalidate=3600");
    return response.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`);
  } catch (error) {
    console.error("Sitemap generation failed", { code: error?.name || "UNKNOWN" });
    return response.status(503).send("Sitemap temporarily unavailable");
  }
}
