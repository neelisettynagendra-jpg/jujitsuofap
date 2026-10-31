import { getPublicSEO } from "@/lib/seo.functions";
import { pageSEO } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { eventsQuery } from "@/lib/queries";
import { EventCard } from "@/components/site/EventCard";
import { Empty, ErrorState, Loading, PageTitle } from "@/components/site/States";

export const Route = createFileRoute("/events/")({
  staticData: { sitemap: true },
  loader: () => getPublicSEO({ data: {} }),
  head: ({ loaderData }) => pageSEO("/events", "Event Updates — Ju Jitsu Association of Andhra Pradesh", "Explore Ju Jitsu Andhra Pradesh championships, training camps, seminars and announcements from the official Jiu Jitsu Association AP.", loaderData?.logo),
  component: Events,
});

function Events() {
  const { data, isLoading, error, refetch } = useQuery(eventsQuery());
  return (
    <>
      <PageTitle title="Event Updates" subtitle="Championships, camps and announcements" />
      <div className="mx-auto max-w-6xl px-4 py-8">
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
