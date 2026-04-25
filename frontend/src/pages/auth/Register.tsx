import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Paintbrush, Mail, Lock, Eye, EyeOff, User, ArrowRight, Building2, Brush, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type UserType = "customer" | "dealer" | "painter";

const userTypes = [
  { type: "customer" as UserType, label: "Customer", description: "Buy paints & book painters", icon: User },
  { type: "dealer" as UserType, label: "Dealer", description: "Sell paint products", icon: Building2 },
  { type: "painter" as UserType, label: "Painter", description: "Offer painting services", icon: Brush },
];

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<UserType>("customer");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await signUp(formData.email, formData.password, formData.name, userType);

      if (error) {
        toast.error(error);
        setIsLoading(false);
        return;
      }

      toast.success("Account created successfully! You can now sign in.");
      
      // Get user data from localStorage (set by AuthContext)
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        const userRole = user.role;
        
        // Role-based redirect
        if (userRole === "dealer") {
          navigate("/dealer/dashboard");
        } else if (userRole === "painter") {
          navigate("/painter/dashboard");
        } else if (userRole === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        navigate("/login");
      }
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-primary/90 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-success/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10"
      >
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shadow-lg">
            <Paintbrush className="w-6 h-6 text-accent-foreground" />
          </div>
          <span className="font-display text-2xl font-bold text-primary-foreground">PaintVerse</span>
        </Link>

        <Card variant="elevated" className="shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">Create an Account</CardTitle>
            <CardDescription>Join PaintVerse today</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">I want to</label>
                <div className="grid grid-cols-3 gap-3">
                  {userTypes.map((type) => (
                    <button
                      key={type.type}
                      type="button"
                      onClick={() => setUserType(type.type)}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        userType === type.type
                          ? "border-accent bg-accent/5"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <type.icon className={`w-6 h-6 mx-auto mb-2 ${userType === type.type ? "text-accent" : "text-muted-foreground"}`} />
                      <p className="font-medium text-sm text-foreground">{type.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {userType === "dealer" ? "Organization Name" : "Full Name"}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={userType === "dealer" ? "Enter organization name" : "Enter your name"}
                    className="input-premium pl-11"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                    className="input-premium pl-11"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Create a password (min 6 characters)"
                    className="input-premium pl-11 pr-11"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                By creating an account, you agree to our{" "}
                <Link to="/terms" className="text-accent hover:underline">Terms of Service</Link>{" "}and{" "}
                <Link to="/privacy" className="text-accent hover:underline">Privacy Policy</Link>.
              </p>

              <Button type="submit" variant="accent" size="lg" className="w-full gap-2" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-accent font-medium hover:underline">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
