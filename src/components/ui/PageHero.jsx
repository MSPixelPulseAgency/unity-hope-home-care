import { Link } from "react-router-dom";
import { Icon } from "./Icon";

export function PageHero({ eyebrow, title, description, image, imageAlt, breadcrumbs = [] }) {
  return (
    <section className="page-hero">
      <div className="page-hero-glow" aria-hidden="true" />
      <div className="container page-hero-grid">
        <div className="page-hero-copy reveal">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            {breadcrumbs.map((crumb, index) => (
              <span key={`${crumb.label}-${index}`}>
                <span aria-hidden="true">/</span>
                {crumb.to ? <Link to={crumb.to}>{crumb.label}</Link> : <span aria-current="page">{crumb.label}</span>}
              </span>
            ))}
          </nav>
          {eyebrow && <p className="eyebrow eyebrow-light">{eyebrow}</p>}
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {image && (
          <div className="page-hero-media reveal reveal-delay">
            <img src={image} alt={imageAlt} width="720" height="520" />
            <div className="page-hero-badge">
              <Icon name="Heart" size={18} />
              <span>Compassion. Dignity. Care.</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

