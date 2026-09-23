import os
import json
from typing import Dict, List, Any, Optional

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "data"))
STUDY_DIR = os.path.join(DATA_DIR, "study_area")
SCENARIOS_DIR = os.path.join(DATA_DIR, "scenarios")

class Database:
    def __init__(self):
        self.dams: Dict[str, Any] = {}
        self.evacuation_points: Dict[str, Any] = {}
        self.roads: Dict[str, Any] = {}
        self.scenarios: Dict[str, Any] = {}
        self.custom_scenarios: Dict[str, Any] = {}
        self.load_data()

    def load_data(self):
        # 1. Load Dam
        dam_path = os.path.join(STUDY_DIR, "dam.json")
        if os.path.exists(dam_path):
            with open(dam_path, "r", encoding="utf-8") as f:
                dam = json.load(f)
                self.dams[dam["id"]] = dam

        # 2. Load Evacuation Points
        evac_path = os.path.join(STUDY_DIR, "evacuation_points.json")
        if os.path.exists(evac_path):
            with open(evac_path, "r", encoding="utf-8") as f:
                fc = json.load(f)
                self.evacuation_points = {f["properties"]["id"]: f for f in fc["features"]}

        # 3. Load Roads
        roads_path = os.path.join(STUDY_DIR, "roads.json")
        if os.path.exists(roads_path):
            with open(roads_path, "r", encoding="utf-8") as f:
                fc = json.load(f)
                self.roads = {f["properties"]["id"]: f for f in fc["features"]}

        # 4. Load Scenarios
        if os.path.exists(SCENARIOS_DIR):
            for sc_id in os.listdir(SCENARIOS_DIR):
                sc_path = os.path.join(SCENARIOS_DIR, sc_id)
                manifest_file = os.path.join(sc_path, "manifest.json")
                if os.path.isdir(sc_path) and os.path.exists(manifest_file):
                    with open(manifest_file, "r", encoding="utf-8") as f:
                        manifest = json.load(f)
                    
                    inundation_file = os.path.join(sc_path, "inundation.geojson")
                    with open(inundation_file, "r", encoding="utf-8") as f:
                        inundation = json.load(f)
                        
                    edge_hyd_file = os.path.join(sc_path, "edge_hydraulics.json")
                    with open(edge_hyd_file, "r", encoding="utf-8") as f:
                        edge_hydraulics = json.load(f)

                    self.scenarios[sc_id] = {
                        "manifest": manifest,
                        "inundation": inundation,
                        "edge_hydraulics": edge_hydraulics
                    }

    def get_dam(self, dam_id: str) -> Optional[Dict[str, Any]]:
        return self.dams.get(dam_id)

    def list_scenarios(self) -> List[Dict[str, Any]]:
        all_scens = []
        for sc_id, data in {**self.scenarios, **self.custom_scenarios}.items():
            m = data["manifest"]
            all_scens.append({
                "id": m["scenario_id"],
                "dam_id": m["dam_id"],
                "dam_name": m["dam_name"],
                "name": m["name"],
                "status": m["simulation"]["status"],
                "breach_width_m": m["breach_parameters"]["breach_width_m"],
                "breach_formation_min": m["breach_parameters"]["breach_formation_min"],
                "breach_elevation_m": m["breach_parameters"]["breach_elevation_m"],
                "duration_min": m["simulation"]["duration_min"],
                "peak_discharge_m3s": m["breach_parameters"]["peak_discharge_m3s"],
                "solver": m["simulation"]["solver"],
                "terrain": m["simulation"]["terrain_source"],
                "crs": m["simulation"]["crs"],
                "created_at": m["simulation"]["completed_at"]
            })
        return all_scens

    def get_scenario(self, scenario_id: str) -> Optional[Dict[str, Any]]:
        if scenario_id in self.scenarios:
            return self.scenarios[scenario_id]
        if scenario_id in self.custom_scenarios:
            return self.custom_scenarios[scenario_id]
        return None

db = Database()
