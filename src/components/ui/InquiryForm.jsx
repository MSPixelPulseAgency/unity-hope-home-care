import { useRef, useState } from "react";
import { services } from "../../data/services";
import { Icon } from "./Icon";

const MAX_RESUME_BYTES = 3 * 1024 * 1024;
const RESUME_TYPES = new Map([
  [".pdf", "application/pdf"],
  [".doc", "application/msword"],
  [".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
]);

const createInitialState = () => ({
  name: "",
  phone: "",
  email: "",
  relationship: "",
  services: [],
  schedule: "",
  startDate: "",
  location: "",
  contactMethod: "",
  bestTime: "",
  city: "",
  experience: "",
  availability: "",
  transportation: "",
  roleInterest: "",
  employmentPreference: "",
  certifications: [],
  message: "",
  consent: false,
  website: "",
});

const createSubmissionKey = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID().replaceAll("-", "");
  return `${Date.now()}_${Math.random().toString(36).slice(2)}`;
};

const getExtension = (filename) => {
  const index = filename.lastIndexOf(".");
  return index >= 0 ? filename.slice(index).toLowerCase() : "";
};

const encodeFile = async (file) => {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  const chunkSize = 32768;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return globalThis.btoa(binary);
};

export function InquiryForm({ type = "contact", compact = false }) {
  const [form, setForm] = useState(createInitialState);
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeError, setResumeError] = useState("");
  const formRef = useRef(null);
  const statusRef = useRef(null);
  const resumeRef = useRef(null);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [submissionKey, setSubmissionKey] = useState(createSubmissionKey);
  const sendingRef = useRef(false);
  const isCare = type === "request-care";
  const isCareer = type === "career";
  const isSending = status.state === "loading";

  const update = (event) => {
    const { name, value, type: inputType, checked } = event.target;
    setForm((current) => ({ ...current, [name]: inputType === "checkbox" ? checked : value }));
  };

  const toggleListItem = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: current[field].includes(value)
        ? current[field].filter((item) => item !== value)
        : [...current[field], value],
    }));
  };

  const chooseResume = (event) => {
    const file = event.target.files?.[0] || null;
    setResumeError("");
    setResumeFile(null);
    if (!file) return;

    const expectedType = RESUME_TYPES.get(getExtension(file.name));
    if (!expectedType || file.type !== expectedType) {
      setResumeError("Choose a PDF, DOC or DOCX resume.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_RESUME_BYTES) {
      setResumeError("Resume must be 3 MB or smaller.");
      event.target.value = "";
      return;
    }
    setResumeFile(file);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (sendingRef.current) return;
    if (resumeError) {
      resumeRef.current?.focus();
      return;
    }

    sendingRef.current = true;
    setStatus({ state: "loading", message: "Sending your information securely..." });

    try {
      const resume = resumeFile ? {
        name: resumeFile.name,
        type: resumeFile.type,
        content: await encodeFile(resumeFile),
      } : null;
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          resume,
          formType: type,
          startedAt,
          idempotencyKey: submissionKey,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We could not send your information. Please call us instead.");

      setStatus({ state: "success", message: result.message || "Thank you. We received your information." });
      setForm(createInitialState());
      setResumeFile(null);
      setResumeError("");
      formRef.current?.reset();
      setStartedAt(Date.now());
      setSubmissionKey(createSubmissionKey());
      window.requestAnimationFrame(() => statusRef.current?.focus());
    } catch (error) {
      setStatus({ state: "error", message: error instanceof Error ? error.message : "We could not send your information. Please call us instead." });
      window.requestAnimationFrame(() => statusRef.current?.focus());
    } finally {
      sendingRef.current = false;
    }
  };

  return (
    <form ref={formRef} className={`inquiry-form ${compact ? "inquiry-form-compact" : ""}`} onSubmit={submit} aria-busy={isSending}>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor={`${type}-website`}>Website</label>
        <input id={`${type}-website`} name="website" value={form.website} onChange={update} tabIndex="-1" autoComplete="off" />
      </div>
      <p className="required-note"><span aria-hidden="true">*</span> Required fields</p>
      <div className="form-grid">
        <label className="field" htmlFor={`${type}-name`}>
          <span>Full Name *</span>
          <input id={`${type}-name`} name="name" value={form.name} onChange={update} autoComplete="name" minLength="2" maxLength="120" required />
        </label>
        <label className="field" htmlFor={`${type}-phone`}>
          <span>Phone *</span>
          <input id={`${type}-phone`} name="phone" type="tel" value={form.phone} onChange={update} autoComplete="tel" inputMode="tel" minLength="7" maxLength="30" required />
        </label>
        <label className={`field ${compact ? "field-full" : ""}`} htmlFor={`${type}-email`}>
          <span>Email *</span>
          <input id={`${type}-email`} name="email" type="email" value={form.email} onChange={update} autoComplete="email" inputMode="email" maxLength="254" required />
        </label>

        {isCare && (
          <>
            <label className="field" htmlFor={`${type}-relationship`}>
              <span>Who needs care? *</span>
              <select id={`${type}-relationship`} name="relationship" value={form.relationship} onChange={update} required>
                <option value="">Choose one</option>
                {["Myself", "Parent", "Spouse", "Relative", "Friend", "Other"].map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
            <label className="field" htmlFor={`${type}-contact-method`}>
              <span>Preferred contact method *</span>
              <select id={`${type}-contact-method`} name="contactMethod" value={form.contactMethod} onChange={update} required>
                <option value="">Choose one</option>
                <option>Phone</option>
                <option>Email</option>
                <option>Either</option>
              </select>
            </label>
            <fieldset className="field field-full checkbox-fieldset">
              <legend>Services interested in</legend>
              <div className="checkbox-grid">
                {[...services.map((service) => service.title), "Not Sure"].map((title) => (
                  <label className="check-option" key={title}>
                    <input
                      name="services"
                      type="checkbox"
                      value={title}
                      checked={form.services.includes(title)}
                      onChange={() => toggleListItem("services", title)}
                    />
                    <span>{title}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="field" htmlFor={`${type}-schedule`}>
              <span>Preferred schedule</span>
              <input id={`${type}-schedule`} name="schedule" value={form.schedule} onChange={update} placeholder="Days or times that work best" maxLength="200" />
            </label>
            <label className="field" htmlFor={`${type}-best-time`}>
              <span>Best time to contact</span>
              <input id={`${type}-best-time`} name="bestTime" value={form.bestTime} onChange={update} placeholder="For example, weekday mornings" maxLength="120" />
            </label>
            <label className="field" htmlFor={`${type}-start-date`}>
              <span>Preferred start date</span>
              <input id={`${type}-start-date`} name="startDate" type="date" value={form.startDate} onChange={update} />
            </label>
            <label className="field" htmlFor={`${type}-location`}>
              <span>Address / City</span>
              <input id={`${type}-location`} name="location" value={form.location} onChange={update} autoComplete="street-address" maxLength="240" />
            </label>
          </>
        )}

        {isCareer && (
          <>
            <label className="field" htmlFor={`${type}-city`}>
              <span>City *</span>
              <input id={`${type}-city`} name="city" value={form.city} onChange={update} autoComplete="address-level2" maxLength="120" required />
            </label>
            <label className="field" htmlFor={`${type}-role-interest`}>
              <span>Role of interest *</span>
              <select id={`${type}-role-interest`} name="roleInterest" value={form.roleInterest} onChange={update} required>
                <option value="">Choose one</option>
                <option>Caregiver</option>
                <option>Personal Care Assistant</option>
                <option>Companion</option>
                <option>Other care role</option>
              </select>
            </label>
            <label className="field" htmlFor={`${type}-employment-preference`}>
              <span>Employment preference *</span>
              <select id={`${type}-employment-preference`} name="employmentPreference" value={form.employmentPreference} onChange={update} required>
                <option value="">Choose one</option>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>PRN / As needed</option>
                <option>Open to options</option>
              </select>
            </label>
            <label className="field" htmlFor={`${type}-experience`}>
              <span>Caregiving experience</span>
              <input id={`${type}-experience`} name="experience" value={form.experience} onChange={update} maxLength="1000" />
            </label>
            <label className="field" htmlFor={`${type}-availability`}>
              <span>Availability *</span>
              <input id={`${type}-availability`} name="availability" value={form.availability} onChange={update} maxLength="500" required />
            </label>
            <label className="field" htmlFor={`${type}-transportation`}>
              <span>Transportation access *</span>
              <select id={`${type}-transportation`} name="transportation" value={form.transportation} onChange={update} required>
                <option value="">Choose one</option>
                <option>Yes</option>
                <option>No</option>
                <option>Prefer to discuss</option>
              </select>
            </label>
            <fieldset className="field field-full checkbox-fieldset">
              <legend>Current certifications (optional)</legend>
              <div className="checkbox-grid">
                {["CPR", "First Aid", "STNA / CNA", "Other"].map((certification) => (
                  <label className="check-option" key={certification}>
                    <input
                      name="certifications"
                      type="checkbox"
                      value={certification}
                      checked={form.certifications.includes(certification)}
                      onChange={() => toggleListItem("certifications", certification)}
                    />
                    <span>{certification}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="field field-full" htmlFor={`${type}-resume`}>
              <span>Resume (optional)</span>
              <input
                ref={resumeRef}
                id={`${type}-resume`}
                name="resume"
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                aria-describedby={`${type}-resume-help${resumeError ? ` ${type}-resume-error` : ""}`}
                aria-invalid={resumeError ? "true" : undefined}
                onChange={chooseResume}
              />
              <small className="field-help" id={`${type}-resume-help`}>PDF, DOC or DOCX. Maximum 3 MB. The file is emailed with your application and is not stored on this website.</small>
              {resumeError && <small className="form-file-error" id={`${type}-resume-error`} role="alert">{resumeError}</small>}
            </label>
          </>
        )}

        <label className="field field-full" htmlFor={`${type}-message`}>
          <span>{isCareer ? "Short introduction" : isCare ? "Message / care needs" : "Message"} *</span>
          <textarea id={`${type}-message`} name="message" value={form.message} onChange={update} rows={compact ? 4 : 6} minLength="10" maxLength="5000" required />
          {(isCare || isCareer) && <small className="field-help">Do not include Social Security numbers, banking details, medical records or other highly sensitive information.</small>}
        </label>
        <label className="consent field-full">
          <input name="consent" type="checkbox" checked={form.consent} onChange={update} required />
          <span>
            I agree that Unity & Hope Home Care LLC may contact me about this {isCareer ? "career application" : "inquiry"}. *
          </span>
        </label>
      </div>
      <button className="button button-primary form-submit" type="submit" disabled={isSending}>
        <Icon name="Send" size={19} />
        <span>{isSending ? "Sending..." : isCareer ? "Submit Application" : isCare ? "Request Care" : "Send Message"}</span>
      </button>
      {status.message && (
        <p ref={statusRef} className={`form-status form-status-${status.state}`} role={status.state === "error" ? "alert" : "status"} aria-live={status.state === "error" ? "assertive" : "polite"} tabIndex="-1">
          {status.message}
        </p>
      )}
    </form>
  );
}
