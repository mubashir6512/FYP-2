import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { Link } from "react-router-dom";

import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export function ProductsSection() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const allProducts = await api("/products");
      return allProducts.slice(0, 4); // Limit to 4 for featured
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12"
        >
          <div>
            <span className="text-sm font-semibold text-accent uppercase tracking-wider">
              Featured Products
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-2">
              Popular Paint Collections
            </h2>
          </div>
          <Button variant="outline" asChild>
            <Link to="/products">View All Products</Link>
          </Button>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product: any, index: number) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card variant="interactive" className="overflow-hidden group">
                <div className="relative">
                  {/* Product Image/Gradient */}
                  <div
                    className="aspect-[4/3] w-full"
                    style={{
                      background: product.imageUrl || `linear-gradient(135deg, ${product.colorHex}dd 0%, ${product.colorHex} 100%)`
                    }}
                  />

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button variant="secondary" size="sm" className="shadow-lg">
                      Quick View
                    </Button>
                  </div>

                  {/* Wishlist */}
                  <button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors opacity-0 group-hover:opacity-100">
                    <Heart className="w-4 h-4 text-foreground" />
                  </button>

                  {/* Featured Badge */}
                  {product.stockQuantity > 50 && (
                    <Badge variant="accent" className="absolute top-3 left-3">
                      Popular
                    </Badge>
                  )}
                </div>

                <CardContent className="p-4">
                  {/* Brand */}
                  <p className="text-sm text-muted-foreground mb-1">{product.brand}</p>

                  {/* Name */}
                  <h3 className="font-semibold text-foreground mb-2 line-clamp-1">
                    {product.name}
                  </h3>

                  {/* Color Swatch */}
                  <div className="flex gap-1.5 mb-3">
                    <div
                      className="w-5 h-5 rounded-full ring-1 ring-border/50"
                      style={{ backgroundColor: product.colorHex }}
                    />
                    <span className="text-xs text-muted-foreground self-center">{product.colorName}</span>
                  </div>

                  {/* Rating & Finish */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-warning text-warning" />
                      <span className="text-sm font-medium">4.8</span>
                      <span className="text-sm text-muted-foreground">(24)</span>
                    </div>
                    <Badge variant="secondary">{product.finish}</Badge>
                  </div>

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-foreground">
                      ₹{Number(product.price).toFixed(0)}
                    </span>
                    <Button size="sm" variant="accent">
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
