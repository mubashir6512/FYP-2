import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageIcon, Home, Building2 } from "lucide-react";

export type VisualizerMode = "single" | "interior" | "exterior";

interface ModeTabsProps {
  mode: VisualizerMode;
  onChange: (mode: VisualizerMode) => void;
}

export function ModeTabs({ mode, onChange }: ModeTabsProps) {
  return (
    <div className="flex justify-center mb-8">
      <Tabs value={mode} onValueChange={(v) => onChange(v as VisualizerMode)}>
        <TabsList className="grid grid-cols-3 w-full max-w-xl">
          <TabsTrigger value="single" className="gap-2">
            <ImageIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Single Photo</span>
            <span className="sm:hidden">Photo</span>
          </TabsTrigger>
          <TabsTrigger value="interior" className="gap-2">
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Interior Room</span>
            <span className="sm:hidden">Interior</span>
          </TabsTrigger>
          <TabsTrigger value="exterior" className="gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Building Exterior</span>
            <span className="sm:hidden">Exterior</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
