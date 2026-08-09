import { services } from "../../data/services";
import { SectionTitle } from "../ui/SectionTitle";
import { ServiceCard } from "../ui/ServiceCard";
import { Button } from "../ui/Button";

export function ServicesGrid({ showIntro = true, limit }) {
  const visibleServices = limit ? services.slice(0, limit) : services;
  return (
    <section className="section services-section">
      <div className="container">
        {showIntro && (
          <SectionTitle
            eyebrow="Our Services"
            title="Care that fits everyday life"
            description="Personalized non-medical support designed around each client's routines, comfort and independence."
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

