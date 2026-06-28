import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, ShoppingCart, Heart, Search, Filter, Loader2, Package, Store, MapPin } from "lucide-react";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart } from "@/contexts/CartContext";
import { useSearchParams } from "react-router-dom";
import { PaintedWallPreview } from "@/components/ui/PaintedWallPreview";

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState<Set<string>>(() => {
    const saved = localStorage.getItem("paintverse_wishlist");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const { data: products = [] as any[], isLoading } = useQuery({
    queryKey: ["all-products"],
    queryFn: async () => {
      const data = await api("/products");
      return data as any[];
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
  const categories = ["all", "interior", "exterior", "enamel", "primer", "specialty"];

  const toggleWishlist = (id: string) => {
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.info("Removed from wishlist");
      } else {
        next.add(id);
        toast.success("Added to wishlist");
      }
      localStorage.setItem("paintverse_wishlist", JSON.stringify(Array.from(next)));
      return next;
    });
  };

  // Removed local addToCart as we're using the one from CartContext

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
        <div className="bg-muted/30 border-b border-border sticky top-[64px] z-30 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search */}
              <div className="w-full lg:flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, brand, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background"
                />
              </div>

              <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="flex-1 lg:flex-none px-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
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
                  className="flex-1 lg:flex-none px-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                >
                  <option value="all">All Brands</option>
                  {brands.slice(1).map((brand: any) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>

                <Button variant="outline" size="sm" onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedBrand("all");
                }} className="gap-2">
                  <Filter className="w-4 h-4" />
                  Reset
                </Button>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{filteredProducts.length}</span> of {products.length} products
              </span>
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
                      <PaintedWallPreview 
                        colorHex={product.colorHex} 
                        imageUrl={product.imageUrl} 
                        category={product.category}
                        className="aspect-[4/3] w-full" 
                      />

                      {/* Overlay Actions */}
                      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="shadow-xl scale-90 group-hover:scale-100 transition-transform"
                          onClick={() => setSelectedProduct(product)}
                        >
                          Quick View
                        </Button>
                      </div>

                      {/* Wishlist */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product.id);
                        }}
                        className={`absolute top-3 right-3 w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-sm ${
                          wishlist.has(product.id) ? "bg-accent text-white opacity-100" : "bg-background/90 text-foreground hover:bg-background"
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${wishlist.has(product.id) ? "fill-current" : ""}`} />
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
                            Rs. {Number(product.price).toLocaleString()}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">
                            /{product.unit || "L"}
                          </span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="accent"
                          disabled={product.stockQuantity === 0}
                          onClick={() => {
                            console.log("Add to Cart clicked for product:", product.id);
                            addToCart(product);
                          }}
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

      {/* Quick View Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background border-border">
          {selectedProduct && (
            <div className="grid md:grid-cols-2">
              <PaintedWallPreview 
                colorHex={selectedProduct.colorHex} 
                imageUrl={selectedProduct.imageUrl} 
                category={selectedProduct.category}
                className="aspect-square md:aspect-auto min-h-[300px]" 
              />
              <div className="p-8 flex flex-col">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="capitalize">{selectedProduct.category}</Badge>
                    <span className="text-xs text-muted-foreground font-mono">{selectedProduct.sku}</span>
                  </div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">{selectedProduct.name}</h2>
                  <p className="text-lg font-medium text-muted-foreground">{selectedProduct.brand}</p>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-warning text-warning" />
                    ))}
                    <span className="ml-2 font-medium">4.8</span>
                  </div>
                  <span className="text-muted-foreground">(24 reviews)</span>
                </div>

                <div className="mb-8">
                  <h4 className="text-sm font-semibold text-foreground mb-2">Description</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedProduct.description || "A premium quality paint offering excellent coverage and a durable finish. Perfect for high-traffic areas and long-lasting beauty."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-3 rounded-xl border border-border bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Color Code</p>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: selectedProduct.colorHex }} />
                      <span className="text-sm font-medium uppercase">{selectedProduct.colorHex}</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl border border-border bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Unit Size</p>
                    <p className="text-sm font-medium">{selectedProduct.unit || "Litre"}</p>
                  </div>
                </div>

                {/* Sold By Section */}
                <div className="p-4 rounded-xl border border-accent/20 bg-accent/5 mb-8">
                  <h4 className="text-xs font-semibold text-accent uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Store className="w-3 h-3" /> Sold By
                  </h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground">
                        {selectedProduct.dealer?.profile?.businessName || selectedProduct.dealer?.profile?.fullName || "PaintVerse Dealer"}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {selectedProduct.dealer?.profile?.city || "Pakistan"}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-background">Verified Seller</Badge>
                  </div>
                </div>

                <div className="mt-auto space-y-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Price</p>
                      <p className="text-4xl font-bold text-foreground">
                        Rs. {Number(selectedProduct.price).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={selectedProduct.stockQuantity > 0 ? "success" : "destructive"}>
                        {selectedProduct.stockQuantity > 0 ? `${selectedProduct.stockQuantity} in stock` : "Out of stock"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      className="flex-1 h-12 text-lg" 
                      variant="accent"
                      disabled={selectedProduct.stockQuantity === 0}
                      onClick={() => {
                        console.log("Quick View: Add to Cart clicked for product:", selectedProduct.id);
                        addToCart(selectedProduct);
                      }}
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add to Cart
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-12 w-12"
                      onClick={() => toggleWishlist(selectedProduct.id)}
                    >
                      <Heart className={`w-5 h-5 ${wishlist.has(selectedProduct.id) ? "fill-accent text-accent" : ""}`} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
}
