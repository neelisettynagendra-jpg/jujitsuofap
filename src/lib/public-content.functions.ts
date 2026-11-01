import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { publicContentClient, publicResult } from "./public-content.server";

export const getPublicEvents = createServerFn({ method: "GET" })
  .inputValidator((input: { limit?: number }) => z.object({ limit: z.number().int().min(1).max(100).optional() }).parse(input))
  .handler(({ data }) => {
    let query = publicContentClient().from("events").select("id,title,description,event_date,image_url,created_at,updated_at").order("event_date", { ascending: false }).order("created_at", { ascending: false });
    if (data.limit) query = query.limit(data.limit);
    return publicResult(query);
  });
export const getPublicEvent = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(({ data }) => publicResult(publicContentClient().from("events").select("id,title,description,event_date,image_url,created_at,updated_at").eq("id", data.id).maybeSingle()));
export const getPublicAbout = createServerFn({ method: "GET" }).handler(() => publicResult(publicContentClient().from("about_content").select("id,history,mission,home_banner_url,updated_at").eq("id", 1).maybeSingle()));
export const getPublicContact = createServerFn({ method: "GET" }).handler(() => publicResult(publicContentClient().from("contact_info").select("id,address,phones,emails,updated_at").eq("id", 1).maybeSingle()));
export const getPublicBearers = createServerFn({ method: "GET" }).handler(() => publicResult(publicContentClient().from("office_bearers").select("id,name,designation,sort_order,created_at,updated_at").order("sort_order")));
export const getPublicGallery = createServerFn({ method: "GET" }).handler(() => publicResult(publicContentClient().from("gallery_images").select("id,image_url,caption,storage_path,created_at").order("created_at", { ascending: false })));
export const getPublicDistricts = createServerFn({ method: "GET" }).handler(() => publicResult(publicContentClient().from("districts").select("id,district_name,coordinator_name,president_name,secretary_name,phone,email,created_at,updated_at").order("district_name")));
export const getPublicExecutiveMembers = createServerFn({ method: "GET" }).handler(() => publicResult(publicContentClient().from("executive_members").select("id,name,role,image_url,sort_order,storage_path,created_at,updated_at").order("sort_order").order("created_at").order("id")));
export const getPublicSettings = createServerFn({ method: "GET" }).handler(() => publicResult(publicContentClient().from("site_settings").select("logo_url").eq("id", 1).maybeSingle()));