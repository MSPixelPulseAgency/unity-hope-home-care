import { useEffect, useState } from "react";
import { testimonialSectionContent } from "../../data/testimonials";
import { SectionTitle } from "../ui/SectionTitle";

export function Testimonials() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/reviews", { signal: controller.signal, headers: { Accept: "application/json" } })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Reviews unavailable")))
      .then((result) => setReviews(Array.isArray(result.reviews) ? result.reviews : []))
      .catch((error) => {
        if (error.name !== "AbortError") setReviews([]);
      });
    return () => controller.abort();
  }, []);

  if (!reviews.length) return null;

  return (
    <section className="section testimonials-section" aria-labelledby="approved-reviews-heading">
      <div className="container">
        <div id="approved-reviews-heading"><SectionTitle {...testimonialSectionContent} /></div>
        <div className="testimonial-grid">
          {reviews.map((review) => (
            <figure className="testimonial-card reveal" key={review.id}>
              {review.rating && <div className="review-stars" role="img" aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(review.rating)}<span aria-hidden="true">{"☆".repeat(5 - review.rating)}</span></div>}
              <blockquote>“{review.reviewText}”</blockquote>
              <figcaption>
                <strong>{review.name}</strong>
                <span>{review.relationship}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
