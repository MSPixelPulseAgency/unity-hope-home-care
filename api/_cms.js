import { cloneDefaultManagedContent } from "../src/data/defaultManagedContent.js";
import { BlobPreconditionFailedError, readPrivateJson, writePrivateJson } from "./_blob-json.js";

const CONTENT_PATH = "cms/site-content.json";
const SITE_URL = "https://uhhomehealth.com";
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ALLOWED_ICONS = new Set([
  "BellRing", "CalendarDays", "ClipboardCheck", "CookingPot", "Heart", "HeartHandshake",
  "HeartPlus", "House", "ListChecks", "MapPin", "MessageCircleHeart", "ShieldCheck",
  "ShoppingBasket", "Sparkles", "Star", "UserCheck", "UsersRound",
]);
const EDITABLE_SECTIONS = new Set([
  "site", "home", "about", "services", "serviceAreas", "serviceAreaContent",
  "team", "teamSection", "resources", "seo",
]);

const withoutControls = (value) => Array.from(String(value ?? ""))
  .filter((character) => {
    const code = character.charCodeAt(0);
    return code === 9 || code === 10 || code === 13 || (code >= 32 && code !== 127);
  })
  .join("");

const oneLine = (value, maximum = 240) => withoutControls(value).normalize("NFKC").replace(/\s+/g, " ").trim().slice(0, maximum);
const multiLine = (value, maximum = 8000) => withoutControls(value).normalize("NFKC")
  .replace(/\r\n?/g, "\n")
  .split("\n")
  .map((line) => line.replace(/[ \t]+/g, " ").trim())
  .join("\n")
  .replace(/\n{3,}/g, "\n\n")
  .trim()
  .slice(0, maximum);

const stringList = (value, maximumItems = 20, maximumLength = 240) => (Array.isArray(value) ? value : [])
  .slice(0, maximumItems)
  .map((item) => oneLine(item, maximumLength))
  .filter(Boolean);

const safeSlug = (value, fallback = "item") => {
  const candidate = oneLine(value, 100).toLowerCase();
  return SLUG_PATTERN.test(candidate) ? candidate : fallback;
};

const safeHttpUrl = (value) => {
  const candidate = oneLine(value, 500);
  if (!candidate) return null;
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
};

const safeImage = (value, fallback = "/images/caregiver-welcome.webp") => {
  const candidate = oneLine(value, 500);
  if (/^\/(?:images|brand)\/[A-Za-z0-9._/-]+$/.test(candidate)) return candidate;
  if (/^\/api\/media\?id=[a-f0-9]{32}$/.test(candidate)) return candidate;
  return safeHttpUrl(candidate) || fallback;
};

const safeInternalPath = (value, fallback = "/") => {
  const candidate = oneLine(value, 240);
  return /^\/(?!\/)[A-Za-z0-9/_-]*(?:\?[A-Za-z0-9&=_-]+)?$/.test(candidate) ? candidate : fallback;
};

const safeHref = (value, fallback = "/") => {
  const candidate = oneLine(value, 500);
  if (/^(?:tel|mailto):[^\s]+$/i.test(candidate)) return candidate;
  return safeInternalPath(candidate, fallback);
};

const emailValue = (value, fallback) => {
  const candidate = oneLine(value, 254).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate) ? candidate : fallback;
};

const phoneHref = (phone, fallback) => {
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return fallback;
  return `tel:+${digits.length === 10 ? `1${digits}` : digits}`;
};

const mergeDefaults = (incoming = {}) => {
  const fallback = cloneDefaultManagedContent();
  return {
    ...fallback,
    ...incoming,
    site: { ...fallback.site, ...(incoming.site || {}), socials: { ...fallback.site.socials, ...(incoming.site?.socials || {}) } },
    home: {
      ...fallback.home,
      ...(incoming.home || {}),
      hero: { ...fallback.home.hero, ...(incoming.home?.hero || {}) },
      servicesHeading: { ...fallback.home.servicesHeading, ...(incoming.home?.servicesHeading || {}) },
      sectionVisibility: { ...fallback.home.sectionVisibility, ...(incoming.home?.sectionVisibility || {}) },
    },
    about: { ...fallback.about, ...(incoming.about || {}), mission: { ...fallback.about.mission, ...(incoming.about?.mission || {}) } },
    serviceAreaContent: { ...fallback.serviceAreaContent, ...(incoming.serviceAreaContent || {}) },
    teamSection: { ...fallback.teamSection, ...(incoming.teamSection || {}) },
    seo: { ...fallback.seo, ...(incoming.seo || {}) },
    services: Array.isArray(incoming.services) ? incoming.services : fallback.services,
    serviceAreas: Array.isArray(incoming.serviceAreas) ? incoming.serviceAreas : fallback.serviceAreas,
    team: Array.isArray(incoming.team) ? incoming.team : fallback.team,
    resources: Array.isArray(incoming.resources) ? incoming.resources : fallback.resources,
  };
};

