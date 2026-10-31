export const SITE_URL = "https://jujitsuofap.lovable.app";
export const HOME_DESCRIPTION = "Ju Jitsu Andhra Pradesh: official Jiu Jitsu Association AP website for events, district members, leadership and enquiries. See state Ju Jitsu updates.";

export function pageSEO(path: string, title: string, description: string, logo?: string | null, image?: string | null) {
  const url = `${SITE_URL}${path}`;
  const shareImage = image?.startsWith("https://") ? image : logo?.startsWith("https://") && !/\.svg(?:\?|$)/i.test(logo) ? logo : null;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:url", content: url },
      ...(shareImage ? [{ property: "og:image", content: shareImage }, { name: "twitter:image", content: shareImage }] : []),
    ],
    links: [{ rel: "canonical", href: url }, { rel: "icon", href: logo || "/favicon.png" }],
  };
}