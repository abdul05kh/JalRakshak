/**
 * simulation/SimulationHUD.tsx
 * Minimalist cinematic heads-up display overlay for the continuous simulation.
 */

import React, { useState } from "react";
import { Play, Pause, RotateCcw, Info, Clapperboard } from "lucide-react";
import type { SimulationPhase } from "./types";
import { SIMULATION_TOTAL_DURATION_SEC, SIMULATION_PHASES } from "./SimulationTimeline";

interface SimulationHUDProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onRestart: () => void;
  elapsedSec: number;
  onSeek: (sec: number) => void;
  playbackSpeed: number;
  onChangeSpeed: (spd: number) => void;
  currentPhase: SimulationPhase;
  derivedHydraulicTimeMin: number;
  isReducedMotion: boolean;
  onToggleReducedMotion: () => void;
}

export const SimulationHUD: React.FC<SimulationHUDProps> = ({
  isPlaying,
  onTogglePlay,
  onRestart,
  elapsedSec,
  onSeek,
  playbackSpeed,
  onChangeSpeed,
  currentPhase,
  derivedHydraulicTimeMin,
  isReducedMotion,
  onToggleReducedMotion
}) => {
  const [showSourcesInfo, setShowSourcesInfo] = useState<boolean>(false);

  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = Math.floor(totalSec % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <>
      {/* 1. Top Status & Narrative Banner */}
      <div
        style={{
          position: "absolute",
          top: "14px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 850,
          width: "min(780px, 94vw)",
          backgroundColor: "rgba(11, 17, 32, 0.94)",
          backdropFilter: "blur(12px)",
          border: `1.5px solid ${currentPhase.badgeColor}`,
          borderRadius: "8px",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.6)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
              backgroundColor: `${currentPhase.badgeColor}25`,
              border: `1px solid ${currentPhase.badgeColor}`,
              color: currentPhase.badgeColor,
              fontSize: "10px",
              fontWeight: 900,
              fontFamily: "monospace",
              whiteSpace: "nowrap"
            }}
          >
            {currentPhase.badge}
          </div>
          <div>
            <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#ffffff" }}>
              {currentPhase.title}
            </div>
            <div style={{ fontSize: "10.5px", color: "#94a3b8", marginTop: "1px" }}>
              {currentPhase.subtitle}
            </div>
          </div>
        </div>

        {/* Presentation-Only Mode Badge & Sources Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              fontSize: "9px",
              fontWeight: 800,
              padding: "3px 6px",
              borderRadius: "3px",
              backgroundColor: "rgba(56, 189, 248, 0.15)",
              color: "#38bdf8",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              fontFamily: "monospace",
              whiteSpace: "nowrap"
            }}
          >
            SIMULATION MODE
          </div>
          <button
            onClick={() => setShowSourcesInfo(!showSourcesInfo)}
            title="Simulation Data Sources Disclosure"
            style={{
              padding: "3px 6px",
              borderRadius: "4px",
              border: "1px solid rgba(255,255,255,0.15)",
              backgroundColor: showSourcesInfo ? "rgba(56, 189, 248, 0.2)" : "rgba(255, 255, 255, 0.05)",
              color: showSourcesInfo ? "#38bdf8" : "#cbd5e1",
              fontSize: "9.5px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "3px"
            }}
          >
            <Info size={11} />
            <span>Sources</span>
          </button>
        </div>
      </div>

      {/* Unobtrusive Data Sources Disclosure Drawer */}
      {showSourcesInfo && (
        <div
          style={{
            position: "absolute",
            top: "65px",
            right: "14px",
            zIndex: 900,
            width: "300px",
            backgroundColor: "rgba(11, 17, 32, 0.96)",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(56, 189, 248, 0.4)",
            borderRadius: "8px",
            padding: "12px",
            fontSize: "10.5px",
            color: "#cbd5e1",
            boxShadow: "0 10px 25px rgba(0,0,0,0.7)",
            display: "flex",
            flexDirection: "column",
            gap: "6px"
          }}
        >
          <div style={{ fontWeight: 800, color: "#ffffff", fontSize: "11px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "4px" }}>
            Simulation Data Sources & Policy
          </div>
          <div>• <strong>Hydraulic Source:</strong> USACE HEC-RAS 7.0.1 2D Unsteady SWE derived outputs (Gate 3B 15km model).</div>
          <div>• <strong>Terrain Source:</strong> Copernicus GLO-30 DSM (30m elevation grid).</div>
          <div>• <strong>Decision Authority:</strong> Evacuation Window Engine (EWE: D = min(Ai - Ti - B)).</div>
          <div style={{ color: "#94a3b8", fontSize: "9.5px", fontStyle: "italic", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "4px" }}>
            *Visual interpolation is used between authoritative keyframes for presentation continuity. Simulation frames are not used to calculate backend decisions.
          </div>
        </div>
      )}

      {/* 2. Bottom Continuous Player Control Bar */}
      <div
        style={{
          position: "absolute",
          bottom: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 850,
          width: "min(920px, 94vw)",
          backgroundColor: "rgba(11, 17, 32, 0.95)",
          backdropFilter: "blur(14px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: "8px",
          padding: "10px 16px",
          boxShadow: "0 12px 36px rgba(0,0,0,0.7)",
          display: "flex",
          flexDirection: "column",
          gap: "8px"
        }}
      >
        {/* Top Control Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
          {/* Playback Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={onTogglePlay}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 14px",
                borderRadius: "5px",
                border: "none",
                backgroundColor: isPlaying ? "#f59e0b" : "#22c55e",
                color: "#060913",
                fontSize: "11px",
                fontWeight: 900,
                cursor: "pointer"
              }}
            >
              {isPlaying ? <Pause size={13} strokeWidth={3} /> : <Play size={13} strokeWidth={3} fill="#060913" />}
              <span>{isPlaying ? "PAUSE" : "PLAY MOVIE"}</span>
            </button>

            <button
              onClick={onRestart}
              title="Restart Simulation"
              style={{
                padding: "6px 9px",
                borderRadius: "5px",
                border: "1px solid rgba(255,255,255,0.15)",
                backgroundColor: "rgba(255,255,255,0.05)",
                color: "#cbd5e1",
                cursor: "pointer",
                display: "flex",
                alignItems: "center"
              }}
            >
              <RotateCcw size={13} />
            </button>

            {/* Playback Speed Switcher */}
            <div style={{ display: "flex", alignItems: "center", gap: "3px", marginLeft: "6px" }}>
              <span style={{ fontSize: "9.5px", color: "#94a3b8", fontWeight: 700 }}>SPEED:</span>
              {[0.5, 1.0, 2.0, 4.0].map((spd) => (
                <button
                  key={spd}
                  onClick={() => onChangeSpeed(spd)}
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

            {/* Reduced Motion Toggle */}
            <button
              onClick={onToggleReducedMotion}
              title="Toggle Reduced Motion"
              style={{
                padding: "3px 6px",
                borderRadius: "3px",
                border: isReducedMotion ? "1px solid #c084fc" : "1px solid rgba(255,255,255,0.1)",
                backgroundColor: isReducedMotion ? "rgba(192, 132, 252, 0.2)" : "transparent",
                color: isReducedMotion ? "#c084fc" : "#94a3b8",
                fontSize: "9px",
                fontWeight: 700,
                cursor: "pointer",
                marginLeft: "4px"
              }}
            >
              {isReducedMotion ? "Reduced Motion: ON" : "Reduced Motion"}
            </button>
          </div>

          {/* Clock Displays */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#94a3b8" }}>
              <Clapperboard size={12} color="#38bdf8" />
              <span>SIMULATION:</span>
              <strong style={{ color: "#ffffff", fontFamily: "monospace", fontSize: "12px" }}>
                {formatTime(elapsedSec)}
              </strong>
              <span style={{ color: "#64748b" }}>/ {formatTime(SIMULATION_TOTAL_DURATION_SEC)}</span>
            </div>

            <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>

            <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#94a3b8" }}>
              <span>HEC-RAS STATE:</span>
              <strong style={{ color: "#38bdf8", fontFamily: "monospace", fontSize: "12px" }}>
                T+{derivedHydraulicTimeMin.toString().padStart(2, "0")}:00
              </strong>
            </div>
          </div>
        </div>

        {/* Continuous Scrub Slider */}
        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          <input
            type="range"
            min={0}
            max={SIMULATION_TOTAL_DURATION_SEC}
            step={0.5}
            value={elapsedSec}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            style={{
              width: "100%",
              accentColor: "#22c55e",
              cursor: "pointer",
              height: "5px"
            }}
          />

          {/* Phase Markers */}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "8.5px", fontFamily: "monospace", color: "#64748b" }}>
            {SIMULATION_PHASES.map((p) => {
              const isPassed = elapsedSec >= p.startTimeSec;
              const isCurrent = currentPhase.id === p.id;
              return (
                <span
                  key={p.id}
                  onClick={() => onSeek(p.startTimeSec)}
                  style={{
                    cursor: "pointer",
                    color: isCurrent ? p.badgeColor : isPassed ? "#cbd5e1" : "#64748b",
                    fontWeight: isCurrent ? 900 : 500
                  }}
                  title={p.title}
                >
                  {p.badge.substring(0, 8)}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
