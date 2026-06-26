import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";

export default function GettingStartedPage() {
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
                            Getting Started with PaintVerse
                        </h1>

                        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8 text-muted-foreground">
                            <section className="bg-secondary/20 p-8 rounded-3xl border border-border">
                                <h2 className="text-2xl font-bold text-foreground mb-4 mt-0">Welcome!</h2>
                                <p>
                                    Welcome to PaintVerse! Whether you're a homeowner looking to refresh your living room, or a professional painter seeking a reliable platform to connect with clients, you've come to the right place.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">For Homeowners (Customers)</h2>
                                <ol className="list-decimal pl-6 space-y-4">
                                    <li>
                                        <strong>Create an Account:</strong> Sign up to save your favorite paint colors, create wishlists, and manage your orders.
                                    </li>
                                    <li>
                                        <strong>Try the AI Visualizer:</strong> Upload a photo of your room and experiment with hundreds of paint colors instantly. It's the perfect way to "try before you buy".
                                    </li>
                                    <li>
                                        <strong>Shop Products:</strong> Browse our extensive catalog of high-quality paints, primers, and painting accessories from top dealers.
                                    </li>
                                    <li>
                                        <strong>Hire a Pro:</strong> Need help painting? Browse our directory of verified professional painters, read their reviews, and book them directly through the platform.
                                    </li>
                                </ol>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">For Painters</h2>
                                <ol className="list-decimal pl-6 space-y-4">
                                    <li>
                                        <strong>Set up your Profile:</strong> Create a professional profile showcasing your experience, hourly rate, and portfolio of previous work.
                                    </li>
                                    <li>
                                        <strong>Get Bookings:</strong> Receive job requests directly from customers in your area. Accept or decline jobs based on your availability.
                                    </li>
                                    <li>
                                        <strong>Build your Reputation:</strong> Complete jobs successfully and collect 5-star reviews to rank higher in our directory.
                                    </li>
                                </ol>
                            </section>
                            
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">For Paint Dealers</h2>
                                <p>
                                    PaintVerse provides a powerful Point of Sale (POS) and inventory management system for your store. Register as a dealer to start listing your products on our marketplace and managing your local sales all in one place.
                                </p>
                            </section>
                        </div>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