const sanitizeSite = (value, fallback) => {
  const phone = oneLine(value.phone, 30) || fallback.phone;
  const email = emailValue(value.email, fallback.email);
  const addressLine1 = oneLine(value.addressLine1, 180) || fallback.addressLine1;
  const city = oneLine(value.city, 100) || fallback.city;
  const state = oneLine(value.state, 80) || fallback.state;
  const postalCode = oneLine(value.postalCode, 20) || fallback.postalCode;
  return {
    ...fallback,
    companyName: oneLine(value.companyName, 120) || fallback.companyName,
    shortName: oneLine(value.shortName, 80) || fallback.shortName,
    headline: oneLine(value.headline, 140) || fallback.headline,
    tagline: oneLine(value.tagline, 140) || fallback.tagline,
    secondaryTagline: oneLine(value.secondaryTagline, 160) || fallback.secondaryTagline,
    description: oneLine(value.description, 320) || fallback.description,
    phone,
    phoneHref: phoneHref(phone, fallback.phoneHref),
    fax: oneLine(value.fax, 30),
    email,
    emailHref: `mailto:${email}`,
    addressLine1,
    city,
    state,
    stateCode: oneLine(value.stateCode, 3).toUpperCase() || fallback.stateCode,
    postalCode,
    fullAddress: `${addressLine1}, ${city}, ${state} ${postalCode}`,
    serviceRegion: oneLine(value.serviceRegion, 180) || fallback.serviceRegion,
    hours: {
      weekdaysLabel: oneLine(value.hours?.weekdaysLabel, 80) || fallback.hours.weekdaysLabel,
      weekdays: oneLine(value.hours?.weekdays, 80) || fallback.hours.weekdays,
      weekendsLabel: oneLine(value.hours?.weekendsLabel, 80) || fallback.hours.weekendsLabel,
      weekends: oneLine(value.hours?.weekends, 80) || fallback.hours.weekends,
    },
    siteUrl: SITE_URL,
    googleBusinessProfileUrl: safeHttpUrl(value.googleBusinessProfileUrl),
    socials: {
      facebook: safeHttpUrl(value.socials?.facebook),
      instagram: safeHttpUrl(value.socials?.instagram),
      linkedin: safeHttpUrl(value.socials?.linkedin),
    },
    footerDescription: oneLine(value.footerDescription, 260) || fallback.footerDescription,
    footerCtaEyebrow: oneLine(value.footerCtaEyebrow, 100) || fallback.footerCtaEyebrow,
    footerCtaTitle: oneLine(value.footerCtaTitle, 180) || fallback.footerCtaTitle,
    footerCtaDescription: oneLine(value.footerCtaDescription, 300) || fallback.footerCtaDescription,
    primaryCtaLabel: oneLine(value.primaryCtaLabel, 60) || fallback.primaryCtaLabel,
  };
};

