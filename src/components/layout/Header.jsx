import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { siteConfig, mainNavigation } from "../../config/siteConfig";
import { services } from "../../data/services";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const menuToggleRef = useRef(null);
  const menuCloseRef = useRef(null);
  const menuRef = useRef(null);
  const wasMenuOpen = useRef(false);
  const lockedScrollY = useRef(0);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    let focusFrame;

    if (menuOpen) {
      if (!wasMenuOpen.current) lockedScrollY.current = window.scrollY;
      body.style.setProperty("--menu-scroll-y", `-${lockedScrollY.current}px`);
      root.classList.add("menu-is-open");
      body.classList.add("menu-is-open");
      focusFrame = window.requestAnimationFrame(() => menuCloseRef.current?.focus({ preventScroll: true }));
    } else {
      root.classList.remove("menu-is-open");
      body.classList.remove("menu-is-open");
      body.style.removeProperty("--menu-scroll-y");

      if (wasMenuOpen.current) {
        focusFrame = window.requestAnimationFrame(() => {
          const previousScrollBehavior = root.style.scrollBehavior;
          root.style.scrollBehavior = "auto";
          window.scrollTo(0, lockedScrollY.current);
          menuToggleRef.current?.focus({ preventScroll: true });
          root.style.scrollBehavior = previousScrollBehavior;
        });
      }
    }
    wasMenuOpen.current = menuOpen;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setServicesOpen(false);
        return;
      }

      if (event.key === "Tab" && menuOpen) {
        const focusable = menuRef.current?.querySelectorAll("a[href], button:not([disabled])");
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      if (focusFrame) window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => () => {
    document.documentElement.classList.remove("menu-is-open");
    document.body.classList.remove("menu-is-open");
    document.body.style.removeProperty("--menu-scroll-y");
  }, []);

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
                  aria-controls="services-dropdown"
                  onClick={() => setServicesOpen((open) => !open)}
                  onMouseEnter={() => setServicesOpen(true)}
                >
                  Our Services <Icon name="ChevronDown" size={15} />
                </button>
                <div className={`services-dropdown ${servicesOpen ? "is-open" : ""}`} id="services-dropdown">
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
              ref={menuToggleRef}
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
      <aside
        ref={menuRef}
        className={`mobile-menu ${menuOpen ? "is-open" : ""}`}
        id="mobile-menu"
        role="dialog"
        aria-modal={menuOpen ? "true" : undefined}
        aria-label="Mobile navigation menu"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        <div className="mobile-menu-top">
          <p>How can we help?</p>
          <button ref={menuCloseRef} type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)}><Icon name="X" size={24} /></button>
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
