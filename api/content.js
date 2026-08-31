import { loadManagedContent, publicManagedContent } from "./_cms.js";

export default async function handler(request, response) {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Cache-Control", "no-store, max-age=0");
  if (request.method !== "GET") return response.status(405).json({ error: "Method not allowed." });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return response.status(503).json({ error: "Managed content is temporarily unavailable." });

  try {
    const { content } = await loadManagedContent();
    return response.status(200).json({ content: publicManagedContent(content) });
  } catch (error) {
    console.error("Managed content could not be loaded", { code: error?.name || "UNKNOWN" });
    return response.status(503).json({ error: "Managed content is temporarily unavailable." });
  }
}
