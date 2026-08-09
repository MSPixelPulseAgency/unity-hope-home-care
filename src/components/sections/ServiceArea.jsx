import { serviceAreas } from "../../data/serviceAreas";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { SectionTitle } from "../ui/SectionTitle";

export function ServiceArea({ compact = false }) {
  return (
    <section className={`section service-area-section ${compact ? "service-area-compact" : ""}`}>
      <div className="container service-area-layout">
        <div className="service-area-copy reveal">
          <SectionTitle
            eyebrow="Our Service Area"
            title="Proudly serving Montgomery County & surrounding areas"
            description="Unity & Hope is locally owned and community focused, with Riverside and Dayton at the heart of our service region."
            align="left"
          />
          <div className="area-note"><Icon name="MapPin" size={22} /><span><strong>Montgomery County</strong><br />Including cities and townships</span></div>
          <Button to="/service-areas" variant="outline">View All Areas We Serve</Button>
        </div>
        <div className="county-map reveal reveal-delay" role="img" aria-label="Stylized service area highlighting Montgomery County with surrounding counties">
          {serviceAreas.map((area) => (
            <div
              className={`county-tile ${area.primary ? "county-primary" : ""}`}
              style={{ gridArea: area.gridArea }}
              key={area.name}
            >
              <span>{area.name}</span>
              {area.primary && <><Icon name="Star" size={24} fill="currentColor" /><small>{area.detail}</small></>}
            </div>
          ))}
          <div className="map-label">Montgomery County & Neighbors</div>
        </div>
      </div>
    </section>
  );
}

