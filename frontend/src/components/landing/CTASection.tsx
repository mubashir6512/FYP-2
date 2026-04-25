import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent via-accent/90 to-accent/80 p-8 sm:p-12 lg:p-16"
        >
          {/* Background Decorations */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-background/10 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-foreground/20 text-accent-foreground text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              Start Your Journey Today
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-accent-foreground mb-6"
            >
              Ready to Transform Your Space?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-lg text-accent-foreground/90 mb-8"
            >
              Join thousands of homeowners who trust PaintVerse for their 
              painting projects. Visualize, shop, and hire—all in one place.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button 
                size="xl" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all"
                asChild
              >
                <Link to="/register" className="gap-2">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button 
                size="xl" 
                variant="outline"
                className="border-accent-foreground/30 text-accent-foreground bg-transparent hover:bg-accent-foreground/10"
                asChild
              >
                <Link to="/visualizer">Try AI Visualizer</Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
