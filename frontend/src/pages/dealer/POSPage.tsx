import { useState, useCallback, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/dashboard/DashboardComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Receipt,
  Package,
  Loader2,
  X,
  DollarSign,
  User,
  Phone,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stockQuantity: number;
  colorHex: string | null;
  unit: string;
  imageUrl: string | null;
}

interface CartItem extends Product {
  quantity: number;
}

export default function POSPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState<any>(null);

  const { data: products = [], refetch } = useQuery({
    queryKey: ["pos-products", user?.id],
    queryFn: async () => {
      return api("/products/dealer");
    },
    enabled: !!user,
  });

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
      ),
    [products, search]
  );

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          toast.error("Not enough stock");
          return prev;
        }
        return prev.map((c) =>
          c.id === product.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      if (product.stockQuantity < 1) {
        toast.error("Out of stock");
        return prev;
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const updateQty = useCallback((id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.id !== id) return c;
          const newQty = c.quantity + delta;
          if (newQty > c.stockQuantity) {
            toast.error("Not enough stock");
            return c;
          }
          return { ...c, quantity: Math.max(0, newQty) };
        })
        .filter((c) => c.quantity > 0)
    );
  }, []);

  const subtotal = useMemo(
    () => cart.reduce((sum, c) => sum + c.price * c.quantity, 0),
    [cart]
  );
  const taxRate = 0.18;
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount - discount;

  const processOrder = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    setIsProcessing(true);
    try {
      const payload = {
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        subtotal: Number(subtotal.toFixed(2)),
        taxAmount: Number(taxAmount.toFixed(2)),
        discountAmount: Number(discount),
        total: Number(total.toFixed(2)),
        paymentMethod: "cash",
        status: "completed",
        items: cart.map((c) => ({
          productId: c.id,
          productName: c.name,
          quantity: c.quantity,
          unitPrice: c.price,
          totalPrice: Number((c.price * c.quantity).toFixed(2)),
        })),
      };

      const order = await api("/orders", {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setShowReceipt({
        orderNumber: order.orderNumber,
        items: cart,
        subtotal,
        taxAmount,
        discount,
        total,
        customerName,
        date: new Date().toLocaleString(),
      });

      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setDiscount(0);
      refetch();
      toast.success("Order completed!");
    } catch (err: any) {
      toast.error(err.message || "Failed to process order");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DashboardLayout role="dealer">
      <PageHeader
        title="Point of Sale"
        description="Process walk-in sales and manage transactions."
      />

      {/* Receipt Modal */}
      {showReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Receipt</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowReceipt(null)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center border-b border-border pb-4">
                <h3 className="font-display text-xl font-bold text-foreground">PaintVerse</h3>
                <p className="text-sm text-muted-foreground">{showReceipt.date}</p>
                <p className="text-sm font-mono text-accent mt-1">{showReceipt.orderNumber}</p>
              </div>
              {showReceipt.customerName && (
                <p className="text-sm text-muted-foreground">Customer: {showReceipt.customerName}</p>
              )}
              <div className="space-y-2">
                {showReceipt.items.map((item: CartItem) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name} × {item.quantity}</span>
                    <span>Rs. {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span><span>Rs. {showReceipt.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (18%)</span><span>Rs. {showReceipt.taxAmount.toFixed(2)}</span>
                </div>
                {showReceipt.discount > 0 && (
                  <div className="flex justify-between text-sm text-success">
                    <span>Discount</span><span>-Rs. {showReceipt.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t border-border pt-2">
                  <span>Total</span><span>Rs. {showReceipt.total.toFixed(2)}</span>
                </div>
              </div>
              <Button variant="accent" className="w-full" onClick={() => window.print()}>
                Print Receipt
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Product Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {filtered.length === 0 ? (
            <Card className="p-12 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {products.length === 0
                  ? "No products yet. Add products from the Products page first."
                  : "No products match your search."}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filtered.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="p-4 rounded-xl border border-border bg-card hover:border-accent hover:shadow-md transition-all text-left group"
                >
                  {product.colorHex && (
                    <div
                      className="w-full h-12 rounded-lg mb-3"
                      style={{ backgroundColor: product.colorHex }}
                    />
                  )}
                  <p className="font-medium text-foreground text-sm truncate group-hover:text-accent transition-colors">
                    {product.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{product.sku}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-accent">Rs. {product.price}</span>
                    <Badge variant={product.stockQuantity <= 10 ? "warning" : "secondary"} className="text-xs">
                      {product.stockQuantity} left
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cart */}
        <div className="space-y-4">
          <Card variant="elevated">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Cart ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer Info */}
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Customer name (optional)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="pl-10 h-9 text-sm"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Phone (optional)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="pl-10 h-9 text-sm"
                  />
                </div>
              </div>

              {/* Cart Items */}
              {cart.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Click products to add to cart
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Rs. {item.price} × {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQty(item.id, -1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQty(item.id, 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => setCart((prev) => prev.filter((c) => c.id !== item.id))}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-sm font-medium w-16 text-right">
                        Rs. {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Discount */}
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="Discount amount"
                  value={discount || ""}
                  onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                  className="pl-10 h-9 text-sm"
                  min={0}
                />
              </div>

              {/* Totals */}
              <div className="border-t border-border pt-3 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>Rs. {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (18%)</span>
                  <span>Rs. {taxAmount.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-success">
                    <span>Discount</span>
                    <span>-Rs. {discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-accent">Rs. {total.toFixed(2)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  variant="accent"
                  className="w-full gap-2"
                  onClick={processOrder}
                  disabled={cart.length === 0 || isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Receipt className="w-4 h-4" />
                  )}
                  Complete Sale
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setCart([]);
                    setDiscount(0);
                  }}
                  disabled={cart.length === 0}
                >
                  Clear Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
