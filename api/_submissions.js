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
const STATUSES = new Set(["new", "reviewing", "contacted", "closed", "read", "in-progress", "completed"]);
const NOTES_MAX_LENGTH = 5000;
const ACTIVITY_MAX_ITEMS = 100;

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
const cleanMultilineText = (value, maximumLength = NOTES_MAX_LENGTH) => String(value ?? "")
  .split("")
  .filter((character) => {
    const code = character.charCodeAt(0);
    return code === 9 || code === 10 || code === 13 || (code >= 32 && code !== 127);
  })
  .join("")
  .trim()
  .slice(0, maximumLength);
const activityEntry = ({ type, actor = "system", detail = "" }) => ({
  type,
  actor: normalizeText(actor).toLowerCase().slice(0, 254) || "system",
  detail: cleanMultilineText(detail, 500),
  createdAt: new Date().toISOString(),
});
const normalizedRecord = (record) => ({
  ...record,
  status: STATUSES.has(record?.status) ? record.status : "new",
  notes: cleanMultilineText(record?.notes),
  archived: Boolean(record?.archived),
  activity: Array.isArray(record?.activity) ? record.activity.slice(-ACTIVITY_MAX_ITEMS) : [],
});
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
    notes: "",
    archived: false,
    activity: [activityEntry({ type: "received", detail: `${data.formType} submission received` })],
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
    .map((record) => record?.value ? normalizedRecord(record.value) : null)
    .filter((record) => record?.id && record?.formType)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
};

export const getSubmission = async (id) => {
  if (!ID_PATTERN.test(String(id))) return null;
  const current = await readPrivateJson(recordPath(id));
  return current?.value ? normalizedRecord(current.value) : null;
};

export const updateSubmission = async (id, changes, actor) => {
  if (!ID_PATTERN.test(String(id)) || !changes || typeof changes !== "object") return null;
  const current = await readPrivateJson(recordPath(id));
  if (!current) return null;
  const previous = normalizedRecord(current.value);
  const updated = { ...previous };
  const activity = [...previous.activity];

  if (Object.hasOwn(changes, "status")) {
    const status = normalizeText(changes.status).toLowerCase();
    if (!STATUSES.has(status)) return null;
    if (status !== previous.status) {
      updated.status = status;
      activity.push(activityEntry({ type: "status-changed", actor, detail: `${previous.status} to ${status}` }));
    }
  }
  if (Object.hasOwn(changes, "notes")) {
    const notes = cleanMultilineText(changes.notes);
    if (notes !== previous.notes) {
      updated.notes = notes;
      activity.push(activityEntry({ type: "notes-updated", actor, detail: notes ? "Private notes updated" : "Private notes cleared" }));
    }
  }
  if (Object.hasOwn(changes, "archived")) {
    const archived = changes.archived === true;
    if (archived !== previous.archived) {
      updated.archived = archived;
      activity.push(activityEntry({ type: archived ? "archived" : "restored", actor }));
    }
  }

  updated.activity = activity.slice(-ACTIVITY_MAX_ITEMS);
  updated.updatedAt = new Date().toISOString();
  try {
    await writePrivateJson(recordPath(id), updated, current);
  } catch (error) {
    if (error instanceof BlobPreconditionFailedError) return null;
    throw error;
  }
  return updated;
};

export const recordSubmissionEmail = async (id, { actor, to, subject }) => {
  if (!ID_PATTERN.test(String(id))) return null;
  const current = await readPrivateJson(recordPath(id));
  if (!current) return null;
  const previous = normalizedRecord(current.value);
  const updated = {
    ...previous,
    status: "contacted",
    activity: [
      ...previous.activity,
      activityEntry({ type: "email-sent", actor, detail: `Email sent to ${normalizeText(to).toLowerCase()}: ${cleanMultilineText(subject, 160)}` }),
    ].slice(-ACTIVITY_MAX_ITEMS),
    updatedAt: new Date().toISOString(),
  };
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
  return { record: normalizedRecord(record.value), file };
};
