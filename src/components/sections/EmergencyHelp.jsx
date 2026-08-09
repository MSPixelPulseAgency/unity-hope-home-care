import { siteConfig } from "../../config/siteConfig";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";

export function EmergencyHelp() {
  return (
    <section className="emergency-help" aria-labelledby="emergency-help-title">
      <div className="container emergency-help-inner">
        <div className="emergency-help-icon" aria-hidden="true"><Icon name="Phone" size={32} /></div>
        <div>
          <p className="eyebrow eyebrow-light">Need Help Now?</p>
          <h2 id="emergency-help-title">Know who to call</h2>
          <p>For a medical or safety emergency, call 911. Unity & Hope provides non-medical home care and is not an emergency response provider. For routine care questions, call our office.</p>
        </div>
        <div className="emergency-help-actions">
          <Button href="tel:911" variant="light" icon="Phone">Call 911</Button>
          <Button href={siteConfig.phoneHref} variant="gold" icon="HeartHandshake">Call Unity & Hope</Button>
        </div>
      </div>
    </section>
  );
}
