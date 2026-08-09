import { Link, useParams } from "react-router-dom";
import { getServiceBySlug, services } from "../data/services";
import { Seo } from "../components/ui/Seo";
import { PageHero } from "../components/ui/PageHero";
import { SectionTitle } from "../components/ui/SectionTitle";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import NotFound from "./NotFound";

export default function ServiceDetail() {
  const { slug } = useParams();
  const service = getServiceBySlug(slug);
  if (!service) return <NotFound />;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${service.title} - Unity & Hope Home Care LLC`,
    description: service.description,
    provider: { "@type": "LocalBusiness", name: "Unity & Hope Home Care LLC", telephone: "+1-937-221-9764" },
    areaServed: "Montgomery County, Ohio and surrounding areas",
    serviceType: `Non-medical ${service.title}`,
  };

  return (
    <>
      <Seo title={`${service.title} in Montgomery County | Unity & Hope`} description={`${service.description} Learn how Unity & Hope provides personalized non-medical ${service.title.toLowerCase()} in Riverside and Montgomery County, Ohio.`} path={`/services/${service.slug}`} schema={schema} />
      <PageHero eyebrow="Non-Medical Home Care" title={service.title} description={service.description} image={service.image} imageAlt={`${service.title} support in a comfortable home setting`} breadcrumbs={[{ label: "Services", to: "/services" }, { label: service.shortTitle }]} />
      <section className="section detail-section">
        <div className="container detail-grid">
          <article className="detail-copy reveal">
            <SectionTitle eyebrow="Personalized Support" title="Care shaped around daily life" align="left" />
            <p className="lead">{service.intro}</p>
            <p>We begin by listening to the client and family. The care plan reflects preferred routines, communication needs, scheduling and the kind of support that feels comfortable.</p>
            <h2>Support may include</h2>
            <ul className="detail-list">{service.examples.map((example) => <li key={example}><Icon name="Check" size={18} />{example}</li>)}</ul>
            {service.note && <div className="service-note"><Icon name="ShieldCheck" size={23} /><p>{service.note}</p></div>}
            <div className="inline-actions"><Button to="/request-care">Request This Service</Button><Button to="/contact" variant="outline">Ask a Question</Button></div>
          </article>
          <aside className="detail-sidebar reveal reveal-delay">
            <p className="eyebrow">Our Services</p>
            <nav aria-label="Other home care services">
              {services.map((item) => <Link className={item.slug === slug ? "active" : ""} to={`/services/${item.slug}`} key={item.slug}><Icon name={item.icon} size={18} />{item.shortTitle}<Icon name="ArrowRight" size={15} /></Link>)}
            </nav>
            <div className="sidebar-call"><Icon name="Phone" size={27} /><h3>Let's talk about care.</h3><p>Start with a free in-home consultation.</p><a href="tel:+19372219764">937-221-9764</a></div>
          </aside>
        </div>
      </section>
    </>
  );
}

