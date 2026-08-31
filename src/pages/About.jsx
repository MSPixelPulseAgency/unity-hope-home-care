import { Seo } from "../components/ui/Seo";
import { PageHero } from "../components/ui/PageHero";
import { SectionTitle } from "../components/ui/SectionTitle";
import { ValuesSection } from "../components/sections/ValuesSection";
import { WhyAndProcess } from "../components/sections/WhyAndProcess";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { pageSeo } from "../data/seo";
import { TeamSection } from "../components/sections/TeamSection";
import { useManagedContent } from "../context/ContentContext";

export default function About() {
  const { content } = useManagedContent();
  const aboutContent = content.about;
  return (
    <>
      <Seo {...(content.seo.about || pageSeo.about)} />
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
      {(aboutContent.vision || aboutContent.founderStory) && <section className="section about-extended-story"><div className="container about-extended-grid">
        {aboutContent.vision && <article><p className="eyebrow">Our Vision</p><h2>Care that respects every person</h2>{aboutContent.vision.split("\n").filter(Boolean).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</article>}
        {aboutContent.founderStory && <article><p className="eyebrow">Our Story</p><h2>Why Unity &amp; Hope began</h2>{aboutContent.founderStory.split("\n").filter(Boolean).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</article>}
      </div></section>}
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
