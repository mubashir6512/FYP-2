import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader, EmptyState, DataTable } from "@/components/dashboard/DashboardComponents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Loader2, MapPin, Clock, Star } from "lucide-react";
import { ReviewDialog } from "@/components/painters/ReviewDialog";

export default function CustomerBookingsPage() {
    const { user } = useAuth();
    const [selectedJob, setSelectedJob] = useState<any>(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);

    const { data: bookings = [], isLoading } = useQuery({
        queryKey: ["customer-bookings", user?.id],
        queryFn: async () => {
            return api("/painters");
        },
        enabled: !!user,
    });

    const tableData = bookings.map((b: any) => ({
        painter: b.painter?.profile?.fullName || "Professional Painter",
        type: <span className="font-semibold capitalize">{b.jobType} Painting</span>,
        location: (
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <MapPin className="w-3 h-3" />
                {b.location}
            </div>
        ),
        date: (
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <Clock className="w-3 h-3" />
                {b.scheduledDate ? new Date(b.scheduledDate).toLocaleDateString() : "TBD"}
            </div>
        ),
        status: <Badge variant={
            b.status === "completed" || b.status === "reviewed" ? "success" :
                b.status === "in-progress" ? "info" :
                    b.status === "pending" ? "warning" : "secondary"
        }>{b.status}</Badge>,
        cost: `Rs. ${Number(b.estimatedCost).toLocaleString()}`,
        action: b.status === "completed" ? (
            <Button 
                variant="accent" 
                size="sm" 
                className="gap-2 h-8 px-3"
                onClick={() => {
                    setSelectedJob(b);
                    setIsReviewOpen(true);
                }}
            >
                <Star className="w-3.5 h-3.5" />
                Review
            </Button>
        ) : b.status === "reviewed" ? (
            <span className="text-xs text-muted-foreground italic">Reviewed</span>
        ) : null
    }));

    return (
        <DashboardLayout role="customer">
            <PageHeader
                title="My Bookings"
                description="Track your painting project status and schedules."
            />

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-accent" />
                </div>
            ) : bookings.length === 0 ? (
                <EmptyState
                    icon={Calendar}
                    title="No Bookings Yet"
                    description="Ready for a fresh coat? Book a professional painter today."
                />
            ) : (
                <Card variant="elevated">
                    <CardHeader>
                        <CardTitle>Painting Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={[
                                { key: "painter", label: "Painter" },
                                { key: "type", label: "Job Type" },
                                { key: "location", label: "Location" },
                                { key: "date", label: "Scheduled" },
                                { key: "status", label: "Status" },
                                { key: "cost", label: "Est. Cost" },
                                { key: "action", label: "Action" },
                            ]}
                            data={tableData}
                        />
                    </CardContent>
                </Card>
            )}

            {selectedJob && (
                <ReviewDialog 
                    job={selectedJob}
                    open={isReviewOpen}
                    onOpenChange={setIsReviewOpen}
                />
            )}
        </DashboardLayout>
    );
}
