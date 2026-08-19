import { Link } from "react-router-dom";
import { Icon } from "./Icon";

export function ServiceCard({ service, featured = false, number }) {
  return (
    <article className={`service-card reveal ${featured ? "service-card-featured" : ""}`}>
      {featured ? (
        <div className="service-card-heading-row">
          <div className="service-card-icon"><Icon name={service.icon} size={31} /></div>
          {number && <span className="service-number" aria-hidden="true">{number}</span>}
        </div>
      ) : <div className="service-card-icon"><Icon name={service.icon} size={31} /></div>}
      <h3>{service.title}</h3>
      <p>{service.description}</p>
      <Link to={`/services/${service.slug}`}>
        Learn More <span className="sr-only">about {service.title}</span><Icon name="ArrowRight" size={16} />
      </Link>
    </article>
  );
}
