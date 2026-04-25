import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success("Message sent successfully! We'll get back to you soon.");
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="pt-32 pb-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-3xl mx-auto mb-16"
                    >
                        <span className="text-sm font-semibold text-accent uppercase tracking-wider">Get in Touch</span>
                        <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mt-4 mb-6">
                            Contact <span className="text-accent">Us</span>
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Have questions about our products or services? Our team is here to help you bring your vision to life.
                        </p>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground">Email Us</h3>
                                    <p className="text-muted-foreground">support@paintverse.com</p>
                                    <p className="text-muted-foreground">business@paintverse.com</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground">Call Us</h3>
                                    <p className="text-muted-foreground">+92 300 1234567</p>
                                    <p className="text-muted-foreground">+92 321 9876543</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground">Visit Us</h3>
                                    <p className="text-muted-foreground">Plot 123, DHA Phase 5</p>
                                    <p className="text-muted-foreground">Karachi, Sindh 75500</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-secondary/20 p-8 rounded-3xl border border-border/50 shadow-xl"
                        >
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Full Name</label>
                                        <Input placeholder="John Doe" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Email Address</label>
                                        <Input type="email" placeholder="john@example.com" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Subject</label>
                                    <Input placeholder="How can we help?" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Message</label>
                                    <Textarea placeholder="Tell us more about your project..." className="min-h-[150px]" required />
                                </div>
                                <Button type="submit" variant="accent" className="w-full gap-2">
                                    Send Message <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
