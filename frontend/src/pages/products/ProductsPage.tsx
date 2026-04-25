import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, ShoppingCart, Heart, Search, Filter, Loader2, Package } from "lucide-react";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["all-products"],
    queryFn: async () => {
      return api("/products");
    },
  });

  // Filter products
  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesBrand = selectedBrand === "all" || product.brand === selectedBrand;
    return matchesSearch && matchesCategory && matchesBrand;
  });

  // Get unique brands and categories
  const brands = ["all", ...new Set(products.map((p: any) => p.brand).filter(Boolean))];
  const categories = ["all", "interior", "exterior"];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary via-primary/95 to-accent py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
                Paint Catalog
              </h1>
              <p className="text-primary-foreground/90 text-lg max-w-2xl mx-auto">
                Browse our collection of {products.length} premium paints from top Pakistani brands
              </p>
            </motion.div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-muted/30 border-b border-border">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, brand, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="all">All Categories</option>
                {categories.slice(1).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>

              {/* Brand Filter */}
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="px-4 py-2 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="all">All Brands</option>
                {brands.slice(1).map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredProducts.length} of {products.length} products
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="container mx-auto px-4 py-12">
          {isLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-24">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filters
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedBrand("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product: any, index: number) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card variant="interactive" className="overflow-hidden group h-full flex flex-col">
                    <div className="relative">
                      {/* Product Color Display */}
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

                      {/* Stock Badge */}
                      {product.stockQuantity <= 10 ? (
                        <Badge variant="warning" className="absolute top-3 left-3">
                          Low Stock
                        </Badge>
                      ) : product.stockQuantity > 100 ? (
                        <Badge variant="success" className="absolute top-3 left-3">
                          In Stock
                        </Badge>
                      ) : null}
                    </div>

                    <CardContent className="p-4 flex-1 flex flex-col">
                      {/* Brand & SKU */}
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm text-muted-foreground">{product.brand}</p>
                        {product.sku && (
                          <p className="text-xs text-muted-foreground font-mono">{product.sku}</p>
                        )}
                      </div>

                      {/* Name */}
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2 min-h-[3rem]">
                        {product.name}
                      </h3>

                      {/* Description */}
                      {product.description && (
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      {/* Color Swatch & Category */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full ring-2 ring-border/50"
                            style={{ backgroundColor: product.colorHex }}
                          />
                          <span className="text-xs text-muted-foreground capitalize">
                            {product.category}
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {product.unit || "litre"}
                        </Badge>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-3">
                        <Star className="w-4 h-4 fill-warning text-warning" />
                        <span className="text-sm font-medium">4.8</span>
                        <span className="text-sm text-muted-foreground">(24)</span>
                      </div>

                      {/* Stock Info */}
                      <div className="text-xs text-muted-foreground mb-3">
                        {product.stockQuantity > 0 ? (
                          <span className="text-success">
                            {product.stockQuantity} units available
                          </span>
                        ) : (
                          <span className="text-destructive">Out of stock</span>
                        )}
                      </div>

                      {/* Price & CTA */}
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                        <div>
                          <span className="text-2xl font-bold text-foreground">
                            Rs {Number(product.price).toLocaleString()}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">
                            /{product.unit || "L"}
                          </span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="accent"
                          disabled={product.stockQuantity === 0}
                        >
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
