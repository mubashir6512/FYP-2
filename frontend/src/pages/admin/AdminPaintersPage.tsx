import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader, StatCard } from "@/components/dashboard/DashboardComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Brush, Search, Loader2, AlertTriangle, Star,
  Briefcase, ChevronDown, ChevronUp, Award, MapPin
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPaintersPage() {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<Record<string, any>>({});
  const [loadingDetail, setLoadingDetail] = useState<string | null>(null);

  const { data: painters = [], isLoading, error } = useQuery({
    queryKey: ["admin-painters"],
    queryFn: () => api("/admin/painters"),
  });

  const filtered = painters.filter((p: any) => {
    const name = p.profile?.fullName?.toLowerCase() || "";
    const email = p.email?.toLowerCase() || "";
    return name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
  });

  const totalJobs = painters.reduce((s: number, p: any) => s + (p.totalJobs || 0), 0);
  const totalCompleted = painters.reduce((s: number, p: any) => s + (p.completedJobs || 0), 0);
  const avgRating =
    painters.length > 0
      ? painters.reduce((s: number, p: any) => s + (p.avgRating || 0), 0) / painters.length
      : 0;

  const handleToggle = async (id: string) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (!detailData[id]) {
      setLoadingDetail(id);
      try {
        const data = await api(`/admin/painters/${id}`);
        setDetailData(prev => ({ ...prev, [id]: data }));
      } catch (e) { /* ignore */ } finally { setLoadingDetail(null); }
    }
  };

  const ratingColor = (r: number) =>
    r >= 4.5 ? "text-success" : r >= 3.5 ? "text-warning" : "text-destructive";

  return (
    <DashboardLayout role="admin">
      <PageHeader title="Painter Management" description="Monitor all painters, their jobs, ratings, and performance.">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10">
          <Brush className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-accent">{painters.length} Active Painters</span>
        </div>
      </PageHeader>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <StatCard title="Total Painters" value={painters.length} icon={Brush} />
        <StatCard title="Total Jobs" value={totalJobs} icon={Briefcase} iconColor="text-info" />
        <StatCard
          title="Platform Avg Rating"
          value={avgRating.toFixed(1)}
          icon={Star}
          iconColor="text-warning"
        />
      </div>

      {/* Search */}
      <Card variant="elevated" className="mb-6">
        <CardContent className="pt-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search painters by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Painters List */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Brush className="w-5 h-5 text-accent" />
            {filtered.length} Painters
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
              <p className="text-muted-foreground">Failed to load painters</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Brush className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="text-muted-foreground">No painters found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((painter: any) => (
                <motion.div
                  key={painter.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-border overflow-hidden"
                >
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => handleToggle(painter.id)}
                  >
                    <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center font-bold text-accent">
                      {(painter.profile?.fullName || "P").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{painter.profile?.fullName || "—"}</p>
                      <p className="text-sm text-muted-foreground">{painter.email}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm font-bold text-foreground">{painter.completedJobs}</p>
                        <p className="text-xs text-muted-foreground">Completed</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-foreground">{painter.totalJobs}</p>
                        <p className="text-xs text-muted-foreground">Total Jobs</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className={`w-4 h-4 ${ratingColor(painter.avgRating)} fill-current`} />
                        <span className={`text-sm font-bold ${ratingColor(painter.avgRating)}`}>
                          {painter.avgRating || "N/A"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({painter.reviewCount} reviews)
                        </span>
                      </div>
                    </div>
                    {expanded === painter.id ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>

                  <AnimatePresence>
                    {expanded === painter.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border bg-muted/20"
                      >
                        <div className="p-4">
                          {loadingDetail === painter.id ? (
                            <div className="flex justify-center py-6">
                              <Loader2 className="w-6 h-6 animate-spin text-accent" />
                            </div>
                          ) : detailData[painter.id] ? (
                            <div className="grid sm:grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                                  <Briefcase className="w-4 h-4 text-info" />
                                  Recent Jobs ({detailData[painter.id].jobs?.length || 0})
                                </h4>
                                {(detailData[painter.id].jobs || []).length === 0 ? (
                                  <p className="text-sm text-muted-foreground">No jobs yet</p>
                                ) : (
                                  <div className="space-y-1">
                                    {(detailData[painter.id].jobs || []).slice(0, 5).map((j: any) => (
                                      <div key={j.id} className="flex items-center gap-2 text-xs p-2 rounded bg-background border border-border">
                                        <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                                        <span className="flex-1 truncate text-foreground">{j.location}</span>
                                        <Badge variant="secondary" className="text-[10px] capitalize">{j.status}</Badge>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                                  <Award className="w-4 h-4 text-warning" />
                                  Reviews ({detailData[painter.id].reviews?.length || 0})
                                </h4>
                                {(detailData[painter.id].reviews || []).length === 0 ? (
                                  <p className="text-sm text-muted-foreground">No reviews yet</p>
                                ) : (
                                  <div className="space-y-1">
                                    {(detailData[painter.id].reviews || []).slice(0, 4).map((r: any) => (
                                      <div key={r.id} className="flex items-center gap-2 text-xs p-2 rounded bg-background border border-border">
                                        <div className="flex items-center gap-0.5">
                                          {Array.from({ length: 5 }).map((_, i) => (
                                            <Star key={i} className={`w-3 h-3 ${i < r.rating ? "text-warning fill-warning" : "text-muted-foreground"}`} />
                                          ))}
                                        </div>
                                        <span className="flex-1 truncate text-muted-foreground">{r.comment || "No comment"}</span>
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
