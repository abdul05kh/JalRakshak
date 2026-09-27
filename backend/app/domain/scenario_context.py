"""
scenario_context.py
Generic Scenario Context abstraction for JalRakshak.
Encapsulates scenario metadata, GIS datasets (roads, evacuation points),
hydraulic state, CRS, and provenance with strict per-scenario isolation.
"""

import os
import json
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, field


@dataclass(frozen=True)
class ScenarioContext:
    scenario_id: str
    name: str
    manifest: Dict[str, Any]
    source_type: str
    roads: Dict[str, Any]  # road_id -> GeoJSON Feature
    evacuation_points: Dict[str, Any]  # point_id -> GeoJSON Feature
    inundation: Dict[str, Any]  # GeoJSON FeatureCollection
    edge_hydraulics: Dict[str, Any]  # edge_id -> {arrival_s, max_depth_m, max_vel_mps, inundated}
    hydraulic_data: Optional[Any] = None
    crs: str = "EPSG:32644"
    geography_mode: str = "SCENARIO_LOCAL"  # SCENARIO_LOCAL | INHERIT_STUDY_AREA
    artifacts_provenance: Dict[str, Any] = field(default_factory=dict)
    is_valid: bool = True
    validation_error: Optional[str] = None


def resolve_safe_path(base_dir: str, filename: str) -> Optional[str]:
    """
    Safely resolves a filename relative to base_dir preventing path traversal.
    Returns absolute path if within base_dir and exists, else None.
    """
    if not filename or ".." in filename:
        return None
    abs_base = os.path.abspath(base_dir)
    target = os.path.abspath(os.path.join(abs_base, filename))
    if not (target.startswith(abs_base + os.sep) or target == abs_base):
        return None
    return target if os.path.exists(target) else None


def load_geojson_feature_dict(filepath: str, id_property_fallback: str = "id") -> Optional[Dict[str, Any]]:
    """
    Loads a GeoJSON FeatureCollection and returns a dictionary of features keyed by feature ID.
    Validates GeoJSON structure.
    """
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        if not isinstance(data, dict) or data.get("type") != "FeatureCollection":
            return None
        features = data.get("features", [])
        result = {}
        for feat in features:
            if not isinstance(feat, dict) or "geometry" not in feat or "properties" not in feat:
                continue
            feat_id = feat.get("id") or feat.get("properties", {}).get("id")
            if feat_id:
                result[str(feat_id)] = feat
        return result
    except Exception:
        return None
