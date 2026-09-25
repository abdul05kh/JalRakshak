/**
 * decisionStore.ts
 * Single Authoritative Decision Source for JalRakshak Frontend
 * Ensures 100% synchronized, deterministic EWE results across all views.
 */

export interface AuthoritativeDecisionResult {
  scenarioId: string;
  scenarioName: string;
  peakDischargeM3s: number;
  routeId: string;
  routeName: string;
  originName: string;
  destinationName: string;
  limitingEdgeId: string;
  limitingSegmentName: string;

  // Exact numerical seconds (strictly positive for arrival, travel, buffer)
  arrivalSeconds: number;
  travelSeconds: number;
  bufferSeconds: number;
  deadlineSeconds: number;

  // Exact formatted strings for zero-derivation UI rendering
  arrivalFormatted: string; // "T+60:00"
  travelFormatted: string;  // "12:39"
  bufferFormatted: string;  // "03:00"
  deadlineFormatted: string; // "T+44:21"

  status: "FEASIBLE" | "LOW_MARGIN" | "INFEASIBLE" | "DATA_GAP";
  statusBadgeText: string;
  reasonCode: string;
  formulaText: string; // "3600 - 759 - 180 = 2661"

  sourceArtifact: string;
  couplingMethod: string;
  calculationVersion: string;
}

export interface EdgeImpactDetail {
  edgeId: string;
  segmentName: string;
  lengthKm: number;
  speedKmh: number;
  travelToEdgeMin: string;
  floodArrivalMin: string;
  marginMin: string;
  status: "FEASIBLE" | "LOW_MARGIN" | "INUNDATED";
  isLimiting: boolean;
}

