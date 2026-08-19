import { Link } from "react-router-dom";
import { siteConfig } from "../../config/siteConfig";
import { services } from "../../data/services";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";

export function Footer() {
  return (
    <>
      <section className="footer-cta">
        <div className="container footer-cta-inner">
          <div>
            <p className="eyebrow eyebrow-light">Now accepting new clients</p>
            <h2>Ready to talk about care at home?</h2>
            <p>Start with a free in-home consultation and a conversation about your family's needs.</p>
          </div>
          <div className="footer-cta-actions">
            <Button to="/request-care" variant="gold">Request Care</Button>
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
              <img src="/brand/unity-hope-qr.png" alt="QR code for unityhope.vercel.app" width="150" height="150" />
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
              <Link to="/privacy">Privacy Policy</Link>
            </div>
          </section>

          <section className="footer-brand" aria-label="Unity and Hope Home Care">
            <div className="footer-logo-card">
              <img src="/brand/unity-hope-logo.webp" alt="Unity and Hope Home Care LLC - Compassion. Dignity. Care." width="360" height="314" />
            </div>
            <p>Compassionate, personalized non-medical care in the comfort of home.</p>
            <Link to={`/services/${services[0].slug}`}>Explore personal care <Icon name="ArrowRight" size={16} /></Link>
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
        <Link to="/request-care"><Icon name="HeartHandshake" size={19} /> Get Started</Link>
      </div>
    </>
  );
}
