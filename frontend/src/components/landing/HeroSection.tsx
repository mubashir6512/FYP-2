import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Palette, Users } from "lucide-react";

const paintColors = [
  { name: "Ocean Blue", color: "hsl(210, 100%, 45%)" },
  { name: "Sage Green", color: "hsl(140, 25%, 65%)" },
  { name: "Warm Coral", color: "hsl(16, 85%, 62%)" },
  { name: "Sandy Beige", color: "hsl(35, 77%, 72%)" },
  { name: "Slate Gray", color: "hsl(220, 15%, 50%)" },
  { name: "Cream White", color: "hsl(45, 60%, 94%)" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/90" />
      
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Paint splash effect */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-info/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        
        {/* Floating paint swatches */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="absolute top-1/4 right-[15%] hidden lg:block"
        >
          <div className="relative">
            <div className="w-32 h-40 rounded-2xl shadow-2xl transform rotate-6 bg-gradient-to-br from-accent to-accent/80" />
            <div className="absolute -bottom-4 -right-4 w-32 h-40 rounded-2xl shadow-2xl transform -rotate-6 bg-gradient-to-br from-info to-info/80" />
            <div className="absolute -bottom-8 -right-8 w-32 h-40 rounded-2xl shadow-2xl transform rotate-3 bg-gradient-to-br from-success to-success/80" />
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24 pb-16">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent-foreground border border-accent/30 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Paint Visualization
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight mb-6"
          >
            Transform Your Space
            <br />
            <span className="text-accent">Before You Paint</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-primary-foreground/80 max-w-2xl mb-8"
          >
            Visualize any paint color on your walls with AI. Compare shades from 
            multiple brands, detect wall damage, and connect with professional 
            painters—all in one platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mb-12"
          >
            <Button variant="hero" size="xl" asChild>
              <Link to="/visualizer" className="gap-2">
                Try AI Visualizer
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="xl" asChild>
              <Link to="/products">Browse Catalog</Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-8"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
                <Palette className="w-6 h-6 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-foreground">50K+</div>
                <div className="text-sm text-primary-foreground/60">Paint Shades</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-foreground">2K+</div>
                <div className="text-sm text-primary-foreground/60">Pro Painters</div>
              </div>
            </div>
            <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
              <div className="w-12 h-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-foreground">100K+</div>
                <div className="text-sm text-primary-foreground/60">Visualizations</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Color Swatches Bar */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-6 overflow-x-auto pb-2 scrollbar-hide">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Trending Colors:</span>
            <div className="flex gap-3">
              {paintColors.map((paint, index) => (
                <motion.div
                  key={paint.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors group"
                >
                  <div
                    className="w-5 h-5 rounded-full shadow-sm ring-2 ring-border/50"
                    style={{ backgroundColor: paint.color }}
                  />
                  <span className="text-sm font-medium text-foreground whitespace-nowrap">
                    {paint.name}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
