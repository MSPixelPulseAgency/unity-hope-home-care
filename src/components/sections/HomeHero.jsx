import { siteConfig } from "../../config/siteConfig";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { homepageContent } from "../../data/content";

export function HomeHero() {
  const { hero } = homepageContent;

  return (
    <section className="home-hero">
      <div className="hero-glow hero-glow-one" aria-hidden="true" />
      <div className="hero-glow hero-glow-two" aria-hidden="true" />
      <div className="container hero-grid">
        <div className="hero-copy reveal">
          <p className="hero-kicker"><Icon name="Heart" size={17} /> {hero.kicker}</p>
          <h1><span>{hero.title}</span><strong>{hero.titleAccent}</strong></h1>
          <p className="hero-lede">{hero.description}</p>
          <div className="hero-actions">
            <Button to={hero.primaryCta.to} icon={hero.primaryCta.icon}>{hero.primaryCta.label}</Button>
            <Button href={hero.secondaryCta.href} variant="outline" icon={hero.secondaryCta.icon}>{hero.secondaryCta.label}</Button>
          </div>
          <div className="hero-trust" aria-label="Care highlights">
            {hero.highlights.map((highlight) => (
              <div key={highlight.lines.join(" ")}><Icon name={highlight.icon} size={25} /><span>{highlight.lines[0]}<br />{highlight.lines[1]}</span></div>
            ))}
          </div>
        </div>

        <div className="hero-media reveal reveal-delay">
          <div className="hero-image-wrap">
            <img
              src="/images/unity-hope-hero-clean.webp"
              alt="A caregiver in purple scrubs sharing a warm moment with an older woman at home"
              width="1385"
              height="1136"
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
