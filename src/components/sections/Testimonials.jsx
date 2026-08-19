import { testimonialSectionContent, testimonials } from "../../data/testimonials";
import { SectionTitle } from "../ui/SectionTitle";

export function Testimonials() {
  if (!testimonials.length) return null;

  return (
    <section className="section testimonials-section">
      <div className="container">
        <SectionTitle {...testimonialSectionContent} />
        <div className="testimonial-grid">
          {testimonials.map((testimonial) => (
            <figure className="testimonial-card reveal" key={`${testimonial.name}-${testimonial.quote}`}>
              <blockquote>“{testimonial.quote}”</blockquote>
              <figcaption>
                <strong>{testimonial.name}</strong>
                {testimonial.relationship && <span>{testimonial.relationship}</span>}
                {testimonial.source && <small>{testimonial.source}</small>}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
