import { siteConfig } from "../config/siteConfig";
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

const faqItems = [
  { question: "What type of care does Unity & Hope provide?", answer: "Unity & Hope provides personalized non-medical home care, including personal care assistance, companionship, meal preparation, light housekeeping, medication reminders, respite care and errands." },
  { question: "Which area does Unity & Hope serve?", answer: "Montgomery County is our primary service area, with surrounding counties shown in our supplied service materials. Call us to confirm service for your exact location." },
  { question: "How do we get started?", answer: `Call ${siteConfig.phone} or submit the Request Care form. We will learn about your needs and preferences before creating a personalized care plan.` },
  { question: "Do you accept private pay or managed care plans?", answer: "Unity & Hope accepts private pay and works with the managed care organizations listed on this site. Coverage varies by program, so please contact us to confirm eligibility and coverage." },
  { question: "Can non-medical care support someone living with dementia or Alzheimer's disease?", answer: "Non-medical companionship, respite care and personal assistance may support everyday routines for some families affected by dementia or Alzheimer's disease. Unity & Hope does not provide medical care or claim specialized dementia treatment. Please call to discuss whether the available non-medical services fit your needs, and direct clinical questions to a licensed healthcare professional." },
  { question: "Is Unity & Hope a home health agency?", answer: "Unity & Hope provides non-medical home care rather than skilled home health services. Caregivers can assist with everyday routines and reminders, but they do not administer medication, diagnose conditions or replace licensed medical professionals." },
];

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
      },
      {
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })),
      },
    ],
  };

  return (
    <>
      <Seo
        title="Unity & Hope Home Care LLC | Compassionate Home Care in Montgomery County"
        description="Compassionate, dependable non-medical home care in Riverside, Ohio, serving Montgomery County and surrounding areas. Request a free in-home consultation."
        schema={schema}
      />
      <HomeHero />
      <ServicesGrid />
      <WhyAndProcess />
      <CaregiverConfidence />
      <ServiceArea />
      <CommunityCareGallery />
      <HomeStory />
      <ValuesSection />
      <AcceptedPlans />
      <EducationalMedia />
      <section className="section faq-section">
        <div className="container faq-layout">
          <SectionTitle eyebrow="Frequently Asked Questions" title="Helpful answers before you call" description="Every care need is personal. These answers offer a simple starting point." align="left" />
          <Accordion items={faqItems} />
        </div>
      </section>
      <EmergencyHelp />
    </>
  );
}
