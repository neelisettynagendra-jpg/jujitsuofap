import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";
import { routeTree } from "@/routeTree.gen";
import { sitemapStaticPaths, sitemapXML } from "@/lib/sitemap";
import { SITE_URL } from "@/lib/seo";

describe("Public sitemap", () => {
  it("includes public pages and excludes admin and legacy district pages", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    const paths = sitemapStaticPaths(router);
    for (const path of ["/", "/about", "/district-associations", "/events", "/executive-committee", "/contact", "/gallery"]) expect(paths).toContain(path);
    expect(paths).not.toContain("/districts");
    expect(paths).not.toContain("/district-members");
    expect(paths.some((path) => path.startsWith("/admin"))).toBe(false);
    const xml = sitemapXML(SITE_URL, paths.map((path) => ({ path })));
    expect(xml).not.toContain("lastmod");
    expect(xml).not.toContain("jujitsuofap.lovable.app");
    expect(xml).toContain("https://www.jujitsuassociationofandhrapradesh.in/executive-committee");
  });
});