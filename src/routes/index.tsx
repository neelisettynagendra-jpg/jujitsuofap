import { siteSettingsQuery } from "@/lib/site-settings";
import { structuredData } from "@/lib/structured-data";
import { PublicNotFound, PublicRouteError } from "@/components/site/PublicRouteStates";
import { pageSEO, HOME_DESCRIPTION } from "@/lib/seo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CalendarDays, Info, Phone, Users } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { aboutQuery, eventsQuery } from "@/lib/queries";
import { EventCard } from "@/components/site/EventCard";
import { Empty, ErrorState, Loading } from "@/components/site/States";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  loader: async ({ context }) => {
    const [about, events, settings] = await Promise.all([
      context.queryClient.ensureQueryData(aboutQuery),
      context.queryClient.ensureQueryData(eventsQuery(3)),
      context.queryClient.ensureQueryData(siteSettingsQuery),
    ]);
    return { about, events, logo: settings?.logo_url };
  },
  head: ({ loaderData }) => ({ ...pageSEO("/", "Ju Jitsu Association of Andhra Pradesh", HOME_DESCRIPTION, loaderData?.logo, loaderData?.about?.home_banner_url), scripts: structuredData("/", "Home", { events: loaderData?.events }) }),
  pendingComponent: Loading,
  errorComponent: PublicRouteError,
  notFoundComponent: PublicNotFound,
  component: Home,
});

const QUICK = [
  { to: "/about", label: "About Us", icon: Info },
  { to: "/districts", label: "District Members", icon: Users },
  { to: "/events", label: "Event Updates", icon: CalendarDays },
  { to: "/contact", label: "Contact Us", icon: Phone },
] as const;

function Home() {
  const events = useSuspenseQuery(eventsQuery(3));
  const about = useSuspenseQuery(aboutQuery);

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <img src={about.data?.home_banner_url || hero} alt={about.data?.home_banner_url ? "Ju Jitsu Association of Andhra Pradesh banner" : "Ju Jitsu athletes competing at a state championship"} width={1600} height={912} className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-hero-overlay" />
        <div className="mx-auto max-w-6xl px-4 py-16 text-primary-foreground md:py-28">
          <div className="mb-4 h-1 w-16 bg-saffron" />
          <h1 className="max-w-3xl text-3xl font-bold leading-tight md:text-5xl">Ju Jitsu Association of Andhra Pradesh</h1>
          <p className="mt-4 max-w-xl text-lg text-primary-foreground/90">Discipline · Strength · Self-Defence — building champions in every district of the state.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="saffron" size="lg"><Link to="/events">Latest Events</Link></Button>
            <Button asChild variant="outlineLight" size="lg"><Link to="/districts">Find Your District</Link></Button>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-8 grid max-w-6xl grid-cols-2 gap-3 px-4 md:grid-cols-4">
        {QUICK.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className="flex flex-col items-center gap-2 rounded-md border-t-4 border-saffron bg-card p-4 text-center shadow-card hover:bg-secondary">
            <Icon className="h-6 w-6 text-primary" />
            <span className="text-sm font-semibold text-primary">{label}</span>
          </Link>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-primary">Welcome</h2>
        <div className="mt-2 h-1 w-12 bg-saffron" />
        {about.isLoading ? (
          <Loading />
        ) : (
          <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
            {about.data?.history || "The Ju Jitsu Association of Andhra Pradesh promotes and develops Ju Jitsu throughout the state."}
          </p>
        )}
        <Link to="/about" className="mt-3 inline-block font-semibold text-primary hover:underline">Know more about us →</Link>
      </section>

      <section className="bg-secondary py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-primary">Latest Event Updates</h2>
              <div className="mt-2 h-1 w-12 bg-saffron" />
            </div>
            <Link to="/events" className="text-sm font-semibold text-primary hover:underline">View all</Link>
          </div>
          <div className="mt-6">
            {events.isLoading ? (
              <Loading />
            ) : events.error ? (
              <ErrorState error={events.error} retry={() => events.refetch()} />
            ) : events.data?.length ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {events.data.map((e) => <EventCard key={e.id} event={e} />)}
              </div>
            ) : (
              <Empty>No events published yet.</Empty>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
