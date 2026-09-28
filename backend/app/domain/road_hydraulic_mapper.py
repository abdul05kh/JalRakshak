from typing import Dict, Any, List, Optional
import numpy as np
from scipy.spatial import KDTree
from shapely.geometry import LineString, Point
from backend.app.domain.hecras_adapter import HydraulicScenarioData
from backend.app.domain.geo_transform import geo_transformer
from backend.app.core.operational_config import operational_config

class RoadHydraulicMapper:
    """
    Scientifically defensible spatial mapper connecting vector road geometries to 2D hydraulic cells.
    Uses geometry densification and strict corridor buffering configured via operational.yaml.
    """
    def __init__(
        self,
        target_crs: str = "EPSG:32644",
        search_radius_m: Optional[float] = None,
        sample_spacing_m: Optional[float] = None
    ):
        self.target_crs = target_crs
        self.search_radius_m = search_radius_m if search_radius_m is not None else operational_config.coupling_corridor_m
        self.sample_spacing_m = sample_spacing_m if sample_spacing_m is not None else operational_config.coupling_densification_m

    def map_roads_to_hydraulics(
        self,
        roads_dict: Dict[str, Any],
        hydraulic_data: HydraulicScenarioData
    ) -> Dict[str, Dict[str, Any]]:
        """
        For each road segment in roads_dict:
        1. Project road coordinates to target CRS.
        2. Densify LineString at <= sample_spacing_m.
        3. Query KDTree for candidate hydraulic cell centers within search_radius_m.
        4. Verify exact geometric distance to LineString.
        5. Assign conservative arrival time A_i = min_{c} A(c), max depth h_i, and velocity from HEC-RAS.
        """
        tree = KDTree(hydraulic_data.cell_coords)
        edge_hydraulics = {}

        for road_id, feat in roads_dict.items():
            coords = feat["geometry"]["coordinates"]
            proj_pts = [geo_transformer.wgs84_to_utm(pt[0], pt[1]) for pt in coords]
            line = LineString(proj_pts)

            # Densify LineString every sample_spacing_m
            num_samples = max(2, int(line.length / self.sample_spacing_m) + 1)
            sample_dists = np.linspace(0, line.length, num_samples)
            sample_coords = [line.interpolate(d).coords[0] for d in sample_dists]

            # Query candidate cells around all densified samples
            candidate_indices = set()
            for sc in sample_coords:
                indices = tree.query_ball_point(sc, r=self.search_radius_m)
                candidate_indices.update(indices)

            # Filter candidate cells by exact geometric distance to the LineString
            coupled_cell_indices = []
            for c_idx in candidate_indices:
                cell_pt = Point(hydraulic_data.cell_coords[c_idx][0], hydraulic_data.cell_coords[c_idx][1])
                if line.distance(cell_pt) <= self.search_radius_m:
                    coupled_cell_indices.append(c_idx)

            if not coupled_cell_indices:
                # Outside flooded mesh / unaffected high ground
                edge_hydraulics[road_id] = {
                    "arrival_s": 99999,
                    "max_depth_m": 0.0,
                    "max_vel_mps": 0.0,
                    "inundated": False,
                    "status": "HIGH_GROUND_UNAFFECTED",
                    "provenance": {
                        "source": hydraulic_data.source_type,
                        "solver": hydraulic_data.solver_version,
                        "artifact_sha256": hydraulic_data.sha256_checksum,
                        "coupling_buffer_m": self.search_radius_m,
                        "coupled_cells_count": 0
                    }
                }
            else:
                cell_idxs = np.array(coupled_cell_indices)
                arrivals = hydraulic_data.cell_arrival_times_sec[cell_idxs]
                finite_arrivals = arrivals[np.isfinite(arrivals)]

                if len(finite_arrivals) > 0:
                    min_arrival_s = int(np.min(finite_arrivals))
                    max_depth_val = float(np.max(hydraulic_data.depth_series[:, cell_idxs]))
                    
                    # Derive velocity from native face/cell velocity if available, else derive from shallow water celerity
                    if hydraulic_data.face_velocity_native is not None and len(hydraulic_data.face_velocity_native) > 0:
                        vel_sample = hydraulic_data.face_velocity_native
                        max_vel_val = float(np.max(vel_sample[:, cell_idxs])) if vel_sample.ndim > 1 else float(np.max(vel_sample[cell_idxs]))
                    else:
                        # Shallow water approximation v_front = sqrt(g * h) for positive depths
                        g = 9.80665
                        max_vel_val = float(np.sqrt(g * max(0.0, max_depth_val)))
                    inundated = True
                else:
                    min_arrival_s = 99999
                    max_depth_val = 0.0
                    max_vel_val = 0.0
                    inundated = False

                edge_hydraulics[road_id] = {
                    "arrival_s": min_arrival_s,
                    "max_depth_m": round(max_depth_val, 2),
                    "max_vel_mps": round(max_vel_val, 2),
                    "inundated": inundated,
                    "status": "MAPPED_TO_HECRAS",
                    "provenance": {
                        "source": hydraulic_data.source_type,
                        "solver": hydraulic_data.solver_version,
                        "artifact_sha256": hydraulic_data.sha256_checksum,
                        "coupling_buffer_m": self.search_radius_m,
                        "coupled_cells_count": len(coupled_cell_indices)
                    }
                }

        return edge_hydraulics

    def generate_inundation_geojson(
        self,
        hydraulic_data: HydraulicScenarioData,
        min_depth_threshold_m: float = 0.30,
        cell_half_size_m: float = 37.5
    ) -> Dict[str, Any]:
        """
        Constructs high-fidelity 2D/3D polygonal mesh GeoJSON representing inundated HEC-RAS cells.
        Each feature carries depth_m, arrival_s, arrival_min, wse_m, and bed_elevation_m.
        """
        max_depths = np.max(hydraulic_data.depth_series_m, axis=0) if hasattr(hydraulic_data, "depth_series_m") else []
        flooded_indices = np.where(max_depths >= min_depth_threshold_m)[0] if len(max_depths) > 0 else []

        features = []
        for idx in flooded_indices:
            cx, cy = hydraulic_data.cell_coords[idx]
            max_d = float(max_depths[idx])
            arr_s = float(hydraulic_data.cell_arrival_times_sec[idx])
            arr_min = round(arr_s / 60.0, 1) if np.isfinite(arr_s) else 999.0
            wse = float(np.max(hydraulic_data.water_surface_m[:, idx])) if hasattr(hydraulic_data, "water_surface_m") else 0.0
            bed_elev = float(hydraulic_data.cell_min_elev_m[idx]) if hasattr(hydraulic_data, "cell_min_elev_m") else 0.0

            # 4 vertices in UTM coordinates converted to WGS84 [lon, lat]
            c1 = list(geo_transformer.utm_to_wgs84(cx - cell_half_size_m, cy - cell_half_size_m))
            c2 = list(geo_transformer.utm_to_wgs84(cx + cell_half_size_m, cy - cell_half_size_m))
            c3 = list(geo_transformer.utm_to_wgs84(cx + cell_half_size_m, cy + cell_half_size_m))
            c4 = list(geo_transformer.utm_to_wgs84(cx - cell_half_size_m, cy + cell_half_size_m))

            poly_coords = [[c1, c2, c3, c4, c1]]
            features.append({
                "type": "Feature",
                "properties": {
                    "scenario_id": hydraulic_data.scenario_id,
                    "cell_id": f"HEC-CELL-{idx + 1}",
                    "max_depth_m": round(max_d, 2),
                    "depth_m": round(max_d, 2),
                    "arrival_s": round(arr_s, 1),
                    "arrival_min": arr_min,
                    "wse_m": round(wse, 2),
                    "bed_elevation_m": round(bed_elev, 2),
                    "inundated": True
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": poly_coords
                }
            })

        return {
            "type": "FeatureCollection",
            "features": features
        }


