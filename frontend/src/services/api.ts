import type {
  ScenarioSummary,
  Dam,
  RouteAnalyzeResponse,
  PointQueryResponse,
  ScenarioComparisonResponse
} from "../types";

const API_BASE = "http://localhost:8000/api/v1";

export async function fetchScenarios(): Promise<ScenarioSummary[]> {
  const res = await fetch(`${API_BASE}/scenarios`);
  if (!res.ok) throw new Error("Failed to fetch scenarios");
  return res.json();
}

export async function fetchDam(damId: string = "dam-tehri-001"): Promise<Dam> {
  const res = await fetch(`${API_BASE}/dams/${damId}`);
  if (!res.ok) throw new Error("Failed to fetch dam details");
  return res.json();
}

export async function fetchScenarioLayers(scenarioId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/scenarios/${scenarioId}/layers`);
  if (!res.ok) throw new Error("Failed to fetch scenario layers");
  return res.json();
}

export async function queryPoint(scenarioId: string, lat: number, lon: number): Promise<PointQueryResponse> {
  const res = await fetch(`${API_BASE}/scenarios/${scenarioId}/point-query?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error("Point query failed");
  return res.json();
}

export async function analyzeRoute(payload: {
  scenario_id: string;
  origin_id?: string;
  origin_coord?: { lat: number; lon: number };
  destination_id?: string;
  destination_coord?: { lat: number; lon: number };
  departure_time_utc?: string;
  constraints: {
    safety_buffer_min: number;
    depth_limit_m: number;
    velocity_limit_mps: number;
  };
}): Promise<RouteAnalyzeResponse> {
  const res = await fetch(`${API_BASE}/routes/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Route analysis failed");
  return res.json();
}

export async function compareScenarios(scenarioIdA: string, scenarioIdB: string): Promise<ScenarioComparisonResponse> {
  const res = await fetch(`${API_BASE}/scenarios/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scenario_id_a: scenarioIdA, scenario_id_b: scenarioIdB })
  });
  if (!res.ok) throw new Error("Scenario comparison failed");
  return res.json();
}

export async function fetchValidationData(scenarioId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/scenarios/${scenarioId}/validation`);
  if (!res.ok) throw new Error("Failed to fetch validation data");
  return res.json();
}

export async function fetchProvenanceData(scenarioId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/scenarios/${scenarioId}/provenance`);
  if (!res.ok) throw new Error("Failed to fetch provenance data");
  return res.json();
}
