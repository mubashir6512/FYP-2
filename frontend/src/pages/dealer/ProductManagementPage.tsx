import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader, EmptyState } from "@/components/dashboard/DashboardComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Package,
  Loader2,
  Edit,
  Trash2,
  X,
  Save,
  Tag,
  Hash,
  Layers,
  Palette,
  DollarSign,
  Info,
  Building,
} from "lucide-react";

interface ProductForm {
  name: string;
  sku: string;
  category: string;
  brand: string;
  colorHex: string;
  unit: string;
  price: string;
  costPrice: string;
  stockQuantity: string;
  lowStockThreshold: string;
  description: string;
}

const emptyForm: ProductForm = {
  name: "",
  sku: "",
  category: "paint",
  brand: "",
  colorHex: "#4A90D9",
  unit: "litre",
  price: "",
  costPrice: "",
  stockQuantity: "",
  lowStockThreshold: "10",
  description: "",
};

export default function ProductManagementPage() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>({
    ...emptyForm,
    brand: profile?.businessName || ""
  });

  // Sync brand with profile business name once it loads
  useEffect(() => {
    // Only auto-populate if we are adding a NEW product and brand is currently empty
    if (!editingId && !form.brand) {
      const brandName = profile?.businessName || (user as any)?.fullName;
      if (brandName) {
        setForm(prev => ({ ...prev, brand: brandName }));
      }
    }
  }, [profile, user, editingId]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["dealer-products", user?.id],
    queryFn: async () => {
      return api("/products/dealer");
    },
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        sku: form.sku || null,
        category: form.category,
        brand: form.brand || null,
        colorHex: form.colorHex || null,
        unit: form.unit,
        price: parseFloat(form.price) || 0,
        costPrice: parseFloat(form.costPrice) || 0,
        stockQuantity: parseInt(form.stockQuantity) || 0,
        lowStockThreshold: parseInt(form.lowStockThreshold) || 10,
        description: form.description || null,
      };

      if (editingId) {
        return api(`/products/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        return api("/products", {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
    },
    onSuccess: () => {
      toast.success(editingId ? "Product updated!" : "Product added!");
      queryClient.invalidateQueries({ queryKey: ["dealer-products"] });
      resetForm();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api(`/products/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      toast.success("Product deleted");
      queryClient.invalidateQueries({ queryKey: ["dealer-products"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({
      ...emptyForm,
      brand: profile?.businessName || ""
    });
  };

  const editProduct = (product: any) => {
    setForm({
      name: product.name,
      sku: product.sku || "",
      category: product.category,
      brand: product.brand || "",
      colorHex: product.colorHex || "#4A90D9",
      unit: product.unit,
      price: String(product.price),
      costPrice: String(product.costPrice),
      stockQuantity: String(product.stockQuantity),
      lowStockThreshold: String(product.lowStockThreshold),
      description: product.description || "",
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast.error("Name and price are required");
      return;
    }

    // Auto-generate SKU if empty
    let finalForm = { ...form };
    if (!form.sku) {
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      const prefix = form.brand ? form.brand.substring(0, 3).toUpperCase() : "PV";
      const cat = form.category.substring(0, 3).toUpperCase();
      finalForm.sku = `${prefix}-${cat}-${random}`;
      setForm(finalForm);
    }
    
    saveMutation.mutate();
  };

  return (
    <DashboardLayout role="dealer">
      <PageHeader
        title="Product Management"
        description="Add and manage your paint products."
      >
        <Button
          variant="accent"
          className="gap-2"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </PageHeader>

      {/* Add/Edit Form */}
      {showForm && (
        <Card variant="elevated" className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">
              {editingId ? "Edit Product" : "New Product"}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={resetForm}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Name *</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="pl-10" placeholder="e.g. Premium Silk Finish" />
                </div>
              </div>
              <div className="sm:col-span-1">
                <label className="text-sm font-medium text-foreground mb-1 block flex items-center justify-between">
                  SKU
                  <button 
                    type="button"
                    onClick={() => {
                      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
                      const prefix = form.brand ? form.brand.substring(0, 3).toUpperCase() : "PV";
                      const cat = form.category.substring(0, 3).toUpperCase();
                      setForm({ ...form, sku: `${prefix}-${cat}-${random}` });
                    }}
                    className="text-[10px] text-accent hover:underline uppercase font-bold"
                  >
                    Generate
                  </button>
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    value={form.sku} 
                    onChange={(e) => setForm({ ...form, sku: e.target.value })} 
                    placeholder="e.g. PV-PNT-A1B2" 
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Category</label>
                <div className="relative">
                  <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full h-10 rounded-md border border-input bg-background pl-10 pr-3 text-sm focus:ring-2 focus:ring-accent outline-none"
                  >
                    <option value="paint">Paint</option>
                    <option value="primer">Primer</option>
                    <option value="stain">Stain</option>
                    <option value="accessories">Accessories</option>
                    <option value="tools">Tools</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block flex items-center justify-between">
                  Brand
                  <button 
                    type="button"
                    onClick={() => {
                      const brandName = profile?.businessName || (user as any)?.fullName;
                      if (brandName) setForm({ ...form, brand: brandName });
                    }}
                    className="text-[10px] text-accent hover:underline uppercase font-bold"
                  >
                    Use My Name
                  </button>
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="pl-10" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={form.colorHex}
                    onChange={(e) => setForm({ ...form, colorHex: e.target.value })}
                    className="w-10 h-10 rounded-md border border-input cursor-pointer p-0.5"
                  />
                  <Input value={form.colorHex} onChange={(e) => setForm({ ...form, colorHex: e.target.value })} className="font-mono" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Unit</label>
                <select
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="litre">Litre</option>
                  <option value="gallon">Gallon</option>
                  <option value="piece">Piece</option>
                  <option value="kg">Kg</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Selling Price *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required min="0" step="0.01" className="pl-10" placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Cost Price</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="number" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} min="0" step="0.01" className="pl-10" placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Stock Qty</label>
                <Input type="number" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} min="0" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Low Stock Alert</label>
                <Input type="number" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} min="0" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-foreground mb-1 block">Description</label>
                <div className="relative">
                  <Info className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="pl-10" placeholder="Optional product details..." />
                </div>
              </div>
              <div className="flex items-end">
                <Button type="submit" variant="accent" className="gap-2 w-full" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingId ? "Update" : "Add"} Product
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Products List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No Products Yet"
          description="Add your first product to start using the POS system."
          action={
            <Button variant="accent" onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Add Product
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product: any) => (
            <Card key={product.id} className="overflow-hidden">
              {product.colorHex && (
                <div className="h-16" style={{ backgroundColor: product.colorHex }} />
              )}
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{product.name}</h3>
                    <p className="text-xs text-muted-foreground">{product.sku || "No SKU"}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs ml-2">{product.category}</Badge>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-bold text-accent">Rs. {product.price}</span>
                  <Badge variant={product.stockQuantity <= product.lowStockThreshold ? "warning" : "success"}>
                    {product.stockQuantity} in stock
                  </Badge>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => editProduct(product)}>
                    <Edit className="w-3 h-3" /> Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-1"
                    onClick={() => {
                      if (confirm("Delete this product?")) deleteMutation.mutate(product.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
