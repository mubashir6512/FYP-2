import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Download, AlertCircle } from "lucide-react";

export interface SideResult {
  side: string;
  originalUrl: string;
  paintedUrl?: string;
  error?: string;
}

interface SideGalleryProps {
  results: SideResult[];
  colorName: string;
}

function BeforeAfter({ before, after }: { before: string; after: string }) {
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const move = (clientX: number) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPos((x / rect.width) * 100);
  };

  return (
    <div
      ref={ref}
      className="relative aspect-[4/3] rounded-xl overflow-hidden cursor-col-resize select-none bg-muted"
      onMouseMove={(e) => dragging && move(e.clientX)}
      onMouseDown={(e) => { setDragging(true); move(e.clientX); }}
      onMouseUp={() => setDragging(false)}
      onMouseLeave={() => setDragging(false)}
      onTouchMove={(e) => move(e.touches[0].clientX)}
      onTouchStart={(e) => move(e.touches[0].clientX)}
    >
      <img src={after} alt="After" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img
          src={before}
          alt="Before"
          className="absolute inset-0 h-full object-cover"
          style={{ width: ref.current ? `${ref.current.offsetWidth}px` : "100%" }}
          draggable={false}
        />
      </div>
      <div className="absolute top-0 bottom-0 w-1 bg-background/80 backdrop-blur-sm" style={{ left: `${pos}%` }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background shadow-xl flex items-center justify-center">
          <div className="flex gap-0.5">
            <div className="w-0.5 h-4 bg-muted-foreground rounded" />
            <div className="w-0.5 h-4 bg-muted-foreground rounded" />
          </div>
        </div>
      </div>
      <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-background/90 text-xs font-medium">Before</div>
      <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium">After</div>
    </div>
  );
}

export function SideGallery({ results, colorName }: SideGalleryProps) {
  const downloadOne = (url: string, side: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `paintverse-${side}-${colorName.toLowerCase().replace(/\s/g, "-")}.png`;
    a.target = "_blank";
    a.click();
  };

  const downloadAll = async () => {
    for (const r of results) {
      if (r.paintedUrl) {
        downloadOne(r.paintedUrl, r.side);
        await new Promise((res) => setTimeout(res, 400));
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{results.length} side{results.length === 1 ? "" : "s"} repainted</p>
        <Button variant="outline" size="sm" onClick={downloadAll}>
          <Download className="w-4 h-4 mr-2" />
          Download all
        </Button>
      </div>
      <Carousel className="w-full">
        <CarouselContent>
          {results.map((r) => (
            <CarouselItem key={r.side}>
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="default" className="capitalize">{r.side}</Badge>
                  {r.paintedUrl && (
                    <Button variant="ghost" size="sm" onClick={() => downloadOne(r.paintedUrl!, r.side)}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
                {r.error || !r.paintedUrl ? (
                  <div className="aspect-[4/3] rounded-xl bg-muted flex flex-col items-center justify-center text-center p-6">
                    <AlertCircle className="w-8 h-8 text-destructive mb-2" />
                    <p className="font-medium text-foreground">Repaint failed for this side</p>
                    <p className="text-sm text-muted-foreground mt-1">{r.error || "No image returned"}</p>
                  </div>
                ) : (
                  <BeforeAfter before={r.originalUrl} after={r.paintedUrl} />
                )}
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        {results.length > 1 && (
          <>
            <CarouselPrevious />
            <CarouselNext />
          </>
        )}
      </Carousel>
    </div>
  );
}
