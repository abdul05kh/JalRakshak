import React, { useState, useRef } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  Compass, 
  FileText, 
  CheckCircle2, 
  Waves
} from "lucide-react";
import type { 
  ScenarioSummary, 
  RouteAnalyzeResponse, 
  RoadFeature, 
  EvacuationPointFeature 
} from "../types";

interface FloodSimulationViewProps {
  scenarios: ScenarioSummary[];
  activeScenarioId: string;
  analysisResult?: RouteAnalyzeResponse | null;
  roads?: RoadFeature[];
  evacPoints?: EvacuationPointFeature[];
  inundationGeoJSON?: any;
  onSelectTimestep?: (min: number) => void;
  onNavigateToView: (view: string) => void;
}

const PHASES = [
  { startSec: 0, endSec: 18, label: "Phase 1: Reservoir Baseline (830.0m FRL)", color: "#38bdf8", time: "T+00:00" },
  { startSec: 18, endSec: 38, label: "Phase 2: Dam Breach Onset & Surge (65,000 m³/s)", color: "#f59e0b", time: "T+18:00" },
  { startSec: 38, endSec: 70, label: "Phase 3: Canyon Surge Wave Propagation", color: "#f97316", time: "T+38:00" },
  { startSec: 70, endSec: 95, label: "Phase 4: Settlements Exposed & Route R02 Convoy", color: "#ec4899", time: "T+50:00" },
  { startSec: 95, endSec: 120, label: "Phase 5: Limiting Segment Cutoff & Evacuation Decision", color: "#10b981", time: "T+60:00" },
];

