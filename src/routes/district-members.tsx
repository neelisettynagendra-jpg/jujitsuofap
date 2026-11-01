import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/district-members")({
  staticData: { sitemap: false },
  beforeLoad: () => { throw redirect({ to: "/district-associations", statusCode: 301 }); },
});