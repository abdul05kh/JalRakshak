from pydantic import BaseModel, Field
from typing import List, Optional

class CandidateRouteEvaluation(BaseModel):
    route_id: str
    route_name: str
    is_feasible: bool
    departure_deadline_seconds: float
    departure_deadline_formatted: str
    limiting_segment_id: str
    evacuation_duration_seconds: float
    total_length_km: float
    shelter_capacity_remaining: int
    hazard_exposure_level: str
    robustness_score: float = Field(..., ge=0.0, le=1.0)
    recommendation_rank: int

class OperationalDecisionResponse(BaseModel):
    incident_id: str
    generation_time_utc: str
    primary_recommended_route_id: str
    routes: List[CandidateRouteEvaluation]
    officer_action_checklist: List[str]
