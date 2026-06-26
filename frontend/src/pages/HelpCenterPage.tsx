import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Search, Book, MessageCircle, FileText, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HelpCenterPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="pt-32 pb-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <span className="text-sm font-semibold text-accent uppercase tracking-wider">Support</span>
                        <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mt-4 mb-6">
                            How can we help you?
                        </h1>
                        <div className="max-w-2xl mx-auto relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                            <input 
                                type="text" 
                                placeholder="Search for articles, guides, or FAQs..." 
                                className="w-full pl-12 pr-4 py-4 rounded-full border border-border/50 bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent focus:bg-background transition-all"
                            />
                        </div>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6 mb-16">
                        {[
                            { icon: Book, title: "Getting Started", desc: "Learn the basics of PaintVerse" },
                            { icon: MessageCircle, title: "Contact Support", desc: "Get in touch with our team" },
                            { icon: FileText, title: "Guides & Tutorials", desc: "Deep dive into our features" }
                        ].map((item, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-secondary/20 p-8 rounded-3xl border border-border/50 hover:bg-secondary/40 transition-colors cursor-pointer group"
                            >
                                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <item.icon className="w-6 h-6 text-accent" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                                <p className="text-muted-foreground mb-4">{item.desc}</p>
                                <div className="flex items-center text-accent font-medium text-sm">
                                    Read more <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="bg-primary text-primary-foreground rounded-3xl p-8 sm:p-12 text-center">
                        <h2 className="text-3xl font-bold mb-4">Still need help?</h2>
                        <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                            Our support team is available 24/7 to assist you with any questions or issues you might have.
                        </p>
                        <Button variant="secondary" size="lg" className="rounded-full px-8">
                            Contact Us Now
                        </Button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
