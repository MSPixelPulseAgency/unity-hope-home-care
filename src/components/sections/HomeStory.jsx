import { Link } from "react-router-dom";
import { resources } from "../../data/resources";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { SectionTitle } from "../ui/SectionTitle";

export function HomeStory() {
  return (
    <>
      <section className="section care-people-section">
        <div className="container care-people-grid">
          <div className="care-collage reveal">
            <img className="care-image-main" src="/images/brochure-caregiver.webp" alt="A Unity and Hope caregiver speaking warmly with an older woman at home" width="670" height="473" loading="lazy" />
            <img className="care-image-secondary" src="/images/family-cooking.webp" alt="A grandmother and family members preparing a meal together" width="1600" height="2400" loading="lazy" />
            <div className="care-collage-note"><Icon name="Heart" size={20} /> Family-centered support</div>
          </div>
          <div className="care-people-copy reveal reveal-delay">
            <SectionTitle eyebrow="Care Built Around People" title="The comfort of home. The reassurance of dependable support." align="left" />
            <p>Unity & Hope provides compassionate, dependable and personalized non-medical care in the comfort of clients' homes.</p>
            <p>Our mission is to enhance quality of life by promoting independence, protecting dignity and bringing peace of mind to clients and their families.</p>
            <div className="privacy-preview">
              <Icon name="LockKeyhole" size={25} />
              <div><h3>Your privacy matters</h3><p>We are committed to confidential practices and respectful handling of personal information.</p></div>
            </div>
            <div className="inline-actions"><Button to="/about">Our Story</Button><Button to="/privacy" variant="text">Privacy Principles</Button></div>
          </div>
        </div>
      </section>

      <section className="trust-statements">
        <div className="container">
          <SectionTitle eyebrow="Care Built Around People" title="Support that feels personal, respectful and reassuring" light />
          <div className="trust-statement-grid">
            <article><Icon name="MessageCircleHeart" size={27} /><h3>Warm communication</h3><p>Clear, compassionate conversations with clients and families.</p></article>
            <article><Icon name="UserCheck" size={27} /><h3>Personalized routines</h3><p>Care shaped around needs, goals, comfort and preferences.</p></article>
            <article><Icon name="ShieldCheck" size={27} /><h3>Dependable support</h3><p>Carefully screened and trained caregivers focused on well-being.</p></article>
          </div>
        </div>
      </section>

      <section className="section resources-preview">
        <div className="container">
          <SectionTitle eyebrow="Helpful Resources" title="Clear guidance for families" description="Practical, non-medical information to help families feel more prepared." />
          <div className="resource-grid resource-grid-preview">
            {resources.slice(0, 3).map((resource) => (
              <article className="resource-card reveal" key={resource.slug}>
                <Link className="resource-image" to={`/resources/${resource.slug}`}>
                  <img src={resource.image} alt="" width="520" height="350" loading="lazy" />
                </Link>
                <div><span>{resource.readTime}</span><h3><Link to={`/resources/${resource.slug}`}>{resource.title}</Link></h3><p>{resource.excerpt}</p><Link className="text-link" to={`/resources/${resource.slug}`}>Read Article <Icon name="ArrowRight" size={16} /></Link></div>
              </article>
            ))}
          </div>
          <div className="section-action"><Button to="/resources" variant="outline">Explore All Resources</Button></div>
        </div>
      </section>

      <section className="section careers-banner">
        <div className="container careers-banner-inner">
          <img src="/images/caregiver-team.webp" alt="Caregivers and older adults together in a home setting" width="1600" height="1068" loading="lazy" />
          <div><p className="eyebrow eyebrow-light">Careers at Unity & Hope</p><h2>Join a team built around compassion.</h2><p>If you value dignity, reliability and meaningful support at home, we would like to hear from you.</p><Button to="/careers" variant="gold">Explore Caregiver Careers</Button></div>
        </div>
      </section>
    </>
  );
}

