import { Seo } from "../components/ui/Seo";
import { PageHero } from "../components/ui/PageHero";
import { ReviewForm } from "../components/ui/ReviewForm";
import { Testimonials } from "../components/sections/Testimonials";
import { Icon } from "../components/ui/Icon";
import { pageSeo } from "../data/seo";

export default function Reviews() {
  return (
    <>
      <Seo {...pageSeo.reviews} />
      <PageHero eyebrow="Share Your Experience" title="Your Feedback Matters." description="Tell us about your experience with Unity & Hope. Every review is checked before it is published to protect families' privacy." image="/images/caregiver-welcome.webp" imageAlt="A professional caregiver sharing a warm conversation with an older adult" breadcrumbs={[{ label: "Reviews" }]} />
      <section className="section form-page-section review-page-section">
        <div className="container form-page-grid">
          <aside className="form-contact-panel reveal">
            <p className="eyebrow eyebrow-light">Respectful Review Process</p>
            <h2>Thank you for sharing.</h2>
            <p>Your feedback helps families understand the care and support Unity &amp; Hope provides.</p>
            <ul>
              <li><Icon name="ShieldCheck" size={22} /><span><small>Private first</small>Reviews remain private until approved.</span></li>
              <li><Icon name="Eye" size={22} /><span><small>Careful review</small>Personal or sensitive details should not be included.</span></li>
              <li><Icon name="HeartHandshake" size={22} /><span><small>Honest feedback</small>Only approved, consented reviews appear publicly.</span></li>
            </ul>
          </aside>
          <div className="form-card reveal reveal-delay">
            <div className="form-card-heading">
              <p className="eyebrow">Submit a Review</p>
              <h2>Share your experience</h2>
              <p>Fields marked with * are required.</p>
            </div>
            <ReviewForm />
          </div>
        </div>
      </section>
      <Testimonials />
    </>
  );
}
