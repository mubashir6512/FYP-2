import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader, EmptyState } from "@/components/dashboard/DashboardComponents";
import { Heart, ShoppingCart, Trash2, Loader2, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/contexts/CartContext";

export default function CustomerWishlistPage() {
    const [wishlistIds, setWishlistIds] = useState<string[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem("paintverse_wishlist");
        if (saved) {
            setWishlistIds(JSON.parse(saved));
        }
    }, []);

    const { data: products = [], isLoading } = useQuery({
        queryKey: ["all-products"],
        queryFn: async () => {
            return api("/products");
        },
    });

    const wishlistProducts = products.filter((p: any) => wishlistIds.includes(p.id));
    const { addToCart } = useCart();

    const removeFromWishlist = (id: string) => {
        const next = wishlistIds.filter(item => item !== id);
        setWishlistIds(next);
        localStorage.setItem("paintverse_wishlist", JSON.stringify(next));
        toast.info("Removed from wishlist");
    };

    return (
        <DashboardLayout role="customer">
            <PageHeader
                title="My Wishlist"
                description="Manage the products you've saved for later."
            />

            {isLoading ? (
                <div className="flex justify-center py-24">
                    <Loader2 className="w-8 h-8 animate-spin text-accent" />
                </div>
            ) : wishlistProducts.length === 0 ? (
                <EmptyState
                    icon={Heart}
                    title="Your Wishlist is Empty"
                    description="Browse our catalog and heart your favorite items to see them here."
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence>
                        {wishlistProducts.map((product: any) => (
                            <motion.div
                                key={product.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Card variant="interactive" className="overflow-hidden group h-full flex flex-col">
                                    <div className="relative">
                                        <div
                                            className="aspect-[4/3] w-full"
                                            style={{
                                                background: product.imageUrl || `linear-gradient(135deg, ${product.colorHex}dd 0%, ${product.colorHex} 100%)`
                                            }}
                                        />
                                        <button
                                            onClick={() => removeFromWishlist(product.id)}
                                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-destructive hover:text-white transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <Badge className="absolute top-3 left-3" variant="secondary">
                                            {product.brand}
                                        </Badge>
                                    </div>

                                    <CardContent className="p-4 flex-1 flex flex-col">
                                        <h3 className="font-semibold text-foreground mb-2 line-clamp-1">
                                            {product.name}
                                        </h3>
                                        <div className="flex items-center gap-1 mb-3">
                                            <Star className="w-3 h-3 fill-warning text-warning" />
                                            <span className="text-xs font-medium">4.8</span>
                                            <span className="text-xs text-muted-foreground">(24)</span>
                                        </div>

                                        <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
                                            <div>
                                                <span className="text-lg font-bold text-foreground">
                                                    Rs. {Number(product.price).toLocaleString()}
                                                </span>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="accent"
                                                disabled={product.stockQuantity === 0}
                                                onClick={() => addToCart(product)}
                                            >
                                                <ShoppingCart className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {wishlistProducts.length > 0 && (
                <div className="mt-12 text-center">
                    <Button variant="outline" asChild>
                        <Link to="/products">
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Continue Shopping
                        </Link>
                    </Button>
                </div>
            )}
        </DashboardLayout>
    );
}
