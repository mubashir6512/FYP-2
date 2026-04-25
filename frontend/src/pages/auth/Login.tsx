import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Paintbrush, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast.error(error);
        setIsLoading(false);
        return;
      }

      toast.success("Signed in successfully!");
      
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
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-primary/90 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-info/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shadow-lg">
            <Paintbrush className="w-6 h-6 text-accent-foreground" />
          </div>
          <span className="font-display text-2xl font-bold text-primary-foreground">
            PaintVerse
          </span>
        </Link>

        <Card variant="elevated" className="shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="input-premium pl-11 pr-11"
                    required
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

              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm text-accent hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" variant="accent" size="lg" className="w-full gap-2" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{" "}
              <Link to="/register" className="text-accent font-medium hover:underline">Sign up</Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
