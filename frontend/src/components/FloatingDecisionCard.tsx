import React, { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Info,
  ChevronDown,
  ChevronUp,
  MapPin,
  ExternalLink
} from "lucide-react";
import type { RouteAlternative } from "../types";
import { getAuthoritativeDecision } from "../services/decisionStore";

interface FloatingDecisionCardProps {
  currentRoute?: RouteAlternative | null;
  routeId?: string;
  scenarioName?: string;
  safetyBufferMin?: number;
  onOpenDecisionView?: () => void;
  onOpenScienceView?: () => void;
  onFocusLimitingSegment?: () => void;
}

export const FloatingDecisionCard: React.FC<FloatingDecisionCardProps> = ({
  routeId = "R02",
  scenarioName = "SCENARIO_CENTRAL",
  safetyBufferMin = 3.0,
  onOpenDecisionView,
  onOpenScienceView,
  onFocusLimitingSegment
}) => {
  const [showWhy, setShowWhy] = useState<boolean>(false);

  // Single Authoritative Decision Source
  const decision = getAuthoritativeDecision(scenarioName, routeId, safetyBufferMin);

  const getStatusPresentation = (status: string) => {
    switch (status) {
      case "FEASIBLE":
        return {
          bg: "rgba(34, 197, 94, 0.12)",
          border: "#22c55e",
          text: "#4ade80",
          tagBg: "rgba(34, 197, 94, 0.25)",
          badgeText: "FEASIBLE",
          icon: <CheckCircle2 size={16} strokeWidth={2.5} color="#4ade80" />
        };
      case "LOW_MARGIN":
      case "LOW MARGIN":
        return {
          bg: "rgba(245, 158, 11, 0.12)",
          border: "#f59e0b",
          text: "#fbbf24",
          tagBg: "rgba(245, 158, 11, 0.25)",
          badgeText: "LOW MARGIN",
          icon: <AlertTriangle size={16} strokeWidth={2.5} color="#fbbf24" />
        };
      case "INFEASIBLE":
        return {
          bg: "rgba(239, 68, 68, 0.12)",
          border: "#ef4444",
          text: "#f87171",
          tagBg: "rgba(239, 68, 68, 0.25)",
          badgeText: "INFEASIBLE",
          icon: <XCircle size={16} strokeWidth={2.5} color="#f87171" />
        };
      default:
        return {
          bg: "rgba(100, 116, 139, 0.12)",
          border: "#64748b",
          text: "#94a3b8",
          tagBg: "rgba(100, 116, 139, 0.25)",
          badgeText: "DATA GAP",
          icon: <HelpCircle size={16} strokeWidth={2.5} color="#94a3b8" />
        };
    }
  };

  const pres = getStatusPresentation(decision.status);

  return (
    <div
      style={{
        position: "absolute",
        top: "16px",
        left: "16px",
        zIndex: 900,
        width: "min(320px, 92vw)",
        backgroundColor: "rgba(15, 23, 42, 0.92)",
        backdropFilter: "blur(12px)",
        border: `1.5px solid ${pres.border}`,
        borderRadius: "10px",
        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.5)",
        padding: "12px 14px",
        color: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        boxSizing: "border-box",
        fontFamily: "Inter, sans-serif"
      }}
    >
      {/* Header Context */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "6px" }}>
        <div>
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#ffffff", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "#38bdf8" }}>ROUTE {decision.routeId}</span>
            <span style={{ color: "#64748b" }}>•</span>
            <span style={{ color: "#cbd5e1", fontSize: "11px", fontWeight: 600 }}>Chamba Shelter</span>
          </div>
          <div style={{ fontSize: "9.5px", color: "#94a3b8", marginTop: "1px" }}>
            Scenario: <strong style={{ color: "#38bdf8" }}>{decision.scenarioId.replace("SCENARIO_", "")}</strong> ({decision.peakDischargeM3s.toLocaleString()} m³/s)
          </div>
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: "2px 7px",
          borderRadius: "4px",
          backgroundColor: pres.tagBg,
          border: `1px solid ${pres.border}`,
          color: pres.text,
          fontSize: "10px",
          fontWeight: 900
        }}>
          {pres.icon}
          <span>{pres.badgeText}</span>
        </div>
      </div>

      {/* Hero Metric: LEAVE BY (Latest Feasible Departure) */}
      <div
        style={{
          backgroundColor: pres.bg,
          border: `1px solid ${pres.border}`,
          borderRadius: "6px",
          padding: "8px 10px",
          textAlign: "center"
        }}
      >
        <div style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", color: "#94a3b8", letterSpacing: "0.8px" }}>
          LATEST FEASIBLE DEPARTURE
        </div>
        <div
          style={{
            fontSize: "28px",
            fontWeight: 900,
            fontFamily: "monospace",
            letterSpacing: "-0.5px",
            color: decision.status === "INFEASIBLE" ? "#ef4444" : "#ffffff",
            margin: "2px 0"
          }}
        >
          LEAVE BY {decision.deadlineFormatted}
        </div>
      </div>

      {/* Limiting Segment Tag */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "10.5px" }}>
        <span style={{ color: "#94a3b8" }}>Limiting Segment:</span>
        <button
          onClick={onFocusLimitingSegment}
          title="Zoom to Limiting Segment"
          style={{
            background: "none",
            border: "none",
            color: "#fbbf24",
            fontWeight: 800,
            fontSize: "11px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "3px",
            padding: 0
          }}
        >
          <MapPin size={11} color="#fbbf24" />
          <span>{decision.limitingEdgeId}</span>
        </button>
      </div>

      {/* Action: Level 2 WHY Expandable Drawer */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "6px" }}>
        <button
          onClick={() => setShowWhy(!showWhy)}
          style={{
            width: "100%",
            background: "none",
            border: "none",
            color: "#38bdf8",
            fontSize: "10px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            padding: "2px 0"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Info size={11} />
            <span>{showWhy ? "Hide Arithmetic Breakdown" : "Why this deadline?"}</span>
          </div>
          {showWhy ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {showWhy && (
          <div style={{
            marginTop: "6px",
            padding: "8px",
            backgroundColor: "rgba(15, 23, 42, 0.8)",
            borderRadius: "5px",
            border: "1px solid rgba(255,255,255,0.1)",
            fontSize: "10px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            fontFamily: "monospace"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1" }}>
              <span>Flood Arrival ({decision.limitingEdgeId}):</span>
              <strong style={{ color: "#60a5fa" }}>{decision.arrivalFormatted}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1" }}>
              <span>minus Travel Time:</span>
              <strong style={{ color: "#fbbf24" }}>- {decision.travelFormatted}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1" }}>
              <span>minus Safety Buffer:</span>
              <strong style={{ color: "#f87171" }}>- {decision.bufferFormatted}</strong>
            </div>
            <div style={{
              borderTop: "1px dashed rgba(255,255,255,0.15)",
              paddingTop: "4px",
              marginTop: "2px",
              display: "flex",
              justifyContent: "space-between",
              fontWeight: 800,
              color: "#ffffff"
            }}>
              <span>= DEPARTURE DEADLINE:</span>
              <span style={{ color: "#4ade80" }}>{decision.deadlineFormatted}</span>
            </div>

            <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
              {onOpenDecisionView && (
                <button
                  onClick={onOpenDecisionView}
                  style={{
                    flex: 1,
                    padding: "4px 6px",
                    borderRadius: "4px",
                    border: "1px solid #3b82f6",
                    backgroundColor: "rgba(59,130,246,0.2)",
                    color: "#93c5fd",
                    fontSize: "9.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px"
                  }}
                >
                  <span>Decision Details</span>
                  <ExternalLink size={10} />
                </button>
              )}

              {onOpenScienceView && (
                <button
                  onClick={onOpenScienceView}
                  style={{
                    flex: 1,
                    padding: "4px 6px",
                    borderRadius: "4px",
                    border: "1px solid rgba(255,255,255,0.15)",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    color: "#cbd5e1",
                    fontSize: "9.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px"
                  }}
                >
                  <span>Science Provenance</span>
                  <ExternalLink size={10} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