export const FloodSimulationView: React.FC<FloodSimulationViewProps> = ({
  scenarios,
  activeScenarioId,
  onNavigateToView
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(120);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [showProvenanceModal, setShowProvenanceModal] = useState<boolean>(false);

  const activeSc = scenarios.find((s) => s.id === activeScenarioId);

  // Model elapsed disaster time (0 to 120 minutes)
  const currentModelMinutes = (currentTime / (duration || 120)) * 120;
  const currentPhase = PHASES.find(p => currentTime >= p.startSec && currentTime < p.endSec) || PHASES[PHASES.length - 1];

  const formatVideoTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatModelTime = (min: number) => {
    const hrs = Math.floor(min / 60);
    const mins = Math.floor(min % 60);
    const secs = Math.floor((min * 60) % 60);
    return `T+${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleRestart = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
  };

  const handleSpeedChange = (speed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetSec = parseFloat(e.target.value);
    if (!videoRef.current) return;
    videoRef.current.currentTime = targetSec;
    setCurrentTime(targetSec);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 120);
  };

  return (
    <div style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#070b12",
      color: "#f8fafc",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Top Status Banner */}
      <div style={{
        height: "44px",
        backgroundColor: "rgba(13, 20, 36, 0.95)",
        borderBottom: "1px solid rgba(56, 189, 248, 0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        zIndex: 20
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: "rgba(56, 189, 248, 0.15)",
            padding: "3px 10px",
            borderRadius: "4px",
            border: "1px solid rgba(56, 189, 248, 0.3)"
          }}>
            <Waves size={14} color="#38bdf8" />
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#38bdf8", letterSpacing: "0.5px" }}>
              CINEMATIC VIDEO SIMULATION MODE
            </span>
          </div>

          <span style={{ fontSize: "12px", color: "#94a3b8" }}>
            Scenario: <strong style={{ color: "#f8fafc" }}>{activeSc?.name || "Central Dam-Break (Overtopping)"}</strong>
          </span>
          <span style={{ fontSize: "12px", color: "#64748b" }}>•</span>
          <span style={{ fontSize: "12px", color: currentPhase.color, fontWeight: 600 }}>
            {currentPhase.label}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => setShowProvenanceModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "rgba(30, 41, 59, 0.8)",
              color: "#94a3b8",
              border: "1px solid rgba(148, 163, 184, 0.2)",
              borderRadius: "4px",
              padding: "4px 10px",
              fontSize: "11px",
              cursor: "pointer"
            }}
          >
            <FileText size={13} />
            Provenance & Equations
          </button>

          <button
            onClick={() => onNavigateToView("OPERATIONAL_MAP")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "rgba(56, 189, 248, 0.15)",
              color: "#38bdf8",
              border: "1px solid rgba(56, 189, 248, 0.4)",
              borderRadius: "4px",
              padding: "4px 12px",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            <Compass size={13} />
            Inspect in 3D Map
            <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* Main Full HD Video Hero Stage */}
      <div style={{
        flex: 1,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000",
        overflow: "hidden"
      }}>
        <video
          ref={videoRef}
          src="/simulation/jalrakshak_cinematic.mp4"
          autoPlay
          loop
          muted={isMuted}
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onClick={handleTogglePlay}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            cursor: "pointer"
          }}
        />

        {/* Tactical HUD Overlay Floating Badges */}
        <div style={{
          position: "absolute",
          top: "16px",
          left: "20px",
          backgroundColor: "rgba(10, 16, 28, 0.85)",
          border: "1px solid rgba(56, 189, 248, 0.3)",
          borderRadius: "6px",
          padding: "10px 16px",
          backdropFilter: "blur(6px)",
          pointerEvents: "none"
        }}>
          <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 700, letterSpacing: "1px" }}>
            HEC-RAS UNSTEADY 2D HYDRODYNAMICS
          </div>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#f8fafc", marginTop: "2px" }}>
            Tehri Dam Gorge Reach (0–15 km)
          </div>
          <div style={{ fontSize: "11px", color: "#38bdf8", marginTop: "2px" }}>
            Grid Cells: 6,677 | Peak Outflow: 65,000 m³/s
          </div>
        </div>

        {/* Live Simulation Clock HUD */}
        <div style={{
          position: "absolute",
          top: "16px",
          right: "20px",
          backgroundColor: "rgba(10, 16, 28, 0.85)",
          border: "1px solid rgba(245, 158, 11, 0.4)",
          borderRadius: "6px",
          padding: "10px 18px",
          backdropFilter: "blur(6px)",
          textAlign: "right",
          pointerEvents: "none"
        }}>
          <div style={{ fontSize: "10px", color: "#f59e0b", fontWeight: 700, letterSpacing: "1px" }}>
            ELAPSED DISASTER TIMELINE
          </div>
          <div style={{
            fontSize: "24px",
            fontFamily: "monospace",
            fontWeight: 700,
            color: "#fbbf24",
            marginTop: "1px"
          }}>
            {formatModelTime(currentModelMinutes)}
          </div>
        </div>

        {/* Climax Decision Overlay Trigger (when video is in final phase) */}
        {currentTime >= 95 && (
          <div style={{
            position: "absolute",
            bottom: "80px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(6, 12, 22, 0.95)",
            border: "2px solid #22c55e",
            borderRadius: "8px",
            padding: "16px 28px",
            boxShadow: "0 0 35px rgba(34, 197, 94, 0.3)",
            display: "flex",
            alignItems: "center",
            gap: "24px",
            zIndex: 15,
            animation: "fadeIn 0.5s ease-out"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <CheckCircle2 size={32} color="#22c55e" />
              <div>
                <div style={{ fontSize: "11px", color: "#86efac", fontWeight: 700, letterSpacing: "0.5px" }}>
                  JALRAKSHAK EVACUATION WINDOW RESULT
                </div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#f8fafc" }}>
                  Latest Departure Deadline: <span style={{ color: "#22c55e" }}>T+44:21</span>
                </div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                  Limiting Edge: <strong style={{ color: "#ef4444" }}>R02-E07</strong> (Inundation at T+60:00) | Buffer: 03:00 min
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigateToView("EVACUATION_DECISION")}
              style={{
                backgroundColor: "#22c55e",
                color: "#052e16",
                border: "none",
                borderRadius: "6px",
                padding: "10px 18px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              Open Evacuation Matrix
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Mission Player Control Bar */}
      <div style={{
        height: "88px",
        backgroundColor: "rgba(10, 15, 26, 0.98)",
        borderTop: "1px solid rgba(56, 189, 248, 0.2)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 24px",
        gap: "10px",
        zIndex: 20
      }}>
        {/* Interactive Scrubbing Timeline Bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span style={{ fontSize: "12px", fontFamily: "monospace", color: "#94a3b8", width: "42px" }}>
            {formatVideoTime(currentTime)}
          </span>

          <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
            <input
              type="range"
              min="0"
              max={duration || 120}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              style={{
                width: "100%",
                accentColor: "#38bdf8",
                cursor: "pointer",
                height: "6px"
              }}
            />
          </div>

          <span style={{ fontSize: "12px", fontFamily: "monospace", color: "#64748b", width: "42px" }}>
            {formatVideoTime(duration)}
          </span>
        </div>

        {/* Player Controls & Speed Selectors */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={handleTogglePlay}
              style={{
                backgroundColor: "#38bdf8",
                color: "#0369a1",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer"
              }}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: "2px" }} />}
            </button>

            <button
              onClick={handleRestart}
              title="Restart Simulation"
              style={{
                backgroundColor: "rgba(30, 41, 59, 0.8)",
                color: "#94a3b8",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                borderRadius: "6px",
                padding: "6px 12px",
                fontSize: "12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <RotateCcw size={14} />
              Restart
            </button>

            {/* Speed Buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px", marginLeft: "12px" }}>
              <span style={{ fontSize: "11px", color: "#64748b", marginRight: "4px" }}>Speed:</span>
              {[0.5, 1.0, 2.0, 4.0].map((spd) => (
                <button
                  key={spd}
                  onClick={() => handleSpeedChange(spd)}
                  style={{
                    backgroundColor: playbackSpeed === spd ? "#0284c7" : "rgba(30, 41, 59, 0.6)",
                    color: playbackSpeed === spd ? "#fff" : "#94a3b8",
                    border: "1px solid rgba(56, 189, 248, 0.2)",
                    borderRadius: "4px",
                    padding: "3px 8px",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Right Action Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={() => setIsMuted(!isMuted)}
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
                display: "flex",
                alignItems: "center"
              }}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              paddingLeft: "16px",
              borderLeft: "1px solid rgba(148, 163, 184, 0.2)"
            }}>
              <span style={{ fontSize: "12px", color: "#94a3b8" }}>Limiting Segment:</span>
              <span style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#ef4444",
                backgroundColor: "rgba(239, 68, 68, 0.15)",
                padding: "2px 8px",
                borderRadius: "4px",
                border: "1px solid rgba(239, 68, 68, 0.3)"
              }}>
                R02-E07 (T+60:00)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Provenance & Scientific Equation Modal */}
      {showProvenanceModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(5px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100
        }}>
          <div style={{
            width: "600px",
            backgroundColor: "#0d1424",
            border: "1px solid rgba(56, 189, 248, 0.3)",
            borderRadius: "8px",
            padding: "24px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)"
          }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#38bdf8", marginBottom: "12px" }}>
              Scientific Provenance & Simulation Decoupling
            </h3>
            
            <p style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: 1.6 }}>
              The cinematic simulation is a pre-rendered 30fps Full HD visual narrative derived from native 
              <strong> HEC-RAS 2D unsteady flow equations</strong> (6,677 flexible mesh cells, 25 time steps).
            </p>

            <div style={{
              backgroundColor: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(148, 163, 184, 0.2)",
              borderRadius: "6px",
              padding: "12px 16px",
              margin: "16px 0",
              fontFamily: "monospace",
              fontSize: "13px",
              color: "#fbbf24"
            }}>
              D = min (A_i - T_i - B) = 3600s - 759s - 180s = 2661s → T+44:21
            </div>

            <p style={{ fontSize: "12px", color: "#94a3b8", lineHeight: 1.5 }}>
              * <strong>Strict Separation Principle</strong>: Simulation controls (scrubbing, speed, pause) 
              never alter or recompute the backend Evacuation Window Engine (EWE) decision variables.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <button
                onClick={() => setShowProvenanceModal(false)}
                style={{
                  backgroundColor: "#0284c7",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  padding: "6px 16px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
