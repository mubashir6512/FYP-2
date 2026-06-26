import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="pt-32 pb-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="text-sm font-semibold text-accent uppercase tracking-wider">Legal</span>
                        <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mt-4 mb-2">
                            Privacy Policy
                        </h1>
                        <p className="text-muted-foreground mb-12">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

                        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8 text-muted-foreground">
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">1. Introduction</h2>
                                <p>
                                    Welcome to PaintVerse. We respect your privacy and are committed to protecting your personal data. 
                                    This privacy policy will inform you as to how we look after your personal data when you visit our website 
                                    (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">2. The Data We Collect About You</h2>
                                <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
                                <ul className="list-disc pl-6 space-y-2 mt-4">
                                    <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
                                    <li><strong>Contact Data</strong> includes billing address, delivery address, email address and telephone numbers.</li>
                                    <li><strong>Financial Data</strong> includes payment card details (processed securely via our payment providers).</li>
                                    <li><strong>Transaction Data</strong> includes details about payments to and from you and other details of products and services you have purchased from us.</li>
                                    <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location.</li>
                                    <li><strong>Usage Data</strong> includes information about how you use our website, products and services.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">3. How We Use Your Personal Data</h2>
                                <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                                <ul className="list-disc pl-6 space-y-2 mt-4">
                                    <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                                    <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                                    <li>Where we need to comply with a legal or regulatory obligation.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">4. Data Security</h2>
                                <p>
                                    We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. 
                                    In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know. 
                                    They will only process your personal data on our instructions and they are subject to a duty of confidentiality.
                                </p>
                            </section>

                            <section className="bg-secondary/30 p-8 rounded-3xl border border-border mt-12">
                                <h2 className="text-2xl font-bold text-foreground mb-4">5. Contact Us</h2>
                                <p>
                                    If you have any questions about this privacy policy or our privacy practices, please contact us at:
                                    <br /><br />
                                    <strong>Email:</strong> privacy@paintverse.com<br />
                                    <strong>Address:</strong> DHA Phase 5, Karachi, Pakistan
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