// Frozen Authoritative Scenario Matrix (Locked Ground Truth)
const LOCKED_SCENARIO_DECISIONS: Record<string, Record<string, {
  arrivalSeconds: number;
  travelSeconds: number;
  bufferSeconds: number;
  limitingEdgeId: string;
  limitingSegmentName: string;
  peakDischargeM3s: number;
  scenarioName: string;
  sourceArtifact: string;
}>> = {
  // CENTRAL (Froehlich piping baseline)
  SCENARIO_CENTRAL: {
    R02: {
      arrivalSeconds: 3600, // T+60:00
      travelSeconds: 759,   // 12:39
      bufferSeconds: 180,   // 03:00
      limitingEdgeId: "R02-E07",
      limitingSegmentName: "Koteshwar Riverbank Limiting Segment",
      peakDischargeM3s: 65000,
      scenarioName: "CENTRAL (Qp = 65,000 m³/s)",
      sourceArtifact: "tehri_15km_scenario_central.p01.hdf"
    },
    R01: {
      arrivalSeconds: 99999,
      travelSeconds: 551,   // 09:11
      bufferSeconds: 180,
      limitingEdgeId: "NONE",
      limitingSegmentName: "High Ground Ridge Corridor",
      peakDischargeM3s: 65000,
      scenarioName: "CENTRAL (Qp = 65,000 m³/s)",
      sourceArtifact: "tehri_15km_scenario_central.p01.hdf"
    }
  },
  "scen-tehri-001-baseline": {
    R02: {
      arrivalSeconds: 3600,
      travelSeconds: 759,
      bufferSeconds: 180,
      limitingEdgeId: "R02-E07",
      limitingSegmentName: "Koteshwar Riverbank Limiting Segment",
      peakDischargeM3s: 65000,
      scenarioName: "Central Baseline (Qp = 65,000 m3/s)",
      sourceArtifact: "tehri_15km_scenario_central.p01.hdf"
    },
    R01: {
      arrivalSeconds: 99999,
      travelSeconds: 551,
      bufferSeconds: 180,
      limitingEdgeId: "NONE",
      limitingSegmentName: "High Ground Ridge Corridor",
      peakDischargeM3s: 65000,
      scenarioName: "Central Baseline (Qp = 65,000 m3/s)",
      sourceArtifact: "tehri_15km_scenario_central.p01.hdf"
    }
  },

  // MINIMUM (Overtopping / Piping slow breach)
  SCENARIO_MINIMUM: {
    R02: {
      arrivalSeconds: 5700, // T+95:00
      travelSeconds: 759,   // 12:39
      bufferSeconds: 180,   // 03:00
      limitingEdgeId: "R02-E07",
      limitingSegmentName: "Koteshwar Riverbank Limiting Segment",
      peakDischargeM3s: 28500,
      scenarioName: "Minimum Inflow / Delayed Breach (Qp = 28,500 m3/s)",
      sourceArtifact: "tehri_15km_scenario_minimum.p01.hdf"
    },
    R01: {
      arrivalSeconds: 99999,
      travelSeconds: 551,
      bufferSeconds: 180,
      limitingEdgeId: "NONE",
      limitingSegmentName: "High Ground Ridge Corridor",
      peakDischargeM3s: 28500,
      scenarioName: "Minimum Inflow / Delayed Breach (Qp = 28,500 m3/s)",
      sourceArtifact: "tehri_15km_scenario_minimum.p01.hdf"
    }
  },
  "scen-tehri-003-piping": {
    R02: {
      arrivalSeconds: 5700,
      travelSeconds: 759,
      bufferSeconds: 180,
      limitingEdgeId: "R02-E07",
      limitingSegmentName: "Koteshwar Riverbank Limiting Segment",
      peakDischargeM3s: 28500,
      scenarioName: "Minimum Inflow / Delayed Breach (Qp = 28,500 m3/s)",
      sourceArtifact: "tehri_15km_scenario_minimum.p01.hdf"
    },
    R01: {
      arrivalSeconds: 99999,
      travelSeconds: 551,
      bufferSeconds: 180,
      limitingEdgeId: "NONE",
      limitingSegmentName: "High Ground Ridge Corridor",
      peakDischargeM3s: 28500,
      scenarioName: "Minimum Inflow / Delayed Breach (Qp = 28,500 m3/s)",
      sourceArtifact: "tehri_15km_scenario_minimum.p01.hdf"
    }
  },

  // MAXIMUM (Catastrophic instantaneous collapse)
  SCENARIO_MAXIMUM: {
    R02: {
      arrivalSeconds: 2700, // T+45:00
      travelSeconds: 759,   // 12:39
      bufferSeconds: 180,   // 03:00
      limitingEdgeId: "R02-E07",
      limitingSegmentName: "Koteshwar Riverbank Limiting Segment",
      peakDischargeM3s: 115000,
      scenarioName: "Catastrophic Fast-Breach (Qp = 115,000 m3/s)",
      sourceArtifact: "tehri_15km_scenario_maximum.p01.hdf"
    },
    R01: {
      arrivalSeconds: 99999,
      travelSeconds: 551,
      bufferSeconds: 180,
      limitingEdgeId: "NONE",
      limitingSegmentName: "High Ground Ridge Corridor",
      peakDischargeM3s: 115000,
      scenarioName: "Catastrophic Fast-Breach (Qp = 115,000 m3/s)",
      sourceArtifact: "tehri_15km_scenario_maximum.p01.hdf"
    }
  },
  "scen-tehri-002-catastrophic": {
    R02: {
      arrivalSeconds: 2700,
      travelSeconds: 759,
      bufferSeconds: 180,
      limitingEdgeId: "R02-E07",
      limitingSegmentName: "Koteshwar Riverbank Limiting Segment",
      peakDischargeM3s: 115000,
      scenarioName: "Catastrophic Fast-Breach (Qp = 115,000 m3/s)",
      sourceArtifact: "tehri_15km_scenario_maximum.p01.hdf"
    },
    R01: {
      arrivalSeconds: 99999,
      travelSeconds: 551,
      bufferSeconds: 180,
      limitingEdgeId: "NONE",
      limitingSegmentName: "High Ground Ridge Corridor",
      peakDischargeM3s: 115000,
      scenarioName: "Catastrophic Fast-Breach (Qp = 115,000 m3/s)",
      sourceArtifact: "tehri_15km_scenario_maximum.p01.hdf"
    }
  }
};

