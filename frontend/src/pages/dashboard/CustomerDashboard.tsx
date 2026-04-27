import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  StatCard,
  PageHeader,
  DataTable,
} from "@/components/dashboard/DashboardComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ShoppingCart,
  Heart,
  Calendar,
  Image,
  ArrowRight,
  Eye,
  Paintbrush,
  MapPin,
  Clock,
  Star,
  Package,
  TrendingUp,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

const recentVisualizations = [
  {
    name: "Living Room - Ocean Blue",
    date: "2 hours ago",
    color: "#1e90ff",
  },
  {
    name: "Bedroom - Warm Coral",
    date: "Yesterday",
    color: "#e07c3e",
  },
  {
    name: "Kitchen - Sage Green",
    date: "3 days ago",
    color: "#8fbc8f",
  },
];

const recommendedProducts = [
  { name: "Ocean Breeze Matte", price: 1250, rating: 4.8, color: "#1e90ff" },
  { name: "Sunlight Yellow", price: 1100, rating: 4.6, color: "#ffd700" },
  { name: "Forest Green Gloss", price: 1850, rating: 4.9, color: "#228b22" },
];

export default function CustomerDashboard() {
  const { user } = useAuth();

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ["customer-dashboard", user?.id],
    queryFn: async () => {
      try {
        const [orders, jobs] = await Promise.all([
          api("/orders").catch(() => []),
          api("/painters").catch(() => []),
        ]);
        return { orders, jobs };
      } catch (err) {
        console.error("Dashboard error:", err);
        return { orders: [], jobs: [] };
      }
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <DashboardLayout role="customer">
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="customer">
        <div className="flex flex-col items-center justify-center py-24">
          <AlertTriangle className="w-12 h-12 text-warning mb-4" />
          <p className="text-lg font-semibold text-foreground mb-2">Unable to load dashboard</p>
          <p className="text-sm text-muted-foreground mb-4">Please make sure the backend server is running</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </DashboardLayout>
    );
  }

  const orders = dashboardData?.orders || [];
  const jobs = dashboardData?.jobs || [];

  const stats = [
    {
      title: "Active Orders",
      value: orders.filter((o: any) => o.status !== "completed").length.toString(),
      icon: ShoppingCart,
      color: "orange",
    },
    {
      title: "Orders Finished",
      value: orders.filter((o: any) => o.status === "completed").length.toString(),
      icon: ShoppingCart,
      color: "green",
    },
    {
      title: "Visualizations",
      value: "3",
      icon: Image,
      color: "blue",
    },
    {
      title: "Pending Jobs",
      value: jobs.filter((j: any) => j.status === "pending").length.toString(),
      icon: Calendar,
      color: "green",
    },
  ];

  const recentOrdersData = orders.slice(0, 5).map((o: any) => ({
    id: o.orderNumber,
    status: (
      <Badge variant={o.status === "completed" ? "success" : "warning"}>
        {o.status}
      </Badge>
    ),
    date: new Date(o.createdAt).toLocaleDateString(),
    total: `Rs. ${Number(o.total).toLocaleString()}`,
  }));

  const painterJobsData = jobs.slice(0, 5).map((j: any) => ({
    painter: j.painter?.profile?.fullName || "Painter",
    status: (
      <Badge
        variant={
          j.status === "completed"
            ? "success"
            : j.status === "in-progress"
              ? "info"
              : "warning"
        }
      >
        {j.status}
      </Badge>
    ),
    date: j.scheduledDate ? new Date(j.scheduledDate).toLocaleDateString() : "TBD",
  }));

  const displayName = (user as any)?.fullName || "there";

  const activeJobs = jobs.filter((j: any) =>
    j.status === 'accepted' || j.status === 'in-progress' || j.status === 'pending'
  );

  return (
    <DashboardLayout role="customer">
      <PageHeader
        title={`Welcome back, ${displayName}!`}
        description="Here's what's happening with your paint projects."
      >
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/visualizer" className="gap-2">
              <Sparkles className="w-4 h-4" />
              AI Visualizer
            </Link>
          </Button>
          <Button variant="accent" asChild>
            <Link to="/painters" className="gap-2">
              <Paintbrush className="w-4 h-4" />
              Book Painter
            </Link>
          </Button>
        </div>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Orders</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard/orders" className="gap-1">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentOrdersData.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                  <p className="text-muted-foreground mb-4">No orders yet</p>
                  <Button variant="accent" asChild>
                    <Link to="/products">Browse Products</Link>
                  </Button>
                </div>
              ) : (
                <DataTable
                  columns={[
                    { key: "id", label: "Order ID" },
                    { key: "status", label: "Status" },
                    { key: "date", label: "Date" },
                    { key: "total", label: "Total" },
                  ]}
                  data={recentOrdersData}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Visualizations */}
        <div>
          <Card variant="elevated" className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                AI Visualizations
              </CardTitle>
              <Button variant="ghost" size="icon" asChild>
                <Link to="/visualizer">
                  <Eye className="w-4 h-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentVisualizations.map((viz, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div
                    className="w-12 h-12 rounded-lg shadow-md border-2 border-background"
                    style={{ backgroundColor: viz.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate text-sm">
                      {viz.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{viz.date}</p>
                  </div>
                </div>
              ))}
              <Button variant="accent" className="w-full" asChild>
                <Link to="/visualizer">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Try AI Visualizer
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Painting Jobs */}
        <div className="lg:col-span-2">
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Paintbrush className="w-5 h-5 text-accent" />
                Active Painting Jobs
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard/bookings" className="gap-1">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {activeJobs.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                  <p className="text-muted-foreground mb-4">No active painting jobs</p>
                  <Button variant="accent" asChild>
                    <Link to="/painters">Find a Painter</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeJobs.slice(0, 3).map((job: any) => (
                    <div key={job.id} className="p-4 rounded-lg border border-border bg-muted/30">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-foreground capitalize">{job.jobType} Painting</p>
                          <p className="text-xs text-accent font-medium mb-1">
                            with {job.painter?.profile?.fullName || "Professional Painter"}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <MapPin className="w-3 h-3" />
                            {job.location}
                          </div>
                        </div>
                        <Badge variant={
                          job.status === "completed" ? "success" :
                            job.status === "in-progress" ? "info" : "warning"
                        }>
                          {job.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString() : 'TBD'}
                        </div>
                        <span className="font-semibold text-accent">Rs. {Number(job.estimatedCost).toLocaleString()}</span>
                      </div>
                      {job.status === 'in-progress' && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>Progress</span>
                            <span>65%</span>
                          </div>
                          <Progress value={65} className="h-1.5" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recommended Products */}
        <div>
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" />
                Recommended
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendedProducts.map((product, index) => (
                <div key={index} className="p-3 rounded-lg border border-border hover:border-accent/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-10 h-10 rounded-lg shadow-sm"
                      style={{ backgroundColor: product.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-warning fill-warning" />
                        <span className="text-xs text-muted-foreground">{product.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-accent">Rs. {product.price.toLocaleString()}</span>
                    <Button size="sm" variant="outline">
                      <Heart className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full" asChild>
                <Link to="/products">
                  <Package className="w-4 h-4 mr-2" />
                  Browse All Products
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
