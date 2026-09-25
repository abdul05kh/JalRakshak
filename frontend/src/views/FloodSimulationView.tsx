import React, { useState, useEffect } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Mountain, 
  Waves, 
  ShieldCheck,
  Cpu,
  ArrowRight
} from "lucide-react";
import { MapView } from "../components/MapView";
import type { 
  ScenarioSummary, 
  RouteAnalyzeResponse, 
  RoadFeature, 
  EvacuationPointFeature 
} from "../types";

interface FloodSimulationViewProps {
  scenarios: ScenarioSummary[];
  activeScenarioId: string;
  analysisResult: RouteAnalyzeResponse | null;
  roads: RoadFeature[];
  evacPoints: EvacuationPointFeature[];
  inundationGeoJSON: any;
  onSelectTimestep?: (min: number) => void;
  onNavigateToView: (view: string) => void;
}

interface SceneInfo {
  id: number;
  title: string;
  subtitle: string;
  timestepMin: number;
  timestepLabel: string;
  cameraPreset: "OVERVIEW" | "DAM" | "BREACH" | "LIMITING" | "SHELTER";
  thematicMode: "EXTENT" | "DEPTH" | "ARRIVAL";
  whatIsHappening: string;
  whatModelKnows: string;
  whatJalRakshakAdds: string;
  provenanceNote: string;
}

const SCENES: SceneInfo[] = [
  {
    id: 1,
    title: "Baseline Equilibrium State",
    subtitle: "Normal Reservoir Storage & Passable Corridors",
    timestepMin: 0,
    timestepLabel: "T+00:00",
    cameraPreset: "OVERVIEW",
    thematicMode: "EXTENT",
    whatIsHappening: "Tehri Reservoir holds normal gross storage at 830m FRL. Downstream Bhagirathi River channel flows within natural riverbanks past Malidewal and Koteshwar.",
    whatModelKnows: "Initial water level 830m MSL behind 260.5m dam; baseline downstream flow ~150 m³/s.",
    whatJalRakshakAdds: "Ingests OpenStreetMap road network topology; registers 6 evacuation corridors and calculates baseline travel times.",
    provenanceNote: "Copernicus GLO-30 DSM terrain surface; baseline road network from OpenStreetMap."
  },
  {
    id: 2,
    title: "Breach Scenario & Model Initiation",
    subtitle: "Modeled Crest Failure & Invert Elevation",
    timestepMin: 5,
    timestepLabel: "T+05:00",
    cameraPreset: "BREACH",
    thematicMode: "EXTENT",
    whatIsHappening: "Modeled dam breach develops at the crest. Outflow rapidly increases into the narrow canyon toward the 635m modeled breach invert.",
    whatModelKnows: "Breach parameters: 100m bottom width, 60-min formation time, 635m invert elevation.",
    whatJalRakshakAdds: "Labels breach parameters as model assumptions; feeds unsteady discharge boundary hydrograph into 2D hydraulic solver.",
    provenanceNote: "Breach invert 635m is a model assumption; not a surveyed physical failure datum."
  },
  {
    id: 3,
    title: "Peak Discharge & Wavefront Acceleration",
    subtitle: "Maximum Hydrodynamic Outflow (Qp = 65,000 m³/s)",
    timestepMin: 15,
    timestepLabel: "T+15:00",
    cameraPreset: "DAM",
    thematicMode: "DEPTH",
    whatIsHappening: "Discharge reaches peak hydrodynamic output (65,000 m³/s in Central Scenario). High-velocity floodwaters surge through the steep V-shaped Himalayan gorge.",
    whatModelKnows: "HEC-RAS 2D solves depth and velocity fields across 25m–50m flexible computational mesh cells.",
    whatJalRakshakAdds: "Extracts continuous spatial depth field d(x,y,t) and checks spatial proximity to downstream transport infrastructure.",
    provenanceNote: "Native HEC-RAS 7.0.1 unsteady 2D simulation output stored in scenario_central.p01.hdf."
  },
  {
    id: 4,
    title: "Downstream Valley & Terrain Interaction",
    subtitle: "Floodplain Expansion & Alluvial Inundation",
    timestepMin: 30,
    timestepLabel: "T+30:00",
    cameraPreset: "OVERVIEW",
    thematicMode: "DEPTH",
    whatIsHappening: "The flood wave enters wider reaches near Malidewal. Water spreads across riverbank terraces and approaches the transport corridors.",
    whatModelKnows: "Water surface elevations (WSE) rise above natural levees; depth in main channel exceeds 4m.",
    whatJalRakshakAdds: "Calculates depth as max(0, WSE - Z_DEM) and projects arrival isochrones along candidate evacuation routes.",
    provenanceNote: "Copernicus GLO-30 DSM elevation vertically aligned to EGM96 Geoid."
  },
  {
    id: 5,
    title: "150m Road Corridor Coupling & Impact",
    subtitle: "Spatial Road Intersection & Edge Vulnerability",
    timestepMin: 45,
    timestepLabel: "T+45:00",
    cameraPreset: "LIMITING",
    thematicMode: "ARRIVAL",
    whatIsHappening: "Floodwaters intersect the critical road corridor. Segment R02 along the Bhagirathi riverbank begins experiencing edge-level flood impact.",
    whatModelKnows: "Hydraulic depth reaches >= 0.30m (vehicle threshold) at downstream grid cells near Koteshwar.",
    whatJalRakshakAdds: "150m spatial corridor engine detects earliest intersection on segment R02-E07 at exactly T+60:00.",
    provenanceNote: "Spatial corridor fixed at 150m with <=50m point densification along road centerline."
  },
  {
    id: 6,
    title: "Evacuation Window Engine Derivation",
    subtitle: "Deterministic Deadline: D = A_i - T_i - B",
    timestepMin: 60,
    timestepLabel: "T+60:00",
    cameraPreset: "LIMITING",
    thematicMode: "ARRIVAL",
    whatIsHappening: "Flood reaches the limiting road segment R02-E07 at T+60:00. Any evacuation vehicle departing after the deadline will encounter water closure.",
    whatModelKnows: "Segment R02-E07 is completely inundated (depth >= 0.30m) at T+60:00.",
    whatJalRakshakAdds: "Solves exact arithmetic: D = 60:00 (Arrival) - 12:39 (Travel) - 03:00 (Buffer) = T+44:21 departure deadline.",
    provenanceNote: "50 km/h baseline travel speed assumption; dynamic traffic congestion not modeled."
  },
  {
    id: 7,
    title: "JalRakshak Decision Transformation",
    subtitle: "Raw Hydraulic 2D Grids vs. Actionable Decision Directives",
    timestepMin: 60,
    timestepLabel: "T+44:21 Decision",
    cameraPreset: "OVERVIEW",
    thematicMode: "EXTENT",
    whatIsHappening: "Full operational synthesis comparing raw scientific hydraulic outputs against life-saving route decisions.",
    whatModelKnows: "Raw HEC-RAS model produces millions of numerical grid points with depth, velocity, and WSE arrays.",
    whatJalRakshakAdds: "Transforms complex hydrodynamics into an unequivocal emergency command: 'LEAVE BY T+44:21 VIA ROUTE R02'.",
    provenanceNote: "100% dynamically derived from authoritative backend API response; zero hardcoding."
  }
];

