import { useRef, useState } from "react";
import { Icon } from "./Icon";

const relationships = [
  "Client",
  "Family member",
  "Friend",
  "Caregiver",
  "Community member",
  "Other",
];

const createSubmissionKey = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID().replaceAll("-", "");
  return `${Date.now()}_${Math.random().toString(36).slice(2)}`;
};

const createInitialForm = () => ({
  name: "",
  relationship: "",
  rating: "",
  reviewText: "",
  consent: false,
  website: "",
});

export function ReviewForm() {
  const [form, setForm] = useState(createInitialForm);
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [submissionKey, setSubmissionKey] = useState(createSubmissionKey);
  const formRef = useRef(null);
  const statusRef = useRef(null);
  const sendingRef = useRef(false);
  const isSending = status.state === "loading";

  const update = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (sendingRef.current) return;
    sendingRef.current = true;
    setStatus({ state: "loading", message: "Sending your review securely..." });

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          startedAt,
          idempotencyKey: submissionKey,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We could not submit your review. Please try again.");

      setStatus({ state: "success", message: result.message || "Thank you. Your review was received for approval." });
      setForm(createInitialForm());
      formRef.current?.reset();
      setStartedAt(Date.now());
      setSubmissionKey(createSubmissionKey());
      window.requestAnimationFrame(() => statusRef.current?.focus());
    } catch (error) {
      setStatus({ state: "error", message: error instanceof Error ? error.message : "We could not submit your review. Please try again." });
      window.requestAnimationFrame(() => statusRef.current?.focus());
    } finally {
      sendingRef.current = false;
    }
  };

  return (
    <form ref={formRef} className="inquiry-form review-form" onSubmit={submit} aria-busy={isSending}>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="review-website">Website</label>
        <input id="review-website" name="website" value={form.website} onChange={update} tabIndex="-1" autoComplete="off" />
      </div>
      <p className="required-note"><span aria-hidden="true">*</span> Required fields</p>
      <div className="form-grid">
        <label className="field" htmlFor="review-name">
          <span>Your Name *</span>
          <input id="review-name" name="name" value={form.name} onChange={update} autoComplete="name" minLength="2" maxLength="80" required />
        </label>
        <label className="field" htmlFor="review-relationship">
          <span>Relationship / Type *</span>
          <select id="review-relationship" name="relationship" value={form.relationship} onChange={update} required>
            <option value="">Choose one</option>
            {relationships.map((relationship) => <option key={relationship}>{relationship}</option>)}
          </select>
        </label>
        <label className="field field-full" htmlFor="review-rating">
          <span>Rating (optional)</span>
          <select id="review-rating" name="rating" value={form.rating} onChange={update}>
            <option value="">No rating</option>
            <option value="5">5 stars — Excellent</option>
            <option value="4">4 stars — Very good</option>
            <option value="3">3 stars — Good</option>
            <option value="2">2 stars — Fair</option>
            <option value="1">1 star</option>
          </select>
        </label>
        <label className="field field-full" htmlFor="review-text">
          <span>Your Review *</span>
          <textarea id="review-text" name="reviewText" value={form.reviewText} onChange={update} minLength="20" maxLength="2000" rows="7" required />
          <small className="field-help">Please do not include private medical, financial or identifying information. Maximum 2,000 characters.</small>
        </label>
        <label className="consent field-full">
          <input name="consent" type="checkbox" checked={form.consent} onChange={update} required />
          <span>I confirm that this feedback reflects my experience and give Unity &amp; Hope Home Care LLC permission to review and publish it on this website. *</span>
        </label>
      </div>
      <button className="button button-primary form-submit" type="submit" disabled={isSending}>
        <Icon name="Send" size={19} />
        <span>{isSending ? "Submitting..." : "Submit Review"}</span>
      </button>
      {status.message && (
        <p ref={statusRef} className={`form-status form-status-${status.state}`} role={status.state === "error" ? "alert" : "status"} aria-live={status.state === "error" ? "assertive" : "polite"} tabIndex="-1">
          {status.message}
        </p>
      )}
    </form>
  );
}
