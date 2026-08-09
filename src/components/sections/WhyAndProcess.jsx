import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { SectionTitle } from "../ui/SectionTitle";

const reasons = [
  ["Heart", "Reliable & Compassionate Care"],
  ["ShieldCheck", "Carefully Screened & Trained Caregivers"],
  ["UserCheck", "Personalized Care Plans"],
  ["CalendarDays", "Flexible Scheduling"],
  ["UsersRound", "Family-Centered Approach"],
  ["Handshake", "Committed to Dignity & Respect"],
  ["MapPin", "Locally Owned & Community Focused"],
];

const steps = [
  { number: "1", icon: "Phone", title: "Contact Us", text: "Call or fill out our online form." },
  { number: "2", icon: "ClipboardCheck", title: "Care Assessment", text: "We learn about needs and preferences." },
  { number: "3", icon: "UsersRound", title: "Personalized Plan", text: "We create a care plan that fits." },
  { number: "4", icon: "House", title: "Care Begins", text: "We match care needs with an appropriate caregiver." },
];

export function WhyAndProcess() {
  return (
    <section className="section why-process-section">
      <div className="container why-process-grid">
        <article className="why-card reveal">
          <SectionTitle eyebrow="Why Choose Us?" title="Care built on trust" align="left" />
          <ul className="check-list">
            {reasons.map(([icon, reason]) => <li key={reason}><span><Icon name={icon} size={18} /></span>{reason}</li>)}
          </ul>
          <Button to="/about" variant="outline">Learn More About Us</Button>
        </article>

        <article className="process-card reveal reveal-delay">
          <SectionTitle eyebrow="How It Works" title="A reassuring first step" align="left" />
          <div className="process-timeline">
            {steps.map((step) => (
              <div className="process-step" key={step.number}>
                <div className="process-icon"><Icon name={step.icon} size={24} /><span>{step.number}</span></div>
                <div><h3>{step.title}</h3><p>{step.text}</p></div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

