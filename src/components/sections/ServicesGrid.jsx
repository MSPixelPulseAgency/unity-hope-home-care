import { useManagedContent } from "../../context/ContentContext";
import { SectionTitle } from "../ui/SectionTitle";
import { ServiceCard } from "../ui/ServiceCard";
import { Button } from "../ui/Button";

export function ServicesGrid({ showIntro = true, limit }) {
  const { content, visibleServices: allServices } = useManagedContent();
  const visibleServices = limit ? allServices.slice(0, limit) : allServices;
  return (
    <section className="section services-section">
      <div className="container">
        {showIntro && (
          <SectionTitle
            {...content.home.servicesHeading}
          />
        )}
        <div className="services-grid">
          {visibleServices.map((service) => <ServiceCard key={service.slug} service={service} />)}
        </div>
        {limit && <div className="section-action"><Button to="/services" variant="outline">View All Services</Button></div>}
      </div>
    </section>
  );
}
