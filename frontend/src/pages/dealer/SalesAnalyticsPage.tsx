import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader, StatCard } from "@/components/dashboard/DashboardComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
  Loader2,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(var(--accent))", "hsl(var(--info))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))"];

export default function SalesAnalyticsPage() {
  const { user, role } = useAuth();
  const isAdmin = role === "admin";

  const { data, isLoading } = useQuery({
    queryKey: ["sales-analytics", user?.id, isAdmin],
    queryFn: async () => {
      const orders = await api("/orders");

      const totalRevenue = orders.reduce((s: number, o: any) => s + Number(o.total || 0), 0);
      const totalOrders = orders.length;
      const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Daily sales for last 7 days
      const dailySales: Record<string, number> = {};
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        dailySales[d.toLocaleDateString("en-US", { weekday: "short" })] = 0;
      }

      orders.forEach((o: any) => {
        const d = new Date(o.createdAt);
        const daysDiff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff < 7) {
          const key = d.toLocaleDateString("en-US", { weekday: "short" });
          if (dailySales[key] !== undefined) dailySales[key] += Number(o.total || 0);
        }
      });

      // Top products
      const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
      orders.forEach((order: any) => {
        (order.items || []).forEach((item: any) => {
          if (!productSales[item.productName]) {
            productSales[item.productName] = { name: item.productName, quantity: 0, revenue: 0 };
          }
          productSales[item.productName].quantity += item.quantity;
          productSales[item.productName].revenue += Number(item.totalPrice || 0);
        });
      });

      return {
        totalRevenue,
        totalOrders,
        avgOrder,
        totalProducts: Object.keys(productSales).length,
        dailySales: Object.entries(dailySales).map(([day, amount]) => ({ day, amount })),
        topProducts: Object.values(productSales)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5),
      };
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <DashboardLayout role={isAdmin ? "admin" : "dealer"}>
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    { title: "Total Revenue", value: `₹${(data?.totalRevenue || 0).toFixed(0)}`, icon: DollarSign, change: undefined },
    { title: "Total Orders", value: data?.totalOrders || 0, icon: ShoppingCart },
    { title: "Avg. Order", value: `₹${(data?.avgOrder || 0).toFixed(0)}`, icon: TrendingUp },
    { title: "Products Sold", value: data?.totalProducts || 0, icon: Package, iconColor: "text-info" },
  ];

  return (
    <DashboardLayout role={isAdmin ? "admin" : "dealer"}>
      <PageHeader
        title={isAdmin ? "Platform Sales Analytics" : "Sales Analytics"}
        description={isAdmin ? "Overview of all dealer transactions." : "Track your POS performance."}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-lg">Revenue (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.dailySales || []}>
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="amount" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-lg">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            {(data?.topProducts || []).length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No sales data yet</p>
            ) : (
              <div className="flex gap-6">
                <ResponsiveContainer width="50%" height={250}>
                  <PieChart>
                    <Pie
                      data={data?.topProducts}
                      dataKey="revenue"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      strokeWidth={2}
                    >
                      {data?.topProducts.map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3 my-auto">
                  {data?.topProducts.map((p: any, i: number) => (
                    <div key={p.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-sm text-foreground flex-1 truncate">{p.name}</span>
                      <span className="text-sm font-medium">₹{p.revenue.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
