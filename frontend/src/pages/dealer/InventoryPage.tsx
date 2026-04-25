import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader, StatCard } from "@/components/dashboard/DashboardComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Package,
  AlertTriangle,
  Loader2,
  Search,
  Plus,
  TrendingDown,
  CheckCircle,
  XCircle,
  PackagePlus,
} from "lucide-react";

export default function InventoryPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const [restockAmounts, setRestockAmounts] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAmount, setBulkAmount] = useState("");
  const [showBulk, setShowBulk] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["inventory", user?.id],
    queryFn: async () => {
      return api("/products/dealer");
    },
    enabled: !!user,
  });

  const restockMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      const product = products.find((p: any) => p.id === id);
      if (!product) throw new Error("Product not found");
      return api(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ stockQuantity: (product as any).stockQuantity + amount }),
      });
    },
    onSuccess: (_, { id }) => {
      toast.success("Stock updated!");
      setRestockAmounts((prev) => ({ ...prev, [id]: "" }));
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const bulkRestockMutation = useMutation({
    mutationFn: async ({ ids, amount }: { ids: string[]; amount: number }) => {
      const updates = ids.map((id) => {
        const product = products.find((p: any) => p.id === id);
        if (!product) return null;
        return api(`/products/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ stockQuantity: (product as any).stockQuantity + amount }),
        });
      }).filter(Boolean);
      await Promise.all(updates);
    },
    onSuccess: (_, { ids }) => {
      toast.success(`Restocked ${ids.length} products!`);
      setSelected(new Set());
      setBulkAmount("");
      setShowBulk(false);
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const lowStock = products.filter((p: any) => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold);
  const outOfStock = products.filter((p: any) => p.stockQuantity <= 0);
  const healthy = products.filter((p: any) => p.stockQuantity > p.lowStockThreshold);

  const filtered = products.filter((p: any) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
    if (filter === "low") return matchesSearch && p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold;
    if (filter === "out") return matchesSearch && p.stockQuantity <= 0;
    return matchesSearch;
  });

  const handleRestock = (id: string) => {
    const amount = parseInt(restockAmounts[id] || "0");
    if (amount <= 0) {
      toast.error("Enter a valid quantity");
      return;
    }
    restockMutation.mutate({ id, amount });
  };

  const handleBulkRestock = () => {
    const amount = parseInt(bulkAmount || "0");
    if (amount <= 0) {
      toast.error("Enter a valid quantity");
      return;
    }
    if (selected.size === 0) {
      toast.error("Select products to restock");
      return;
    }
    bulkRestockMutation.mutate({ ids: Array.from(selected), amount });
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((p: any) => p.id)));
    }
  };

  return (
    <DashboardLayout role="dealer">
      <PageHeader
        title="Inventory Management"
        description="Monitor stock levels and restock products."
      >
        {products.length > 0 && (
          <Button
            variant={showBulk ? "outline" : "accent"}
            className="gap-2"
            onClick={() => {
              setShowBulk(!showBulk);
              if (showBulk) setSelected(new Set());
            }}
          >
            <PackagePlus className="w-4 h-4" />
            {showBulk ? "Cancel Bulk" : "Bulk Restock"}
          </Button>
        )}
      </PageHeader>

      {/* Bulk Restock Bar */}
      {showBulk && (
        <Card variant="elevated" className="mb-6 border-accent/30">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <p className="font-medium text-foreground">
                  {selected.size} product{selected.size !== 1 ? "s" : ""} selected
                </p>
                <p className="text-sm text-muted-foreground">
                  Select products below, then enter the quantity to add to each.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Qty to add"
                  value={bulkAmount}
                  onChange={(e) => setBulkAmount(e.target.value)}
                  className="w-28 h-9 text-sm"
                  min="1"
                />
                <Button
                  variant="accent"
                  size="sm"
                  className="gap-1"
                  onClick={handleBulkRestock}
                  disabled={bulkRestockMutation.isPending || selected.size === 0}
                >
                  {bulkRestockMutation.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Plus className="w-3 h-3" />
                  )}
                  Restock All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Products" value={products.length} icon={Package} />
        <StatCard title="Healthy Stock" value={healthy.length} icon={CheckCircle} iconColor="text-success" />
        <StatCard title="Low Stock" value={lowStock.length} icon={AlertTriangle} iconColor="text-warning" />
        <StatCard title="Out of Stock" value={outOfStock.length} icon={XCircle} iconColor="text-destructive" />
      </div>

      {/* Low Stock Alerts */}
      {lowStock.length > 0 && (
        <Card variant="elevated" className="mb-6 border-warning/30">
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <CardTitle className="text-lg">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {lowStock.map((p: any) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-warning/5 border border-warning/20">
                  {p.colorHex && (
                    <div className="w-8 h-8 rounded-md flex-shrink-0" style={{ backgroundColor: p.colorHex }} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.stockQuantity} / {p.lowStockThreshold} {p.unit}s
                    </p>
                  </div>
                  <Badge variant="warning">{p.stockQuantity} left</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Out of Stock */}
      {outOfStock.length > 0 && (
        <Card variant="elevated" className="mb-6 border-destructive/30">
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <XCircle className="w-5 h-5 text-destructive" />
            <CardTitle className="text-lg">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {outOfStock.map((p: any) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                  {p.colorHex && (
                    <div className="w-8 h-8 rounded-md flex-shrink-0" style={{ backgroundColor: p.colorHex }} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.sku || "No SKU"}</p>
                  </div>
                  <Badge variant="destructive">Empty</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or SKU..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2">
          {(["all", "low", "out"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "accent" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : f === "low" ? "Low Stock" : "Out of Stock"}
            </Button>
          ))}
        </div>
      </div>

      {/* Select All in bulk mode */}
      {showBulk && filtered.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <Checkbox
            checked={selected.size === filtered.length && filtered.length > 0}
            onCheckedChange={toggleSelectAll}
          />
          <span className="text-sm text-muted-foreground">
            Select all ({filtered.length})
          </span>
        </div>
      )}

      {/* Product List with Restock */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <TrendingDown className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            {products.length === 0 ? "No products yet. Add products first." : "No products match this filter."}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((product: any) => {
            const isLow = product.stock_quantity > 0 && product.stock_quantity <= product.low_stock_threshold;
            const isOut = product.stock_quantity <= 0;
            return (
              <Card key={product.id} className={`${isOut ? "border-destructive/30" : isLow ? "border-warning/30" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {showBulk && (
                        <Checkbox
                          checked={selected.has(product.id)}
                          onCheckedChange={() => toggleSelect(product.id)}
                        />
                      )}
                      {product.colorHex && (
                        <div className="w-10 h-10 rounded-lg flex-shrink-0" style={{ backgroundColor: product.colorHex }} />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate">{product.name}</h3>
                        <p className="text-xs text-muted-foreground">{product.sku || "No SKU"} · {product.category} · ₹{product.price}/{product.unit}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Stock Level */}
                      <div className="text-center min-w-[80px]">
                        <p className="text-lg font-bold text-foreground">{product.stockQuantity}</p>
                        <p className="text-xs text-muted-foreground">of {product.lowStockThreshold} min</p>
                      </div>

                      <Badge variant={isOut ? "destructive" : isLow ? "warning" : "success"}>
                        {isOut ? "Out of Stock" : isLow ? "Low" : "OK"}
                      </Badge>

                      {/* Restock Input (hidden in bulk mode) */}
                      {!showBulk && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            placeholder="Qty"
                            value={restockAmounts[product.id] || ""}
                            onChange={(e) =>
                              setRestockAmounts((prev) => ({ ...prev, [product.id]: e.target.value }))
                            }
                            className="w-20 h-9 text-sm"
                            min="1"
                          />
                          <Button
                            variant="accent"
                            size="sm"
                            className="gap-1"
                            onClick={() => handleRestock(product.id)}
                            disabled={restockMutation.isPending}
                          >
                            {restockMutation.isPending ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Plus className="w-3 h-3" />
                            )}
                            Restock
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
