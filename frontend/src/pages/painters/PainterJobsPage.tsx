import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader, StatCard } from "@/components/dashboard/DashboardComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Briefcase, Search, Filter, Loader2, 
  MapPin, Calendar, Clock, DollarSign,
  Check, X, ChevronDown, ChevronUp, AlertTriangle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function PainterJobsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  const { data: jobs = [], isLoading, error } = useQuery({
    queryKey: ["painter-jobs", user?.id],
    queryFn: () => api("/painters"),
    enabled: !!user,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      api(`/painters/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["painter-jobs"] });
      toast.success("Job status updated!");
    },
    onError: (err: any) => toast.error(err.message)
  });

  const filteredJobs = jobs.filter((j: any) => {
    const matchesStatus = statusFilter === "all" || j.status === statusFilter;
    const matchesSearch = 
      j.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      j.location?.toLowerCase().includes(search.toLowerCase()) ||
      j.jobType?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusVariants: Record<string, "pending" | "success" | "info" | "warning"> = {
    pending: "pending",
    accepted: "info",
    completed: "success",
    rejected: "warning",
  };

  return (
    <DashboardLayout role="painter">
      <PageHeader 
        title="Job Management" 
        description="Track and manage all your painting projects and requests."
      />

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Jobs" value={jobs.length} icon={Briefcase} />
        <StatCard title="Active" value={jobs.filter((j: any) => j.status === "accepted").length} icon={Clock} iconColor="text-info" />
        <StatCard title="Completed" value={jobs.filter((j: any) => j.status === "completed").length} icon={Check} iconColor="text-success" />
        <StatCard title="Pending" value={jobs.filter((j: any) => j.status === "pending").length} icon={AlertTriangle} iconColor="text-warning" />
      </div>

      {/* Filters */}
      <Card variant="elevated" className="mb-6">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search by customer, location, or type..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {["all", "pending", "accepted", "completed", "rejected"].map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={statusFilter === s ? "accent" : "outline"}
                  onClick={() => setStatusFilter(s)}
                  className="capitalize whitespace-nowrap"
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <Card variant="elevated" className="py-24 text-center">
            <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
          </Card>
        ) : (
          filteredJobs.map((job: any) => (
            <motion.div
              key={job.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card variant="elevated" className="overflow-hidden">
                <div 
                  className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-foreground text-lg truncate">
                          {job.customerName || "Customer"}
                        </h3>
                        <Badge variant={statusVariants[job.status] || "secondary"} className="capitalize">
                          {job.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(job.scheduledDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[10px] uppercase tracking-wider h-5">
                            {job.jobType}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:text-right gap-4">
                      <div>
                        <p className="text-xl font-bold text-accent">
                          Rs. {Number(job.estimatedCost).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Estimated Cost</p>
                      </div>
                      {expandedJob === job.id ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedJob === job.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border bg-muted/20"
                    >
                      <div className="p-6 grid md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                            <Filter className="w-4 h-4" /> Job Details
                          </h4>
                          <div className="space-y-4">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Description</p>
                              <p className="text-sm text-foreground bg-background p-3 rounded-lg border border-border italic">
                                {job.description || "No detailed description provided."}
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-3 rounded-lg bg-background border border-border">
                                <p className="text-[10px] text-muted-foreground uppercase font-bold">Hours Estimated</p>
                                <p className="text-lg font-bold">{job.estimatedHours || 0} hrs</p>
                              </div>
                              <div className="p-3 rounded-lg bg-background border border-border">
                                <p className="text-[10px] text-muted-foreground uppercase font-bold">Created On</p>
                                <p className="text-sm">{new Date(job.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                            <Settings className="w-4 h-4" /> Actions
                          </h4>
                          <div className="space-y-3">
                            {job.status === "pending" && (
                              <div className="flex gap-2">
                                <Button 
                                  variant="success" 
                                  className="flex-1"
                                  onClick={(e) => { e.stopPropagation(); updateStatus.mutate({ id: job.id, status: "accepted" }); }}
                                >
                                  <Check className="w-4 h-4 mr-2" /> Accept Job
                                </Button>
                                <Button 
                                  variant="destructive"
                                  onClick={(e) => { e.stopPropagation(); updateStatus.mutate({ id: job.id, status: "rejected" }); }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                            {job.status === "accepted" && (
                              <Button 
                                variant="success" 
                                className="w-full"
                                onClick={(e) => { e.stopPropagation(); updateStatus.mutate({ id: job.id, status: "completed" }); }}
                              >
                                <Check className="w-4 h-4 mr-2" /> Mark as Completed
                              </Button>
                            )}
                            <Button variant="outline" className="w-full">
                              Contact Customer
                            </Button>
                            <p className="text-[10px] text-center text-muted-foreground mt-4 italic">
                              Updating status will notify the customer.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}

import { Settings } from "lucide-react";
