import { siteConfig } from "../config/siteConfig.js";
import { homepageContent, aboutContent } from "./content.js";
import { services } from "./services.js";
import { serviceAreaContent, serviceAreas } from "./serviceAreas.js";
import { teamMembers, teamSectionContent } from "./team.js";
import { resources } from "./resources.js";
import { pageSeo } from "./seo.js";

const publishedDate = "2026-08-31";

export const defaultManagedContent = {
  version: 1,
  site: {
    ...siteConfig,
    socials: { ...siteConfig.socials },
    footerDescription: "Compassionate, personalized non-medical care in the comfort of home.",
    footerCtaEyebrow: "Now accepting new clients",
    footerCtaTitle: "Ready to talk about care at home?",
    footerCtaDescription: "Start with a free in-home consultation and a conversation about your family's needs.",
    primaryCtaLabel: "Get Started",
  },
  home: {
    hero: structuredClone(homepageContent.hero),
    servicesHeading: {
      eyebrow: "Our Services",
      title: "Care that fits everyday life",
      description: "Personalized non-medical support designed around each client's routines, comfort and independence.",
    },
    serviceAreaWording: "Proudly serving Montgomery County & surrounding areas",
    sectionVisibility: {
      services: true,
      process: true,
      caregiverConfidence: true,
      reviews: true,
      serviceArea: true,
      communityGallery: true,
      story: true,
      values: true,
      acceptedPlans: true,
      educationalMedia: true,
      faq: true,
      emergencyHelp: true,
    },
  },
  about: {
    mission: structuredClone(aboutContent.mission),
    vision: aboutContent.vision || "",
    founderStory: aboutContent.founderStory || "",
  },
  services: services.map((service, order) => ({
    ...structuredClone(service),
    order,
    hidden: false,
    tags: [],
    seoTitle: service.seoTitle || "",
    seoDescription: service.seoDescription || "",
  })),
  serviceAreas: serviceAreas.map((area, order) => ({
    ...structuredClone(area),
    order,
    hidden: false,
  })),
  serviceAreaContent: structuredClone(serviceAreaContent),
  team: teamMembers.map((member, order) => ({
    ...structuredClone(member),
    order,
    hidden: false,
  })),
  teamSection: structuredClone(teamSectionContent),
  resources: resources.map((resource, order) => ({
    ...structuredClone(resource),
    author: resource.author || "Unity & Hope Home Care LLC",
    publishedDate: resource.publishedDate || publishedDate,
    status: resource.status || "published",
    order,
    seoTitle: resource.seoTitle || `${resource.title} | Unity & Hope Resources`,
    seoDescription: resource.seoDescription || resource.excerpt,
  })),
  seo: structuredClone(pageSeo),
};

export const cloneDefaultManagedContent = () => structuredClone(defaultManagedContent);
