import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, Plus, Minus, Package } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

export function CartDrawer() {
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative group">
          <ShoppingCart className="w-5 h-5 text-foreground group-hover:text-accent transition-colors" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
              {totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 bg-background border-border">
        <SheetHeader className="p-6 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-accent" />
            Your Cart ({totalItems})
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-hidden">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-muted-foreground opacity-50" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-[200px]">
                Looks like you haven't added any paints to your project yet.
              </p>
              <Button asChild variant="accent">
                <Link to="/products">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-full p-6">
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div
                      className="w-20 h-20 rounded-lg flex-shrink-0 border border-border"
                      style={{
                        background: item.imageUrl || `linear-gradient(135deg, ${item.colorHex}dd 0%, ${item.colorHex} 100%)`
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">{item.brand}</p>
                          <h4 className="font-medium text-foreground text-sm line-clamp-1">{item.name}</h4>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-border rounded-lg bg-muted/30">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-muted transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-muted transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="font-semibold text-sm text-foreground">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="p-6 border-t border-border bg-muted/10 block">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-foreground">Rs. {totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Shipping & Taxes</span>
                <span>Calculated at checkout</span>
              </div>
              <Separator className="bg-border" />
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg text-foreground">Total</span>
                <span className="font-bold text-lg text-accent">Rs. {totalPrice.toLocaleString()}</span>
              </div>
              <Button className="w-full h-12 text-lg" variant="accent" asChild>
                <Link to="/checkout">Checkout Now</Link>
              </Button>
              <p className="text-[10px] text-center text-muted-foreground">
                Secure payment powered by PaintVerse Pay
              </p>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
