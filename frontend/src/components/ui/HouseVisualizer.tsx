import { useState, useCallback, useEffect } from "react";
import "./HouseVisualizer.css";

// ─── Types ───────────────────────────────────────────────────────────
type PartKey =
  | "upperWalls"
  | "lowerWalls"
  | "roof"
  | "slabs"
  | "woodAccent"
  | "glass"
  | "steps"
  | "ground";

interface ZoneMeta {
  key: PartKey;
  label: string;
  palette: string[];
}

interface HouseVisualizerProps {
  /** Pre-highlight a color from the product form */
  activeColorHex?: string;
  /** Callback when user picks a color */
  onColorSelect?: (hex: string) => void;
  /** Compact mode for embedding in forms */
  compact?: boolean;
}

// ─── Curated palettes ────────────────────────────────────────────────
const ZONES: ZoneMeta[] = [
  {
    key: "upperWalls",
    label: "Upper Walls",
    palette: [
      "#F5F5F0", "#EDE8E0", "#E8E0D4", "#D6CFC3",
      "#C9C0B1", "#BFB8A8", "#F0ECE3", "#E3DDD3",
      "#D9D0C4", "#CCC3B4", "#AFA89C", "#9E978B",
    ],
  },
  {
    key: "lowerWalls",
    label: "Lower Walls",
    palette: [
      "#FAF8F5", "#F0EDE6", "#E5E0D7", "#DDD6C9",
      "#D0C8BA", "#C4BBAB", "#EFEBE3", "#E2DCD2",
      "#D5CEC1", "#C8C0B0", "#B0A898", "#A39B8C",
    ],
  },
  {
    key: "roof",
    label: "Roof Slab",
    palette: [
      "#8C9196", "#7D8489", "#6E757A", "#5F666B",
      "#50575C", "#41484D", "#9BA0A5", "#A5AAAE",
      "#B0B4B8", "#BCC0C3", "#C8CBCE", "#D4D7D9",
    ],
  },
  {
    key: "slabs",
    label: "Floor Slabs",
    palette: [
      "#909599", "#82878B", "#74797D", "#666B6F",
      "#585D61", "#4A4F53", "#9EA3A7", "#ACB0B3",
      "#BABDBf", "#C7CACB", "#D4D6D8", "#E1E3E4",
    ],
  },
  {
    key: "woodAccent",
    label: "Wood Accent",
    palette: [
      "#C4945A", "#B8874D", "#A97A42", "#9A6D38",
      "#8B602E", "#7C5324", "#D4A56B", "#DEB57C",
      "#E8C58D", "#F2D59E", "#6E4B1E", "#5A3D18",
    ],
  },
  {
    key: "glass",
    label: "Glass Tint",
    palette: [
      "#5B7A8A", "#4E6D7D", "#416070", "#345363",
      "#274656", "#1A3949", "#6D8C9B", "#7F9EAC",
      "#91B0BD", "#A3C2CE", "#1F4E5F", "#163A48",
    ],
  },
  {
    key: "steps",
    label: "Steps",
    palette: [
      "#A8A8A0", "#9B9B93", "#8E8E86", "#818179",
      "#74746C", "#67675F", "#B5B5AD", "#C2C2BA",
      "#CFCFC7", "#DCDCD4", "#5A5A52", "#4D4D45",
    ],
  },
  {
    key: "ground",
    label: "Ground",
    palette: [
      "#B0AFA6", "#A3A299", "#96958C", "#89887F",
      "#7C7B72", "#6F6E65", "#BdBCB3", "#CAC9C0",
      "#D7D6CD", "#E4E3DA", "#62615A", "#56554E",
    ],
  },
];

const DEFAULT_COLORS: Record<PartKey, string> = {
  upperWalls: "#E8E0D4",
  lowerWalls: "#F0EDE6",
  roof: "#6E757A",
  slabs: "#82878B",
  woodAccent: "#B8874D",
  glass: "#4E6D7D",
  steps: "#8E8E86",
  ground: "#A3A299",
};

