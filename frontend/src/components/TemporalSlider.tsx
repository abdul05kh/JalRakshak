import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Clock, AlertTriangle, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";

interface Timestep {
  timestep_min: number;
  label: string;
  elapsed_seconds: number;
  description: string;
  wavefront_progress_fraction: number;
  affected_roads: string[];
  inundated_edge_count: number;
  is_arrival_point_for_r02: boolean;
}

interface TemporalSliderProps {
  timesteps: Timestep[];
  activeTimestepMin: number;
  onSelectTimestep: (min: number) => void;
  scenarioName?: string;
  limitingRoadId?: string;
  activeLayerName?: string;
}

export const TemporalSlider: React.FC<TemporalSliderProps> = ({
  timesteps,
  activeTimestepMin,
  onSelectTimestep,
  scenarioName = "CENTRAL",
  limitingRoadId = "R02",
  activeLayerName = "WATER DEPTH"
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Auto-playback loop
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.round(2000 / playbackSpeed);
    const interval = setInterval(() => {
      const currentIndex = timesteps.findIndex((t) => t.timestep_min === activeTimestepMin);
      if (currentIndex < 0 || currentIndex >= timesteps.length - 1) {
        setIsPlaying(false);
      } else {
        onSelectTimestep(timesteps[currentIndex + 1].timestep_min);
      }
    }, intervalMs);
    return () => clearInterval(interval);
  }, [isPlaying, activeTimestepMin, timesteps, playbackSpeed]);

  const currentIndex = timesteps.findIndex((t) => t.timestep_min === activeTimestepMin);
  const currentStep = timesteps[currentIndex >= 0 ? currentIndex : 0] || {
    timestep_min: activeTimestepMin,
    label: `T+${activeTimestepMin.toString().padStart(2, "0")}:00`,
    description: `Hydraulic simulation timestep T+${activeTimestepMin}:00`
  };

  const handleStepBack = () => {
    setIsPlaying(false);
    if (currentIndex > 0) {
      onSelectTimestep(timesteps[currentIndex - 1].timestep_min);
    }
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    if (currentIndex < timesteps.length - 1) {
      onSelectTimestep(timesteps[currentIndex + 1].timestep_min);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "rgba(15, 23, 42, 0.92)",
        backdropFilter: "blur(14px)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "10px",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
        padding: "10px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        color: "#f8fafc",
        fontFamily: "Inter, sans-serif",
        boxSizing: "border-box"
      }}
    >
      {/* Top Meta Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", flexWrap: "wrap", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#38bdf8" }}>
            <Clock size={13} />
            <span>HYDRAULIC TIME:</span>
            <strong style={{ fontFamily: "monospace", fontSize: "12px", color: "#ffffff" }}>
              T+{activeTimestepMin.toString().padStart(2, "0")}:00
            </strong>
          </div>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
          <span style={{ color: "#94a3b8" }}>
            SCENARIO: <strong style={{ color: "#ffffff" }}>{scenarioName.replace("SCENARIO_", "")}</strong>
          </span>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
          <span style={{ color: "#94a3b8" }}>
            LAYER: <strong style={{ color: "#38bdf8" }}>{activeLayerName}</strong>
          </span>
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          fontSize: "10.5px",
          fontWeight: 700,
          color: activeTimestepMin >= 60 ? "#fbbf24" : "#4ade80"
        }}>
          {activeTimestepMin >= 60 ? (
            <>
              <AlertTriangle size={13} color="#fbbf24" />
              <span>Limiting Edge {limitingRoadId}-E07 Reached (T+60:00)</span>
            </>
          ) : (
            <>
              <ShieldCheck size={13} color="#4ade80" />
              <span>Route {limitingRoadId} Clear of Floodwaters</span>
            </>
          )}
        </div>
      </div>

      {/* Discrete Step Slider & Play Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Step Back */}
        <button
          onClick={handleStepBack}
          disabled={currentIndex <= 0}
          title="Previous Timestep"
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "5px",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            color: currentIndex <= 0 ? "#475569" : "#cbd5e1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: currentIndex <= 0 ? "not-allowed" : "pointer"
          }}
        >
          <ChevronLeft size={14} />
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={() => {
            if (currentIndex >= timesteps.length - 1) {
              onSelectTimestep(timesteps[0]?.timestep_min || 0);
              setIsPlaying(true);
            } else {
              setIsPlaying(!isPlaying);
            }
          }}
          title={isPlaying ? "Pause Simulation" : "Play Simulation"}
          style={{
            padding: "0 12px",
            height: "28px",
            borderRadius: "5px",
            border: "none",
            backgroundColor: isPlaying ? "#e11d48" : "#2563eb",
            color: "#ffffff",
            fontSize: "11px",
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            gap: "5px",
            cursor: "pointer"
          }}
        >
          {isPlaying ? <Pause size={13} /> : <Play size={13} />}
          <span>{isPlaying ? "PAUSE" : "PLAY"}</span>
        </button>

        {/* Step Forward */}
        <button
          onClick={handleStepForward}
          disabled={currentIndex >= timesteps.length - 1}
          title="Next Timestep"
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "5px",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            color: currentIndex >= timesteps.length - 1 ? "#475569" : "#cbd5e1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: currentIndex >= timesteps.length - 1 ? "not-allowed" : "pointer"
          }}
        >
          <ChevronRight size={14} />
        </button>

        {/* Discrete Timestep Buttons */}
        <div style={{ display: "flex", flex: 1, gap: "4px", position: "relative" }}>
          {timesteps.map((step) => {
            const isCurrent = step.timestep_min === activeTimestepMin;
            const isCriticalArrival = step.timestep_min === 60;
            return (
              <button
                key={step.timestep_min}
                onClick={() => {
                  setIsPlaying(false);
                  onSelectTimestep(step.timestep_min);
                }}
                style={{
                  flex: 1,
                  padding: "5px 2px",
                  borderRadius: "4px",
                  border: isCurrent
                    ? "1.5px solid #38bdf8"
                    : isCriticalArrival
                    ? "1px solid rgba(245, 158, 11, 0.5)"
                    : "1px solid rgba(255, 255, 255, 0.08)",
                  backgroundColor: isCurrent
                    ? "#2563eb"
                    : isCriticalArrival
                    ? "rgba(245, 158, 11, 0.15)"
                    : "rgba(30, 41, 59, 0.6)",
                  color: isCurrent ? "#ffffff" : isCriticalArrival ? "#fde68a" : "#cbd5e1",
                  fontSize: "10px",
                  fontWeight: isCurrent || isCriticalArrival ? 800 : 500,
                  fontFamily: "monospace",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.15s ease"
                }}
              >
                {step.label}
              </button>
            );
          })}
        </div>

        {/* Playback Speed */}
        <select
          value={playbackSpeed}
          onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
          style={{
            padding: "3px 6px",
            borderRadius: "4px",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            backgroundColor: "#1e293b",
            fontSize: "10px",
            fontWeight: 700,
            color: "#94a3b8",
            cursor: "pointer",
            outline: "none"
          }}
          title="Playback Speed"
        >
          <option value={0.5}>0.5×</option>
          <option value={1}>1.0×</option>
          <option value={2}>2.0×</option>
          <option value={4}>4.0×</option>
        </select>

        {/* Reset to T+00 */}
        <button
          onClick={() => {
            setIsPlaying(false);
            onSelectTimestep(0);
          }}
          title="Reset to T+00:00"
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "5px",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            color: "#94a3b8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer"
          }}
        >
          <RotateCcw size={13} />
        </button>
      </div>

      {/* Description Line */}
      <div style={{ fontSize: "10px", color: "#94a3b8", lineHeight: 1.3 }}>
        <strong>HEC-RAS STATE {currentStep.label}:</strong> {currentStep.description}
      </div>
    </div>
  );
};
