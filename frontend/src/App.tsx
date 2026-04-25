import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ScrollToTop } from "@/components/ScrollToTop";

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
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ServicesPage from "./pages/ServicesPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
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

            {/* Customer Dashboard */}
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["customer"]}><CustomerDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/orders" element={<ProtectedRoute allowedRoles={["customer"]}><CustomerOrdersPage /></ProtectedRoute>} />
            <Route path="/dashboard/bookings" element={<ProtectedRoute allowedRoles={["customer"]}><CustomerBookingsPage /></ProtectedRoute>} />
            <Route path="/dashboard/wishlist" element={<ProtectedRoute allowedRoles={["customer"]}><CustomerWishlistPage /></ProtectedRoute>} />
            <Route path="/dashboard/settings" element={<ProtectedRoute allowedRoles={["customer"]}><CustomerSettingsPage /></ProtectedRoute>} />
            <Route path="/dashboard/visualizer" element={<VisualizerPage />} />
            <Route path="/dashboard/*" element={<ProtectedRoute allowedRoles={["customer"]}><CustomerDashboard /></ProtectedRoute>} />

            {/* Dealer Dashboard */}
            <Route path="/dealer/dashboard" element={<ProtectedRoute allowedRoles={["dealer"]}><DealerDashboard /></ProtectedRoute>} />
            <Route path="/dealer/pos" element={<ProtectedRoute allowedRoles={["dealer"]}><POSPage /></ProtectedRoute>} />
            <Route path="/dealer/products" element={<ProtectedRoute allowedRoles={["dealer"]}><ProductManagementPage /></ProtectedRoute>} />
            <Route path="/dealer/analytics" element={<ProtectedRoute allowedRoles={["dealer"]}><SalesAnalyticsPage /></ProtectedRoute>} />
            <Route path="/dealer/inventory" element={<ProtectedRoute allowedRoles={["dealer"]}><InventoryPage /></ProtectedRoute>} />
            <Route path="/dealer/*" element={<ProtectedRoute allowedRoles={["dealer"]}><DealerDashboard /></ProtectedRoute>} />

            {/* Painter Dashboard */}
            <Route path="/painter/dashboard" element={<ProtectedRoute allowedRoles={["painter"]}><PainterDashboard /></ProtectedRoute>} />
            <Route path="/painter/*" element={<ProtectedRoute allowedRoles={["painter"]}><PainterDashboard /></ProtectedRoute>} />

            {/* Admin Dashboard */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={["admin"]}><SalesAnalyticsPage /></ProtectedRoute>} />
            <Route path="/admin/*" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
