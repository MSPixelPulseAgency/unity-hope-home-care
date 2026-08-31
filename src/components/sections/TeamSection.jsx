import { SectionTitle } from "../ui/SectionTitle";
import { useManagedContent } from "../../context/ContentContext";

export function TeamSection() {
  const { content, visibleTeam } = useManagedContent();
  if (!visibleTeam.length) return null;

  return (
    <section className="section team-section">
      <div className="container">
        <SectionTitle {...content.teamSection} />
        <div className="team-grid">
          {visibleTeam.map((member) => (
            <article className="team-card reveal" key={`${member.name}-${member.role}`}>
              <img src={member.image} alt={member.imageAlt} width="640" height="480" loading="lazy" />
              <div><p className="eyebrow">{member.role}</p><h3>{member.name}</h3><p>{member.bio}</p></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
