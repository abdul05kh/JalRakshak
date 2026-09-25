import os
import hashlib
from abc import ABC, abstractmethod
from typing import Dict, Any, Tuple, List, Optional
from datetime import datetime, timezone
import numpy as np
import h5py

DEFAULT_REAL_HECRAS_HDF_PATH = os.environ.get(
    "REAL_HECRAS_HDF_PATH",
    r"C:\HEC_Work\BaldEagleCrkMulti2D\BaldEagleDamBrk.p05.hdf"
)

class HydraulicScenarioData:
    def __init__(
        self,
        scenario_id: str,
        name: str,
        source_type: str,
        solver: str,
        solver_version: str,
        crs: str,
        native_units: str,
        derived_units: str,
        is_us_customary: bool,
        unit_scale_to_m: float,
        flow_area_name: str,
        cell_coords: np.ndarray,
        cell_min_elev_native: np.ndarray,
        cell_min_elev_m: np.ndarray,
        timesteps_sec: np.ndarray,
        time_date_stamps: List[str],
        water_surface_native: np.ndarray,
        water_surface_m: np.ndarray,
        face_velocity_native: Optional[np.ndarray],
        depth_series_m: np.ndarray,
        cell_arrival_times_sec: np.ndarray,
        arrival_threshold_m: float,
        sha256_checksum: str,
        file_path: str,
        validation_status: str = "VALIDATION_NOT_ESTABLISHED",
        road_integration_status: str = "ROAD_DATA_UNAVAILABLE"
    ):
        self.scenario_id = scenario_id
        self.name = name
        self.source_type = source_type
        self.solver = solver
        self.solver_version = solver_version
        self.crs = crs
        self.native_units = native_units
        self.derived_units = derived_units
        self.is_us_customary = is_us_customary
        self.unit_scale_to_m = unit_scale_to_m
        self.flow_area_name = flow_area_name
        self.cell_coords = cell_coords
        self.cell_min_elev_native = cell_min_elev_native
        self.cell_min_elev_m = cell_min_elev_m
        self.timesteps_sec = timesteps_sec
        self.time_date_stamps = time_date_stamps
        self.water_surface_native = water_surface_native
        self.water_surface_m = water_surface_m
        self.face_velocity_native = face_velocity_native
        self.depth_series_m = depth_series_m
        self.cell_arrival_times_sec = cell_arrival_times_sec
        self.arrival_threshold_m = arrival_threshold_m
        self.sha256_checksum = sha256_checksum
        self.file_path = file_path
        self.validation_status = validation_status
        self.road_integration_status = road_integration_status

    @property
    def depth_series(self) -> np.ndarray:
        return self.depth_series_m

    @property
    def cell_min_elev(self) -> np.ndarray:
        return self.cell_min_elev_m

    @property
    def water_surface(self) -> np.ndarray:
        return self.water_surface_native

    @property
    def units(self) -> str:
        return self.derived_units

class HydraulicSolver(ABC):
    @abstractmethod
    def validate_inputs(self, scenario_config: Dict[str, Any]) -> Tuple[bool, str]:
        pass

    @abstractmethod
    def run(self, scenario_config: Dict[str, Any]) -> Dict[str, Any]:
        pass

class SyntheticAdapter(HydraulicSolver):
    """Adapter for synthetic test fixture scenarios (preserved for regression testing)."""
    def __init__(self, solver_version: str = "Synthetic Test Fixture v1.0"):
        self.solver_version = solver_version

    def validate_inputs(self, scenario_config: Dict[str, Any]) -> Tuple[bool, str]:
        breach = scenario_config.get("breach", {})
        if breach.get("width_m", 0) <= 0:
            return False, "Breach width must be strictly greater than 0 meters."
        if breach.get("formation_time_min", 0) <= 0:
            return False, "Breach formation time must be strictly greater than 0 minutes."
        if scenario_config.get("duration_min", 0) <= 0:
            return False, "Simulation duration must be strictly greater than 0 minutes."
        return True, "Valid scenario configuration."

    def run(self, scenario_config: Dict[str, Any]) -> Dict[str, Any]:
        breach = scenario_config["breach"]
        w = breach["width_m"]
        t_form = breach["formation_time_min"]
        scale_q = (w / 50.0) * (15.0 / t_form)**0.3
        peak_q = round(28400.0 * scale_q, 1)
        return {
            "status": "READY",
            "peak_discharge_m3s": peak_q,
            "source_type": "SYNTHETIC_TEST_FIXTURE",
            "solver_version": self.solver_version,
            "completed_at": datetime.now(timezone.utc).isoformat()
        }

