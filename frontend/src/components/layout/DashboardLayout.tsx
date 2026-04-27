import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Paintbrush,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  Users,
  BarChart3,
  FileText,
  Shield,
  Heart,
  Calendar,
  Star,
  Palette,
  Image,
  Briefcase,
  Home,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Footer } from "./Footer";

type UserRole = "customer" | "dealer" | "painter" | "admin";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navigationByRole: Record<UserRole, NavItem[]> = {
  customer: [
    { name: "Dashboard", href: "/dashboard/home", icon: LayoutDashboard },
    { name: "Visualizer", href: "/dashboard/visualizer", icon: Image },
    { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
    { name: "Wishlist", href: "/dashboard/wishlist", icon: Heart },
    { name: "Bookings", href: "/dashboard/bookings", icon: Calendar },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ],
  dealer: [
    { name: "Dashboard", href: "/dealer/dashboard", icon: LayoutDashboard },
    { name: "POS", href: "/dealer/pos", icon: Monitor },
    { name: "Products", href: "/dealer/products", icon: Package },
    { name: "Orders", href: "/dealer/orders", icon: ShoppingCart },
    { name: "Inventory", href: "/dealer/inventory", icon: Palette },
    { name: "Analytics", href: "/dealer/analytics", icon: BarChart3 },
    { name: "Settings", href: "/dealer/settings", icon: Settings },
  ],
  painter: [
    { name: "Dashboard", href: "/painter/dashboard", icon: LayoutDashboard },
    { name: "Jobs", href: "/painter/jobs", icon: Briefcase },
    { name: "Schedule", href: "/painter/schedule", icon: Calendar },
    { name: "Reviews", href: "/painter/reviews", icon: Star },
    { name: "Profile", href: "/painter/profile", icon: Users },
    { name: "Settings", href: "/painter/settings", icon: Settings },
  ],
  admin: [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Companies", href: "/admin/dealers", icon: Package },
    { name: "Painters", href: "/admin/painters", icon: Briefcase },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Reports", href: "/admin/reports", icon: FileText },
    { name: "Security", href: "/admin/security", icon: Shield },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ],
};

const roleLabels: Record<UserRole, string> = {
  customer: "Customer",
  dealer: "Company",
  painter: "Painter",
  admin: "Admin",
};

interface DashboardLayoutProps {
  children: ReactNode;
  role: UserRole;
}

export function DashboardLayout({
  children,
  role,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigation = navigationByRole[role];
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const displayName = profile?.fullName || "User";

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-sidebar transform transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 lg:h-20 flex items-center justify-between px-6 border-b border-sidebar-border">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
                <Paintbrush className="w-5 h-5 text-sidebar-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-sidebar-foreground">
                Paint<span className="text-sidebar-primary">Verse</span>
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-semibold">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {displayName}
                </p>
                <p className="text-xs text-sidebar-foreground/60">
                  {roleLabels[role]}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent mt-2"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 lg:h-20 bg-background/95 backdrop-blur-sm border-b border-border flex items-center px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-secondary mr-4"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full" />
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <Home className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">{children}</main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