// ─── Component ───────────────────────────────────────────────────────
export function HouseVisualizer({
  activeColorHex,
  onColorSelect,
  compact = false,
}: HouseVisualizerProps) {
  const [activePart, setActivePart] = useState<PartKey>("upperWalls");
  const [colors, setColors] = useState<Record<PartKey, string>>({ ...DEFAULT_COLORS });

  // Sync incoming color to the active wall zone
  useEffect(() => {
    if (activeColorHex && /^#[0-9A-Fa-f]{6}$/.test(activeColorHex)) {
      setColors((prev) => ({ ...prev, upperWalls: activeColorHex, lowerWalls: activeColorHex }));
    }
  }, [activeColorHex]);

  const selectZone = useCallback((key: PartKey) => {
    setActivePart(key);
  }, []);

  const applyColor = useCallback(
    (hex: string) => {
      setColors((prev) => ({ ...prev, [activePart]: hex }));
      onColorSelect?.(hex);
    },
    [activePart, onColorSelect]
  );

  const activeZone = ZONES.find((z) => z.key === activePart)!;

  // Zone click handler for SVG
  const handleZoneClick = useCallback(
    (key: PartKey) => (e: React.MouseEvent) => {
      e.stopPropagation();
      selectZone(key);
    },
    [selectZone]
  );

  // Shared className builder
  const zc = (key: PartKey, extra = "") =>
    `zone ${extra} ${activePart === key ? "zone-active" : ""}`.trim();

  return (
    <div style={{ width: "100%" }}>
      {/* ── SVG House ────────────────────────────────────── */}
      <div className="hv-svg-card">
        <div className="hv-checkerboard" style={{ padding: compact ? 12 : 20 }}>
          <svg
            viewBox="0 0 800 500"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: "100%", height: "auto", display: "block" }}
          >
            {/* ── Ground Platform ─────────────────────────── */}
            <rect
              id="z-ground"
              className={zc("ground")}
              x="60" y="420" width="680" height="50" rx="4"
              fill={colors.ground}
              onClick={handleZoneClick("ground")}
            />

            {/* ── Lower Floor Slab ────────────────────────── */}
            <rect
              id="z-slab-lower"
              className={zc("slabs")}
              x="150" y="405" width="440" height="18" rx="2"
              fill={colors.slabs}
              onClick={handleZoneClick("slabs")}
            />

            {/* ── Lower Walls ─────────────────────────────── */}
            {/* Left solid wall */}
            <rect
              id="z-wall-lower-left"
              className={zc("lowerWalls")}
              x="155" y="295" width="90" height="110" rx="0"
              fill={colors.lowerWalls}
              onClick={handleZoneClick("lowerWalls")}
            />
            {/* Small window on lower-left wall */}
            <rect
              id="z-glass-lower-left-win"
              className={zc("glass", "zone-glass")}
              x="175" y="320" width="50" height="40" rx="2"
              fill={colors.glass}
              onClick={handleZoneClick("glass")}
            />
            {/* Window frame */}
            <rect x="175" y="320" width="50" height="40" rx="2"
              fill="none" stroke="#9aa3ad" strokeWidth="1.5" pointerEvents="none" />
            <line x1="200" y1="320" x2="200" y2="360"
              stroke="#9aa3ad" strokeWidth="1" pointerEvents="none" />
            <line x1="175" y1="340" x2="225" y2="340"
              stroke="#9aa3ad" strokeWidth="1" pointerEvents="none" />

            {/* Center glass doors (large sliding, 4 panels) */}
            <rect
              id="z-glass-lower-center"
              className={zc("glass", "zone-glass")}
              x="250" y="295" width="240" height="110" rx="2"
              fill={colors.glass}
              onClick={handleZoneClick("glass")}
            />
            {/* Door panel frames */}
            <rect x="250" y="295" width="240" height="110" rx="2"
              fill="none" stroke="#8a939d" strokeWidth="2" pointerEvents="none" />
            <line x1="310" y1="295" x2="310" y2="405"
              stroke="#8a939d" strokeWidth="1.2" pointerEvents="none" />
            <line x1="370" y1="295" x2="370" y2="405"
              stroke="#8a939d" strokeWidth="1.2" pointerEvents="none" />
            <line x1="430" y1="295" x2="430" y2="405"
              stroke="#8a939d" strokeWidth="1.2" pointerEvents="none" />

            {/* Right solid wall */}
            <rect
              id="z-wall-lower-right"
              className={zc("lowerWalls")}
              x="495" y="295" width="90" height="110" rx="0"
              fill={colors.lowerWalls}
              onClick={handleZoneClick("lowerWalls")}
            />

            {/* ── Mid-Floor Slab (protruding) ─────────────── */}
            <rect
              id="z-slab-mid"
              className={zc("slabs")}
              x="140" y="278" width="460" height="18" rx="2"
              fill={colors.slabs}
              onClick={handleZoneClick("slabs")}
            />

            {/* ── Upper Walls ─────────────────────────────── */}
            {/* Left solid wall */}
            <rect
              id="z-wall-upper-left"
              className={zc("upperWalls")}
              x="155" y="158" width="70" height="120" rx="0"
              fill={colors.upperWalls}
              onClick={handleZoneClick("upperWalls")}
            />
            {/* Small window upper-left */}
            <rect
              id="z-glass-upper-left-win"
              className={zc("glass", "zone-glass")}
              x="168" y="185" width="44" height="50" rx="2"
              fill={colors.glass}
              onClick={handleZoneClick("glass")}
            />
            <rect x="168" y="185" width="44" height="50" rx="2"
              fill="none" stroke="#9aa3ad" strokeWidth="1.5" pointerEvents="none" />
            <line x1="190" y1="185" x2="190" y2="235"
              stroke="#9aa3ad" strokeWidth="1" pointerEvents="none" />

            {/* Center multi-panel glass wall (6 panels) */}
            <rect
              id="z-glass-upper-center"
              className={zc("glass", "zone-glass")}
              x="230" y="158" width="280" height="120" rx="2"
              fill={colors.glass}
              onClick={handleZoneClick("glass")}
            />
            <rect x="230" y="158" width="280" height="120" rx="2"
              fill="none" stroke="#8a939d" strokeWidth="2" pointerEvents="none" />
            {/* Panel dividers */}
            {[277, 324, 370, 416, 463].map((cx) => (
              <line
                key={cx}
                x1={cx} y1={158} x2={cx} y2={278}
                stroke="#8a939d" strokeWidth="1" pointerEvents="none"
              />
            ))}
            {/* Horizontal mid-bar */}
            <line x1="230" y1="218" x2="510" y2="218"
              stroke="#8a939d" strokeWidth="1" pointerEvents="none" />

            {/* Right solid wall */}
            <rect
              id="z-wall-upper-right"
              className={zc("upperWalls")}
              x="515" y="158" width="70" height="120" rx="0"
              fill={colors.upperWalls}
              onClick={handleZoneClick("upperWalls")}
            />
            {/* Small window upper-right */}
            <rect
              id="z-glass-upper-right-win"
              className={zc("glass", "zone-glass")}
              x="528" y="185" width="44" height="50" rx="2"
              fill={colors.glass}
              onClick={handleZoneClick("glass")}
            />
            <rect x="528" y="185" width="44" height="50" rx="2"
              fill="none" stroke="#9aa3ad" strokeWidth="1.5" pointerEvents="none" />
            <line x1="550" y1="185" x2="550" y2="235"
              stroke="#9aa3ad" strokeWidth="1" pointerEvents="none" />

            {/* ── Wood Accent Panel (ceiling accent above glass) ─ */}
            <rect
              id="z-wood"
              className={zc("woodAccent")}
              x="225" y="140" width="290" height="18" rx="3"
              fill={colors.woodAccent}
              onClick={handleZoneClick("woodAccent")}
            />
            {/* Wood grain lines */}
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={`grain-${i}`}
                x1={225 + i * 60 + 15}
                y1={143}
                x2={225 + i * 60 + 45}
                y2={155}
                stroke="rgba(0,0,0,0.08)"
                strokeWidth="1"
                pointerEvents="none"
              />
            ))}

            {/* ── Roof Slab ───────────────────────────────── */}
            {/* Top slab */}
            <rect
              id="z-roof-top"
              className={zc("roof")}
              x="130" y="118" width="480" height="22" rx="3"
              fill={colors.roof}
              onClick={handleZoneClick("roof")}
            />
            {/* Overhanging edge — thin darker strip */}
            <rect
              id="z-roof-edge"
              className={zc("roof")}
              x="125" y="136" width="490" height="6" rx="1"
              fill={colors.roof}
              style={{ filter: "brightness(0.85)" }}
              onClick={handleZoneClick("roof")}
            />

            {/* ── Steps (left side, 4 steps) ──────────────── */}
            {[0, 1, 2, 3].map((i) => (
              <rect
                key={`step-${i}`}
                id={`z-steps-${i}`}
                className={zc("steps")}
                x={100 - i * 14}
                y={390 - i * 8}
                width={55 + i * 14}
                height={10}
                rx="1"
                fill={colors.steps}
                onClick={handleZoneClick("steps")}
              />
            ))}

            {/* ── Winter Tree (right side) ────────────────── */}
            <g transform="translate(640, 240)">
              {/* Trunk */}
              <line className="hv-tree-line" x1="30" y1="180" x2="30" y2="60" strokeWidth="4" />
              {/* Main branches */}
              <line className="hv-tree-line" x1="30" y1="80" x2="0" y2="30" />
              <line className="hv-tree-line" x1="30" y1="80" x2="60" y2="20" />
              <line className="hv-tree-line" x1="30" y1="110" x2="5" y2="70" />
              <line className="hv-tree-line" x1="30" y1="110" x2="65" y2="65" />
              <line className="hv-tree-line" x1="30" y1="140" x2="10" y2="110" />
              <line className="hv-tree-line" x1="30" y1="140" x2="55" y2="105" />
              {/* Twigs */}
              <line className="hv-tree-line" x1="0" y1="30" x2="-12" y2="5" strokeWidth="1.2" />
              <line className="hv-tree-line" x1="0" y1="30" x2="12" y2="15" strokeWidth="1.2" />
              <line className="hv-tree-line" x1="60" y1="20" x2="75" y2="0" strokeWidth="1.2" />
              <line className="hv-tree-line" x1="60" y1="20" x2="50" y2="5" strokeWidth="1.2" />
              <line className="hv-tree-line" x1="5" y1="70" x2="-8" y2="50" strokeWidth="1.2" />
              <line className="hv-tree-line" x1="65" y1="65" x2="80" y2="48" strokeWidth="1.2" />
            </g>

            {/* ── House outline shadow (subtle depth) ──────── */}
            <rect
              x="153" y="118" width="435" height="300" rx="0"
              fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="1"
              pointerEvents="none"
            />
          </svg>
        </div>
      </div>

      {/* ── Controls ──────────────────────────────────────── */}
      <div className="hv-controls">
        {/* Left Column: pills + color strip */}
        <div className="hv-controls-left">
          <div>
            <div className="hv-section-label">Select Zone</div>
            <div className="hv-pills">
              {ZONES.map((z) => (
                <button
                  key={z.key}
                  className={`hv-pill ${activePart === z.key ? "active" : ""}`}
                  onClick={() => selectZone(z.key)}
                  type="button"
                >
                  {z.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="hv-section-label">Current Colors</div>
            <div className="hv-color-strip">
              {ZONES.map((z) => (
                <div
                  key={z.key}
                  className={`hv-strip-item ${activePart === z.key ? "active" : ""}`}
                  onClick={() => selectZone(z.key)}
                >
                  <div
                    className="hv-strip-dot"
                    style={{ backgroundColor: colors[z.key] }}
                  />
                  <span className="hv-strip-label">{z.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: swatches + picker */}
        <div className="hv-controls-right">
          <div>
            <div className="hv-section-label">
              {activeZone.label} — Pick a Color
            </div>
            <div className="hv-swatch-grid">
              {activeZone.palette.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  className={`hv-swatch ${colors[activePart] === hex ? "active" : ""}`}
                  style={{ backgroundColor: hex }}
                  title={hex}
                  onClick={() => applyColor(hex)}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="hv-section-label">Custom Color</div>
            <div className="hv-picker-row">
              <input
                type="color"
                className="hv-color-input"
                value={colors[activePart]}
                onChange={(e) => applyColor(e.target.value)}
              />
              <span className="hv-hex-display">
                {colors[activePart].toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
