import { services } from "../data/services";
import { Seo } from "../components/ui/Seo";
import { PageHero } from "../components/ui/PageHero";
import { ServiceCard } from "../components/ui/ServiceCard";
import { SectionTitle } from "../components/ui/SectionTitle";
import { Button } from "../components/ui/Button";
import { pageSeo } from "../data/seo";

export default function Services() {
  return (
    <>
      <Seo {...pageSeo.services} />
      <PageHero eyebrow="Our Services" title="Personalized Care Designed Around You." description="Non-medical support shaped around routines, comfort, dignity and independence." image="/images/unity-hope-hero.webp" imageAlt="A home caregiver in purple sharing a warm moment with an older woman" breadcrumbs={[{ label: "Services" }]} />
      <section className="section services-overview">
        <div className="container">
          <SectionTitle eyebrow="Seven Ways We Can Help" title="Practical support. Personal attention." description="Every care plan begins with a conversation about needs, preferences and daily life." />
          <div className="service-feature-list">
            {services.map((service, index) => (
              <article className={`service-feature reveal ${index % 2 ? "service-feature-reverse" : ""}`} key={service.slug}>
                <img src={service.image} alt={`${service.title} support at home`} width="720" height="520" loading="lazy" />
                <div><ServiceCard service={service} featured number={`0${index + 1}`} /><ul>{service.examples.slice(0, 3).map((example) => <li key={example}>{example}</li>)}</ul></div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section nonmedical-note">
        <div className="container nonmedical-note-inner"><div><p className="eyebrow eyebrow-light">Important Service Note</p><h2>Compassionate non-medical home care</h2><p>Unity & Hope's services support daily living and comfort. We do not provide skilled nursing, medical advice or medication administration.</p></div><Button to="/request-care" variant="gold">Talk About Your Needs</Button></div>
      </section>
    </>
  );
}
