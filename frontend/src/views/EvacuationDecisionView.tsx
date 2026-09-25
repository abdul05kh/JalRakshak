import React from "react";
import { 
  Clock, 
  AlertTriangle
} from "lucide-react";
import type { ScenarioSummary, RouteAnalyzeResponse } from "../types";
import { getAuthoritativeDecision } from "../services/decisionStore";

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
  onSelectRouteId,
  onNavigateToView
}) => {
  const activeSc = scenarios.find((s) => s.id === activeScenarioId);
  const decision = getAuthoritativeDecision(activeScenarioId, selectedRouteId);

  return (
    <div style={{
      width: "100%",
      height: "100%",
      overflowY: "auto",
      backgroundColor: "#090d16",
      color: "#f8fafc",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Header Banner */}
      <div style={{
        padding: "16px 28px",
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.10)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            backgroundColor: "rgba(34, 197, 94, 0.2)",
            border: "1px solid rgba(34, 197, 94, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Clock size={20} color="#4ade80" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#ffffff" }}>
              EVACUATION WINDOW & DEPARTURE DEADLINE SPECIFICATION
            </h1>
            <div style={{ fontSize: "11px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
              <span>Scenario: <strong style={{ color: "#38bdf8" }}>{activeSc?.name || decision.scenarioName}</strong></span>
              <span>|</span>
              <span>Primary Route: <strong style={{ color: "#4ade80" }}>{decision.routeName}</strong></span>
              <span>|</span>
              <span>Status: <strong style={{ color: "#22c55e" }}>{decision.statusBadgeText}</strong></span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigateToView("OPERATIONAL_MAP")}
          style={{
            padding: "6px 14px",
            borderRadius: "6px",
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

      {/* Main Content */}
      <div style={{
        flex: 1,
        padding: "28px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        maxWidth: "1300px",
        margin: "0 auto",
        width: "100%",
        boxSizing: "border-box"
      }}>
        {/* HERO COMMAND CARD */}
        <div style={{
          backgroundColor: "#0f172a",
          borderRadius: "14px",
          border: "2px solid #22c55e",
          padding: "28px",
          boxShadow: "0 25px 50px -12px rgba(34, 197, 94, 0.25)",
          display: "flex",
          flexDirection: "column",
          gap: "20px"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{
                padding: "4px 10px",
                borderRadius: "4px",
                backgroundColor: "#22c55e",
                color: "#0f172a",
                fontSize: "11px",
                fontWeight: 900
              }}>
                PRIMARY OPERATIONAL DIRECTIVE
              </span>
              <span style={{
                padding: "4px 10px",
                borderRadius: "4px",
                backgroundColor: "rgba(56, 189, 248, 0.15)",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                color: "#38bdf8",
                fontSize: "11px",
                fontWeight: 700
              }}>
                {decision.calculationVersion}
              </span>
            </div>

            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
              Limiting Road Segment: <strong style={{ color: "#fbbf24" }}>{decision.limitingEdgeId} ({decision.limitingSegmentName})</strong>
            </div>
          </div>

          {/* Huge Hero Headline */}
          <div style={{
            backgroundColor: "rgba(34, 197, 94, 0.10)",
            border: "1px solid rgba(34, 197, 94, 0.30)",
            borderRadius: "10px",
            padding: "20px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#86efac", textTransform: "uppercase", letterSpacing: "1px" }}>
              LATEST FEASIBLE DEPARTURE DEADLINE
            </div>
            <div style={{ fontSize: "44px", fontWeight: 900, color: "#ffffff", letterSpacing: "-1px", margin: "6px 0" }}>
              LEAVE BY {decision.deadlineFormatted}
            </div>
            <div style={{ fontSize: "13px", color: "#cbd5e1" }}>
              Evacuation via Route <strong>{decision.routeId}</strong> to <strong>{decision.destinationName}</strong> remains feasible if departed prior to <strong>{decision.deadlineFormatted}</strong>.
            </div>
          </div>

          {/* Step-by-Step Visual Equation */}
          <div>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px", display: "flex", justifyContent: "space-between" }}>
              <span>DETERMINISTIC ARITHMETIC PROVENANCE: D = A_i - T_i - B</span>
              <span style={{ fontFamily: "monospace", color: "#38bdf8" }}>{decision.formulaText}</span>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "14px"
            }}>
              {/* Box 1: Flood Arrival */}
              <div style={{
                backgroundColor: "rgba(30, 41, 59, 0.8)",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.10)",
                padding: "16px"
              }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#60a5fa", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span>FLOOD ARRIVAL (A_i)</span>
                  <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "3px", backgroundColor: "rgba(59,130,246,0.2)", color: "#93c5fd" }}>
                    DERIVED
                  </span>
                </div>
                <div style={{ fontSize: "28px", fontWeight: 900, color: "#ffffff", margin: "8px 0" }}>
                  {decision.arrivalFormatted}
                </div>
                <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                  Earliest intersecting HEC-RAS 2D hydraulic cell reaches depth &ge; 0.30 m on limiting segment {decision.limitingEdgeId}.
                </div>
              </div>

              {/* Box 2: Travel Time */}
              <div style={{
                backgroundColor: "rgba(30, 41, 59, 0.8)",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.10)",
                padding: "16px"
              }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#fbbf24", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span>TRAVEL TIME (T_i)</span>
                  <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "3px", backgroundColor: "rgba(245,158,11,0.2)", color: "#fde68a" }}>
                    ASSUMED
                  </span>
                </div>
                <div style={{ fontSize: "28px", fontWeight: 900, color: "#ffffff", margin: "8px 0" }}>
                  {decision.travelFormatted}
                </div>
                <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                  Cumulative graph traversal from Malidewal origin to safe high ground at baseline speed.
                </div>
              </div>

              {/* Box 3: Safety Buffer */}
              <div style={{
                backgroundColor: "rgba(30, 41, 59, 0.8)",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.10)",
                padding: "16px"
              }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#f87171", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span>SAFETY BUFFER (B)</span>
                  <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "3px", backgroundColor: "rgba(239,68,68,0.2)", color: "#fca5a5" }}>
                    CONFIGURED
                  </span>
                </div>
                <div style={{ fontSize: "28px", fontWeight: 900, color: "#ffffff", margin: "8px 0" }}>
                  {decision.bufferFormatted}
                </div>
                <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                  Configured clearance margin to account for vehicle boarding and initial route staging.
                </div>
              </div>

              {/* Box 4: Latest Feasible Departure */}
              <div style={{
                backgroundColor: "rgba(34, 197, 94, 0.15)",
                borderRadius: "8px",
                border: "2px solid #22c55e",
                padding: "16px"
              }}>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#86efac", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span>DEPARTURE DEADLINE (D)</span>
                  <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "3px", backgroundColor: "#22c55e", color: "#0f172a", fontWeight: 900 }}>
                    EXACT
                  </span>
                </div>
                <div style={{ fontSize: "28px", fontWeight: 900, color: "#4ade80", margin: "8px 0" }}>
                  = {decision.deadlineFormatted}
                </div>
                <div style={{ fontSize: "11px", color: "#bbf7d0" }}>
                  Latest timestamp to depart Malidewal before flood closure of route {decision.routeId}.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Route Feasibility Comparison Table */}
        <div style={{
          backgroundColor: "#1e293b",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.10)",
          padding: "20px"
        }}>
          <h3 style={{ margin: "0 0 14px 0", fontSize: "15px", fontWeight: 800, color: "#ffffff" }}>
            Multi-Corridor Evacuation Feasibility Comparison ({decision.scenarioName})
          </h3>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.12)", color: "#94a3b8" }}>
                  <th style={{ padding: "10px 12px" }}>ROUTE</th>
                  <th style={{ padding: "10px 12px" }}>DESTINATION</th>
                  <th style={{ padding: "10px 12px" }}>DISTANCE</th>
                  <th style={{ padding: "10px 12px" }}>TRAVEL TIME</th>
                  <th style={{ padding: "10px 12px" }}>FLOOD ARRIVAL</th>
                  <th style={{ padding: "10px 12px" }}>DEPARTURE DEADLINE</th>
                  <th style={{ padding: "10px 12px" }}>STATUS</th>
                  <th style={{ padding: "10px 12px" }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: "R02", dest: "Chamba Shelter via Koteshwar", dist: "10.5 km", travel: decision.travelFormatted, arrival: decision.arrivalFormatted, deadline: decision.deadlineFormatted, status: decision.statusBadgeText, isPrimary: selectedRouteId === "R02" },
                  { id: "R01", dest: "Chamba High Ridge Shelter", dist: "6.9 km", travel: "09:11", arrival: "UNAFFECTED (High Ground)", deadline: "UNAFFECTED", status: "FEASIBLE", isPrimary: selectedRouteId === "R01" },
                  { id: "R03", dest: "Devprayag Lowland Corridor", dist: "17.8 km", travel: "26:42", arrival: "T+45:00", deadline: "T+15:18", status: "FEASIBLE (LOW MARGIN)", isPrimary: false },
                  { id: "R04", dest: "Tehri North Ridge Access", dist: "4.8 km", travel: "06:24", arrival: "T+30:00", deadline: "T+20:36", status: "FEASIBLE", isPrimary: false },
                  { id: "R05", dest: "Koteshwar Dam Crossing", dist: "8.2 km", travel: "11:15", arrival: "T+25:00", deadline: "T+10:45", status: "INFEASIBLE (HIGH HAZARD)", isPrimary: false }
                ].map((r) => (
                  <tr key={r.id} style={{
                    borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                    backgroundColor: r.isPrimary ? "rgba(34, 197, 94, 0.10)" : "transparent"
                  }}>
                    <td style={{ padding: "10px 12px", fontWeight: 800, color: r.isPrimary ? "#4ade80" : "#ffffff" }}>
                      {r.id} {r.isPrimary && <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: "3px", backgroundColor: "#22c55e", color: "#0f172a", marginLeft: "4px" }}>PRIMARY</span>}
                    </td>
                    <td style={{ padding: "10px 12px", color: "#cbd5e1" }}>{r.dest}</td>
                    <td style={{ padding: "10px 12px", color: "#cbd5e1" }}>{r.dist}</td>
                    <td style={{ padding: "10px 12px", color: "#cbd5e1" }}>{r.travel}</td>
                    <td style={{ padding: "10px 12px", color: "#60a5fa", fontWeight: 700 }}>{r.arrival}</td>
                    <td style={{ padding: "10px 12px", color: "#4ade80", fontWeight: 800 }}>{r.deadline}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{
                        padding: "3px 8px",
                        borderRadius: "4px",
                        backgroundColor: r.status.includes("FEASIBLE") ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)",
                        color: r.status.includes("FEASIBLE") ? "#86efac" : "#fca5a5",
                        fontSize: "10px",
                        fontWeight: 800
                      }}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <button
                        onClick={() => {
                          onSelectRouteId(r.id);
                          onNavigateToView("OPERATIONAL_MAP");
                        }}
                        style={{
                          padding: "3px 8px",
                          borderRadius: "4px",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                          color: "#cbd5e1",
                          fontSize: "10px",
                          cursor: "pointer"
                        }}
                      >
                        Select on Map
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Operational Notice & Assumptions */}
        <div style={{
          backgroundColor: "rgba(15, 23, 42, 0.8)",
          borderRadius: "10px",
          border: "1px solid rgba(245, 158, 11, 0.3)",
          padding: "16px",
          display: "flex",
          alignItems: "flex-start",
          gap: "12px"
        }}>
          <AlertTriangle size={18} color="#fbbf24" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div style={{ fontSize: "11px", color: "#cbd5e1", lineHeight: "1.5" }}>
            <strong style={{ color: "#fbbf24" }}>Emergency Operational Assumptions & Boundary Conditions:</strong>
            <br />
            1. Travel time assumes a static configured baseline vehicle speed of 50 km/h. Dynamic vehicular congestion and road blockages are not modeled.
            <br />
            2. Safety buffer is set to a fixed 3.0-minute clearance.
            <br />
            3. Decision output represents hydraulic feasibility at the 0.30 m water depth threshold; structural bridge stability and road pavement washouts are not modeled.
          </div>
        </div>

      </div>
    </div>
  );
};
