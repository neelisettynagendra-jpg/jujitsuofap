import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/districts")({
  staticData: { sitemap: false },
  beforeLoad: () => { throw redirect({ to: "/district-associations", statusCode: 301 }); },
});