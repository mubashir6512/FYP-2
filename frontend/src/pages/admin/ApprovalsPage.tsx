import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/dashboard/DashboardComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Check, X, Loader2, Building2, Brush, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type ApprovalRow = {
  id: string;
  user_id: string;
  role: "dealer" | "painter" | "customer" | "admin";
  status: "pending" | "approved" | "rejected";
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  full_name?: string;
};

export default function ApprovalsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<ApprovalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");

  const load = async () => {
    setLoading(true);
    const { data: approvals, error } = await supabase
      .from("account_approvals")
      .select("*")
      .in("role", ["dealer", "painter"])
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // Hydrate names
    const ids = (approvals ?? []).map((a) => a.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name")
      .in("user_id", ids);
    const nameMap = new Map(profiles?.map((p) => [p.user_id, p.full_name]) ?? []);

    setRows(
      (approvals ?? []).map((a) => ({
        ...(a as ApprovalRow),
        full_name: nameMap.get(a.user_id) ?? "Unknown",
      })),
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const review = async (id: string, status: "approved" | "rejected") => {
    setActing(id);
    const { error } = await supabase
      .from("account_approvals")
      .update({
        status,
        reviewed_by: user?.id ?? null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);
    setActing(null);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(status === "approved" ? "Account approved" : "Account rejected");
    load();
  };

  const filtered = rows.filter((r) => r.status === tab);

  return (
    <DashboardLayout role="admin">
      <PageHeader
        title="Account Approvals"
        description="Review and approve dealer and painter signups."
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({rows.filter((r) => r.status === "pending").length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({rows.filter((r) => r.status === "approved").length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rows.filter((r) => r.status === "rejected").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <Card variant="elevated">
              <CardContent className="py-12 text-center text-muted-foreground">
                No {tab} accounts.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filtered.map((r) => (
                <Card key={r.id} variant="elevated">
                  <CardHeader className="flex flex-row items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                        {r.role === "dealer" ? (
                          <Building2 className="w-6 h-6 text-accent" />
                        ) : (
                          <Brush className="w-6 h-6 text-accent" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{r.full_name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={r.role === "dealer" ? "accent" : "info"}>
                            {r.role === "dealer" ? "Dealer" : "Painter"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Applied {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        r.status === "approved"
                          ? "success"
                          : r.status === "rejected"
                            ? "destructive"
                            : "pending"
                      }
                    >
                      {r.status}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Mail className="w-4 h-4" />
                      <span className="font-mono text-xs">User ID: {r.user_id}</span>
                    </div>

                    {r.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          variant="success"
                          size="sm"
                          disabled={acting === r.id}
                          onClick={() => review(r.id, "approved")}
                          className="gap-2"
                        >
                          {acting === r.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={acting === r.id}
                          onClick={() => review(r.id, "rejected")}
                          className="gap-2"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </Button>
                      </div>
                    )}

                    {r.status !== "pending" && r.reviewed_at && (
                      <p className="text-xs text-muted-foreground">
                        Reviewed {formatDistanceToNow(new Date(r.reviewed_at), { addSuffix: true })}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}


