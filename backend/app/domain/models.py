"""
Authoritative Domain Models and Typed Schemas for JalRakshak Emergency Decision Support System.
SIH Problem Statement: SIH26161
"""

from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

# ============================================================================
# AUTHORITATIVE ENUMS
# ============================================================================

class DecisionStatus(str, Enum):
    """
    Authoritative operational status for evacuation decisions.
    CRITICAL: 'SAFE' is NEVER a valid operational status.
    FEASIBLE means feasible under configured engineering assumptions (no guarantee of absolute safety).
    """
    FEASIBLE = "FEASIBLE"
    LOW_MARGIN = "LOW MARGIN"
    INFEASIBLE = "INFEASIBLE"
    DATA_GAP = "DATA GAP"
    NO_FEASIBLE_ROUTE = "NO_FEASIBLE_ROUTE"

class ScenarioStatus(str, Enum):
    READY = "READY"
    RUNNING = "RUNNING"
    FAILED = "FAILED"
    DATA_GAP = "DATA_GAP"
    ARCHIVED = "ARCHIVED"

class ValidationStatus(str, Enum):
    PASS = "PASS"
    PARTIAL = "PARTIAL"
    NOT_ESTABLISHED = "NOT_ESTABLISHED"
    DATA_GAP = "DATA_GAP"

class DataQualityStatus(str, Enum):
    AUTHORITATIVE = "AUTHORITATIVE"
    DERIVED = "DERIVED"
    CONFIGURED_ASSUMPTION = "CONFIGURED_ASSUMPTION"
    RESEARCH = "RESEARCH"
    DATA_GAP = "DATA_GAP"
    NOT_ESTABLISHED = "NOT_ESTABLISHED"

class SourceType(str, Enum):
    HECRAS_REAL_RESULT = "HECRAS_REAL_RESULT"
    SYNTHETIC_TEST_FIXTURE = "SYNTHETIC_TEST_FIXTURE"
    CUSTOM_SIMULATION = "CUSTOM_SIMULATION"

class HydraulicSolver(str, Enum):
    HECRAS_2D = "HEC-RAS 2D"
    DELFT3D = "Delft3D (Interface Only)"
    DUALSPHYSICS = "DualSPHysics (Interface Only)"
    SYNTHETIC = "Synthetic Analytical Solver"

class ObservationStatus(str, Enum):
    OBSERVED = "OBSERVED"
    UNOBSERVED = "UNOBSERVED"
    CLOUD_OBSCURED = "CLOUD_OBSCURED"
    DATA_GAP = "DATA_GAP"


# ============================================================================
# CORE DOMAIN ENTITY MODELS
# ============================================================================

class HydraulicArtifact(BaseModel):
    artifact_id: str
    file_path: str
    sha256_checksum: str
    file_size_bytes: int
    solver: str
    solver_version: str
    crs: str
    native_units: str
    derived_units: str = "meters"
    created_at_utc: str
    status: ScenarioStatus = ScenarioStatus.READY

class HydraulicField(BaseModel):
    field_id: str
    artifact_id: str
    name: str  # depth, velocity, wse, arrival_time
    units: str
    derivation_method: str
    threshold_m: Optional[float] = None
    min_value: float
    max_value: float
    timestamp_s: Optional[float] = None

class HydraulicState(BaseModel):
    scenario_id: str
    timestamp_s: float
    timestep_index: int
    cell_count: int
    wse_available: bool
    depth_available: bool
    velocity_available: bool
    water_volume_m3: Optional[float] = None

class RoadSegment(BaseModel):
    segment_id: str
    u: str
    v: str
    road_class: str
    length_m: float
    speed_kmh: float = 50.0  # Configured engineering assumption
    travel_time_s: float
    coordinates_wgs84: List[List[float]]

class Route(BaseModel):
    route_id: str
    origin_node: str
    destination_node: str
    segment_ids: List[str]
    total_length_m: float
    total_travel_time_s: float

class RouteExposure(BaseModel):
    route_id: str
    segment_id: str
    flood_arrival_s: Optional[float]
    max_depth_m: float
    max_velocity_mps: float
    cumulative_travel_s: float
    margin_s: Optional[float]
    limiting: bool = False

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

class EvacuationDecision(BaseModel):
    decision_id: str
    scenario_id: str
    route_id: str
    status: DecisionStatus
    departure_time_utc: str
    deadline_utc: Optional[str]
    deadline_s: Optional[float]
    minimum_margin_s: Optional[float]
    minimum_margin_min: Optional[float]
    limiting_segment: Optional[LimitingSegment]
    safety_buffer_s: float
    travel_speed_kmh: float
    travel_time_model: str = "STATIC_ENGINEERING_ASSUMPTION"
    dynamic_traffic_model: str = "NOT_IMPLEMENTED"
    provenance_hash: str
    created_at_utc: str

