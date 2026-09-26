import React, { useState, useEffect } from "react";
import { Header, type ViewType } from "./components/Header";
import { OperationalMapView } from "./views/OperationalMapView";
import { CinematicSimulationView } from "./simulation/CinematicSimulationView";
import { EvacuationDecisionView } from "./views/EvacuationDecisionView";
import { RoadImpactView } from "./views/RoadImpactView";
import { ArchitectureView } from "./views/ArchitectureView";
import { FeasibilityView } from "./views/FeasibilityView";
import { ScienceValidationView } from "./views/ScienceValidationView";
import { ProvenanceView } from "./views/ProvenanceView";
import { ArcGISTerrainTestView } from "./views/ArcGISTerrainTestView";
import { StateDebugPanel } from "./components/StateDebugPanel";

import type {
  ScenarioSummary,
  Dam,
  RoadFeature,
  EvacuationPointFeature,
  RouteAnalyzeResponse
} from "./types";

import {
  fetchScenarios,
  fetchDam,
  fetchScenarioLayers,
  analyzeRoute,
  fetchTimelineData
} from "./services/api";

export const App: React.FC = () => {
  // Navigation View State: Dedicated Full-Screen Pages
  const [activeView, setActiveView] = useState<ViewType>(() => {
    if (typeof window !== "undefined" && window.location.pathname === "/arcgis-terrain-test") {
      return "ARCGIS_TERRAIN_TEST";
    }
    return "OPERATIONAL_MAP";
  });

  // Scenarios & Dam Metadata
  const [scenarios, setScenarios] = useState<ScenarioSummary[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string>("SCENARIO_CENTRAL");
  const [dam, setDam] = useState<Dam | null>(null);

  // Layers & Geometries
  const [inundationGeoJSON, setInundationGeoJSON] = useState<any>(null);
  const [roads, setRoads] = useState<RoadFeature[]>([]);
  const [evacPoints, setEvacPoints] = useState<EvacuationPointFeature[]>([]);

  // Route & Operational Constraints
  const [selectedRouteId, setSelectedRouteId] = useState<string>("R02");
  const [selectedOriginId, setSelectedOriginId] = useState<string>("VILL-02"); // Malidewal
  const [selectedDestinationId, setSelectedDestinationId] = useState<string>("VILL-01"); // Koteshwar (R02 path)
  const [safetyBufferMin] = useState<number>(3.0);
  const [depthLimitM] = useState<number>(0.3);
  const [velocityLimitMps] = useState<number>(1.0);

  // Decision Analysis Result
  const [, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<RouteAnalyzeResponse | null>(null);

  // Simulation Timeline
  const [timelineSteps, setTimelineSteps] = useState<any[]>([]);
  const [activeTimestepMin, setActiveTimestepMin] = useState<number>(60);

  // Map Signals
  const [focusLimitingSignal, setFocusLimitingSignal] = useState<number>(0);

  // Initial Scenario & Dam Load
  useEffect(() => {
    fetchScenarios()
      .then((scs) => {
        setScenarios(scs);
        const centralSc = scs.find((s) => s.id === "SCENARIO_CENTRAL") || scs[0];
        if (centralSc) {
          setActiveScenarioId(centralSc.id);
        }
      })
      .catch((err) => console.error("Failed to load scenarios:", err));

    fetchDam()
      .then((d) => setDam(d))
      .catch((err) => console.error("Failed to load dam metadata:", err));
  }, []);

  // Handle route switching
  const handleSelectRoute = (routeId: string) => {
    setSelectedRouteId(routeId);
    if (routeId === "R02") {
      setSelectedOriginId("VILL-02"); // Malidewal
      setSelectedDestinationId("VILL-01"); // Koteshwar (Route R02 path)
    } else {
      setSelectedOriginId("VILL-02"); // Malidewal
      setSelectedDestinationId("SHELTER-01"); // Chamba (Route R01 path)
    }
  };

  // Synchronize Scenario Layers & Timeline
  useEffect(() => {
    if (!activeScenarioId) return;

    fetchScenarioLayers(activeScenarioId)
      .then((layers) => {
        setInundationGeoJSON(layers.inundation_geojson);
        setRoads(layers.roads_geojson?.features || []);
        setEvacPoints(layers.evacuation_points_geojson?.features || []);
        handleRunAnalysis(activeScenarioId, selectedOriginId, selectedDestinationId);
      })
      .catch((err) => console.error("Failed to load scenario layers:", err));

    fetchTimelineData(activeScenarioId)
      .then((data) => {
        if (data.timesteps) {
          setTimelineSteps(data.timesteps);
        }
      })
      .catch((err) => console.error("Failed to load timeline data:", err));
  }, [activeScenarioId, selectedOriginId, selectedDestinationId]);

  const handleRunAnalysis = async (scenId?: string, origId?: string, destId?: string) => {
    const targetScenarioId = scenId || activeScenarioId;
    const targetOriginId = origId || selectedOriginId;
    const targetDestId = destId || selectedDestinationId;
    if (!targetScenarioId) return;

    setIsAnalyzing(true);
    try {
      const res = await analyzeRoute({
        scenario_id: targetScenarioId,
        origin_id: targetOriginId,
        destination_id: targetDestId,
        departure_time_utc: new Date().toISOString(),
        constraints: {
          safety_buffer_min: safetyBufferMin,
          depth_limit_m: depthLimitM,
          velocity_limit_mps: velocityLimitMps
        }
      });
      setAnalysisResult(res);
    } catch (err) {
      console.error("Route analysis failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTriggerFocusLimiting = () => {
    setFocusLimitingSignal((prev) => prev + 1);
  };

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      backgroundColor: "#090d16"
    }}>
      {/* Universal Top Header */}
      <Header
        scenarios={scenarios}
        activeScenarioId={activeScenarioId}
        onSelectScenario={(id) => setActiveScenarioId(id)}
        dam={dam}
        selectedRouteId={selectedRouteId}
        onSelectRouteId={handleSelectRoute}
        activeTimestepMin={activeTimestepMin}
        activeView={activeView}
        onNavigateToView={(view) => setActiveView(view)}
      />

      {/* Main View Area */}
      <main style={{ flex: 1, width: "100%", height: "calc(100vh - 50px)", position: "relative", overflow: "hidden" }}>
        {activeView === "OPERATIONAL_MAP" && (
          <OperationalMapView
            scenarios={scenarios}
            activeScenarioId={activeScenarioId}
            onSelectScenario={(id) => setActiveScenarioId(id)}
            dam={dam}
            roads={roads}
            evacPoints={evacPoints}
            inundationGeoJSON={inundationGeoJSON}
            analysisResult={analysisResult}
            selectedRouteId={selectedRouteId}
            onSelectRouteId={handleSelectRoute}
            timelineSteps={timelineSteps}
            activeTimestepMin={activeTimestepMin}
            onSelectTimestep={(min) => setActiveTimestepMin(min)}
            focusLimitingSignal={focusLimitingSignal}
            onTriggerFocusLimiting={handleTriggerFocusLimiting}
            onNavigateToView={(view) => setActiveView(view as ViewType)}
          />
        )}

        {activeView === "FLOOD_SIMULATION" && (
          <CinematicSimulationView
            scenarios={scenarios}
            activeScenarioId={activeScenarioId}
            analysisResult={analysisResult}
            roads={roads}
            evacPoints={evacPoints}
            inundationGeoJSON={inundationGeoJSON}
            onNavigateToView={(view) => setActiveView(view as ViewType)}
          />
        )}

        {activeView === "EVACUATION_DECISION" && (
          <EvacuationDecisionView
            scenarios={scenarios}
            activeScenarioId={activeScenarioId}
            analysisResult={analysisResult}
            selectedRouteId={selectedRouteId}
            onSelectRouteId={handleSelectRoute}
            onNavigateToView={(view) => setActiveView(view as ViewType)}
          />
        )}

        {activeView === "ROAD_IMPACT" && (
          <RoadImpactView
            scenarios={scenarios}
            activeScenarioId={activeScenarioId}
            dam={dam}
            roads={roads}
            evacPoints={evacPoints}
            inundationGeoJSON={inundationGeoJSON}
            analysisResult={analysisResult}
            selectedRouteId={selectedRouteId}
            onSelectRouteId={handleSelectRoute}
            activeTimestepMin={activeTimestepMin}
            onNavigateToView={(view) => setActiveView(view as ViewType)}
          />
        )}

        {activeView === "ARCHITECTURE" && (
          <ArchitectureView
            onNavigateToView={(view) => setActiveView(view as ViewType)}
          />
        )}

        {activeView === "FEASIBILITY" && (
          <FeasibilityView
            onNavigateToView={(view) => setActiveView(view as ViewType)}
          />
        )}

        {activeView === "SCIENCE_VALIDATION" && (
          <ScienceValidationView
            scenarios={scenarios}
            activeScenarioId={activeScenarioId}
            onNavigateToView={(view) => setActiveView(view as ViewType)}
          />
        )}

        {activeView === "PROVENANCE" && (
          <ProvenanceView
            scenarios={scenarios}
            activeScenarioId={activeScenarioId}
            onNavigateToView={(view) => setActiveView(view as ViewType)}
          />
        )}

        {activeView === "ARCGIS_TERRAIN_TEST" && (
          <ArcGISTerrainTestView
            onNavigateToView={(view) => setActiveView(view as ViewType)}
          />
        )}
      </main>

      {/* Developer State Debug Panel (Gated behind dev flag / Ctrl+Shift+D) */}
      {(typeof window !== "undefined" && (window as any).__JALRAKSHAK_ENABLE_DEV_PANEL__) && (
        <StateDebugPanel
          activeScenarioId={activeScenarioId}
          selectedRouteId={selectedRouteId}
          activeTimestepMin={activeTimestepMin}
        />
      )}
    </div>
  );
};

export default App;
