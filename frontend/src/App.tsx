import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { MapView } from "./components/MapView";
import { DecisionPanel } from "./components/DecisionPanel";
import { ScenarioCompareModal } from "./components/ScenarioCompareModal";
import { ValidationModal } from "./components/ValidationModal";
import { ProvenanceDrawer } from "./components/ProvenanceDrawer";

import type {
  ScenarioSummary,
  Dam,
  RoadFeature,
  EvacuationPointFeature,
  RouteAnalyzeResponse,
  PointQueryResponse
} from "./types";

import {
  fetchScenarios,
  fetchDam,
  fetchScenarioLayers,
  queryPoint,
  analyzeRoute
} from "./services/api";

export const App: React.FC = () => {
  // State
  const [scenarios, setScenarios] = useState<ScenarioSummary[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string>("");
  const [dam, setDam] = useState<Dam | null>(null);

  // Layers
  const [inundationGeoJSON, setInundationGeoJSON] = useState<any>(null);
  const [roads, setRoads] = useState<RoadFeature[]>([]);
  const [evacPoints, setEvacPoints] = useState<EvacuationPointFeature[]>([]);

  const [layerVisibility, setLayerVisibility] = useState({
    inundation: true,
    roads: true,
    origins: true,
    destinations: true
  });

  // Query & Routing
  const [selectedOriginId, setSelectedOriginId] = useState<string>("VILL-02"); // Malidewal
  const [selectedDestinationId, setSelectedDestinationId] = useState<string>("SHELTER-01"); // Chamba
  const [departureTime, setDepartureTime] = useState<string>(new Date().toISOString());
  const [safetyBufferMin, setSafetyBufferMin] = useState<number>(3.0);
  const [depthLimitM, setDepthLimitM] = useState<number>(0.3);
  const [velocityLimitMps, setVelocityLimitMps] = useState<number>(1.0);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<RouteAnalyzeResponse | null>(null);
  const [activeAlternativeIndex, setActiveAlternativeIndex] = useState<number>(0);

  const [pointQueryData, setPointQueryData] = useState<PointQueryResponse | null>(null);

  // Modals & Drawers
  const [showCompare, setShowCompare] = useState<boolean>(false);
  const [showValidation, setShowValidation] = useState<boolean>(false);
  const [showProvenance, setShowProvenance] = useState<boolean>(false);

  // Initial Data Load
  useEffect(() => {
    fetchScenarios()
      .then((scs) => {
        setScenarios(scs);
        if (scs.length > 0) {
          setActiveScenarioId(scs[0].id);
        }
      })
      .catch((err) => console.error(err));

    fetchDam()
      .then((d) => setDam(d))
      .catch((err) => console.error(err));
  }, []);

  // Load Scenario Layers when active scenario changes
  useEffect(() => {
    if (!activeScenarioId) return;

    fetchScenarioLayers(activeScenarioId)
      .then((layers) => {
        setInundationGeoJSON(layers.inundation_geojson);
        setRoads(layers.roads_geojson?.features || []);
        setEvacPoints(layers.evacuation_points_geojson?.features || []);
        // Automatically rerun analysis on scenario change if already analyzed
        handleRunAnalysis(activeScenarioId);
      })
      .catch((err) => console.error(err));
  }, [activeScenarioId]);

  const handleToggleLayer = (layer: keyof typeof layerVisibility) => {
    setLayerVisibility((prev) => ({
      ...prev,
      [layer]: !prev[layer]
    }));
  };

  const handleRunAnalysis = async (scenId?: string) => {
    const targetScenarioId = scenId || activeScenarioId;
    if (!targetScenarioId) return;

    setIsAnalyzing(true);
    try {
      const res = await analyzeRoute({
        scenario_id: targetScenarioId,
        origin_id: selectedOriginId,
        destination_id: selectedDestinationId,
        departure_time_utc: departureTime,
        constraints: {
          safety_buffer_min: safetyBufferMin,
          depth_limit_m: depthLimitM,
          velocity_limit_mps: velocityLimitMps
        }
      });
      setAnalysisResult(res);
      setActiveAlternativeIndex(0);
    } catch (err) {
      console.error("Route analysis failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleMapClick = async (lat: number, lon: number) => {
    if (!activeScenarioId) return;
    try {
      const res = await queryPoint(activeScenarioId, lat, lon);
      setPointQueryData(res);
    } catch (err) {
      console.error("Point query failed:", err);
    }
  };

  const activeScenario = scenarios.find((s) => s.id === activeScenarioId) || null;

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100vw", height: "100vh", overflow: "hidden" }}>
      {/* Top Navigation */}
      <Header
        scenarios={scenarios}
        activeScenarioId={activeScenarioId}
        onSelectScenario={(id) => setActiveScenarioId(id)}
        dam={dam}
        onOpenCompare={() => setShowCompare(true)}
        onOpenValidation={() => setShowValidation(true)}
        onOpenProvenance={() => setShowProvenance(true)}
      />

      {/* Main Workspace (Sidebar + Map + Decision Panel) */}
      <div style={{ display: "flex", flex: 1, height: "calc(100vh - 58px)", overflow: "hidden" }}>
        <Sidebar
          scenario={activeScenario}
          layerVisibility={layerVisibility}
          onToggleLayer={handleToggleLayer}
        />

        <MapView
          inundationGeoJSON={inundationGeoJSON}
          roads={roads}
          evacPoints={evacPoints}
          activeRoute={analysisResult ? (analysisResult.alternatives[activeAlternativeIndex] || analysisResult.primary_route) : null}
          layerVisibility={layerVisibility}
          onMapClick={handleMapClick}
          pointQueryData={pointQueryData}
        />

        <DecisionPanel
          evacPoints={evacPoints}
          selectedOriginId={selectedOriginId}
          onSelectOrigin={setSelectedOriginId}
          selectedDestinationId={selectedDestinationId}
          onSelectDestination={setSelectedDestinationId}
          departureTime={departureTime}
          onChangeDepartureTime={setDepartureTime}
          safetyBufferMin={safetyBufferMin}
          onChangeSafetyBuffer={setSafetyBufferMin}
          depthLimitM={depthLimitM}
          onChangeDepthLimit={setDepthLimitM}
          velocityLimitMps={velocityLimitMps}
          onChangeVelocityLimit={setVelocityLimitMps}
          onRunAnalysis={() => handleRunAnalysis()}
          isAnalyzing={isAnalyzing}
          analysisResult={analysisResult}
          activeAlternativeIndex={activeAlternativeIndex}
          onSelectAlternative={setActiveAlternativeIndex}
        />
      </div>

      {/* Modals & Drawers */}
      {showCompare && (
        <ScenarioCompareModal
          scenarios={scenarios}
          activeScenarioId={activeScenarioId}
          onClose={() => setShowCompare(false)}
        />
      )}

      {showValidation && (
        <ValidationModal
          scenarioId={activeScenarioId}
          onClose={() => setShowValidation(false)}
        />
      )}

      {showProvenance && (
        <ProvenanceDrawer
          scenarioId={activeScenarioId}
          onClose={() => setShowProvenance(false)}
        />
      )}
    </div>
  );
};

export default App;
