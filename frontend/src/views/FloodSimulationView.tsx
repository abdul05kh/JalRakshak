import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Layers, 
  Video, 
  ArrowRight
} from "lucide-react";
import { MapView } from "../components/MapView";
import type { 
  ScenarioSummary, 
  RouteAnalyzeResponse, 
  RoadFeature, 
  EvacuationPointFeature 
} from "../types";
import { getAuthoritativeDecision } from "../services/decisionStore";

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

// Authoritative key temporal milestone events
const TEMPORAL_EVENTS: {
  minTime: number;
  maxTime: number;
  label: string;
  sublabel: string;
  stateBadge: string;
  stateColor: string;
}[] = [
  {
    minTime: 0,
    maxTime: 14,
    label: "T+00:00 — Reservoir Equilibrium & Breach Initiation",
    sublabel: "Tehri Dam gross storage at 830m FRL. Modeled breach developing into canyon.",
    stateBadge: "INITIATION",
    stateColor: "#38bdf8"
  },
  {
    minTime: 15,
    maxTime: 44,
    label: "T+15:00 — Peak Hydrodynamic Discharge Wavefront",
    sublabel: "High-velocity surge propagating through steep V-shaped Himalayan gorge.",
    stateBadge: "PEAK SURGE",
    stateColor: "#f59e0b"
  },
  {
    minTime: 45,
    maxTime: 59,
    label: "T+45:00 — Downstream Valley & Road Corridor Intersection",
    sublabel: "Floodwaters enter alluvial reach near Malidewal. Approaching transport corridors.",
    stateBadge: "CORRIDOR IMPACT",
    stateColor: "#f97316"
  },
  {
    minTime: 60,
    maxTime: 120,
    label: "T+60:00 — Limiting Segment Inundation (R02-E07 Threshold Exceeded)",
    sublabel: "Water depth reaches h >= 0.30m on Koteshwar riverbank corridor. Evacuation window closed.",
    stateBadge: "LIMITING CLOSURE",
    stateColor: "#ef4444"
  }
];

