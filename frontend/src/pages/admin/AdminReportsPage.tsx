import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader, StatCard } from "@/components/dashboard/DashboardComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText, DollarSign, ShoppingCart, Users, Package,
  Loader2, AlertTriangle, TrendingUp, Brush
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";
import { Button } from "@/components/ui/button";

const COLORS = [
  "hsl(var(--accent))",
  "hsl(var(--info))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))",
];

export default function AdminReportsPage() {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: () => api("/admin/reports/summary"),
    enabled: !!user,
  });

  const handleExport = () => {
    if (!data) return;
    const rows = [
      ["Metric", "Value"],
      ["Total Users", data.totals.totalUsers],
      ["Total Orders", data.totals.totalOrders],
      ["Total Revenue", data.totals.totalRevenue.toFixed(2)],
      ["Total Products", data.totals.totalProducts],
      ["Total Painters", data.totals.totalPainters],
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `paintverse_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="admin">
        <div className="flex flex-col items-center py-24">
          <AlertTriangle className="w-10 h-10 text-warning mb-4" />
          <p className="text-muted-foreground">Failed to load reports</p>
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    { title: "Total Revenue", value: `Rs. ${Number(data?.totals?.totalRevenue || 0).toFixed(0)}`, icon: DollarSign, change: undefined },
    { title: "Total Orders", value: data?.totals?.totalOrders || 0, icon: ShoppingCart },
    { title: "Total Users", value: data?.totals?.totalUsers || 0, icon: Users, iconColor: "text-info" as const },
    { title: "Total Products", value: data?.totals?.totalProducts || 0, icon: Package, iconColor: "text-success" as const },
  ];

  return (
    <DashboardLayout role="admin">
      <PageHeader title="Platform Reports" description="Comprehensive analytics and data insights for the whole platform.">
        <Button variant="accent" onClick={handleExport}>
          <FileText className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </PageHeader>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map(s => <StatCard key={s.title} {...s} />)}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Revenue */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" />
              Monthly Revenue (6 months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data?.monthly || []}>
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(v: number) => [`Rs. ${v.toFixed(0)}`, "Revenue"]}
                />
                <Bar dataKey="revenue" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Growth */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-info" />
              User Growth (6 months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data?.userGrowth || []}>
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="newUsers"
                  stroke="hsl(var(--info))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--info))", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Orders */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-warning" />
              Monthly Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data?.monthly || []}>
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="orders" fill="hsl(var(--warning))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products Pie */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-success" />
              Top Products by Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(data?.topProducts || []).length === 0 ? (
              <div className="flex flex-col items-center py-12">
                <Package className="w-10 h-10 text-muted-foreground opacity-30 mb-2" />
                <p className="text-muted-foreground text-sm">No sales data yet</p>
              </div>
            ) : (
              <div className="flex gap-4 items-center">
                <ResponsiveContainer width="50%" height={220}>
                  <PieChart>
                    <Pie
                      data={data?.topProducts?.slice(0, 5)}
                      dataKey="revenue"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      strokeWidth={2}
                    >
                      {data?.topProducts?.slice(0, 5).map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`Rs. ${v.toFixed(0)}`]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {data?.topProducts?.slice(0, 5).map((p: any, i: number) => (
                    <div key={p.name} className="flex items-center gap-2 text-sm">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      <span className="flex-1 truncate text-foreground">{p.name}</span>
                      <span className="font-semibold text-xs text-muted-foreground">
                        Rs. {p.revenue.toFixed(0)}
                      </span>
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
