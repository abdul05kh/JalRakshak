import React, { useState, useEffect, useRef } from "react";
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
  roads: _roads,
  evacPoints: _evacPoints,
  inundationGeoJSON: _inundationGeoJSON,
  analysisResult: _analysisResult,
  onNavigateToView
}) => {
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const currentPhase = getPhaseForTime(elapsedSec);
  const derivedHydraulicTimeMin = mapElapsedSecToHydraulicTimeMin(elapsedSec);

  // Sync playback state with video element
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Sync playback rate
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Handle video time updates
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const curTime = videoRef.current.currentTime;
      setElapsedSec(curTime);
      if (curTime >= SIMULATION_TOTAL_DURATION_SEC || videoRef.current.ended) {
        setIsPlaying(false);
      }
    }
  };

  const handleTogglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.ended || elapsedSec >= SIMULATION_TOTAL_DURATION_SEC) {
        videoRef.current.currentTime = 0;
        setElapsedSec(0);
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
    setElapsedSec(0);
    setIsPlaying(true);
  };

  const handleSeek = (sec: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = sec;
    }
    setElapsedSec(sec);
  };

  const showDecisionReveal = currentPhase.id === "DECISION_TRANSFORMATION" || currentPhase.id === "DECISION_REVEAL";

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", backgroundColor: "#060913" }}>
      {/* 1. Full HD Cinematic Video Player */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#060913" }}>
        <video
          ref={videoRef}
          src="/simulation/jalrakshak_cinematic.mp4"
          autoPlay
          playsInline
          muted
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            backgroundColor: "#060913"
          }}
        />
      </div>

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

