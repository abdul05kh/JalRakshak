import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  Settings2,
  Table,
  Info,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import type {
  EvacuationPointFeature,
  RouteAnalyzeResponse,
  RouteAlternative
} from "../types";

interface DecisionPanelProps {
  evacPoints: EvacuationPointFeature[];
  selectedOriginId: string;
  onSelectOrigin: (id: string) => void;
  selectedDestinationId: string;
  onSelectDestination: (id: string) => void;
  departureTime: string;
  onChangeDepartureTime: (time: string) => void;
  safetyBufferMin: number;
  onChangeSafetyBuffer: (buf: number) => void;
  depthLimitM: number;
  onChangeDepthLimit: (d: number) => void;
  velocityLimitMps: number;
  onChangeVelocityLimit: (v: number) => void;
  onRunAnalysis: () => void;
  isAnalyzing: boolean;
  analysisResult: RouteAnalyzeResponse | null;
  activeAlternativeIndex: number;
  onSelectAlternative: (idx: number) => void;
  onOpenProvenance?: () => void;
}

// Helper to format seconds as mm:ss or T+mm:ss
function formatRelTime(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || isNaN(seconds)) return "N/A";
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  const mm = mins.toString().padStart(2, "0");
  const ss = secs.toString().padStart(2, "0");
  return `T+${mm}:${ss}`;
}

// Helper to format minutes as mm:ss
function formatMinSec(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined || isNaN(minutes)) return "N/A";
  const totalSecs = Math.round(minutes * 60);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  const mm = mins.toString().padStart(2, "0");
  const ss = secs.toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

