import { useEffect } from "react";

const analyticsId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();
const verificationToken = import.meta.env.VITE_GOOGLE_SITE_VERIFICATION?.trim();
const validAnalyticsId = /^G-[A-Z0-9]+$/i.test(analyticsId || "");

export function GoogleSiteTools() {
  useEffect(() => {
    if (verificationToken) {
      let verification = document.head.querySelector('meta[name="google-site-verification"]');
      if (!verification) {
        verification = document.createElement("meta");
        verification.name = "google-site-verification";
        document.head.appendChild(verification);
      }
      verification.content = verificationToken;
    }

    if (!validAnalyticsId || document.documentElement.dataset.gaInitialized === analyticsId) return;
    document.documentElement.dataset.gaInitialized = analyticsId;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", analyticsId, { anonymize_ip: true });

    if (!document.getElementById("google-analytics-script")) {
      const script = document.createElement("script");
      script.id = "google-analytics-script";
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(analyticsId)}`;
      document.head.appendChild(script);
    }
  }, []);

  return null;
}
