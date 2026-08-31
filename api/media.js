import { get, list } from "@vercel/blob";

const ID_PATTERN = /^[a-f0-9]{32}$/;

export default async function handler(request, response) {
  if (request.method !== "GET") return response.status(405).end();
  const id = String(request.query?.id || "");
  if (!ID_PATTERN.test(id)) return response.status(404).end();

  try {
    const matches = await list({ prefix: `cms/media/${id}.`, limit: 1 });
    const pathname = matches.blobs[0]?.pathname;
    if (!pathname) return response.status(404).end();
    const file = await get(pathname, { access: "private", useCache: true });
    if (!file || file.statusCode !== 200 || !file.stream) return response.status(404).end();
    response.setHeader("Content-Type", file.blob.contentType || "application/octet-stream");
    response.setHeader("Cache-Control", "public, max-age=86400, immutable");
    response.setHeader("X-Content-Type-Options", "nosniff");
    const chunks = [];
    for await (const chunk of file.stream) chunks.push(Buffer.from(chunk));
    return response.status(200).send(Buffer.concat(chunks));
  } catch {
    return response.status(404).end();
  }
}
