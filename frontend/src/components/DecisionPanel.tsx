import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  Settings2,
  Table
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
  onSelectAlternative
}) => {
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [showTable, setShowTable] = useState<boolean>(false);

  const origins = evacPoints.filter((p) => p.properties.category === "ORIGIN");
  const destinations = evacPoints.filter((p) => p.properties.category === "DESTINATION");

  const currentRoute: RouteAlternative | null =
    analysisResult && analysisResult.alternatives[activeAlternativeIndex]
      ? analysisResult.alternatives[activeAlternativeIndex]
      : analysisResult?.primary_route || null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "FEASIBLE":
        return {
          bg: "var(--status-feasible-bg)",
          color: "var(--status-feasible-text)",
          border: "var(--status-feasible-border)",
          icon: <CheckCircle2 size={16} strokeWidth={2.5} />,
          label: "ROUTE FEASIBLE UNDER THIS SCENARIO"
        };
      case "LOW MARGIN":
        return {
          bg: "var(--status-lowmargin-bg)",
          color: "var(--status-lowmargin-text)",
          border: "var(--status-lowmargin-border)",
          icon: <AlertTriangle size={16} strokeWidth={2.5} />,
          label: "FEASIBLE WITH LOW TIME MARGIN"
        };
      case "INFEASIBLE":
        return {
          bg: "var(--status-infeasible-bg)",
          color: "var(--status-infeasible-text)",
          border: "var(--status-infeasible-border)",
          icon: <XCircle size={16} strokeWidth={2.5} />,
          label: "ROUTE NOT FEASIBLE (HAZARD REACHES FIRST)"
        };
      default:
        return {
          bg: "var(--status-datagap-bg)",
          color: "var(--status-datagap-text)",
          border: "var(--status-datagap-border)",
          icon: <HelpCircle size={16} strokeWidth={2.5} />,
          label: "CANNOT DETERMINE FEASIBILITY (DATA GAP)"
        };
    }
  };

  return (
    <div style={{
      width: "380px",
      backgroundColor: "#ffffff",
      borderLeft: "1px solid var(--border-subtle)",
      display: "flex",
      flexDirection: "column",
      height: "calc(100vh - 58px)",
      overflowY: "auto",
      padding: "16px",
      gap: "16px"
    }}>
      {/* Route Selector Controls */}
      <div style={{
        backgroundColor: "#f8fafc",
        border: "1px solid var(--border-subtle)",
        borderRadius: "6px",
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      }}>
        <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.4px" }}>
          Evacuation Planning Query
        </div>

        {/* Origin */}
        <div>
          <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "3px" }}>
            Origin (Vulnerable Settlement):
          </label>
          <select
            value={selectedOriginId}
            onChange={(e) => onSelectOrigin(e.target.value)}
            style={{
              width: "100%",
              padding: "6px 8px",
              borderRadius: "4px",
              border: "1px solid var(--border-strong)",
              backgroundColor: "#ffffff",
              fontSize: "12px",
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
          <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "3px" }}>
            Destination (Safe Relief Shelter):
          </label>
          <select
            value={selectedDestinationId}
            onChange={(e) => onSelectDestination(e.target.value)}
            style={{
              width: "100%",
              padding: "6px 8px",
              borderRadius: "4px",
              border: "1px solid var(--border-strong)",
              backgroundColor: "#ffffff",
              fontSize: "12px",
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

        {/* Departure Time */}
        <div>
          <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "3px" }}>
            Departure Time (UTC):
          </label>
          <input
            type="text"
            value={departureTime}
            onChange={(e) => onChangeDepartureTime(e.target.value)}
            style={{
              width: "100%",
              padding: "5px 8px",
              borderRadius: "4px",
              border: "1px solid var(--border-strong)",
              fontSize: "11px",
              fontFamily: "monospace"
            }}
          />
        </div>

        {/* Toggle Advanced Config */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "4px" }}>
          <button
            onClick={() => setShowConfig(!showConfig)}
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
            <Settings2 size={12} />
            {showConfig ? "Hide Safety Rules" : "Configure Safety Buffer & Thresholds"}
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
            gap: "8px",
            fontSize: "11px"
          }}>
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
                  style={{ width: "50px", padding: "2px 4px", fontSize: "11px", textAlign: "right" }}
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
                  style={{ width: "50px", padding: "2px 4px", fontSize: "11px", textAlign: "right" }}
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
                  style={{ width: "50px", padding: "2px 4px", fontSize: "11px", textAlign: "right" }}
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
            marginTop: "4px",
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
          {isAnalyzing ? "Evaluating Hydraulic Feasibility..." : "Calculate Evacuation Window"}
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Operational Result Display */}
      {currentRoute ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Status Badge */}
          {(() => {
            const badge = getStatusBadge(currentRoute.status);
            return (
              <div style={{
                padding: "10px 12px",
                borderRadius: "6px",
                backgroundColor: badge.bg,
                border: `1px solid ${badge.border}`,
                color: badge.color,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: 700,
                fontSize: "12px",
                letterSpacing: "0.2px"
              }}>
                {badge.icon}
                <span>{badge.label}</span>
              </div>
            );
          })()}

          {/* Primary Metric: Departure Deadline */}
          <div style={{
            backgroundColor: "#ffffff",
            border: "1px solid var(--border-strong)",
            borderRadius: "6px",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
              Model-Derived Departure Deadline
            </div>
            <div style={{
              fontSize: "20px",
              fontWeight: 800,
              fontFamily: "monospace",
              color: currentRoute.status === "INFEASIBLE" ? "#b91c1c" : "#0f172a"
            }}>
              {currentRoute.deadline_utc || "PAST / BLOCKED"}
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
              borderTop: "1px solid var(--border-subtle)",
              paddingTop: "8px",
              fontSize: "11px"
            }}>
              <div>
                <span style={{ color: "var(--text-muted)", display: "block" }}>Route Travel Time:</span>
                <span style={{ fontWeight: 700, fontSize: "13px" }}>{currentRoute.total_travel_time_min} min</span>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", display: "block" }}>Time Margin:</span>
                <span style={{
                  fontWeight: 700,
                  fontSize: "13px",
                  color: (currentRoute.margin_min ?? 0) < 0 ? "#b91c1c" : (currentRoute.margin_min ?? 0) <= 5 ? "#b45309" : "#166534"
                }}>
                  {currentRoute.margin_min !== null ? `${currentRoute.margin_min} min` : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Limiting Segment Card */}
          {currentRoute.limiting_segment && (
            <div style={{
              backgroundColor: currentRoute.status === "INFEASIBLE" ? "#fef2f2" : "#fffbeb",
              border: `1px solid ${currentRoute.status === "INFEASIBLE" ? "#fecaca" : "#fde68a"}`,
              borderRadius: "6px",
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              fontSize: "11px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, color: currentRoute.status === "INFEASIBLE" ? "#991b1b" : "#92400e" }}>
                <ShieldAlert size={14} />
                <span>FIRST LIMITING ROAD SEGMENT: {currentRoute.limiting_segment.road_id}</span>
              </div>
              <div style={{ color: "var(--text-secondary)", lineHeight: "1.4" }}>
                <div>• Cumulative travel to segment: <strong>{currentRoute.limiting_segment.cumulative_travel_min} min</strong></div>
                <div>• Modelled flood arrival at segment: <strong>{currentRoute.limiting_segment.flood_arrival_utc}</strong></div>
                <div>• Maximum projected depth: <strong>{currentRoute.limiting_segment.max_depth_m} m</strong> (Velocity: {currentRoute.limiting_segment.max_velocity_mps} m/s)</div>
              </div>
            </div>
          )}

          {/* Deterministic Decision Explanation */}
          <div style={{
            padding: "10px",
            backgroundColor: "#f8fafc",
            border: "1px solid var(--border-subtle)",
            borderRadius: "6px",
            fontSize: "11px",
            color: "var(--text-secondary)",
            lineHeight: "1.45"
          }}>
            <strong style={{ color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>Deterministic Explanation:</strong>
            {currentRoute.explanation}
          </div>

          {/* Alternative Routes Selector */}
          {analysisResult && analysisResult.alternatives.length > 1 && (
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
                Candidate Route Alternatives
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
                      border: `1px solid ${activeAlternativeIndex === idx ? "#2563eb" : "var(--border-subtle)"}`,
                      backgroundColor: activeAlternativeIndex === idx ? "#eff6ff" : "#ffffff",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: activeAlternativeIndex === idx ? "#2563eb" : "var(--text-secondary)",
                      cursor: "pointer"
                    }}
                  >
                    Route {idx === 0 ? "A" : idx === 1 ? "B" : "C"} ({alt.status})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Segment Breakdown Table Toggle */}
          <div>
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
                color: "var(--text-secondary)",
                cursor: "pointer",
                padding: 0
              }}
            >
              <Table size={12} />
              {showTable ? "Hide Segment Details" : "View Route Segments Breakdown"}
            </button>

            {showTable && (
              <div style={{
                marginTop: "8px",
                overflowX: "auto",
                border: "1px solid var(--border-subtle)",
                borderRadius: "4px"
              }}>
                <table style={{ width: "100%", fontSize: "10px", textAlign: "left", borderCollapse: "collapse" }}>
                  <thead style={{ backgroundColor: "#f1f5f9" }}>
                    <tr>
                      <th style={{ padding: "4px 6px" }}>Edge</th>
                      <th style={{ padding: "4px 6px" }}>Cumul (min)</th>
                      <th style={{ padding: "4px 6px" }}>Arrival (s)</th>
                      <th style={{ padding: "4px 6px" }}>Max Depth</th>
                      <th style={{ padding: "4px 6px" }}>Feasible</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRoute.edges.map((e, idx) => (
                      <tr key={idx} style={{ borderTop: "1px solid var(--border-subtle)", backgroundColor: e.edge_feasible ? "#ffffff" : "#fef2f2" }}>
                        <td style={{ padding: "4px 6px", fontWeight: 600 }}>{e.edge_id}</td>
                        <td style={{ padding: "4px 6px" }}>{e.cumulative_travel_min}</td>
                        <td style={{ padding: "4px 6px" }}>{e.flood_arrival_s !== null ? `${e.flood_arrival_s}s` : "Safe"}</td>
                        <td style={{ padding: "4px 6px" }}>{e.max_depth_m}m</td>
                        <td style={{ padding: "4px 6px", fontWeight: 700, color: e.edge_feasible ? "#166534" : "#991b1b" }}>
                          {e.edge_feasible ? "PASS" : "BLOCK"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{
          padding: "20px 12px",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "12px",
          border: "1px dashed var(--border-strong)",
          borderRadius: "6px"
        }}>
          Select an origin village settlement and safe shelter destination, then click <strong>Calculate Evacuation Window</strong> to derive route feasibility and latest departure deadlines.
        </div>
      )}
    </div>
  );
};
