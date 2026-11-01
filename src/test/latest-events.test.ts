import { describe, expect, it } from "vitest";
import { HOME_CONTENT_REFRESH_MS, latestEventOrder } from "@/lib/latest-events";

describe("Home latest events", () => {
  it("selects three rows by latest edit or creation, not the scheduled event date", () => {
    const rows = [
      { id: "old", updated_at: "2026-01-01", created_at: "2026-01-01", event_date: "2027-12-01" },
      { id: "edited", updated_at: "2026-11-01", created_at: "2026-01-01", event_date: "2026-02-01" },
      { id: "new", updated_at: "2026-10-31", created_at: "2026-10-31", event_date: "2026-11-10" },
      { id: "third", updated_at: "2026-10-30", created_at: "2026-10-30", event_date: "2026-11-09" },
    ];
    const orders: string[] = [];
    const query = {
      order(column: string, options: { ascending: boolean }) { expect(options.ascending).toBe(false); orders.push(column); return this; },
      limit(count: number) { rows.sort((a, b) => { for (const key of orders) { const result = String(b[key as keyof typeof b]).localeCompare(String(a[key as keyof typeof a])); if (result) return result; } return 0; }); rows.splice(count); return this; },
    };
    latestEventOrder(query);
    expect(rows.map(row => row.id)).toEqual(["edited", "new", "third"]);
    expect(orders).toEqual(["updated_at", "created_at", "id"]);
  });
  it("automatically refreshes home content every fifteen seconds", () => {
    expect(HOME_CONTENT_REFRESH_MS).toBe(15_000);
  });
});