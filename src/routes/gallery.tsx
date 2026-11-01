import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { galleryQuery } from "@/lib/queries";
import { siteSettingsQuery } from "@/lib/site-settings";
import { pageSEO } from "@/lib/seo";
import { structuredData } from "@/lib/structured-data";
import { GalleryGrid } from "@/components/site/GalleryGrid";
import { Empty, Loading, PageTitle } from "@/components/site/States";
import { PublicNotFound, PublicRouteError } from "@/components/site/PublicRouteStates";

export const Route = createFileRoute("/gallery")({
  staticData: { sitemap: true },
  loader: async ({ context }) => {
    const [, settings] = await Promise.all([context.queryClient.ensureQueryData(galleryQuery), context.queryClient.ensureQueryData(siteSettingsQuery)]);
    return { logo: settings?.logo_url };
  },
  head: ({ loaderData }) => ({ ...pageSEO("/gallery", "Gallery — Ju Jitsu Association of Andhra Pradesh", "View photos from the Ju Jitsu Association of Andhra Pradesh gallery.", loaderData?.logo), scripts: structuredData("/gallery", "Gallery") }),
  pendingComponent: Loading,
  errorComponent: PublicRouteError,
  notFoundComponent: PublicNotFound,
  component: Gallery,
});

function Gallery() {
  const { data } = useSuspenseQuery(galleryQuery);
  return <>
    <PageTitle title="Gallery" />
    <div className="mx-auto max-w-6xl px-4 py-8">
      {data?.length ? <GalleryGrid images={data} /> : <Empty>No photos in the gallery yet.</Empty>}
    </div>
  </>;
}