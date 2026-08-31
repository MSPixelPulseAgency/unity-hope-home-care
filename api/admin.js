import { randomBytes } from "node:crypto";
import { put } from "@vercel/blob";
import { adminSiteUrl, authenticateAdminRequest, isAllowedAdminOrigin } from "./_admin-auth.js";
import { loadManagedContent, saveManagedSection } from "./_cms.js";
import { adminDeleteReview, adminModerateReview, listAllReviews } from "./_reviews.js";
import { deleteSubmission, getSubmissionFile, listSubmissions, updateSubmissionStatus } from "./_submissions.js";
import { normalizeText } from "./_request-security.js";

const readBody = (request) => {
  if (typeof request.body === "string") return JSON.parse(request.body || "{}");
  return request.body && typeof request.body === "object" ? request.body : {};
};

const isAdminHost = (request) => {
  const host = String(request.headers.host || "").split(":")[0].toLowerCase();
  if (host === "localhost" || host === "127.0.0.1") return true;
  try {
    return host === new URL(adminSiteUrl()).hostname;
  } catch {
    return false;
  }
};

const dashboardPayload = async () => {
  const [reviews, submissions] = await Promise.all([listAllReviews(), listSubmissions()]);
  return {
    counts: {
      inquiries: submissions.filter((item) => item.formType === "contact").length,
      careRequests: submissions.filter((item) => item.formType === "request-care").length,
      applications: submissions.filter((item) => item.formType === "career").length,
      newSubmissions: submissions.filter((item) => item.status === "new").length,
      pendingReviews: reviews.filter((item) => item.status === "pending").length,
      approvedReviews: reviews.filter((item) => item.status === "approved" && item.published).length,
    },
    recentSubmissions: submissions.slice(0, 6),
    recentReviews: reviews.slice(0, 6),
  };
};

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store, max-age=0");
  response.setHeader("X-Content-Type-Options", "nosniff");
  if (!isAdminHost(request)) return response.status(404).json({ error: "Not found." });

  const mutating = request.method !== "GET";
  if (mutating && !isAllowedAdminOrigin(request.headers.origin)) return response.status(403).json({ error: "This request origin is not allowed." });
  const session = await authenticateAdminRequest(request, { csrf: mutating }).catch(() => null);
  if (!session) return response.status(401).json({ error: "Your admin session has expired." });

  const section = normalizeText(request.query?.section || "dashboard");

  try {
    if (request.method === "GET") {
      if (section === "dashboard") return response.status(200).json(await dashboardPayload());
      if (section === "content") {
        const { content } = await loadManagedContent();
        return response.status(200).json({ content });
      }
      if (section === "reviews") return response.status(200).json({ reviews: await listAllReviews() });
      if (section === "submissions") return response.status(200).json({ submissions: await listSubmissions() });
      if (section === "submission-file") {
        const result = await getSubmissionFile(request.query?.id);
        if (!result) return response.status(404).json({ error: "The résumé could not be found." });
        const chunks = [];
        for await (const chunk of result.file.stream) chunks.push(Buffer.from(chunk));
        response.setHeader("Content-Type", result.record.resume.contentType || "application/octet-stream");
        response.setHeader("Content-Disposition", `attachment; filename="${String(result.record.resume.filename).replace(/["\r\n]/g, "_")}"`);
        return response.status(200).send(Buffer.concat(chunks));
      }
      return response.status(400).json({ error: "Unknown admin section." });
    }

    if (request.method === "PUT") {
      const body = readBody(request);
      if (section === "content") {
        const content = await saveManagedSection(normalizeText(body.contentSection), body.value);
        return response.status(200).json({ message: "Website content saved.", content });
      }
      if (section === "reviews") {
        const review = await adminModerateReview({ id: body.id, action: normalizeText(body.action) });
        if (!review) return response.status(409).json({ error: "The review changed in another session. Refresh and try again." });
        return response.status(200).json({ message: "Review updated.", review });
      }
      if (section === "submissions") {
        const submission = await updateSubmissionStatus(body.id, normalizeText(body.status));
        if (!submission) return response.status(409).json({ error: "The submission could not be updated. Refresh and try again." });
        return response.status(200).json({ message: "Submission status updated.", submission });
      }
      return response.status(400).json({ error: "Unknown admin section." });
    }

    if (request.method === "POST") {
      const body = readBody(request);
      if (section === "media") {
        const contentTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
        const contentType = normalizeText(body.contentType).toLowerCase();
        const encoded = String(body.content || "");
        if (!contentTypes.has(contentType) || !/^[A-Za-z0-9+/=]+$/.test(encoded)) {
          return response.status(400).json({ error: "Choose a JPEG, PNG or WebP image." });
        }
        const bytes = Buffer.from(encoded, "base64");
        if (!bytes.length || bytes.length > 4 * 1024 * 1024) {
          return response.status(400).json({ error: "Images must be 4 MB or smaller." });
        }
        const extension = contentType === "image/jpeg" ? "jpg" : contentType.split("/")[1];
        const id = randomBytes(16).toString("hex");
        await put(`cms/media/${id}.${extension}`, bytes, {
          access: "private",
          contentType,
          cacheControlMaxAge: 31536000,
        });
        return response.status(201).json({ path: `/api/media?id=${id}` });
      }
      return response.status(400).json({ error: "Unknown admin section." });
    }

    if (request.method === "DELETE") {
      const body = readBody(request);
      if (section === "reviews") {
        const deleted = await adminDeleteReview(body.id);
        return deleted ? response.status(200).json({ message: "Review deleted." }) : response.status(404).json({ error: "Review not found." });
      }
      if (section === "submissions") {
        const deleted = await deleteSubmission(body.id);
        return deleted ? response.status(200).json({ message: "Submission deleted." }) : response.status(404).json({ error: "Submission not found." });
      }
      return response.status(400).json({ error: "Unknown admin section." });
    }

    return response.status(405).json({ error: "Method not allowed." });
  } catch (error) {
    console.error("Admin request failed", { section, code: error?.code || error?.name || "UNKNOWN" });
    if (error?.code === "CONTENT_CONFLICT") return response.status(409).json({ error: error.message });
    return response.status(503).json({ error: "The admin request could not be completed. Please try again." });
  }
}
