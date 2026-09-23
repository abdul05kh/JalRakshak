export interface Dam {
  id: string;
  name: string;
  authority: string;
  latitude: number;
  longitude: number;
  river_name: string;
  reservoir_name: string;
  dam_type: string;
  height_m: number;
  crest_length_m: number;
  full_reservoir_level_m: number;
  max_water_level_m: number;
  gross_storage_mcm: number;
  crs: string;
  created_at: string;
}

export interface ScenarioSummary {
  id: string;
  dam_id: string;
  dam_name: string;
  name: string;
  status: string;
  breach_width_m: number;
  breach_formation_min: number;
  breach_elevation_m: number;
  duration_min: number;
  peak_discharge_m3s: number;
  solver: string;
  terrain: string;
  crs: string;
  created_at: string;
}

export interface EvacuationPointFeature {
  type: string;
  id: string;
  properties: {
    id: string;
    name: string;
    type: string;
    population?: number;
    capacity?: number;
    elevation_m: number;
    river_distance_km?: number;
    category: "ORIGIN" | "DESTINATION";
  };
  geometry: {
    type: string;
    coordinates: [number, number];
  };
}

export interface RoadFeature {
  type: string;
  id: string;
  properties: {
    id: string;
    u: string;
    v: string;
    road_class: string;
    speed_kmh: number;
    length_m: number;
    travel_time_min: number;
    source: string;
  };
  geometry: {
    type: string;
    coordinates: [number, number][];
  };
}

export interface LimitingSegment {
  road_id: string;
  road_class: string;
  length_m: number;
  cumulative_travel_min: number;
  flood_arrival_s: number;
  flood_arrival_utc: string;
  max_depth_m: number;
  max_velocity_mps: number;
  limiting_deadline_utc: string;
  margin_min: number;
  failure_reason: string;
}

export interface RouteEdgeDetail {
  edge_id: string;
  u: string;
  v: string;
  road_class: string;
  speed_kmh: number;
  length_m: number;
  travel_time_min: number;
  cumulative_travel_min: number;
  flood_arrival_s: number | null;
  flood_arrival_utc: string | null;
  max_depth_m: number;
  max_velocity_mps: number;
  edge_deadline_s: number | null;
  edge_deadline_utc: string | null;
  edge_feasible: boolean;
  failure_reason: string | null;
}

export interface RouteAlternative {
  route_index: number;
  name: string;
  status: "FEASIBLE" | "LOW MARGIN" | "INFEASIBLE" | "DATA GAP" | "NO_FEASIBLE_ROUTE";
  total_distance_m: number;
  total_travel_time_min: number;
  deadline_utc: string | null;
  margin_min: number | null;
  limiting_segment: LimitingSegment | null;
  edges: RouteEdgeDetail[];
  explanation: string;
}

export interface RouteAnalyzeResponse {
  scenario_id: string;
  scenario_name: string;
  origin_name: string;
  destination_name: string;
  requested_departure_utc: string;
  safety_buffer_min: number;
  depth_limit_m: number;
  velocity_limit_mps: number;
  algorithm_version: string;
  primary_status: "FEASIBLE" | "LOW MARGIN" | "INFEASIBLE" | "DATA GAP" | "NO_FEASIBLE_ROUTE";
  primary_route: RouteAlternative | null;
  alternatives: RouteAlternative[];
  provenance: Record<string, any>;
}

export interface PointQueryResponse {
  latitude: number;
  longitude: number;
  nearest_feature_name: string;
  arrival_time_s: number | null;
  arrival_time_utc: string | null;
  max_depth_m: number;
  max_velocity_mps: number;
  inundated: boolean;
  scenario_id: string;
  source_artifacts: string[];
  confidence_label: string;
}

export interface ScenarioComparisonResponse {
  scenario_a: Record<string, any>;
  scenario_b: Record<string, any>;
  breach_width_diff_m: number;
  peak_discharge_diff_m3s: number;
  arrival_time_delta_summary: Record<string, any>;
  route_status_comparison: Array<{
    route_label: string;
    scenario_a_status: string;
    scenario_a_deadline: string | null;
    scenario_b_status: string;
    scenario_b_deadline: string | null;
    status_changed: boolean;
  }>;
  explanation: string;
}
