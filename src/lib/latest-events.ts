export const HOME_EVENT_LIMIT = 3;
export const HOME_CONTENT_REFRESH_MS = 15_000;

// updated_at is initialized on insert and maintained by the existing save trigger.
export function latestEventOrder<T extends { order: (column: string, options: { ascending: boolean }) => T; limit: (count: number) => T }>(query: T): T {
  return query.order("updated_at", { ascending: false }).order("created_at", { ascending: false }).order("id", { ascending: false }).limit(HOME_EVENT_LIMIT);
}