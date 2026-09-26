/**
 * simulation/CinematicSimulationView.tsx
 * Continuous Cinematic Technical Simulation Mode for JalRakshak RC2.3
 * Choreographs: Dam -> Breach -> Release -> Propagation -> Terrain -> Settlement -> Roads -> R02 -> Limiting Segment -> JalRakshak Decision Reveal.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapView } from "../components/MapView";
import { SimulationHUD } from "./SimulationHUD";
import { DecisionReveal } from "./DecisionReveal";
import type { RoadFeature, EvacuationPointFeature, RouteAnalyzeResponse, ScenarioSummary } from "../types";
import { 
  SIMULATION_TOTAL_DURATION_SEC, 
  getPhaseForTime, 
  mapElapsedSecToHydraulicTimeMin 
} from "./SimulationTimeline";

interface CinematicSimulationViewProps {
  scenarios: ScenarioSummary[];
  activeScenarioId: string;
  roads: RoadFeature[];
  evacPoints: EvacuationPointFeature[];
  inundationGeoJSON: any;
  analysisResult: RouteAnalyzeResponse | null;
  onNavigateToView: (view: string) => void;
}

export const CinematicSimulationView: React.FC<CinematicSimulationViewProps> = ({
  scenarios: _scenarios,
  activeScenarioId = "SCENARIO_CENTRAL",
  roads,
  evacPoints,
  inundationGeoJSON,
  analysisResult,
  onNavigateToView
}) => {
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);
  const [cameraPreset, setCameraPreset] = useState<string>("TEHRI_DAM");
  const [showTerrain] = useState<boolean>(true);

  const lastFrameTimeRef = useRef<number | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const prevPhaseIdRef = useRef<string | null>(null);

  const currentPhase = getPhaseForTime(elapsedSec);
  const derivedHydraulicTimeMin = mapElapsedSecToHydraulicTimeMin(elapsedSec);

  // Synchronize camera smoothly on phase boundaries
  useEffect(() => {
    if (currentPhase.id !== prevPhaseIdRef.current) {
      prevPhaseIdRef.current = currentPhase.id;
      if (!isReducedMotion) {
        setCameraPreset(currentPhase.cameraPreset);
      }
    }
  }, [currentPhase.id, currentPhase.cameraPreset, isReducedMotion]);

  // Main continuous simulation animation loop using requestAnimationFrame
  const updateLoop = useCallback((timestamp: number) => {
    if (lastFrameTimeRef.current === null) {
      lastFrameTimeRef.current = timestamp;
    }

    const deltaSec = (timestamp - lastFrameTimeRef.current) / 1000;
    lastFrameTimeRef.current = timestamp;

    setElapsedSec((prev) => {
      const next = prev + deltaSec * playbackSpeed;
      if (next >= SIMULATION_TOTAL_DURATION_SEC) {
        setIsPlaying(false);
        return SIMULATION_TOTAL_DURATION_SEC;
      }
      return next;
    });

    if (isPlaying) {
      animFrameIdRef.current = requestAnimationFrame(updateLoop);
    }
  }, [isPlaying, playbackSpeed]);

  useEffect(() => {
    if (isPlaying) {
      lastFrameTimeRef.current = null;
      animFrameIdRef.current = requestAnimationFrame(updateLoop);
    } else if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, [isPlaying, updateLoop]);

  const handleTogglePlay = () => {
    if (elapsedSec >= SIMULATION_TOTAL_DURATION_SEC) {
      setElapsedSec(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleRestart = () => {
    setIsPlaying(false);
    setElapsedSec(0);
    setCameraPreset("TEHRI_DAM");
    setTimeout(() => setIsPlaying(true), 100);
  };

  const handleSeek = (sec: number) => {
    setElapsedSec(sec);
  };

  const showDecisionReveal = currentPhase.id === "DECISION_TRANSFORMATION" || currentPhase.id === "DECISION_REVEAL";
  const highlightedEdgeId = currentPhase.id === "LIMITING_EDGE" || showDecisionReveal ? "R02-E07" : null;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", backgroundColor: "#060913" }}>
      {/* 1. Primary 3D Geospatial Map Viewport (Occupies 100% of container) */}
      <MapView
        roads={roads}
        evacPoints={evacPoints}
        inundationGeoJSON={inundationGeoJSON}
        activeRoute={analysisResult?.primary_route || null}
        mapViewState="3D"
        thematicMode="DEPTH"
        selectedTimelineStep={`T+${derivedHydraulicTimeMin}`}
        cameraPreset={cameraPreset}
        selectedEdgeId={highlightedEdgeId || undefined}
        showTerrain={showTerrain}
        showRoads={currentPhase.id !== "INTRO_DAM" && currentPhase.id !== "BREACH_INITIATION"}
        layerVisibility={{ inundation: true, roads: true, origins: true, destinations: true }}
        onMapClick={() => {}}
        pointQueryData={null}
        showValidationControls={false}
      />

      {/* 2. Minimalist Cinematic Heads-Up Display */}
      <SimulationHUD
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onRestart={handleRestart}
        elapsedSec={elapsedSec}
        onSeek={handleSeek}
        playbackSpeed={playbackSpeed}
        onChangeSpeed={(spd) => setPlaybackSpeed(spd)}
        currentPhase={currentPhase}
        derivedHydraulicTimeMin={derivedHydraulicTimeMin}
        isReducedMotion={isReducedMotion}
        onToggleReducedMotion={() => setIsReducedMotion(!isReducedMotion)}
      />

      {/* 3. Climax: JalRakshak Decision Transformation & Reveal Overlay */}
      {showDecisionReveal && (
        <DecisionReveal
          scenarioId={activeScenarioId}
          routeId="R02"
          onExploreInOperationalMap={() => onNavigateToView("OPERATIONAL_MAP")}
        />
      )}
    </div>
  );
};
