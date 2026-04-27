import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/dashboard/DashboardComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users, Search, Trash2, Eye, Loader2, AlertTriangle,
  UserCheck, Building2, Brush, ShieldCheck, Filter
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";

type Role = "all" | "customer" | "dealer" | "painter" | "admin";

const roleColors: Record<string, string> = {
  customer: "bg-info/10 text-info border-info/20",
  dealer: "bg-success/10 text-success border-success/20",
  painter: "bg-accent/10 text-accent border-accent/20",
  admin: "bg-warning/10 text-warning border-warning/20",
};

const roleIcons: Record<string, React.ElementType> = {
  customer: UserCheck,
  dealer: Building2,
  painter: Brush,
  admin: ShieldCheck,
};

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role>("all");

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ["admin-users", roleFilter],
    queryFn: () => api(`/admin/users?role=${roleFilter}`),
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => api(`/admin/users/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User deleted successfully");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const filtered = users.filter((u: any) => {
    const name = u.profile?.fullName?.toLowerCase() || "";
    const email = u.email?.toLowerCase() || "";
    const q = search.toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  const roleCounts = users.reduce((acc: Record<string, number>, u: any) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});

  return (
    <DashboardLayout role="admin">
      <PageHeader title="User Management" description="Manage all registered users across the platform.">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10">
          <Users className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-accent">{users.length} Total Users</span>
        </div>
      </PageHeader>

      {/* Role Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {(["customer", "dealer", "painter", "admin"] as const).map((r) => {
          const Icon = roleIcons[r];
          return (
            <motion.div key={r} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card
                variant="elevated"
                className={`cursor-pointer border-2 transition-all ${roleFilter === r ? "border-accent" : "border-transparent"}`}
                onClick={() => setRoleFilter(roleFilter === r ? "all" : r)}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${roleColors[r]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-foreground">{roleCounts[r] || 0}</p>
                      <p className="text-xs text-muted-foreground capitalize">{r}s</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Search & Filters */}
      <Card variant="elevated" className="mb-6">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(["all", "customer", "dealer", "painter", "admin"] as Role[]).map((r) => (
                <Button
                  key={r}
                  size="sm"
                  variant={roleFilter === r ? "accent" : "outline"}
                  onClick={() => setRoleFilter(r)}
                  className="capitalize"
                >
                  {r}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5 text-accent" />
            {filtered.length} Users {roleFilter !== "all" ? `(${roleFilter}s)` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-16">
              <AlertTriangle className="w-10 h-10 text-warning mb-3" />
              <p className="text-muted-foreground">Failed to load users</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((user: any) => {
                const Icon = roleIcons[user.role] || UserCheck;
                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${roleColors[user.role]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {user.profile?.fullName || "—"}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-3">
                      <Badge className={`border text-xs capitalize ${roleColors[user.role]}`}>
                        {user.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (confirm(`Delete ${user.email}?`)) deleteUser.mutate(user.id);
                        }}
                        disabled={user.role === "admin"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
