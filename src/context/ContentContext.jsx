/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { cloneDefaultManagedContent } from "../data/defaultManagedContent";

const mergeContent = (fallback, incoming = {}) => ({
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
});

const fallbackContent = cloneDefaultManagedContent();
const ContentContext = createContext({ content: fallbackContent, loading: false, refresh: async () => {} });

export function ContentProvider({ children }) {
  const [state, setState] = useState({ content: fallbackContent, loading: true });

  const load = async (signal) => {
    try {
      const response = await fetch("/api/content", { headers: { Accept: "application/json" }, signal });
      if (!response.ok) throw new Error("Managed content is unavailable");
      const result = await response.json();
      setState({ content: mergeContent(cloneDefaultManagedContent(), result.content), loading: false });
    } catch (error) {
      if (error?.name !== "AbortError") setState({ content: cloneDefaultManagedContent(), loading: false });
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => load(controller.signal));
    return () => controller.abort();
  }, []);

  const value = useMemo(() => ({
    ...state,
    refresh: () => load(),
    visibleServices: state.content.services.filter((item) => !item.hidden).sort((a, b) => Number(a.order) - Number(b.order)),
    visibleAreas: state.content.serviceAreas.filter((item) => !item.hidden).sort((a, b) => Number(a.order) - Number(b.order)),
    visibleTeam: state.content.team.filter((item) => !item.hidden).sort((a, b) => Number(a.order) - Number(b.order)),
    publishedResources: state.content.resources.filter((item) => item.status === "published").sort((a, b) => Number(a.order) - Number(b.order)),
  }), [state]);

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export const useManagedContent = () => useContext(ContentContext);
