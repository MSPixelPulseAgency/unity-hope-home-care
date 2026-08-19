import { useEffect } from "react";
import { siteConfig } from "../../config/siteConfig";

const setMeta = (attribute, key, content) => {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
};

const breadcrumbLabelMap = {
  about: "About Us",
  services: "Services",
  "service-areas": "Service Areas",
  "request-care": "Get Started",
  contact: "Contact",
  careers: "Careers",
  resources: "Resources",
  privacy: "Privacy",
};

const createSchema = ({ schema, path, fullTitle, description, canonical }) => {
  const suppliedItems = schema?.["@graph"] || (schema ? [schema] : []);
  const graph = suppliedItems.map((item) => {
    const cleanItem = { ...item };
    delete cleanItem["@context"];
    return cleanItem;
  });
  const segments = path.split("/").filter(Boolean);

  graph.push({
    "@type": "WebPage",
    "@id": `${canonical}#webpage`,
    url: canonical,
    name: fullTitle,
    description,
    isPartOf: { "@id": `${siteConfig.siteUrl}/#website` },
  });

  if (path === "/") {
    graph.push({
      "@type": "WebSite",
      "@id": `${siteConfig.siteUrl}/#website`,
      url: siteConfig.siteUrl,
      name: siteConfig.companyName,
    });
  }

  if (segments.length) {
    const currentLabel = fullTitle.split("|")[0].trim();
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.siteUrl },
        ...segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          const itemPath = `/${segments.slice(0, index + 1).join("/")}`;
          return {
            "@type": "ListItem",
            position: index + 2,
            name: isLast ? currentLabel : (breadcrumbLabelMap[segment] || segment.replaceAll("-", " ")),
            item: new URL(itemPath, siteConfig.siteUrl).toString(),
          };
        }),
      ],
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
};

export function Seo({ title, description, path = "/", image = "/og.jpg", schema, keywords = [], noIndex = false }) {
  useEffect(() => {
    const fullTitle = title.includes("Unity & Hope") ? title : `${title} | Unity & Hope Home Care LLC`;
    const canonical = new URL(path, siteConfig.siteUrl).toString();
    const socialImage = new URL(image, siteConfig.siteUrl).toString();

    document.title = fullTitle;
    setMeta("name", "description", description);
    setMeta("name", "robots", noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large");
    setMeta("name", "keywords", [
      "home care",
      "senior care",
      "elder care",
      "non-medical home care",
      "caregiver services",
      "aging in place",
      "Ohio home care",
      "Dayton home care",
      "Montgomery County home care",
      ...keywords,
    ].join(", "));
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:url", canonical);
    setMeta("property", "og:image", socialImage);
    setMeta("property", "og:site_name", siteConfig.companyName);
    setMeta("property", "og:locale", "en_US");
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", socialImage);

    let canonicalLink = document.head.querySelector("link[rel='canonical']");
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.rel = "canonical";
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonical;

    const scriptId = "page-schema";
    document.getElementById(scriptId)?.remove();
    const script = document.createElement("script");
    script.id = scriptId;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(createSchema({ schema, path, fullTitle, description, canonical }));
    document.head.appendChild(script);

    window.scrollTo({ top: 0, behavior: "instant" });
  }, [description, image, keywords, noIndex, path, schema, title]);

  return null;
}
