"""
Abstract Base Class for Multi-Hydrodynamic-Model Adapters.

Provides standard interface for:
- HEC-RAS 2D (Eulerian Finite Volume Shallow Water Solver)
- Delft3D FM (Flexible Mesh Unstructured Solver)
- SPH (Smoothed Particle Hydrodynamics Lagrangian Solver)
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from datetime import datetime


class HydraulicModelAdapter(ABC):
    """Abstract interface representing a hydrodynamic simulation model source."""

    @abstractmethod
    def get_model_name(self) -> str:
        """Returns the canonical model name (e.g., 'HEC-RAS 2D', 'Delft3D FM', 'DualSPHysics')."""
        pass

    @abstractmethod
    def get_solver_type(self) -> str:
        """Returns mathematical solver formulation (e.g., 'Eulerian Finite Volume', 'Lagrangian Particle')."""
        pass

    @abstractmethod
    def get_status(self) -> str:
        """Returns 'AUTHORITATIVE_INGESTED', 'NOT_CONFIGURED', or 'TEST_FIXTURE'."""
        pass

    @abstractmethod
    def get_run_metadata(self) -> Dict[str, Any]:
        """Returns run configuration, execution timestamps, and simulation provenance."""
        pass

    @abstractmethod
    def extract_spatial_mesh(self) -> Dict[str, Any]:
        """Returns computational cell/particle coordinates and connectivity."""
        pass

    @abstractmethod
    def extract_depth_field(self, timestep_sec: Optional[int] = None) -> Dict[str, float]:
        """Returns map of cell_id -> water depth (m)."""
        pass

    @abstractmethod
    def extract_velocity_field(self, timestep_sec: Optional[int] = None) -> Dict[str, float]:
        """Returns map of cell_id -> velocity magnitude (m/s)."""
        pass

    @abstractmethod
    def extract_arrival_times(self, threshold_depth_m: float = 0.3) -> Dict[str, float]:
        """Returns map of cell_id -> arrival timestamp (s)."""
        pass
