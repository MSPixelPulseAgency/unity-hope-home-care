import { serviceAreas } from "../data/serviceAreas";
import { Seo } from "../components/ui/Seo";
import { PageHero } from "../components/ui/PageHero";
import { ServiceArea } from "../components/sections/ServiceArea";
import { SectionTitle } from "../components/ui/SectionTitle";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";

export default function ServiceAreas() {
  return (
    <>
      <Seo title="Home Care Service Areas | Montgomery County, Ohio" description="Unity & Hope Home Care LLC proudly serves Montgomery County and surrounding areas from Riverside, Ohio. Call to confirm service for your location." path="/service-areas" />
      <PageHero eyebrow="Our Service Area" title="Close to Home. Focused on Community." description="Montgomery County is at the center of our service region, with Riverside, Dayton and surrounding areas close to our work." image="/images/caregiver-welcome.webp" imageAlt="A caregiver warmly greeting an older woman at home" breadcrumbs={[{ label: "Service Areas" }]} />
      <ServiceArea compact />
      <section className="section county-list-section">
        <div className="container">
          <SectionTitle eyebrow="Areas Shown in Our Service Materials" title="Montgomery County & surrounding counties" description="Availability can depend on the exact address and care schedule. Please call to confirm service for your location." />
          <div className="county-card-grid">
            {serviceAreas.map((area) => <article className={`county-card ${area.primary ? "county-card-primary" : ""}`} key={area.name}><Icon name={area.primary ? "Star" : "MapPin"} size={25} /><h3>{area.name}</h3>{area.primary && <p>Primary service region, including Riverside, Dayton, cities and townships.</p>} {!area.primary && <p>Surrounding service area shown in supplied Unity & Hope materials.</p>}</article>)}
          </div>
        </div>
      </section>
      <section className="section location-cta"><div className="container location-cta-inner"><div><p className="eyebrow eyebrow-light">Not sure if we serve your area?</p><h2>Call us and we’ll confirm your location.</h2></div><Button href="tel:+19372219764" variant="gold" icon="Phone">937-221-9764</Button></div></section>
    </>
  );
}

