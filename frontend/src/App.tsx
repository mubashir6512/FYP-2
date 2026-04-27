import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { SystemProvider } from "@/contexts/SystemContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ScrollToTop } from "@/components/ScrollToTop";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import CustomerDashboard from "./pages/dashboard/CustomerDashboard";
import DealerDashboard from "./pages/dashboard/DealerDashboard";
import PainterDashboard from "./pages/dashboard/PainterDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import ProductsPage from "./pages/products/ProductsPage";
import VisualizerPage from "./pages/visualizer/VisualizerPage";
import PaintersPage from "./pages/painters/PaintersPage";
import POSPage from "./pages/dealer/POSPage";
import ProductManagementPage from "./pages/dealer/ProductManagementPage";
import SalesAnalyticsPage from "./pages/dealer/SalesAnalyticsPage";
import InventoryPage from "./pages/dealer/InventoryPage";
import CustomerOrdersPage from "./pages/customer/CustomerOrdersPage";
import CustomerBookingsPage from "./pages/customer/CustomerBookingsPage";
import CustomerWishlistPage from "./pages/customer/CustomerWishlistPage";
import CustomerSettingsPage from "./pages/customer/CustomerSettingsPage";
import DealerOrdersPage from "./pages/dealer/DealerOrdersPage";
import DealerSettingsPage from "./pages/dealer/DealerSettingsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ServicesPage from "./pages/ServicesPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminDealersPage from "./pages/admin/AdminDealersPage";
import AdminPaintersPage from "./pages/admin/AdminPaintersPage";
import AdminReportsPage from "./pages/admin/AdminReportsPage";
import AdminSecurityPage from "./pages/admin/AdminSecurityPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import CheckoutPage from "./pages/customer/CheckoutPage";
import PainterSettingsPage from "./pages/painters/PainterSettingsPage";
import PainterJobsPage from "./pages/painters/PainterJobsPage";
import PainterSchedulePage from "./pages/painters/PainterSchedulePage";
import PainterReviewsPage from "./pages/painters/PainterReviewsPage";

const queryClient = new QueryClient();

// Redirects each role to their specific dashboard URL
function DashboardRedirect() {
  const { user, role, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (role === "dealer")  return <Navigate to="/dealer/dashboard" replace />;
  if (role === "painter") return <Navigate to="/painter/dashboard" replace />;
  if (role === "admin")   return <Navigate to="/admin/dashboard" replace />;
  // default: customer
  return <Navigate to="/dashboard/home" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
        <AuthProvider>
          <SystemProvider>
        <CartProvider>
          <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/visualizer" element={<VisualizerPage />} />
            <Route path="/painters" element={<PaintersPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Smart dashboard redirect — works for all roles */}
            <Route path="/dashboard" element={<DashboardRedirect />} />

            {/* Customer Dashboard */}
            <Route path="/dashboard/home"      element={<ProtectedRoute allowedRoles={["customer"]}><CustomerDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/orders"    element={<ProtectedRoute allowedRoles={["customer"]}><CustomerOrdersPage /></ProtectedRoute>} />
            <Route path="/dashboard/bookings"  element={<ProtectedRoute allowedRoles={["customer"]}><CustomerBookingsPage /></ProtectedRoute>} />
            <Route path="/dashboard/wishlist"  element={<ProtectedRoute allowedRoles={["customer"]}><CustomerWishlistPage /></ProtectedRoute>} />
            <Route path="/dashboard/settings"  element={<ProtectedRoute allowedRoles={["customer"]}><CustomerSettingsPage /></ProtectedRoute>} />
            <Route path="/checkout"            element={<ProtectedRoute allowedRoles={["customer"]}><CheckoutPage /></ProtectedRoute>} />
            <Route path="/dashboard/visualizer" element={<VisualizerPage />} />
            <Route path="/dashboard/*"         element={<ProtectedRoute allowedRoles={["customer"]}><CustomerDashboard /></ProtectedRoute>} />

            {/* Dealer Dashboard */}
            <Route path="/dealer/dashboard" element={<ProtectedRoute allowedRoles={["dealer"]}><DealerDashboard /></ProtectedRoute>} />
            <Route path="/dealer/pos"       element={<ProtectedRoute allowedRoles={["dealer"]}><POSPage /></ProtectedRoute>} />
            <Route path="/dealer/products"  element={<ProtectedRoute allowedRoles={["dealer"]}><ProductManagementPage /></ProtectedRoute>} />
            <Route path="/dealer/orders"    element={<ProtectedRoute allowedRoles={["dealer"]}><DealerOrdersPage /></ProtectedRoute>} />
            <Route path="/dealer/analytics" element={<ProtectedRoute allowedRoles={["dealer"]}><SalesAnalyticsPage /></ProtectedRoute>} />
            <Route path="/dealer/inventory" element={<ProtectedRoute allowedRoles={["dealer"]}><InventoryPage /></ProtectedRoute>} />
            <Route path="/dealer/settings"  element={<ProtectedRoute allowedRoles={["dealer"]}><DealerSettingsPage /></ProtectedRoute>} />
            <Route path="/dealer/*"         element={<ProtectedRoute allowedRoles={["dealer"]}><DealerDashboard /></ProtectedRoute>} />

            {/* Painter Dashboard */}
            <Route path="/painter/dashboard" element={<ProtectedRoute allowedRoles={["painter"]}><PainterDashboard /></ProtectedRoute>} />
            <Route path="/painter/jobs"      element={<ProtectedRoute allowedRoles={["painter"]}><PainterJobsPage /></ProtectedRoute>} />
            <Route path="/painter/schedule"  element={<ProtectedRoute allowedRoles={["painter"]}><PainterSchedulePage /></ProtectedRoute>} />
            <Route path="/painter/reviews"   element={<ProtectedRoute allowedRoles={["painter"]}><PainterReviewsPage /></ProtectedRoute>} />
            <Route path="/painter/settings"  element={<ProtectedRoute allowedRoles={["painter"]}><PainterSettingsPage /></ProtectedRoute>} />
            <Route path="/painter/profile"   element={<ProtectedRoute allowedRoles={["painter"]}><PainterSettingsPage /></ProtectedRoute>} />
            <Route path="/painter/*"         element={<ProtectedRoute allowedRoles={["painter"]}><PainterDashboard /></ProtectedRoute>} />

            {/* Admin Dashboard */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={["admin"]}><SalesAnalyticsPage /></ProtectedRoute>} />
            <Route path="/admin/users"     element={<ProtectedRoute allowedRoles={["admin"]}><AdminUsersPage /></ProtectedRoute>} />
            <Route path="/admin/dealers"   element={<ProtectedRoute allowedRoles={["admin"]}><AdminDealersPage /></ProtectedRoute>} />
            <Route path="/admin/painters"  element={<ProtectedRoute allowedRoles={["admin"]}><AdminPaintersPage /></ProtectedRoute>} />
            <Route path="/admin/reports"   element={<ProtectedRoute allowedRoles={["admin"]}><AdminReportsPage /></ProtectedRoute>} />
            <Route path="/admin/security"  element={<ProtectedRoute allowedRoles={["admin"]}><AdminSecurityPage /></ProtectedRoute>} />
            <Route path="/admin/settings"  element={<ProtectedRoute allowedRoles={["admin"]}><AdminSettingsPage /></ProtectedRoute>} />
            <Route path="/admin/*"         element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </CartProvider>
        </SystemProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
