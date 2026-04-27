import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  StatCard,
  PageHeader,
  DataTable,
} from "@/components/dashboard/DashboardComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Plus,
  ArrowRight,
  AlertTriangle,
  Loader2,
  Monitor,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

export default function DealerDashboard() {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["dealer-dashboard", user?.id],
    queryFn: async () => {
      try {
        const [orders, products] = await Promise.all([
          api("/orders"),
          api("/products/dealer"),
        ]);

        const totalRevenue = orders.reduce((s: number, o: any) => s + Number(o.total), 0);
        const lowStock = products.filter(
          (p: any) => p.stockQuantity <= p.lowStockThreshold && p.stockQuantity > 0
        );

        return { orders, products, totalRevenue, lowStock };
      } catch (err) {
        console.error("Dealer dashboard error:", err);
        throw err;
      }
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <DashboardLayout role="dealer">
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="dealer">
        <div className="flex flex-col items-center justify-center py-24">
          <AlertTriangle className="w-12 h-12 text-warning mb-4" />
          <p className="text-lg font-semibold text-foreground mb-2">Unable to load dashboard</p>
          <p className="text-sm text-muted-foreground mb-4">Please make sure the backend server is running</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    {
      title: "Total Revenue",
      value: `Rs. ${(data?.totalRevenue || 0).toFixed(0)}`,
      icon: DollarSign,
    },
    {
      title: "Total Orders",
      value: data?.orders?.length || 0,
      icon: ShoppingCart,
    },
    {
      title: "Products Listed",
      value: data?.products?.length || 0,
      icon: Package,
      iconColor: "text-info" as const,
    },
    {
      title: "Low Stock Items",
      value: data?.lowStock?.length || 0,
      icon: AlertTriangle,
      iconColor: "text-warning" as const,
    },
  ];

  const recentOrders = (data?.orders || []).slice(0, 8).map((o: any) => ({
    id: o.orderNumber,
    customer: o.customerName || "Walk-in",
    status: (
      <Badge variant={o.status === "completed" ? "success" : "warning"}>
        {o.status}
      </Badge>
    ),
    total: `Rs. ${Number(o.total).toFixed(2)}`,
  }));

  const todayOrders = (data?.orders || []).filter((o: any) => {
    const orderDate = new Date(o.createdAt);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  });

  const todayRevenue = todayOrders.reduce((s: number, o: any) => s + Number(o.total), 0);

  const topProducts = (data?.products || [])
    .sort((a: any, b: any) => b.stockQuantity - a.stockQuantity)
    .slice(0, 5);

  return (
    <DashboardLayout role="dealer">
      <PageHeader
        title="Company Dashboard"
        description="Manage your products, orders, and inventory."
      >
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/dealer/pos" className="gap-2">
              <Monitor className="w-4 h-4" />
              Open POS
            </Link>
          </Button>
          <Button variant="accent" asChild>
            <Link to="/dealer/products" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Product
            </Link>
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Today's Performance */}
      <div className="grid lg:grid-cols-4 gap-6 mb-6">
        <Card variant="elevated" className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Today's Sales</span>
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <p className="text-2xl font-bold text-foreground">Rs. {todayRevenue.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground mt-1">{todayOrders.length} orders</p>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Avg Order Value</span>
              <DollarSign className="w-4 h-4 text-info" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              Rs. {data?.orders?.length ? (data.totalRevenue / data.orders.length).toFixed(0) : 0}
            </p>
            <p className="text-xs text-success mt-1">+8% from last week</p>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Inventory Value</span>
              <Package className="w-4 h-4 text-warning" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              Rs. {(data?.products || []).reduce((s: number, p: any) => s + (Number(p.price) * p.stockQuantity), 0).toFixed(0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{data?.products?.length || 0} products</p>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Stock Health</span>
              <CheckCircle2 className="w-4 h-4 text-success" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {data?.products?.length ? Math.round(((data.products.length - (data.lowStock?.length || 0)) / data.products.length) * 100) : 0}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {(data?.lowStock?.length || 0)} items low
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Orders</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dealer/analytics" className="gap-1">
                  View Analytics
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                  <p className="text-muted-foreground mb-4">No orders yet</p>
                  <Button variant="accent" asChild>
                    <Link to="/dealer/pos">
                      <Monitor className="w-4 h-4 mr-2" />
                      Open POS System
                    </Link>
                  </Button>
                </div>
              ) : (
                <DataTable
                  columns={[
                    { key: "id", label: "Order #" },
                    { key: "customer", label: "Customer" },
                    { key: "status", label: "Status" },
                    { key: "total", label: "Total" },
                  ]}
                  data={recentOrders}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card variant="elevated" className="border-warning/30">
            <CardHeader className="flex flex-row items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <CardTitle className="text-lg">Low Stock Alert</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(data?.lowStock || []).length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-muted-foreground">All stock levels healthy!</p>
                </div>
              ) : (
                (data?.lowStock || []).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-warning/5 border border-warning/20"
                  >
                    <div className="flex items-center gap-2">
                      {item.colorHex && (
                        <div
                          className="w-8 h-8 rounded-md shadow-sm"
                          style={{ backgroundColor: item.colorHex }}
                        />
                      )}
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.sku || "No SKU"}
                        </p>
                      </div>
                    </div>
                    <Badge variant="warning">{item.stockQuantity} left</Badge>
                  </div>
                ))
              )}
              <Button variant="outline" className="w-full" asChild>
                <Link to="/dealer/inventory">Manage Inventory</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Products */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-success" />
            Top Products by Stock
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {topProducts.map((product: any) => (
              <div key={product.id} className="p-4 rounded-lg border border-border hover:border-accent/50 transition-colors">
                {product.colorHex && (
                  <div
                    className="w-full h-20 rounded-lg mb-3 shadow-sm"
                    style={{ backgroundColor: product.colorHex }}
                  />
                )}
                <p className="font-medium text-foreground text-sm truncate mb-1">
                  {product.name}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Stock: {product.stockQuantity}</span>
                  <span className="font-semibold text-accent">Rs. {product.price}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
