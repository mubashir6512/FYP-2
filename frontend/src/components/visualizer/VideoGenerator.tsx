import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Loader2, Play, Pause, Download, Film, RotateCw } from "lucide-react";
import { toast } from "sonner";
import type { SideResult } from "./SideGallery";

interface VideoGeneratorProps {
  results: SideResult[];
  colorName: string;
  colorHex: string;
  mode: "interior" | "exterior";
}

const SIDE_ORDER = ["front", "right", "back", "left"] as const;
const W = 1280;
const H = 720;
const FPS = 30;

/** Load and cache HTMLImageElement (CORS-safe). */
async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** Ordered painted frames (front, right, back, left) that actually exist. */
function orderedFrames(results: SideResult[]) {
  return SIDE_ORDER
    .map((side) => results.find((r) => r.side === side && r.paintedUrl))
    .filter(Boolean) as SideResult[];
}

/** Draw one frame with Ken Burns pan/zoom + optional crossfade to next. */
function drawFrame(
  ctx: CanvasRenderingContext2D,
  imgA: HTMLImageElement,
  imgB: HTMLImageElement | null,
  t: number,           // 0..1 within this shot
  fade: number,        // 0..1 crossfade to imgB
  colorHex: string,
  label: string
) {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);

  const drawCovered = (img: HTMLImageElement, zoom: number, panX: number, alpha: number) => {
    const scale = Math.max(W / img.width, H / img.height) * zoom;
    const dw = img.width * scale;
    const dh = img.height * scale;
    const dx = (W - dw) / 2 + panX;
    const dy = (H - dh) / 2;
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.globalAlpha = 1;
  };

  // Ken Burns: slow zoom-in + slight horizontal drift
  const zoomA = 1.05 + t * 0.12;
  const panA = (t - 0.5) * 80;
  drawCovered(imgA, zoomA, panA, 1 - fade);

  if (imgB && fade > 0) {
    const zoomB = 1.02 + fade * 0.05;
    drawCovered(imgB, zoomB, 0, fade);
  }

  // Vignette
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.75);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Lower-left color chip + labels
  const chipX = 40, chipY = H - 100, chipS = 60;
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(chipX - 12, chipY - 12, 360, 84);
  ctx.fillStyle = colorHex;
  ctx.fillRect(chipX, chipY, chipS, chipS);
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = 2;
  ctx.strokeRect(chipX, chipY, chipS, chipS);

  ctx.fillStyle = "#fff";
  ctx.font = "600 22px system-ui, -apple-system, sans-serif";
  ctx.fillText(label, chipX + chipS + 16, chipY + 26);
  ctx.font = "400 16px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText(colorHex.toUpperCase(), chipX + chipS + 16, chipY + 52);
}

function pickMimeType(): string {
  const candidates = [
    "video/mp4;codecs=avc1.42E01E",
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  for (const t of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) return t;
  }
  return "video/webm";
}

