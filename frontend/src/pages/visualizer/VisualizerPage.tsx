import { useState, useRef, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import {
  Upload,
  Paintbrush,
  ScanSearch,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Download,
  ArrowLeft,
  Loader2,
  ImageIcon,
  Sparkles,
  Eye,
  Palette,
} from "lucide-react";

interface RoomAnalysis {
  walls_detected: number;
  wall_condition: string;
  damage_found: { type: string; severity: string; location: string }[];
  room_type: string;
  current_color: string;
  lighting: string;
  paintable_area_percent: number;
  recommendations: string[];
}

const PAINT_COLORS = [
  { name: "Ocean Mist", hex: "#5B9AA9", category: "Cool" },
  { name: "Sage Green", hex: "#87AE73", category: "Nature" },
  { name: "Warm Sand", hex: "#D4B896", category: "Warm" },
  { name: "Terracotta", hex: "#C2714F", category: "Warm" },
  { name: "Slate Blue", hex: "#6B7FA3", category: "Cool" },
  { name: "Soft Cream", hex: "#F5E6D3", category: "Neutral" },
  { name: "Dusty Rose", hex: "#C9918A", category: "Warm" },
  { name: "Forest Pine", hex: "#2D5F4A", category: "Nature" },
  { name: "Cloud White", hex: "#F0EDE8", category: "Neutral" },
  { name: "Charcoal", hex: "#3D3D3D", category: "Bold" },
  { name: "Navy Night", hex: "#1B2A4A", category: "Bold" },
  { name: "Sunshine", hex: "#E8C547", category: "Bright" },
  { name: "Lavender", hex: "#9B8EC1", category: "Cool" },
  { name: "Coral Reef", hex: "#E07B6A", category: "Bright" },
  { name: "Moss Green", hex: "#6B8E5A", category: "Nature" },
  { name: "Pewter", hex: "#8F9196", category: "Neutral" },
];

type Step = "upload" | "analyzing" | "results" | "visualizing" | "comparison";

const isValidHex = (hex: string) => /^#([0-9A-Fa-f]{6})$/.test(hex);

export default function VisualizerPage() {
  const [step, setStep] = useState<Step>("upload");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<RoomAnalysis | null>(null);
  const [selectedColor, setSelectedColor] = useState(PAINT_COLORS[0]);
  const [customHex, setCustomHex] = useState("#");
  const [customName, setCustomName] = useState("Custom Color");
  const [visualizedImage, setVisualizedImage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }

    // Show local preview
    const reader = new FileReader();
    reader.onload = (e) => setUploadedImage(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload to storage
    const fileName = `uploads/${crypto.randomUUID()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("room-images").upload(fileName, file);
    if (error) {
      toast.error("Upload failed: " + error.message);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("room-images").getPublicUrl(fileName);
    setUploadedImageUrl(publicUrlData.publicUrl);

    // Auto-analyze
    analyzeRoom(publicUrlData.publicUrl);
  }, []);

  const analyzeRoom = async (imageUrl: string) => {
    setStep("analyzing");
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 2, 90));
    }, 200);

    try {
      const { data, error } = await supabase.functions.invoke("visualize-room", {
        body: { imageUrl, action: "analyze" },
      });

      if (error) throw error;
      setAnalysis(data.analysis);
      setProgress(100);
      setTimeout(() => setStep("results"), 500);
    } catch (err: any) {
      toast.error(err.message || "Analysis failed");
      setStep("upload");
    } finally {
      clearInterval(interval);
    }
  };

  const visualizeRoom = async () => {
    if (!uploadedImageUrl) return;
    setStep("visualizing");
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 1, 85));
    }, 300);

    try {
      const { data, error } = await supabase.functions.invoke("visualize-room", {
        body: {
          imageUrl: uploadedImageUrl,
          colorName: selectedColor.name,
          colorHex: selectedColor.hex,
          action: "visualize",
        },
      });

      if (error) throw error;
      setVisualizedImage(data.visualizedImageUrl);
      setProgress(100);
      setTimeout(() => setStep("comparison"), 500);
    } catch (err: any) {
      toast.error(err.message || "Visualization failed");
      setStep("results");
    } finally {
      clearInterval(interval);
    }
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !comparisonRef.current) return;
      const rect = comparisonRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      setSliderPos((x / rect.width) * 100);
    },
    [isDragging]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!comparisonRef.current) return;
      const rect = comparisonRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
      setSliderPos((x / rect.width) * 100);
    },
    []
  );

  const resetAll = () => {
    setStep("upload");
    setUploadedImage(null);
    setUploadedImageUrl(null);
    setAnalysis(null);
    setVisualizedImage(null);
    setProgress(0);
    setSliderPos(50);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload]
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-10">
            <Badge variant="accent" className="mb-3">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-3">
              Room Visualizer
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Upload a photo of your room, and our AI will detect walls, analyze
              conditions, and show you exactly how your chosen paint color will
              look.
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-10">
            {[
              { key: "upload", label: "Upload", icon: Upload },
              { key: "analyzing", label: "Analyze", icon: ScanSearch },
              { key: "results", label: "Choose Color", icon: Paintbrush },
              { key: "comparison", label: "Compare", icon: Eye },
            ].map((s, i) => {
              const stepOrder = ["upload", "analyzing", "results", "visualizing", "comparison"];
              const currentIdx = stepOrder.indexOf(step);
              const thisIdx = stepOrder.indexOf(s.key);
              const isActive = thisIdx <= currentIdx;
              return (
                <div key={s.key} className="flex items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <s.icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-sm font-medium hidden sm:inline ${
                      isActive ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </span>
                  {i < 3 && (
                    <div
                      className={`w-8 h-0.5 ${
                        isActive ? "bg-accent" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {/* UPLOAD STEP */}
            {step === "upload" && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto"
              >
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  className="p-16 border-2 border-dashed border-border rounded-2xl bg-muted/30 hover:bg-muted/50 hover:border-accent/50 transition-all cursor-pointer text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
                    <ImageIcon className="w-8 h-8 text-accent" />
                  </div>
                  <p className="text-foreground font-semibold text-lg mb-2">
                    Drop your room photo here
                  </p>
                  <p className="text-muted-foreground mb-5">
                    JPG, PNG up to 10MB
                  </p>
                  <Button variant="accent">
                    <Upload className="w-4 h-4 mr-2" />
                    Browse Files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* ANALYZING STEP */}
            {step === "analyzing" && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto text-center"
              >
                <div className="relative w-full max-w-md mx-auto aspect-[4/3] rounded-2xl overflow-hidden mb-8">
                  {uploadedImage && (
                    <img
                      src={uploadedImage}
                      alt="Room"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-10 h-10 text-accent animate-spin mx-auto mb-3" />
                      <p className="text-accent-foreground font-semibold text-lg">
                        Analyzing Room...
                      </p>
                      <p className="text-accent-foreground/80 text-sm">
                        Detecting walls, damage & surfaces
                      </p>
                    </div>
                  </div>
                </div>
                <Progress value={progress} className="max-w-sm mx-auto h-2" />
                <p className="text-muted-foreground text-sm mt-2">
                  {progress}% complete
                </p>
              </motion.div>
            )}

            {/* RESULTS & COLOR PICKER STEP */}
            {step === "results" && analysis && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-5xl mx-auto"
              >
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Left: Image + Analysis */}
                  <div>
                    <div className="rounded-2xl overflow-hidden mb-6">
                      {uploadedImage && (
                        <img
                          src={uploadedImage}
                          alt="Room"
                          className="w-full aspect-[4/3] object-cover"
                        />
                      )}
                    </div>

                    {/* Analysis Cards */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <Card className="p-4">
                        <div className="text-sm text-muted-foreground">
                          Walls Detected
                        </div>
                        <div className="text-2xl font-bold text-foreground">
                          {analysis.walls_detected}
                        </div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-sm text-muted-foreground">
                          Paintable Area
                        </div>
                        <div className="text-2xl font-bold text-foreground">
                          {analysis.paintable_area_percent}%
                        </div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-sm text-muted-foreground">
                          Room Type
                        </div>
                        <div className="text-lg font-semibold text-foreground capitalize">
                          {analysis.room_type}
                        </div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-sm text-muted-foreground">
                          Condition
                        </div>
                        <div className="flex items-center gap-2">
                          {analysis.wall_condition === "good" ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                          )}
                          <span className="text-lg font-semibold text-foreground capitalize">
                            {analysis.wall_condition}
                          </span>
                        </div>
                      </Card>
                    </div>

                    {/* Damage Report */}
                    {analysis.damage_found.length > 0 && (
                      <Card className="p-4">
                        <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          Damage Detected
                        </h3>
                        <div className="space-y-2">
                          {analysis.damage_found.map((d, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-foreground capitalize">
                                {d.type} — {d.location}
                              </span>
                              <Badge
                                variant={
                                  d.severity === "severe"
                                    ? "destructive"
                                    : d.severity === "moderate"
                                    ? "outline"
                                    : "secondary"
                                }
                              >
                                {d.severity}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}
                  </div>

                  {/* Right: Color Picker */}
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                      Choose Your Paint Color
                    </h2>
                    <div className="grid grid-cols-4 gap-3 mb-6">
                      {PAINT_COLORS.map((color) => (
                        <button
                          key={color.hex}
                          onClick={() => setSelectedColor(color)}
                          className={`paint-swatch group relative ${
                            selectedColor.hex === color.hex ? "selected" : ""
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        >
                          <div className="absolute inset-0 flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] font-medium bg-foreground/80 text-background px-1.5 py-0.5 rounded-t-md">
                              {color.name}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Custom Color Picker */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Palette className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Or use a custom color</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={isValidHex(customHex) ? customHex : "#888888"}
                          onChange={(e) => {
                            const hex = e.target.value;
                            setCustomHex(hex);
                            setSelectedColor({ name: customName, hex, category: "Custom" });
                          }}
                          className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent p-0.5"
                        />
                        <Input
                          value={customHex}
                          onChange={(e) => {
                            let val = e.target.value;
                            if (!val.startsWith("#")) val = "#" + val;
                            setCustomHex(val);
                            if (isValidHex(val)) {
                              setSelectedColor({ name: customName, hex: val, category: "Custom" });
                            }
                          }}
                          placeholder="#FF5733"
                          className="w-28 font-mono text-sm"
                          maxLength={7}
                        />
                        <Input
                          value={customName}
                          onChange={(e) => {
                            setCustomName(e.target.value);
                            if (isValidHex(customHex)) {
                              setSelectedColor({ name: e.target.value || "Custom Color", hex: customHex, category: "Custom" });
                            }
                          }}
                          placeholder="Color name"
                          className="flex-1 text-sm"
                        />
                      </div>
                    </div>
                    {/* Selected Color Preview */}
                    <Card className="p-6 mb-6">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-16 h-16 rounded-xl shadow-lg"
                          style={{ backgroundColor: selectedColor.hex }}
                        />
                        <div>
                          <h3 className="font-semibold text-foreground text-lg">
                            {selectedColor.name}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            {selectedColor.hex} · {selectedColor.category}
                          </p>
                        </div>
                      </div>
                    </Card>

                    {/* AI Recommendations */}
                    {analysis.recommendations.length > 0 && (
                      <Card className="p-4 mb-6 border-accent/20 bg-accent/5">
                        <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-accent" />
                          AI Recommendations
                        </h3>
                        <ul className="space-y-1.5">
                          {analysis.recommendations.map((rec, i) => (
                            <li
                              key={i}
                              className="text-sm text-muted-foreground flex items-start gap-2"
                            >
                              <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </Card>
                    )}

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={resetAll}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Start Over
                      </Button>
                      <Button
                        variant="accent"
                        size="lg"
                        className="flex-1"
                        onClick={visualizeRoom}
                      >
                        <Paintbrush className="w-4 h-4 mr-2" />
                        Visualize with {selectedColor.name}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* VISUALIZING STEP */}
            {step === "visualizing" && (
              <motion.div
                key="visualizing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto text-center"
              >
                <div className="mb-8">
                  <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
                    <Paintbrush className="w-10 h-10 text-accent animate-pulse" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    Painting Your Room...
                  </h2>
                  <p className="text-muted-foreground">
                    AI is applying{" "}
                    <span className="font-semibold text-foreground">
                      {selectedColor.name}
                    </span>{" "}
                    to your walls
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div
                    className="w-8 h-8 rounded-lg shadow-lg"
                    style={{ backgroundColor: selectedColor.hex }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {selectedColor.hex}
                  </span>
                </div>
                <Progress value={progress} className="max-w-sm mx-auto h-2" />
                <p className="text-muted-foreground text-sm mt-2">
                  {progress}% — This may take 15–30 seconds
                </p>
              </motion.div>
            )}

            {/* COMPARISON STEP */}
            {step === "comparison" && visualizedImage && uploadedImage && (
              <motion.div
                key="comparison"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-5xl mx-auto"
              >
                <h2 className="font-display text-2xl font-bold text-foreground text-center mb-6">
                  Before & After Comparison
                </h2>

                {/* Comparison Slider */}
                <div
                  ref={comparisonRef}
                  className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl cursor-col-resize select-none mb-8"
                  onMouseMove={handleMouseMove}
                  onMouseDown={() => setIsDragging(true)}
                  onMouseUp={() => setIsDragging(false)}
                  onMouseLeave={() => setIsDragging(false)}
                  onTouchMove={handleTouchMove}
                  onTouchStart={() => setIsDragging(true)}
                  onTouchEnd={() => setIsDragging(false)}
                >
                  {/* After (full width behind) */}
                  <img
                    src={visualizedImage}
                    alt="After"
                    className="absolute inset-0 w-full h-full object-cover"
                    draggable={false}
                  />

                  {/* Before (clipped) */}
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: `${sliderPos}%` }}
                  >
                    <img
                      src={uploadedImage}
                      alt="Before"
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{
                        width: comparisonRef.current
                          ? `${comparisonRef.current.offsetWidth}px`
                          : "100%",
                      }}
                      draggable={false}
                    />
                  </div>

                  {/* Slider Handle */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-background/80 backdrop-blur-sm"
                    style={{ left: `${sliderPos}%` }}
                  >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background shadow-xl flex items-center justify-center">
                      <div className="flex gap-0.5">
                        <div className="w-0.5 h-4 bg-muted-foreground rounded" />
                        <div className="w-0.5 h-4 bg-muted-foreground rounded" />
                      </div>
                    </div>
                  </div>

                  {/* Labels */}
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-sm text-sm font-medium text-foreground">
                    Before
                  </div>
                  <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium">
                    After
                  </div>
                </div>

                {/* Color info + Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg shadow-lg"
                      style={{ backgroundColor: selectedColor.hex }}
                    />
                    <div>
                      <p className="font-semibold text-foreground">
                        {selectedColor.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedColor.hex}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep("results")}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Another Color
                    </Button>
                    <Button
                      variant="accent"
                      onClick={() => {
                        if (visualizedImage) {
                          const a = document.createElement("a");
                          a.href = visualizedImage;
                          a.download = `paintverse-${selectedColor.name.toLowerCase().replace(/\s/g, "-")}.png`;
                          a.click();
                        }
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" onClick={resetAll}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      New Room
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
}
