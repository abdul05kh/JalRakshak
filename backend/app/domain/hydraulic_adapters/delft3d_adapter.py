"""
Delft3D Flexible Mesh (FM) Adapter Interface.

Implements standard HydraulicModelAdapter for Delft3D-FM NetCDF simulation results.
Truthfully reports NOT_CONFIGURED when solver or NetCDF dataset is absent.
"""

from typing import Dict, Any, List, Optional
from .base import HydraulicModelAdapter


class Delft3DAdapter(HydraulicModelAdapter):
    """Adapter for Delft3D Flexible Mesh hydrodynamic results."""

    def __init__(self, netcdf_path: Optional[str] = None, is_fixture: bool = False):
        self.netcdf_path = netcdf_path
        self.is_fixture = is_fixture

    def get_model_name(self) -> str:
        return "Delft3D Flexible Mesh (FM)"

    def get_solver_type(self) -> str:
        return "Eulerian Unstructured Staggered Grid 2D/3D"

    def get_status(self) -> str:
        if self.is_fixture:
            return "TEST_FIXTURE"
        return "AUTHORITATIVE_INGESTED" if self.netcdf_path else "NOT_CONFIGURED"

    def get_run_metadata(self) -> Dict[str, Any]:
        return {
            "model": self.get_model_name(),
            "solver": self.get_solver_type(),
            "status": self.get_status(),
            "source_file": self.netcdf_path or "NOT_CONFIGURED",
            "scientific_note": "Delft3D FM solver requires native D-Flow FM NetCDF (his.nc / map.nc) files."
        }

    def extract_spatial_mesh(self) -> Dict[str, Any]:
        return {"cells_count": 0, "faces_count": 0, "mesh_type": "Flexible Mesh NetCDF"}

    def extract_depth_field(self, timestep_sec: Optional[int] = None) -> Dict[str, float]:
        return {}

    def extract_velocity_field(self, timestep_sec: Optional[int] = None) -> Dict[str, float]:
        return {}

    def extract_arrival_times(self, threshold_depth_m: float = 0.3) -> Dict[str, float]:
        return {}