const sanitizeHome = (value, fallback) => ({
  ...fallback,
  hero: {
    ...fallback.hero,
    kicker: oneLine(value.hero?.kicker, 180) || fallback.hero.kicker,
    title: oneLine(value.hero?.title, 100) || fallback.hero.title,
    titleAccent: oneLine(value.hero?.titleAccent, 100) || fallback.hero.titleAccent,
    description: oneLine(value.hero?.description, 420) || fallback.hero.description,
    primaryCta: {
      ...fallback.hero.primaryCta,
      label: oneLine(value.hero?.primaryCta?.label, 60) || fallback.hero.primaryCta.label,
      to: safeInternalPath(value.hero?.primaryCta?.to, fallback.hero.primaryCta.to),
    },
    secondaryCta: {
      ...fallback.hero.secondaryCta,
      label: oneLine(value.hero?.secondaryCta?.label, 60) || fallback.hero.secondaryCta.label,
      href: safeHref(value.hero?.secondaryCta?.href, fallback.hero.secondaryCta.href),
    },
    highlights: (Array.isArray(value.hero?.highlights) ? value.hero.highlights : fallback.hero.highlights).slice(0, 4).map((item, index) => ({
      icon: ALLOWED_ICONS.has(item.icon) ? item.icon : (fallback.hero.highlights[index]?.icon || "Heart"),
      lines: stringList(item.lines, 2, 60),
    })),
  },
  servicesHeading: {
    eyebrow: oneLine(value.servicesHeading?.eyebrow, 80) || fallback.servicesHeading.eyebrow,
    title: oneLine(value.servicesHeading?.title, 160) || fallback.servicesHeading.title,
    description: oneLine(value.servicesHeading?.description, 320) || fallback.servicesHeading.description,
  },
  serviceAreaWording: oneLine(value.serviceAreaWording, 180) || fallback.serviceAreaWording,
  sectionVisibility: Object.fromEntries(Object.keys(fallback.sectionVisibility).map((key) => [key, value.sectionVisibility?.[key] !== false])),
});

const sanitizeAbout = (value, fallback) => ({
  mission: {
    eyebrow: oneLine(value.mission?.eyebrow, 80) || fallback.mission.eyebrow,
    title: oneLine(value.mission?.title, 180) || fallback.mission.title,
    lead: oneLine(value.mission?.lead, 420) || fallback.mission.lead,
    paragraphs: stringList(value.mission?.paragraphs, 6, 1200).length ? stringList(value.mission?.paragraphs, 6, 1200) : fallback.mission.paragraphs,
  },
  vision: multiLine(value.vision, 3000),
  founderStory: multiLine(value.founderStory, 5000),
});

const sanitizeServices = (value, fallback) => {
  if (!Array.isArray(value)) return fallback;
  const seen = new Set();
  return value.slice(0, 40).map((service, index) => {
    let slug = safeSlug(service.slug, `service-${index + 1}`);
    while (seen.has(slug)) slug = `${slug}-${index + 1}`;
    seen.add(slug);
    return {
      slug,
      title: oneLine(service.title, 120) || `Service ${index + 1}`,
      shortTitle: oneLine(service.shortTitle, 80) || oneLine(service.title, 80) || `Service ${index + 1}`,
      icon: ALLOWED_ICONS.has(service.icon) ? service.icon : "HeartHandshake",
      image: safeImage(service.image),
      description: oneLine(service.description, 320),
      intro: oneLine(service.intro, 800),
      examples: stringList(service.examples, 12, 180),
      note: oneLine(service.note, 500),
      tags: stringList(service.tags, 12, 80),
      seoTitle: oneLine(service.seoTitle, 180),
      seoDescription: oneLine(service.seoDescription, 320),
      order: index,
      hidden: Boolean(service.hidden),
    };
  });
};

const sanitizeAreas = (value, fallback) => {
  if (!Array.isArray(value)) return fallback;
  return value.slice(0, 100).map((area, index) => ({
    name: oneLine(area.name, 120) || `Service Area ${index + 1}`,
    gridArea: safeSlug(area.gridArea || area.name, `area-${index + 1}`).replaceAll("-", ""),
    primary: Boolean(area.primary),
    detail: oneLine(area.detail, 120),
    availability: area.primary ? "primary" : "confirm",
    order: index,
    hidden: Boolean(area.hidden),
  }));
};

const sanitizeAreaContent = (value, fallback) => ({
  verifiedStatement: oneLine(value.verifiedStatement, 240) || fallback.verifiedStatement,
  primaryArea: oneLine(value.primaryArea, 120) || fallback.primaryArea,
  locationConfirmation: oneLine(value.locationConfirmation, 500) || fallback.locationConfirmation,
  verifiedCities: stringList(value.verifiedCities, 100, 120),
});

