import { Heart } from "lucide-react";

export function SectionTitle({ eyebrow, title, description, align = "center", light = false }) {
  return (
    <div className={`section-title section-title-${align} ${light ? "section-title-light" : ""}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <div className="title-ornament" aria-hidden="true">
        <span />
        <Heart size={13} fill="currentColor" />
        <span />
      </div>
      <h2>{title}</h2>
      {description && <p className="section-description">{description}</p>}
    </div>
  );
}

