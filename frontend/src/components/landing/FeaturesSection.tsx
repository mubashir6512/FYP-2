import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Palette, 
  Camera, 
  Wand2, 
  ShoppingCart, 
  Users, 
  Star,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Camera,
    title: "Room Photo Upload",
    description: "Simply upload a photo of your room and our AI will detect walls and surfaces automatically.",
    color: "bg-info/10 text-info",
  },
  {
    icon: Wand2,
    title: "AI Wall Detection",
    description: "Advanced algorithms identify wall surfaces, detect damage, and prepare for virtual painting.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Palette,
    title: "50K+ Paint Shades",
    description: "Browse colors from top paint brands. Compare shades side-by-side with accurate color matching.",
    color: "bg-success/10 text-success",
  },
  {
    icon: Wand2,
    title: "Virtual Restoration",
    description: "AI automatically detects cracks and stains, showing you a restored preview before painting.",
    color: "bg-warning/10 text-warning",
  },
  {
    icon: ShoppingCart,
    title: "One-Click Purchase",
    description: "Order paints directly from verified dealers. Get exact quantities for your room size.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Users,
    title: "Book Pro Painters",
    description: "Connect with verified professional painters in your area. Read reviews and book instantly.",
    color: "bg-destructive/10 text-destructive",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function FeaturesSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-sm font-semibold text-accent uppercase tracking-wider">
            How It Works
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
            Paint Visualization Made Simple
          </h2>
          <p className="text-lg text-muted-foreground">
            From visualization to purchase to professional painting—everything you need 
            to transform your space is in one platform.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <Card variant="interactive" className="h-full">
                <CardContent className="p-6">
                  <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-5`}>
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-12"
        >
          <Button variant="accent" size="lg" asChild>
            <Link to="/visualizer" className="gap-2">
              Start Visualizing
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
