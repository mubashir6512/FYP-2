import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/dashboard/DashboardComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Loader2, CreditCard, Truck, ShoppingBag, CheckCircle2 } from "lucide-react";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  
  const [formData, setFormData] = useState({
    customerName: profile?.fullName || "",
    customerPhone: profile?.phone || "",
    address: "",
    city: "Lahore",
    paymentMethod: "cash_on_delivery",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    setLoading(true);
    try {
      const payload = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerAddress: formData.address + ", " + formData.city,
        subtotal: totalPrice,
        taxAmount: totalPrice * 0.18, // 18% GST
        total: totalPrice * 1.18,
        paymentMethod: formData.paymentMethod,
        items: items.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
        })),
      };

      await api("/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setOrderComplete(true);
      clearCart();
      toast.success("Order placed successfully!");
      
      setTimeout(() => {
        navigate("/dashboard/orders");
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete) {
    return (
      <DashboardLayout role="customer">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-8 max-w-md">
            Your order has been placed successfully and is being processed. 
            You will receive a confirmation call shortly.
          </p>
          <Button variant="accent" onClick={() => navigate("/dashboard/orders")}>
            View My Orders
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (items.length === 0) {
    return (
      <DashboardLayout role="customer">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ShoppingBag className="w-16 h-16 text-muted-foreground opacity-20 mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">Add some products before checking out.</p>
          <Button variant="accent" onClick={() => navigate("/products")}>
            Browse Products
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="customer">
      <PageHeader
        title="Checkout"
        description="Complete your purchase by providing delivery details."
      />

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Shipping Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-accent" />
                Shipping Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      required
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      required
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address</Label>
                  <Input
                    id="address"
                    required
                    placeholder="Street address, Apartment, etc."
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <select
                      id="city"
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    >
                      <option value="Lahore">Lahore</option>
                      <option value="Karachi">Karachi</option>
                      <option value="Islamabad">Islamabad</option>
                      <option value="Faisalabad">Faisalabad</option>
                      <option value="Rawalpindi">Rawalpindi</option>
                    </select>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-accent" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <div 
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-2 ${formData.paymentMethod === 'cash_on_delivery' ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/30'}`}
                  onClick={() => setFormData({ ...formData, paymentMethod: 'cash_on_delivery' })}
                >
                  <span className="font-semibold">Cash on Delivery</span>
                  <span className="text-xs text-muted-foreground">Pay when your order arrives.</span>
                </div>
                <div 
                  className={`p-4 rounded-xl border-2 transition-all opacity-50 cursor-not-allowed flex flex-col gap-2 border-border bg-muted/50`}
                >
                  <span className="font-semibold">Online Payment</span>
                  <span className="text-xs text-muted-foreground italic">Coming soon</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card variant="elevated" className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground truncate max-w-[150px]">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>Rs. {totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-success">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GST (18%)</span>
                  <span>Rs. {(totalPrice * 0.18).toLocaleString()}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-accent">Rs. {(totalPrice * 1.18).toLocaleString()}</span>
              </div>

              <Button 
                type="submit" 
                form="checkout-form"
                className="w-full h-12 text-lg mt-4" 
                variant="accent"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Place Order"}
              </Button>
              <p className="text-[10px] text-center text-muted-foreground">
                By placing an order, you agree to our Terms & Conditions.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