class ScenarioComparison(BaseModel):
    comparison_id: str
    scenario_a_id: str
    scenario_b_id: str
    route_id: str
    arrival_delta_s: Optional[float]
    deadline_delta_s: Optional[float]
    limiting_edge_changed: bool
    status_a: DecisionStatus
    status_b: DecisionStatus
    summary_explanation: str

class ValidationResult(BaseModel):
    level: int  # 1 to 5
    level_name: str
    status: ValidationStatus
    description: str
    evidence_reference: str
    metrics: Dict[str, Any] = Field(default_factory=dict)
    timestamp_utc: str

class ProvenanceRecord(BaseModel):
    decision_id: str
    scenario_id: str
    route_id: str
    hydraulic_artifact: str
    artifact_hash: str
    solver: str
    solver_version: str
    terrain_source: str
    terrain_crs: str
    vertical_datum_status: str
    mesh_resolution: str
    arrival_threshold_m: float
    road_dataset: str
    road_coupling_method: str
    road_coupling_radius_m: float
    travel_speed_kmh: float
    travel_speed_status: str = "CONFIGURED_ASSUMPTION"
    safety_buffer_min: float
    safety_buffer_status: str = "CONFIGURED_ASSUMPTION"
    ewe_version: str
    created_at_utc: str
    validation_status: ValidationStatus

class ExposureResult(BaseModel):
    scenario_id: str
    total_roads_analyzed: int
    roads_inundated: int
    settlements_affected: int
    critical_facilities_at_risk: int
    maximum_flood_depth_m: float
    peak_inundation_area_km2: float

class ObservationRecord(BaseModel):
    observation_id: str
    satellite_mission: str = "Sentinel-1 SAR"
    acquisition_date_utc: str
    coverage_area_km2: float
    detected_water_extent_km2: float
    observation_status: ObservationStatus
    limitations: str = "Terrain layover and steep relief shadow in Himalayan valleys."


# ============================================================================
# API CONTRACT SCHEMAS
# ============================================================================

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
    source_type: Optional[str] = "SYNTHETIC_TEST_FIXTURE"
    category: Optional[str] = "AUTHORITATIVE"
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
    source_type: Optional[str] = "SYNTHETIC_TEST_FIXTURE"
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
    margin_min: Optional[float] = None

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
    # Core Decision Identification
    decision_id: Optional[str] = None
    decision_timestamp: Optional[str] = None
    scenario_id: str
    scenario_name: str
    source_type: str = "SYNTHETIC_TEST_FIXTURE"
    hydraulic_artifact: Optional[str] = None
    hydraulic_artifact_sha256: Optional[str] = None
    hec_ras_version: Optional[str] = None

    # Routing OD
    origin: Optional[str] = None
    origin_name: str
    destination: Optional[str] = None
    destination_name: str
    requested_departure_utc: str

    # Decision Parameters & Outputs
    route_id: Optional[str] = None
    route_status: Optional[str] = None
    latest_feasible_departure: Optional[str] = None
    decision_margin: Optional[float] = None
    safety_buffer: Optional[float] = None
    safety_buffer_min: float
    depth_limit_m: float
    velocity_limit_mps: float
    limiting_segment: Optional[str] = None
    limiting_segment_arrival: Optional[str] = None
    limiting_segment_depth: Optional[float] = None
    estimated_travel_time: Optional[float] = None
    completion_time: Optional[str] = None

    # Algorithm & Structure
    algorithm_version: str
    primary_status: str  # FEASIBLE, LOW MARGIN, INFEASIBLE, NO_FEASIBLE_ROUTE, DATA GAP
    primary_route: Optional[RouteAlternative]
    alternatives: List[RouteAlternative]
    alternative_routes: Optional[List[Dict[str, Any]]] = None

    # Assumptions, Limitations & Epistemic Status
    travel_time_model: str = "STATIC_ENGINEERING_ASSUMPTION"
    dynamic_traffic_model: str = "NOT_IMPLEMENTED"
    road_network_scope: str = "DEMONSTRATION_DATASET"
    assumptions: List[str] = Field(default_factory=list)
    data_gaps: List[str] = Field(default_factory=list)
    validation_status: str = "VALIDATION_NOT_ESTABLISHED"
    provenance: Dict[str, Any]

class ScenarioComparisonResponse(BaseModel):
    scenario_a: Dict[str, Any]
    scenario_b: Dict[str, Any]
    breach_width_diff_m: float
    peak_discharge_diff_m3s: float
    arrival_time_delta_summary: Dict[str, Any]
    route_status_comparison: List[Dict[str, Any]]
    explanation: str