const sanitizeTeam = (value, fallback) => {
  if (!Array.isArray(value)) return fallback;
  return value.slice(0, 50).map((member, index) => ({
    id: safeSlug(member.id || `${member.name}-${index + 1}`, `team-${index + 1}`),
    name: oneLine(member.name, 120) || `Team Member ${index + 1}`,
    role: oneLine(member.role, 120),
    bio: oneLine(member.bio, 1200),
    image: safeImage(member.image, "/images/caregiver-team.webp"),
    imageAlt: oneLine(member.imageAlt, 240) || `Portrait of ${oneLine(member.name, 120) || "a Unity & Hope team member"}`,
    order: index,
    hidden: Boolean(member.hidden),
  }));
};

const sanitizeResources = (value, fallback) => {
  if (!Array.isArray(value)) return fallback;
  const seen = new Set();
  return value.slice(0, 100).map((resource, index) => {
    let slug = safeSlug(resource.slug, `article-${index + 1}`);
    while (seen.has(slug)) slug = `${slug}-${index + 1}`;
    seen.add(slug);
    const title = oneLine(resource.title, 180) || `Article ${index + 1}`;
    const excerpt = oneLine(resource.excerpt, 420);
    const date = /^\d{4}-\d{2}-\d{2}$/.test(oneLine(resource.publishedDate, 10)) ? oneLine(resource.publishedDate, 10) : "";
    return {
      slug,
      title,
      excerpt,
      image: safeImage(resource.image, "/images/family-cooking.webp"),
      imageAlt: oneLine(resource.imageAlt, 240) || `Home care resource: ${title}`,
      readTime: oneLine(resource.readTime, 40) || "5 min read",
      sections: (Array.isArray(resource.sections) ? resource.sections : []).slice(0, 30).map((section) => ({
        heading: oneLine(section.heading, 180),
        body: multiLine(section.body, 5000),
      })).filter((section) => section.heading && section.body),
      author: oneLine(resource.author, 120) || "Unity & Hope Home Care LLC",
      source: oneLine(resource.source, 240),
      publishedDate: date,
      status: resource.status === "published" ? "published" : "draft",
      order: index,
      seoTitle: oneLine(resource.seoTitle, 180) || `${title} | Unity & Hope Resources`,
      seoDescription: oneLine(resource.seoDescription, 320) || excerpt,
      updatedAt: new Date().toISOString(),
    };
  });
};

const sanitizeSeo = (value, fallback) => Object.fromEntries(Object.entries(fallback).map(([key, entry]) => {
  const candidate = value?.[key] || {};
  return [key, {
    ...entry,
    title: oneLine(candidate.title, 180) || entry.title,
    description: oneLine(candidate.description, 320) || entry.description,
    path: entry.path,
    ...(entry.noIndex ? { noIndex: true } : {}),
  }];
}));

const sanitizeTeamSection = (value, fallback) => ({
  eyebrow: oneLine(value.eyebrow, 80) || fallback.eyebrow,
  title: oneLine(value.title, 160) || fallback.title,
  description: oneLine(value.description, 320) || fallback.description,
});

const sanitizerFor = (section, fallback) => ({
  site: sanitizeSite,
  home: sanitizeHome,
  about: sanitizeAbout,
  services: sanitizeServices,
  serviceAreas: sanitizeAreas,
  serviceAreaContent: sanitizeAreaContent,
  team: sanitizeTeam,
  teamSection: sanitizeTeamSection,
  resources: sanitizeResources,
  seo: sanitizeSeo,
}[section])(fallback.value, fallback.current);

export const loadManagedContent = async () => {
  const stored = await readPrivateJson(CONTENT_PATH);
  return { content: mergeDefaults(stored?.value), record: stored };
};

export const saveManagedSection = async (section, value) => {
  if (!EDITABLE_SECTIONS.has(section)) throw new Error("This content section cannot be edited.");
  const { content, record } = await loadManagedContent();
  const sanitized = sanitizerFor(section, { value, current: content[section] });
  const updated = {
    ...content,
    [section]: sanitized,
    version: 1,
    updatedAt: new Date().toISOString(),
  };
  try {
    await writePrivateJson(CONTENT_PATH, updated, record);
  } catch (error) {
    if (error instanceof BlobPreconditionFailedError) {
      const conflict = new Error("Content changed in another session. Refresh and try again.");
      conflict.code = "CONTENT_CONFLICT";
      throw conflict;
    }
    throw error;
  }
  return updated;
};

export const publicManagedContent = (content) => mergeDefaults(content);
