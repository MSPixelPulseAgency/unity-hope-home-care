import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useManagedContent } from "../../context/ContentContext";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";

const resourceLinks = [
  { to: "/resources", label: "Resources & Blog" },
  { to: "/resources#care-guides", label: "Home Care Guides" },
];

const moreLinks = [
  { to: "/about", label: "About Us" },
  { to: "/service-areas", label: "Service Area" },
  { to: "/careers", label: "Careers" },
  { to: "/contact", label: "Contact Us" },
];

function DesktopDropdown({ label, active, open, onToggle, onOpen, onClose, id, children }) {
  return (
    <div className="nav-dropdown" onMouseLeave={onClose}>
      <button
        type="button"
        className={active ? "active" : ""}
        aria-expanded={open}
        aria-controls={id}
        onClick={onToggle}
        onMouseEnter={onOpen}
      >
        {label} <Icon name="ChevronDown" size={17} />
      </button>
      <div className={`services-dropdown ${open ? "is-open" : ""}`} id={id}>
        {children}
      </div>
    </div>
  );
}

export function Header() {
  const { content, visibleServices } = useManagedContent();
  const { site } = content;
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [desktopMenu, setDesktopMenu] = useState("");
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
        setDesktopMenu("");
        return;
      }

      if (event.key === "Tab" && menuOpen) {
        const focusable = menuRef.current?.querySelectorAll("a[href], button:not([disabled]), summary");
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

  const toggleDesktopMenu = (name) => setDesktopMenu((current) => (current === name ? "" : name));

  return (
    <>
      <div className="utility-bar">
        <div className="container utility-inner">
          <p><Icon name="Heart" size={17} /> {site.headline}</p>
          <a href={site.phoneHref} aria-label={`Call Unity and Hope at ${site.phone}`}>
            <Icon name="Phone" size={16} /> Call {site.phone}
          </a>
        </div>
      </div>
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <div className="container header-inner">
          <Link className="brand-lockup" to="/" aria-label="Unity and Hope Home Care home">
            <img src="/brand/unity-hope-mark.webp" alt="" width="68" height="68" fetchPriority="high" />
            <span className="brand-words">
              <span><strong>Unity</strong> <em>and</em> <b>Hope</b></span>
              <small>Home Care LLC</small>
            </span>
          </Link>

          <nav className="desktop-nav" aria-label="Main navigation">
            <NavLink end to="/">Home</NavLink>
            <DesktopDropdown
              label="Services"
              active={location.pathname.startsWith("/services")}
              open={desktopMenu === "services"}
              id="services-dropdown"
              onToggle={() => toggleDesktopMenu("services")}
              onOpen={() => setDesktopMenu("services")}
              onClose={() => setDesktopMenu("")}
            >
              <NavLink to="/services">All Services</NavLink>
              {visibleServices.map((service) => (
                <NavLink key={service.slug} to={`/services/${service.slug}`}>{service.shortTitle}</NavLink>
              ))}
            </DesktopDropdown>
            <DesktopDropdown
              label="Resources"
              active={location.pathname.startsWith("/resources")}
              open={desktopMenu === "resources"}
              id="resources-dropdown"
              onToggle={() => toggleDesktopMenu("resources")}
              onOpen={() => setDesktopMenu("resources")}
              onClose={() => setDesktopMenu("")}
            >
              {resourceLinks.map((item) => <NavLink key={item.to} to={item.to}>{item.label}</NavLink>)}
            </DesktopDropdown>
            <NavLink to="/reviews">Reviews</NavLink>
            <DesktopDropdown
              label="More"
              active={moreLinks.some((item) => location.pathname.startsWith(item.to))}
              open={desktopMenu === "more"}
              id="more-dropdown"
              onToggle={() => toggleDesktopMenu("more")}
              onOpen={() => setDesktopMenu("more")}
              onClose={() => setDesktopMenu("")}
            >
              {moreLinks.map((item) => <NavLink key={item.to} to={item.to}>{item.label}</NavLink>)}
            </DesktopDropdown>
          </nav>

          <Button className="header-cta" to="/request-care" icon="Heart">{site.primaryCtaLabel}</Button>

          <div className="mobile-header-actions">
            <a className="mobile-phone" href={site.phoneHref} aria-label={`Call ${site.phone}`}>
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
          <NavLink end to="/" onClick={() => setMenuOpen(false)}>Home</NavLink>
          <details>
            <summary>Services <Icon name="ChevronDown" size={18} /></summary>
            <div>
              <NavLink to="/services" onClick={() => setMenuOpen(false)}>All Services</NavLink>
              {visibleServices.map((service) => (
                <NavLink key={service.slug} to={`/services/${service.slug}`} onClick={() => setMenuOpen(false)}>{service.shortTitle}</NavLink>
              ))}
            </div>
          </details>
          <details>
            <summary>Resources <Icon name="ChevronDown" size={18} /></summary>
            <div>{resourceLinks.map((item) => <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)}>{item.label}</NavLink>)}</div>
          </details>
          <NavLink to="/reviews" onClick={() => setMenuOpen(false)}>Reviews</NavLink>
          <details>
            <summary>More <Icon name="ChevronDown" size={18} /></summary>
            <div>{moreLinks.map((item) => <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)}>{item.label}</NavLink>)}</div>
          </details>
        </nav>
        <div className="mobile-menu-cta">
          <Button href={site.phoneHref} icon="Phone">Call {site.phone}</Button>
          <Button to="/request-care" variant="gold">{site.primaryCtaLabel}</Button>
        </div>
      </aside>
    </>
  );
}
