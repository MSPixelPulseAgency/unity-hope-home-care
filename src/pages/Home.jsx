import { externalProfiles, siteConfig } from "../config/siteConfig";
import { HomeHero } from "../components/sections/HomeHero";
import { ServicesGrid } from "../components/sections/ServicesGrid";
import { WhyAndProcess } from "../components/sections/WhyAndProcess";
import { ServiceArea } from "../components/sections/ServiceArea";
import { ValuesSection } from "../components/sections/ValuesSection";
import { AcceptedPlans } from "../components/sections/AcceptedPlans";
import { HomeStory } from "../components/sections/HomeStory";
import { CaregiverConfidence } from "../components/sections/CaregiverConfidence";
import { CommunityCareGallery } from "../components/sections/CommunityCareGallery";
import { EducationalMedia } from "../components/sections/EducationalMedia";
import { EmergencyHelp } from "../components/sections/EmergencyHelp";
import { services } from "../data/services";
import { Seo } from "../components/ui/Seo";
import { Accordion } from "../components/ui/Accordion";
import { SectionTitle } from "../components/ui/SectionTitle";
import { homepageContent } from "../data/content";
import { pageSeo } from "../data/seo";
import { Testimonials } from "../components/sections/Testimonials";

export default function Home() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "LocalBusiness"],
        "@id": `${siteConfig.siteUrl}/#business`,
        name: siteConfig.companyName,
        url: siteConfig.siteUrl,
        logo: `${siteConfig.siteUrl}/brand/unity-hope-logo.png`,
        telephone: siteConfig.phoneHref.replace("tel:", ""),
        email: siteConfig.email,
        image: `${siteConfig.siteUrl}/og.jpg`,
        description: siteConfig.description,
        address: {
          "@type": "PostalAddress",
          streetAddress: siteConfig.addressLine1,
          addressLocality: siteConfig.city,
          addressRegion: siteConfig.stateCode,
          postalCode: siteConfig.postalCode,
          addressCountry: "US",
        },
        areaServed: {
          "@type": "AdministrativeArea",
          name: "Montgomery County, Ohio and surrounding areas",
        },
        contactPoint: {
          "@type": "ContactPoint",
          telephone: siteConfig.phoneHref.replace("tel:", ""),
          contactType: "customer service",
          areaServed: "US-OH",
          availableLanguage: "English",
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Non-medical home care services",
          itemListElement: services.map((service) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: service.title,
              url: `${siteConfig.siteUrl}/services/${service.slug}`,
              description: service.description,
            },
          })),
        },
        openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "17:00" }],
        ...(externalProfiles.length ? { sameAs: externalProfiles } : {}),
      },
      {
        "@type": "FAQPage",
        mainEntity: homepageContent.faqs.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })),
      },
    ],
  };

  return (
    <>
      <Seo
        {...pageSeo.home}
        schema={schema}
      />
      <HomeHero />
      <ServicesGrid />
      <WhyAndProcess />
      <CaregiverConfidence />
      <Testimonials />
      <ServiceArea />
      <CommunityCareGallery />
      <HomeStory />
      <ValuesSection />
      <AcceptedPlans />
      <EducationalMedia />
      <section className="section faq-section">
        <div className="container faq-layout">
          <SectionTitle eyebrow="Frequently Asked Questions" title="Helpful answers before you call" description="Every care need is personal. These answers offer a simple starting point." align="left" />
          <Accordion items={homepageContent.faqs} />
        </div>
      </section>
      <EmergencyHelp />
    </>
  );
}
