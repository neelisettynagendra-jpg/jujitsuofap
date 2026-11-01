import { describe, expect, it } from "vitest";
import { eventSchema, structuredData } from "@/lib/structured-data";

function graph(path: string, options = {}) {
  const script = structuredData(path, "Page", options)[0];
  if (!script) throw new Error("Missing schema");
  return JSON.parse(script.children)["@graph"] as Record<string, unknown>[];
}

describe("Accurate public structured data", () => {
  it("uses the official organization and production URL once on home", () => {
    const nodes = graph("/");
    expect(nodes[0]?.["name"]).toBe("Ju Jitsu Association of Andhra Pradesh");
    expect(nodes[0]?.["url"]).toBe("https://www.jujitsuassociationofandhrapradesh.in/");
    expect(nodes[0]?.["@type"]).toEqual(["Organization", "SportsOrganization"]);
    expect(new Set(nodes.map(node => node["@id"])).size).toBe(nodes.length);
  });
  it("includes the uploaded logo as an ImageObject on the organization", () => {
    const nodes = graph("/", { logo: "https://example.com/logos/official.jpeg" });
    const org = nodes.find(node => node["@id"] === "https://www.jujitsuassociationofandhrapradesh.in/#organization");
    expect(org?.["logo"]).toEqual({ "@type": "ImageObject", url: "https://example.com/logos/official.jpeg" });
    expect(org?.["name"]).toBe("Ju Jitsu Association of Andhra Pradesh");
    expect(org?.["url"]).toBe("https://www.jujitsuassociationofandhrapradesh.in/");
  });
  it("omits the logo when it is missing, relative, or an SVG", () => {
    for (const logo of [undefined, null, "/__l5e/assets/logo.jpeg", "http://insecure.com/logo.png", "https://example.com/logo.svg", "https://example.com/logo.svg?token=abc"]) {
      const nodes = graph("/", { logo });
      const org = nodes.find(node => node["@id"] === "https://www.jujitsuassociationofandhrapradesh.in/#organization");
      expect(org).not.toHaveProperty("logo");
    }
  });
  it("emits exactly one organization node even with a logo on home and about", () => {
    for (const path of ["/", "/about"]) {
      const nodes = graph(path, { logo: "https://example.com/logos/official.jpeg" });
      expect(nodes.filter(node => node["@id"] === "https://www.jujitsuassociationofandhrapradesh.in/#organization")).toHaveLength(1);
    }
  });
  it("includes only verified contact values and never an address", () => {
    const nodes = graph("/contact", { contact: { phones: ["9885644031", "1234567890"], emails: ["sk.yaseen700@gmail.com", "example@example.com"], address: "Unverified address" } });
    const contact = nodes.find(node => node["@type"] === "ContactPoint");
    expect(contact?.["telephone"]).toBe("9885644031");
    expect(contact?.["email"]).toBe("sk.yaseen700@gmail.com");
    expect(JSON.stringify(nodes)).not.toContain("Unverified address");
    expect(JSON.stringify(nodes)).not.toContain("example@example.com");
  });
  it("never invents an event location, time, image, or description", () => {
    const node = eventSchema({ id: "actual-event", title: "Actual event", event_date: "2026-11-01", description: "", image_url: null });
    expect(node?.["startDate"]).toBe("2026-11-01");
    for (const key of ["location", "image", "description", "endDate", "organizer", "offers"]) expect(node).not.toHaveProperty(key);
  });
  it("rejects invalid event dates instead of producing false event schema", () => {
    expect(eventSchema({ id: "event", title: "Event", event_date: "2026-02-30", description: "", image_url: null })).toBeNull();
  });
  it("does not emit sample events when no published events exist", () => {
    expect(graph("/events", { events: [] }).some(node => node["@type"] === "Event")).toBe(false);
  });
  it("self-references each inner page in breadcrumbs", () => {
    for (const path of ["/about", "/contact", "/districts", "/events", "/executive-committee"]) {
      const breadcrumb = graph(path).find(node => node["@type"] === "BreadcrumbList");
      expect(breadcrumb?.["itemListElement"]).toEqual([
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.jujitsuassociationofandhrapradesh.in/" },
        { "@type": "ListItem", position: 2, name: "Page", item: `https://www.jujitsuassociationofandhrapradesh.in${path}` },
      ]);
    }
  });
});