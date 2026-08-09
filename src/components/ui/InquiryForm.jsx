import { useState } from "react";
import { services } from "../../data/services";
import { Icon } from "./Icon";

const initialState = {
  name: "",
  phone: "",
  email: "",
  relationship: "",
  services: [],
  schedule: "",
  startDate: "",
  location: "",
  city: "",
  experience: "",
  availability: "",
  transportation: "",
  message: "",
  consent: false,
  website: "",
};

export function InquiryForm({ type = "contact", compact = false }) {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const [startedAt] = useState(() => Date.now());
  const isCare = type === "request-care";
  const isCareer = type === "career";

  const update = (event) => {
    const { name, value, type: inputType, checked } = event.target;
    setForm((current) => ({ ...current, [name]: inputType === "checkbox" ? checked : value }));
  };

  const toggleService = (title) => {
    setForm((current) => ({
      ...current,
      services: current.services.includes(title)
        ? current.services.filter((service) => service !== title)
        : [...current.services, title],
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setStatus({ state: "loading", message: "Sending your message..." });
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, formType: type, startedAt }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We could not send your message. Please call us instead.");
      setStatus({ state: "success", message: result.message || "Thank you. We will be in touch soon." });
      setForm(initialState);
    } catch (error) {
      setStatus({ state: "error", message: error.message });
    }
  };

  return (
    <form className={`inquiry-form ${compact ? "inquiry-form-compact" : ""}`} onSubmit={submit}>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor={`${type}-website`}>Website</label>
        <input id={`${type}-website`} name="website" value={form.website} onChange={update} tabIndex="-1" autoComplete="off" />
      </div>
      <div className="form-grid">
        <label className="field">
          <span>Full Name *</span>
          <input name="name" value={form.name} onChange={update} autoComplete="name" required />
        </label>
        <label className="field">
          <span>Phone *</span>
          <input name="phone" type="tel" value={form.phone} onChange={update} autoComplete="tel" required />
        </label>
        <label className={`field ${compact ? "field-full" : ""}`}>
          <span>Email *</span>
          <input name="email" type="email" value={form.email} onChange={update} autoComplete="email" required />
        </label>

        {isCare && (
          <>
            <label className="field">
              <span>Who needs care? *</span>
              <select name="relationship" value={form.relationship} onChange={update} required>
                <option value="">Choose one</option>
                {['Myself', 'Parent', 'Spouse', 'Relative', 'Friend', 'Other'].map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Preferred schedule</span>
              <input name="schedule" value={form.schedule} onChange={update} placeholder="Days or times that work best" />
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
                      onChange={() => toggleService(title)}
                    />
                    <span>{title}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="field">
              <span>Preferred start date</span>
              <input name="startDate" type="date" value={form.startDate} onChange={update} />
            </label>
            <label className="field">
              <span>Address / City</span>
              <input name="location" value={form.location} onChange={update} autoComplete="street-address" />
            </label>
          </>
        )}

        {isCareer && (
          <>
            <label className="field">
              <span>City *</span>
              <input name="city" value={form.city} onChange={update} autoComplete="address-level2" required />
            </label>
            <label className="field">
              <span>Caregiving experience</span>
              <input name="experience" value={form.experience} onChange={update} />
            </label>
            <label className="field">
              <span>Availability *</span>
              <input name="availability" value={form.availability} onChange={update} required />
            </label>
            <label className="field">
              <span>Transportation access *</span>
              <select name="transportation" value={form.transportation} onChange={update} required>
                <option value="">Choose one</option>
                <option>Yes</option>
                <option>No</option>
                <option>Prefer to discuss</option>
              </select>
            </label>
          </>
        )}

        <label className="field field-full">
          <span>{isCareer ? "Tell us about your interest in caregiving" : "Message"} *</span>
          <textarea name="message" value={form.message} onChange={update} rows={compact ? 4 : 6} required />
        </label>
        <label className="consent field-full">
          <input name="consent" type="checkbox" checked={form.consent} onChange={update} required />
          <span>
            I agree that Unity & Hope Home Care LLC may contact me about this {isCareer ? "career inquiry" : "inquiry"}. *
          </span>
        </label>
      </div>
      <button className="button button-primary form-submit" type="submit" disabled={status.state === "loading"}>
        <Icon name="Send" size={19} />
        <span>{status.state === "loading" ? "Sending..." : isCareer ? "Submit Application" : isCare ? "Request Care" : "Send Message"}</span>
      </button>
      {status.message && (
        <p className={`form-status form-status-${status.state}`} role="status" aria-live="polite">
          {status.message}
        </p>
      )}
    </form>
  );
}
