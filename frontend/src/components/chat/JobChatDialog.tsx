import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
// ScrollArea replaced by native scroll for reliable ref autoscroll
import { Badge } from "@/components/ui/badge";
import { Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface JobMessage {
  id: string;
  job_id: string;
  sender_id: string;
  sender_role: "customer" | "painter";
  content: string;
  read_at: string | null;
  created_at: string;
  _optimistic?: boolean;
}

interface JobChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string | null;
  jobStatus?: string;
  counterpartName?: string;
  selfRole: "customer" | "painter";
}

export function JobChatDialog({
  open,
  onOpenChange,
  jobId,
  jobStatus,
  counterpartName,
  selfRole,
}: JobChatDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<JobMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const canSend = jobStatus === "accepted" || jobStatus === "completed";

  const { isLoading } = useQuery({
    queryKey: ["job-messages", jobId],
    queryFn: async () => {
      if (!jobId) return [];
      const { data, error } = await supabase
        .from("job_messages")
        .select("*")
        .eq("job_id", jobId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setMessages((data || []) as JobMessage[]);
      return data;
    },
    enabled: !!jobId && open,
  });

  // Realtime subscription per dialog
  useEffect(() => {
    if (!jobId || !open) return;
    const channel = supabase
      .channel(`job:${jobId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "job_messages", filter: `job_id=eq.${jobId}` },
        (payload) => {
          const msg = payload.new as JobMessage;
          setMessages((prev) => {
            // dedupe optimistic
            if (prev.some((m) => m.id === msg.id)) return prev;
            const filtered = prev.filter(
              (m) => !(m._optimistic && m.content === msg.content && m.sender_id === msg.sender_id)
            );
            return [...filtered, msg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId, open]);

  // Mark unread incoming messages as read on open
  useEffect(() => {
    if (!open || !jobId || !user) return;
    (async () => {
      await supabase
        .from("job_messages")
        .update({ read_at: new Date().toISOString() })
        .eq("job_id", jobId)
        .neq("sender_id", user.id)
        .is("read_at", null);
      queryClient.invalidateQueries({ queryKey: ["unread-job-messages", user.id] });
    })();
  }, [open, jobId, user, queryClient, messages.length]);

  // Autoscroll on new messages
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length, open]);

  const handleSend = async () => {
    const content = draft.trim();
    if (!content || !jobId || !user || sending) return;
    setSending(true);

    const optimisticId = `optimistic-${Date.now()}`;
    const optimistic: JobMessage = {
      id: optimisticId,
      job_id: jobId,
      sender_id: user.id,
      sender_role: selfRole,
      content,
      read_at: null,
      created_at: new Date().toISOString(),
      _optimistic: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setDraft("");

    const { data, error } = await supabase
      .from("job_messages")
      .insert({
        job_id: jobId,
        sender_id: user.id,
        sender_role: selfRole,
        content,
      })
      .select()
      .single();

    setSending(false);

    if (error) {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setDraft(content);
      toast.error(error.message || "Failed to send message");
      return;
    }

    // Replace optimistic with real
    setMessages((prev) =>
      prev.map((m) => (m.id === optimisticId ? (data as JobMessage) : m))
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 flex flex-col h-[600px]">
        <DialogHeader className="p-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2">
            Chat with {counterpartName || (selfRole === "customer" ? "Painter" : "Customer")}
            {jobStatus && (
              <Badge variant={jobStatus === "completed" ? "success" : jobStatus === "accepted" ? "info" : "secondary"}>
                {jobStatus}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Messages are private to you and the other party on this booking.
          </DialogDescription>
        </DialogHeader>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
            </div>
          ) : messages.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-12">
              No messages yet. Say hello!
            </p>
          ) : (
            <div className="space-y-3">
              {messages.map((m) => {
                const isSelf = m.sender_id === user?.id;
                return (
                  <div
                    key={m.id}
                    className={`flex ${isSelf ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                        isSelf
                          ? "bg-accent text-accent-foreground rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      } ${m._optimistic ? "opacity-70" : ""}`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>
                      <p
                        className={`text-[10px] mt-1 ${
                          isSelf ? "text-accent-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        {new Date(m.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-border p-3">
          {!canSend ? (
            <p className="text-xs text-center text-muted-foreground py-2">
              Chat is available once the booking is accepted.
            </p>
          ) : (
            <div className="flex items-end gap-2">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message..."
                rows={1}
                className="resize-none min-h-[40px] max-h-[120px]"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button
                variant="accent"
                size="icon"
                onClick={handleSend}
                disabled={!draft.trim() || sending}
                aria-label="Send message"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


