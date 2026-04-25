import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="pt-32 pb-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl mx-auto"
                    >
                        <span className="text-sm font-semibold text-accent uppercase tracking-wider">Our Story</span>
                        <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mt-4 mb-8">
                            Revolutionizing the World of <span className="text-accent">Colors</span>
                        </h1>

                        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-muted-foreground">
                            <p>
                                PaintVerse was born from a simple yet powerful idea: making the process of choosing and applying paint as seamless as clicking a button. We believe that your space is a canvas, and colors are the emotions that bring it to life.
                            </p>

                            <div className="grid md:grid-cols-2 gap-8 py-12">
                                <div className="bg-secondary/30 p-8 rounded-3xl border border-border/50">
                                    <h3 className="text-xl font-semibold text-foreground mb-4">Our Mission</h3>
                                    <p>To empower homeowners and professionals with cutting-edge AI tools and a transparent ecosystem for all painting needs.</p>
                                </div>
                                <div className="bg-secondary/30 p-8 rounded-3xl border border-border/50">
                                    <h3 className="text-xl font-semibold text-foreground mb-4">Our Vision</h3>
                                    <p>To become the global standard for digital paint solutions, bridging the gap between imagination and reality.</p>
                                </div>
                            </div>

                            <h2 className="text-3xl font-bold text-foreground mt-12 mb-6 text-center">Why Choose PaintVerse?</h2>
                            <div className="grid sm:grid-cols-3 gap-6">
                                {[
                                    { title: "AI Visualizer", desc: "See your room in any color instantly with 99% accuracy." },
                                    { title: "Verified Pros", desc: "Connect with the best painters in your locality." },
                                    { title: "Premium Quality", desc: "Curated selection of the world's finest paint brands." }
                                ].map((item, i) => (
                                    <div key={i} className="text-center p-6 border border-border/30 rounded-2xl">
                                        <h4 className="font-bold text-foreground mb-2">{item.title}</h4>
                                        <p className="text-sm">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
