import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { siteConfig, mainNavigation } from "../../config/siteConfig";
import { services } from "../../data/services";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-is-open", menuOpen);
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("menu-is-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <>
      <div className="utility-bar">
        <div className="container utility-inner">
          <p><Icon name="Heart" size={16} /> {siteConfig.headline}</p>
          <div className="social-placeholder" aria-label="Social profiles are coming soon">
            <span>Follow Us:</span>
            <span className="social-disabled" title="Facebook profile coming soon"><Icon name="Facebook" size={15} /></span>
            <span className="social-disabled" title="Instagram profile coming soon"><Icon name="Instagram" size={15} /></span>
            <span className="social-disabled" title="LinkedIn profile coming soon"><Icon name="Linkedin" size={15} /></span>
          </div>
        </div>
      </div>
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <div className="container header-inner">
          <Link className="brand-lockup" to="/" aria-label="Unity and Hope Home Care LLC home">
            <img src="/brand/unity-hope-mark.png" alt="" width="68" height="68" />
            <span className="brand-words">
              <span><strong>Unity</strong> <em>and</em> <b>Hope</b></span>
              <small>Home Care LLC</small>
            </span>
          </Link>

          <nav className="desktop-nav" aria-label="Main navigation">
            {mainNavigation.map((item) => item.to === "/services" ? (
              <div className="nav-dropdown" key={item.to} onMouseLeave={() => setServicesOpen(false)}>
                <button
                  type="button"
                  className={location.pathname.startsWith("/services") ? "active" : ""}
                  aria-expanded={servicesOpen}
                  onClick={() => setServicesOpen((open) => !open)}
                  onMouseEnter={() => setServicesOpen(true)}
                >
                  Our Services <Icon name="ChevronDown" size={15} />
                </button>
                <div className={`services-dropdown ${servicesOpen ? "is-open" : ""}`}>
                  <NavLink to="/services" onClick={() => setServicesOpen(false)}>All Services</NavLink>
                  {services.map((service) => (
                    <NavLink key={service.slug} to={`/services/${service.slug}`} onClick={() => setServicesOpen(false)}>{service.shortTitle}</NavLink>
                  ))}
                </div>
              </div>
            ) : (
              <NavLink key={item.to} to={item.to}>{item.label}</NavLink>
            ))}
          </nav>

          <a className="header-phone" href={siteConfig.phoneHref}>
            <span className="header-phone-icon"><Icon name="Phone" size={23} /></span>
            <span><small>Call Us Today!</small><strong>{siteConfig.phone}</strong></span>
          </a>

          <div className="mobile-header-actions">
            <a className="mobile-phone" href={siteConfig.phoneHref} aria-label={`Call ${siteConfig.phone}`}>
              <Icon name="Phone" size={21} />
            </a>
            <button
              className="menu-toggle"
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <Icon name={menuOpen ? "X" : "Menu"} size={24} />
            </button>
          </div>
        </div>
      </header>

      <div className={`menu-scrim ${menuOpen ? "is-open" : ""}`} onClick={() => setMenuOpen(false)} aria-hidden="true" />
      <aside className={`mobile-menu ${menuOpen ? "is-open" : ""}`} id="mobile-menu" aria-hidden={!menuOpen}>
        <div className="mobile-menu-top">
          <p>How can we help?</p>
          <button type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)}><Icon name="X" size={24} /></button>
        </div>
        <nav aria-label="Mobile navigation">
          {mainNavigation.map((item) => <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)}>{item.label}</NavLink>)}
          <NavLink to="/request-care" onClick={() => setMenuOpen(false)}>Request Care</NavLink>
        </nav>
        <div className="mobile-menu-cta">
          <Button href={siteConfig.phoneHref} icon="Phone">Call {siteConfig.phone}</Button>
          <Button to="/request-care" variant="gold">Request Care</Button>
        </div>
      </aside>
    </>
  );
}
