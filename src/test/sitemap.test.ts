import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";
import { routeTree } from "@/routeTree.gen";
import { sitemapStaticPaths, sitemapXML } from "@/lib/sitemap";

describe("Public sitemap", () => {
  it("includes the five requested pages and excludes admin pages", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    const paths = sitemapStaticPaths(router);
    for (const path of ["/", "/about", "/districts", "/events", "/contact"]) expect(paths).toContain(path);
    expect(paths.some((path) => path.startsWith("/admin"))).toBe(false);
    expect(sitemapXML("https://jujitsuofap.lovable.app", paths.map((path) => ({ path })))).not.toContain("lastmod");
  });
});