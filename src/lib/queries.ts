import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getPublicAbout, getPublicBearers, getPublicContact, getPublicDistricts, getPublicEvent, getPublicEvents, getPublicExecutiveMembers, getPublicGallery, getPublicLatestEvents } from "./public-content.functions";
import { HOME_CONTENT_REFRESH_MS } from "./latest-events";

export const latestEventsQuery = queryOptions({
  queryKey: ["events", "latest"],
  staleTime: 0,
  refetchInterval: HOME_CONTENT_REFRESH_MS,
  queryFn: () => getPublicLatestEvents(),
});

async function run<T>(p: PromiseLike<{ data: T; error: { message: string } | null }>): Promise<T> {
  const { data, error } = await p;
  if (error) throw new Error(error.message);
  return data;
}

export const eventsQuery = (limit?: number) =>
  queryOptions({
    queryKey: ["events", limit ?? "all"],
    staleTime: 30_000,
    queryFn: () => getPublicEvents({ data: limit === undefined ? {} : { limit } }),
  });

export const eventQuery = (id: string) =>
  queryOptions({
    queryKey: ["event", id],
    staleTime: 30_000,
    queryFn: () => getPublicEvent({ data: { id } }),
  });

export const activeNoticesQuery = queryOptions({
  queryKey: ["notices", "active"],
  queryFn: () => run(supabase.from("notices").select("*").eq("is_active", true).order("created_at", { ascending: false })),
});

export const allNoticesQuery = queryOptions({
  queryKey: ["notices", "all"],
  queryFn: () => run(supabase.from("notices").select("*").order("created_at", { ascending: false })),
});

export const contactQuery = queryOptions({
  queryKey: ["contact"],
  staleTime: 30_000,
  queryFn: () => getPublicContact(),
});

export const aboutQuery = queryOptions({
  queryKey: ["about"],
  staleTime: 30_000,
  queryFn: () => getPublicAbout(),
});

export const bearersQuery = queryOptions({
  queryKey: ["bearers"],
  staleTime: 30_000,
  queryFn: () => getPublicBearers(),
});

export const galleryQuery = queryOptions({
  queryKey: ["gallery"],
  staleTime: 30_000,
  queryFn: () => getPublicGallery(),
});

export const districtsQuery = queryOptions({
  queryKey: ["districts"],
  staleTime: 30_000,
  queryFn: () => getPublicDistricts(),
});

export const executiveMembersQuery = queryOptions({
  queryKey: ["executive-members"],
  staleTime: 30_000,
  queryFn: () => getPublicExecutiveMembers(),
});

export const enquiriesQuery = queryOptions({
  queryKey: ["enquiries"],
  queryFn: () => run(supabase.from("enquiries").select("*").order("created_at", { ascending: false })),
});

export function formatDate(d: string) {
  return new Date(d + (d.length === 10 ? "T00:00:00" : "")).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
