import test from "node:test";
import assert from "node:assert/strict";
import { homepageContent, aboutContent } from "../src/data/content.js";
import { pageSeo } from "../src/data/seo.js";
import { services } from "../src/data/services.js";
import { serviceAreaContent, serviceAreas } from "../src/data/serviceAreas.js";
import { testimonials } from "../src/data/testimonials.js";
import { teamMembers } from "../src/data/team.js";

test("keeps the verified service catalog complete and uniquely routed", () => {
  assert.equal(services.length, 7);
  assert.equal(new Set(services.map((service) => service.slug)).size, services.length);
  assert.ok(services.every((service) => service.description && service.examples.length >= 3));
});

test("keeps core SEO titles and paths unique", () => {
  const entries = Object.values(pageSeo);
  assert.equal(new Set(entries.map((entry) => entry.title)).size, entries.length);
  assert.equal(new Set(entries.map((entry) => entry.path)).size, entries.length);
  assert.ok(entries.every((entry) => entry.noIndex || entry.description.length >= 50));
});

test("publishes verified roadmap content without placeholder trust claims", () => {
  assert.match(homepageContent.hero.description, /non-medical home care/i);
  assert.match(aboutContent.mission.lead, /Unity & Hope Home Care LLC/);
  assert.equal(testimonials.length, 0);
  assert.equal(teamMembers.length, 0);
});

test("distinguishes the primary service region from confirmation-only map areas", () => {
  const primaryAreas = serviceAreas.filter((area) => area.availability === "primary");
  assert.deepEqual(primaryAreas.map((area) => area.name), [serviceAreaContent.primaryArea]);
  assert.ok(serviceAreas.filter((area) => !area.primary).every((area) => area.availability === "confirm"));
  assert.deepEqual(serviceAreaContent.verifiedCities, []);
});
