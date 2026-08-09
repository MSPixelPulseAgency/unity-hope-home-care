import { siteConfig } from "../../config/siteConfig";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";

export function HomeHero() {
  return (
    <section className="home-hero">
      <div className="hero-glow hero-glow-one" aria-hidden="true" />
      <div className="hero-glow hero-glow-two" aria-hidden="true" />
      <div className="container hero-grid">
        <div className="hero-copy reveal">
          <p className="hero-kicker"><Icon name="Heart" size={17} /> Non-Medical Home Care in Riverside, Ohio</p>
          <h1><span>Compassionate Care.</span><strong>Right at Home.</strong></h1>
          <p className="hero-lede">
            Providing non-medical home care services that promote independence, dignity and peace of mind for you and your loved ones.
          </p>
          <div className="hero-actions">
            <Button to="/request-care" icon="Heart">Request Care</Button>
            <Button href={siteConfig.phoneHref} variant="outline" icon="Phone">Call Now</Button>
          </div>
          <div className="hero-trust" aria-label="Care highlights">
            <div><Icon name="ShieldCheck" size={25} /><span>Carefully Screened<br />Caregivers</span></div>
            <div><Icon name="UserCheck" size={25} /><span>Personalized<br />Care Plans</span></div>
            <div><Icon name="MapPin" size={25} /><span>Serving Montgomery County<br />& Surrounding Areas</span></div>
          </div>
        </div>

        <div className="hero-media reveal reveal-delay">
          <div className="hero-image-wrap">
            <img
              src="/images/unity-hope-hero.webp"
              alt="A caregiver in purple scrubs sharing a warm moment with an older woman at home"
              width="494"
              height="405"
              fetchPriority="high"
            />
          </div>
          <div className="family-badge" aria-label="We treat your loved ones like family">
            <Icon name="Heart" size={24} />
            <span>We treat<br />your loved ones<br /><small>like</small><strong>family</strong></span>
          </div>
          <a className="hero-call-card" href={siteConfig.phoneHref}>
            <Icon name="Phone" size={22} />
            <span><small>Start with a conversation</small><strong>{siteConfig.phone}</strong></span>
          </a>
        </div>
      </div>
      <div className="hero-curve" aria-hidden="true"><span /></div>
    </section>
  );
}

