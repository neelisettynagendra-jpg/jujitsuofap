import { SITE_URL } from "./seo";

export const ORGANIZATION_NAME = "Ju Jitsu Association of Andhra Pradesh";
const organizationId = `${SITE_URL}/#organization`;
type Node = Record<string, unknown>;
type EventData = { id: string; title: string; event_date: string; description: string; image_url: string | null };
type ContactData = { phones: string[]; emails: string[] };

export function organizationSchema() {
  return { "@type": ["Organization", "SportsOrganization"], "@id": organizationId, name: ORGANIZATION_NAME, url: `${SITE_URL}/` };
}

export function breadcrumbSchema(path: string, label: string) {
  return { "@type": "BreadcrumbList", "@id": `${SITE_URL}${path}#breadcrumbs`, itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: label, item: `${SITE_URL}${path}` },
  ] };
}

export function eventSchema(event: EventData): Node | null {
  if (!event.title.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(event.event_date) || !Number.isFinite(Date.parse(event.event_date)) || new Date(`${event.event_date}T00:00:00Z`).toISOString().slice(0, 10) !== event.event_date) return null;
  const url = `${SITE_URL}/events/${encodeURIComponent(event.id)}`;
  return { "@type": "Event", "@id": `${url}#event`, url, name: event.title, startDate: event.event_date,
    ...(event.description.trim() ? { description: event.description } : {}),
    ...(event.image_url?.startsWith("https://") ? { image: event.image_url } : {}),
  };
}

export function structuredData(path: string, label: string, options: { contact?: ContactData | null; events?: EventData[] } = {}) {
  const nodes: Node[] = [];
  if (path === "/" || path === "/about") nodes.push(organizationSchema());
  if (path === "/") nodes.push({ "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: ORGANIZATION_NAME, url: `${SITE_URL}/`, publisher: { "@id": organizationId } });
  else nodes.push(breadcrumbSchema(path, label));
  if (path === "/contact") {
    // Only owner-confirmed contact values are eligible; sample addresses and other
    // unverified settings remain visible but are never promoted into schema.
    const phone = options.contact?.phones.find((value) => value === "9885644031");
    const email = options.contact?.emails.find((value) => value === "sk.yaseen700@gmail.com");
    const contactId = `${SITE_URL}/contact#contact-point`;
    if (phone || email) nodes.push({ "@type": "ContactPoint", "@id": contactId, ...(phone ? { telephone: phone } : {}), ...(email ? { email } : {}) });
    nodes.push({ "@type": "ContactPage", "@id": `${SITE_URL}/contact#page`, name: "Contact Us", url: `${SITE_URL}/contact`, ...(phone || email ? { mainEntity: { "@id": contactId } } : {}) });
  }
  for (const event of options.events ?? []) {
    const node = eventSchema(event);
    if (node) nodes.push(node);
  }
  return [{ type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@graph": nodes }).replace(/</g, "\\u003c") }];
}