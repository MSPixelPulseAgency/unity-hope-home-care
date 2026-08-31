import { Link } from "react-router-dom";
import { useManagedContent } from "../../context/ContentContext";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";

export function Footer() {
  const { content, visibleServices } = useManagedContent();
  const siteConfig = content.site;
  return (
    <>
      <section className="footer-cta">
        <div className="container footer-cta-inner">
          <div>
            <p className="eyebrow eyebrow-light">{siteConfig.footerCtaEyebrow}</p>
            <h2>{siteConfig.footerCtaTitle}</h2>
            <p>{siteConfig.footerCtaDescription}</p>
          </div>
          <div className="footer-cta-actions">
            <Button to="/request-care" variant="gold">{siteConfig.primaryCtaLabel}</Button>
            <Button href={siteConfig.phoneHref} variant="light" icon="Phone">{siteConfig.phone}</Button>
          </div>
        </div>
      </section>
      <footer className="site-footer">
        <div className="container footer-grid">
          <section className="footer-contact" aria-labelledby="footer-contact-heading">
            <h2 id="footer-contact-heading">Contact Us Today</h2>
            <a className="footer-big-phone" href={siteConfig.phoneHref}><Icon name="Phone" size={23} />{siteConfig.phone}</a>
            <a href={siteConfig.emailHref}><Icon name="Mail" size={18} />{siteConfig.email}</a>
            <p><Icon name="MapPin" size={18} /> <span>{siteConfig.addressLine1}<br />{siteConfig.city}, {siteConfig.state} {siteConfig.postalCode}</span></p>
            <p><Icon name="Phone" size={18} /> Fax: {siteConfig.fax}</p>
          </section>

          <section className="footer-qr" aria-labelledby="footer-qr-heading">
            <h2 id="footer-qr-heading">Scan to Visit</h2>
            <div className="qr-frame">
              <img src="/brand/unity-hope-qr.png" alt="QR code for uhhomehealth.com" width="150" height="150" />
            </div>
            <p>Point your camera here to open our website.</p>
          </section>

          <section className="footer-links" aria-labelledby="footer-links-heading">
            <h2 id="footer-links-heading">Quick Links</h2>
            <div>
              <Link to="/about">About Us</Link>
              <Link to="/services">Our Services</Link>
              <Link to="/service-areas">Service Area</Link>
              <Link to="/resources">Resources</Link>
              <Link to="/careers">Careers</Link>
              <Link to="/contact">Contact Us</Link>
              <Link to="/reviews">Share a Review</Link>
              <Link to="/privacy">Privacy Policy</Link>
            </div>
          </section>

          <section className="footer-brand" aria-label="Unity and Hope Home Care">
            <div className="footer-logo-card">
              <img src="/brand/unity-hope-logo.webp" alt="Unity and Hope Home Care LLC - Compassion. Dignity. Care." width="360" height="314" />
            </div>
            <p>{siteConfig.footerDescription}</p>
            {Object.values(siteConfig.socials || {}).some(Boolean) && <div className="footer-social-links" aria-label="Unity and Hope social profiles">
              {siteConfig.socials.facebook && <a href={siteConfig.socials.facebook} target="_blank" rel="noreferrer" aria-label="Facebook"><Icon name="Facebook" size={20} /></a>}
              {siteConfig.socials.instagram && <a href={siteConfig.socials.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><Icon name="Instagram" size={20} /></a>}
              {siteConfig.socials.linkedin && <a href={siteConfig.socials.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"><Icon name="Linkedin" size={20} /></a>}
            </div>}
            {visibleServices[0] && <Link to={`/services/${visibleServices[0].slug}`}>Explore {visibleServices[0].shortTitle.toLowerCase()} <Icon name="ArrowRight" size={16} /></Link>}
          </section>
        </div>
        <div className="footer-bottom">
          <div className="container footer-bottom-inner">
            <p><Icon name="Heart" size={18} /> {siteConfig.secondaryTagline} <Icon name="Heart" size={18} /></p>
            <small>&copy; {new Date().getFullYear()} {siteConfig.companyName}. All rights reserved.</small>
          </div>
        </div>
      </footer>
      <div className="mobile-action-bar" aria-label="Quick contact actions">
        <a href={siteConfig.phoneHref}><Icon name="Phone" size={19} /> Call Unity &amp; Hope</a>
        <Link to="/request-care"><Icon name="HeartHandshake" size={19} /> {siteConfig.primaryCtaLabel}</Link>
      </div>
    </>
  );
}
