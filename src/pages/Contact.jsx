import { siteConfig } from "../config/siteConfig";
import { Seo } from "../components/ui/Seo";
import { PageHero } from "../components/ui/PageHero";
import { InquiryForm } from "../components/ui/InquiryForm";
import { Icon } from "../components/ui/Icon";

export default function Contact() {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteConfig.fullAddress)}`;
  return (
    <>
      <Seo title="Contact Unity & Hope Home Care LLC | Riverside OH" description={`Contact Unity & Hope Home Care LLC in Riverside, Ohio. Call ${siteConfig.phone} for compassionate non-medical home care in Montgomery County.`} path="/contact" />
      <PageHero eyebrow="Contact Unity & Hope" title="We’re Ready to Listen." description="Call, email or send a message to start a conversation about non-medical care at home." image="/images/coffee-conversation.webp" imageAlt="A caregiver speaking with an older adult at a kitchen table" breadcrumbs={[{ label: "Contact" }]} />
      <section className="section contact-section">
        <div className="container contact-grid">
          <div className="contact-details reveal">
            <p className="eyebrow">Contact Us Today</p><h2>Let's talk about what would help.</h2><p>No two care needs are exactly alike. Reach out and tell us what support you are considering.</p>
            <div className="contact-card-list">
              <a href={siteConfig.phoneHref}><Icon name="Phone" size={25} /><span><small>Phone</small><strong>{siteConfig.phone}</strong></span></a>
              <a href={siteConfig.emailHref}><Icon name="Mail" size={25} /><span><small>Email</small><strong>{siteConfig.email}</strong></span></a>
              <a href={mapsUrl} target="_blank" rel="noreferrer"><Icon name="MapPin" size={25} /><span><small>Office</small><strong>{siteConfig.addressLine1}<br />{siteConfig.city}, {siteConfig.state} {siteConfig.postalCode}</strong></span></a>
              <div><Icon name="Clock3" size={25} /><span><small>Hours</small><strong>{siteConfig.hours.weekdaysLabel}: {siteConfig.hours.weekdays}<br />{siteConfig.hours.weekendsLabel}: {siteConfig.hours.weekends}</strong></span></div>
            </div>
            <p className="fax-line">Fax: {siteConfig.fax}</p>
          </div>
          <div className="form-card reveal reveal-delay"><div className="form-card-heading"><p className="eyebrow">Send a Message</p><h2>How can we help?</h2></div><InquiryForm type="contact" compact /></div>
        </div>
      </section>
    </>
  );
}
