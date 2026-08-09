import { educationalVideos, trustedFamilyResources } from "../../data/educationalResources";
import { Icon } from "../ui/Icon";
import { SectionTitle } from "../ui/SectionTitle";

export function EducationalMedia() {
  return (
    <section className="section educational-media-section">
      <div className="container">
        <SectionTitle
          eyebrow="Trusted Family Education"
          title="Helpful guidance from official health organizations"
          description="Learn about fall prevention, caregiving and aging at home through official CDC and National Institute on Aging resources."
        />
        <div className="education-video-grid">
          {educationalVideos.map((video) => (
            <article className="education-video-card reveal" key={video.embedUrl}>
              <div className="video-frame">
                <iframe
                  src={video.embedUrl}
                  title={`${video.title} - ${video.source}`}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
              <div className="education-video-copy">
                <p className="resource-source">{video.source}</p>
                <h3>{video.title}</h3>
                <p>{video.description}</p>
                <a className="text-link" href={video.watchUrl} target="_blank" rel="noreferrer">
                  Watch on the official channel <span className="sr-only">(opens in a new tab)</span><Icon name="ArrowRight" size={18} />
                </a>
              </div>
            </article>
          ))}
        </div>
        <div className="trusted-resource-grid">
          {trustedFamilyResources.map((resource) => (
            <a className="trusted-resource-card" href={resource.url} target="_blank" rel="noreferrer" key={resource.url}>
              <span className="trusted-resource-icon"><Icon name="ListChecks" size={25} /></span>
              <span><small>{resource.source}</small><strong>{resource.title}</strong><span>{resource.description}</span></span>
              <Icon name="ArrowRight" size={21} />
              <span className="sr-only">Opens in a new tab</span>
            </a>
          ))}
        </div>
        <p className="education-disclaimer"><Icon name="ShieldCheck" size={20} /> These independent third-party resources are provided for education only. They do not replace advice from a licensed healthcare professional, and their inclusion does not imply an endorsement or affiliation.</p>
      </div>
    </section>
  );
}