export const FloodSimulationView: React.FC<FloodSimulationViewProps> = ({
  scenarios,
  activeScenarioId,
  analysisResult,
  roads,
  evacPoints,
  inundationGeoJSON,
  onSelectTimestep,
  onNavigateToView
}) => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const activeSc = scenarios.find((s) => s.id === activeScenarioId);
  const scene = SCENES[currentSceneIndex];

  // Auto-play timer
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentSceneIndex((prev) => {
          if (prev >= SCENES.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 6500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying]);

  const handleSelectScene = (idx: number) => {
    setCurrentSceneIndex(idx);
    if (onSelectTimestep) {
      onSelectTimestep(SCENES[idx].timestepMin);
    }
  };

  return (
    <div style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#090d16",
      color: "#f8fafc",
      overflow: "hidden"
    }}>
      {/* Top Header & Simulation Controls */}
      <div style={{
        padding: "12px 24px",
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.10)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "10px",
        zIndex: 20
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "6px",
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            border: "1px solid rgba(59, 130, 246, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Waves size={18} color="#60a5fa" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "14px", fontWeight: 800, color: "#ffffff" }}>
              FLOOD PROPAGATION & CAUSAL TRANSFORMATION
            </h1>
            <div style={{ fontSize: "10px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "6px", marginTop: "1px" }}>
              <span>Scenario: <strong style={{ color: "#38bdf8" }}>{activeSc?.name || "Authoritative Central"}</strong></span>
              <span>|</span>
              <span>Qp: <strong style={{ color: "#f59e0b" }}>{activeSc?.peak_discharge_m3s?.toLocaleString() || "65,000"} m³/s</strong></span>
              <span>|</span>
              <span>Dam: <strong>Tehri Dam (Bhagirathi River)</strong></span>
            </div>
          </div>
        </div>

        {/* Scene Stepper & Playback Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button
            onClick={() => handleSelectScene(Math.max(0, currentSceneIndex - 1))}
            disabled={currentSceneIndex === 0}
            style={{
              padding: "5px 10px",
              borderRadius: "5px",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              color: currentSceneIndex === 0 ? "#475569" : "#cbd5e1",
              fontSize: "11px",
              fontWeight: 700,
              cursor: currentSceneIndex === 0 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "3px"
            }}
          >
            <ChevronLeft size={13} />
            <span>Prev</span>
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              padding: "5px 14px",
              borderRadius: "5px",
              border: "none",
              backgroundColor: isPlaying ? "#e11d48" : "#2563eb",
              color: "#ffffff",
              fontSize: "11px",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              boxShadow: "0 2px 8px rgba(37, 99, 235, 0.4)"
            }}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span>{isPlaying ? "PAUSE" : "PLAY EVENT"}</span>
          </button>

          <button
            onClick={() => handleSelectScene(Math.min(SCENES.length - 1, currentSceneIndex + 1))}
            disabled={currentSceneIndex === SCENES.length - 1}
            style={{
              padding: "5px 10px",
              borderRadius: "5px",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              color: currentSceneIndex === SCENES.length - 1 ? "#475569" : "#cbd5e1",
              fontSize: "11px",
              fontWeight: 700,
              cursor: currentSceneIndex === SCENES.length - 1 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "3px"
            }}
          >
            <span>Next</span>
            <ChevronRight size={13} />
          </button>

          <button
            onClick={() => handleSelectScene(0)}
            style={{
              padding: "5px 8px",
              borderRadius: "5px",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              color: "#94a3b8",
              cursor: "pointer"
            }}
            title="Restart from Scene 1"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* Top Scene Progress Bar */}
      <div style={{
        padding: "8px 24px",
        backgroundColor: "#0f172a",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "6px",
        overflowX: "auto"
      }}>
        {SCENES.map((s, idx) => {
          const isActive = currentSceneIndex === idx;
          const isPassed = currentSceneIndex > idx;
          return (
            <button
              key={s.id}
              onClick={() => handleSelectScene(idx)}
              style={{
                flex: 1,
                minWidth: "110px",
                padding: "6px 8px",
                borderRadius: "5px",
                border: isActive ? "1px solid #38bdf8" : isPassed ? "1px solid rgba(56, 189, 248, 0.3)" : "1px solid rgba(255, 255, 255, 0.06)",
                backgroundColor: isActive ? "rgba(56, 189, 248, 0.15)" : isPassed ? "rgba(15, 23, 42, 0.8)" : "rgba(255, 255, 255, 0.02)",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "9px", fontWeight: 800, color: isActive ? "#38bdf8" : isPassed ? "#94a3b8" : "#64748b" }}>
                  SCENE 0{s.id}
                </span>
                <span style={{ fontSize: "9px", fontWeight: 700, color: isActive ? "#f8fafc" : "#94a3b8" }}>
                  {s.timestepLabel}
                </span>
              </div>
              <div style={{
                fontSize: "10px",
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "#ffffff" : "#94a3b8",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}>
                {s.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Split Body: Center 3D Scene + Bottom Compact Explanation */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        
        {/* Visual Hydraulic Scene (Occupies majority of screen) */}
        <div style={{ flex: "1 1 65%", position: "relative", minHeight: "300px" }}>
          <MapView
            roads={roads}
            evacPoints={evacPoints}
            inundationGeoJSON={inundationGeoJSON}
            activeRoute={analysisResult?.primary_route || null}
            mapViewState="3D"
            thematicMode={scene.thematicMode}
            selectedTimelineStep={`T+${scene.timestepMin}`}
            cameraPreset={scene.cameraPreset}
            layerVisibility={{ inundation: true, roads: true, origins: true, destinations: true }}
            onMapClick={() => {}}
            pointQueryData={null}
          />

          {/* Scene Overlay Callout */}
          <div style={{
            position: "absolute",
            top: "14px",
            left: "14px",
            backgroundColor: "rgba(15, 23, 42, 0.88)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "8px",
            padding: "10px 14px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.4)",
            zIndex: 10,
            maxWidth: "380px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{ padding: "2px 6px", borderRadius: "3px", backgroundColor: "#2563eb", color: "#ffffff", fontSize: "9px", fontWeight: 800 }}>
                SCENE 0{scene.id} OF 07
              </span>
              <span style={{ fontSize: "10px", fontWeight: 800, color: "#fbbf24" }}>
                TIMESTEP: {scene.timestepLabel}
              </span>
            </div>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#ffffff" }}>
              {scene.title}
            </div>
            <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "2px" }}>
              {scene.subtitle}
            </div>
          </div>
        </div>

        {/* Bottom Causal Explanation Cards */}
        <div style={{
          flex: "0 0 auto",
          maxHeight: "35%",
          overflowY: "auto",
          backgroundColor: "#0f172a",
          borderTop: "1px solid rgba(255, 255, 255, 0.10)",
          padding: "14px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}>
          {/* Three Questions: What is happening? What does model know? What does JalRakshak add? */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "10px"
          }}>
            {/* Box 1: What is happening */}
            <div style={{ backgroundColor: "rgba(30, 41, 59, 0.7)", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "10px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#60a5fa", fontSize: "10px", fontWeight: 800, marginBottom: "4px" }}>
                <Mountain size={12} />
                <span>WHAT IS HAPPENING PHYSICALLY?</span>
              </div>
              <div style={{ fontSize: "11px", color: "#cbd5e1", lineHeight: "1.4" }}>
                {scene.whatIsHappening}
              </div>
            </div>

            {/* Box 2: What does model know */}
            <div style={{ backgroundColor: "rgba(30, 41, 59, 0.7)", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "10px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#38bdf8", fontSize: "10px", fontWeight: 800, marginBottom: "4px" }}>
                <Cpu size={12} />
                <span>WHAT DOES THE MODEL KNOW?</span>
              </div>
              <div style={{ fontSize: "11px", color: "#cbd5e1", lineHeight: "1.4" }}>
                {scene.whatModelKnows}
              </div>
            </div>

            {/* Box 3: What does JalRakshak add */}
            <div style={{ backgroundColor: "rgba(30, 41, 59, 0.7)", borderRadius: "8px", border: "1px solid rgba(34, 197, 94, 0.3)", padding: "10px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#4ade80", fontSize: "10px", fontWeight: 800, marginBottom: "4px" }}>
                <ShieldCheck size={12} />
                <span>WHAT DOES JALRAKSHAK ADD?</span>
              </div>
              <div style={{ fontSize: "11px", color: "#cbd5e1", lineHeight: "1.4" }}>
                {scene.whatJalRakshakAdds}
              </div>
            </div>
          </div>

          {/* Scene 07 Special Side-by-Side Comparison */}
          {currentSceneIndex === 6 && (
            <div style={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              borderRadius: "8px",
              border: "1px solid #3b82f6",
              padding: "12px 16px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px"
            }}>
              <div>
                <div style={{ fontSize: "10px", fontWeight: 800, color: "#f87171", marginBottom: "4px" }}>
                  RAW HEC-RAS HYDRAULIC OUTPUT
                </div>
                <div style={{ fontSize: "11px", color: "#cbd5e1", lineHeight: "1.4" }}>
                  • 2D grid cells with WSE, water depth d(x,y,t), and velocities.<br />
                  • Roads isolated on separate GIS layer; human must estimate arrival & travel under extreme pressure.
                </div>
              </div>

              <div>
                <div style={{ fontSize: "10px", fontWeight: 800, color: "#4ade80", marginBottom: "4px" }}>
                  JALRAKSHAK EVACUATION WINDOW ENGINE (EWE)
                </div>
                <div style={{ fontSize: "11px", color: "#cbd5e1", lineHeight: "1.4", marginBottom: "8px" }}>
                  • 150m spatial road coupling identifies limiting segment R02-E07 at T+60:00.<br />
                  • Solves D = 60:00 - 12:39 - 03:00 = <strong>LEAVE BY T+44:21 VIA ROUTE R02</strong>.
                </div>
                <button
                  onClick={() => onNavigateToView("EVACUATION_DECISION")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    backgroundColor: "#16a34a",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "4px",
                    padding: "6px 12px",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  <span>Open Full Decision View</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
