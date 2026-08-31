import {
  BlobPreconditionFailedError,
  del,
  get,
  list,
  put,
} from "@vercel/blob";

export { BlobPreconditionFailedError };

export const readPrivateJson = async (pathname) => {
  const result = await get(pathname, { access: "private", useCache: false });
  if (!result || result.statusCode !== 200 || !result.stream) return null;
  const raw = await new Response(result.stream).text();
  return { value: JSON.parse(raw), etag: result.blob.etag, blob: result.blob };
};

export const writePrivateJson = async (pathname, value, current = null) => {
  const result = await put(pathname, JSON.stringify(value), {
    access: "private",
    contentType: "application/json",
    cacheControlMaxAge: 60,
    ...(current ? { allowOverwrite: true, ifMatch: current.etag } : {}),
  });
  return { value, etag: result.etag, blob: result };
};

export const deletePrivatePath = async (pathname, options = {}) => del(pathname, options);

export const listPrivateJson = async (prefix, maximum = 1000) => {
  const blobs = [];
  let cursor;
  do {
    const page = await list({ prefix, limit: Math.min(500, maximum - blobs.length), cursor });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor && blobs.length < maximum);

  return Promise.all(blobs.map((blob) => readPrivateJson(blob.pathname).catch(() => null)));
};
