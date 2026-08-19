export const siteConfig = {
  companyName: "Unity & Hope Home Care LLC",
  shortName: "Unity & Hope",
  headline: "Compassionate Care. Right at Home.",
  tagline: "Compassion. Dignity. Care.",
  secondaryTagline: "Unity in Purpose. Hope in Every Home.",
  description:
    "Compassionate, dependable and personalized non-medical care in the comfort of your home.",
  phone: "937-221-9764",
  phoneHref: "tel:+19372219764",
  fax: "937-496-5220",
  email: "uhhomehealthllc@gmail.com",
  emailHref: "mailto:uhhomehealthllc@gmail.com",
  addressLine1: "101 Woodman Dr. Suite 212B",
  city: "Riverside",
  state: "Ohio",
  stateCode: "OH",
  postalCode: "45431",
  fullAddress: "101 Woodman Dr. Suite 212B, Riverside, Ohio 45431",
  serviceRegion: "Montgomery County and surrounding areas",
  hours: {
    weekdaysLabel: "Monday - Friday",
    weekdays: "9:00 AM - 5:00 PM",
    weekendsLabel: "Saturday & Sunday",
    weekends: "Closed",
  },
  siteUrl: "https://unityhope.vercel.app",
  googleBusinessProfileUrl: null,
  socials: {
    facebook: null,
    instagram: null,
    linkedin: null,
  },
};

export const externalProfiles = [
  siteConfig.googleBusinessProfileUrl,
  ...Object.values(siteConfig.socials),
].filter(Boolean);

export const mainNavigation = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Our Services", to: "/services" },
  { label: "Service Area", to: "/service-areas" },
  { label: "Resources", to: "/resources" },
  { label: "Careers", to: "/careers" },
  { label: "Contact Us", to: "/contact" },
];
