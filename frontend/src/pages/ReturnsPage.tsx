import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { RefreshCcw, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function ReturnsPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="pt-32 pb-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="text-sm font-semibold text-accent uppercase tracking-wider">Policies</span>
                        <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mt-4 mb-8">
                            Returns & <span className="text-accent">Refunds</span>
                        </h1>

                        <div className="bg-secondary/30 border border-border p-8 rounded-3xl mb-12">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-background rounded-full shadow-sm">
                                    <RefreshCcw className="w-6 h-6 text-accent" />
                                </div>
                                <h2 className="text-2xl font-bold">30-Day Return Policy</h2>
                            </div>
                            <p className="text-muted-foreground text-lg">
                                We want you to be completely satisfied with your purchase. If you are not entirely happy, 
                                you have 30 calendar days to return an item from the date you received it.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 mb-12">
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" /> Eligible for Return
                                </h3>
                                <ul className="space-y-3 text-muted-foreground">
                                    <li className="flex gap-2"><span className="text-accent">•</span> Unopened paint cans</li>
                                    <li className="flex gap-2"><span className="text-accent">•</span> Unused painting tools and accessories</li>
                                    <li className="flex gap-2"><span className="text-accent">•</span> Items in original packaging with receipt</li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-red-500" /> Non-Returnable Items
                                </h3>
                                <ul className="space-y-3 text-muted-foreground">
                                    <li className="flex gap-2"><span className="text-accent">•</span> Custom tinted or mixed paints</li>
                                    <li className="flex gap-2"><span className="text-accent">•</span> Opened or partially used products</li>
                                    <li className="flex gap-2"><span className="text-accent">•</span> Items marked as Final Sale</li>
                                </ul>
                            </div>
                        </div>

                        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-muted-foreground">
                            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">How to Initiate a Return</h2>
                            <ol className="list-decimal pl-6 space-y-2">
                                <li>Log into your account and navigate to "Order History".</li>
                                <li>Select the order containing the item you wish to return.</li>
                                <li>Click on the "Request Return" button and follow the instructions.</li>
                                <li>Print the provided return shipping label.</li>
                                <li>Securely pack the item and drop it off at the designated carrier location.</li>
                            </ol>

                            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Refunds</h2>
                            <p>
                                Once we receive your item, we will inspect it and notify you that we have received your returned item. 
                                We will immediately notify you on the status of your refund after inspecting the item.
                            </p>
                            <p>
                                If your return is approved, we will initiate a refund to your credit card (or original method of payment). 
                                You will receive the credit within a certain amount of days, depending on your card issuer's policies.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
