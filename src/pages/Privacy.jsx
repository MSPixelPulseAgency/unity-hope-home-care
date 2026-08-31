import { Seo } from "../components/ui/Seo";
import { PageHero } from "../components/ui/PageHero";
import { SectionTitle } from "../components/ui/SectionTitle";
import { Icon } from "../components/ui/Icon";
import { pageSeo } from "../data/seo";
import { useManagedContent } from "../context/ContentContext";

const privacyPoints = [
  ["LockKeyhole", "Secure handling", "Personal information should be accessed and handled only for appropriate business and care-related purposes."],
  ["ShieldCheck", "Confidential practices", "Caregiver practices should respect the confidentiality of client and family information."],
  ["HeartHandshake", "Respect for privacy", "Clients deserve privacy, dignity and respectful communication at all times."],
];

export default function Privacy() {
  const { content } = useManagedContent();
  const siteConfig = content.site;
  return (
    <>
      <Seo {...(content.seo.privacy || pageSeo.privacy)} />
      <PageHero eyebrow="Your Privacy Matters" title="Confidentiality. Respect. Care." description="How Unity & Hope approaches client privacy and information submitted through this website." image="/images/caregiver-attentive.webp" imageAlt="A caregiver providing attentive, respectful support to an older woman" breadcrumbs={[{ label: "Privacy" }]} />
      <section className="section privacy-page">
        <div className="container">
          <SectionTitle eyebrow="Our Commitment" title="Privacy is part of dignified care" description="Unity & Hope Home Care LLC is committed to protecting the confidentiality of client information in accordance with applicable privacy standards, including the principles described in its provided privacy materials." />
          <div className="privacy-point-grid">{privacyPoints.map(([icon, title, text]) => <article key={title}><Icon name={icon} size={29} /><h2>{title}</h2><p>{text}</p></article>)}</div>
          <article className="legal-copy">
            <h2>Website privacy policy</h2>
            <p><strong>Information you submit.</strong> When you use a contact, care request, career or review form, the website may collect the information you choose to provide. This may include your name, contact details, location, message, résumé or review.</p>
            <p><strong>How information is used.</strong> Submitted information is used to respond to inquiries, discuss services, review career interest or moderate visitor feedback. Do not submit Social Security numbers, financial account details, medical records or other highly sensitive information through a website form.</p>
            <p><strong>Form delivery.</strong> Website forms are delivered through configured hosting and email providers. Information may be processed by those providers to transmit the message.</p>
            <p><strong>Reviews.</strong> Review submissions are stored privately while awaiting approval. Only reviews with the submitter's consent and an approved status are displayed publicly. Declined reviews are not published.</p>
            <p><strong>Basic technical information.</strong> Hosting providers may process standard technical data such as IP address, browser type and request logs for security, reliability and operation.</p>
            <p><strong>Contact.</strong> Questions about privacy can be directed to <a href={siteConfig.emailHref}>{siteConfig.email}</a> or <a href={siteConfig.phoneHref}>{siteConfig.phone}</a>.</p>
          </article>
        </div>
      </section>
    </>
  );
}
