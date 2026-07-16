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
            viewBox="0 0 1000 600"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: "100%", height: "auto", display: "block" }}
          >
            {/* Ground / Sidewalk */}
            <rect
              id="z-ground"
              className={zc("ground")}
              x="0" y="490" width="1000" height="110"
              fill={colors.ground}
              onClick={handleZoneClick("ground")}
            />
            <rect x="0" y="490" width="1000" height="8" fill="#9a9a9a" pointerEvents="none" />

            {/* Foundation base */}
            <rect x="85" y="470" width="730" height="28" rx="2" fill="#9e9e9e" pointerEvents="none" />

            {/* ===== BUILDING STRUCTURE ===== */}

            {/* UPPER FLOOR ROOF / Top overhang dark slab */}
            <rect
              id="z-roof"
              className={zc("roof")}
              x="70" y="90" width="760" height="32" rx="3"
              fill={colors.roof}
              onClick={handleZoneClick("roof")}
            />
            {/* Roof underside shadow line */}
            <rect x="70" y="120" width="760" height="6" fill="#333333" pointerEvents="none" />

            {/* Wood / fascia beam behind roof */}
            <rect
              id="z-wood"
              className={zc("woodAccent")}
              x="85" y="122" width="730" height="38"
              fill={colors.woodAccent}
              onClick={handleZoneClick("woodAccent")}
            />
            {/* Wood grain lines */}
            <line x1="85" y1="130" x2="815" y2="130" stroke="#b07030" strokeWidth="1.5" opacity="0.6" pointerEvents="none" />
            <line x1="85" y1="138" x2="815" y2="138" stroke="#b07030" strokeWidth="1" opacity="0.4" pointerEvents="none" />
            <line x1="85" y1="146" x2="815" y2="146" stroke="#b07030" strokeWidth="1.5" opacity="0.5" pointerEvents="none" />
            <line x1="85" y1="153" x2="815" y2="153" stroke="#b07030" strokeWidth="1" opacity="0.3" pointerEvents="none" />

            {/* UPPER FLOOR horizontal divider slab (between floors) */}
            <rect
              id="z-slabs-mid"
              className={zc("slabs")}
              x="85" y="310" width="730" height="22" rx="2"
              fill={colors.slabs}
              onClick={handleZoneClick("slabs")}
            />
            <rect x="85" y="310" width="730" height="5" fill="#6a6a6a" pointerEvents="none" />

            {/* LOWER FLOOR bottom overhang/ledge (base of building above foundation) */}
            <rect
              id="z-slabs-lower"
              className={zc("slabs")}
              x="85" y="464" width="730" height="14" rx="2"
              fill={colors.slabs}
              onClick={handleZoneClick("slabs")}
            />

            {/* ===== UPPER FLOOR WALLS ===== */}

            {/* Left wall panel (paintable) - upper floor */}
            <rect
              id="z-wall-upper-left"
              className={zc("upperWalls")}
              x="85" y="160" width="175" height="150"
              fill={colors.upperWalls}
              onClick={handleZoneClick("upperWalls")}
            />

            {/* CENTER GLASS SECTION upper floor */}
            {/* Glass tile grid */}
            <rect
              id="z-glass-upper"
              className={zc("glass", "zone-glass")}
              x="260" y="160" width="380" height="150"
              fill={colors.glass}
              onClick={handleZoneClick("glass")}
            />
            {/* Vertical glass dividers */}
            <line x1="260" y1="160" x2="260" y2="310" stroke="#a0b4c8" strokeWidth="3" pointerEvents="none" />
            <line x1="387" y1="160" x2="387" y2="310" stroke="#a0b4c8" strokeWidth="2" pointerEvents="none" />
            <line x1="513" y1="160" x2="513" y2="310" stroke="#a0b4c8" strokeWidth="2" pointerEvents="none" />
            <line x1="640" y1="160" x2="640" y2="310" stroke="#a0b4c8" strokeWidth="3" pointerEvents="none" />
            {/* Horizontal glass dividers */}
            <line x1="260" y1="235" x2="640" y2="235" stroke="#a0b4c8" strokeWidth="2" pointerEvents="none" />
            {/* Glass reflection shimmer */}
            <rect x="270" y="165" width="30" height="60" fill="white" opacity="0.18" rx="2" pointerEvents="none" />
            <rect x="400" y="165" width="20" height="60" fill="white" opacity="0.12" rx="2" pointerEvents="none" />
            <rect x="525" y="165" width="25" height="60" fill="white" opacity="0.15" rx="2" pointerEvents="none" />

            {/* Right wall panel (paintable) - upper floor */}
            <rect
              id="z-wall-upper-right"
              className={zc("upperWalls")}
              x="640" y="160" width="175" height="150"
              fill={colors.upperWalls}
              onClick={handleZoneClick("upperWalls")}
            />

            {/* Windows on paintable upper wall panels */}
            {/* Left upper window glass */}
            <rect
              id="z-glass-win-ul"
              className={zc("glass", "zone-glass")}
              x="105" y="185" width="115" height="90" rx="3"
              fill={colors.glass}
              onClick={handleZoneClick("glass")}
            />
            <rect x="105" y="185" width="115" height="90" rx="3" fill="none" stroke="#7090a8" strokeWidth="4" pointerEvents="none" />
            <line x1="162" y1="185" x2="162" y2="275" stroke="#7090a8" strokeWidth="2.5" pointerEvents="none" />
            <line x1="105" y1="230" x2="220" y2="230" stroke="#7090a8" strokeWidth="2" pointerEvents="none" />
            <rect x="110" y="190" width="45" height="35" fill="white" opacity="0.25" rx="2" pointerEvents="none" />

            {/* Right upper window glass */}
            <rect
              id="z-glass-win-ur"
              className={zc("glass", "zone-glass")}
              x="680" y="185" width="115" height="90" rx="3"
              fill={colors.glass}
              onClick={handleZoneClick("glass")}
            />
            <rect x="680" y="185" width="115" height="90" rx="3" fill="none" stroke="#7090a8" strokeWidth="4" pointerEvents="none" />
            <line x1="737" y1="185" x2="737" y2="275" stroke="#7090a8" strokeWidth="2.5" pointerEvents="none" />
            <line x1="680" y1="230" x2="795" y2="230" stroke="#7090a8" strokeWidth="2" pointerEvents="none" />
            <rect x="685" y="190" width="45" height="35" fill="white" opacity="0.25" rx="2" pointerEvents="none" />

            {/* ===== LOWER FLOOR WALLS ===== */}

            {/* Left wall panel (paintable) - lower floor */}
            <rect
              id="z-wall-lower-left"
              className={zc("lowerWalls")}
              x="85" y="332" width="175" height="132"
              fill={colors.lowerWalls}
              onClick={handleZoneClick("lowerWalls")}
            />

            {/* CENTER GLASS SECTION lower floor */}
            <rect
              id="z-glass-lower"
              className={zc("glass", "zone-glass")}
              x="260" y="332" width="380" height="132"
              fill={colors.glass}
              onClick={handleZoneClick("glass")}
            />
            {/* Vertical glass dividers lower */}
            <line x1="260" y1="332" x2="260" y2="464" stroke="#a0b4c8" strokeWidth="3" pointerEvents="none" />
            <line x1="387" y1="332" x2="387" y2="464" stroke="#a0b4c8" strokeWidth="2" pointerEvents="none" />
            <line x1="513" y1="332" x2="513" y2="464" stroke="#a0b4c8" stroke-width="2" pointerEvents="none" />
            <line x1="640" y1="332" x2="640" y2="464" stroke="#a0b4c8" strokeWidth="3" pointerEvents="none" />
            {/* Horizontal divider lower */}
            <line x1="260" y1="395" x2="640" y2="395" stroke="#a0b4c8" strokeWidth="2" pointerEvents="none" />
            {/* Reflection shimmer lower */}
            <rect x="270" y="338" width="25" height="50" fill="white" opacity="0.15" rx="2" pointerEvents="none" />
            <rect x="525" y="338" width="20" height="50" fill="white" opacity="0.12" rx="2" pointerEvents="none" />

            {/* Right wall panel (paintable) - lower floor */}
            <rect
              id="z-wall-lower-right"
              className={zc("lowerWalls")}
              x="640" y="332" width="175" height="132"
              fill={colors.lowerWalls}
              onClick={handleZoneClick("lowerWalls")}
            />

            {/* Lower left window glass */}
            <rect
              id="z-glass-win-ll"
              className={zc("glass", "zone-glass")}
              x="95" y="355" width="100" height="80" rx="3"
              fill={colors.glass}
              onClick={handleZoneClick("glass")}
            />
            <rect x="95" y="355" width="100" height="80" rx="3" fill="none" stroke="#7090a8" strokeWidth="3.5" pointerEvents="none" />
            <line x1="145" y1="355" x2="145" y2="435" stroke="#7090a8" strokeWidth="2" pointerEvents="none" />
            <line x1="95" y1="395" x2="195" y2="395" stroke="#7090a8" strokeWidth="2" pointerEvents="none" />
            <rect x="100" y="360" width="40" height="30" fill="white" opacity="0.25" rx="2" pointerEvents="none" />

            {/* Lower right window glass */}
            <rect
              id="z-glass-win-lr"
              className={zc("glass", "zone-glass")}
              x="705" y="355" width="100" height="80" rx="3"
              fill={colors.glass}
              onClick={handleZoneClick("glass")}
            />
            <rect x="705" y="355" width="100" height="80" rx="3" fill="none" stroke="#7090a8" strokeWidth="3.5" pointerEvents="none" />
            <line x1="755" y1="355" x2="755" y2="435" stroke="#7090a8" strokeWidth="2" pointerEvents="none" />
            <line x1="705" y1="395" x2="805" y2="395" stroke="#7090a8" strokeWidth="2" pointerEvents="none" />
            <rect x="710" y="360" width="40" height="30" fill="white" opacity="0.25" rx="2" pointerEvents="none" />

            {/* ===== ENTRANCE STEPS (lower left) ===== */}
            <rect
              id="z-steps"
              className={zc("steps")}
              x="42" y="440" width="75" height="30" rx="2"
              fill={colors.steps}
              onClick={handleZoneClick("steps")}
            />
            <rect x="50" y="450" width="60" height="20" rx="2" fill="#aaaaaa" pointerEvents="none" opacity="0.4" />
            <rect x="58" y="460" width="45" height="10" rx="2" fill="#b8b8b8" pointerEvents="none" opacity="0.4" />

            {/* ===== BUILDING SIDE COLUMNS / EDGES ===== */}
            {/* Left edge column */}
            <rect x="85" y="160" width="10" height="304" fill="#8a8a8a" opacity="0.5" pointerEvents="none" />
            {/* Right edge column */}
            <rect x="805" y="160" width="10" height="304" fill="#8a8a8a" opacity="0.4" pointerEvents="none" />
            {/* Center vertical divider */}
            <rect x="255" y="160" width="8" height="304" fill="#9a9a9a" opacity="0.35" pointerEvents="none" />
            <rect x="637" y="160" width="8" height="304" fill="#9a9a9a" opacity="0.35" pointerEvents="none" />

            {/* ===== BARE TREE (right side) ===== */}
            <g transform="translate(0, 0)">
              {/* Trunk */}
              <line x1="890" y1="490" x2="890" y2="310" stroke="#6b4c30" strokeWidth="9" strokeLinecap="round" pointerEvents="none" />
              {/* Main branches */}
              <line x1="890" y1="360" x2="840" y2="300" stroke="#6b4c30" strokeWidth="5" strokeLinecap="round" pointerEvents="none" />
              <line x1="890" y1="350" x2="935" y2="285" stroke="#6b4c30" strokeWidth="5" strokeLinecap="round" pointerEvents="none" />
              <line x1="890" y1="380" x2="850" y2="340" stroke="#6b4c30" strokeWidth="4" strokeLinecap="round" pointerEvents="none" />
              <line x1="890" y1="375" x2="925" y2="335" stroke="#6b4c30" strokeWidth="4" strokeLinecap="round" pointerEvents="none" />
              {/* Sub branches */}
              <line x1="840" y1="300" x2="820" y2="270" stroke="#6b4c30" strokeWidth="3" strokeLinecap="round" pointerEvents="none" />
              <line x1="840" y1="300" x2="855" y2="270" stroke="#6b4c30" strokeWidth="3" strokeLinecap="round" pointerEvents="none" />
              <line x1="935" y1="285" x2="915" y2="255" stroke="#6b4c30" strokeWidth="3" strokeLinecap="round" pointerEvents="none" />
              <line x1="935" y1="285" x2="955" y2="260" stroke="#6b4c30" strokeWidth="3" strokeLinecap="round" pointerEvents="none" />
            </g>

            {/* Shadow effects on building */}
            {/* Left side shadow */}
            <rect x="85" y="160" width="15" height="304" fill="black" opacity="0.07" pointerEvents="none" />
            {/* Roof overhang shadow on fascia */}
            <rect x="70" y="122" width="760" height="8" fill="black" opacity="0.12" pointerEvents="none" />
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
