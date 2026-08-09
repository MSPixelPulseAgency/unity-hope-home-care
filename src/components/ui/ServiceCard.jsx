import { Link } from "react-router-dom";
import { Icon } from "./Icon";

export function ServiceCard({ service, featured = false }) {
  return (
    <article className={`service-card reveal ${featured ? "service-card-featured" : ""}`}>
      <div className="service-card-icon"><Icon name={service.icon} size={31} /></div>
      <h3>{service.title}</h3>
      <p>{service.description}</p>
      <Link to={`/services/${service.slug}`}>
        Learn More <Icon name="ArrowRight" size={16} />
      </Link>
    </article>
  );
}

