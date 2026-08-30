import assert from "node:assert/strict";
import test from "node:test";
import nodemailer from "nodemailer";
import contactHandler from "../api/contact.js";
import {
  MAX_RESUME_BYTES,
  createConfirmationEmail,
  createNotificationEmail,
  validateSubmission,
} from "../api/contact.js";

const now = Date.now();

const baseSubmission = (overrides = {}) => ({
  formType: "contact",
  idempotencyKey: "test_submission_12345",
  startedAt: now - 2000,
  name: "Test Family",
  phone: "937-555-0101",
  email: "family@example.com",
  message: "This is a controlled website form test.",
  consent: true,
  ...overrides,
});

const careerSubmission = (resume, overrides = {}) => baseSubmission({
  formType: "career",
  city: "Riverside",
  experience: "Two years of companion-care experience.",
  availability: "Weekday mornings",
  transportation: "Yes",
  roleInterest: "Caregiver",
  employmentPreference: "Part-time",
  certifications: ["CPR", "First Aid"],
  resume,
  message: "I am interested in supporting older adults with dignity and care.",
  ...overrides,
});

const encodedResume = (name, type, buffer) => ({
  name,
  type,
  content: buffer.toString("base64"),
});

const pdfResume = () => encodedResume(
  "test-resume.pdf",
  "application/pdf",
  Buffer.from("%PDF-1.7\nControlled Unity Hope attachment test\n%%EOF"),
);

const docResume = () => encodedResume(
  "test-resume.doc",
  "application/msword",
  Buffer.concat([
    Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]),
    Buffer.from("Controlled Unity Hope DOC attachment test"),
  ]),
);

const docxResume = () => encodedResume(
  "test-resume.docx",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  Buffer.concat([
    Buffer.from([0x50, 0x4b, 0x03, 0x04]),
    Buffer.from("[Content_Types].xml word/document.xml Controlled Unity Hope DOCX attachment test"),
  ]),
);

test("validates a contact submission and normalizes the email", () => {
  const result = validateSubmission(baseSubmission({ email: " FAMILY@EXAMPLE.COM " }), now);
  assert.equal(result.error, undefined);
  assert.equal(result.value.data.email, "family@example.com");
});

test("rejects invalid form types, phone numbers and missing consent", () => {
  assert.match(validateSubmission(baseSubmission({ formType: "unknown" }), now).error, /form type/i);
  assert.match(validateSubmission(baseSubmission({ phone: "123" }), now).error, /phone/i);
  assert.match(validateSubmission(baseSubmission({ consent: false }), now).error, /required fields/i);
});

test("validates request-care allowlists", () => {
  const valid = validateSubmission(baseSubmission({
    formType: "request-care",
    relationship: "Parent",
    services: ["Companionship", "Respite Care"],
    schedule: "Weekdays",
    startDate: "2026-09-01",
    location: "Riverside, Ohio",
    contactMethod: "Phone",
    bestTime: "Morning",
  }), now);
  assert.equal(valid.error, undefined);
  assert.deepEqual(valid.value.data.services, ["Companionship", "Respite Care"]);

  const invalid = validateSubmission(baseSubmission({
    formType: "request-care",
    relationship: "Parent",
    services: ["Unlisted Service"],
    contactMethod: "Phone",
  }), now);
  assert.match(invalid.error, /available list/i);
});

test("accepts a validated PDF resume", () => {
  const result = validateSubmission(careerSubmission(pdfResume()), now);
  assert.equal(result.error, undefined);
  assert.equal(result.value.data.resume.filename, "test-resume.pdf");
  assert.equal(result.value.data.resume.contentType, "application/pdf");
});

test("accepts a validated legacy DOC resume", () => {
  const result = validateSubmission(careerSubmission(docResume()), now);
  assert.equal(result.error, undefined);
  assert.equal(result.value.data.resume.filename, "test-resume.doc");
  assert.equal(result.value.data.resume.contentType, "application/msword");
});

