import { Link } from "react-router-dom";
import { Seo } from "../components/ui/Seo";
import { PageHero } from "../components/ui/PageHero";
import { SectionTitle } from "../components/ui/SectionTitle";
import { Icon } from "../components/ui/Icon";
import { pageSeo } from "../data/seo";
import { useManagedContent } from "../context/ContentContext";

export default function Resources() {
  const { content, publishedResources: resources } = useManagedContent();
  return (
    <>
      <Seo {...(content.seo.resources || pageSeo.resources)} />
      <PageHero eyebrow="Helpful Resources" title="Guidance for Care at Home." description="Practical, non-medical information to help families ask thoughtful questions and feel more prepared." image="/images/family-cooking.webp" imageAlt="A family preparing food together in a bright home" breadcrumbs={[{ label: "Resources" }]} />
      <section className="section resource-library" id="care-guides">
        <div className="container">
          <SectionTitle eyebrow="Resource Library" title="Start with the questions that matter to your family" description="These articles are educational only and do not provide diagnosis, treatment or personalized medical advice." />
          <div className="resource-grid">
            {resources.map((resource) => <article className="resource-card reveal" key={resource.slug}><Link className="resource-image" to={`/resources/${resource.slug}`}><img src={resource.image} alt={resource.imageAlt} width="520" height="350" loading="lazy" /></Link><div><span>{resource.readTime}</span><h2><Link to={`/resources/${resource.slug}`}>{resource.title}</Link></h2><p>{resource.excerpt}</p><Link className="text-link" to={`/resources/${resource.slug}`}>Read Article <Icon name="ArrowRight" size={16} /></Link></div></article>)}
          </div>
        </div>
      </section>
    </>
  );
}
