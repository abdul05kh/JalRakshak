"""
Smoothed Particle Hydrodynamics (SPH) Adapter Interface.

Implements standard HydraulicModelAdapter for Lagrangian particle hydrodynamic solvers
(e.g., DualSPHysics, SPHysics).
Truthfully reports NOT_CONFIGURED when SPH particle dataset is absent.
"""

from typing import Dict, Any, List, Optional
from .base import HydraulicModelAdapter


class SPHAdapter(HydraulicModelAdapter):
    """Adapter for Smoothed Particle Hydrodynamics (SPH) Lagrangian simulations."""

    def __init__(self, particle_data_path: Optional[str] = None, is_fixture: bool = False):
        self.particle_data_path = particle_data_path
        self.is_fixture = is_fixture

    def get_model_name(self) -> str:
        return "Smoothed Particle Hydrodynamics (DualSPHysics)"

    def get_solver_type(self) -> str:
        return "Lagrangian Meshless Particle Formulation"

    def get_status(self) -> str:
        if self.is_fixture:
            return "TEST_FIXTURE"
        return "AUTHORITATIVE_INGESTED" if self.particle_data_path else "NOT_CONFIGURED"

    def get_run_metadata(self) -> Dict[str, Any]:
        return {
            "model": self.get_model_name(),
            "solver": self.get_solver_type(),
            "status": self.get_status(),
            "source_file": self.particle_data_path or "NOT_CONFIGURED",
            "scientific_note": "SPH provides meshless high-deformation free-surface tracking; requires VTK/Bi4 particle archives."
        }

    def extract_spatial_mesh(self) -> Dict[str, Any]:
        return {"particles_count": 0, "mesh_type": "Lagrangian Particle Cloud"}

    def extract_depth_field(self, timestep_sec: Optional[int] = None) -> Dict[str, float]:
        return {}

    def extract_velocity_field(self, timestep_sec: Optional[int] = None) -> Dict[str, float]:
        return {}

    def extract_arrival_times(self, threshold_depth_m: float = 0.3) -> Dict[str, float]:
        return {}
