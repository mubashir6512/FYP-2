import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Returns unread message counts per job and aggregated total
 * for the current authenticated user (counts only messages they did NOT send).
 * Subscribes to realtime so badges update live.
 */
export function useUnreadJobMessages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["unread-job-messages", user?.id],
    queryFn: async () => {
      if (!user) return { perJob: {} as Record<string, number>, total: 0 };

      const { data, error } = await supabase
        .from("job_messages")
        .select("job_id, sender_id, read_at")
        .is("read_at", null)
        .neq("sender_id", user.id);

      if (error) throw error;

      const perJob: Record<string, number> = {};
      for (const m of data || []) {
        perJob[m.job_id] = (perJob[m.job_id] || 0) + 1;
      }
      const total = (data || []).length;
      return { perJob, total };
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`unread-job-messages:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "job_messages" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["unread-job-messages", user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return query;
}