/**
 * Format total seconds into mm:ss
 */
export function formatSecondsToMinSec(totalSeconds: number): string {
  if (isNaN(totalSeconds)) return "--:--";
  const absSec = Math.abs(totalSeconds);
  const mins = Math.floor(absSec / 60);
  const secs = Math.round(absSec % 60);
  const mm = mins.toString().padStart(2, "0");
  const ss = secs.toString().padStart(2, "0");
  return `${totalSeconds < 0 ? "-" : ""}${mm}:${ss}`;
}

/**
 * Format total seconds into T+mm:ss
 */
export function formatSecondsToRelTime(totalSeconds: number): string {
  if (isNaN(totalSeconds)) return "N/A";
  if (totalSeconds >= 99999) return "UNAFFECTED (High Ground)";
  const absSec = Math.abs(totalSeconds);
  const mins = Math.floor(absSec / 60);
  const secs = Math.round(absSec % 60);
  const mm = mins.toString().padStart(2, "0");
  const ss = secs.toString().padStart(2, "0");
  return `T+${totalSeconds < 0 ? "-" : ""}${mm}:${ss}`;
}

/**
 * Retrieves the single authoritative decision object for any given scenario and route.
 */
export function getAuthoritativeDecision(
  scenarioId: string,
  routeId: string = "R02",
  customBufferMin?: number
): AuthoritativeDecisionResult {
  const normScenarioKey = LOCKED_SCENARIO_DECISIONS[scenarioId]
    ? scenarioId
    : (scenarioId.includes("MIN") ? "SCENARIO_MINIMUM" : (scenarioId.includes("MAX") ? "SCENARIO_MAXIMUM" : "SCENARIO_CENTRAL"));

  const scenarioGroup = LOCKED_SCENARIO_DECISIONS[normScenarioKey] || LOCKED_SCENARIO_DECISIONS["SCENARIO_CENTRAL"];
  const routeData = scenarioGroup[routeId] || scenarioGroup["R02"];

  const arrivalSeconds = routeData.arrivalSeconds;
  const travelSeconds = routeData.travelSeconds;
  const bufferSeconds = customBufferMin !== undefined ? Math.round(customBufferMin * 60) : routeData.bufferSeconds;

  // Strict Validation: travel and buffer must never be negative
  if (travelSeconds < 0 || bufferSeconds < 0 || arrivalSeconds < 0) {
    throw new Error(
      `[DecisionStore Error] Invalid negative values in EWE calculation: arrival=${arrivalSeconds}s, travel=${travelSeconds}s, buffer=${bufferSeconds}s`
    );
  }

  // Authoritative EWE Equation: D = A_i - T_i - B
  let deadlineSeconds: number;
  let status: "FEASIBLE" | "LOW_MARGIN" | "INFEASIBLE" | "DATA_GAP";
  let statusBadgeText: string;
  let reasonCode: string;

  if (arrivalSeconds >= 99999) {
    deadlineSeconds = 99268;
    status = "FEASIBLE";
    statusBadgeText = "FEASIBLE (High Ground)";
    reasonCode = "HIGH_GROUND_UNAFFECTED";
  } else {
    deadlineSeconds = arrivalSeconds - travelSeconds - bufferSeconds;
    if (deadlineSeconds < 0) {
      status = "INFEASIBLE";
      statusBadgeText = "INFEASIBLE";
      reasonCode = "INSUFFICIENT_CLEARANCE_WINDOW";
    } else if (deadlineSeconds < 300) { // < 5 minutes margin
      status = "LOW_MARGIN";
      statusBadgeText = "LOW MARGIN";
      reasonCode = "MARGIN_BELOW_THRESHOLD";
    } else {
      status = "FEASIBLE";
      statusBadgeText = "FEASIBLE";
      reasonCode = "SAFE_EVACUATION_CLEARANCE";
    }
  }

  const arrivalFormatted = formatSecondsToRelTime(arrivalSeconds);
  const travelFormatted = formatSecondsToMinSec(travelSeconds);
  const bufferFormatted = formatSecondsToMinSec(bufferSeconds);
  const deadlineFormatted = formatSecondsToRelTime(deadlineSeconds);
  const formulaText = `${arrivalSeconds} - ${travelSeconds} - ${bufferSeconds} = ${deadlineSeconds}`;

  return {
    scenarioId: normScenarioKey,
    scenarioName: routeData.scenarioName,
    peakDischargeM3s: routeData.peakDischargeM3s,
    routeId,
    routeName: routeId === "R02" ? "R02 (Malidewal → Koteshwar / Chamba)" : "R01 (Malidewal → Chamba Direct)",
    originName: "Malidewal Lowland Village",
    destinationName: routeId === "R02" ? "Koteshwar / Chamba Relief Shelter" : "Chamba Safe Shelter (High Ground)",
    limitingEdgeId: routeData.limitingEdgeId,
    limitingSegmentName: routeData.limitingSegmentName,
    arrivalSeconds,
    travelSeconds,
    bufferSeconds,
    deadlineSeconds,
    arrivalFormatted,
    travelFormatted,
    bufferFormatted,
    deadlineFormatted,
    status,
    statusBadgeText,
    reasonCode,
    formulaText,
    sourceArtifact: routeData.sourceArtifact,
    couplingMethod: "150m Hydraulic Buffer Coupling with <=50m point densification",
    calculationVersion: "EWE-v1.0.0-PROD"
  };
}

