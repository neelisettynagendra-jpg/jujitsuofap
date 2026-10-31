import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const getPublicSEO = createServerFn({ method: "GET" })
  .inputValidator((input: { home?: boolean; eventId?: string }) => input)
  .handler(async ({ data }) => {
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
    const url = process.env["SUPABASE_URL"];
    if (!key || !url) return { logo: null, banner: null, event: null };
    const client = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      } },
    });
    const [settings, banner, event] = await Promise.all([
      client.from("site_settings").select("logo_url").eq("id", 1).maybeSingle(),
      data.home ? client.from("about_content").select("home_banner_url").eq("id", 1).maybeSingle() : null,
      data.eventId ? client.from("events").select("title, description, image_url").eq("id", data.eventId).maybeSingle() : null,
    ]);
    if (settings.error || banner?.error || event?.error) console.warn("Public SEO settings could not be fully loaded");
    return { logo: settings.data?.logo_url ?? null, banner: banner?.data?.home_banner_url ?? null, event: event?.data ?? null };
  });