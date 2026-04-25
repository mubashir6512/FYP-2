import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PaintersSection } from "@/components/landing/PaintersSection";

export default function PaintersPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-12">
          <h1 className="font-display text-4xl font-bold text-foreground mb-4">Find Professional Painters</h1>
          <p className="text-muted-foreground mb-8">Connect with verified painters in your area.</p>
        </div>
        <PaintersSection />
      </main>
      <Footer />
    </div>
  );
}
