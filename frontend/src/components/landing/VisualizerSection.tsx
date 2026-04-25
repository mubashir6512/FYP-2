import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Upload, ArrowRight, Check } from "lucide-react";

const steps = [
  "Upload your room photo",
  "AI detects walls & damage",
  "Choose paint colors",
  "See realistic preview",
];

export function VisualizerSection() {
  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm font-semibold text-accent uppercase tracking-wider">
              AI Visualizer
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-6">
              See Your Colors
              <br />
              <span className="text-accent">Before You Paint</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Upload a photo of your room and watch our AI transform it with any paint color. 
              Detect wall damage, compare shades, and make confident color choices.
            </p>

            {/* Steps */}
            <div className="space-y-4 mb-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <Check className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-foreground font-medium">{step}</span>
                </motion.div>
              ))}
            </div>

            <Button variant="accent" size="lg" asChild>
              <Link to="/visualizer" className="gap-2">
                <Upload className="w-4 h-4" />
                Try It Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>

          {/* Visual Demo */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              {/* Room Preview Mock */}
              <div className="absolute inset-0 bg-gradient-to-br from-muted to-secondary" />
              
              {/* Mock Room Elements */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full">
                  {/* Wall */}
                  <div className="absolute inset-x-0 top-0 bottom-1/3 bg-gradient-to-b from-[#e8e4de] to-[#d4d0ca]" />
                  
                  {/* Floor */}
                  <div className="absolute inset-x-0 bottom-0 top-2/3 bg-gradient-to-b from-[#8b7355] to-[#6b5344]" />
                  
                  {/* Window */}
                  <div className="absolute top-8 right-8 w-24 h-32 bg-info/20 border-4 border-[#c4b8a8] rounded-t-lg">
                    <div className="absolute inset-2 bg-gradient-to-b from-info/30 to-info/10" />
                  </div>

                  {/* Furniture Silhouette */}
                  <div className="absolute bottom-1/3 left-8 w-40 h-20 bg-[#5c4a3a] rounded-t-lg" />
                  <div className="absolute bottom-1/3 right-12 w-20 h-28 bg-[#4a3a2a] rounded-t-lg" />
                </div>
              </div>

              {/* Color Overlay Effect */}
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "50%" }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 1 }}
                className="absolute inset-y-0 left-0 overflow-hidden"
              >
                <div className="absolute inset-0">
                  {/* Painted Wall */}
                  <div className="absolute inset-x-0 top-0 bottom-1/3 bg-gradient-to-b from-[#5b9aa9] to-[#4a8999]" />
                  <div className="absolute inset-x-0 bottom-0 top-2/3 bg-gradient-to-b from-[#8b7355] to-[#6b5344]" />
                </div>
              </motion.div>

              {/* Split Line */}
              <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-background/50 backdrop-blur-sm" />

              {/* Labels */}
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-sm text-sm font-medium">
                Before
              </div>
              <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium">
                After
              </div>
            </div>

            {/* Color Selector Mock */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-background rounded-2xl shadow-xl p-4 flex items-center gap-3"
            >
              <span className="text-sm font-medium text-muted-foreground">Selected:</span>
              <div className="w-8 h-8 rounded-lg bg-[#5b9aa9] shadow-inner" />
              <div className="text-sm">
                <div className="font-semibold text-foreground">Ocean Mist</div>
                <div className="text-muted-foreground">#5B9AA9</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
