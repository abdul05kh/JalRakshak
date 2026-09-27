"""operational_config.py — Centralized Configuration Loader for JalRakshak
Loads and parses operational configuration with fallback defaults, ensuring explicit provenance and units.
"""
import os
import json
from typing import Dict, Any

YAML_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "config", "operational.yaml"))
JSON_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "config", "operational.json"))

DEFAULT_CONFIG: Dict[str, Any] = {
    "version": "1.0.0",
    "crs": "EPSG:32644 (UTM Zone 44N)",
    "hydraulic": {
        "arrival_depth_threshold_m": {"value": 0.30, "unit": "meters", "status": "CONFIGURED ASSUMPTION"},
        "velocity_threshold_mps": {"value": 1.00, "unit": "meters_per_second", "status": "CONFIGURED ASSUMPTION"}
    },
    "road_coupling": {
        "corridor_m": {"value": 150.0, "unit": "meters", "status": "CONFIGURED ASSUMPTION"},
        "densification_m": {"value": 50.0, "unit": "meters", "status": "CONFIGURED ASSUMPTION"},
        "aggregation_method": {"value": "MIN_ARRIVAL_MAX_DEPTH", "unit": "enumeration", "status": "CONFIGURED ASSUMPTION"}
    },
    "evacuation": {
        "default_safety_buffer_min": {"value": 3.0, "unit": "minutes", "status": "CONFIGURED ASSUMPTION"},
        "max_allowable_buffer_min": {"value": 60.0, "unit": "minutes", "status": "CONFIGURED ASSUMPTION"}
    },
    "travel_time": {
        "model": {"value": "STATIC_ENGINEERING_ASSUMPTION", "unit": "string", "status": "CONFIGURED ASSUMPTION"},
        "speed_policy_kmh": {
            "PRIMARY": {"value": 45.0, "unit": "km/h", "status": "CONFIGURED ASSUMPTION"},
            "SECONDARY": {"value": 35.0, "unit": "km/h", "status": "CONFIGURED ASSUMPTION"},
            "MOUNTAIN_TRACK": {"value": 20.0, "unit": "km/h", "status": "CONFIGURED ASSUMPTION"}
        }
    },
    "terrain": {
        "source": {"value": "Copernicus GLO-30 DSM (30m Grid)", "status": "AUTHORITATIVE OBSERVATIONAL DATA"},
        "vertical_datum_status": {"value": "UNVALIDATED_RAW_ELLIPSOIDAL_OR_EGM96", "status": "DISCLOSED UNCERTAINTY"}
    }
}

class OperationalConfig:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(OperationalConfig, cls).__new__(cls)
            cls._instance._load()
        return cls._instance

    def _load(self):
        self.data = DEFAULT_CONFIG
        if os.path.exists(JSON_PATH):
            try:
                with open(JSON_PATH, "r", encoding="utf-8") as f:
                    self.data = json.load(f)
                    return
            except Exception:
                pass

        if os.path.exists(YAML_PATH):
            try:
                import yaml
                with open(YAML_PATH, "r", encoding="utf-8") as f:
                    loaded = yaml.safe_load(f)
                    if loaded:
                        self.data = loaded
            except Exception:
                pass

    @property
    def arrival_depth_threshold_m(self) -> float:
        return float(self.data.get("hydraulic", {}).get("arrival_depth_threshold_m", {}).get("value", 0.30))

    @property
    def velocity_threshold_mps(self) -> float:
        return float(self.data.get("hydraulic", {}).get("velocity_threshold_mps", {}).get("value", 1.00))

    @property
    def coupling_corridor_m(self) -> float:
        return float(self.data.get("road_coupling", {}).get("corridor_m", {}).get("value", 150.0))

    @property
    def coupling_densification_m(self) -> float:
        return float(self.data.get("road_coupling", {}).get("densification_m", {}).get("value", 50.0))

    @property
    def default_safety_buffer_min(self) -> float:
        return float(self.data.get("evacuation", {}).get("default_safety_buffer_min", {}).get("value", 3.0))

    @property
    def travel_time_model(self) -> str:
        return str(self.data.get("travel_time", {}).get("model", {}).get("value", "STATIC_ENGINEERING_ASSUMPTION"))

operational_config = OperationalConfig()
