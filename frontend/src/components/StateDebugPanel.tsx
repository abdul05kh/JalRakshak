import React, { useState } from "react";
import { Bug, ChevronUp, ChevronDown } from "lucide-react";
import { getAuthoritativeDecision } from "../services/decisionStore";

interface StateDebugPanelProps {
  activeScenarioId: string;
  selectedRouteId: string;
  activeTimestepMin: number;
}

export const StateDebugPanel: React.FC<StateDebugPanelProps> = ({
  activeScenarioId,
  selectedRouteId,
  activeTimestepMin
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const decision = getAuthoritativeDecision(activeScenarioId, selectedRouteId);
  const simulationTimeSeconds = activeTimestepMin * 60;

  // Invariant verification check
  const invariantHolds = decision.deadlineSeconds === (decision.arrivalSeconds - decision.travelSeconds - decision.bufferSeconds);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "16px",
        right: "16px",
        zIndex: 9999,
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        backdropFilter: "blur(10px)",
        border: invariantHolds ? "1.5px solid #3b82f6" : "2px solid #ef4444",
        borderRadius: "8px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        color: "#f8fafc",
        fontSize: "11px",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        maxWidth: "380px"
      }}
    >
      {/* Toggle Bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          padding: "6px 10px",
          background: "none",
          border: "none",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          cursor: "pointer",
          fontWeight: 700,
          fontSize: "11px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Bug size={13} color="#38bdf8" />
          <span>STATE DEBUG PANEL [DEV]</span>
          {invariantHolds ? (
            <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: "3px", backgroundColor: "rgba(34,197,94,0.25)", color: "#4ade80" }}>
              SYNCHRONIZED
            </span>
          ) : (
            <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: "3px", backgroundColor: "rgba(239,68,68,0.25)", color: "#f87171" }}>
              DIVERGENCE DETECTED
            </span>
          )}
        </div>
        {isOpen ? <ChevronDown size={14} color="#94a3b8" /> : <ChevronUp size={14} color="#94a3b8" />}
      </button>

      {/* Expanded State Details */}
      {isOpen && (
        <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: "4px" }}>
            <span style={{ color: "#94a3b8" }}>Scenario:</span>
            <strong style={{ color: "#38bdf8" }}>{decision.scenarioId} ({decision.peakDischargeM3s.toLocaleString()} m³/s)</strong>

            <span style={{ color: "#94a3b8" }}>Route:</span>
            <strong style={{ color: "#4ade80" }}>{decision.routeId} ({decision.limitingEdgeId})</strong>

            <span style={{ color: "#94a3b8" }}>Simulation Time:</span>
            <span style={{ color: "#fbbf24" }}>{simulationTimeSeconds} s (T+{activeTimestepMin}:00)</span>

            <span style={{ color: "#94a3b8" }}>Arrival:</span>
            <span style={{ color: "#ffffff" }}>{decision.arrivalSeconds} s ({decision.arrivalFormatted})</span>

            <span style={{ color: "#94a3b8" }}>Travel:</span>
            <span style={{ color: "#ffffff" }}>{decision.travelSeconds} s ({decision.travelFormatted})</span>

            <span style={{ color: "#94a3b8" }}>Buffer:</span>
            <span style={{ color: "#ffffff" }}>{decision.bufferSeconds} s ({decision.bufferFormatted})</span>

            <span style={{ color: "#94a3b8" }}>Deadline:</span>
            <strong style={{ color: "#22c55e" }}>{decision.deadlineSeconds} s ({decision.deadlineFormatted})</strong>

            <span style={{ color: "#94a3b8" }}>Formula:</span>
            <span style={{ color: "#e2e8f0" }}>{decision.formulaText}</span>

            <span style={{ color: "#94a3b8" }}>Decision:</span>
            <span style={{ color: decision.status === "FEASIBLE" ? "#4ade80" : "#f87171", fontWeight: 800 }}>
              {decision.statusBadgeText}
            </span>

            <span style={{ color: "#94a3b8" }}>Source:</span>
            <span style={{ color: "#a5b4fc", fontSize: "10px" }}>{decision.sourceArtifact}</span>
          </div>

          <div style={{ marginTop: "4px", paddingTop: "4px", borderTop: "1px dashed rgba(255,255,255,0.1)", fontSize: "9.5px", color: "#94a3b8" }}>
            Simulation playback clock is independent of evacuation departure deadline.
          </div>
        </div>
      )}
    </div>
  );
};
