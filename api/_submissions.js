import { createHmac } from "node:crypto";
import { del, get, put } from "@vercel/blob";
import {
  BlobPreconditionFailedError,
  listPrivateJson,
  readPrivateJson,
  writePrivateJson,
} from "./_blob-json.js";
import { normalizeText } from "./_request-security.js";

const RECORD_PREFIX = "submissions/records/";
const FILE_PREFIX = "submissions/files/";
const ID_PATTERN = /^[a-f0-9]{32}$/;
const STATUSES = new Set(["new", "read", "in-progress", "completed"]);

const storageSecret = () => {
  const secret = normalizeText(process.env.REVIEW_TOKEN_SECRET || process.env.ADMIN_SESSION_SECRET);
  if (secret.length < 32) throw new Error("Submission storage is not configured.");
  return secret;
};

const submissionId = (key) => createHmac("sha256", storageSecret())
  .update(`submission:${key}`)
  .digest("hex")
  .slice(0, 32);

const recordPath = (id) => `${RECORD_PREFIX}${id}.json`;
const safeFilename = (value) => String(value || "resume")
  .replaceAll("\\", "/")
  .split("/")
  .pop()
  .replace(/[^A-Za-z0-9._ -]/g, "_")
  .slice(0, 120);

export const storeSubmission = async ({ data, idempotencyKey }) => {
  const id = submissionId(idempotencyKey);
  const existing = await readPrivateJson(recordPath(id));
  if (existing) return existing.value;

  const { resume, ...fields } = data;
  let resumeMetadata = null;
  if (resume) {
    const filename = safeFilename(resume.filename);
    const pathname = `${FILE_PREFIX}${id}/${filename}`;
    const uploaded = await put(pathname, Buffer.from(resume.content, "base64"), {
      access: "private",
      contentType: resume.contentType,
      cacheControlMaxAge: 60,
    });
    resumeMetadata = {
      filename,
      contentType: resume.contentType,
      size: resume.size,
      pathname: uploaded.pathname,
    };
  }

  const record = {
    id,
    formType: data.formType,
    fields,
    status: "new",
    resume: resumeMetadata,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await writePrivateJson(recordPath(id), record);
  return record;
};

export const listSubmissions = async () => {
  const records = await listPrivateJson(RECORD_PREFIX, 1000);
  return records
    .map((record) => record?.value)
    .filter((record) => record?.id && record?.formType)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
};

export const updateSubmissionStatus = async (id, status) => {
  if (!ID_PATTERN.test(String(id)) || !STATUSES.has(status)) return null;
  const current = await readPrivateJson(recordPath(id));
  if (!current) return null;
  const updated = { ...current.value, status, updatedAt: new Date().toISOString() };
  try {
    await writePrivateJson(recordPath(id), updated, current);
  } catch (error) {
    if (error instanceof BlobPreconditionFailedError) return null;
    throw error;
  }
  return updated;
};

export const deleteSubmission = async (id) => {
  if (!ID_PATTERN.test(String(id))) return false;
  const current = await readPrivateJson(recordPath(id));
  if (!current) return false;
  const paths = [recordPath(id), current.value.resume?.pathname].filter(Boolean);
  await del(paths);
  return true;
};

export const getSubmissionFile = async (id) => {
  if (!ID_PATTERN.test(String(id))) return null;
  const record = await readPrivateJson(recordPath(id));
  if (!record?.value?.resume?.pathname) return null;
  const file = await get(record.value.resume.pathname, { access: "private", useCache: false });
  if (!file || file.statusCode !== 200 || !file.stream) return null;
  return { record: record.value, file };
};
