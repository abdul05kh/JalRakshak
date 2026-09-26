/**
 * simulation/types.ts
 * Type definitions for JalRakshak RC2.3 Cinematic Simulation Mode
 */

export type SimulationPhaseId =
  | "INTRO_DAM"
  | "BREACH_INITIATION"
  | "FLOOD_RELEASE"
  | "FLOOD_PROPAGATION"
  | "SETTLEMENT_EXPOSURE"
  | "ROAD_IMPACT"
  | "ROUTE_TRAVERSAL"
  | "LIMITING_EDGE"
  | "DECISION_TRANSFORMATION"
  | "DECISION_REVEAL";

export interface SimulationPhase {
  id: SimulationPhaseId;
  startTimeSec: number;
  endTimeSec: number;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  cameraPreset: string;
  targetHydraulicTimeMin: number;
  narrativeText: string;
}

export interface SimulationState {
  isPlaying: boolean;
  isReady: boolean;
  elapsedSec: number;
  totalDurationSec: number;
  playbackSpeed: number;
  currentPhase: SimulationPhase;
  derivedHydraulicTimeMin: number;
  activeThematicMode: "EXTENT" | "DEPTH" | "ARRIVAL";
  highlightedEdgeId: string | null;
  activeSettlementId: string | null;
  showDecisionReveal: boolean;
  isReducedMotion: boolean;
}
