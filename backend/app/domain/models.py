from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

# Pydantic Schemas for API Contracts

class DamSchema(BaseModel):
    id: str
    name: str
    authority: str
    latitude: float
    longitude: float
    river_name: str
    reservoir_name: str
    dam_type: str
    height_m: float
    crest_length_m: float
    full_reservoir_level_m: float
    max_water_level_m: float
    gross_storage_mcm: float
    crs: str
    created_at: str

class BreachParameters(BaseModel):
    width_m: float = Field(..., gt=0, description="Breach width in meters (must be > 0)")
    formation_time_min: float = Field(..., gt=0, description="Breach formation time in minutes (must be > 0)")
    elevation_m: float = Field(0.0, description="Breach elevation in meters")

class ScenarioCreateRequest(BaseModel):
    dam_id: str
    name: str
    breach: BreachParameters
    duration_min: int = Field(180, gt=0, description="Simulation duration in minutes")
    terrain_dataset_id: Optional[str] = "copernicus-dem-30m"

class ScenarioSummary(BaseModel):
    id: str
    dam_id: str
    dam_name: str
    name: str
    status: str
    breach_width_m: float
    breach_formation_min: float
    breach_elevation_m: float
    duration_min: int
    peak_discharge_m3s: float
    solver: str
    terrain: str
    crs: str
    created_at: str

class PointQueryResponse(BaseModel):
    latitude: float
    longitude: float
    nearest_feature_name: str
    arrival_time_s: Optional[float]
    arrival_time_utc: Optional[str]
    max_depth_m: float
    max_velocity_mps: float
    inundated: bool
    scenario_id: str
    source_artifacts: List[str]
    confidence_label: str

class RouteConstraints(BaseModel):
    safety_buffer_min: float = Field(3.0, ge=0, description="Configured safety buffer in minutes")
    depth_limit_m: float = Field(0.3, gt=0, description="Maximum traversable flood depth in meters")
    velocity_limit_mps: float = Field(1.0, gt=0, description="Maximum traversable flood velocity in m/s")

class Coordinate(BaseModel):
    lat: float
    lon: float

class RouteAnalyzeRequest(BaseModel):
    scenario_id: str
    origin_id: Optional[str] = None
    origin_coord: Optional[Coordinate] = None
    destination_id: Optional[str] = None
    destination_coord: Optional[Coordinate] = None
    departure_time_utc: Optional[str] = None
    constraints: Optional[RouteConstraints] = Field(default_factory=RouteConstraints)

class RouteEdgeDetail(BaseModel):
    edge_id: str
    u: str
    v: str
    road_class: str
    speed_kmh: float
    length_m: float
    travel_time_min: float
    cumulative_travel_min: float
    flood_arrival_s: Optional[float]
    flood_arrival_utc: Optional[str]
    max_depth_m: float
    max_velocity_mps: float
    edge_deadline_s: Optional[float]
    edge_deadline_utc: Optional[str]
    edge_feasible: bool
    failure_reason: Optional[str]

class LimitingSegment(BaseModel):
    road_id: str
    road_class: str
    length_m: float
    cumulative_travel_min: float
    flood_arrival_s: float
    flood_arrival_utc: str
    max_depth_m: float
    max_velocity_mps: float
    limiting_deadline_utc: str
    margin_min: float
    failure_reason: str

class RouteAlternative(BaseModel):
    route_index: int
    name: str
    status: str  # FEASIBLE, LOW MARGIN, INFEASIBLE, DATA GAP
    total_distance_m: float
    total_travel_time_min: float
    deadline_utc: Optional[str]
    margin_min: Optional[float]
    limiting_segment: Optional[LimitingSegment]
    edges: List[RouteEdgeDetail]
    explanation: str

class RouteAnalyzeResponse(BaseModel):
    scenario_id: str
    scenario_name: str
    origin_name: str
    destination_name: str
    requested_departure_utc: str
    safety_buffer_min: float
    depth_limit_m: float
    velocity_limit_mps: float
    algorithm_version: str
    primary_status: str  # FEASIBLE, LOW MARGIN, INFEASIBLE, NO_FEASIBLE_ROUTE, DATA GAP
    primary_route: Optional[RouteAlternative]
    alternatives: List[RouteAlternative]
    provenance: Dict[str, Any]

class ScenarioComparisonResponse(BaseModel):
    scenario_a: Dict[str, Any]
    scenario_b: Dict[str, Any]
    breach_width_diff_m: float
    peak_discharge_diff_m3s: float
    arrival_time_delta_summary: Dict[str, Any]
    route_status_comparison: List[Dict[str, Any]]
    explanation: str
