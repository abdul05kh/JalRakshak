import React from "react";
import { Clock, AlertTriangle, ShieldCheck } from "lucide-react";
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
          bg: "var(--status-feasible-bg, #E8F4EE)",
          border: "var(--status-feasible-border, #A3CFB8)",
          text: "var(--status-feasible-text, #2C634B)",
          label: "FEASIBLE UNDER CONFIGURED ASSUMPTIONS"
        };
      case "LOW_MARGIN":
      case "LOW MARGIN":
        return {
          bg: "var(--status-lowmargin-bg, #FCF4E7)",
          border: "var(--status-lowmargin-border, #E8C895)",
          text: "var(--status-lowmargin-text, #825820)",
          label: "FEASIBLE WITH LOW MARGIN"
        };
      case "INFEASIBLE":
        return {
          bg: "var(--status-infeasible-bg, #FAECEC)",
          border: "var(--status-infeasible-border, #E89E9E)",
          text: "var(--status-infeasible-text, #873636)",
          label: "INFEASIBLE (WATER REACHES ROAD FIRST)"
        };
      default:
        return {
          bg: "var(--status-datagap-bg, #EDE7DC)",
          border: "var(--status-datagap-border, #D8D1C5)",
          text: "var(--status-datagap-text, #65747A)",
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
      backgroundColor: "var(--jr-bg, #F4EFE6)",
      color: "var(--jr-text, #24343A)",
      display: "flex",
      flexDirection: "column",
      fontFamily: "Inter, sans-serif"
    }}>
      {/* Top Context Header */}
      <div style={{
        padding: "12px 28px",
        backgroundColor: "var(--jr-surface, #FBF8F2)",
        borderBottom: "1px solid var(--jr-border, #D8D1C5)",
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
            backgroundColor: "var(--jr-blue-100, #D9EEF7)",
            border: "1px solid var(--jr-blue-400, #76B8D0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Clock size={18} color="var(--jr-blue-800, #24566A)" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "14px", fontWeight: 800, color: "var(--jr-text, #24343A)", letterSpacing: "0.2px" }}>
              OPERATIONAL EVACUATION DECISION CONSOLE
            </h1>
            <div style={{ fontSize: "11px", color: "var(--jr-text-muted, #65747A)", display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
              <span>Scenario: <strong style={{ color: "var(--jr-blue-800, #24566A)" }}>{activeSc?.name || decision.scenarioName}</strong></span>
              <span>•</span>
              <span>Route: <strong style={{ color: "var(--jr-text, #24343A)" }}>{decision.routeName}</strong></span>
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
            border: "1px solid var(--jr-border, #D8D1C5)",
            backgroundColor: "var(--jr-surface-alt, #EDE7DC)",
            color: "var(--jr-text, #24343A)",
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
        {/* HERO DECISION CARD */}
        <div style={{
          backgroundColor: "var(--jr-surface, #FBF8F2)",
          borderRadius: "8px",
          border: `1.5px solid ${statusInfo.border}`,
          padding: "24px",
          boxShadow: "0 4px 16px rgba(36, 52, 58, 0.08)",
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
                fontWeight: 800
              }}>
                {statusInfo.label}
              </span>
              <span style={{ fontSize: "11px", color: "var(--jr-text-muted, #65747A)" }}>
                Scenario: <strong style={{ color: "var(--jr-blue-800, #24566A)" }}>{decision.scenarioId.replace("SCENARIO_", "")} (Qp = {decision.peakDischargeM3s.toLocaleString()} m³/s)</strong>
              </span>
            </div>

            <div style={{ fontSize: "11px", color: "var(--jr-text-muted, #65747A)" }}>
              Governing Limiting Segment: <strong style={{ color: "var(--jr-danger, #A84C4C)" }}>{decision.limitingEdgeId} ({decision.limitingSegmentName})</strong>
            </div>
          </div>

          {/* Huge Hero Decision Command */}
          <div style={{
            backgroundColor: "var(--jr-surface-alt, #EDE7DC)",
            border: "1px solid var(--jr-border, #D8D1C5)",
            borderRadius: "6px",
            padding: "20px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "var(--jr-text-muted, #65747A)", letterSpacing: "1px" }}>
              LATEST FEASIBLE DEPARTURE
            </div>
            <div style={{
              fontSize: "42px",
              fontWeight: 900,
              fontFamily: "monospace",
              letterSpacing: "-1px",
              color: "var(--jr-blue-800, #24566A)",
              margin: "6px 0"
            }}>
              LEAVE BY {decision.deadlineFormatted}
            </div>
            <div style={{ fontSize: "12px", color: "var(--jr-text, #24343A)", maxWidth: "800px", margin: "0 auto" }}>
              A departure at <strong style={{ color: "var(--jr-blue-800, #24566A)" }}>{decision.deadlineFormatted}</strong> reaches limiting edge <strong style={{ color: "var(--jr-danger, #A84C4C)" }}>{decision.limitingEdgeId}</strong> before its modeled flood-arrival threshold (<strong style={{ color: "var(--jr-blue-600, #3D8EAE)" }}>{decision.arrivalFormatted}</strong>), including the configured {decision.bufferFormatted} safety buffer.
            </div>
          </div>

          {/* Mathematical Proof Row (A_i -> T_i -> B -> D) */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
            paddingTop: "6px"
          }}>
            <div style={{ backgroundColor: "var(--jr-blue-50, #EAF6FB)", padding: "12px", borderRadius: "5px", border: "1px solid var(--jr-blue-200, #B9DDEB)" }}>
              <div style={{ fontSize: "10px", color: "var(--jr-blue-800, #24566A)", fontWeight: 800 }}>1. WATER ARRIVAL (A_i)</div>
              <div style={{ fontSize: "18px", fontWeight: 900, fontFamily: "monospace", color: "var(--jr-blue-800, #24566A)", marginTop: "2px" }}>
                {decision.arrivalFormatted}
              </div>
              <div style={{ fontSize: "9.5px", color: "var(--jr-text-muted, #65747A)", marginTop: "2px" }}>Depth threshold h &ge; 0.30m at {decision.limitingEdgeId}</div>
            </div>

            <div style={{ backgroundColor: "var(--status-lowmargin-bg, #FCF4E7)", padding: "12px", borderRadius: "5px", border: "1px solid var(--status-lowmargin-border, #E8C895)" }}>
              <div style={{ fontSize: "10px", color: "var(--status-lowmargin-text, #825820)", fontWeight: 800 }}>2. minus TRAVEL TIME (T_i)</div>
              <div style={{ fontSize: "18px", fontWeight: 900, fontFamily: "monospace", color: "var(--status-lowmargin-text, #825820)", marginTop: "2px" }}>
                - {decision.travelFormatted}
              </div>
              <div style={{ fontSize: "9.5px", color: "var(--jr-text-muted, #65747A)", marginTop: "2px" }}>Origin to limiting edge traversal (50 km/h)</div>
            </div>

            <div style={{ backgroundColor: "var(--status-infeasible-bg, #FAECEC)", padding: "12px", borderRadius: "5px", border: "1px solid var(--status-infeasible-border, #E89E9E)" }}>
              <div style={{ fontSize: "10px", color: "var(--status-infeasible-text, #873636)", fontWeight: 800 }}>3. minus SAFETY BUFFER (B)</div>
              <div style={{ fontSize: "18px", fontWeight: 900, fontFamily: "monospace", color: "var(--status-infeasible-text, #873636)", marginTop: "2px" }}>
                - {decision.bufferFormatted}
              </div>
              <div style={{ fontSize: "9.5px", color: "var(--jr-text-muted, #65747A)", marginTop: "2px" }}>Configured emergency safety allowance</div>
            </div>

            <div style={{ backgroundColor: "var(--status-feasible-bg, #E8F4EE)", padding: "12px", borderRadius: "5px", border: "1px solid var(--status-feasible-border, #A3CFB8)" }}>
              <div style={{ fontSize: "10px", color: "var(--status-feasible-text, #2C634B)", fontWeight: 800 }}>= LATEST DEPARTURE</div>
              <div style={{ fontSize: "18px", fontWeight: 900, fontFamily: "monospace", color: "var(--status-feasible-text, #2C634B)", marginTop: "2px" }}>
                {decision.deadlineFormatted}
              </div>
              <div style={{ fontSize: "9.5px", color: "var(--status-feasible-text, #2C634B)", marginTop: "2px" }}>D = min_i(A_i - T_i - B) = 44:21</div>
            </div>
          </div>
        </div>

        {/* Route Segment Breakdown Table with Explicit Margins */}
        <div style={{
          backgroundColor: "var(--jr-surface, #FBF8F2)",
          borderRadius: "8px",
          border: "1px solid var(--jr-border, #D8D1C5)",
          overflow: "hidden"
        }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--jr-border, #D8D1C5)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--jr-text, #24343A)" }}>
              Route {selectedRouteId} Segment Margins & Limiting Bottleneck
            </span>
            <span style={{ fontSize: "10px", color: "var(--jr-text-muted, #65747A)" }}>
              7 Segments Coupled via 150m Perpendicular Envelope
            </span>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--jr-border, #D8D1C5)", color: "var(--jr-text-muted, #65747A)", backgroundColor: "var(--jr-surface-alt, #EDE7DC)" }}>
                <th style={{ padding: "8px 12px" }}>SEGMENT ID</th>
                <th style={{ padding: "8px 12px" }}>NAME</th>
                <th style={{ padding: "8px 12px" }}>LENGTH</th>
                <th style={{ padding: "8px 12px" }}>CUMULATIVE TRAVEL</th>
                <th style={{ padding: "8px 12px" }}>WATER ARRIVAL</th>
                <th style={{ padding: "8px 12px" }}>AVAILABLE MARGIN</th>
                <th style={{ padding: "8px 12px" }}>ROLE</th>
              </tr>
            </thead>
            <tbody>
              {edgeList.map((e) => (
                <tr
                  key={e.edgeId}
                  style={{
                    borderBottom: "1px solid var(--jr-border-subtle, #E8E2D7)",
                    backgroundColor: e.isLimiting ? "var(--status-infeasible-bg, #FAECEC)" : "transparent"
                  }}
                >
                  <td style={{ padding: "8px 12px", fontWeight: 800, color: e.isLimiting ? "var(--status-infeasible-text, #873636)" : "var(--jr-text, #24343A)" }}>
                    {e.edgeId}
                  </td>
                  <td style={{ padding: "8px 12px", color: "var(--jr-text, #24343A)" }}>{e.segmentName}</td>
                  <td style={{ padding: "8px 12px", color: "var(--jr-text-muted, #65747A)" }}>{e.lengthKm} km</td>
                  <td style={{ padding: "8px 12px", color: "var(--jr-text, #24343A)" }}>{e.travelToEdgeMin}</td>
                  <td style={{ padding: "8px 12px", color: "var(--jr-blue-800, #24566A)", fontWeight: 700 }}>{e.floodArrivalMin}</td>
                  <td style={{ padding: "8px 12px", color: e.isLimiting ? "var(--status-infeasible-text, #873636)" : "var(--status-feasible-text, #2C634B)", fontWeight: 800 }}>
                    {e.marginMin}
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    <span style={{
                      padding: "2px 6px",
                      borderRadius: "3px",
                      backgroundColor: e.isLimiting ? "var(--status-infeasible-bg, #FAECEC)" : "var(--status-feasible-bg, #E8F4EE)",
                      border: `1px solid ${e.isLimiting ? "var(--status-infeasible-border, #E89E9E)" : "var(--status-feasible-border, #A3CFB8)"}`,
                      color: e.isLimiting ? "var(--status-infeasible-text, #873636)" : "var(--status-feasible-text, #2C634B)",
                      fontSize: "9px",
                      fontWeight: 800
                    }}>
                      {e.isLimiting ? "LIMITING (Min Margin)" : "FEASIBLE"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Multi-Scenario Decision Comparison Matrix */}
        <div style={{
          backgroundColor: "var(--jr-surface, #FBF8F2)",
          borderRadius: "8px",
          border: "1px solid var(--jr-border, #D8D1C5)",
          padding: "16px"
        }}>
          <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--jr-text, #24343A)", marginBottom: "10px" }}>
            Operational Decision Delta across Prepared Breach Scenarios (Route {selectedRouteId})
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--jr-border, #D8D1C5)", color: "var(--jr-text-muted, #65747A)", backgroundColor: "var(--jr-surface-alt, #EDE7DC)" }}>
                <th style={{ padding: "8px 10px" }}>SCENARIO</th>
                <th style={{ padding: "8px 10px" }}>PEAK DISCHARGE</th>
                <th style={{ padding: "8px 10px" }}>WATER ARRIVAL</th>
                <th style={{ padding: "8px 10px" }}>TRAVEL TIME</th>
                <th style={{ padding: "8px 10px" }}>BUFFER</th>
                <th style={{ padding: "8px 10px" }}>LATEST DEPARTURE</th>
                <th style={{ padding: "8px 10px" }}>LIMITING SEGMENT</th>
                <th style={{ padding: "8px 10px" }}>DECISION STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid var(--jr-border-subtle, #E8E2D7)" }}>
                <td style={{ padding: "8px 10px", fontWeight: 700, color: "var(--jr-blue-800, #24566A)" }}>MINIMUM BREACH</td>
                <td style={{ padding: "8px 10px" }}>28,500 m³/s</td>
                <td style={{ padding: "8px 10px", color: "var(--jr-blue-800, #24566A)" }}>T+95:00</td>
                <td style={{ padding: "8px 10px" }}>12:39</td>
                <td style={{ padding: "8px 10px" }}>03:00</td>
                <td style={{ padding: "8px 10px", fontWeight: 800, color: "var(--status-feasible-text, #2C634B)" }}>T+79:21</td>
                <td style={{ padding: "8px 10px", color: "var(--jr-danger, #A84C4C)" }}>R02-E07</td>
                <td style={{ padding: "8px 10px", color: "var(--status-feasible-text, #2C634B)", fontWeight: 800 }}>FEASIBLE (+35m margin)</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--jr-border-subtle, #E8E2D7)", backgroundColor: "var(--jr-blue-50, #EAF6FB)" }}>
                <td style={{ padding: "8px 10px", fontWeight: 700, color: "var(--jr-blue-800, #24566A)" }}>CENTRAL (BASELINE)</td>
                <td style={{ padding: "8px 10px" }}>65,000 m³/s</td>
                <td style={{ padding: "8px 10px", color: "var(--jr-blue-800, #24566A)" }}>T+60:00</td>
                <td style={{ padding: "8px 10px" }}>12:39</td>
                <td style={{ padding: "8px 10px" }}>03:00</td>
                <td style={{ padding: "8px 10px", fontWeight: 800, color: "var(--jr-blue-800, #24566A)" }}>T+44:21</td>
                <td style={{ padding: "8px 10px", color: "var(--jr-danger, #A84C4C)" }}>R02-E07</td>
                <td style={{ padding: "8px 10px", color: "var(--status-feasible-text, #2C634B)", fontWeight: 800 }}>FEASIBLE (Baseline)</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--jr-border-subtle, #E8E2D7)" }}>
                <td style={{ padding: "8px 10px", fontWeight: 700, color: "var(--jr-danger, #A84C4C)" }}>MAXIMUM OVERTOPPING</td>
                <td style={{ padding: "8px 10px" }}>115,000 m³/s</td>
                <td style={{ padding: "8px 10px", color: "var(--jr-blue-800, #24566A)" }}>T+45:00</td>
                <td style={{ padding: "8px 10px" }}>12:39</td>
                <td style={{ padding: "8px 10px" }}>03:00</td>
                <td style={{ padding: "8px 10px", fontWeight: 800, color: "var(--status-lowmargin-text, #825820)" }}>T+29:21</td>
                <td style={{ padding: "8px 10px", color: "var(--jr-danger, #A84C4C)" }}>R02-E07</td>
                <td style={{ padding: "8px 10px", color: "var(--status-lowmargin-text, #825820)", fontWeight: 800 }}>LOW MARGIN (-15m delta)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Operational Assumptions & Boundary Limitations */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "14px"
        }}>
          {/* Configured Assumptions */}
          <div style={{
            backgroundColor: "var(--jr-blue-50, #EAF6FB)",
            borderRadius: "8px",
            border: "1px solid var(--jr-blue-200, #B9DDEB)",
            padding: "16px"
          }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--jr-blue-800, #24566A)", textTransform: "uppercase", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <ShieldCheck size={14} />
              Configured Operational Model Assumptions
            </div>
            <ul style={{ fontSize: "11.5px", color: "var(--jr-text, #24343A)", lineHeight: "1.6", margin: 0, paddingLeft: "16px" }}>
              <li><strong>Vehicle Travel Speed:</strong> 50 km/h (CONFIGURED ASSUMPTION).</li>
              <li><strong>Emergency Safety Buffer:</strong> 3.0 min (180 s) (CONFIGURED ASSUMPTION).</li>
              <li><strong>Flood Arrival Criterion:</strong> Water depth h &ge; 0.30 m or velocity v &ge; 1.0 m/s.</li>
              <li><strong>Road Coupling:</strong> 150m corridor envelope with &le;50m LineString vertex densification.</li>
            </ul>
          </div>

          {/* Model Limitations & Scientific Qualification */}
          <div style={{
            backgroundColor: "var(--status-lowmargin-bg, #FCF4E7)",
            borderRadius: "8px",
            border: "1px solid var(--status-lowmargin-border, #E8C895)",
            padding: "16px"
          }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--status-lowmargin-text, #825820)", textTransform: "uppercase", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <AlertTriangle size={14} />
              Explicit Limitations & Boundary Disclaimers
            </div>
            <ul style={{ fontSize: "11.5px", color: "var(--jr-text, #24343A)", lineHeight: "1.6", margin: 0, paddingLeft: "16px" }}>
              <li><strong>No Dynamic Traffic Model:</strong> Traffic congestion and vehicle breakdown are unmodelled.</li>
              <li><strong>No Physical Safety Guarantee:</strong> FEASIBLE status denotes clearance under declared equations.</li>
              <li><strong>Terrain Source:</strong> Copernicus GLO-30 DSM contains surface canopy; vertical datum not field established.</li>
              <li><strong>Solver Provenance:</strong> USACE HEC-RAS 2D unsteady forward simulation; SHA-256 verifies artifact integrity.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
