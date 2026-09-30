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
      backgroundColor: "var(--jr-bg, #F4EFE6)",
      color: "var(--jr-text, #24343A)",
      overflow: "hidden"
    }}>
      {/* Top Technical Status Header */}
      <div style={{
        padding: "10px 20px",
        backgroundColor: "var(--jr-surface, #FBF8F2)",
        borderBottom: "1px solid var(--jr-border, #D8D1C5)",
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
            backgroundColor: "var(--jr-blue-100, #D9EEF7)",
            border: "1px solid var(--jr-blue-400, #76B8D0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Network size={16} color="var(--jr-blue-600, #3D8EAE)" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "13px", fontWeight: 800, color: "var(--jr-text, #24343A)", letterSpacing: "0.2px" }}>
              ROAD NETWORK TOPOLOGY & EDGE COUPLING
            </h1>
            <div style={{ fontSize: "10.5px", color: "var(--jr-text-muted, #65747A)", display: "flex", alignItems: "center", gap: "6px", marginTop: "1px" }}>
              <span>Route: <strong style={{ color: "var(--jr-blue-600, #3D8EAE)" }}>{selectedRouteId} (7 Edges, 10.5 km)</strong></span>
              <span>•</span>
              <span>Coupling: <strong style={{ color: "var(--jr-text, #24343A)" }}>150m Perpendicular Envelope</strong></span>
              <span>•</span>
              <span>Threshold: <strong style={{ color: "#A97835" }}>h &ge; 0.30 m</strong></span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {/* Hydraulic Mode Switcher */}
          <div style={{ display: "flex", alignItems: "center", gap: "2px", backgroundColor: "var(--jr-surface-alt, #EDE7DC)", padding: "2px 4px", borderRadius: "4px", border: "1px solid var(--jr-border, #D8D1C5)" }}>
            {(["ARRIVAL", "DEPTH", "EXTENT"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setThematicMode(m)}
                style={{
                  padding: "3px 6px",
                  borderRadius: "3px",
                  border: "none",
                  backgroundColor: thematicMode === m ? "var(--jr-blue-600, #3D8EAE)" : "transparent",
                  color: thematicMode === m ? "#FFFFFF" : "var(--jr-text-muted, #65747A)",
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
              border: "1px solid var(--jr-blue-600, #3D8EAE)",
              backgroundColor: "var(--jr-blue-50, #EAF6FB)",
              color: "var(--jr-blue-800, #24566A)",
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
            scenarioId={activeScenarioId}
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
              backgroundColor: "var(--jr-surface, #FBF8F2)",
              border: "1px solid var(--jr-border, #D8D1C5)",
              color: "var(--jr-blue-800, #24566A)",
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
            backgroundColor: "var(--jr-surface, #FBF8F2)",
            borderLeft: "1px solid var(--jr-border, #D8D1C5)",
            padding: "16px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            zIndex: 800
          }}>
            {/* Limiting Edge Highlight Card */}
            <div style={{
              backgroundColor: "#FFF5F5",
              borderRadius: "6px",
              border: "1.5px solid #A84C4C",
              padding: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "6px"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{
                  padding: "2px 6px",
                  borderRadius: "3px",
                  backgroundColor: "#A84C4C",
                  color: "#ffffff",
                  fontSize: "9px",
                  fontWeight: 900
                }}>
                  LIMITING SEGMENT
                </span>
                <span style={{ fontSize: "10px", fontWeight: 800, color: "#A84C4C" }}>
                  MIN MARGIN: +44:21
                </span>
              </div>

              <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--jr-text, #24343A)" }}>
                {decision.limitingEdgeId} — {decision.limitingSegmentName}
              </div>

              <div style={{ fontSize: "10.5px", color: "var(--jr-text-muted, #65747A)", lineHeight: "1.4", fontFamily: "monospace" }}>
                Flood Arrival: <strong style={{ color: "var(--jr-blue-600, #3D8EAE)" }}>{decision.arrivalFormatted}</strong><br />
                Cumulative Travel to Edge: <strong style={{ color: "#A97835" }}>{decision.travelFormatted}</strong><br />
                Buffer: <strong style={{ color: "#A84C4C" }}>{decision.bufferFormatted}</strong><br />
                Deadline: <strong style={{ color: "var(--jr-success, #3F7D62)" }}>{decision.deadlineFormatted}</strong>
              </div>
            </div>

            {/* Edge-by-Edge Graph Table */}
            <div style={{
              backgroundColor: "var(--jr-surface-alt, #EDE7DC)",
              borderRadius: "6px",
              border: "1px solid var(--jr-border, #D8D1C5)",
              overflow: "hidden"
            }}>
              <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--jr-border, #D8D1C5)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--jr-text, #24343A)" }}>
                  7 Edge Traversal Table
                </span>
                <span style={{ fontSize: "9.5px", color: "var(--jr-text-muted, #65747A)" }}>
                  R02 Corridor
                </span>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--jr-border, #D8D1C5)", color: "var(--jr-text-muted, #65747A)", backgroundColor: "var(--jr-surface, #FBF8F2)" }}>
                      <th style={{ padding: "6px 8px" }}>EDGE</th>
                      <th style={{ padding: "6px 8px" }}>CUMULATIVE TRAVEL</th>
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
                            borderBottom: "1px solid var(--jr-border, #D8D1C5)",
                            backgroundColor: e.isLimiting ? "#FFEAE8" : isSelected ? "var(--jr-blue-100, #D9EEF7)" : "transparent",
                            cursor: "pointer"
                          }}
                        >
                          <td style={{ padding: "6px 8px", fontWeight: 800, color: e.isLimiting ? "#A84C4C" : "var(--jr-text, #24343A)" }}>
                            {e.edgeId}
                          </td>
                          <td style={{ padding: "6px 8px", color: "var(--jr-text-muted, #65747A)" }}>{e.travelToEdgeMin}</td>
                          <td style={{ padding: "6px 8px", color: "var(--jr-blue-600, #3D8EAE)", fontWeight: 700 }}>{e.floodArrivalMin}</td>
                          <td style={{ padding: "6px 8px", color: e.isLimiting ? "#A97835" : "var(--jr-success, #3F7D62)", fontWeight: 800 }}>
                            {e.marginMin}
                          </td>
                          <td style={{ padding: "6px 8px" }}>
                            <span style={{
                              padding: "1px 4px",
                              borderRadius: "2px",
                              backgroundColor: e.isLimiting ? "#FFD6D3" : "var(--jr-blue-100, #D9EEF7)",
                              color: e.isLimiting ? "#A84C4C" : "var(--jr-blue-800, #24566A)",
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
              backgroundColor: "var(--jr-blue-50, #EAF6FB)",
              borderRadius: "6px",
              border: "1px solid var(--jr-blue-200, #B9DDEB)",
              padding: "10px",
              fontSize: "10px",
              color: "var(--jr-blue-800, #24566A)",
              lineHeight: "1.4"
            }}>
              <strong style={{ color: "var(--jr-blue-800, #24566A)" }}>Deterministic Coupling Trace:</strong>
              <br />
              • OpenStreetMap LineString densified at &le;50m.
              <br />
              • 150m perpendicular corridor checks HEC-RAS depth h &ge; 0.30m.
              <br />
              • D_deadline = min_i(A_i - T_i - B) = T+44:21.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
