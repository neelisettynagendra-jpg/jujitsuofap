import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { AdminHeader, errMsg } from "@/components/admin/AdminUI";
import { ErrorState, Loading } from "@/components/site/States";
import { Button } from "@/components/ui/button";
import { DEFAULT_LOGO_URL, saveWebsiteLogo, siteSettingsQuery } from "@/lib/site-settings";
import { validateLogo, validateSVG } from "@/lib/logo-validation";

export const Route = createFileRoute("/admin/logo")({
  head: () => ({ meta: [
    { title: "Website Logo — Ju Jitsu AP" },
    { name: "description", content: "Manage the association website logo." },
    { property: "og:title", content: "Website Logo — Ju Jitsu AP" },
    { property: "og:description", content: "Manage the association website logo." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "robots", content: "noindex" },
  ] }),
  component: WebsiteLogo,
});

function WebsiteLogo() {
  const query = useQuery(siteSettingsQuery);
  const qc = useQueryClient();
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function pick(chosen?: File) {
    if (!chosen) return;
    try {
      validateLogo(chosen);
      if (chosen.type === "image/svg+xml") validateSVG(await chosen.text());
      setFile(chosen);
    } catch (error) { toast.error(errMsg(error)); }
    if (input.current) input.current.value = "";
  }

  async function save() {
    if (!file) return;
    setBusy(true);
    try {
      const settings = await saveWebsiteLogo(file);
      qc.setQueryData(siteSettingsQuery.queryKey, settings);
      await qc.invalidateQueries({ queryKey: siteSettingsQuery.queryKey });
      await router.invalidate();
      setFile(null);
      toast.success("Website logo saved successfully");
    } catch (error) { toast.error(errMsg(error)); }
    finally { setBusy(false); }
  }

  return <>
    <AdminHeader title="Website Logo" />
    {query.isLoading ? <Loading /> : query.error ? <ErrorState error={query.error} retry={() => query.refetch()} /> : (
      <div className="max-w-xl space-y-4">
        <img src={preview || query.data?.logo_url || DEFAULT_LOGO_URL} alt="Website logo preview" className="h-40 w-40 border bg-card object-contain p-2" />
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => input.current?.click()} disabled={busy}><ImagePlus /> Upload New Logo</Button>
          <Button onClick={save} disabled={busy || !file}>{busy ? <Loader2 className="animate-spin" /> : <Save />} Save</Button>
        </div>
        <input ref={input} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" aria-label="Choose website logo" className="hidden" disabled={busy} onChange={(e) => pick(e.target.files?.[0])} />
      </div>
    )}
  </>;
}