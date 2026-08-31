import { Seo } from "../components/ui/Seo";
import { PageHero } from "../components/ui/PageHero";
import { ServiceArea } from "../components/sections/ServiceArea";
import { SectionTitle } from "../components/ui/SectionTitle";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { pageSeo } from "../data/seo";
import { useManagedContent } from "../context/ContentContext";

export default function ServiceAreas() {
  const { content, visibleAreas: serviceAreas } = useManagedContent();
  const { serviceAreaContent, site: siteConfig } = content;
  return (
    <>
      <Seo {...(content.seo.serviceAreas || pageSeo.serviceAreas)} />
      <PageHero eyebrow="Our Service Area" title="Close to Home. Focused on Community." description={`${serviceAreaContent.primaryArea} is the verified center of our service region. Call us to confirm availability for your exact address.`} image="/images/caregiver-welcome.webp" imageAlt="A caregiver warmly greeting an older woman at home" breadcrumbs={[{ label: "Service Areas" }]} />
      <ServiceArea compact />
      <section className="section county-list-section">
        <div className="container">
          <SectionTitle eyebrow="Service Region" title="Montgomery County & surrounding areas" description={serviceAreaContent.locationConfirmation} />
          <div className="county-card-grid">
            {serviceAreas.map((area) => <article className={`county-card ${area.primary ? "county-card-primary" : ""}`} key={area.name}><Icon name={area.primary ? "Star" : "MapPin"} size={25} /><h3>{area.name}</h3>{area.primary && <p>Primary verified service region, including its cities and townships.</p>} {!area.primary && <p>Shown in supplied service materials; call to confirm current availability.</p>}</article>)}
          </div>
        </div>
      </section>
      <section className="section location-cta"><div className="container location-cta-inner"><div><p className="eyebrow eyebrow-light">Not sure if we serve your area?</p><h2>Call us and we’ll confirm your location.</h2></div><Button href={siteConfig.phoneHref} variant="gold" icon="Phone">{siteConfig.phone}</Button></div></section>
    </>
  );
}
