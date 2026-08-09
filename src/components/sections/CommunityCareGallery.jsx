import { SectionTitle } from "../ui/SectionTitle";

const galleryImages = [
  {
    src: "/images/unity-hope-hero-clean.webp",
    alt: "A Black caregiver in purple scrubs sharing a warm conversation with an older woman at home",
  },
  {
    src: "/images/family-generations.webp",
    alt: "A grandmother enjoying time at home with two young family members",
  },
  {
    src: "/images/senior-couple-at-home.webp",
    alt: "An older couple smiling together outside their home",
  },
  {
    src: "/images/family-cooking.webp",
    alt: "An older woman and a child preparing food together in a bright kitchen",
  },
];

export function CommunityCareGallery() {
  return (
    <section className="section community-gallery-section">
      <div className="container">
        <SectionTitle
          eyebrow="Care for Every Family"
          title="Warm, respectful support for a multicultural community"
          description="Home care is personal. Unity & Hope welcomes conversations with older adults, caregivers and families throughout Montgomery County and surrounding areas."
        />
        <div className="community-gallery" aria-label="Illustrative home care and family photography">
          {galleryImages.map((image, index) => (
            <figure className={`community-gallery-item community-gallery-item-${index + 1} reveal`} key={image.src}>
              <img src={image.src} alt={image.alt} width="900" height="675" loading="lazy" />
            </figure>
          ))}
        </div>
        <p className="gallery-disclosure">Illustrative photography represents the diverse families home care can support.</p>
      </div>
    </section>
  );
}