/**
 * Returns Edge-level Breakdown rows for Route R02 under the selected scenario
 */
export function getAuthoritativeEdgeBreakdown(scenarioId: string): EdgeImpactDetail[] {
  const normScenario = scenarioId.includes("MIN") ? "MINIMUM" : (scenarioId.includes("MAX") ? "MAXIMUM" : "CENTRAL");

  if (normScenario === "MINIMUM") {
    return [
      { edgeId: "R02-E01", segmentName: "Malidewal Village Exit", lengthKm: 0.8, speedKmh: 40, travelToEdgeMin: "01:12", floodArrivalMin: "T+125:00", marginMin: "+120:48", status: "FEASIBLE", isLimiting: false },
      { edgeId: "R02-E02", segmentName: "Bhagirathi Valley Upper Link", lengthKm: 1.4, speedKmh: 50, travelToEdgeMin: "02:52", floodArrivalMin: "T+115:00", marginMin: "+109:08", status: "FEASIBLE", isLimiting: false },
      { edgeId: "R02-E03", segmentName: "Jakhnidhar Junction", lengthKm: 1.9, speedKmh: 50, travelToEdgeMin: "05:08", floodArrivalMin: "T+110:00", marginMin: "+101:52", status: "FEASIBLE", isLimiting: false },
      { edgeId: "R02-E04", segmentName: "Tipri Lowland Bypass", lengthKm: 1.2, speedKmh: 45, travelToEdgeMin: "06:44", floodArrivalMin: "T+105:00", marginMin: "+95:16", status: "FEASIBLE", isLimiting: false },
      { edgeId: "R02-E05", segmentName: "Koteshwar North Terrace", lengthKm: 1.6, speedKmh: 50, travelToEdgeMin: "08:39", floodArrivalMin: "T+102:00", marginMin: "+90:21", status: "FEASIBLE", isLimiting: false },
      { edgeId: "R02-E06", segmentName: "Lower Canyon Bridge Approach", lengthKm: 1.5, speedKmh: 45, travelToEdgeMin: "10:39", floodArrivalMin: "T+98:00", marginMin: "+84:21", status: "FEASIBLE", isLimiting: false },
      { edgeId: "R02-E07", segmentName: "Koteshwar Riverbank Limiting Segment", lengthKm: 2.1, speedKmh: 50, travelToEdgeMin: "12:39", floodArrivalMin: "T+95:00", marginMin: "+79:21", status: "FEASIBLE", isLimiting: true }
    ];
  } else if (normScenario === "MAXIMUM") {
    return [
      { edgeId: "R02-E01", segmentName: "Malidewal Village Exit", lengthKm: 0.8, speedKmh: 40, travelToEdgeMin: "01:12", floodArrivalMin: "T+75:00", marginMin: "+70:48", status: "FEASIBLE", isLimiting: false },
      { edgeId: "R02-E02", segmentName: "Bhagirathi Valley Upper Link", lengthKm: 1.4, speedKmh: 50, travelToEdgeMin: "02:52", floodArrivalMin: "T+65:00", marginMin: "+59:08", status: "FEASIBLE", isLimiting: false },
      { edgeId: "R02-E03", segmentName: "Jakhnidhar Junction", lengthKm: 1.9, speedKmh: 50, travelToEdgeMin: "05:08", floodArrivalMin: "T+60:00", marginMin: "+51:52", status: "FEASIBLE", isLimiting: false },
      { edgeId: "R02-E04", segmentName: "Tipri Lowland Bypass", lengthKm: 1.2, speedKmh: 45, travelToEdgeMin: "06:44", floodArrivalMin: "T+55:00", marginMin: "+45:16", status: "FEASIBLE", isLimiting: false },
      { edgeId: "R02-E05", segmentName: "Koteshwar North Terrace", lengthKm: 1.6, speedKmh: 50, travelToEdgeMin: "08:39", floodArrivalMin: "T+52:00", marginMin: "+40:21", status: "FEASIBLE", isLimiting: false },
      { edgeId: "R02-E06", segmentName: "Lower Canyon Bridge Approach", lengthKm: 1.5, speedKmh: 45, travelToEdgeMin: "10:39", floodArrivalMin: "T+48:00", marginMin: "+34:21", status: "FEASIBLE", isLimiting: false },
      { edgeId: "R02-E07", segmentName: "Koteshwar Riverbank Limiting Segment", lengthKm: 2.1, speedKmh: 50, travelToEdgeMin: "12:39", floodArrivalMin: "T+45:00", marginMin: "+29:21", status: "FEASIBLE", isLimiting: true }
    ];
  }

  // CENTRAL Baseline
  return [
    { edgeId: "R02-E01", segmentName: "Malidewal Village Exit", lengthKm: 0.8, speedKmh: 40, travelToEdgeMin: "01:12", floodArrivalMin: "T+90:00", marginMin: "+85:48", status: "FEASIBLE", isLimiting: false },
    { edgeId: "R02-E02", segmentName: "Bhagirathi Valley Upper Link", lengthKm: 1.4, speedKmh: 50, travelToEdgeMin: "02:52", floodArrivalMin: "T+80:00", marginMin: "+74:08", status: "FEASIBLE", isLimiting: false },
    { edgeId: "R02-E03", segmentName: "Jakhnidhar Junction", lengthKm: 1.9, speedKmh: 50, travelToEdgeMin: "05:08", floodArrivalMin: "T+75:00", marginMin: "+66:52", status: "FEASIBLE", isLimiting: false },
    { edgeId: "R02-E04", segmentName: "Tipri Lowland Bypass", lengthKm: 1.2, speedKmh: 45, travelToEdgeMin: "06:44", floodArrivalMin: "T+70:00", marginMin: "+60:16", status: "FEASIBLE", isLimiting: false },
    { edgeId: "R02-E05", segmentName: "Koteshwar North Terrace", lengthKm: 1.6, speedKmh: 50, travelToEdgeMin: "08:39", floodArrivalMin: "T+68:00", marginMin: "+56:21", status: "FEASIBLE", isLimiting: false },
    { edgeId: "R02-E06", segmentName: "Lower Canyon Bridge Approach", lengthKm: 1.5, speedKmh: 45, travelToEdgeMin: "10:39", floodArrivalMin: "T+64:00", marginMin: "+50:21", status: "FEASIBLE", isLimiting: false },
    { edgeId: "R02-E07", segmentName: "Koteshwar Riverbank Limiting Segment", lengthKm: 2.1, speedKmh: 50, travelToEdgeMin: "12:39", floodArrivalMin: "T+60:00", marginMin: "+44:21", status: "FEASIBLE", isLimiting: true }
  ];
}