class HecRasHdfAdapter:
    """
    Read-only parser and adapter for USACE HEC-RAS 2D Unsteady Flow HDF5 results (*.p##.hdf).
    Guarantees:
    1. Read-only access (mode='r'). Never modifies the source artifact.
    2. Explicit unit detection and conversion (US Customary feet -> SI meters).
    3. Derives Depth: Depth_m(c,t) = max(0, WSE_m(c,t) - Zmin_m(c)), tagged DERIVED_FROM_HECRAS.
    4. Derives Arrival Time based on configurable Flood Arrival Threshold.
    5. Exposes complete provenance without claiming unverified hydraulic calibration.
    """
    def __init__(self, default_threshold_m: float = 0.30):
        self.default_threshold_m = default_threshold_m

    def compute_sha256(self, file_path: str) -> str:
        """Compute SHA-256 checksum in chunks without modifying file."""
        hasher = hashlib.sha256()
        with open(file_path, "rb") as f:
            while chunk := f.read(8192 * 1024):
                hasher.update(chunk)
        return hasher.hexdigest()

    def load_scenario(
        self,
        hdf5_path: str = DEFAULT_REAL_HECRAS_HDF_PATH,
        arrival_threshold_m: Optional[float] = None,
        scenario_id: Optional[str] = None,
        scenario_name: Optional[str] = None
    ) -> HydraulicScenarioData:
        if not os.path.exists(hdf5_path):
            raise FileNotFoundError(f"HEC-RAS HDF5 artifact not found at: {hdf5_path}")

        threshold = arrival_threshold_m if arrival_threshold_m is not None else self.default_threshold_m

        # Compute SHA-256 Checksum for Artifact Integrity
        sha256 = self.compute_sha256(hdf5_path)

        # Open strictly in read-only mode ('r')
        with h5py.File(hdf5_path, "r") as hdf:
            # 1. Root Metadata & Unit Detection
            raw_crs = hdf.attrs.get("Projection", b"")
            crs = raw_crs.decode("utf-8") if isinstance(raw_crs, bytes) else str(raw_crs)

            raw_units = hdf.attrs.get("Units System", b"")
            native_units = raw_units.decode("utf-8") if isinstance(raw_units, bytes) else str(raw_units)

            raw_version = hdf.attrs.get("File Version", hdf.attrs.get("HEC-RAS Version", b"HEC-RAS 7.0.1"))
            solver_version = raw_version.decode("utf-8") if isinstance(raw_version, bytes) else str(raw_version)

            # Determine if US Customary units (feet) apply
            is_us_customary = (
                "US Customary" in native_units
                or "Foot" in crs
                or "feet" in native_units.lower()
                or "Foot_US" in crs
            )
            unit_scale_to_m = 0.3048 if is_us_customary else 1.0

            # 2. Geometry Group Validation
            if "Geometry/2D Flow Areas" not in hdf:
                raise KeyError("HDF5 missing required group: Geometry/2D Flow Areas")

            flow_areas_grp = hdf["Geometry/2D Flow Areas"]
            flow_area_names = [k for k in flow_areas_grp.keys() if isinstance(flow_areas_grp[k], h5py.Group)]
            if not flow_area_names:
                raise ValueError("No 2D Flow Areas groups found in HEC-RAS Geometry group.")

            area_name = flow_area_names[0]
            area_geom_grp = flow_areas_grp[area_name]

            if "Cells Center Coordinate" not in area_geom_grp:
                raise KeyError(f"Missing dataset: Cells Center Coordinate in {area_name}")
            if "Cells Minimum Elevation" not in area_geom_grp:
                raise KeyError(f"Missing dataset: Cells Minimum Elevation in {area_name}")

            cell_coords = np.array(area_geom_grp["Cells Center Coordinate"], dtype=np.float64)
            cell_min_elev_native = np.array(area_geom_grp["Cells Minimum Elevation"], dtype=np.float32)
            num_cells = len(cell_coords)

            if len(cell_min_elev_native) != num_cells:
                raise ValueError(
                    f"Dimension mismatch: cell coordinates ({num_cells}) != cell elevations ({len(cell_min_elev_native)})"
                )

            # Convert elevation to meters
            cell_min_elev_m = cell_min_elev_native * unit_scale_to_m

            # 3. Unsteady Time Series Group Validation
            time_series_path = "Results/Unsteady/Output/Output Blocks/Base Output/Unsteady Time Series"
            if time_series_path not in hdf:
                raise KeyError(f"Missing required time series group: {time_series_path}")

            ts_grp = hdf[time_series_path]
            time_days = np.array(ts_grp["Time"], dtype=np.float64)
            timesteps_sec = time_days * 86400.0
            num_timesteps = len(timesteps_sec)

            raw_timestamps = ts_grp["Time Date Stamp"][:]
            time_date_stamps = [t.decode("ascii") if isinstance(t, bytes) else str(t) for t in raw_timestamps]

            if len(time_date_stamps) != num_timesteps:
                raise ValueError(
                    f"Dimension mismatch: timestamps ({len(time_date_stamps)}) != time steps ({num_timesteps})"
                )

            flow_res_base = f"{time_series_path}/2D Flow Areas"
            if flow_res_base not in hdf:
                raise KeyError(f"Missing 2D Flow Areas results container: {flow_res_base}")

            res_flow_grp_container = hdf[flow_res_base]
            res_area_names = [k for k in res_flow_grp_container.keys() if isinstance(res_flow_grp_container[k], h5py.Group)]
            if not res_area_names:
                raise ValueError("No 2D Flow Area result groups found in time series results.")

            res_area_name = area_name if area_name in res_flow_grp_container else res_area_names[0]
            flow_res_grp = res_flow_grp_container[res_area_name]
            if "Water Surface" not in flow_res_grp:
                raise KeyError(f"Missing Water Surface dataset in HEC-RAS results for {res_area_name}.")

            water_surface_native = np.array(flow_res_grp["Water Surface"], dtype=np.float32)

            if water_surface_native.shape != (num_timesteps, num_cells):
                raise ValueError(
                    f"Water Surface shape {water_surface_native.shape} does not match expected ({num_timesteps}, {num_cells})"
                )

            face_vel_native = (
                np.array(flow_res_grp["Face Velocity"], dtype=np.float32)
                if "Face Velocity" in flow_res_grp
                else None
            )

        # 4. Convert WSE to meters and Derive Depth in meters
        water_surface_m = water_surface_native * unit_scale_to_m

        # Depth(c, t) = max(0.0, WSE(c, t) - Zmin(c)) * unit_scale_to_m
        # Shape: (T, N)
        native_depth = np.maximum(0.0, water_surface_native - cell_min_elev_native[np.newaxis, :])
        depth_series_m = native_depth * unit_scale_to_m

        # Handle any NaN/Inf entries safely
        depth_series_m = np.nan_to_num(depth_series_m, nan=0.0, posinf=0.0, neginf=0.0)

        # 5. Derive Arrival Time for each cell: First t where Depth_m(c, t) >= threshold
        T_steps, N_c = depth_series_m.shape
        arrival_times_sec = np.full((N_c,), np.inf, dtype=np.float64)

        for c_idx in range(N_c):
            indices = np.where(depth_series_m[:, c_idx] >= threshold)[0]
            if len(indices) > 0:
                first_idx = indices[0]
                arrival_times_sec[c_idx] = timesteps_sec[first_idx]

        # Determine Scenario ID & Display Name
        sc_id = scenario_id or ("scen-baldeagle-hecras-real-001" if "BaldEagle" in hdf5_path else "scen-hecras-real-001")
        sc_name = scenario_name or (
            f"Bald Eagle Creek Dam-Break (HEC-RAS 7.0.1 Genuine Result)"
            if "BaldEagle" in hdf5_path
            else "HEC-RAS 2D Genuine Simulation Result"
        )

        return HydraulicScenarioData(
            scenario_id=sc_id,
            name=sc_name,
            source_type="HECRAS_REAL_RESULT",
            solver="USACE HEC-RAS 2D Hydrodynamic Engine",
            solver_version=solver_version,
            crs=crs,
            native_units=native_units,
            derived_units="meters",
            is_us_customary=is_us_customary,
            unit_scale_to_m=unit_scale_to_m,
            flow_area_name=area_name,
            cell_coords=cell_coords,
            cell_min_elev_native=cell_min_elev_native,
            cell_min_elev_m=cell_min_elev_m,
            timesteps_sec=timesteps_sec,
            time_date_stamps=time_date_stamps,
            water_surface_native=water_surface_native,
            water_surface_m=water_surface_m,
            face_velocity_native=face_vel_native,
            depth_series_m=depth_series_m,
            cell_arrival_times_sec=arrival_times_sec,
            arrival_threshold_m=threshold,
            sha256_checksum=sha256,
            file_path=hdf5_path,
            validation_status="VALIDATION_NOT_ESTABLISHED",
            road_integration_status="ROAD_DATA_UNAVAILABLE"
        )
