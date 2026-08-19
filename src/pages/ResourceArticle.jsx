import { Link, useParams } from "react-router-dom";
import { getResourceBySlug, resources } from "../data/resources";
import { Seo } from "../components/ui/Seo";
import { PageHero } from "../components/ui/PageHero";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import NotFound from "./NotFound";
import { siteConfig } from "../config/siteConfig";

export default function ResourceArticle() {
  const { slug } = useParams();
  const resource = getResourceBySlug(slug);
  if (!resource) return <NotFound />;
  const related = resources.filter((item) => item.slug !== slug).slice(0, 3);

  return (
    <>
      <Seo title={resource.seoTitle || `${resource.title} | Unity & Hope Resources`} description={resource.seoDescription || resource.excerpt} path={`/resources/${resource.slug}`} image={resource.image} />
      <PageHero eyebrow={resource.readTime} title={resource.title} description={resource.excerpt} image={resource.image} imageAlt={`Illustration for ${resource.title}`} breadcrumbs={[{ label: "Resources", to: "/resources" }, { label: resource.title }]} />
      <section className="section article-section">
        <div className="container article-layout">
          <article className="article-body reveal">
            <div className="article-disclaimer"><Icon name="ShieldCheck" size={22} /><p>This article provides general, non-medical information. It is not medical advice, diagnosis or treatment.</p></div>
            {(resource.author || resource.publishedDate || resource.source) && <p className="article-meta">{[resource.author, resource.publishedDate, resource.source].filter(Boolean).join(" · ")}</p>}
            {resource.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2><p>{section.body}</p></section>)}
            <div className="article-cta"><h2>Want to talk about support at home?</h2><p>Call Unity & Hope or request a free in-home consultation.</p><div className="inline-actions"><Button to="/request-care">Request Care</Button><Button href={siteConfig.phoneHref} variant="outline" icon="Phone">{siteConfig.phone}</Button></div></div>
          </article>
          <aside className="related-resources reveal reveal-delay"><p className="eyebrow">Related Resources</p>{related.map((item) => <Link key={item.slug} to={`/resources/${item.slug}`}><span>{item.readTime}</span><strong>{item.title}</strong><Icon name="ArrowRight" size={16} /></Link>)}</aside>
        </div>
      </section>
    </>
  );
}
