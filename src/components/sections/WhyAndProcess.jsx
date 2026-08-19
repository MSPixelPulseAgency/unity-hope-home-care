import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { SectionTitle } from "../ui/SectionTitle";
import { homepageContent } from "../../data/content";

export function WhyAndProcess() {
  return (
    <section className="section why-process-section">
      <div className="container why-process-grid">
        <article className="why-card reveal">
          <SectionTitle eyebrow="Why Choose Us?" title="Care built on trust" align="left" />
          <ul className="check-list">
            {homepageContent.whyChoose.map(([icon, reason]) => <li key={reason}><span><Icon name={icon} size={18} /></span>{reason}</li>)}
          </ul>
          <Button to="/about" variant="outline">Learn More About Us</Button>
        </article>

        <article className="process-card reveal reveal-delay">
          <SectionTitle eyebrow="How It Works" title="A reassuring first step" align="left" />
          <div className="process-timeline">
            {homepageContent.careProcess.map((step) => (
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
