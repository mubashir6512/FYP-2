import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Paintbrush,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  LayoutDashboard
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { CartDrawer } from "@/components/cart/CartDrawer";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  const getNavLinks = () => {
    const baseLinks = [
      { name: "Home", href: "/" },
      { name: "Products", href: "/products" },
      { name: "AI Visualizer", href: "/visualizer" },
    ];

    if (!user) {
      return [
        ...baseLinks,
        { name: "Find a Painter", href: "/painters" },
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
      ];
    }

    if (user.role === "customer") {
      return [
        ...baseLinks,
        { name: "Find a Painter", href: "/painters" },
        { name: "Dashboard", href: "/dashboard/home" },
        { name: "My Orders", href: "/dashboard/orders" },
      ];
    }

    if (user.role === "dealer") {
      return [
        ...baseLinks,
        { name: "POS", href: "/dealer/pos" },
        { name: "Inventory", href: "/dealer/inventory" },
        { name: "Dashboard", href: "/dealer/dashboard" },
      ];
    }

    if (user.role === "painter") {
      return [
        ...baseLinks,
        { name: "Jobs", href: "/painter/jobs" },
        { name: "Dashboard", href: "/painter/dashboard" },
      ];
    }

    if (user.role === "admin") {
      return [
        ...baseLinks,
        { name: "Dashboard", href: "/admin/dashboard" },
        { name: "Users", href: "/admin/users" },
      ];
    }

    return baseLinks;
  };

  const navLinks = getNavLinks();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Paintbrush className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              Paint<span className="text-accent">Verse</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <CartDrawer />
            {user ? (
              <>
                <Button variant="ghost" size="sm" asChild className="gap-2">
                  <Link to="/dashboard">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => signOut()} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button variant="accent" asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button & Cart */}
          <div className="flex items-center gap-2 lg:hidden">
            <CartDrawer />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background border-b border-border"
          >
            <div className="container mx-auto px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="block py-2 text-foreground font-medium hover:text-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-border flex flex-col gap-2">
                {user ? (
                  <>
                    <Button variant="outline" asChild className="w-full justify-start gap-2" onClick={() => setMobileMenuOpen(false)}>
                      <Link to="/dashboard">
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button variant="destructive" onClick={() => { signOut(); setMobileMenuOpen(false); }} className="w-full justify-start gap-2">
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" asChild className="w-full" onClick={() => setMobileMenuOpen(false)}>
                      <Link to="/login">Sign In</Link>
                    </Button>
                    <Button variant="accent" asChild className="w-full" onClick={() => setMobileMenuOpen(false)}>
                      <Link to="/register">Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
