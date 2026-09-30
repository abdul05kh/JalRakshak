"""
Authoritative Provenance Service for JalRakshak Emergency Decision Support System.

Guarantees:
1. Every operational decision is backed by an immutable ProvenanceRecord.
2. SHA-256 hash is strictly identified as ARTIFACT INTEGRITY (not scientific validation).
3. Configured assumptions (50 km/h vehicle speed, 3 min buffer) are explicitly declared.
4. Epistemic status (simulation, uncalibrated vertical datum, unmodeled live traffic) is exposed.
"""

from typing import Dict, Optional, Any
from datetime import datetime, timezone
from backend.app.domain.models import ProvenanceRecord, ValidationStatus

class ProvenanceService:
    def __init__(self):
        # In-memory store for decision provenance records
        self._records: Dict[str, ProvenanceRecord] = {}

    def record_decision_provenance(
        self,
        decision_id: str,
        scenario_id: str,
        route_id: str,
        hydraulic_artifact: str,
        artifact_hash: str,
        solver: str,
        solver_version: str,
        terrain_source: str = "Copernicus GLO-30 DSM (Resampled/Conditioned)",
        terrain_crs: str = "EPSG:32644 (UTM Zone 44N)",
        vertical_datum_status: str = "NOT_ESTABLISHED",
        mesh_resolution: str = "75m Unstructured 2D Mesh",
        arrival_threshold_m: float = 0.30,
        road_dataset: str = "OpenStreetMap / Study Area Curated",
        road_coupling_method: str = "Geometric Densified Corridor Buffering (150m)",
        road_coupling_radius_m: float = 150.0,
        travel_speed_kmh: float = 50.0,
        safety_buffer_min: float = 3.0,
        ewe_version: str = "1.0.0",
        validation_status: ValidationStatus = ValidationStatus.NOT_ESTABLISHED
    ) -> ProvenanceRecord:
        record = ProvenanceRecord(
            decision_id=decision_id,
            scenario_id=scenario_id,
            route_id=route_id,
            hydraulic_artifact=hydraulic_artifact,
            artifact_hash=artifact_hash,
            solver=solver,
            solver_version=solver_version,
            terrain_source=terrain_source,
            terrain_crs=terrain_crs,
            vertical_datum_status=vertical_datum_status,
            mesh_resolution=mesh_resolution,
            arrival_threshold_m=arrival_threshold_m,
            road_dataset=road_dataset,
            road_coupling_method=road_coupling_method,
            road_coupling_radius_m=road_coupling_radius_m,
            travel_speed_kmh=travel_speed_kmh,
            travel_speed_status="CONFIGURED_ASSUMPTION",
            safety_buffer_min=safety_buffer_min,
            safety_buffer_status="CONFIGURED_ASSUMPTION",
            ewe_version=ewe_version,
            created_at_utc=datetime.now(timezone.utc).isoformat(),
            validation_status=validation_status
        )
        self._records[decision_id] = record
        return record

    def get_provenance(self, decision_id: str) -> Optional[ProvenanceRecord]:
        return self._records.get(decision_id)

    def list_recent_provenance(self, limit: int = 50) -> Dict[str, ProvenanceRecord]:
        items = list(self._records.items())[-limit:]
        return dict(items)

provenance_service = ProvenanceService()
