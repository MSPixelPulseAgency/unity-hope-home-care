import { siteConfig } from "../config/siteConfig";
import { HomeHero } from "../components/sections/HomeHero";
import { ServicesGrid } from "../components/sections/ServicesGrid";
import { WhyAndProcess } from "../components/sections/WhyAndProcess";
import { ServiceArea } from "../components/sections/ServiceArea";
import { ValuesSection } from "../components/sections/ValuesSection";
import { AcceptedPlans } from "../components/sections/AcceptedPlans";
import { HomeStory } from "../components/sections/HomeStory";
import { Seo } from "../components/ui/Seo";
import { Accordion } from "../components/ui/Accordion";
import { SectionTitle } from "../components/ui/SectionTitle";

const faqItems = [
  { question: "What type of care does Unity & Hope provide?", answer: "Unity & Hope provides personalized non-medical home care, including personal care assistance, companionship, meal preparation, light housekeeping, medication reminders, respite care and errands." },
  { question: "Which area does Unity & Hope serve?", answer: "Montgomery County is our primary service area, with surrounding counties shown in our supplied service materials. Call us to confirm service for your exact location." },
  { question: "How do we get started?", answer: "Call 937-221-9764 or submit the Request Care form. We will learn about your needs and preferences before creating a personalized care plan." },
  { question: "Do you accept private pay or managed care plans?", answer: "Unity & Hope accepts private pay and works with the managed care organizations listed on this site. Coverage varies by program, so please contact us to confirm eligibility and coverage." },
];

export default function Home() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["LocalBusiness", "HomeAndConstructionBusiness"],
        "@id": `${siteConfig.siteUrl}/#business`,
        name: siteConfig.companyName,
        url: siteConfig.siteUrl,
        telephone: "+1-937-221-9764",
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
        areaServed: "Montgomery County, Ohio and surrounding areas",
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
      <ServiceArea />
      <HomeStory />
      <ValuesSection />
      <AcceptedPlans />
      <section className="section faq-section">
        <div className="container faq-layout">
          <SectionTitle eyebrow="Frequently Asked Questions" title="Helpful answers before you call" description="Every care need is personal. These answers offer a simple starting point." align="left" />
          <Accordion items={faqItems} />
        </div>
      </section>
    </>
  );
}

