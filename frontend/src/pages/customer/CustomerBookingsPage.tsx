import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader, EmptyState, DataTable } from "@/components/dashboard/DashboardComponents";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Loader2, MapPin, Clock } from "lucide-react";

export default function CustomerBookingsPage() {
    const { user } = useAuth();

    const { data: bookings = [], isLoading } = useQuery({
        queryKey: ["customer-bookings", user?.id],
        queryFn: async () => {
            return api("/painters");
        },
        enabled: !!user,
    });

    const tableData = bookings.map((b: any) => ({
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
            b.status === "completed" ? "success" :
                b.status === "in-progress" ? "info" :
                    b.status === "pending" ? "warning" : "secondary"
        }>{b.status}</Badge>,
        cost: `Rs ${Number(b.estimatedCost).toLocaleString()}`,
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
                                { key: "type", label: "Job Type" },
                                { key: "location", label: "Location" },
                                { key: "date", label: "Scheduled" },
                                { key: "status", label: "Status" },
                                { key: "cost", label: "Est. Cost" },
                            ]}
                            data={tableData}
                        />
                    </CardContent>
                </Card>
            )}
        </DashboardLayout>
    );
}
