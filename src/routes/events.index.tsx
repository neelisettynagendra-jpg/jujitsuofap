import { siteSettingsQuery } from "@/lib/site-settings";
import { structuredData } from "@/lib/structured-data";
import { PublicNotFound, PublicRouteError } from "@/components/site/PublicRouteStates";
import { pageSEO } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { eventsQuery } from "@/lib/queries";
import { EventCard } from "@/components/site/EventCard";
import { Empty, ErrorState, Loading, PageTitle } from "@/components/site/States";

export const Route = createFileRoute("/events/")({
  staticData: { sitemap: true },
  loader: async ({ context }) => {
    const [events, settings] = await Promise.all([
      context.queryClient.ensureQueryData(eventsQuery()),
      context.queryClient.ensureQueryData(siteSettingsQuery),
    ]);
    return { events, logo: settings?.logo_url };
  },
  head: ({ loaderData }) => ({ ...pageSEO("/events", "Event Updates — Ju Jitsu Association of Andhra Pradesh", "Explore Ju Jitsu Andhra Pradesh championships, training camps, seminars and announcements from the official Jiu Jitsu Association AP.", loaderData?.logo), scripts: structuredData("/events", "Event Updates", { events: loaderData?.events }) }),
  pendingComponent: Loading,
  errorComponent: PublicRouteError,
  notFoundComponent: PublicNotFound,
  component: Events,
});

function Events() {
  const { data, isLoading, error, refetch } = useSuspenseQuery(eventsQuery());
  return (
    <>
      <PageTitle title="Event Updates" subtitle="Championships, camps and announcements" />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="sr-only">Latest Ju Jitsu Events</h2>
        {isLoading ? (
          <Loading />
        ) : error ? (
          <ErrorState error={error} retry={() => refetch()} />
        ) : data?.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        ) : (
          <Empty>No events published yet.</Empty>
        )}
      </div>
    </>
  );
}
