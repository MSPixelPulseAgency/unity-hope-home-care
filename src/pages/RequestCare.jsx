import { siteConfig } from "../config/siteConfig";
import { Seo } from "../components/ui/Seo";
import { PageHero } from "../components/ui/PageHero";
import { InquiryForm } from "../components/ui/InquiryForm";
import { Icon } from "../components/ui/Icon";

export default function RequestCare() {
  return (
    <>
      <Seo title="Request Home Care | Unity & Hope Home Care LLC" description="Tell Unity & Hope about your care needs and request a free in-home consultation for non-medical home care in Montgomery County and surrounding areas." path="/request-care" />
      <PageHero eyebrow="Free In-Home Consultation" title="Let's Talk About Your Care Needs." description="Share what support would help. A member of the Unity & Hope team will follow up to learn more." image="/images/holding-hands.webp" imageAlt="A caregiver holding an older adult's hands in reassurance" breadcrumbs={[{ label: "Request Care" }]} />
      <section className="section form-page-section">
        <div className="container form-page-grid">
          <aside className="form-contact-panel reveal">
            <p className="eyebrow eyebrow-light">Start Here</p>
            <h2>A reassuring first conversation</h2>
            <p>Tell us about daily routines, preferences and the kind of support that would bring greater comfort at home.</p>
            <ul>
              <li><Icon name="Phone" size={21} /><span><small>Call us</small><a href={siteConfig.phoneHref}>{siteConfig.phone}</a></span></li>
              <li><Icon name="Mail" size={21} /><span><small>Email us</small><a href={siteConfig.emailHref}>{siteConfig.email}</a></span></li>
              <li><Icon name="Clock3" size={21} /><span><small>Office hours</small>{siteConfig.hours.weekdaysLabel}: {siteConfig.hours.weekdays}</span></li>
              <li><Icon name="ShieldCheck" size={21} /><span><small>Privacy</small>Your information is handled with care and confidentiality.</span></li>
            </ul>
          </aside>
          <div className="form-card reveal reveal-delay">
            <div className="form-card-heading"><p className="eyebrow">Request Care</p><h2>How can we support you?</h2><p>Fields marked with * are required.</p></div>
            <InquiryForm type="request-care" />
          </div>
        </div>
      </section>
    </>
  );
}
