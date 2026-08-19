import { siteConfig } from "../config/siteConfig.js";

export const homepageContent = {
  hero: {
    kicker: "Unity & Hope Home Care LLC · Riverside, Ohio",
    title: "Compassionate Care.",
    titleAccent: "Right at Home.",
    description:
      "Personalized non-medical home care for older adults and families in Montgomery County and surrounding areas—supporting comfort, independence, dignity and peace of mind at home.",
    primaryCta: { label: "Get Started", to: "/request-care", icon: "Heart" },
    secondaryCta: { label: "Call Us Today", href: siteConfig.phoneHref, icon: "Phone" },
    highlights: [
      { icon: "ShieldCheck", lines: ["Carefully Screened", "Caregivers"] },
      { icon: "UserCheck", lines: ["Personalized", "Care Plans"] },
      { icon: "MapPin", lines: ["Montgomery County", "& Surrounding Areas"] },
    ],
  },
  whyChoose: [
    ["Heart", "Reliable & Compassionate Care"],
    ["ShieldCheck", "Carefully Screened & Trained Caregivers"],
    ["UserCheck", "Personalized Care Plans"],
    ["CalendarDays", "Flexible Scheduling"],
    ["UsersRound", "Family-Centered Communication"],
    ["Handshake", "Committed to Dignity & Respect"],
    ["MapPin", "Locally Owned & Community Focused"],
  ],
  careProcess: [
    { number: "1", icon: "Phone", title: "Contact Us", text: "Call or complete our online form." },
    { number: "2", icon: "ClipboardCheck", title: "Care Assessment", text: "We learn about needs and preferences." },
    { number: "3", icon: "UsersRound", title: "Personalized Plan", text: "We create a care plan that fits." },
    { number: "4", icon: "House", title: "Care Begins", text: "We match care needs with an appropriate caregiver." },
  ],
  caregiverConfidence: [
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
  ],
  faqs: [
    { question: "What type of care does Unity & Hope provide?", answer: "Unity & Hope provides personalized non-medical home care, including personal care assistance, companionship, meal preparation, light housekeeping, medication reminders, respite care and errands." },
    { question: "Which area does Unity & Hope serve?", answer: "Montgomery County is our primary service area. Availability in surrounding areas depends on the exact address and schedule, so please call us to confirm service for your location." },
    { question: "How do we get started?", answer: `Call ${siteConfig.phone} or submit the Get Started form. We will learn about your needs and preferences before creating a personalized care plan.` },
    { question: "Do you accept private pay or managed care plans?", answer: "Unity & Hope accepts private pay and works with the managed care organizations listed on this site. Coverage varies by program, so please contact us to confirm eligibility and coverage." },
    { question: "Can non-medical care support someone living with dementia or Alzheimer's disease?", answer: "Non-medical companionship, respite care and personal assistance may support everyday routines for some families affected by dementia or Alzheimer's disease. Unity & Hope does not provide medical care or claim specialized dementia treatment. Please call to discuss whether the available non-medical services fit your needs, and direct clinical questions to a licensed healthcare professional." },
    { question: "Is Unity & Hope a home health agency?", answer: "Unity & Hope provides non-medical home care rather than skilled home health services. Caregivers can assist with everyday routines and reminders, but they do not administer medication, diagnose conditions or replace licensed medical professionals." },
  ],
};

export const aboutContent = {
  mission: {
    eyebrow: "Our Mission",
    title: "Helping every client feel supported at home",
    lead: "Unity & Hope Home Care LLC provides compassionate, dependable and personalized non-medical care in the comfort of clients' homes.",
    paragraphs: [
      "Our mission is to enhance quality of life by promoting independence, protecting dignity and providing peace of mind for every client and their family.",
      "We take time to understand routines, preferences and goals so support can feel personal, comfortable and respectful.",
    ],
  },
  // Publish these only after the client supplies and approves factual copy.
  vision: null,
  founderStory: null,
};
