/**
 * simulation/SimulationTimeline.ts
 * Deterministic presentation phases and mapping for the continuous cinematic technical simulation.
 */

import type { SimulationPhase } from "./types";

export const SIMULATION_TOTAL_DURATION_SEC = 140;

export const SIMULATION_PHASES: SimulationPhase[] = [
  {
    id: "INTRO_DAM",
    startTimeSec: 0,
    endTimeSec: 14,
    title: "Tehri Dam Reservoir & Upstream Basin",
    subtitle: "Bhagirathi River, Uttarakhand — Gross Storage at 830m FRL Baseline",
    badge: "RESERVOIR EQUILIBRIUM",
    badgeColor: "#38bdf8",
    cameraPreset: "TEHRI_DAM",
    targetHydraulicTimeMin: 0,
    narrativeText: "Calm reservoir equilibrium before modeled parametric breach onset."
  },
  {
    id: "BREACH_INITIATION",
    startTimeSec: 14,
    endTimeSec: 28,
    title: "Breach Initiation at 635m Invert",
    subtitle: "Deterministic Parametric Piping Development (Qp = 65,000 m³/s Central Scenario)",
    badge: "BREACH INITIATION",
    badgeColor: "#f59e0b",
    cameraPreset: "BREACH_LOCATION",
    targetHydraulicTimeMin: 10,
    narrativeText: "Earthen embankment breach expands downward to 635m MSL invert model boundary."
  },
  {
    id: "FLOOD_RELEASE",
    startTimeSec: 28,
    endTimeSec: 44,
    title: "Peak Hydrodynamic Wavefront Release",
    subtitle: "High-Velocity Surge Entering Steep V-Shaped Himalayan Gorge",
    badge: "DISCHARGE RELEASE",
    badgeColor: "#f97316",
    cameraPreset: "BREACH_LOCATION",
    targetHydraulicTimeMin: 20,
    narrativeText: "Catastrophic wave discharges through gorge at 65,000 m³/s peak rate."
  },
  {
    id: "FLOOD_PROPAGATION",
    startTimeSec: 44,
    endTimeSec: 62,
    title: "Downstream Hydraulic Wavefront Propagation",
    subtitle: "HEC-RAS 2D Unsteady Shallow Water Equations Channeled by GLO-30 DSM Topography",
    badge: "VALLEY PROPAGATION",
    badgeColor: "#3b82f6",
    cameraPreset: "DOWNSTREAM_VALLEY",
    targetHydraulicTimeMin: 35,
    narrativeText: "Wavefront advances downstream, constrained by steep Himalayan canyon walls."
  },
  {
    id: "SETTLEMENT_EXPOSURE",
    startTimeSec: 62,
    endTimeSec: 78,
    title: "Downstream Settlement Exposure",
    subtitle: "Floodwaters Entering Malidewal & Tipri Lowland Terraces",
    badge: "SETTLEMENT EXPOSURE",
    badgeColor: "#a855f7",
    cameraPreset: "DOWNSTREAM_VALLEY",
    targetHydraulicTimeMin: 45,
    narrativeText: "Floodwaters reach lower riparian terrace settlements; emergency access threatened."
  },
  {
    id: "ROAD_IMPACT",
    startTimeSec: 78,
    endTimeSec: 92,
    title: "Transport Network Intersection & Route R02",
    subtitle: "Spatial 150m Perpendicular Hydraulic Coupling Evaluated",
    badge: "ROAD IMPACT",
    badgeColor: "#ec4899",
    cameraPreset: "R02_ROUTE",
    targetHydraulicTimeMin: 50,
    narrativeText: "Evacuation route R02 (Malidewal → Chamba) coupled to advancing flood boundary."
  },
  {
    id: "ROUTE_TRAVERSAL",
    startTimeSec: 92,
    endTimeSec: 106,
    title: "Modeled Evacuation Traversal Progression",
    subtitle: "Cumulative Traversal Time Evaluated Across Segments E01 → E07",
    badge: "TRAVERSAL PROGRESSION",
    badgeColor: "#06b6d4",
    cameraPreset: "R02_ROUTE",
    targetHydraulicTimeMin: 55,
    narrativeText: "Vehicles proceed along road geometry toward high-ground Chamba shelter."
  },
  {
    id: "LIMITING_EDGE",
    startTimeSec: 106,
    endTimeSec: 118,
    title: "Limiting Segment R02-E07 Threshold Reached",
    subtitle: "Water Depth Exceeds h ≥ 0.30m at T+60:00 on Koteshwar Riverbank Corridor",
    badge: "HYDRAULIC CLOSURE",
    badgeColor: "#ef4444",
    cameraPreset: "R02_E07_LIMITING",
    targetHydraulicTimeMin: 60,
    narrativeText: "Flood arrival at limiting segment R02-E07 closes evacuation corridor at T+60:00."
  },
  {
    id: "DECISION_TRANSFORMATION",
    startTimeSec: 118,
    endTimeSec: 130,
    title: "JalRakshak Decision Transformation",
    subtitle: "Translating HEC-RAS Physics into Evacuation Window Engine (EWE) Decision",
    badge: "EWE TRANSFORMATION",
    badgeColor: "#8b5cf6",
    cameraPreset: "R02_ROUTE",
    targetHydraulicTimeMin: 60,
    narrativeText: "JalRakshak solves D = min(Ai - Ti - B) to convert hydraulic wave into action deadline."
  },
  {
    id: "DECISION_REVEAL",
    startTimeSec: 130,
    endTimeSec: 140,
    title: "Latest Feasible Departure: LEAVE BY T+44:21",
    subtitle: "Actionable Evacuation Window for Central Scenario (Qp = 65,000 m³/s)",
    badge: "ACTIONABLE DEADLINE",
    badgeColor: "#22c55e",
    cameraPreset: "VALLEY_OVERVIEW",
    targetHydraulicTimeMin: 60,
    narrativeText: "Departure deadline T+44:21 ensures clearing segment R02-E07 before hydraulic closure."
  }
];

export function getPhaseForTime(elapsedSec: number): SimulationPhase {
  const clamped = Math.max(0, Math.min(elapsedSec, SIMULATION_TOTAL_DURATION_SEC));
  const found = SIMULATION_PHASES.find(
    (p) => clamped >= p.startTimeSec && clamped < p.endTimeSec
  );
  return found || SIMULATION_PHASES[SIMULATION_PHASES.length - 1];
}

/**
 * Deterministically maps presentation simulation elapsed seconds to authoritative
 * native HEC-RAS hydraulic source timestep (in minutes).
 */
export function mapElapsedSecToHydraulicTimeMin(elapsedSec: number): number {
  const phase = getPhaseForTime(elapsedSec);
  const phaseDuration = phase.endTimeSec - phase.startTimeSec;
  const phaseProgress = (elapsedSec - phase.startTimeSec) / phaseDuration;

  // Find previous phase target or 0
  const phaseIdx = SIMULATION_PHASES.findIndex((p) => p.id === phase.id);
  const prevTarget = phaseIdx > 0 ? SIMULATION_PHASES[phaseIdx - 1].targetHydraulicTimeMin : 0;
  const currTarget = phase.targetHydraulicTimeMin;

  const interpolatedMin = prevTarget + (currTarget - prevTarget) * Math.max(0, Math.min(1, phaseProgress));
  // Quantize to closest discrete 5-min HEC-RAS keyframe for hydraulic layer matching
  return Math.round(interpolatedMin / 5) * 5;
}
