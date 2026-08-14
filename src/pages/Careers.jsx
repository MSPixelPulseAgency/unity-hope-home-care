import { Seo } from "../components/ui/Seo";
import { PageHero } from "../components/ui/PageHero";
import { InquiryForm } from "../components/ui/InquiryForm";
import { SectionTitle } from "../components/ui/SectionTitle";
import { Icon } from "../components/ui/Icon";

const qualities = [
  ["Heart", "Compassionate", "You approach clients and families with warmth, patience and empathy."],
  ["ShieldCheck", "Dependable", "You understand that reliability matters deeply in home care."],
  ["Handshake", "Respectful", "You protect dignity, privacy, preferences and personal routines."],
  ["MessageCircleHeart", "Communicative", "You listen carefully and communicate clearly with clients and families."],
];

export default function Careers() {
  return (
    <>
      <Seo title="Caregiver Careers | Unity & Hope Home Care LLC" description="Explore caregiver opportunities with Unity & Hope Home Care LLC in Riverside and Montgomery County, Ohio. Join a team built around compassion, dignity and reliability." path="/careers" />
      <PageHero eyebrow="Caregiver Careers" title="Join a Team Built Around Compassion." description="Bring patience, reliability and respect to work that helps people feel supported at home." image="/images/caregiver-team.webp" imageAlt="Caregivers and senior adults together in a home setting" breadcrumbs={[{ label: "Careers" }]} />
      <section className="section careers-values">
        <div className="container">
          <SectionTitle eyebrow="Who We’re Looking For" title="People who lead with care" description="We value the qualities that help clients feel safe, heard and respected." />
          <div className="career-quality-grid">{qualities.map(([icon, title, text]) => <article className="reveal" key={title}><Icon name={icon} size={27} /><h3>{title}</h3><p>{text}</p></article>)}</div>
        </div>
      </section>
      <section className="section career-story">
        <div className="container career-story-grid">
          <img src="/images/caregiver-welcome.webp" alt="A caregiver greeting an older adult warmly at home" width="1600" height="1067" loading="lazy" />
          <div><SectionTitle eyebrow="Why Caregiving Matters" title="Everyday support can make a meaningful difference." align="left" /><p>Caregiving is about more than completing a task. It is about noticing preferences, communicating with patience and helping someone feel comfortable in their own home.</p><p>Unity & Hope is interested in caregivers who take pride in dependable, respectful and family-centered support.</p><div className="service-note"><Icon name="ListChecks" size={22} /><p>Compensation, scheduling and employment details are discussed during the application process. No benefits or pay claims are implied on this page.</p></div></div>
        </div>
      </section>
      <section className="section career-form-section">
        <div className="container form-page-grid">
          <aside className="form-contact-panel reveal"><p className="eyebrow eyebrow-light">Apply to Join Us</p><h2>Tell us about your experience and availability.</h2><p>Complete the form and Unity & Hope will review your interest. Please do not include sensitive identification or medical information.</p><div className="career-note"><Icon name="LockKeyhole" size={21} />Optional resumes are securely validated, emailed with the application and never stored on the website.</div></aside>
          <div className="form-card reveal reveal-delay"><div className="form-card-heading"><p className="eyebrow">Caregiver Application</p><h2>Start your application</h2></div><InquiryForm type="career" /></div>
        </div>
      </section>
    </>
  );
}