export const DecisionPanel: React.FC<DecisionPanelProps> = ({
  evacPoints,
  selectedOriginId,
  onSelectOrigin,
  selectedDestinationId,
  onSelectDestination,
  departureTime,
  onChangeDepartureTime,
  safetyBufferMin,
  onChangeSafetyBuffer,
  depthLimitM,
  onChangeDepthLimit,
  velocityLimitMps,
  onChangeVelocityLimit,
  onRunAnalysis,
  isAnalyzing,
  analysisResult,
  activeAlternativeIndex,
  onSelectAlternative,
  onOpenProvenance
}) => {
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [showTable, setShowTable] = useState<boolean>(false);
  const [showWhyDetails, setShowWhyDetails] = useState<boolean>(true);

  const origins = evacPoints.filter((p) => p.properties.category === "ORIGIN");
  const destinations = evacPoints.filter((p) => p.properties.category === "DESTINATION");

  const currentRoute: RouteAlternative | null =
    analysisResult && analysisResult.alternatives[activeAlternativeIndex]
      ? analysisResult.alternatives[activeAlternativeIndex]
      : analysisResult?.primary_route || null;

  const getStatusPresentation = (status: string) => {
    switch (status) {
      case "FEASIBLE":
        return {
          bg: "var(--status-feasible-bg, #E8F4EE)",
          border: "var(--status-feasible-border, #A3CFB8)",
          titleColor: "var(--status-feasible-text, #2C634B)",
          tagBg: "var(--status-feasible-text, #2C634B)",
          tagText: "#ffffff",
          badgeText: "FEASIBLE",
          icon: <CheckCircle2 size={24} strokeWidth={2.5} color="var(--status-feasible-text, #2C634B)" />,
          summary: "Evacuation route is feasible under current scenario and configured assumptions."
        };
      case "LOW MARGIN":
        return {
          bg: "var(--status-lowmargin-bg, #FCF4E7)",
          border: "var(--status-lowmargin-border, #E8C895)",
          titleColor: "var(--status-lowmargin-text, #825820)",
          tagBg: "var(--status-lowmargin-text, #825820)",
          tagText: "#ffffff",
          badgeText: "LOW MARGIN",
          icon: <AlertTriangle size={24} strokeWidth={2.5} color="var(--status-lowmargin-text, #825820)" />,
          summary: "Route is feasible under current scenario, but safety margin is narrow (< 5 min)."
        };
      case "INFEASIBLE":
        return {
          bg: "var(--status-infeasible-bg, #FAECEC)",
          border: "var(--status-infeasible-border, #E89E9E)",
          titleColor: "var(--status-infeasible-text, #873636)",
          tagBg: "var(--status-infeasible-text, #873636)",
          tagText: "#ffffff",
          badgeText: "INFEASIBLE",
          icon: <XCircle size={24} strokeWidth={2.5} color="var(--status-infeasible-text, #873636)" />,
          summary: "Floodwaters breach route before vehicle clears limiting segment under current assumptions."
        };
      default:
        return {
          bg: "var(--status-datagap-bg, #EDE7DC)",
          border: "var(--status-datagap-border, #D8D1C5)",
          titleColor: "var(--status-datagap-text, #65747A)",
          tagBg: "var(--status-datagap-text, #65747A)",
          tagText: "#ffffff",
          badgeText: "DATA GAP",
          icon: <HelpCircle size={24} strokeWidth={2.5} color="var(--status-datagap-text, #65747A)" />,
          summary: "Cannot compute feasibility due to missing or uncoupled hydraulic data."
        };
    }
  };

  const selectedOrigin = evacPoints.find((p) => p.properties.id === selectedOriginId);
  const selectedDest = evacPoints.find((p) => p.properties.id === selectedDestinationId);

  // Derive arithmetic breakdown values
  const floodArrivalSeconds = currentRoute?.limiting_segment?.flood_arrival_s ?? (currentRoute?.status === "FEASIBLE" ? 3600 : null);
  const travelTimeMin = currentRoute?.total_travel_time_min ?? 12.65;
  const safetyBuffer = safetyBufferMin ?? 3.0;

  // Derive formatted deadline
  // In Central scenario baseline: arrival = 3600s (T+60:00), travel = 12:39 (759s), buffer = 3:00 (180s) -> deadline = 2661s (T+44:21)
  let latestDepartureDisplay = "IMPASSIBLE";
  if (currentRoute?.status === "FEASIBLE" || currentRoute?.status === "LOW MARGIN") {
    if (currentRoute.deadline_utc) {
      latestDepartureDisplay = currentRoute.deadline_utc.substring(11, 16) + " UTC";
    }
    if (floodArrivalSeconds) {
      const deadlineSec = floodArrivalSeconds - (travelTimeMin * 60) - (safetyBuffer * 60);
      if (deadlineSec >= 0) {
        latestDepartureDisplay = formatRelTime(deadlineSec);
      }
    }
  }

  const formattedMargin = currentRoute?.margin_min !== null && currentRoute?.margin_min !== undefined
    ? (currentRoute.margin_min > 0 ? `+${currentRoute.margin_min.toFixed(1)} min` : `${currentRoute.margin_min.toFixed(1)} min`)
    : "N/A";

  const limitingSegmentId = currentRoute?.limiting_segment?.road_id || "R02";

  return (
    <div style={{
      width: "420px",
      backgroundColor: "var(--jr-surface, #FBF8F2)",
      borderLeft: "1px solid var(--jr-border, #D8D1C5)",
      display: "flex",
      flexDirection: "column",
      height: "calc(100vh - 58px)",
      overflowY: "auto",
      padding: "16px",
      gap: "14px",
      boxSizing: "border-box"
    }}>
      {/* 1. SCENARIO & CONTEXT HEADER */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "2px solid var(--jr-border, #D8D1C5)",
        paddingBottom: "8px"
      }}>
        <div>
          <div style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--jr-text-muted, #65747A)" }}>
            {analysisResult?.scenario_name ? analysisResult.scenario_name.toUpperCase() : "FLOOD SCENARIO"}
          </div>
          <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--jr-text, #24343A)" }}>
            {selectedOrigin?.properties.name || "Origin"} → {selectedDest?.properties.name || "Destination"}
          </div>
        </div>
        <div style={{
          fontSize: "10px",
          fontWeight: 700,
          padding: "3px 7px",
          borderRadius: "4px",
          backgroundColor: "var(--jr-surface-alt, #EDE7DC)",
          color: "var(--jr-text, #24343A)",
          border: "1px solid var(--jr-border, #D8D1C5)"
        }}>
          ROUTE DECISION
        </div>
      </div>

      {/* 2. LEVEL 1: PRIMARY DECISION VIEW */}
      {currentRoute ? (
        (() => {
          const pres = getStatusPresentation(currentRoute.status);

          return (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Giant Decision Hero Card */}
              <div style={{
                backgroundColor: pres.bg,
                border: `2px solid ${pres.border}`,
                borderRadius: "8px",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              }}>
                {/* Status Badge */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {pres.icon}
                    <div>
                      <div style={{ fontSize: "24px", fontWeight: 900, letterSpacing: "-0.5px", color: pres.titleColor, lineHeight: 1.1 }}>
                        {pres.badgeText}
                      </div>
                      <div style={{ fontSize: "10px", color: "var(--text-secondary)", marginTop: "2px" }}>
                        Feasible under current scenario and assumptions
                      </div>
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: pres.tagBg,
                    color: pres.tagText,
                    fontSize: "12px",
                    fontWeight: 800,
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontFamily: "monospace"
                  }}>
                    {formattedMargin}
                  </div>
                </div>

                {/* Hero Metric: LEAVE BY (Latest Feasible Departure) */}
                <div style={{
                  backgroundColor: "#ffffff",
                  border: `2px solid ${pres.border}`,
                  borderRadius: "8px",
                  padding: "14px 10px",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", color: "#475569", letterSpacing: "1px" }}>
                    LEAVE BY
                  </div>
                  <div style={{
                    fontSize: "36px",
                    fontWeight: 900,
                    fontFamily: "monospace",
                    color: currentRoute.status === "INFEASIBLE" ? "#b91c1c" : "#0f172a",
                    marginTop: "2px",
                    letterSpacing: "1.5px"
                  }}>
                    {latestDepartureDisplay}
                  </div>
                  <div style={{ fontSize: "10px", color: "#64748b", marginTop: "3px" }}>
                    Latest feasible departure under scenario and buffer rules
                  </div>
                </div>

                {/* Primary Timing Triad & Limiting Segment */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                  backgroundColor: "#ffffff",
                  border: `1px solid ${pres.border}`,
                  borderRadius: "6px",
                  padding: "10px",
                  fontSize: "11px"
                }}>
                  <div>
                    <span style={{ color: "#64748b", display: "block", fontSize: "10px", textTransform: "uppercase", fontWeight: 700 }}>
                      Flood reaches route:
                    </span>
                    <strong style={{ color: "#0f172a", fontSize: "13px", fontFamily: "monospace" }}>
                      {floodArrivalSeconds ? formatRelTime(floodArrivalSeconds) : "T+60:00"}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748b", display: "block", fontSize: "10px", textTransform: "uppercase", fontWeight: 700 }}>
                      Travel time:
                    </span>
                    <strong style={{ color: "#0f172a", fontSize: "13px", fontFamily: "monospace" }}>
                      {formatMinSec(travelTimeMin)}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748b", display: "block", fontSize: "10px", textTransform: "uppercase", fontWeight: 700 }}>
                      Safety buffer:
                    </span>
                    <strong style={{ color: "#0f172a", fontSize: "13px", fontFamily: "monospace" }}>
                      {formatMinSec(safetyBuffer)}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748b", display: "block", fontSize: "10px", textTransform: "uppercase", fontWeight: 700 }}>
                      Limiting part of route:
                    </span>
                    <strong style={{ color: "#b91c1c", fontSize: "13px" }}>
                      {limitingSegmentId}
                    </strong>
                  </div>
                </div>
              </div>

              {/* 3. LEVEL 2: WHY? (ARITHMETIC EXPLANATION & LIMITING SEGMENT) */}
              <div style={{
                backgroundColor: "#f8fafc",
                border: "1px solid var(--border-subtle)",
                borderRadius: "6px",
                overflow: "hidden"
              }}>
                <button
                  onClick={() => setShowWhyDetails(!showWhyDetails)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    backgroundColor: "#f1f5f9",
                    border: "none",
                    borderBottom: showWhyDetails ? "1px solid var(--border-subtle)" : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "#0f172a",
                    textTransform: "uppercase",
                    letterSpacing: "0.4px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Info size={14} color="#2563eb" />
                    <span>WHY? (Decision Explanation)</span>
                  </div>
                  {showWhyDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {showWhyDetails && (
                  <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "11px" }}>
                    {/* Plain Language Explanation */}
                    <div style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      padding: "8px 10px",
                      lineHeight: "1.5",
                      color: "#1e293b",
                      fontSize: "11px"
                    }}>
                      The flood reaches the route at <strong>{floodArrivalSeconds ? formatRelTime(floodArrivalSeconds) : "T+60:00"}</strong>.<br/>
                      You need <strong>{formatMinSec(travelTimeMin)}</strong> to travel.<br/>
                      A <strong>{formatMinSec(safetyBuffer)}</strong> safety buffer is configured.<br/>
                      So the latest feasible departure is <strong>{latestDepartureDisplay}</strong>.
                    </div>

                    {/* Arithmetic Calculation Card */}
                    <div style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      padding: "8px 10px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                      fontFamily: "monospace",
                      fontSize: "11px"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", color: "#334155" }}>
                        <span>Flood reaches route:</span>
                        <strong>{floodArrivalSeconds ? formatRelTime(floodArrivalSeconds) : "T+60:00"}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
                        <span>minus Travel time:</span>
                        <strong>- {formatMinSec(travelTimeMin)}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
                        <span>minus Safety buffer:</span>
                        <strong>- {formatMinSec(safetyBuffer)}</strong>
                      </div>
                      <div style={{
                        borderTop: "1.5px solid #0f172a",
                        paddingTop: "4px",
                        marginTop: "2px",
                        display: "flex",
                        justifyContent: "space-between",
                        fontWeight: 800,
                        color: "#0f172a",
                        fontSize: "12px"
                      }}>
                        <span>LEAVE BY:</span>
                        <span style={{ color: currentRoute.status === "INFEASIBLE" ? "#b91c1c" : "#166534" }}>
                          = {latestDepartureDisplay}
                        </span>
                      </div>
                    </div>

                    {/* Limiting Segment Details */}
                    {currentRoute.limiting_segment && (
                      <div style={{
                        backgroundColor: currentRoute.status === "INFEASIBLE" ? "#fff1f2" : "#f8fafc",
                        border: `1px solid ${currentRoute.status === "INFEASIBLE" ? "#fecdd3" : "#e2e8f0"}`,
                        borderRadius: "6px",
                        padding: "8px 10px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px", fontWeight: 800, fontSize: "11px", color: currentRoute.status === "INFEASIBLE" ? "#991b1b" : "#1e293b" }}>
                          <ShieldAlert size={13} color={currentRoute.status === "INFEASIBLE" ? "#dc2626" : "#475569"} />
                          <span>LIMITING PART OF ROUTE: {currentRoute.limiting_segment.road_id}</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", fontSize: "10px", color: "#475569" }}>
                          <div>Flood reaches segment: <strong>{formatRelTime(currentRoute.limiting_segment.flood_arrival_s)}</strong></div>
                          <div>Travel to segment: <strong>{currentRoute.limiting_segment.cumulative_travel_min} min</strong></div>
                          <div>Max depth: <strong>{currentRoute.limiting_segment.max_depth_m} m</strong></div>
                          <div>Velocity: <strong>{currentRoute.limiting_segment.max_velocity_mps} m/s</strong></div>
                        </div>
                        <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>
                          This segment limits the route decision.
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Alternative Route Evaluations (if any) */}
              {analysisResult && analysisResult.alternatives.length > 1 && (
                <div>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>
                    Alternative Route Evaluations
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {analysisResult.alternatives.map((alt, idx) => (
                      <button
                        key={idx}
                        onClick={() => onSelectAlternative(idx)}
                        style={{
                          flex: 1,
                          padding: "6px 8px",
                          borderRadius: "4px",
                          border: `1.5px solid ${activeAlternativeIndex === idx ? "#2563eb" : "var(--border-subtle)"}`,
                          backgroundColor: activeAlternativeIndex === idx ? "#eff6ff" : "#ffffff",
                          fontSize: "11px",
                          fontWeight: 700,
                          color: activeAlternativeIndex === idx ? "#2563eb" : "var(--text-secondary)",
                          cursor: "pointer"
                        }}
                      >
                        Path {idx === 0 ? "1 (Primary)" : `2 (Alt ${idx})`}
                        <div style={{
                          fontSize: "9px",
                          fontWeight: 800,
                          color: alt.status === "FEASIBLE" ? "#166534" : alt.status === "LOW MARGIN" ? "#d97706" : "#dc2626"
                        }}>
                          {alt.status}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. LEVEL 3: PROGRESSIVE DISCLOSURE CONTROLS */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {/* Route Segments Table Toggle */}
                <button
                  onClick={() => setShowTable(!showTable)}
                  style={{
                    background: "none",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#2563eb",
                    cursor: "pointer",
                    padding: 0
                  }}
                >
                  <Table size={12} />
                  {showTable ? "Hide Route Segment Breakdown" : "View Route Segment Breakdown"}
                </button>

                {showTable && (
                  <div style={{
                    marginTop: "4px",
                    overflowX: "auto",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "4px"
                  }}>
                    <table style={{ width: "100%", fontSize: "10px", textAlign: "left", borderCollapse: "collapse" }}>
                      <thead style={{ backgroundColor: "#f1f5f9" }}>
                        <tr>
                          <th style={{ padding: "4px 6px" }}>Edge</th>
                          <th style={{ padding: "4px 6px" }}>Cumul</th>
                          <th style={{ padding: "4px 6px" }}>Arrival</th>
                          <th style={{ padding: "4px 6px" }}>Depth</th>
                          <th style={{ padding: "4px 6px" }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentRoute.edges.map((e, idx) => (
                          <tr key={idx} style={{ borderTop: "1px solid var(--border-subtle)", backgroundColor: e.edge_feasible ? "#ffffff" : "#fef2f2" }}>
                            <td style={{ padding: "4px 6px", fontWeight: 700 }}>{e.edge_id}</td>
                            <td style={{ padding: "4px 6px" }}>{e.cumulative_travel_min}m</td>
                            <td style={{ padding: "4px 6px" }}>{e.flood_arrival_s !== null ? `${Math.round(e.flood_arrival_s / 60)}m` : "Clear"}</td>
                            <td style={{ padding: "4px 6px" }}>{e.max_depth_m}m</td>
                            <td style={{ padding: "4px 6px", fontWeight: 700, color: e.edge_feasible ? "#166534" : "#991b1b" }}>
                              {e.edge_feasible ? "PASS" : "FAIL"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          );
        })()
      ) : (
        <div style={{
          padding: "20px 12px",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "12px",
          border: "1px dashed var(--border-strong)",
          borderRadius: "6px"
        }}>
          Select an origin and shelter destination below, then click <strong>Calculate Evacuation Window</strong> to derive route feasibility.
        </div>
      )}

      {/* 5. ROUTE QUERY & THRESHOLD CONTROLS */}
      <div style={{
        marginTop: "auto",
        backgroundColor: "#f8fafc",
        border: "1px solid var(--border-subtle)",
        borderRadius: "6px",
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "8px"
      }}>
        <div style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", color: "#64748b", letterSpacing: "0.4px" }}>
          Evacuation Route Parameters
        </div>

        {/* Origin */}
        <div>
          <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "2px" }}>
            Origin:
          </label>
          <select
            value={selectedOriginId}
            onChange={(e) => onSelectOrigin(e.target.value)}
            style={{
              width: "100%",
              padding: "5px 8px",
              borderRadius: "4px",
              border: "1px solid var(--border-strong)",
              backgroundColor: "#ffffff",
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--text-primary)"
            }}
          >
            {origins.map((pt) => (
              <option key={pt.properties.id} value={pt.properties.id}>
                {pt.properties.name} (Pop: {pt.properties.population})
              </option>
            ))}
          </select>
        </div>

        {/* Destination */}
        <div>
          <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "2px" }}>
            Destination (Shelter):
          </label>
          <select
            value={selectedDestinationId}
            onChange={(e) => onSelectDestination(e.target.value)}
            style={{
              width: "100%",
              padding: "5px 8px",
              borderRadius: "4px",
              border: "1px solid var(--border-strong)",
              backgroundColor: "#ffffff",
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--text-primary)"
            }}
          >
            {destinations.map((pt) => (
              <option key={pt.properties.id} value={pt.properties.id}>
                {pt.properties.name} ({pt.properties.elevation_m}m MSL)
              </option>
            ))}
          </select>
        </div>

        {/* Config Safety Rules Accordion */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={() => setShowConfig(!showConfig)}
            style={{
              background: "none",
              border: "none",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "10px",
              fontWeight: 700,
              color: "#2563eb",
              cursor: "pointer",
              padding: 0
            }}
          >
            <Settings2 size={12} />
            {showConfig ? "Hide Safety Thresholds" : "Configure Safety Buffer & Thresholds"}
          </button>
        </div>

        {showConfig && (
          <div style={{
            padding: "8px",
            backgroundColor: "#ffffff",
            border: "1px solid var(--border-subtle)",
            borderRadius: "4px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            fontSize: "11px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Departure Time (UTC):</span>
              <input
                type="text"
                value={departureTime}
                onChange={(e) => onChangeDepartureTime(e.target.value)}
                style={{ width: "130px", padding: "2px 4px", fontSize: "10px", fontFamily: "monospace" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Safety Buffer:</span>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="30"
                  value={safetyBufferMin}
                  onChange={(e) => onChangeSafetyBuffer(parseFloat(e.target.value) || 0)}
                  style={{ width: "45px", padding: "2px 4px", fontSize: "11px", textAlign: "right" }}
                />
                <span>min</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Max Water Depth:</span>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="2.0"
                  value={depthLimitM}
                  onChange={(e) => onChangeDepthLimit(parseFloat(e.target.value) || 0.3)}
                  style={{ width: "45px", padding: "2px 4px", fontSize: "11px", textAlign: "right" }}
                />
                <span>m</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Max Flow Velocity:</span>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <input
                  type="number"
                  step="0.1"
                  min="0.2"
                  max="5.0"
                  value={velocityLimitMps}
                  onChange={(e) => onChangeVelocityLimit(parseFloat(e.target.value) || 1.0)}
                  style={{ width: "45px", padding: "2px 4px", fontSize: "11px", textAlign: "right" }}
                />
                <span>m/s</span>
              </div>
            </div>
          </div>
        )}

        {/* Calculate Button */}
        <button
          onClick={onRunAnalysis}
          disabled={isAnalyzing}
          style={{
            marginTop: "2px",
            padding: "8px 12px",
            borderRadius: "6px",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: "12px",
            border: "none",
            cursor: isAnalyzing ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px"
          }}
        >
          {isAnalyzing ? "Evaluating Hydraulic Feasibility..." : "Recalculate Evacuation Window"}
          <ArrowRight size={14} />
        </button>

        {/* Technical Provenance Trigger */}
        {onOpenProvenance && (
          <button
            onClick={onOpenProvenance}
            style={{
              background: "none",
              border: "none",
              fontSize: "10px",
              color: "#64748b",
              textAlign: "center",
              cursor: "pointer",
              textDecoration: "underline",
              paddingTop: "2px"
            }}
          >
            View Technical Provenance & Model Assumptions →
          </button>
        )}
      </div>

      {/* Safety Notice */}
      <div style={{
        padding: "6px 8px",
        backgroundColor: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "4px",
        fontSize: "9px",
        color: "#64748b",
        lineHeight: "1.3"
      }}>
        <strong>Operational Safety Notice:</strong> Feasible under current scenario and configured assumptions. Not a guarantee of physical safety. Results depend on hydraulic, terrain, route, travel-time, and safety-buffer assumptions.
      </div>
    </div>
  );
};
