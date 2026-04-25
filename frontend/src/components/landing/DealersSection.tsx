import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Building2, Palette, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const benefits = [
  "Reach thousands of customers",
  "AI-powered inventory management",
  "Real-time sales analytics",
  "Branded storefront page",
  "Integrated payment processing",
  "Professional order management",
];

const stats = [
  { icon: Building2, value: "500+", label: "Active Dealers" },
  { icon: Palette, value: "50K+", label: "Products Listed" },
  { icon: TrendingUp, value: "35%", label: "Avg. Sales Growth" },
];

export function DealersSection() {
  return (
    <section className="py-24 bg-primary text-primary-foreground overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="bg-accent text-accent-foreground mb-4">
              For Paint Dealers
            </Badge>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Grow Your Paint Business Online
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Join our marketplace of verified paint dealers. List your products, 
              manage inventory, and reach customers who are ready to buy.
            </p>

            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-accent-foreground" />
                  </div>
                  <span className="text-sm text-primary-foreground/90">{benefit}</span>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="hero" 
                size="lg" 
                asChild
              >
                <Link to="/dealer/register" className="gap-2">
                  Become a Dealer
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button 
                variant="hero-outline" 
                size="lg" 
                asChild
              >
                <Link to="/dealer/login">Dealer Login</Link>
              </Button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <Card className="bg-primary-foreground/10 border-primary-foreground/20 backdrop-blur-sm">
                  <CardContent className="p-6 flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center">
                      <stat.icon className="w-8 h-8 text-accent" />
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-primary-foreground">
                        {stat.value}
                      </div>
                      <div className="text-primary-foreground/70">{stat.label}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
