import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Truck, Clock, Globe, ShieldCheck } from "lucide-react";

export default function ShippingInfoPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="pt-32 pb-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="text-sm font-semibold text-accent uppercase tracking-wider">Logistics</span>
                        <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mt-4 mb-8">
                            Shipping <span className="text-accent">Information</span>
                        </h1>

                        <div className="grid sm:grid-cols-2 gap-6 mb-12">
                            {[
                                { icon: Truck, title: "Standard Delivery", desc: "3-5 business days" },
                                { icon: Clock, title: "Express Shipping", desc: "Next business day" },
                                { icon: Globe, title: "Nationwide Coverage", desc: "All major cities" },
                                { icon: ShieldCheck, title: "Secure Packaging", desc: "Damage-free guarantee" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-4 p-6 bg-secondary/20 rounded-2xl border border-border/50">
                                    <div className="p-3 bg-accent/10 rounded-xl">
                                        <item.icon className="w-6 h-6 text-accent" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">{item.title}</h3>
                                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-muted-foreground">
                            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Processing Time</h2>
                            <p>
                                All orders are processed within 1-2 business days. Orders are not shipped or delivered on weekends or holidays. 
                                If we are experiencing a high volume of orders, shipments may be delayed by a few days. Please allow additional days in transit for delivery.
                            </p>

                            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Shipping Rates & Delivery Estimates</h2>
                            <p>
                                Shipping charges for your order will be calculated and displayed at checkout. We offer flat-rate shipping for standard delivery and expedited options for urgent requirements.
                            </p>

                            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Shipment Confirmation & Order Tracking</h2>
                            <p>
                                You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s). 
                                The tracking number will be active within 24 hours.
                            </p>

                            <div className="bg-accent/10 p-6 rounded-2xl border border-accent/20 mt-8">
                                <h3 className="text-xl font-semibold text-foreground mb-2">Damages</h3>
                                <p className="text-base m-0">
                                    PaintVerse is not liable for any products damaged or lost during shipping. If you received your order damaged, 
                                    please contact the shipment carrier to file a claim. Please save all packaging materials and damaged goods before filing a claim.
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
