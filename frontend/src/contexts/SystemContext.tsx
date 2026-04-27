import React, { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Hammer } from "lucide-react";

interface SystemSettings {
  platformName: string;
  maintenance: boolean;
  features: {
    aiVisualizer: boolean;
    painterBooking: boolean;
    dealerPOS: boolean;
    customerWishlist: boolean;
    analytics: boolean;
  };
  [key: string]: any;
}

interface SystemContextType {
  settings: SystemSettings | undefined;
  isLoading: boolean;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export function SystemProvider({ children }: { children: ReactNode }) {
  const { role } = useAuth();
  
  const { data: settings, isLoading } = useQuery({
    queryKey: ["system-settings"],
    queryFn: () => api("/system"),
    refetchInterval: 60000, // Refetch every minute
  });

  // If maintenance mode is on and user is not an admin, show maintenance page
  if (!isLoading && settings?.maintenance && role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-4">
        <div className="w-20 h-20 bg-warning/10 text-warning rounded-2xl flex items-center justify-center mb-6">
          <Hammer className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Under Maintenance</h1>
        <p className="text-muted-foreground max-w-md mb-8">
          {settings.platformName || "PaintVerse"} is currently undergoing scheduled maintenance to improve our services. 
          We'll be back online shortly. Thank you for your patience!
        </p>
        <div className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {settings.platformName || "PaintVerse"} Platform
        </div>
      </div>
    );
  }

  return (
    <SystemContext.Provider value={{ settings, isLoading }}>
      {children}
    </SystemContext.Provider>
  );
}

export function useSystem() {
  const context = useContext(SystemContext);
  if (context === undefined) {
    throw new Error("useSystem must be used within a SystemProvider");
  }
  return context;
}
