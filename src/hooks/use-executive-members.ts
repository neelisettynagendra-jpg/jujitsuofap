import { useEffect } from "react";
import { useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { executiveMembersQuery } from "@/lib/queries";

function useExecutiveRealtime() {
  const qc = useQueryClient();
  useEffect(() => {
    const channel = supabase.channel(`executive-members-${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "executive_members" }, () => {
        void qc.invalidateQueries({ queryKey: ["executive-members"] });
      }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [qc]);
}

export function useExecutiveMembers() {
  useExecutiveRealtime();
  return useQuery(executiveMembersQuery);
}

export function usePublicExecutiveMembers() {
  useExecutiveRealtime();
  return useSuspenseQuery(executiveMembersQuery);
}