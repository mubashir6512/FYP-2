import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { ProductsSection } from "@/components/landing/ProductsSection";
import { VisualizerSection } from "@/components/landing/VisualizerSection";
import { PaintersSection } from "@/components/landing/PaintersSection";
import { DealersSection } from "@/components/landing/DealersSection";
import { CTASection } from "@/components/landing/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <VisualizerSection />
        <ProductsSection />
        <PaintersSection />
        <DealersSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
