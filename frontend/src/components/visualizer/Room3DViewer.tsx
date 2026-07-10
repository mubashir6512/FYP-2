import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  PointerLockControls,
  Environment,
  ContactShadows,
  SoftShadows,
  Grid,
} from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Loader2,
  MousePointer2,
  Move3d,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  RotateCw,
} from "lucide-react";
import type { SideResult } from "./SideGallery";

interface Room3DViewerProps {
  results: SideResult[];
  fallbackHex: string;
  mode: "interior" | "exterior";
}

/* ---------- Texture helpers ---------- */

function useWallTexture(url: string | undefined) {
  return useMemo(() => {
    if (!url) return null;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    const tex = loader.load(url);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 16;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, [url]);
}

function wallMaterial(tex: THREE.Texture | null, hex: string) {
  if (!tex) {
    return new THREE.MeshStandardMaterial({
      color: hex,
      roughness: 0.9,
      metalness: 0,
    });
  }
  return new THREE.MeshStandardMaterial({
    map: tex,
    roughness: 0.85,
    metalness: 0,
  });
}

/* ---------- Procedural floor (wood planks) ---------- */

function useWoodTexture() {
  return useMemo(() => {
    const size = 512;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d")!;
    // base
    ctx.fillStyle = "#6b4a2b";
    ctx.fillRect(0, 0, size, size);
    // planks
    const plankH = 64;
    for (let y = 0; y < size; y += plankH) {
      const shade = 30 + Math.floor(Math.random() * 50);
      ctx.fillStyle = `rgb(${100 + shade},${70 + shade / 2},${40 + shade / 3})`;
      ctx.fillRect(0, y, size, plankH - 2);
      // grain
      ctx.strokeStyle = "rgba(40,25,10,0.25)";
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(0, y + Math.random() * plankH);
        ctx.bezierCurveTo(
          size / 3,
          y + Math.random() * plankH,
          (size * 2) / 3,
          y + Math.random() * plankH,
          size,
          y + Math.random() * plankH
        );
        ctx.stroke();
      }
      // seam
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(0, y + plankH - 2, size, 2);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 3);
    tex.anisotropy = 16;
    return tex;
  }, []);
}

/* ---------- Interior room ---------- */

