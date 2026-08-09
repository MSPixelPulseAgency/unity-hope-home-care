import { Seo } from "../components/ui/Seo";
import { PageHero } from "../components/ui/PageHero";
import { SectionTitle } from "../components/ui/SectionTitle";
import { ValuesSection } from "../components/sections/ValuesSection";
import { WhyAndProcess } from "../components/sections/WhyAndProcess";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";

export default function About() {
  return (
    <>
      <Seo title="About Unity & Hope Home Care LLC | Riverside, Ohio" description="Learn about Unity & Hope Home Care LLC's mission to support independence, dignity, comfort and peace of mind through personalized non-medical home care." path="/about" />
      <PageHero eyebrow="About Unity & Hope" title="Compassion. Dignity. Care." description="Dependable, personalized non-medical care in the comfort of home, centered on each client and family." image="/images/brochure-caregiver.webp" imageAlt="A caregiver in purple speaking with an older woman at home" breadcrumbs={[{ label: "About Us" }]} />

      <section className="section split-story">
        <div className="container split-story-grid">
          <div className="split-story-copy reveal">
            <SectionTitle eyebrow="Our Mission" title="Helping every client feel supported at home" align="left" />
            <p className="lead">Unity & Hope Home Care LLC provides compassionate, dependable and personalized non-medical care in the comfort of clients' homes.</p>
            <p>Our mission is to enhance quality of life by promoting independence, protecting dignity and providing peace of mind for every client and their family.</p>
            <p>We take time to understand routines, preferences and goals so support can feel personal, comfortable and respectful.</p>
            <Button to="/request-care">Schedule a Free Consultation</Button>
          </div>
          <div className="mission-photo reveal reveal-delay">
            <img src="/images/senior-couple.webp" alt="Two older adults sharing a conversation in a bright home" width="1600" height="1067" loading="lazy" />
            <div className="mission-card"><Icon name="House" size={25} /><strong>Locally owned & community focused</strong><span>Serving Montgomery County and surrounding areas.</span></div>
          </div>
        </div>
      </section>
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

