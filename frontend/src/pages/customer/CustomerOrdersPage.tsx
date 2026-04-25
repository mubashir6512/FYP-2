import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader, EmptyState, DataTable } from "@/components/dashboard/DashboardComponents";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, Loader2 } from "lucide-react";

export default function CustomerOrdersPage() {
  const { user } = useAuth();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["customer-orders", user?.id],
    queryFn: async () => {
      return api("/orders");
    },
    enabled: !!user,
  });

  const tableData = orders.map((o: any) => ({
    id: o.orderNumber,
    date: new Date(o.createdAt).toLocaleDateString(),
    status: <Badge variant={o.status === "completed" ? "success" : "warning"}>{o.status}</Badge>,
    total: `Rs ${Number(o.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  }));

  return (
    <DashboardLayout role="customer">
      <PageHeader
        title="My Orders"
        description="View your purchase history."
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No Orders Yet"
          description="Your purchase history will appear here."
        />
      ) : (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Purchase History</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={[
                { key: "id", label: "Order #" },
                { key: "date", label: "Date" },
                { key: "status", label: "Status" },
                { key: "total", label: "Total" },
              ]}
              data={tableData}
            />
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
