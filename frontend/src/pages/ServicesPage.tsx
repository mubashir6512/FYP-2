import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
    Zap,
    Paintbrush,
    ShoppingBag,
    BarChart3,
    Camera,
    CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const services = [
    {
        title: "AI Room Visualizer",
        description: "Upload a photo of your room and see it transformed instantly with any color from our catalog.",
        icon: Camera,
        color: "bg-blue-500/10 text-blue-500",
        link: "/visualizer"
    },
    {
        title: "Professional Painter Network",
        description: "Get matched with verified, top-rated professional painters in your area for error-free execution.",
        icon: Paintbrush,
        color: "bg-orange-500/10 text-orange-500",
        link: "/painters"
    },
    {
        title: "Dealer Procurement",
        description: "Streamlined inventory management and POS solutions for paint retailers and wholesalers.",
        icon: ShoppingBag,
        color: "bg-green-500/10 text-green-500",
        link: "/register?role=dealer"
    },
    {
        title: "Color Analytics",
        description: "Advanced reporting and trend analysis for business owners to optimize their inventory.",
        icon: BarChart3,
        color: "bg-purple-500/10 text-purple-500",
        link: "/dealer/analytics"
    },
    {
        title: "AI Finish Recommendations",
        description: "Our AI suggests the best paint finish (Matte, Satin, Gloss) based on your room's lighting.",
        icon: Zap,
        color: "bg-yellow-500/10 text-yellow-500",
        link: "/visualizer"
    },
    {
        title: "Quality Assurance",
        description: "We partner only with premium brands and verified professionals to ensure maximum satisfaction.",
        icon: CheckCircle2,
        color: "bg-red-500/10 text-red-500",
        link: "/products"
    }
];

export default function ServicesPage() {
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
                        <span className="text-sm font-semibold text-accent uppercase tracking-wider">What We Offer</span>
                        <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mt-4 mb-6">
                            Our Professional <span className="text-accent">Services</span>
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            From high-tech visualization to on-ground execution, we provide an end-to-end ecosystem for all your painting needs.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((service, index) => (
                            <motion.div
                                key={service.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card variant="interactive" className="h-full">
                                    <CardContent className="p-8">
                                        <div className={`w-14 h-14 rounded-2xl ${service.color} flex items-center justify-center mb-6`}>
                                            <service.icon className="w-7 h-7" />
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground mb-4">{service.title}</h3>
                                        <p className="text-muted-foreground mb-8 line-clamp-3">
                                            {service.description}
                                        </p>
                                        <Button variant="outline" size="sm" asChild className="w-full">
                                            <Link to={service.link}>Learn More</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-20 p-12 rounded-[3rem] bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 border border-primary/20 text-center"
                    >
                        <h2 className="text-3xl font-bold text-foreground mb-4">Ready to start your project?</h2>
                        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                            Join thousands of happy homeowners and professionals using PaintVerse to transform their spaces.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button size="lg" variant="accent" asChild>
                                <Link to="/register">Get Started Free</Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <Link to="/contact">Talk to an Expert</Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