const TIMESTEP_MARKERS = [0, 15, 30, 45, 60, 75, 90, 105, 120];

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
  const [currentTimeMin, setCurrentTimeMin] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [thematicMode, setThematicMode] = useState<"EXTENT" | "DEPTH" | "ARRIVAL">("DEPTH");
  const [cameraPreset, setCameraPreset] = useState<string>("OVERVIEW");

  const timerRef = useRef<number | null>(null);

  const activeSc = scenarios.find((s) => s.id === activeScenarioId);
  const decision = getAuthoritativeDecision(activeScenarioId, "R02");

  // Continuous temporal clock
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = 1000 / playbackSpeed;
      timerRef.current = window.setInterval(() => {
        setCurrentTimeMin((prev) => {
          const next = prev + 1;
          if (next > 120) {
            setIsPlaying(false);
            return 120;
          }
          if (onSelectTimestep && next % 5 === 0) {
            onSelectTimestep(next);
          }
          return next;
        });
      }, intervalMs);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, onSelectTimestep]);

  const handleSeek = (timeMin: number) => {
    setCurrentTimeMin(timeMin);
    if (onSelectTimestep) {
      onSelectTimestep(timeMin);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTimeMin(0);
    if (onSelectTimestep) {
      onSelectTimestep(0);
    }
  };

  // Find active milestone event
  const currentEvent = TEMPORAL_EVENTS.find(
    (ev) => currentTimeMin >= ev.minTime && currentTimeMin <= ev.maxTime
  ) || TEMPORAL_EVENTS[0];

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", backgroundColor: "#060913" }}>
      {/* 1. Full 3D Map Viewport */}
      <MapView
        roads={roads}
        evacPoints={evacPoints}
        inundationGeoJSON={inundationGeoJSON}
        activeRoute={analysisResult?.primary_route || null}
        mapViewState="3D"
        thematicMode={thematicMode}
        selectedTimelineStep={`T+${currentTimeMin}`}
        cameraPreset={cameraPreset}
        layerVisibility={{ inundation: true, roads: true, origins: true, destinations: true }}
        onMapClick={() => {}}
        pointQueryData={null}
      />

      {/* 2. Top-Center Camera Presets Bar */}
      <div
        style={{
          position: "absolute",
          top: "14px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 800,
          backgroundColor: "rgba(11, 17, 32, 0.92)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "6px",
          padding: "4px 8px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "0 6px", borderRight: "1px solid rgba(255,255,255,0.15)", color: "#94a3b8", fontSize: "10px", fontWeight: 800 }}>
          <Video size={12} color="#38bdf8" />
          <span>VIEW:</span>
        </div>
        {[
          { id: "OVERVIEW", label: "OVERVIEW" },
          { id: "DAM", label: "DAM" },
          { id: "BREACH", label: "BREACH" },
          { id: "DOWNSTREAM", label: "VALLEY" },
          { id: "LIMITING", label: "LIMITING EDGE" },
          { id: "SHELTER", label: "SHELTER" }
        ].map((btn) => {
          const isActive = cameraPreset === btn.id;
          return (
            <button
              key={btn.id}
              onClick={() => setCameraPreset(btn.id)}
              style={{
                padding: "4px 8px",
                borderRadius: "4px",
                border: isActive ? "1px solid #38bdf8" : "1px solid transparent",
                backgroundColor: isActive ? "rgba(56, 189, 248, 0.2)" : "transparent",
                color: isActive ? "#ffffff" : "#cbd5e1",
                fontSize: "10px",
                fontWeight: isActive ? 800 : 600,
                cursor: "pointer"
              }}
            >
              {btn.label}
            </button>
          );
        })}
      </div>

      {/* 3. Top-Right Thematic Mode Switcher */}
      <div
        style={{
          position: "absolute",
          top: "14px",
          right: "14px",
          zIndex: 800,
          backgroundColor: "rgba(11, 17, 32, 0.92)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "6px",
          padding: "6px 8px",
          display: "flex",
          flexDirection: "column",
          gap: "4px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#94a3b8", fontSize: "9px", fontWeight: 800, textTransform: "uppercase" }}>
          <Layers size={11} color="#38bdf8" />
          <span>HYDRAULIC LAYER</span>
        </div>
        <div style={{ display: "flex", gap: "3px" }}>
          {(["EXTENT", "DEPTH", "ARRIVAL"] as const).map((m) => {
            const isActive = thematicMode === m;
            return (
              <button
                key={m}
                onClick={() => setThematicMode(m)}
                style={{
                  padding: "3px 7px",
                  borderRadius: "3px",
                  border: isActive ? "1px solid #38bdf8" : "1px solid transparent",
                  backgroundColor: isActive ? "rgba(56, 189, 248, 0.25)" : "transparent",
                  color: isActive ? "#ffffff" : "#94a3b8",
                  fontSize: "9.5px",
                  fontWeight: isActive ? 800 : 600,
                  cursor: "pointer"
                }}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Top-Left Context & Scenario Status Strip */}
      <div
        style={{
          position: "absolute",
          top: "14px",
          left: "14px",
          zIndex: 800,
          backgroundColor: "rgba(11, 17, 32, 0.92)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "6px",
          padding: "8px 12px",
          maxWidth: "320px",
          display: "flex",
          flexDirection: "column",
          gap: "4px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#ffffff" }}>
            HEC-RAS 2D SIMULATION
          </span>
          <span style={{
            fontSize: "9px",
            fontWeight: 800,
            padding: "2px 6px",
            borderRadius: "3px",
            backgroundColor: "rgba(56, 189, 248, 0.2)",
            color: "#38bdf8",
            border: "1px solid rgba(56, 189, 248, 0.4)"
          }}>
            {activeSc?.id?.replace("SCENARIO_", "") || "CENTRAL"}
          </span>
        </div>
        <div style={{ fontSize: "10px", color: "#94a3b8", fontFamily: "monospace" }}>
          Qp = {decision.peakDischargeM3s.toLocaleString()} m³/s | Deadline = {decision.deadlineFormatted}
        </div>
      </div>

      {/* 5. Compact Contextual Milestone Annotation Box */}
      <div
        style={{
          position: "absolute",
          bottom: "95px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 800,
          width: "min(780px, 92vw)",
          backgroundColor: "rgba(11, 17, 32, 0.94)",
          backdropFilter: "blur(12px)",
          border: `1px solid ${currentEvent.stateColor}`,
          borderRadius: "6px",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.6)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            padding: "4px 8px",
            borderRadius: "4px",
            backgroundColor: `${currentEvent.stateColor}25`,
            border: `1px solid ${currentEvent.stateColor}`,
            color: currentEvent.stateColor,
            fontSize: "10px",
            fontWeight: 900,
            fontFamily: "monospace",
            whiteSpace: "nowrap"
          }}>
            {currentEvent.stateBadge}
          </div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#ffffff" }}>
              {currentEvent.label}
            </div>
            <div style={{ fontSize: "10.5px", color: "#94a3b8", marginTop: "1px" }}>
              {currentEvent.sublabel}
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigateToView("EVACUATION_DECISION")}
          style={{
            padding: "5px 10px",
            borderRadius: "4px",
            border: "1px solid rgba(56, 189, 248, 0.4)",
            backgroundColor: "rgba(56, 189, 248, 0.15)",
            color: "#38bdf8",
            fontSize: "10px",
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            whiteSpace: "nowrap"
          }}
        >
          <span>View Decision</span>
          <ArrowRight size={12} />
        </button>
      </div>

      {/* 6. Primary Continuous Temporal Player Bar (Section 21 Specification) */}
      <div
        style={{
          position: "absolute",
          bottom: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 800,
          width: "min(960px, 94vw)",
          backgroundColor: "rgba(11, 17, 32, 0.95)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: "8px",
          padding: "10px 16px",
          boxShadow: "0 12px 36px rgba(0,0,0,0.6)",
          display: "flex",
          flexDirection: "column",
          gap: "8px"
        }}
      >
        {/* Top Controls Row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* Play / Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "5px 12px",
                borderRadius: "5px",
                border: "none",
                backgroundColor: isPlaying ? "#f59e0b" : "#38bdf8",
                color: "#060913",
                fontSize: "11px",
                fontWeight: 900,
                cursor: "pointer"
              }}
            >
              {isPlaying ? <Pause size={13} strokeWidth={3} /> : <Play size={13} strokeWidth={3} fill="#060913" />}
              <span>{isPlaying ? "PAUSE" : "PLAY EVENT"}</span>
            </button>

            {/* Reset */}
            <button
              onClick={handleReset}
              title="Reset to T+00:00"
              style={{
                padding: "5px 8px",
                borderRadius: "5px",
                border: "1px solid rgba(255,255,255,0.15)",
                backgroundColor: "rgba(255,255,255,0.05)",
                color: "#cbd5e1",
                cursor: "pointer"
              }}
            >
              <RotateCcw size={13} />
            </button>

            {/* Playback Speed */}
            <div style={{ display: "flex", alignItems: "center", gap: "3px", marginLeft: "6px" }}>
              <span style={{ fontSize: "9.5px", color: "#94a3b8", fontWeight: 700 }}>SPEED:</span>
              {[0.5, 1.0, 2.0, 4.0].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  style={{
                    padding: "2px 6px",
                    borderRadius: "3px",
                    border: playbackSpeed === spd ? "1px solid #38bdf8" : "1px solid transparent",
                    backgroundColor: playbackSpeed === spd ? "rgba(56, 189, 248, 0.2)" : "transparent",
                    color: playbackSpeed === spd ? "#ffffff" : "#94a3b8",
                    fontSize: "9.5px",
                    fontWeight: playbackSpeed === spd ? 800 : 500,
                    cursor: "pointer"
                  }}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Large Current Time Display */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              fontSize: "18px",
              fontWeight: 900,
              fontFamily: "monospace",
              color: "#38bdf8",
              letterSpacing: "0.5px"
            }}>
              T+{currentTimeMin.toString().padStart(2, "0")}:00
            </div>
            <span style={{ fontSize: "10px", color: "#64748b", fontWeight: 600 }}>/ T+120:00</span>
          </div>
        </div>

        {/* Timeline Scrub Slider */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <input
            type="range"
            min={0}
            max={120}
            step={1}
            value={currentTimeMin}
            onChange={(e) => handleSeek(parseInt(e.target.value, 10))}
            style={{
              width: "100%",
              accentColor: "#38bdf8",
              cursor: "pointer",
              height: "5px"
            }}
          />

          {/* Quick-Jump Markers */}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", fontFamily: "monospace", color: "#64748b" }}>
            {TIMESTEP_MARKERS.map((m) => {
              const isPassed = currentTimeMin >= m;
              const isTarget = m === 60; // Limiting edge arrival
              return (
                <span
                  key={m}
                  onClick={() => handleSeek(m)}
                  style={{
                    cursor: "pointer",
                    color: isTarget ? "#ef4444" : (isPassed ? "#38bdf8" : "#64748b"),
                    fontWeight: isTarget ? 900 : (isPassed ? 700 : 500)
                  }}
                >
                  T+{m.toString().padStart(2, "0")}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
