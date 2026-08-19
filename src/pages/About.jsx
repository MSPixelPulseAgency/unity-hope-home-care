import { Seo } from "../components/ui/Seo";
import { PageHero } from "../components/ui/PageHero";
import { SectionTitle } from "../components/ui/SectionTitle";
import { ValuesSection } from "../components/sections/ValuesSection";
import { WhyAndProcess } from "../components/sections/WhyAndProcess";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { aboutContent } from "../data/content";
import { pageSeo } from "../data/seo";
import { TeamSection } from "../components/sections/TeamSection";

export default function About() {
  return (
    <>
      <Seo {...pageSeo.about} />
      <PageHero eyebrow="About Unity & Hope" title="Compassion. Dignity. Care." description="Dependable, personalized non-medical care in the comfort of home, centered on each client and family." image="/images/brochure-caregiver.webp" imageAlt="A caregiver in purple speaking with an older woman at home" breadcrumbs={[{ label: "About Us" }]} />

      <section className="section split-story">
        <div className="container split-story-grid">
          <div className="split-story-copy reveal">
            <SectionTitle eyebrow={aboutContent.mission.eyebrow} title={aboutContent.mission.title} align="left" />
            <p className="lead">{aboutContent.mission.lead}</p>
            {aboutContent.mission.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <Button to="/request-care">Schedule a Free Consultation</Button>
          </div>
          <div className="mission-photo reveal reveal-delay">
            <img src="/images/senior-couple.webp" alt="Two older adults sharing a conversation in a bright home" width="1600" height="1067" loading="lazy" />
            <div className="mission-card"><Icon name="House" size={25} /><strong>Locally owned & community focused</strong><span>Serving Montgomery County and surrounding areas.</span></div>
          </div>
        </div>
      </section>
      <TeamSection />
      <ValuesSection />
      <WhyAndProcess />
      <section className="section privacy-feature">
        <div className="container privacy-feature-inner">
          <div className="privacy-feature-icon"><Icon name="LockKeyhole" size={40} /></div>
          <div><p className="eyebrow">Your Privacy Matters</p><h2>Respect and confidentiality are part of compassionate care.</h2><p>Unity & Hope is committed to protecting the confidentiality of client information in accordance with applicable privacy standards, including the principles described in its provided privacy materials.</p></div>
          <Button to="/privacy" variant="outline">Read Privacy Principles</Button>
        </div>
      </section>
    </>
  );
}
