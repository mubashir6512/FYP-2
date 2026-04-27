import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader, StatCard } from "@/components/dashboard/DashboardComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Building2, Search, Eye, Loader2, AlertTriangle,
  Package, TrendingUp, DollarSign, ChevronDown, ChevronUp
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDealersPage() {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<Record<string, any>>({});
  const [loadingDetail, setLoadingDetail] = useState<string | null>(null);

  const { data: dealers = [], isLoading, error } = useQuery({
    queryKey: ["admin-dealers"],
    queryFn: () => api("/admin/dealers"),
  });

  const filtered = dealers.filter((d: any) => {
    const name = d.profile?.fullName?.toLowerCase() || "";
    const email = d.email?.toLowerCase() || "";
    return name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
  });

  const totalProducts = dealers.reduce((s: number, d: any) => s + (d.productCount || 0), 0);
  const totalValue = dealers.reduce((s: number, d: any) => s + (d.totalInventoryValue || 0), 0);

  const handleToggle = async (id: string) => {
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    setExpanded(id);
    if (!detailData[id]) {
      setLoadingDetail(id);
      try {
        const data = await api(`/admin/dealers/${id}`);
        setDetailData(prev => ({ ...prev, [id]: data }));
      } catch (e) {
        // ignore
      } finally {
        setLoadingDetail(null);
      }
    }
  };

  return (
    <DashboardLayout role="admin">
      <PageHeader title="Company Management" description="Oversee all registered companies, their products and sales.">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10">
          <Building2 className="w-4 h-4 text-success" />
          <span className="text-sm font-medium text-success">{dealers.length} Active Companies</span>
        </div>
      </PageHeader>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <StatCard title="Total Companies" value={dealers.length} icon={Building2} />
        <StatCard title="Total Products" value={totalProducts} icon={Package} iconColor="text-info" />
        <StatCard
          title="Total Inventory Value"
          value={`Rs. ${totalValue.toLocaleString()}`}
          icon={DollarSign}
          iconColor="text-success"
        />
      </div>

      {/* Search */}
      <Card variant="elevated" className="mb-6">
        <CardContent className="pt-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search companies by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Companies List */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5 text-success" />
            {filtered.length} Companies
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
              <p className="text-muted-foreground">Failed to load dealers</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="text-muted-foreground">No companies found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((dealer: any) => (
                <motion.div
                  key={dealer.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-border overflow-hidden"
                >
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => handleToggle(dealer.id)}
                  >
                    <div className="w-10 h-10 rounded-full bg-success/10 border border-success/20 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{dealer.profile?.fullName || "—"}</p>
                      <p className="text-sm text-muted-foreground">{dealer.email}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm font-bold text-foreground">{dealer.productCount}</p>
                        <p className="text-xs text-muted-foreground">Products</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-foreground">
                          Rs. {Number(dealer.totalInventoryValue || 0).toFixed(0)}
                        </p>
                        <p className="text-xs text-muted-foreground">Inventory</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="hidden sm:flex">
                      {new Date(dealer.createdAt).toLocaleDateString()}
                    </Badge>
                    {expanded === dealer.id ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>

                  <AnimatePresence>
                    {expanded === dealer.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border bg-muted/20"
                      >
                        <div className="p-4">
                          {loadingDetail === dealer.id ? (
                            <div className="flex justify-center py-6">
                              <Loader2 className="w-6 h-6 animate-spin text-accent" />
                            </div>
                          ) : detailData[dealer.id] ? (
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                                  <Package className="w-4 h-4 text-info" />
                                  Products ({detailData[dealer.id].products?.length || 0})
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  {(detailData[dealer.id].products || []).slice(0, 8).map((p: any) => (
                                    <div key={p.id} className="p-2 rounded-lg bg-background border border-border text-xs">
                                      <p className="font-medium text-foreground truncate">{p.name}</p>
                                      <p className="text-muted-foreground">Rs. {Number(p.price).toFixed(0)} · {p.stockQuantity} in stock</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                                  <TrendingUp className="w-4 h-4 text-success" />
                                  Recent Orders ({detailData[dealer.id].orders?.length || 0})
                                </h4>
                                {(detailData[dealer.id].orders || []).length === 0 ? (
                                  <p className="text-sm text-muted-foreground">No orders yet</p>
                                ) : (
                                  <div className="space-y-1">
                                    {(detailData[dealer.id].orders || []).slice(0, 5).map((o: any) => (
                                      <div key={o.id} className="flex items-center justify-between text-xs p-2 rounded bg-background border border-border">
                                        <span className="font-mono text-muted-foreground">{o.orderNumber}</span>
                                        <span className="text-foreground font-medium">Rs. {Number(o.total).toFixed(0)}</span>
                                        <Badge variant="secondary" className="text-[10px]">{o.status}</Badge>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No detail available</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
