import { executiveMembersQuery } from "@/lib/queries";
import { siteSettingsQuery } from "@/lib/site-settings";
import { structuredData } from "@/lib/structured-data";
import { PublicNotFound, PublicRouteError } from "@/components/site/PublicRouteStates";
import { pageSEO } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { usePublicExecutiveMembers } from "@/hooks/use-executive-members";
import { Empty, ErrorState, Loading, PageTitle } from "@/components/site/States";

export const Route = createFileRoute("/executive-committee")({
  staticData: { sitemap: true },
  loader: async ({ context }) => {
    const [members, settings] = await Promise.all([
      context.queryClient.ensureQueryData(executiveMembersQuery),
      context.queryClient.ensureQueryData(siteSettingsQuery),
    ]);
    return { members, logo: settings?.logo_url };
  },
  head: ({ loaderData }) => ({ ...pageSEO("/executive-committee", "Executive Committee — Ju Jitsu Association of Andhra Pradesh", "Meet the Ju Jitsu Andhra Pradesh Executive Committee and discover the names and roles of the official Jiu Jitsu Association AP leadership.", loaderData?.logo), scripts: structuredData("/executive-committee", "Executive Committee", {}) }),
  pendingComponent: Loading,
  errorComponent: PublicRouteError,
  notFoundComponent: PublicNotFound,
  component: ExecutiveCommittee,
});

function ExecutiveCommittee() {
  const { data, isLoading, error, refetch } = usePublicExecutiveMembers();
  return <>
    <PageTitle title="Executive Committee" />
    <div className="mx-auto max-w-6xl px-4 py-8">
      {isLoading ? <Loading /> : error ? <ErrorState error={error} retry={() => refetch()} /> : !data?.length ? <Empty>No executive members listed yet.</Empty> : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {data.map((member) => <article key={member.id} className="min-w-0 rounded-md border bg-card p-5 text-center shadow-card">
            <img src={member.image_url} alt={member.name} width={128} height={128} loading="lazy" className="mx-auto h-32 w-32 rounded-full object-cover" />
            <h2 className="mt-4 break-words text-lg font-bold text-primary">{member.name}</h2>
            <p className="mt-1 break-words text-sm text-muted-foreground">{member.role}</p>
          </article>)}
        </div>
      )}
    </div>
  </>;
}
