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
  const [showInfrastructure, setShowInfrastructure] = useState<boolean>(true);
  const [basemapKey, setBasemapKey] = useState<"hybrid" | "satellite" | "topo-vector" | "dark-gray-vector">("hybrid");

  const activeSc = scenarios.find((s) => s.id === activeScenarioId);
  const limitingArrival = activeScenarioId.includes("MIN") ? "T+95" : activeScenarioId.includes("MAX") ? "T+45" : "T+60";

  const cameraButtons: { id: string; label: string }[] = [
    { id: "OVERVIEW", label: "OVERVIEW" },
    { id: "DAM", label: "TEHRI DAM" },
    { id: "BREACH", label: "BREACH" },
    { id: "DOWNSTREAM", label: "CANYON GORGE" },
    { id: "ROUTE", label: "ROUTE R02" },
    { id: "LIMITING", label: `R02-E07 (${limitingArrival})` },
    { id: "SHELTER", label: "SAFE SHELTER" }
  ];

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", backgroundColor: "var(--jr-bg, #F4EFE6)" }}>
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
        showInfrastructure={showInfrastructure}
        basemapKey={basemapKey}
        scenarioId={activeScenarioId}
        layerVisibility={{ 
          inundation: true, 
          roads: showAllRoads, 
          origins: showInfrastructure, 
          destinations: showInfrastructure,
          infrastructure: showInfrastructure
        }}
        onMapClick={() => {}}
        pointQueryData={null}
        showValidationControls={false}
      />

      {/* 2. Top-Center Camera Presets Toolbar */}
      <div
        className="mobile-scroll-x"
        style={{
          position: "absolute",
          top: "14px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 800,
          backgroundColor: "rgba(251, 248, 242, 0.95)",
          backdropFilter: "blur(10px)",
          border: "1px solid var(--jr-border, #D8D1C5)",
          borderRadius: "8px",
          padding: "4px 6px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          boxShadow: "0 4px 16px rgba(36, 52, 58, 0.12)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "0 6px", borderRight: "1px solid var(--jr-border, #D8D1C5)", color: "var(--jr-text-muted, #65747A)", fontSize: "10px", fontWeight: 800, flexShrink: 0 }}>
          <Video size={12} color="var(--jr-blue-600, #3D8EAE)" />
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
                border: isActive ? "1px solid var(--jr-blue-600, #3D8EAE)" : "1px solid transparent",
                backgroundColor: isActive ? "var(--jr-blue-100, #D9EEF7)" : "transparent",
                color: isActive ? "var(--jr-blue-800, #24566A)" : "var(--jr-text, #24343A)",
                fontSize: "10px",
                fontWeight: isActive ? 800 : 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
                flexShrink: 0
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
          backgroundColor: "rgba(251, 248, 242, 0.95)",
          backdropFilter: "blur(12px)",
          border: "1px solid var(--jr-border, #D8D1C5)",
          borderRadius: "8px",
          padding: "10px 12px",
          width: "195px",
          color: "var(--jr-text, #24343A)",
          fontSize: "10.5px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          boxShadow: "0 6px 20px rgba(36, 52, 58, 0.12)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 800, borderBottom: "1px solid var(--jr-border, #D8D1C5)", paddingBottom: "5px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Layers size={13} color="var(--jr-blue-600, #3D8EAE)" />
            <span>3D LAYERS</span>
          </div>
        </div>

        {/* Basemap Selection */}
        <div>
          <div style={{ fontSize: "9px", fontWeight: 800, color: "var(--jr-text-muted, #65747A)", textTransform: "uppercase", marginBottom: "3px" }}>
            Basemap
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px" }}>
            {[
              { id: "hybrid", label: "🛰️ SATELLITE" },
              { id: "topo-vector", label: "🏔️ 3D TOPO" },
              { id: "dark-gray-vector", label: "🌑 TACTICAL" }
            ].map((bm) => {
              const isActive = basemapKey === bm.id;
              return (
                <button
                  key={bm.id}
                  onClick={() => setBasemapKey(bm.id as any)}
                  style={{
                    padding: "4px 6px",
                    borderRadius: "4px",
                    border: isActive ? "1px solid var(--jr-blue-600, #3D8EAE)" : "1px solid var(--jr-border-subtle, #E8E2D7)",
                    backgroundColor: isActive ? "var(--jr-blue-100, #D9EEF7)" : "var(--jr-surface-alt, #EDE7DC)",
                    color: isActive ? "var(--jr-blue-800, #24566A)" : "var(--jr-text-muted, #65747A)",
                    fontSize: "9px",
                    fontWeight: isActive ? 800 : 600,
                    textAlign: "center",
                    cursor: "pointer"
                  }}
                >
                  {bm.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hydraulic Display Mode */}
        <div style={{ borderTop: "1px solid var(--jr-border-subtle, #E8E2D7)", paddingTop: "4px" }}>
          <div style={{ fontSize: "9px", fontWeight: 800, color: "var(--jr-text-muted, #65747A)", textTransform: "uppercase", marginBottom: "3px" }}>
            HEC-RAS Hydraulics
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {[
              { id: "EXTENT", label: "● EXTENT ONLY" },
              { id: "DEPTH", label: "● 3D WATER DEPTH" },
              { id: "ARRIVAL", label: "● ARRIVAL CONTOURS" }
            ].map((m) => {
              const isActive = thematicMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setThematicMode(m.id as any)}
                  style={{
                    padding: "3px 6px",
                    borderRadius: "4px",
                    border: isActive ? "1px solid var(--jr-blue-600, #3D8EAE)" : "1px solid transparent",
                    backgroundColor: isActive ? "var(--jr-blue-100, #D9EEF7)" : "transparent",
                    color: isActive ? "var(--jr-blue-800, #24566A)" : "var(--jr-text-muted, #65747A)",
                    fontSize: "9.5px",
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

        {/* Critical Infrastructure Toggle */}
        <div style={{ borderTop: "1px solid var(--jr-border-subtle, #E8E2D7)", paddingTop: "4px" }}>
          <div style={{ fontSize: "9px", fontWeight: 800, color: "var(--jr-text-muted, #65747A)", textTransform: "uppercase", marginBottom: "3px" }}>
            Facilities & Shelters
          </div>
          <button
            onClick={() => setShowInfrastructure(!showInfrastructure)}
            style={{
              width: "100%",
              padding: "3px 6px",
              borderRadius: "4px",
              border: "1px solid transparent",
              backgroundColor: showInfrastructure ? "var(--jr-surface-alt, #EDE7DC)" : "transparent",
              color: showInfrastructure ? "var(--jr-blue-800, #24566A)" : "var(--jr-text-muted, #65747A)",
              fontSize: "10px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer"
            }}
          >
            <span>HOSPITALS & SHELTERS</span>
            {showInfrastructure ? <Eye size={12} /> : <EyeOff size={12} />}
          </button>
        </div>

        {/* Roads Layer Toggle */}
        <div style={{ borderTop: "1px solid var(--jr-border-subtle, #E8E2D7)", paddingTop: "4px" }}>
          <div style={{ fontSize: "9px", fontWeight: 800, color: "var(--jr-text-muted, #65747A)", textTransform: "uppercase", marginBottom: "3px" }}>
            Road Corridors
          </div>
          <button
            onClick={() => setShowAllRoads(!showAllRoads)}
            style={{
              width: "100%",
              padding: "3px 6px",
              borderRadius: "4px",
              border: "1px solid transparent",
              backgroundColor: showAllRoads ? "var(--status-feasible-bg, #E8F4EE)" : "transparent",
              color: showAllRoads ? "var(--status-feasible-text, #2C634B)" : "var(--jr-text-muted, #65747A)",
              fontSize: "10px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer"
            }}
          >
            <span>EVACUATION ROADS</span>
            {showAllRoads ? <Eye size={12} /> : <EyeOff size={12} />}
          </button>
        </div>

        {/* Terrain Layer Toggle */}
        <div style={{ borderTop: "1px solid var(--jr-border-subtle, #E8E2D7)", paddingTop: "4px" }}>
          <div style={{ fontSize: "9px", fontWeight: 800, color: "var(--jr-text-muted, #65747A)", textTransform: "uppercase", marginBottom: "3px" }}>
            3D Terrain Relief
          </div>
          <button
            onClick={() => setShowTerrain(!showTerrain)}
            style={{
              width: "100%",
              padding: "3px 6px",
              borderRadius: "4px",
              border: "1px solid transparent",
              backgroundColor: showTerrain ? "var(--jr-blue-50, #EAF6FB)" : "transparent",
              color: showTerrain ? "var(--jr-blue-800, #24566A)" : "var(--jr-text-muted, #65747A)",
              fontSize: "10px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer"
            }}
          >
            <span>GLO-30 ELEVATION</span>
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
        backgroundColor: "rgba(251, 248, 242, 0.95)",
        backdropFilter: "blur(10px)",
        border: "1px solid var(--jr-border, #D8D1C5)",
        borderRadius: "8px",
        padding: "8px 10px",
        fontSize: "10px",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        color: "var(--jr-text, #24343A)",
        boxShadow: "0 4px 12px rgba(36, 52, 58, 0.10)"
      }}>
        <div style={{ fontWeight: 800, fontSize: "9px", color: "var(--jr-text-muted, #65747A)", textTransform: "uppercase", marginBottom: "1px" }}>
          MAP LEGEND
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "12px", height: "3px", backgroundColor: "var(--jr-danger, #A84C4C)", borderRadius: "1px" }} />
          <span>Limiting Segment (R02-E07)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "12px", height: "3px", backgroundColor: "var(--jr-blue-600, #3D8EAE)", borderRadius: "1px" }} />
          <span>Evacuation Route (R02)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "10px", height: "8px", backgroundColor: "rgba(118, 184, 208, 0.7)", border: "1px solid var(--jr-blue-400, #76B8D0)", borderRadius: "2px" }} />
          <span>Flood Hazard (h &ge; 0.30m)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "7px", height: "7px", backgroundColor: "var(--status-feasible-text, #2C634B)", transform: "rotate(45deg)", display: "inline-block" }} />
          <span>Designated Safe Shelter</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "7px", height: "7px", backgroundColor: "var(--status-lowmargin-text, #825820)", borderRadius: "50%", display: "inline-block" }} />
          <span>Settlement Origin</span>
        </div>
      </div>
    </div>
  );
};
