import React, { useState } from "react";
import { MapView } from "../components/MapView";
import { FloatingDecisionCard } from "../components/FloatingDecisionCard";
import { TemporalSlider } from "../components/TemporalSlider";
import { Layers, Eye, EyeOff, Video } from "lucide-react";
import type { 
  ScenarioSummary, 
  Dam, 
  RoadFeature, 
  EvacuationPointFeature, 
  RouteAnalyzeResponse 
} from "../types";

interface OperationalMapViewProps {
  scenarios: ScenarioSummary[];
  activeScenarioId: string;
  onSelectScenario: (id: string) => void;
  dam: Dam | null;
  roads: RoadFeature[];
  evacPoints: EvacuationPointFeature[];
  inundationGeoJSON: any;
  analysisResult: RouteAnalyzeResponse | null;
  selectedRouteId: string;
  onSelectRouteId: (id: string) => void;
  timelineSteps: any[];
  activeTimestepMin: number;
  onSelectTimestep: (min: number) => void;
  focusLimitingSignal: number;
  onTriggerFocusLimiting: () => void;
  onNavigateToView: (view: string) => void;
}

export const OperationalMapView: React.FC<OperationalMapViewProps> = ({
  scenarios,
  activeScenarioId,
  roads,
  evacPoints,
  inundationGeoJSON,
  analysisResult,
  selectedRouteId,
  timelineSteps,
  activeTimestepMin,
  onSelectTimestep,
  focusLimitingSignal,
  onTriggerFocusLimiting,
  onNavigateToView
}) => {
  const [thematicMode, setThematicMode] = useState<"EXTENT" | "DEPTH" | "ARRIVAL">("DEPTH");
  const [cameraPreset, setCameraPreset] = useState<string>("OVERVIEW");
  const [showAllRoads, setShowAllRoads] = useState<boolean>(true);
  const [showTerrain, setShowTerrain] = useState<boolean>(true);

  const activeSc = scenarios.find((s) => s.id === activeScenarioId);

  const cameraButtons: { id: string; label: string }[] = [
    { id: "OVERVIEW", label: "OVERVIEW" },
    { id: "DAM", label: "DAM" },
    { id: "BREACH", label: "BREACH" },
    { id: "DOWNSTREAM", label: "DOWNSTREAM" },
    { id: "ROUTE", label: "ROUTE" },
    { id: "LIMITING", label: "LIMITING EDGE" },
    { id: "SHELTER", label: "SHELTER" }
  ];

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", backgroundColor: "#090d16" }}>
      {/* 1. Primary 3D Geospatial Map Viewport (Occupies 100% of container) */}
      <MapView
        roads={roads}
        evacPoints={evacPoints}
        inundationGeoJSON={inundationGeoJSON}
        activeRoute={analysisResult?.primary_route || null}
        mapViewState="3D"
        thematicMode={thematicMode}
        selectedTimelineStep={`T+${activeTimestepMin}`}
        focusLimitingSignal={focusLimitingSignal}
        cameraPreset={cameraPreset}
        showTerrain={showTerrain}
        showRoads={showAllRoads}
        layerVisibility={{ inundation: true, roads: showAllRoads, origins: true, destinations: true }}
        onMapClick={() => {}}
        pointQueryData={null}
        showValidationControls={false}
      />

      {/* 2. Top-Center Camera Presets Toolbar */}
      <div
        style={{
          position: "absolute",
          top: "14px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 800,
          backgroundColor: "rgba(15, 23, 42, 0.90)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "8px",
          padding: "4px 6px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "0 6px", borderRight: "1px solid rgba(255,255,255,0.15)", color: "#94a3b8", fontSize: "10px", fontWeight: 800 }}>
          <Video size={12} color="#38bdf8" />
          <span>CAMERA:</span>
        </div>
        {cameraButtons.map((btn) => {
          const isActive = cameraPreset === btn.id;
          return (
            <button
              key={btn.id}
              onClick={() => setCameraPreset(btn.id)}
              style={{
                padding: "4px 8px",
                borderRadius: "5px",
                border: isActive ? "1px solid #38bdf8" : "1px solid transparent",
                backgroundColor: isActive ? "rgba(56, 189, 248, 0.2)" : "transparent",
                color: isActive ? "#ffffff" : "#cbd5e1",
                fontSize: "10px",
                fontWeight: isActive ? 800 : 600,
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              {btn.label}
            </button>
          );
        })}
      </div>

      {/* 3. Top-Left Compact Primary Decision Card */}
      <FloatingDecisionCard
        routeId={selectedRouteId}
        scenarioName={activeScenarioId}
        safetyBufferMin={3.0}
        onOpenDecisionView={() => onNavigateToView("EVACUATION_DECISION")}
        onOpenScienceView={() => onNavigateToView("SCIENCE_VALIDATION")}
        onFocusLimitingSegment={() => {
          setCameraPreset("LIMITING");
          onTriggerFocusLimiting();
        }}
      />

      {/* 4. Top-Right Compact Vertical Layer Control */}
      <div
        style={{
          position: "absolute",
          top: "14px",
          right: "14px",
          zIndex: 800,
          backgroundColor: "rgba(15, 23, 42, 0.90)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "8px",
          padding: "10px 12px",
          width: "180px",
          color: "#f8fafc",
          fontSize: "10.5px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.4)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "5px", fontWeight: 800, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "5px" }}>
          <Layers size={13} color="#38bdf8" />
          <span>LAYER CONTROL</span>
        </div>

        {/* Hydraulic Display Mode */}
        <div>
          <div style={{ fontSize: "9px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", marginBottom: "3px" }}>
            Hydraulics
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {[
              { id: "EXTENT", label: "● EXTENT" },
              { id: "DEPTH", label: "● DEPTH" },
              { id: "ARRIVAL", label: "● ARRIVAL" }
            ].map((m) => {
              const isActive = thematicMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setThematicMode(m.id as any)}
                  style={{
                    padding: "3px 6px",
                    borderRadius: "4px",
                    border: isActive ? "1px solid #38bdf8" : "1px solid transparent",
                    backgroundColor: isActive ? "rgba(56, 189, 248, 0.25)" : "transparent",
                    color: isActive ? "#ffffff" : "#94a3b8",
                    fontSize: "10px",
                    fontWeight: isActive ? 800 : 500,
                    textAlign: "left",
                    cursor: "pointer"
                  }}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Roads Layer Toggle */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "4px" }}>
          <div style={{ fontSize: "9px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", marginBottom: "3px" }}>
            Roads
          </div>
          <button
            onClick={() => setShowAllRoads(!showAllRoads)}
            style={{
              width: "100%",
              padding: "3px 6px",
              borderRadius: "4px",
              border: "1px solid transparent",
              backgroundColor: showAllRoads ? "rgba(34, 197, 94, 0.15)" : "transparent",
              color: showAllRoads ? "#4ade80" : "#94a3b8",
              fontSize: "10px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer"
            }}
          >
            <span>ALL ROADS</span>
            {showAllRoads ? <Eye size={12} /> : <EyeOff size={12} />}
          </button>
        </div>

        {/* Terrain Layer Toggle */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "4px" }}>
          <div style={{ fontSize: "9px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", marginBottom: "3px" }}>
            Terrain
          </div>
          <button
            onClick={() => setShowTerrain(!showTerrain)}
            style={{
              width: "100%",
              padding: "3px 6px",
              borderRadius: "4px",
              border: "1px solid transparent",
              backgroundColor: showTerrain ? "rgba(56, 189, 248, 0.15)" : "transparent",
              color: showTerrain ? "#38bdf8" : "#94a3b8",
              fontSize: "10px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer"
            }}
          >
            <span>3D GLO-30 DSM</span>
            {showTerrain ? <Eye size={12} /> : <EyeOff size={12} />}
          </button>
        </div>
      </div>

      {/* 5. Bottom Simulation Timeline Toolbar */}
      <div style={{
        position: "absolute",
        bottom: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 800,
        width: "min(900px, 92vw)"
      }}>
        <TemporalSlider
          timesteps={timelineSteps}
          activeTimestepMin={activeTimestepMin}
          onSelectTimestep={onSelectTimestep}
          scenarioName={activeSc?.name || "CENTRAL"}
          limitingRoadId={selectedRouteId}
          activeLayerName={thematicMode === "EXTENT" ? "FLOOD EXTENT" : (thematicMode === "ARRIVAL" ? "ARRIVAL ISOCHRONES" : "WATER DEPTH")}
        />
      </div>

      {/* 6. Compact Symbology Legend */}
      <div style={{
        position: "absolute",
        bottom: "16px",
        left: "14px",
        zIndex: 800,
        backgroundColor: "rgba(15, 23, 42, 0.90)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "8px",
        padding: "8px 10px",
        fontSize: "10px",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        color: "#cbd5e1"
      }}>
        <div style={{ fontWeight: 800, fontSize: "9px", color: "#94a3b8", textTransform: "uppercase", marginBottom: "1px" }}>
          MAP LEGEND
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "12px", height: "3px", backgroundColor: "#ef4444", borderRadius: "1px" }} />
          <span>Limiting Segment (R02-E07)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "12px", height: "3px", backgroundColor: "#0284c7", borderRadius: "1px" }} />
          <span>Evacuation Route (R02)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "10px", height: "8px", backgroundColor: "rgba(14, 165, 233, 0.7)", border: "1px solid #38bdf8", borderRadius: "2px" }} />
          <span>Flood Hazard (h &ge; 0.30m)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "7px", height: "7px", backgroundColor: "#4ade80", transform: "rotate(45deg)", display: "inline-block" }} />
          <span>Designated Safe Shelter</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "7px", height: "7px", backgroundColor: "#fbbf24", borderRadius: "50%", display: "inline-block" }} />
          <span>Settlement Origin</span>
        </div>
      </div>
    </div>
  );
};
