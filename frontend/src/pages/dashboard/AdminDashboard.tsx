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
  Users,
  Package,
  DollarSign,
  TrendingUp,
  Check,
  X,
  Eye,
  Shield,
  AlertTriangle,
  ShoppingCart,
  Briefcase,
  Activity,
  UserCheck,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-dashboard", user?.id],
    queryFn: async () => {
      try {
        const [orders, products, painters] = await Promise.all([
          api("/orders"),
          api("/products"),
          api("/painters/all"),
        ]);
        
        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);
        
        const monthlyOrders = orders.filter((o: any) => 
          new Date(o.createdAt) >= thisMonth
        );
        
        const monthlyRevenue = monthlyOrders.reduce((s: number, o: any) => 
          s + Number(o.total), 0
        );
        
        return { 
          orders, 
          products, 
          painters,
          monthlyOrders,
          monthlyRevenue,
          totalUsers: painters.length + 10, // Approximate (painters + dealers + customers)
        };
      } catch (err) {
        console.error("Admin dashboard error:", err);
        throw err;
      }
    },
    enabled: !!user,
  });

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
        <div className="flex flex-col items-center justify-center py-24">
          <AlertTriangle className="w-12 h-12 text-warning mb-4" />
          <p className="text-lg font-semibold text-foreground mb-2">Unable to load dashboard</p>
          <p className="text-sm text-muted-foreground mb-4">Please make sure the backend server is running</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </DashboardLayout>
    );
  }

  const platformRevenue = (data?.orders || []).reduce((s: number, o: any) => s + Number(o.total), 0);
  const activeOrders = (data?.orders || []).filter((o: any) => o.status !== 'completed').length;

  const stats = [
    {
      title: "Total Revenue",
      value: `Rs. ${platformRevenue.toLocaleString()}`,
      icon: DollarSign,
      change: { value: 12, positive: true },
    },
    {
      title: "Total Users",
      value: data?.totalUsers || 0,
      icon: Users,
      change: { value: 8, positive: true },
    },
    {
      title: "Active Orders",
      value: activeOrders,
      icon: ShoppingCart,
      change: { value: 5, positive: true },
    },
    {
      title: "Products Listed",
      value: (data?.products || []).length,
      icon: Package,
      change: { value: 15, positive: true },
    },
  ];

  const platformMetrics = [
    {
      label: "Monthly Revenue",
      value: `Rs. ${(data?.monthlyRevenue || 0).toLocaleString()}`,
      change: "+18%",
      positive: true,
      icon: DollarSign,
    },
    {
      label: "Monthly Orders",
      value: data?.monthlyOrders?.length || 0,
      change: "+12%",
      positive: true,
      icon: ShoppingCart,
    },
    {
      label: "Active Companies",
      value: Math.floor((data?.products || []).length / 4) || 1,
      change: "+5%",
      positive: true,
      icon: Package,
    },
    {
      label: "Active Painters",
      value: (data?.painters || []).length,
      change: "+8%",
      positive: true,
      icon: Briefcase,
    },
  ];

  const recentActivity = [
    { type: "order", message: "New order #ORD-12345 placed", time: "2 min ago", icon: ShoppingCart },
    { type: "user", message: "New company registered: Modern Paints", time: "15 min ago", icon: UserCheck },
    { type: "product", message: "5 new products added to catalog", time: "1 hour ago", icon: Package },
    { type: "painter", message: "Painter completed job #JOB-789", time: "2 hours ago", icon: Briefcase },
  ];

  const topDealers = (data?.products || [])
    .reduce((acc: any[], product: any) => {
      const existing = acc.find(d => d.dealerId === product.dealerId);
      if (existing) {
        existing.productCount++;
      } else {
        acc.push({ dealerId: product.dealerId, productCount: 1 });
      }
      return acc;
    }, [])
    .sort((a: any, b: any) => b.productCount - a.productCount)
    .slice(0, 5);

  const securityAlerts = [
    {
      type: "warning",
      message: "3 failed login attempts from IP 192.168.1.100",
      time: "2 min ago",
    },
    {
      type: "info",
      message: "System backup completed successfully",
      time: "1 hour ago",
    },
    {
      type: "warning",
      message: "Unusual API activity detected",
      time: "3 hours ago",
    },
  ];

  const pendingApprovals = [];
  return (
    <DashboardLayout role="admin">
      <PageHeader
        title="Admin Dashboard"
        description="Platform overview and management."
      >
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/users" className="gap-2">
              <Users className="w-4 h-4" />
              Manage Users
            </Link>
          </Button>
          <Button variant="accent" asChild>
            <Link to="/admin/analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Link>
          </Button>
        </div>
      </PageHeader>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Platform Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {platformMetrics.map((metric) => (
          <Card key={metric.label} variant="elevated">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{metric.label}</span>
                <metric.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold text-foreground mb-1">
                {metric.value}
              </p>
              <div className="flex items-center gap-1">
                {metric.positive ? (
                  <ArrowUpRight className="w-3 h-3 text-success" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-destructive" />
                )}
                <span className={`text-xs ${metric.positive ? 'text-success' : 'text-destructive'}`}>
                  {metric.change} from last month
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center gap-2">
              <Activity className="w-5 h-5 text-accent" />
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <activity.icon className="w-4 h-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{activity.message}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link to="/admin/activity">View All Activity</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Security Alerts */}
        <div>
          <Card variant="elevated" className="border-warning/30">
            <CardHeader className="flex flex-row items-center gap-2">
              <Shield className="w-5 h-5 text-warning" />
              <CardTitle className="text-lg">Security Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {securityAlerts.map((alert, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg ${alert.type === "warning"
                    ? "bg-warning/5 border border-warning/20"
                    : "bg-info/5 border border-info/20"
                    }`}
                >
                  <AlertTriangle
                    className={`w-4 h-4 mt-0.5 flex-shrink-0 ${alert.type === "warning" ? "text-warning" : "text-info"
                      }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {alert.time}
                    </p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full" asChild>
                <Link to="/admin/security">View All Alerts</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Dealers & System Health */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" />
              Top Companies by Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topDealers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No dealer data available</p>
            ) : (
              <div className="space-y-3">
                {topDealers.map((dealer: any, index: number) => (
                  <div key={dealer.dealerId} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-accent">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">Dealer {dealer.dealerId.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">{dealer.productCount} products</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" asChild>
                      <Link to={`/admin/dealers/${dealer.dealerId}`}>
                        <Eye className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-info" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">API Response Time</span>
                <span className="text-sm font-semibold text-success">45ms</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-success w-[95%]" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Database Load</span>
                <span className="text-sm font-semibold text-info">32%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-info w-[32%]" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Storage Used</span>
                <span className="text-sm font-semibold text-warning">68%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-warning w-[68%]" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Uptime</span>
                <span className="text-sm font-semibold text-success">99.9%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-success w-[99.9%]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