function InteriorRoom({
  results,
  hex,
}: {
  results: SideResult[];
  hex: string;
}) {
  const get = (side: string) => results.find((r) => r.side === side)?.paintedUrl;

  // Room-scale (meters): larger, more immersive
  const W = 12;
  const H = 6;
  const D = 10;

  const frontTex = useWallTexture(get("front"));
  const backTex = useWallTexture(get("back"));
  const leftTex = useWallTexture(get("left"));
  const rightTex = useWallTexture(get("right"));
  const woodTex = useWoodTexture();

  const materials = useMemo(
    () => ({
      front: wallMaterial(frontTex, hex),
      back: wallMaterial(backTex, hex),
      left: wallMaterial(leftTex, hex),
      right: wallMaterial(rightTex, hex),
      floor: new THREE.MeshStandardMaterial({
        map: woodTex,
        roughness: 0.7,
        metalness: 0.05,
      }),
      ceil: new THREE.MeshStandardMaterial({
        color: "#faf7f2",
        roughness: 0.95,
      }),
      trim: new THREE.MeshStandardMaterial({
        color: "#f2ede4",
        roughness: 0.6,
      }),
    }),
    [frontTex, backTex, leftTex, rightTex, woodTex, hex]
  );

  // Baseboard trim height
  const trimH = 0.18;

  return (
    <group>
      {/* Floor */}
      <mesh
        position={[0, -H / 2, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={materials.floor}
        receiveShadow
      >
        <planeGeometry args={[W, D]} />
      </mesh>
      {/* Ceiling */}
      <mesh
        position={[0, H / 2, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        material={materials.ceil}
      >
        <planeGeometry args={[W, D]} />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 0, -D / 2]} material={materials.front} receiveShadow>
        <planeGeometry args={[W, H]} />
      </mesh>
      <mesh
        position={[0, 0, D / 2]}
        rotation={[0, Math.PI, 0]}
        material={materials.back}
        receiveShadow
      >
        <planeGeometry args={[W, H]} />
      </mesh>
      <mesh
        position={[-W / 2, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        material={materials.left}
        receiveShadow
      >
        <planeGeometry args={[D, H]} />
      </mesh>
      <mesh
        position={[W / 2, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        material={materials.right}
        receiveShadow
      >
        <planeGeometry args={[D, H]} />
      </mesh>

      {/* Baseboards */}
      {[
        { p: [0, -H / 2 + trimH / 2, -D / 2 + 0.001] as [number, number, number], r: [0, 0, 0] as [number, number, number], s: [W, trimH, 0.02] as [number, number, number] },
        { p: [0, -H / 2 + trimH / 2, D / 2 - 0.001] as [number, number, number], r: [0, Math.PI, 0] as [number, number, number], s: [W, trimH, 0.02] as [number, number, number] },
        { p: [-W / 2 + 0.001, -H / 2 + trimH / 2, 0] as [number, number, number], r: [0, Math.PI / 2, 0] as [number, number, number], s: [D, trimH, 0.02] as [number, number, number] },
        { p: [W / 2 - 0.001, -H / 2 + trimH / 2, 0] as [number, number, number], r: [0, -Math.PI / 2, 0] as [number, number, number], s: [D, trimH, 0.02] as [number, number, number] },
      ].map((t, i) => (
        <mesh key={i} position={t.p} rotation={t.r} material={materials.trim}>
          <boxGeometry args={t.s} />
        </mesh>
      ))}

      {/* Ceiling light source visual */}
      <mesh position={[0, H / 2 - 0.05, 0]}>
        <circleGeometry args={[0.6, 32]} />
        <meshBasicMaterial color="#fff6dc" />
      </mesh>
    </group>
  );
}

/* ---------- Exterior building ---------- */

function ExteriorBuilding({
  results,
  hex,
}: {
  results: SideResult[];
  hex: string;
}) {
  const get = (side: string) => results.find((r) => r.side === side)?.paintedUrl;
  const W = 7;
  const H = 6;
  const D = 7;

  const frontTex = useWallTexture(get("front"));
  const backTex = useWallTexture(get("back"));
  const leftTex = useWallTexture(get("left"));
  const rightTex = useWallTexture(get("right"));

  const materials = useMemo(
    () => ({
      front: wallMaterial(frontTex, hex),
      back: wallMaterial(backTex, hex),
      left: wallMaterial(leftTex, hex),
      right: wallMaterial(rightTex, hex),
      roof: new THREE.MeshStandardMaterial({
        color: "#2f2b28",
        roughness: 0.9,
      }),
      ground: new THREE.MeshStandardMaterial({
        color: "#5f6f4a",
        roughness: 1,
      }),
    }),
    [frontTex, backTex, leftTex, rightTex, hex]
  );

  return (
    <group>
      <mesh
        position={[0, -H / 2 - 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={materials.ground}
        receiveShadow
      >
        <planeGeometry args={[80, 80]} />
      </mesh>
      {/* Building box (single mesh, one material per face) */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, H, D]} />
        {/* order: +X, -X, +Y, -Y, +Z, -Z */}
        <primitive object={materials.right} attach="material-0" />
        <primitive object={materials.left} attach="material-1" />
        <primitive object={materials.roof} attach="material-2" />
        <primitive object={materials.ground} attach="material-3" />
        <primitive object={materials.front} attach="material-4" />
        <primitive object={materials.back} attach="material-5" />
      </mesh>
    </group>
  );
}

/* ---------- Walk-mode player (WASD) ---------- */

function WalkPlayer({ bounds }: { bounds: { W: number; D: number; H: number } }) {
  const { camera } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  const velocity = useRef(new THREE.Vector3());

  useEffect(() => {
    const down = (e: KeyboardEvent) => (keys.current[e.code] = true);
    const up = (e: KeyboardEvent) => (keys.current[e.code] = false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useFrame((_, delta) => {
    const speed = 3.5;
    const dir = new THREE.Vector3();
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();

    if (keys.current["KeyW"] || keys.current["ArrowUp"]) dir.add(forward);
    if (keys.current["KeyS"] || keys.current["ArrowDown"]) dir.sub(forward);
    if (keys.current["KeyD"] || keys.current["ArrowRight"]) dir.add(right);
    if (keys.current["KeyA"] || keys.current["ArrowLeft"]) dir.sub(right);
    dir.normalize().multiplyScalar(speed * delta);

    velocity.current.lerp(dir, 0.4);
    camera.position.add(velocity.current);

    // Clamp inside room with padding
    const pad = 0.5;
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -bounds.W / 2 + pad, bounds.W / 2 - pad);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -bounds.D / 2 + pad, bounds.D / 2 - pad);
    camera.position.y = -bounds.H / 2 + 1.7; // eye height
  });

  return null;
}

/* ---------- Fallback ---------- */

function WebGLFallback() {
  return (
    <div className="aspect-video rounded-xl bg-muted flex items-center justify-center text-center p-6">
      <p className="text-muted-foreground">
        3D view requires WebGL — your browser doesn't support it.
      </p>
    </div>
  );
}

/* ---------- Main component ---------- */

export default function Room3DViewer({ results, fallbackHex, mode }: Room3DViewerProps) {
  const [walkMode, setWalkMode] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [fov, setFov] = useState(mode === "interior" ? 75 : 50);
  const [daytime, setDaytime] = useState<"day" | "evening" | "night">("day");
  const shellRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<any>(null);

  const supportsWebGL = useMemo(() => {
    try {
      const canvas = document.createElement("canvas");
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
    } catch {
      return false;
    }
  }, []);

  const toggleFullscreen = () => {
    if (!shellRef.current) return;
    if (!document.fullscreenElement) {
      shellRef.current.requestFullscreen?.();
      setFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setFullscreen(false);
    }
  };

  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  if (!supportsWebGL) return <WebGLFallback />;

  const bounds = { W: 12, H: 6, D: 10 };
  const envPreset =
    daytime === "day" ? "apartment" : daytime === "evening" ? "sunset" : "night";
  const ambientIntensity = daytime === "night" ? 0.15 : daytime === "evening" ? 0.4 : 0.7;
  const keyLightIntensity = daytime === "night" ? 0.2 : daytime === "evening" ? 0.7 : 1.1;
  const ceilingLight = daytime === "night" ? 1.4 : 0.6;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <p className="text-sm text-muted-foreground">
          {mode === "interior"
            ? walkMode
              ? "Click canvas to lock cursor · WASD/Arrows to walk · Esc to exit"
              : "Drag to look around · Scroll to zoom"
            : "Drag to orbit · Scroll to zoom · Right-drag to pan"}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 w-40">
            <span className="text-xs text-muted-foreground whitespace-nowrap">FOV</span>
            <Slider value={[fov]} min={45} max={100} step={1} onValueChange={(v) => setFov(v[0])} />
          </div>
          <div className="flex rounded-md border border-border overflow-hidden">
            <button
              onClick={() => setDaytime("day")}
              className={`px-2 py-1 text-xs flex items-center gap-1 ${daytime === "day" ? "bg-accent text-accent-foreground" : "bg-background text-muted-foreground"}`}
            >
              <Sun className="w-3 h-3" />Day
            </button>
            <button
              onClick={() => setDaytime("evening")}
              className={`px-2 py-1 text-xs ${daytime === "evening" ? "bg-accent text-accent-foreground" : "bg-background text-muted-foreground"}`}
            >
              Dusk
            </button>
            <button
              onClick={() => setDaytime("night")}
              className={`px-2 py-1 text-xs flex items-center gap-1 ${daytime === "night" ? "bg-accent text-accent-foreground" : "bg-background text-muted-foreground"}`}
            >
              <Moon className="w-3 h-3" />Night
            </button>
          </div>
          {mode === "interior" && (
            <Button
              variant={walkMode ? "default" : "outline"}
              size="sm"
              onClick={() => setWalkMode((v) => !v)}
            >
              {walkMode ? <MousePointer2 className="w-4 h-4 mr-2" /> : <Move3d className="w-4 h-4 mr-2" />}
              {walkMode ? "Exit walk" : "Walk mode"}
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => controlsRef.current?.reset?.()}>
            <RotateCw className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={toggleFullscreen}>
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div
        ref={shellRef}
        className="rounded-xl overflow-hidden bg-foreground/90 border border-border relative"
        style={{ height: fullscreen ? "100vh" : "min(78vh, 760px)" }}
      >
        <Suspense
          fallback={
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
          }
        >
          <Canvas
            shadows
            dpr={[1, 2]}
            gl={{ antialias: true, powerPreference: "high-performance" }}
            camera={{
              position: mode === "interior" ? [0, -1.2, 0.5] : [12, 5, 12],
              fov,
              near: 0.05,
              far: 200,
            }}
          >
            <SoftShadows size={25} samples={12} focus={0.9} />

            <ambientLight intensity={ambientIntensity} />

            {mode === "interior" ? (
              <>
                {/* Ceiling lamp */}
                <pointLight
                  position={[0, bounds.H / 2 - 0.3, 0]}
                  intensity={ceilingLight * 30}
                  distance={20}
                  decay={2}
                  color="#fff2d4"
                  castShadow
                />
                {/* Window key light through "front" wall */}
                <directionalLight
                  position={[3, 2, -8]}
                  intensity={keyLightIntensity}
                  color={daytime === "evening" ? "#ffb47a" : "#ffffff"}
                  castShadow
                  shadow-mapSize-width={1024}
                  shadow-mapSize-height={1024}
                />
                <InteriorRoom results={results} hex={fallbackHex} />
                {walkMode ? (
                  <>
                    <PointerLockControls />
                    <WalkPlayer bounds={bounds} />
                  </>
                ) : (
                  <OrbitControls
                    ref={controlsRef}
                    enablePan
                    enableDamping
                    dampingFactor={0.08}
                    rotateSpeed={-0.35}
                    zoomSpeed={0.8}
                    minDistance={0.2}
                    maxDistance={9}
                    maxPolarAngle={Math.PI - 0.05}
                    minPolarAngle={0.05}
                    target={[0, 0, 0]}
                  />
                )}
              </>
            ) : (
              <>
                <directionalLight
                  position={[10, 15, 8]}
                  intensity={keyLightIntensity * 1.2}
                  color={daytime === "evening" ? "#ffb47a" : "#ffffff"}
                  castShadow
                  shadow-mapSize-width={2048}
                  shadow-mapSize-height={2048}
                />
                <ExteriorBuilding results={results} hex={fallbackHex} />
                <ContactShadows position={[0, -3.01, 0]} opacity={0.5} scale={30} blur={2.5} far={8} />
                <Grid
                  position={[0, -3, 0]}
                  args={[60, 60]}
                  cellSize={1}
                  cellColor="#3a4a2e"
                  sectionSize={5}
                  sectionColor="#2a3a1e"
                  fadeDistance={40}
                  infiniteGrid
                />
                <Environment preset={envPreset as any} background={false} />
                <OrbitControls
                  ref={controlsRef}
                  enablePan
                  enableDamping
                  dampingFactor={0.08}
                  minDistance={5}
                  maxDistance={30}
                  maxPolarAngle={Math.PI / 2 - 0.05}
                  target={[0, 0, 0]}
                />
              </>
            )}
          </Canvas>
        </Suspense>
      </div>
    </div>
  );
}
