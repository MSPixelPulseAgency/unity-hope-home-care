import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { SectionTitle } from "../ui/SectionTitle";

const confidencePoints = [
  {
    icon: "ShieldCheck",
    title: "Carefully screened and trained",
    text: "The Unity & Hope brochure confirms that caregivers are carefully screened and trained for dependable non-medical support.",
  },
  {
    icon: "MessageCircleHeart",
    title: "Preferences come first",
    text: "The first conversation covers routines, comfort, communication preferences and the kind of help that would feel welcome.",
  },
  {
    icon: "UserCheck",
    title: "A thoughtful care match",
    text: "Care needs, schedule and personal preferences help guide an appropriate caregiver match and personalized plan.",
  },
  {
    icon: "UsersRound",
    title: "Family-centered planning",
    text: "With the client's permission, family members can be part of the care conversation and ongoing planning.",
  },
];

export function CaregiverConfidence() {
  return (
    <section className="section caregiver-confidence-section">
      <div className="container caregiver-confidence-layout">
        <div className="caregiver-confidence-media reveal">
          <img
            src="/images/mobility-support-at-home.webp"
            alt="A caregiver walking beside an older woman and offering steady support at home"
            width="1600"
            height="1067"
            loading="lazy"
          />
          <p className="media-disclosure">Illustrative photography. Models shown are not identified as Unity & Hope clients or employees.</p>
        </div>
        <div className="caregiver-confidence-copy reveal reveal-delay">
          <SectionTitle
            eyebrow="Meet Our Care Approach"
            title="A thoughtful caregiver match starts with listening"
            description="Families deserve a clear process, respectful communication and a plan built around the person receiving care."
            align="left"
          />
          <div className="confidence-point-grid">
            {confidencePoints.map((point) => (
              <article className="confidence-point" key={point.title}>
                <span><Icon name={point.icon} size={24} /></span>
                <div><h3>{point.title}</h3><p>{point.text}</p></div>
              </article>
            ))}
          </div>
          <Button to="/request-care" icon="HeartHandshake">Talk About Care</Button>
        </div>
      </div>
    </section>
  );
}
