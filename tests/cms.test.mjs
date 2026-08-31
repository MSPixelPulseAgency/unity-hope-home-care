import test from "node:test";
import assert from "node:assert/strict";
import { publicManagedContent } from "../api/_cms.js";
import { cloneDefaultManagedContent } from "../src/data/defaultManagedContent.js";

test("keeps hidden and draft CMS records out of the public content payload", () => {
  const content = cloneDefaultManagedContent();
  content.services.push({ ...content.services[0], slug: "private-service", hidden: true });
  content.serviceAreas.push({ ...content.serviceAreas[0], name: "Private Area", hidden: true });
  content.team.push({ ...content.team[0], id: "private-team-member", hidden: true });
  content.resources.push({ ...content.resources[0], slug: "draft-resource", status: "draft" });

  const publicContent = publicManagedContent(content);

  assert.equal(publicContent.services.some((item) => item.slug === "private-service"), false);
  assert.equal(publicContent.serviceAreas.some((item) => item.name === "Private Area"), false);
  assert.equal(publicContent.team.some((item) => item.id === "private-team-member"), false);
  assert.equal(publicContent.resources.some((item) => item.slug === "draft-resource"), false);
});
