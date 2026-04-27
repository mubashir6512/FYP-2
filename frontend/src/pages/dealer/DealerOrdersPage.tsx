import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader, StatCard } from "@/components/dashboard/DashboardComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart, Search, Loader2, AlertTriangle,
  DollarSign, Package, TrendingUp, Eye, ChevronDown, ChevronUp, Calendar
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function DealerOrdersPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "pending" | "refunded">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ["dealer-orders", user?.id],
    queryFn: () => api("/orders"),
    enabled: !!user,
  });

  const filtered = orders.filter((o: any) => {
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch =
      (o.orderNumber || "").toLowerCase().includes(q) ||
      (o.customerName || "").toLowerCase().includes(q) ||
      (o.customerPhone || "").toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const totalRevenue = orders.reduce((s: number, o: any) => s + Number(o.total || 0), 0);
  const todayOrders = orders.filter((o: any) =>
    new Date(o.createdAt).toDateString() === new Date().toDateString()
  );
  const todayRevenue = todayOrders.reduce((s: number, o: any) => s + Number(o.total || 0), 0);

  const statusVariants: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
    completed: "success",
    pending: "warning",
    refunded: "destructive",
  };

  return (
    <DashboardLayout role="dealer">
      <PageHeader title="Order History" description="View and manage all your POS orders.">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10">
          <ShoppingCart className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-accent">{orders.length} Total Orders</span>
        </div>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <StatCard title="Total Revenue" value={`Rs. ${totalRevenue.toFixed(0)}`} icon={DollarSign} />
        <StatCard title="Today's Orders" value={todayOrders.length} icon={Calendar} iconColor="text-info" />
        <StatCard title="Today's Revenue" value={`Rs. ${todayRevenue.toFixed(0)}`} icon={TrendingUp} iconColor="text-success" />
      </div>

      {/* Search & Filter */}
      <Card variant="elevated" className="mb-6">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by order #, customer name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "completed", "pending", "refunded"] as const).map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={statusFilter === s ? "accent" : "outline"}
                  onClick={() => setStatusFilter(s)}
                  className="capitalize"
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-accent" />
            {filtered.length} Orders
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
              <p className="text-muted-foreground">Failed to load orders</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="text-muted-foreground">No orders found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((order: any) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-border overflow-hidden"
                >
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                  >
                    <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground font-mono text-sm">{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">{order.customerName || "Walk-in Customer"}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-foreground">Rs. {Number(order.total).toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={statusVariants[order.status] || "secondary"} className="capitalize">
                        {order.status}
                      </Badge>
                    </div>
                    {expanded === order.id ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                  </div>

                  <AnimatePresence>
                    {expanded === order.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border bg-muted/20 p-4"
                      >
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                              <Package className="w-4 h-4 text-info" />
                              Items ({order.items?.length || 0})
                            </h4>
                            <div className="space-y-1">
                              {(order.items || []).map((item: any) => (
                                <div key={item.id} className="flex items-center justify-between text-xs p-2 rounded bg-background border border-border">
                                  <span className="text-foreground flex-1 truncate">{item.productName}</span>
                                  <span className="text-muted-foreground mx-2">x{item.quantity}</span>
                                  <span className="font-semibold text-foreground">Rs. {Number(item.totalPrice).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Customer</span>
                              <span className="text-foreground font-medium">{order.customerName || "Walk-in"}</span>
                            </div>
                            {order.customerPhone && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Phone</span>
                                <span className="text-foreground">{order.customerPhone}</span>
                              </div>
                            )}
                            {order.customerAddress && (
                              <div className="flex flex-col gap-1 mt-1 pt-1 border-t border-border/50">
                                <span className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Delivery Address</span>
                                <span className="text-foreground text-xs leading-relaxed italic">{order.customerAddress}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Payment</span>
                              <span className="text-foreground capitalize">{order.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Subtotal</span>
                              <span className="text-foreground">Rs. {Number(order.subtotal).toFixed(2)}</span>
                            </div>
                            {Number(order.discountAmount) > 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Discount</span>
                                <span className="text-success">-Rs. {Number(order.discountAmount).toFixed(2)}</span>
                              </div>
                            )}
                            {Number(order.taxAmount) > 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Tax</span>
                                <span className="text-foreground">Rs. {Number(order.taxAmount).toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between border-t border-border pt-2 font-bold">
                              <span className="text-foreground">Total</span>
                              <span className="text-accent">Rs. {Number(order.total).toFixed(2)}</span>
                            </div>
                          </div>
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
