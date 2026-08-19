import { siteConfig } from "../config/siteConfig.js";

export const pageSeo = {
  home: {
    title: "Home Care Services in Montgomery County, Ohio | Unity & Hope Home Care LLC",
    description: "Compassionate, dependable non-medical home care in Riverside, Ohio, serving Montgomery County and surrounding areas. Get started with a free in-home consultation.",
    path: "/",
  },
  about: {
    title: "About Unity & Hope Home Care LLC | Riverside, Ohio",
    description: "Learn about Unity & Hope Home Care LLC's mission to support independence, dignity, comfort and peace of mind through personalized non-medical home care.",
    path: "/about",
  },
  services: {
    title: "Non-Medical Home Care Services | Unity & Hope",
    description: "Explore personal care, companion care, meal preparation, light housekeeping, medication reminders, respite care and errand support in Montgomery County, Ohio.",
    path: "/services",
  },
  serviceAreas: {
    title: "Home Care Service Areas | Montgomery County, Ohio",
    description: "Unity & Hope Home Care LLC serves Montgomery County and considers surrounding areas based on address and schedule. Call to confirm service for your location.",
    path: "/service-areas",
  },
  requestCare: {
    title: "Get Started With Home Care | Unity & Hope Home Care LLC",
    description: "Tell Unity & Hope about your care needs and request a free in-home consultation for non-medical home care in Montgomery County and surrounding areas.",
    path: "/request-care",
  },
  contact: {
    title: "Contact Unity & Hope Home Care LLC | Riverside, Ohio",
    description: `Contact Unity & Hope Home Care LLC in Riverside, Ohio. Call ${siteConfig.phone} for compassionate non-medical home care in Montgomery County.`,
    path: "/contact",
  },
  careers: {
    title: "Caregiver Careers | Unity & Hope Home Care LLC",
    description: "Explore caregiver opportunities with Unity & Hope Home Care LLC in Riverside and Montgomery County, Ohio. Join a team built around compassion, dignity and reliability.",
    path: "/careers",
  },
  resources: {
    title: "Home Care Resources | Unity & Hope",
    description: "Read clear, respectful resources about non-medical home care, respite care, companionship, home routines and questions families can ask a care provider.",
    path: "/resources",
  },
  privacy: {
    title: "Privacy Policy | Unity & Hope Home Care LLC",
    description: "Read Unity & Hope Home Care LLC's confidentiality principles and website privacy starter policy.",
    path: "/privacy",
  },
  notFound: {
    title: "Page Not Found | Unity & Hope Home Care LLC",
    description: "The page you requested could not be found.",
    path: "/404",
    noIndex: true,
  },
};
