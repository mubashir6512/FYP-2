import { useRef, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X, Loader2, ImagePlus } from "lucide-react";
import type { VisualizerMode } from "./ModeTabs";

export type SideKey = "front" | "back" | "left" | "right";

export interface SideImage {
  side: SideKey;
  previewUrl: string;
  publicUrl: string;
}

interface MultiSideUploaderProps {
  mode: Exclude<VisualizerMode, "single">;
  sides: Partial<Record<SideKey, SideImage>>;
  onChange: (sides: Partial<Record<SideKey, SideImage>>) => void;
}

const SIDE_LABELS: Record<SideKey, { interior: string; exterior: string; required?: boolean }> = {
  front: { interior: "Front Wall", exterior: "Front Facade", required: true },
  back: { interior: "Back Wall", exterior: "Back Facade" },
  left: { interior: "Left Wall", exterior: "Left Facade" },
  right: { interior: "Right Wall", exterior: "Right Facade" },
};

const ORDER: SideKey[] = ["front", "back", "left", "right"];

export function MultiSideUploader({ mode, sides, onChange }: MultiSideUploaderProps) {
  const sessionIdRef = useRef<string>(crypto.randomUUID());
  const [uploading, setUploading] = useState<SideKey | null>(null);
  const inputRefs = useRef<Record<SideKey, HTMLInputElement | null>>({
    front: null, back: null, left: null, right: null,
  });

  const uploadFile = useCallback(
    async (side: SideKey, file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image must be under 10MB");
        return;
      }

      setUploading(side);
      const ext = file.name.split(".").pop() || "jpg";
      const path = `multi/${sessionIdRef.current}/${side}.${ext}`;

      const { error } = await supabase.storage
        .from("room-images")
        .upload(path, file, { upsert: true });

      if (error) {
        toast.error("Upload failed: " + error.message);
        setUploading(null);
        return;
      }

      const { data } = supabase.storage.from("room-images").getPublicUrl(path);

      const reader = new FileReader();
      reader.onload = (e) => {
        onChange({
          ...sides,
          [side]: {
            side,
            previewUrl: (e.target?.result as string) || data.publicUrl,
            publicUrl: data.publicUrl,
          },
        });
        setUploading(null);
      };
      reader.readAsDataURL(file);
    },
    [sides, onChange]
  );

  const removeSide = (side: SideKey) => {
    const next = { ...sides };
    delete next[side];
    onChange(next);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {ORDER.map((side) => {
        const label = mode === "exterior" ? SIDE_LABELS[side].exterior : SIDE_LABELS[side].interior;
        const required = SIDE_LABELS[side].required;
        const item = sides[side];
        const isUploading = uploading === side;

        return (
          <Card
            key={side}
            className="relative aspect-square overflow-hidden group cursor-pointer hover:border-accent/50 transition-all"
            onClick={() => !isUploading && !item && inputRefs.current[side]?.click()}
          >
            {item ? (
              <>
                <img src={item.previewUrl} alt={label} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSide(side);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/90 text-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground"
                  aria-label={`Remove ${label}`}
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRefs.current[side]?.click();
                  }}
                  className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-background/90 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Replace
                </button>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/30 hover:bg-muted/50 border-2 border-dashed border-border">
                {isUploading ? (
                  <Loader2 className="w-6 h-6 text-accent animate-spin" />
                ) : (
                  <ImagePlus className="w-6 h-6 text-muted-foreground mb-1" />
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {isUploading ? "Uploading…" : "Click to upload"}
                </p>
              </div>
            )}
            <div className="absolute top-2 left-2 flex items-center gap-1.5">
              <Badge variant={item ? "default" : "secondary"} className="text-[10px]">
                {label}
              </Badge>
              {required && !item && (
                <Badge variant="destructive" className="text-[10px]">Required</Badge>
              )}
            </div>
            <input
              ref={(el) => (inputRefs.current[side] = el)}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadFile(side, f);
                e.target.value = "";
              }}
            />
          </Card>
        );
      })}
    </div>
  );
}
