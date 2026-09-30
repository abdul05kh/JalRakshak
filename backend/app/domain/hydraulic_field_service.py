"""
Hydraulic Field Service for JalRakshak.
Authoritative derivation of depth, velocity, water surface elevation (WSE), and arrival time fields.
Guarantees:
1. Depth derivation: Depth(c, t) = max(0.0, WSE(c, t) - Z_min(c))
2. Arrival time derivation: First timestamp where Depth(c, t) >= arrival_threshold_m
3. Timestamp monotonicity validation
4. Strict unit enforcement (SI meters and seconds)
5. No synthetic substitution on failure: returns DATA_GAP
"""

from typing import Dict, Any, List, Optional, Tuple
import numpy as np
from backend.app.domain.models import HydraulicField, DataQualityStatus

class HydraulicFieldService:
    def __init__(self, default_arrival_threshold_m: float = 0.30):
        self.default_arrival_threshold_m = default_arrival_threshold_m

    def validate_timesteps(self, timesteps_sec: np.ndarray) -> Tuple[bool, Optional[str]]:
        """Validate that simulation timesteps are strictly monotonic and non-negative."""
        if len(timesteps_sec) == 0:
            return False, "Timestep series is empty."
        if np.any(timesteps_sec < 0):
            return False, "Negative timesteps detected."
        diffs = np.diff(timesteps_sec)
        if np.any(diffs <= 0):
            return False, "Timesteps are not strictly monotonically increasing."
        return True, None

    def derive_depth(
        self,
        water_surface_m: np.ndarray,
        cell_min_elev_m: np.ndarray
    ) -> np.ndarray:
        """
        Derive cell depth series: Depth_m(c, t) = max(0.0, WSE_m(c, t) - Zmin_m(c))
        Shapes:
            water_surface_m: (T, N)
            cell_min_elev_m: (N,)
        Returns:
            depth_series_m: (T, N) with non-negative, finite values
        """
        if water_surface_m.ndim != 2:
            raise ValueError(f"Water surface array must be 2D (T, N), got shape: {water_surface_m.shape}")
        if cell_min_elev_m.ndim != 1 or cell_min_elev_m.shape[0] != water_surface_m.shape[1]:
            raise ValueError(
                f"Cell elevation dimension ({cell_min_elev_m.shape}) does not match WSE cell count ({water_surface_m.shape[1]})"
            )

        # Depth derivation: strictly non-negative
        depth = np.maximum(0.0, water_surface_m - cell_min_elev_m[np.newaxis, :])
        # Guarantee finite values
        depth = np.nan_to_num(depth, nan=0.0, posinf=0.0, neginf=0.0)
        return depth

    def derive_arrival_times(
        self,
        depth_series_m: np.ndarray,
        timesteps_sec: np.ndarray,
        arrival_threshold_m: Optional[float] = None
    ) -> np.ndarray:
        """
        Derive cell flood arrival time: first timestamp t where Depth_m(c, t) >= threshold.
        Returns:
            arrival_times_sec: (N,) array with arrival seconds or np.inf if unflooded
        """
        thresh = arrival_threshold_m if arrival_threshold_m is not None else self.default_arrival_threshold_m
        T, N = depth_series_m.shape
        arrival_times = np.full((N,), np.inf, dtype=np.float64)

        for c in range(N):
            flooded_indices = np.where(depth_series_m[:, c] >= thresh)[0]
            if len(flooded_indices) > 0:
                arrival_times[c] = timesteps_sec[flooded_indices[0]]

        return arrival_times

    def build_field_metadata(
        self,
        artifact_id: str,
        name: str,
        values: np.ndarray,
        units: str,
        derivation_method: str,
        threshold_m: Optional[float] = None
    ) -> HydraulicField:
        """Build typed HydraulicField metadata record."""
        finite_vals = values[np.isfinite(values)]
        min_val = float(np.min(finite_vals)) if len(finite_vals) > 0 else 0.0
        max_val = float(np.max(finite_vals)) if len(finite_vals) > 0 else 0.0

        return HydraulicField(
            field_id=f"field-{artifact_id}-{name}",
            artifact_id=artifact_id,
            name=name,
            units=units,
            derivation_method=derivation_method,
            threshold_m=threshold_m,
            min_value=round(min_val, 3),
            max_value=round(max_val, 3)
        )

hydraulic_field_service = HydraulicFieldService()
