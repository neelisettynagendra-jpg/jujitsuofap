import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import defaultLogo from "@/assets/association-logo.jpeg.asset.json";
import { validateLogo, validateSVG } from "./logo-validation";

export const DEFAULT_LOGO_URL = defaultLogo.url;
export const siteSettingsQuery = queryOptions({
  queryKey: ["site-settings"],
  refetchOnMount: "always",
  queryFn: async () => {
    const { data, error } = await supabase.from("site_settings").select("logo_url").eq("id", 1).maybeSingle();
    if (error) throw error;
    return data;
  },
});

export async function saveWebsiteLogo(file: File) {
  const extension = validateLogo(file);
  if (extension === "svg") validateSVG(await file.text());
  const path = `logos/${crypto.randomUUID()}.${extension}`;
  const bucket = supabase.storage.from("site-assets");
  const { error: uploadError } = await bucket.upload(path, file, { contentType: file.type });
  if (uploadError) throw uploadError;
  try {
    const { data, error } = await bucket.createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    if (error || !data) throw error ?? new Error("Could not create logo link.");
    const result = await supabase.from("site_settings").upsert({ id: 1, logo_url: data.signedUrl }).select("logo_url").single();
    if (result.error) throw result.error;
    return result.data;
  } catch (error) {
    await bucket.remove([path]);
    throw error;
  }
}