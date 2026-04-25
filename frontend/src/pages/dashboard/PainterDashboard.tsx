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
  Briefcase,
  DollarSign,
  Star,
  Calendar,
  Check,
  X,
  Clock,
  Loader2,
  MapPin,
  Phone,
  User,
  TrendingUp,
  Award,
  Target,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function PainterDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["painter-dashboard", user?.id],
    queryFn: async () => {
      try {
        const [jobs, reviews] = await Promise.all([
          api("/painters"),
          api("/painters/reviews"),
        ]);

        const completedJobs = jobs.filter((j: any) => j.status === "completed");
        const pendingJobs = jobs.filter((j: any) => j.status === "pending");
        const acceptedJobs = jobs.filter((j: any) => j.status === "accepted" || j.status === "in-progress");
        const totalEarnings = completedJobs.reduce(
          (s: number, j: any) => s + Number(j.estimatedCost),
          0
        );
        const avgRating =
          reviews.length > 0
            ? reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length
            : 0;
        
        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);
        
        const monthlyJobs = completedJobs.filter((j: any) => 
          new Date(j.updatedAt) >= thisMonth
        );
        
        const monthlyEarnings = monthlyJobs.reduce(
          (s: number, j: any) => s + Number(j.estimatedCost),
          0
        );

        return {
          jobs,
          reviews,
          completedJobs,
          pendingJobs,
          acceptedJobs,
          totalEarnings,
          avgRating,
          monthlyJobs,
          monthlyEarnings,
        };
      } catch (err) {
        console.error("Painter dashboard error:", err);
        throw err;
      }
    },
    enabled: !!user,
  });

  const updateJobStatus = useMutation({
    mutationFn: async ({
      jobId,
      status,
    }: {
      jobId: string;
      status: string;
    }) => {
      return api(`/painters/${jobId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["painter-dashboard"] });
      toast.success("Job status updated!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <DashboardLayout role="painter">
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="painter">
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
      title: "Total Earnings",
      value: `₹${(data?.totalEarnings || 0).toFixed(0)}`,
      icon: DollarSign,
      change: { value: 15, positive: true },
    },
    {
      title: "Jobs Completed",
      value: data?.completedJobs?.length || 0,
      icon: Briefcase,
      change: { value: 8, positive: true },
    },
    {
      title: "Avg. Rating",
      value: data?.avgRating ? data.avgRating.toFixed(1) : "N/A",
      icon: Star,
      iconColor: "text-warning" as const,
    },
    {
      title: "Pending Requests",
      value: data?.pendingJobs?.length || 0,
      icon: Clock,
      iconColor: "text-info" as const,
    },
  ];

  const monthlyMetrics = [
    {
      label: "This Month",
      value: `₹${(data?.monthlyEarnings || 0).toFixed(0)}`,
      subtext: `${data?.monthlyJobs?.length || 0} jobs`,
      icon: TrendingUp,
      color: "text-success",
    },
    {
      label: "Active Jobs",
      value: data?.acceptedJobs?.length || 0,
      subtext: "In progress",
      icon: Briefcase,
      color: "text-info",
    },
    {
      label: "Success Rate",
      value: data?.completedJobs?.length 
        ? `${Math.round((data.completedJobs.length / (data.jobs?.length || 1)) * 100)}%`
        : "0%",
      subtext: "Completion rate",
      icon: Target,
      color: "text-accent",
    },
  ];

  const statusBadge = (status: string) => {
    const variants: Record<string, "pending" | "success" | "info" | "warning"> = {
      pending: "pending",
      accepted: "info",
      completed: "success",
      rejected: "warning",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const pendingRows = (data?.pendingJobs || []).map((job: any) => ({
    customer: job.customerName,
    location: job.location,
    type: job.jobType,
    date: job.scheduledDate
      ? new Date(job.scheduledDate).toLocaleDateString()
      : "TBD",
    status: statusBadge(job.status),
    actions: (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="success"
          onClick={() =>
            updateJobStatus.mutate({ jobId: job.id, status: "accepted" })
          }
        >
          <Check className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() =>
            updateJobStatus.mutate({ jobId: job.id, status: "rejected" })
          }
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    ),
  }));

  const upcomingJobs = (data?.acceptedJobs || []).slice(0, 3);

  return (
    <DashboardLayout role="painter">
      <PageHeader
        title="Painter Dashboard"
        description="Manage your jobs, schedule, and reviews."
      >
        <Button variant="accent" asChild>
          <Link to="/painter/profile" className="gap-2">
            <User className="w-4 h-4" />
            Edit Profile
          </Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Monthly Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {monthlyMetrics.map((metric) => (
          <Card key={metric.label} variant="elevated">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{metric.label}</span>
                <metric.icon className={`w-4 h-4 ${metric.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground mb-1">
                {metric.value}
              </p>
              <p className="text-xs text-muted-foreground">{metric.subtext}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-warning" />
                New Job Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingRows.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                  <p className="text-muted-foreground">No pending job requests</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    New requests will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(data?.pendingJobs || []).map((job: any) => (
                    <div key={job.id} className="p-4 rounded-lg border border-border bg-muted/30">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold text-foreground">{job.customerName}</p>
                            <Badge variant="warning">{job.jobType}</Badge>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3" />
                              {job.location}
                            </div>
                            {job.customerPhone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-3 h-3" />
                                {job.customerPhone}
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              {job.scheduledDate
                                ? new Date(job.scheduledDate).toLocaleDateString()
                                : "Date TBD"}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-accent">
                            ₹{Number(job.estimatedCost).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {job.estimatedHours}h estimated
                          </p>
                        </div>
                      </div>
                      {job.description && (
                        <p className="text-sm text-muted-foreground mb-3 p-2 bg-muted/50 rounded">
                          {job.description}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="success"
                          className="flex-1"
                          onClick={() =>
                            updateJobStatus.mutate({ jobId: job.id, status: "accepted" })
                          }
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Accept Job
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            updateJobStatus.mutate({ jobId: job.id, status: "rejected" })
                          }
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card variant="elevated" className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
            <CardHeader className="flex flex-row items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              <CardTitle className="text-lg">Upcoming Jobs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingJobs.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-30" />
                  <p className="text-sm text-muted-foreground">
                    No upcoming jobs
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Accept requests to see them here
                  </p>
                </div>
              ) : (
                upcomingJobs.map((job: any) => (
                  <div
                    key={job.id}
                    className="p-4 rounded-lg bg-background border border-border shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-foreground text-sm">
                        {job.customerName}
                      </p>
                      <Badge variant="accent" className="text-xs">{job.jobType}</Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {job.scheduledDate
                          ? new Date(job.scheduledDate).toLocaleDateString()
                          : "TBD"}{" "}
                        {job.scheduledTime && `at ${job.scheduledTime}`}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-muted-foreground">Estimated</span>
                      <span className="font-semibold text-accent">
                        ₹{Number(job.estimatedCost).toLocaleString()}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        updateJobStatus.mutate({
                          jobId: job.id,
                          status: "completed",
                        })
                      }
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Mark Complete
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reviews Section */}
      <Card variant="elevated">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-warning" />
            <CardTitle className="text-lg">Customer Reviews</CardTitle>
          </div>
          {data?.avgRating && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-warning/10">
              <Star className="w-4 h-4 text-warning fill-warning" />
              <span className="font-bold text-foreground">{data.avgRating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">
                ({data.reviews.length} reviews)
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {(data?.reviews || []).length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="text-muted-foreground">No reviews yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Complete jobs to receive customer reviews
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {(data?.reviews || []).slice(0, 6).map((review: any) => (
                <div
                  key={review.id}
                  className="p-4 rounded-lg bg-muted/30 border border-border/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-foreground">
                      {review.customerName}
                    </p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating
                            ? "text-warning fill-warning"
                            : "text-muted-foreground"
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground mb-2">
                      "{review.comment}"
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
