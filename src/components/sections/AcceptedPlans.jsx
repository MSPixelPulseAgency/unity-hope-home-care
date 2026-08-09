import { managedCare } from "../../data/managedCare";
import { siteConfig } from "../../config/siteConfig";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { SectionTitle } from "../ui/SectionTitle";

export function AcceptedPlans() {
  return (
    <section className="section plans-section">
      <div className="container plans-hours-grid">
        <article className="plans-card reveal">
          <SectionTitle eyebrow="We Accept" title="Managed care & private pay" align="left" />
          <div className="plan-list">
            {managedCare.map((plan) => (
              <div className={`plan-wordmark ${plan.className}`} key={plan.name}>
                <span>{plan.name}</span>
                {plan.qualification && <small>{plan.qualification}</small>}
              </div>
            ))}
          </div>
          <p className="coverage-note"><Icon name="ShieldCheck" size={18} /> Medicaid, private pay and more. Coverage varies by program. Contact Unity & Hope to confirm eligibility and coverage.</p>
        </article>

        <article className="hours-card reveal reveal-delay">
          <div className="hours-icon"><Icon name="Clock3" size={34} /></div>
          <p className="eyebrow">Office Hours</p>
          <h2>We’re here to help you get started.</h2>
          <dl>
            <div><dt>{siteConfig.hours.weekdaysLabel}</dt><dd>{siteConfig.hours.weekdays}</dd></div>
            <div><dt>{siteConfig.hours.weekendsLabel}</dt><dd>{siteConfig.hours.weekends}</dd></div>
          </dl>
          <Button href={siteConfig.phoneHref} icon="Phone">Call {siteConfig.phone}</Button>
        </article>
      </div>
    </section>
  );
}

