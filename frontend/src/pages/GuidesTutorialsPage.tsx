import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { PlayCircle, Image, Palette, ShoppingCart } from "lucide-react";

export default function GuidesTutorialsPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="pt-32 pb-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="text-sm font-semibold text-accent uppercase tracking-wider">Help Center</span>
                        <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mt-4 mb-8">
                            Guides & Tutorials
                        </h1>
                        <p className="text-xl text-muted-foreground mb-12">
                            Master every feature of PaintVerse with our comprehensive guides.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-6 mb-12">
                            {[
                                { icon: Image, title: "Using the AI Visualizer", desc: "Learn how to upload photos and apply colors realistically." },
                                { icon: Palette, title: "Color Matching 101", desc: "Tips for finding the perfect shade for your lighting." },
                                { icon: ShoppingCart, title: "Ordering Process", desc: "A step-by-step guide to placing and tracking your order." },
                                { icon: PlayCircle, title: "Painter Dashboard", desc: "Video tutorial for professionals managing their jobs." }
                            ].map((item, i) => (
                                <div key={i} className="bg-secondary/20 p-6 rounded-2xl border border-border hover:bg-secondary/30 transition-colors cursor-pointer group">
                                    <item.icon className="w-8 h-8 text-accent mb-4" />
                                    <h3 className="text-lg font-bold mb-2 group-hover:text-accent transition-colors">{item.title}</h3>
                                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground border-t border-border pt-12">
                            <h2 className="text-2xl font-bold text-foreground mb-4">Popular Article: Preparing Your Walls for Paint</h2>
                            <p>
                                The secret to a perfect paint job lies in the preparation. Even the most expensive paint won't look good or last long if it's applied over a poorly prepared surface.
                            </p>
                            
                            <h3 className="text-xl font-bold text-foreground mt-6 mb-3">1. Clean the Surface</h3>
                            <p>
                                Wash the walls with a sponge and warm water. For kitchens or areas with grease, use a mild detergent. Make sure the walls are completely dry before proceeding.
                            </p>

                            <h3 className="text-xl font-bold text-foreground mt-6 mb-3">2. Patch Holes and Cracks</h3>
                            <p>
                                Use spackle or drywall compound to fill any nail holes, dents, or cracks. Once dry, sand the patched areas smooth until they are flush with the surrounding wall.
                            </p>

                            <h3 className="text-xl font-bold text-foreground mt-6 mb-3">3. Tape and Protect</h3>
                            <p>
                                Apply painter's tape to baseboards, trim, window frames, and door frames. Lay down drop cloths to protect your floors and furniture from accidental drips or spills.
                            </p>

                            <div className="mt-8 p-6 bg-accent/10 rounded-xl border border-accent/20">
                                <p className="m-0 text-foreground font-medium text-center">
                                    Need professional help? Head over to our <a href="/painters" className="text-accent hover:underline">Painters Directory</a> to hire an expert!
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
