import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader, EmptyState, DataTable } from "@/components/dashboard/DashboardComponents";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, Loader2, Eye, Package, Calendar } from "lucide-react";

export default function CustomerOrdersPage() {
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

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
    items: `${o.items?.length || 0} items`,
    total: `Rs. ${Number(o.total).toLocaleString()}`,
    _original: o // store the original object for the row click
  }));

  return (
    <DashboardLayout role="customer">
      <PageHeader
        title="My Orders"
        description="View and track your purchase history."
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No Orders Yet"
          description="Your purchase history will appear here once you make a purchase."
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
                { key: "items", label: "Items" },
                { key: "total", label: "Total", className: "text-right font-bold" },
              ]}
              data={tableData}
              onRowClick={(row) => setSelectedOrder(row._original)}
            />
          </CardContent>
        </Card>
      )}

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-accent" />
              Order Details
            </DialogTitle>
            <DialogDescription className="font-mono text-xs">
              {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-muted/50 border border-border">
                  <p className="text-[10px] text-muted-foreground uppercase mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Date
                  </p>
                  <p className="text-sm font-medium">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/50 border border-border">
                  <p className="text-[10px] text-muted-foreground uppercase mb-1">Status</p>
                  <Badge variant={selectedOrder.status === "completed" ? "success" : "warning"} className="w-fit">
                    {selectedOrder.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-foreground">Items</p>
                <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-2">
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="font-medium truncate">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium whitespace-nowrap">
                        Rs. {(item.unitPrice * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>Rs. {Number(selectedOrder.subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>Rs. {Number(selectedOrder.taxAmount).toLocaleString()}</span>
                </div>
                {Number(selectedOrder.discountAmount) > 0 && (
                  <div className="flex justify-between text-sm text-success">
                    <span>Discount</span>
                    <span>-Rs. {Number(selectedOrder.discountAmount).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-border mt-2">
                  <span>Total</span>
                  <span className="text-accent">Rs. {Number(selectedOrder.total).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
