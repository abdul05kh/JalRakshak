import React, { useState } from "react";
import { 
  ChevronRight,
  Network
} from "lucide-react";
import { MapView } from "../components/MapView";
import type { 
  ScenarioSummary, 
  Dam, 
  RoadFeature, 
  EvacuationPointFeature, 
  RouteAnalyzeResponse 
} from "../types";

import { getAuthoritativeDecision, getAuthoritativeEdgeBreakdown } from "../services/decisionStore";

interface RoadImpactViewProps {
  scenarios: ScenarioSummary[];
  activeScenarioId: string;
  dam: Dam | null;
  roads: RoadFeature[];
  evacPoints: EvacuationPointFeature[];
  inundationGeoJSON: any;
  analysisResult: RouteAnalyzeResponse | null;
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

  // Single authoritative decision data and edge breakdown
  const decision = getAuthoritativeDecision(activeScenarioId, selectedRouteId);
  const edgeList = getAuthoritativeEdgeBreakdown(activeScenarioId);


  return (
    <div style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#090d16",
      color: "#f8fafc",
      overflow: "hidden"
    }}>
      {/* Top Banner */}
      <div style={{
        padding: "14px 24px",
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.10)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
        zIndex: 20
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "34px",
            height: "34px",
            borderRadius: "8px",
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            border: "1px solid rgba(59, 130, 246, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Network size={18} color="#60a5fa" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: "#ffffff" }}>
              ROAD NETWORK TOPOLOGY & EDGE-LEVEL FLOOD IMPACT
            </h1>
            <div style={{ fontSize: "11px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
              <span>Route: <strong style={{ color: "#38bdf8" }}>{selectedRouteId} (7 Segments, 10.5 km)</strong></span>
              <span>|</span>
              <span>Coupling: <strong style={{ color: "#4ade80" }}>150m Corridor with &le;50m point sampling</strong></span>
              <span>|</span>
              <span>Source: <strong>OpenStreetMap-derived road network</strong></span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={() => onNavigateToView("EVACUATION_DECISION")}
            style={{
              padding: "6px 14px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              fontSize: "11px",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <span>View Evacuation Decision</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        
        {/* Left Side: 3D Map Viewport */}
        <div style={{ flex: "1 1 50%", height: "100%", position: "relative" }}>
          <MapView
            roads={roads}
            evacPoints={evacPoints}
            inundationGeoJSON={inundationGeoJSON}
            activeRoute={analysisResult?.primary_route || null}
            mapViewState="3D"
            thematicMode="ARRIVAL"
            selectedTimelineStep={`T+${activeTimestepMin}`}
            selectedEdgeId={selectedEdgeId}
            onSelectEdgeId={(id) => setSelectedEdgeId(id)}
            cameraPreset={selectedEdgeId === "R02-E07" ? "LIMITING" : undefined}
            layerVisibility={{ inundation: true, roads: true, origins: true, destinations: true }}
            onMapClick={() => {}}
            pointQueryData={null}
          />

          {/* Map Overlay Callout */}
          <div style={{
            position: "absolute",
            bottom: "14px",
            left: "14px",
            backgroundColor: "rgba(15, 23, 42, 0.85)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "6px",
            padding: "8px 12px",
            fontSize: "10px",
            color: "#cbd5e1",
            zIndex: 10
          }}>
            <span>Active Road Corridor: <strong style={{ color: "#38bdf8" }}>{selectedRouteId}</strong></span>
            <span style={{ margin: "0 6px", color: "#475569" }}>|</span>
            <span>Limiting Edge: <strong style={{ color: "#fbbf24" }}>R02-E07</strong></span>
          </div>
        </div>

        {/* Right Side: Edge Impact Graph & Table */}
        <div style={{
          flex: "1 1 50%",
          height: "100%",
          overflowY: "auto",
          backgroundColor: "#0f172a",
          borderLeft: "1px solid rgba(255, 255, 255, 0.10)",
          padding: "20px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: "16px"
        }}>
          {/* Limiting Edge Highlight Card */}
          <div style={{
            backgroundColor: "rgba(245, 158, 11, 0.12)",
            borderRadius: "10px",
            border: "2px solid #f59e0b",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{
                padding: "3px 8px",
                borderRadius: "4px",
                backgroundColor: "#f59e0b",
                color: "#0f172a",
                fontSize: "10px",
                fontWeight: 900
              }}>
                LIMITING ROAD SEGMENT IDENTIFIED
              </span>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#fbbf24" }}>
                MINIMUM TIME MARGIN
              </span>
            </div>

            <div style={{ fontSize: "16px", fontWeight: 800, color: "#ffffff" }}>
              Edge {decision.limitingEdgeId}: {decision.limitingSegmentName}
            </div>

            <p style={{ margin: 0, fontSize: "11px", color: "#cbd5e1", lineHeight: "1.5" }}>
              This edge has the earliest flood arrival time (<strong>{decision.arrivalFormatted}</strong>) relative to cumulative travel time (<strong>{decision.travelFormatted}</strong>). It defines the evacuation window for the entire route (<strong>{decision.deadlineFormatted}</strong>).
            </p>
          </div>

          {/* Edge-by-Edge Graph Table */}
          <div style={{
            backgroundColor: "#1e293b",
            borderRadius: "10px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            overflow: "hidden"
          }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "12px", fontWeight: 800, color: "#ffffff" }}>
                Segment-by-Segment Feasibility Breakdown
              </span>
              <span style={{ fontSize: "10px", color: "#94a3b8" }}>
                Corridor: Malidewal → Chamba
              </span>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.10)", color: "#94a3b8", backgroundColor: "rgba(15, 23, 42, 0.5)" }}>
                    <th style={{ padding: "8px 10px" }}>EDGE ID</th>
                    <th style={{ padding: "8px 10px" }}>NAME</th>
                    <th style={{ padding: "8px 10px" }}>LEN</th>
                    <th style={{ padding: "8px 10px" }}>TRAVEL</th>
                    <th style={{ padding: "8px 10px" }}>FLOOD ARRIVAL</th>
                    <th style={{ padding: "8px 10px" }}>MARGIN</th>
                    <th style={{ padding: "8px 10px" }}>STATUS</th>
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
                          backgroundColor: e.isLimiting ? "rgba(245, 158, 11, 0.15)" : isSelected ? "rgba(59, 130, 246, 0.15)" : "transparent",
                          cursor: "pointer"
                        }}
                      >
                        <td style={{ padding: "8px 10px", fontWeight: 800, color: e.isLimiting ? "#fbbf24" : "#ffffff" }}>
                          {e.edgeId}
                        </td>
                        <td style={{ padding: "8px 10px", color: "#cbd5e1" }}>{e.segmentName}</td>
                        <td style={{ padding: "8px 10px", color: "#94a3b8" }}>{e.lengthKm} km</td>
                        <td style={{ padding: "8px 10px", color: "#cbd5e1" }}>{e.travelToEdgeMin}</td>
                        <td style={{ padding: "8px 10px", color: "#60a5fa", fontWeight: 700 }}>{e.floodArrivalMin}</td>
                        <td style={{ padding: "8px 10px", color: e.isLimiting ? "#fbbf24" : "#4ade80", fontWeight: 800 }}>
                          {e.marginMin}
                        </td>
                        <td style={{ padding: "8px 10px" }}>
                          <span style={{
                            padding: "2px 6px",
                            borderRadius: "3px",
                            backgroundColor: e.isLimiting ? "rgba(245,158,11,0.25)" : "rgba(34,197,94,0.2)",
                            color: e.isLimiting ? "#fde68a" : "#86efac",
                            fontSize: "9px",
                            fontWeight: 800
                          }}>
                            {e.isLimiting ? "LIMITING" : e.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Graph Assembly Explanation */}
          <div style={{
            backgroundColor: "rgba(30, 41, 59, 0.6)",
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            padding: "14px",
            fontSize: "11px",
            color: "#cbd5e1",
            lineHeight: "1.5"
          }}>
            <strong style={{ color: "#38bdf8" }}>How JalRakshak Assembles the Route Graph:</strong>
            <br />
            1. Road centerlines are ingested from OpenStreetMap and indexed as directed graph edges (u, v) in EPSG:32644.
            <br />
            2. Along each edge, coordinate vertices are densified at ≤ 50 m intervals.
            <br />
            3. A 150m spatial corridor envelope queries the continuous HEC-RAS 2D depth field d(x,y,t).
            <br />
            4. The limiting edge is mathematically proven as: Limiting Edge = argmin(A_e - T_e - B) across all edges e in Route R.
          </div>

        </div>

      </div>
    </div>
  );
};
