import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";
import { Route as districtMembersRoute } from "@/routes/district-members";
import { Route as districtsRoute } from "@/routes/districts";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("permanently redirects both legacy district URLs to District Associations", () => {
    for (const route of [districtMembersRoute, districtsRoute]) {
      const beforeLoad = route.options.beforeLoad;
      if (!beforeLoad) throw new Error("Missing legacy redirect");
      try {
        Reflect.apply(beforeLoad, undefined, []);
        throw new Error("Expected redirect");
      } catch (redirect) {
        expect(redirect).toMatchObject({ options: { to: "/district-associations", statusCode: 301 } });
      }
    }
  });
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });
});