test("accepts a validated DOCX resume", () => {
  const result = validateSubmission(careerSubmission(docxResume()), now);
  assert.equal(result.error, undefined);
  assert.equal(result.value.data.resume.filename, "test-resume.docx");
  assert.equal(result.value.data.resume.contentType, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
});

test("rejects executable and mismatched resume files", () => {
  const executable = encodedResume("resume.exe", "application/octet-stream", Buffer.from("MZ executable"));
  assert.match(validateSubmission(careerSubmission(executable), now).error, /PDF, DOC or DOCX/i);

  const disguised = encodedResume("resume.pdf", "application/pdf", Buffer.from("MZ disguised executable"));
  assert.match(validateSubmission(careerSubmission(disguised), now).error, /does not match/i);
});

test("rejects resumes larger than the 3 MB request-safe limit", () => {
  const oversized = Buffer.alloc(MAX_RESUME_BYTES + 1, 0x20);
  oversized.write("%PDF-", 0, "ascii");
  const result = validateSubmission(careerSubmission(encodedResume("large.pdf", "application/pdf", oversized)), now);
  assert.match(result.error, /3 MB or smaller/i);
});

test("builds branded HTML and plain-text messages without HTML injection", () => {
  const validation = validateSubmission(baseSubmission({ name: "Test <Family>" }), now);
  const notification = createNotificationEmail(validation.value.data);
  const confirmation = createConfirmationEmail(validation.value.data);

  assert.match(notification.subject, /New Website Inquiry/);
  assert.match(notification.html, /Unity &amp; Hope Home Care LLC/);
  assert.doesNotMatch(notification.html, /Test <Family>/);
  assert.match(notification.html, /Test &lt;Family&gt;/);
  assert.match(notification.text, /FULL NAME: Test <Family>/i);
  assert.match(notification.html, /Call Customer/);
  assert.match(notification.html, /Reply by Email/);
  assert.match(confirmation.html, /We received your message/i);
  assert.match(confirmation.text, /937-221-9764/);
});

test("Nodemailer JSON transport preserves text, HTML, reply-to and resume attachment", async () => {
  const validation = validateSubmission(careerSubmission(pdfResume()), now);
  const data = validation.value.data;
  const notification = createNotificationEmail(data);
  const transporter = nodemailer.createTransport({ jsonTransport: true });
  const info = await transporter.sendMail({
    from: { name: "Unity & Hope Website", address: "mspixelpulse@gmail.com" },
    to: "uhhomehealthllc@gmail.com",
    replyTo: { name: data.name, address: data.email },
    subject: notification.subject,
    html: notification.html,
    text: notification.text,
    attachments: [{
      filename: data.resume.filename,
      content: Buffer.from(data.resume.content, "base64"),
      contentType: data.resume.contentType,
    }],
  });

  const message = JSON.parse(String(info.message));
  assert.equal(message.replyTo[0].address, "family@example.com");
  assert.equal(message.attachments[0].filename, "test-resume.pdf");
  assert.match(message.html, /New Caregiver Application/i);
  assert.match(message.text, /CAREGIVER APPLICATION/i);
  assert.match(message.html, /Call Applicant/);
  assert.match(message.html, /Email Applicant/);
});

test("uses the requested care-notification actions", () => {
  const validation = validateSubmission(baseSubmission({
    formType: "request-care",
    relationship: "Parent",
    contactMethod: "Phone",
  }), now);
  const notification = createNotificationEmail(validation.value.data);
  assert.match(notification.html, /Call Care Request/);
  assert.match(notification.html, /Reply by Email/);
});

test("rejects disallowed origins before processing a form", async () => {
  const previousOrigin = process.env.ALLOWED_ORIGIN;
  process.env.ALLOWED_ORIGIN = "https://uhhomehealth.com,https://www.uhhomehealth.com,https://unityhope.vercel.app";

  const result = { status: 200, body: null };
  const response = {
    status(status) {
      result.status = status;
      return this;
    },
    json(body) {
      result.body = body;
      return result;
    },
  };

  try {
    await contactHandler({
      method: "POST",
      headers: { origin: "https://attacker.example" },
      body: baseSubmission(),
    }, response);
  } finally {
    if (previousOrigin === undefined) delete process.env.ALLOWED_ORIGIN;
    else process.env.ALLOWED_ORIGIN = previousOrigin;
  }

  assert.equal(result.status, 403);
  assert.match(result.body.error, /origin is not allowed/i);
});
