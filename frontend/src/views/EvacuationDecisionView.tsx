import React from "react";
import { Clock } from "lucide-react";
import type { ScenarioSummary, RouteAnalyzeResponse } from "../types";
import { getAuthoritativeDecision, getAuthoritativeEdgeBreakdown } from "../services/decisionStore";

interface EvacuationDecisionViewProps {
  scenarios: ScenarioSummary[];
  activeScenarioId: string;
  analysisResult: RouteAnalyzeResponse | null;
  selectedRouteId: string;
  onSelectRouteId: (id: string) => void;
  onNavigateToView: (view: string) => void;
}

export const EvacuationDecisionView: React.FC<EvacuationDecisionViewProps> = ({
  scenarios,
  activeScenarioId,
  selectedRouteId,
  onSelectRouteId: _onSelectRouteId,
  onNavigateToView
}) => {
  const activeSc = scenarios.find((s) => s.id === activeScenarioId);
  const decision = getAuthoritativeDecision(activeScenarioId, selectedRouteId);
  const edgeList = getAuthoritativeEdgeBreakdown(activeScenarioId);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "FEASIBLE":
        return {
          bg: "rgba(56, 189, 248, 0.15)",
          border: "#38bdf8",
          text: "#38bdf8",
          label: "FEASIBLE"
        };
      case "LOW_MARGIN":
        return {
          bg: "rgba(245, 158, 11, 0.15)",
          border: "#f59e0b",
          text: "#fbbf24",
          label: "LOW MARGIN"
        };
      case "INFEASIBLE":
        return {
          bg: "rgba(239, 68, 68, 0.15)",
          border: "#ef4444",
          text: "#f87171",
          label: "INFEASIBLE"
        };
      default:
        return {
          bg: "rgba(100, 116, 139, 0.15)",
          border: "#64748b",
          text: "#94a3b8",
          label: "DATA GAP"
        };
    }
  };

  const statusInfo = getStatusBadge(decision.status);

  return (
    <div style={{
      width: "100%",
      height: "100%",
      overflowY: "auto",
      backgroundColor: "#060913",
      color: "#f8fafc",
      display: "flex",
      flexDirection: "column",
      fontFamily: "Inter, sans-serif"
    }}>
      {/* Top Context Header */}
      <div style={{
        padding: "12px 28px",
        backgroundColor: "#0b1120",
        borderBottom: "1px solid rgba(255, 255, 255, 0.10)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "6px",
            backgroundColor: "rgba(56, 189, 248, 0.15)",
            border: "1px solid rgba(56, 189, 248, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Clock size={18} color="#38bdf8" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "14px", fontWeight: 800, color: "#ffffff", letterSpacing: "0.3px" }}>
              OPERATIONAL EVACUATION DECISION CONSOLE
            </h1>
            <div style={{ fontSize: "11px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
              <span>Scenario: <strong style={{ color: "#38bdf8" }}>{activeSc?.name || decision.scenarioName}</strong></span>
              <span>•</span>
              <span>Route: <strong style={{ color: "#cbd5e1" }}>{decision.routeName}</strong></span>
              <span>•</span>
              <span>Status: <strong style={{ color: statusInfo.text }}>{statusInfo.label}</strong></span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigateToView("OPERATIONAL_MAP")}
          style={{
            padding: "6px 14px",
            borderRadius: "4px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            color: "#cbd5e1",
            fontSize: "11px",
            fontWeight: 700,
            cursor: "pointer"
          }}
        >
          View on 3D Map
        </button>
      </div>

      {/* Main Console Content */}
      <div style={{
        flex: 1,
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        maxWidth: "1100px",
        margin: "0 auto",
        width: "100%",
        boxSizing: "border-box"
      }}>
        {/* HERO DECISION CARD (Section 27 Specification) */}
        <div style={{
          backgroundColor: "#0b1120",
          borderRadius: "8px",
          border: `1.5px solid ${statusInfo.border}`,
          padding: "24px",
          boxShadow: "0 16px 36px rgba(0, 0, 0, 0.5)",
          display: "flex",
          flexDirection: "column",
          gap: "16px"
        }}>
          {/* Metadata Row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{
                padding: "3px 8px",
                borderRadius: "3px",
                backgroundColor: statusInfo.bg,
                border: `1px solid ${statusInfo.border}`,
                color: statusInfo.text,
                fontSize: "11px",
                fontWeight: 900
              }}>
                {statusInfo.label}
              </span>
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                Scenario: <strong style={{ color: "#38bdf8" }}>{decision.scenarioId.replace("SCENARIO_", "")} (Qp = {decision.peakDischargeM3s.toLocaleString()} m³/s)</strong>
              </span>
            </div>

            <div style={{ fontSize: "11px", color: "#94a3b8" }}>
              Limiting Segment: <strong style={{ color: "#ef4444" }}>{decision.limitingEdgeId} ({decision.limitingSegmentName})</strong>
            </div>
          </div>

          {/* Huge Hero Decision Command */}
          <div style={{
            backgroundColor: "rgba(15, 23, 42, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.10)",
            borderRadius: "6px",
            padding: "20px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "#94a3b8", letterSpacing: "1px" }}>
              LATEST FEASIBLE DEPARTURE
            </div>
            <div style={{
              fontSize: "44px",
              fontWeight: 900,
              fontFamily: "monospace",
              letterSpacing: "-1px",
              color: "#ffffff",
              margin: "6px 0"
            }}>
              LEAVE BY {decision.deadlineFormatted}
            </div>
            <div style={{ fontSize: "12px", color: "#cbd5e1" }}>
              A departure at <strong style={{ color: "#38bdf8" }}>{decision.deadlineFormatted}</strong> reaches limiting edge <strong style={{ color: "#ef4444" }}>{decision.limitingEdgeId}</strong> before its modeled flood-arrival threshold (<strong style={{ color: "#60a5fa" }}>{decision.arrivalFormatted}</strong>), including the configured {decision.bufferFormatted} safety buffer.
            </div>
          </div>

          {/* Mathematical Proof Row */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
            paddingTop: "6px"
          }}>
            <div style={{ backgroundColor: "#0f172a", padding: "12px", borderRadius: "5px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 700 }}>FLOOD ARRIVAL (A_i)</div>
              <div style={{ fontSize: "18px", fontWeight: 900, fontFamily: "monospace", color: "#38bdf8", marginTop: "2px" }}>
                {decision.arrivalFormatted}
              </div>
              <div style={{ fontSize: "9.5px", color: "#64748b", marginTop: "2px" }}>Threshold h &ge; 0.30m at R02-E07</div>
            </div>

            <div style={{ backgroundColor: "#0f172a", padding: "12px", borderRadius: "5px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 700 }}>minus CUMULATIVE TRAVEL (T_i)</div>
              <div style={{ fontSize: "18px", fontWeight: 900, fontFamily: "monospace", color: "#fbbf24", marginTop: "2px" }}>
                - {decision.travelFormatted}
              </div>
              <div style={{ fontSize: "9.5px", color: "#64748b", marginTop: "2px" }}>Origin to limiting edge traversal</div>
            </div>

            <div style={{ backgroundColor: "#0f172a", padding: "12px", borderRadius: "5px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 700 }}>minus BUFFER (B)</div>
              <div style={{ fontSize: "18px", fontWeight: 900, fontFamily: "monospace", color: "#f87171", marginTop: "2px" }}>
                - {decision.bufferFormatted}
              </div>
              <div style={{ fontSize: "9.5px", color: "#64748b", marginTop: "2px" }}>Configured safety buffer</div>
            </div>

            <div style={{ backgroundColor: "rgba(56, 189, 248, 0.1)", padding: "12px", borderRadius: "5px", border: "1px solid rgba(56, 189, 248, 0.3)" }}>
              <div style={{ fontSize: "10px", color: "#38bdf8", fontWeight: 800 }}>= DEPARTURE DEADLINE</div>
              <div style={{ fontSize: "18px", fontWeight: 900, fontFamily: "monospace", color: "#ffffff", marginTop: "2px" }}>
                {decision.deadlineFormatted}
              </div>
              <div style={{ fontSize: "9.5px", color: "#38bdf8", marginTop: "2px" }}>60:00 - 12:39 - 03:00 = 44:21</div>
            </div>
          </div>
        </div>

        {/* Route Segment Table */}
        <div style={{
          backgroundColor: "#0b1120",
          borderRadius: "8px",
          border: "1px solid rgba(255, 255, 255, 0.10)",
          overflow: "hidden"
        }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", fontWeight: 800, color: "#ffffff" }}>
              Route R02 Limiting Edge Analysis
            </span>
            <span style={{ fontSize: "10px", color: "#94a3b8" }}>
              7 Edges Coupled via 150m Perpendicular Envelope
            </span>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#94a3b8", backgroundColor: "#0f172a" }}>
                <th style={{ padding: "8px 12px" }}>EDGE</th>
                <th style={{ padding: "8px 12px" }}>NAME</th>
                <th style={{ padding: "8px 12px" }}>LENGTH</th>
                <th style={{ padding: "8px 12px" }}>CUMULATIVE TRAVEL</th>
                <th style={{ padding: "8px 12px" }}>FLOOD ARRIVAL</th>
                <th style={{ padding: "8px 12px" }}>MARGIN</th>
                <th style={{ padding: "8px 12px" }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {edgeList.map((e) => (
                <tr
                  key={e.edgeId}
                  style={{
                    borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                    backgroundColor: e.isLimiting ? "rgba(239, 68, 68, 0.15)" : "transparent"
                  }}
                >
                  <td style={{ padding: "8px 12px", fontWeight: 800, color: e.isLimiting ? "#f87171" : "#ffffff" }}>
                    {e.edgeId}
                  </td>
                  <td style={{ padding: "8px 12px", color: "#cbd5e1" }}>{e.segmentName}</td>
                  <td style={{ padding: "8px 12px", color: "#94a3b8" }}>{e.lengthKm} km</td>
                  <td style={{ padding: "8px 12px", color: "#cbd5e1" }}>{e.travelToEdgeMin}</td>
                  <td style={{ padding: "8px 12px", color: "#38bdf8", fontWeight: 700 }}>{e.floodArrivalMin}</td>
                  <td style={{ padding: "8px 12px", color: e.isLimiting ? "#fbbf24" : "#4ade80", fontWeight: 800 }}>
                    {e.marginMin}
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    <span style={{
                      padding: "2px 6px",
                      borderRadius: "3px",
                      backgroundColor: e.isLimiting ? "rgba(239,68,68,0.25)" : "rgba(56,189,248,0.15)",
                      color: e.isLimiting ? "#fca5a5" : "#7dd3fc",
                      fontSize: "9px",
                      fontWeight: 800
                    }}>
                      {e.isLimiting ? "LIMITING" : "FEASIBLE"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
