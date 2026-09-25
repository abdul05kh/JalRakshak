import React, { useState } from "react";
import { 
  Network,
  Layers,
  ArrowRight
} from "lucide-react";
import { MapView } from "../components/MapView";
import type { 
  ScenarioSummary, 
  Dam, 
  RoadFeature, 
  EvacuationPointFeature 
} from "../types";

import { getAuthoritativeDecision, getAuthoritativeEdgeBreakdown } from "../services/decisionStore";

interface RoadImpactViewProps {
  scenarios: ScenarioSummary[];
  activeScenarioId: string;
  dam: Dam | null;
  roads: RoadFeature[];
  evacPoints: EvacuationPointFeature[];
  inundationGeoJSON: any;
  analysisResult: any;
  selectedRouteId: string;
  onSelectRouteId: (id: string) => void;
  activeTimestepMin: number;
  onNavigateToView: (view: string) => void;
}

export const RoadImpactView: React.FC<RoadImpactViewProps> = ({
  activeScenarioId,
  roads,
  evacPoints,
  inundationGeoJSON,
  analysisResult,
  selectedRouteId,
  activeTimestepMin,
  onNavigateToView
}) => {
  const [selectedEdgeId, setSelectedEdgeId] = useState<string>("R02-E07");
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);
  const [thematicMode, setThematicMode] = useState<"EXTENT" | "DEPTH" | "ARRIVAL">("ARRIVAL");

  // Single authoritative decision data and edge breakdown
  const decision = getAuthoritativeDecision(activeScenarioId, selectedRouteId);
  const edgeList = getAuthoritativeEdgeBreakdown(activeScenarioId);

  return (
    <div style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#060913",
      color: "#f8fafc",
      overflow: "hidden"
    }}>
      {/* Top Technical Status Header */}
      <div style={{
        padding: "10px 20px",
        backgroundColor: "#0b1120",
        borderBottom: "1px solid rgba(255, 255, 255, 0.10)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "10px",
        zIndex: 20
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "28px",
            height: "28px",
            borderRadius: "5px",
            backgroundColor: "rgba(56, 189, 248, 0.15)",
            border: "1px solid rgba(56, 189, 248, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Network size={16} color="#38bdf8" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "13px", fontWeight: 800, color: "#ffffff", letterSpacing: "0.2px" }}>
              ROAD NETWORK TOPOLOGY & EDGE COUPLING
            </h1>
            <div style={{ fontSize: "10.5px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "6px", marginTop: "1px" }}>
              <span>Route: <strong style={{ color: "#38bdf8" }}>{selectedRouteId} (7 Edges, 10.5 km)</strong></span>
              <span>•</span>
              <span>Coupling: <strong style={{ color: "#cbd5e1" }}>150m Perpendicular Envelope</strong></span>
              <span>•</span>
              <span>Threshold: <strong style={{ color: "#f59e0b" }}>h &ge; 0.30 m</strong></span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {/* Hydraulic Mode Switcher */}
          <div style={{ display: "flex", alignItems: "center", gap: "2px", backgroundColor: "rgba(15, 23, 42, 0.8)", padding: "2px 4px", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.1)" }}>
            {(["ARRIVAL", "DEPTH", "EXTENT"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setThematicMode(m)}
                style={{
                  padding: "3px 6px",
                  borderRadius: "3px",
                  border: "none",
                  backgroundColor: thematicMode === m ? "#38bdf8" : "transparent",
                  color: thematicMode === m ? "#060913" : "#94a3b8",
                  fontSize: "9px",
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                {m}
              </button>
            ))}
          </div>

          <button
            onClick={() => onNavigateToView("EVACUATION_DECISION")}
            style={{
              padding: "5px 12px",
              borderRadius: "4px",
              border: "1px solid #38bdf8",
              backgroundColor: "rgba(56, 189, 248, 0.15)",
              color: "#38bdf8",
              fontSize: "10.5px",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <span>Decision Console</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* Main Map-Dominant Layout (75% Map / 25% Side Drawer) */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        
        {/* 3D Map Viewport (Dominant ~75-100%) */}
        <div style={{ flex: 1, height: "100%", position: "relative" }}>
          <MapView
            roads={roads}
            evacPoints={evacPoints}
            inundationGeoJSON={inundationGeoJSON}
            activeRoute={analysisResult?.primary_route || null}
            mapViewState="3D"
            thematicMode={thematicMode}
            selectedTimelineStep={`T+${activeTimestepMin}`}
            selectedEdgeId={selectedEdgeId}
            onSelectEdgeId={(id) => setSelectedEdgeId(id)}
            cameraPreset={selectedEdgeId === "R02-E07" ? "LIMITING" : undefined}
            layerVisibility={{ inundation: true, roads: true, origins: true, destinations: true }}
            onMapClick={() => {}}
            pointQueryData={null}
          />

          {/* Drawer Toggle Button */}
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            style={{
              position: "absolute",
              top: "14px",
              right: isDrawerOpen ? "340px" : "14px",
              zIndex: 850,
              backgroundColor: "#0b1120",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#38bdf8",
              padding: "6px 10px",
              borderRadius: "4px",
              fontSize: "10.5px",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              transition: "right 0.2s ease"
            }}
          >
            <Layers size={12} />
            <span>{isDrawerOpen ? "HIDE METRICS" : "SHOW EDGE METRICS"}</span>
          </button>
        </div>

        {/* Collapsible Right Information Drawer (~25% width / 330px) */}
        {isDrawerOpen && (
          <div style={{
            width: "330px",
            height: "100%",
            overflowY: "auto",
            backgroundColor: "#0b1120",
            borderLeft: "1px solid rgba(255, 255, 255, 0.10)",
            padding: "16px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            zIndex: 800
          }}>
            {/* Limiting Edge Highlight Card */}
            <div style={{
              backgroundColor: "rgba(239, 68, 68, 0.12)",
              borderRadius: "6px",
              border: "1.5px solid #ef4444",
              padding: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "6px"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{
                  padding: "2px 6px",
                  borderRadius: "3px",
                  backgroundColor: "#ef4444",
                  color: "#ffffff",
                  fontSize: "9px",
                  fontWeight: 900
                }}>
                  LIMITING SEGMENT
                </span>
                <span style={{ fontSize: "10px", fontWeight: 800, color: "#f87171" }}>
                  MIN MARGIN: +44:21
                </span>
              </div>

              <div style={{ fontSize: "13px", fontWeight: 800, color: "#ffffff" }}>
                {decision.limitingEdgeId} — {decision.limitingSegmentName}
              </div>

              <div style={{ fontSize: "10.5px", color: "#cbd5e1", lineHeight: "1.4", fontFamily: "monospace" }}>
                Flood Arrival: <strong style={{ color: "#38bdf8" }}>{decision.arrivalFormatted}</strong><br />
                Travel to Edge: <strong style={{ color: "#fbbf24" }}>{decision.travelFormatted}</strong><br />
                Buffer: <strong style={{ color: "#f87171" }}>{decision.bufferFormatted}</strong><br />
                Deadline: <strong style={{ color: "#4ade80" }}>{decision.deadlineFormatted}</strong>
              </div>
            </div>

            {/* Edge-by-Edge Graph Table */}
            <div style={{
              backgroundColor: "#0f172a",
              borderRadius: "6px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              overflow: "hidden"
            }}>
              <div style={{ padding: "8px 12px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#ffffff" }}>
                  7 Edge Traversal Table
                </span>
                <span style={{ fontSize: "9.5px", color: "#94a3b8" }}>
                  R02 Corridor
                </span>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.10)", color: "#94a3b8", backgroundColor: "rgba(11, 17, 32, 0.8)" }}>
                      <th style={{ padding: "6px 8px" }}>EDGE</th>
                      <th style={{ padding: "6px 8px" }}>TRAVEL</th>
                      <th style={{ padding: "6px 8px" }}>ARRIVAL</th>
                      <th style={{ padding: "6px 8px" }}>MARGIN</th>
                      <th style={{ padding: "6px 8px" }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {edgeList.map((e) => {
                      const isSelected = selectedEdgeId === e.edgeId;
                      return (
                        <tr
                          key={e.edgeId}
                          onClick={() => setSelectedEdgeId(e.edgeId)}
                          style={{
                            borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                            backgroundColor: e.isLimiting ? "rgba(239, 68, 68, 0.15)" : isSelected ? "rgba(56, 189, 248, 0.15)" : "transparent",
                            cursor: "pointer"
                          }}
                        >
                          <td style={{ padding: "6px 8px", fontWeight: 800, color: e.isLimiting ? "#f87171" : "#ffffff" }}>
                            {e.edgeId}
                          </td>
                          <td style={{ padding: "6px 8px", color: "#cbd5e1" }}>{e.travelToEdgeMin}</td>
                          <td style={{ padding: "6px 8px", color: "#38bdf8", fontWeight: 700 }}>{e.floodArrivalMin}</td>
                          <td style={{ padding: "6px 8px", color: e.isLimiting ? "#fbbf24" : "#4ade80", fontWeight: 800 }}>
                            {e.marginMin}
                          </td>
                          <td style={{ padding: "6px 8px" }}>
                            <span style={{
                              padding: "1px 4px",
                              borderRadius: "2px",
                              backgroundColor: e.isLimiting ? "rgba(239,68,68,0.25)" : "rgba(56,189,248,0.15)",
                              color: e.isLimiting ? "#fca5a5" : "#7dd3fc",
                              fontSize: "8.5px",
                              fontWeight: 800
                            }}>
                              {e.isLimiting ? "LIMITING" : "FEASIBLE"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Coupling Methodology Note */}
            <div style={{
              backgroundColor: "rgba(15, 23, 42, 0.7)",
              borderRadius: "6px",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              padding: "10px",
              fontSize: "10px",
              color: "#94a3b8",
              lineHeight: "1.4"
            }}>
              <strong style={{ color: "#38bdf8" }}>Deterministic Coupling Trace:</strong>
              <br />
              • OpenStreetMap LineString densified at &le;50m.
              <br />
              • 150m spatial corridor checks HEC-RAS depth d(x,y,t).
              <br />
              • D_deadline = min_i(A_i - T_i - B) = T+44:21.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
