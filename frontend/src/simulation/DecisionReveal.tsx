/**
 * simulation/DecisionReveal.tsx
 * High-fidelity technical reveal component translating HEC-RAS physics into JalRakshak actionable evacuation window.
 */

import React from "react";
import { ArrowRight, CheckCircle2, ShieldCheck, Clock, Layers, Network } from "lucide-react";
import { getAuthoritativeDecision } from "../services/decisionStore";

interface DecisionRevealProps {
  scenarioId?: string;
  routeId?: string;
  onClose?: () => void;
  onExploreInOperationalMap?: () => void;
}

export const DecisionReveal: React.FC<DecisionRevealProps> = ({
  scenarioId = "SCENARIO_CENTRAL",
  routeId = "R02",
  onExploreInOperationalMap
}) => {
  const decision = getAuthoritativeDecision(scenarioId, routeId);

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 950,
        width: "min(680px, 94vw)",
        backgroundColor: "rgba(11, 17, 32, 0.96)",
        backdropFilter: "blur(16px)",
        border: "1.5px solid #22c55e",
        borderRadius: "12px",
        padding: "20px 24px",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(34, 197, 94, 0.15)",
        color: "#f8fafc",
        fontFamily: "Inter, sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: "14px"
      }}
    >
      {/* Header Banner */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.12)", paddingBottom: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "30px",
            height: "30px",
            borderRadius: "6px",
            backgroundColor: "rgba(34, 197, 94, 0.2)",
            border: "1px solid #22c55e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <ShieldCheck size={18} color="#4ade80" />
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 900, color: "#ffffff", letterSpacing: "0.2px" }}>
              JALRAKSHAK DECISION SUPPORT TRANSFORMATION
            </div>
            <div style={{ fontSize: "10.5px", color: "#94a3b8" }}>
              Translating 2D Hydrodynamic Simulation into Operational Evacuation Windows
            </div>
          </div>
        </div>

        <span style={{
          padding: "3px 8px",
          borderRadius: "4px",
          backgroundColor: "rgba(34, 197, 94, 0.2)",
          color: "#86efac",
          border: "1px solid #22c55e",
          fontSize: "10px",
          fontWeight: 900
        }}>
          FEASIBLE ROUTE
        </span>
      </div>

      {/* 4-Stage Horizontal Pipeline Transformation Visual */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "6px",
        padding: "10px",
        backgroundColor: "rgba(15, 23, 42, 0.7)",
        borderRadius: "8px",
        border: "1px solid rgba(255,255,255,0.06)"
      }}>
        {/* Stage 1: HEC-RAS 2D */}
        <div style={{ flex: 1, textAlign: "center", padding: "6px", borderRadius: "6px", backgroundColor: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(56, 189, 248, 0.3)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", color: "#38bdf8", fontSize: "9px", fontWeight: 800 }}>
            <Layers size={11} />
            <span>HEC-RAS 2D</span>
          </div>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#ffffff", marginTop: "2px" }}>Wave Arrival</div>
          <div style={{ fontSize: "9px", color: "#94a3b8", fontFamily: "monospace" }}>A = T+60:00</div>
        </div>

        <ArrowRight size={14} color="#64748b" />

        {/* Stage 2: Road Coupling */}
        <div style={{ flex: 1, textAlign: "center", padding: "6px", borderRadius: "6px", backgroundColor: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(168, 85, 247, 0.3)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", color: "#c084fc", fontSize: "9px", fontWeight: 800 }}>
            <Network size={11} />
            <span>ROAD COUPLING</span>
          </div>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#ffffff", marginTop: "2px" }}>150m Envelope</div>
          <div style={{ fontSize: "9px", color: "#94a3b8", fontFamily: "monospace" }}>7 Edges (R02)</div>
        </div>

        <ArrowRight size={14} color="#64748b" />

        {/* Stage 3: EWE Solver */}
        <div style={{ flex: 1, textAlign: "center", padding: "6px", borderRadius: "6px", backgroundColor: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(245, 158, 11, 0.3)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", color: "#fbbf24", fontSize: "9px", fontWeight: 800 }}>
            <Clock size={11} />
            <span>EWE SOLVER</span>
          </div>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#ffffff", marginTop: "2px" }}>D = A - T - B</div>
          <div style={{ fontSize: "9px", color: "#94a3b8", fontFamily: "monospace" }}>argmin: E07</div>
        </div>

        <ArrowRight size={14} color="#64748b" />

        {/* Stage 4: Decision Output */}
        <div style={{ flex: 1.1, textAlign: "center", padding: "6px", borderRadius: "6px", backgroundColor: "rgba(34, 197, 94, 0.15)", border: "1px solid #22c55e" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", color: "#4ade80", fontSize: "9px", fontWeight: 800 }}>
            <CheckCircle2 size={11} />
            <span>DECISION</span>
          </div>
          <div style={{ fontSize: "11px", fontWeight: 900, color: "#ffffff", marginTop: "2px" }}>LEAVE BY</div>
          <div style={{ fontSize: "11px", fontWeight: 900, color: "#4ade80", fontFamily: "monospace" }}>T+44:21</div>
        </div>
      </div>

      {/* Hero Decision Result Card */}
      <div style={{
        backgroundColor: "rgba(34, 197, 94, 0.10)",
        border: "1.5px solid #22c55e",
        borderRadius: "8px",
        padding: "12px",
        textAlign: "center"
      }}>
        <div style={{ fontSize: "10.5px", fontWeight: 800, textTransform: "uppercase", color: "#94a3b8", letterSpacing: "1px" }}>
          LATEST FEASIBLE EVACUATION DEPARTURE
        </div>
        <div style={{ fontSize: "32px", fontWeight: 900, fontFamily: "monospace", color: "#ffffff", margin: "4px 0" }}>
          LEAVE BY {decision.deadlineFormatted}
        </div>
        <div style={{ fontSize: "11px", color: "#cbd5e1", marginTop: "2px" }}>
          A departure from Malidewal at <strong>{decision.deadlineFormatted}</strong> clears bottleneck <strong>{decision.limitingEdgeId}</strong> prior to modeled inundation.
        </div>
      </div>

      {/* Arithmetic Equation Breakdown */}
      <div style={{
        backgroundColor: "rgba(15, 23, 42, 0.85)",
        borderRadius: "6px",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "10px 14px",
        fontSize: "11px",
        fontFamily: "monospace",
        display: "flex",
        flexDirection: "column",
        gap: "4px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1" }}>
          <span>Flood Arrival at Limiting Edge ({decision.limitingEdgeId}):</span>
          <strong style={{ color: "#60a5fa" }}>{decision.arrivalFormatted} (3,600 s)</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1" }}>
          <span>minus Cumulative Travel Time (Origin → Edge):</span>
          <strong style={{ color: "#fbbf24" }}>- {decision.travelFormatted} (759 s)</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1" }}>
          <span>minus Configured Safety Buffer:</span>
          <strong style={{ color: "#f87171" }}>- {decision.bufferFormatted} (180 s)</strong>
        </div>
        <div style={{ borderTop: "1px dashed rgba(255,255,255,0.2)", paddingTop: "4px", marginTop: "2px", display: "flex", justifyContent: "space-between", fontWeight: 900, color: "#ffffff" }}>
          <span>= LATEST FEASIBLE DEPARTURE DEADLINE:</span>
          <span style={{ color: "#4ade80" }}>{decision.deadlineFormatted} (2,661 s)</span>
        </div>
      </div>

      {/* Footer Navigation Button */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
        {onExploreInOperationalMap && (
          <button
            onClick={onExploreInOperationalMap}
            style={{
              padding: "7px 14px",
              borderRadius: "6px",
              border: "1px solid #3b82f6",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              fontSize: "11px",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px"
            }}
          >
            <span>Explore on Operational 3D Map</span>
            <ArrowRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
};