export default function VideoGenerator({ results, colorName, colorHex, mode }: VideoGeneratorProps) {
  const frames = orderedFrames(results);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRafRef = useRef<number | null>(null);
  const previewStartRef = useRef<number>(0);
  const imagesRef = useRef<HTMLImageElement[]>([]);

  const [imagesReady, setImagesReady] = useState(false);
  const [shotSec, setShotSec] = useState(3);       // per side
  const [fadeSec, setFadeSec] = useState(0.8);     // crossfade
  const [previewing, setPreviewing] = useState(false);
  const [recording, setRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoExt, setVideoExt] = useState<"mp4" | "webm">("webm");

  // Preload painted images
  useEffect(() => {
    let cancelled = false;
    setImagesReady(false);
    (async () => {
      try {
        const imgs = await Promise.all(frames.map((f) => loadImage(f.paintedUrl!)));
        if (!cancelled) {
          imagesRef.current = imgs;
          setImagesReady(true);
          renderStill(0);
        }
      } catch (e) {
        toast.error("Could not load painted images for video");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results.map((r) => r.paintedUrl).join("|")]);

  useEffect(() => () => {
    if (previewRafRef.current) cancelAnimationFrame(previewRafRef.current);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
  }, [videoUrl]);

  const totalSec = Math.max(1, frames.length * shotSec);
  const totalFrames = Math.round(totalSec * FPS);

  function renderStill(globalT: number) {
    const canvas = canvasRef.current;
    if (!canvas || imagesRef.current.length === 0) return;
    const ctx = canvas.getContext("2d")!;
    const n = imagesRef.current.length;
    const shot = Math.min(n - 1, Math.floor(globalT / shotSec));
    const localT = (globalT - shot * shotSec) / shotSec;
    const timeLeft = shotSec - (globalT - shot * shotSec);
    const fade = shot < n - 1 && timeLeft < fadeSec ? 1 - timeLeft / fadeSec : 0;
    const imgA = imagesRef.current[shot];
    const imgB = shot < n - 1 ? imagesRef.current[shot + 1] : null;
    const label = `${mode === "exterior" ? "Facade" : "Wall"} · ${frames[shot].side.toUpperCase()} · ${colorName}`;
    drawFrame(ctx, imgA, imgB, localT, fade, colorHex, label);
  }

  function tickPreview(ts: number) {
    if (!previewStartRef.current) previewStartRef.current = ts;
    const elapsed = (ts - previewStartRef.current) / 1000;
    if (elapsed >= totalSec) {
      previewStartRef.current = 0;
      setPreviewing(false);
      renderStill(0);
      return;
    }
    renderStill(elapsed);
    previewRafRef.current = requestAnimationFrame(tickPreview);
  }

  function togglePreview() {
    if (previewing) {
      if (previewRafRef.current) cancelAnimationFrame(previewRafRef.current);
      previewRafRef.current = null;
      previewStartRef.current = 0;
      setPreviewing(false);
      renderStill(0);
    } else {
      setPreviewing(true);
      previewStartRef.current = 0;
      previewRafRef.current = requestAnimationFrame(tickPreview);
    }
  }

  async function generateVideo() {
    const canvas = canvasRef.current;
    if (!canvas || imagesRef.current.length === 0) return;
    if (typeof MediaRecorder === "undefined" || !(canvas as any).captureStream) {
      toast.error("Video recording is not supported in this browser");
      return;
    }
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
    setRecording(true);
    setProgress(0);

    const mime = pickMimeType();
    setVideoExt(mime.startsWith("video/mp4") ? "mp4" : "webm");
    const stream = (canvas as any).captureStream(FPS) as MediaStream;
    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6_000_000 });
    recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);

    const done = new Promise<Blob>((resolve) => {
      recorder.onstop = () => resolve(new Blob(chunks, { type: mime }));
    });

    recorder.start();

    // Render deterministically, frame by frame, giving the recorder real time.
    const frameMs = 1000 / FPS;
    for (let i = 0; i < totalFrames; i++) {
      const t = i / FPS;
      renderStill(t);
      setProgress(Math.round(((i + 1) / totalFrames) * 100));
      // Yield to allow captureStream to sample the frame.
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, frameMs));
    }

    recorder.stop();
    const blob = await done;
    const url = URL.createObjectURL(blob);
    setVideoUrl(url);
    setRecording(false);
    toast.success("Walkthrough video ready");
  }

  function downloadVideo() {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `paintverse-walkthrough-${colorName.replace(/\s+/g, "-").toLowerCase()}.${videoExt}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  if (frames.length === 0) {
    return (
      <div className="aspect-video rounded-xl bg-muted flex items-center justify-center p-6 text-center">
        <p className="text-muted-foreground">Paint at least one side to generate a walkthrough video.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Film className="w-4 h-4" />
          Cinematic walkthrough · {frames.length} shot{frames.length > 1 ? "s" : ""} · {totalSec.toFixed(1)}s
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 w-44">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Per shot</span>
            <Slider value={[shotSec]} min={2} max={6} step={0.5} onValueChange={(v) => setShotSec(v[0])} disabled={recording} />
            <span className="text-xs text-muted-foreground w-8 text-right">{shotSec}s</span>
          </div>
          <div className="flex items-center gap-2 w-44">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Fade</span>
            <Slider value={[fadeSec]} min={0} max={1.5} step={0.1} onValueChange={(v) => setFadeSec(v[0])} disabled={recording} />
            <span className="text-xs text-muted-foreground w-8 text-right">{fadeSec.toFixed(1)}s</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden bg-foreground/90 border border-border">
        <canvas ref={canvasRef} width={W} height={H} className="w-full h-auto block" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={togglePreview} disabled={!imagesReady || recording}>
          {previewing ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
          {previewing ? "Pause preview" : "Preview"}
        </Button>
        <Button variant="accent" size="sm" onClick={generateVideo} disabled={!imagesReady || recording}>
          {recording ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Rendering {progress}%</>
          ) : (
            <><Film className="w-4 h-4 mr-2" />Generate video</>
          )}
        </Button>
        {videoUrl && !recording && (
          <>
            <Button variant="default" size="sm" onClick={downloadVideo}>
              <Download className="w-4 h-4 mr-2" />Download .{videoExt}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { URL.revokeObjectURL(videoUrl); setVideoUrl(null); }}>
              <RotateCw className="w-4 h-4 mr-2" />Reset
            </Button>
          </>
        )}
      </div>

      {videoUrl && (
        <video src={videoUrl} controls className="w-full rounded-xl border border-border bg-black" />
      )}

      {!imagesReady && (
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <Loader2 className="w-3 h-3 animate-spin" /> Preparing frames…
        </p>
      )}
    </div>
  );
}
