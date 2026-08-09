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

export function Seo({ title, description, path = "/", image = "/og.jpg", schema }) {
  useEffect(() => {
    const fullTitle = title.includes("Unity & Hope") ? title : `${title} | Unity & Hope Home Care LLC`;
    const canonical = new URL(path, siteConfig.siteUrl).toString();
    const socialImage = new URL(image, siteConfig.siteUrl).toString();

    document.title = fullTitle;
    setMeta("name", "description", description);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:url", canonical);
    setMeta("property", "og:image", socialImage);
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
    if (schema) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    }

    window.scrollTo({ top: 0, behavior: "instant" });
  }, [description, image, path, schema, title]);

  return null;
}

