import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone

from backend.app.domain.hecras_adapter import HecRasHdfAdapter, DEFAULT_REAL_HECRAS_HDF_PATH
from backend.app.domain.road_hydraulic_mapper import RoadHydraulicMapper
from backend.app.domain.scenario_context import ScenarioContext, resolve_safe_path, load_geojson_feature_dict

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "data"))
STUDY_DIR = os.path.join(DATA_DIR, "study_area")
SCENARIOS_DIR = os.path.join(DATA_DIR, "scenarios")

class Database:
    def __init__(self):
        self.dams: Dict[str, Any] = {}
        self.evacuation_points: Dict[str, Any] = {}
        self.roads: Dict[str, Any] = {}
        self.scenarios: Dict[str, Any] = {}
        self.scenario_contexts: Dict[str, ScenarioContext] = {}
        self.custom_scenarios: Dict[str, Any] = {}
        self.hecras_adapter = HecRasHdfAdapter(default_threshold_m=0.30)
        self.road_mapper = RoadHydraulicMapper(target_crs="EPSG:32644", search_radius_m=150.0)
        self.load_data()

    def load_data(self):
        # 1. Load Global Study Area Dam
        dam_path = os.path.join(STUDY_DIR, "dam.json")
        if os.path.exists(dam_path):
            with open(dam_path, "r", encoding="utf-8") as f:
                dam = json.load(f)
                self.dams[dam["id"]] = dam

        # Add Sayers Dam definition for genuine Bald Eagle scenario
        self.dams["dam-sayers-001"] = {
            "id": "dam-sayers-001",
            "name": "Foster Joseph Sayers Dam",
            "authority": "US Army Corps of Engineers (Baltimore District)",
            "latitude": 41.0456,
            "longitude": -77.6528,
            "river_name": "Bald Eagle Creek",
            "reservoir_name": "Foster Joseph Sayers Reservoir",
            "dam_type": "Earthfill Dam",
            "height_m": 30.5,
            "crest_length_m": 402.0,
            "full_reservoir_level_m": 192.0,
            "max_water_level_m": 200.0,
            "gross_storage_mcm": 122.0,
            "crs": "NAD_1983_StatePlane_Pennsylvania_North_FIPS_3701_Feet",
            "created_at": "2026-09-24T00:00:00Z"
        }

        # 2. Load Global Study Area Evacuation Points (Inheritance Baseline)
        evac_path = os.path.join(STUDY_DIR, "evacuation_points.json")
        if os.path.exists(evac_path):
            with open(evac_path, "r", encoding="utf-8") as f:
                fc = json.load(f)
                self.evacuation_points = {f["properties"]["id"]: f for f in fc["features"]}

        # 3. Load Global Study Area Roads (Inheritance Baseline)
        roads_path = os.path.join(STUDY_DIR, "roads.json")
        if os.path.exists(roads_path):
            with open(roads_path, "r", encoding="utf-8") as f:
                fc = json.load(f)
                self.roads = {f["properties"]["id"]: f for f in fc["features"]}

        # 4. Load Scenarios from data/scenarios/ with Scenario-Scoped GIS support
        if os.path.exists(SCENARIOS_DIR):
            for sc_id in os.listdir(SCENARIOS_DIR):
                sc_path = os.path.join(SCENARIOS_DIR, sc_id)
                manifest_file = os.path.join(sc_path, "manifest.json")
                if os.path.isdir(sc_path) and os.path.exists(manifest_file):
                    try:
                        with open(manifest_file, "r", encoding="utf-8") as f:
                            manifest = json.load(f)
                        
                        artifacts = manifest.get("artifacts", {})
                        geography_cfg = manifest.get("geography", {})
                        geo_mode = geography_cfg.get("mode", "SCENARIO_LOCAL" if ("roads" in artifacts or "evacuation_points" in artifacts) else "INHERIT_STUDY_AREA")
                        
                        is_valid = True
                        val_error = None
                        
                        # Load Roads: Scoped or Inherited
                        sc_roads = {}
                        if "roads" in artifacts:
                            roads_filename = artifacts["roads"].get("file", "roads.json")
                            safe_roads_path = resolve_safe_path(sc_path, roads_filename)
                            if not safe_roads_path:
                                is_valid = False
                                val_error = f"Declared roads artifact '{roads_filename}' missing or inaccessible."
                            else:
                                loaded_roads = load_geojson_feature_dict(safe_roads_path)
                                if loaded_roads is None:
                                    is_valid = False
                                    val_error = f"Roads artifact '{roads_filename}' is invalid GeoJSON."
                                else:
                                    sc_roads = loaded_roads
                        elif geo_mode == "INHERIT_STUDY_AREA":
                            sc_roads = self.roads
                        else:
                            is_valid = False
                            val_error = "Scenario does not specify roads artifact and does not inherit study area."

                        # Load Evacuation Points: Scoped or Inherited
                        sc_points = {}
                        if "evacuation_points" in artifacts:
                            pts_filename = artifacts["evacuation_points"].get("file", "evacuation_points.json")
                            safe_pts_path = resolve_safe_path(sc_path, pts_filename)
                            if not safe_pts_path:
                                is_valid = False
                                val_error = f"Declared evacuation_points artifact '{pts_filename}' missing or inaccessible."
                            else:
                                loaded_pts = load_geojson_feature_dict(safe_pts_path)
                                if loaded_pts is None:
                                    is_valid = False
                                    val_error = f"Evacuation points artifact '{pts_filename}' is invalid GeoJSON."
                                else:
                                    sc_points = loaded_pts
                        elif geo_mode == "INHERIT_STUDY_AREA":
                            sc_points = self.evacuation_points
                        else:
                            is_valid = False
                            val_error = "Scenario does not specify evacuation_points artifact and does not inherit study area."

                        # Load Inundation GeoJSON
                        inundation = {"type": "FeatureCollection", "features": []}
                        inundation_filename = artifacts.get("inundation_extent", {}).get("file", "inundation.geojson")
                        safe_inundation_path = resolve_safe_path(sc_path, inundation_filename)
                        if safe_inundation_path:
                            with open(safe_inundation_path, "r", encoding="utf-8") as f:
                                inundation = json.load(f)

                        # Load Edge Hydraulics
                        edge_hydraulics = {}
                        hyd_filename = artifacts.get("edge_hydraulics", {}).get("file", "edge_hydraulics.json")
                        safe_hyd_path = resolve_safe_path(sc_path, hyd_filename)
                        if safe_hyd_path:
                            with open(safe_hyd_path, "r", encoding="utf-8") as f:
                                edge_hydraulics = json.load(f)

                        source_type = manifest.get("source_type", "SYNTHETIC_TEST_FIXTURE")

                        context = ScenarioContext(
                            scenario_id=sc_id,
                            name=manifest.get("name", sc_id),
                            manifest=manifest,
                            source_type=source_type,
                            roads=sc_roads,
                            evacuation_points=sc_points,
                            inundation=inundation,
                            edge_hydraulics=edge_hydraulics,
                            hydraulic_data=None,
                            crs=manifest.get("simulation", {}).get("crs", "EPSG:4326"),
                            geography_mode=geo_mode,
                            artifacts_provenance=artifacts,
                            is_valid=is_valid,
                            validation_error=val_error
                        )

                        self.scenario_contexts[sc_id] = context
                        self.scenarios[sc_id] = {
                            "manifest": manifest,
                            "inundation": inundation,
                            "edge_hydraulics": edge_hydraulics,
                            "roads": sc_roads,
                            "evacuation_points": sc_points,
                            "source_type": source_type,
                            "is_valid": is_valid,
                            "validation_error": val_error
                        }
                    except Exception as e:
                        print(f"Warning: Failed to load scenario {sc_id}: {e}")

        # 5. Ingest Frozen Gate 3B Tehri 15km HEC-RAS Scenarios
        gate3b_artifacts_dir = os.path.abspath(os.path.join(DATA_DIR, "..", "artifacts", "hecras", "tehri_gate3b"))
        if os.path.exists(gate3b_artifacts_dir):
            tehri_manifest_path = os.path.join(gate3b_artifacts_dir, "manifest.json")
            if os.path.exists(tehri_manifest_path):
                with open(tehri_manifest_path, "r", encoding="utf-8") as f:
                    tehri_manifest_data = json.load(f)
                
                for sc_key, sc_info in tehri_manifest_data.get("scenarios", {}).items():
                    art = sc_info.get("artifact", {})
                    art_file = art.get("filename")
                    art_full_path = os.path.join(gate3b_artifacts_dir, art_file) if art_file else None
                    if art_full_path and os.path.exists(art_full_path):
                        try:
                            hyd_data = self.hecras_adapter.load_scenario(
                                hdf5_path=art_full_path,
                                arrival_threshold_m=0.30,
                                scenario_id=sc_key,
                                scenario_name=f"Tehri 15km {sc_info.get('description', sc_key)}"
                            )
                            # Map roads to hydraulic cells
                            edge_hydraulics = self.road_mapper.map_roads_to_hydraulics(self.roads, hyd_data)

                            manifest_entry = {
                                "scenario_id": sc_key,
                                "name": sc_info.get("description", sc_key),
                                "dam_id": "dam-tehri-001",
                                "dam_name": "Tehri Dam (Bhagirathi River, Uttarakhand)",
                                "source_type": "HECRAS_REAL_RESULT",
                                "breach_parameters": {
                                    "breach_width_m": 100.0,
                                    "breach_formation_min": 60.0,
                                    "breach_elevation_m": 635.0,
                                    "initial_pool_level_m": 830.0,
                                    "peak_discharge_m3s": sc_info.get("parameters", {}).get("q_peak_m3s", 65000.0)
                                },
                                "simulation": {
                                    "duration_min": 120,
                                    "solver": f"{hyd_data.solver} ({hyd_data.solver_version})",
                                    "terrain_source": "Copernicus GLO-30 DSM (Resampled/Conditioned)",
                                    "crs": hyd_data.crs,
                                    "units": hyd_data.native_units,
                                    "status": "READY",
                                    "completed_at": sc_info.get("artifact", {}).get("modified_iso", datetime.now(timezone.utc).isoformat())
                                },
                                "artifacts": {
                                    "hdf5_result": {
                                        "file": art_file,
                                        "sha256": hyd_data.sha256_checksum,
                                        "type": "HECRAS_REAL_RESULT"
                                    }
                                },
                                "scientific_validation": {
                                    "benchmark_test": "Gate 3B 15km Controlled Scientific Scaling",
                                    "validation_status": "VALIDATION_NOT_ESTABLISHED",
                                    "vertical_datum_status": "NOT_ESTABLISHED",
                                    "road_integration_status": "COUPLED_EPSG32644"
                                }
                            }

                            context_entry = ScenarioContext(
                                scenario_id=sc_key,
                                name=manifest_entry["name"],
                                manifest=manifest_entry,
                                source_type="HECRAS_REAL_RESULT",
                                roads=self.roads,
                                evacuation_points=self.evacuation_points,
                                inundation={"type": "FeatureCollection", "features": []},
                                edge_hydraulics=edge_hydraulics,
                                hydraulic_data=hyd_data,
                                crs=hyd_data.crs,
                                geography_mode="INHERIT_STUDY_AREA",
                                artifacts_provenance=manifest_entry["artifacts"],
                                is_valid=True,
                                validation_error=None
                            )
                            self.scenario_contexts[sc_key] = context_entry

                            self.scenarios[sc_key] = {
                                "manifest": manifest_entry,
                                "inundation": {"type": "FeatureCollection", "features": []},
                                "edge_hydraulics": edge_hydraulics,
                                "roads": self.roads,
                                "evacuation_points": self.evacuation_points,
                                "source_type": "HECRAS_REAL_RESULT",
                                "hydraulic_data": hyd_data,
                                "road_integration_status": "COUPLED_EPSG32644",
                                "is_valid": True,
                                "validation_error": None
                            }
                        except Exception as e:
                            print(f"Warning: Failed to load Tehri Gate 3B scenario {sc_key}: {e}")

        # 6. Load optional HEC-RAS 7.0.1 BaldEagle result if REAL_HECRAS_HDF_PATH is set
        real_hecras_path = os.environ.get("REAL_HECRAS_HDF_PATH", DEFAULT_REAL_HECRAS_HDF_PATH)
        if not real_hecras_path:
            print("Info: REAL_HECRAS_HDF_PATH not set — optional BaldEagle scenario skipped.")
        elif os.path.exists(real_hecras_path):

            try:
                hyd_data = self.hecras_adapter.load_scenario(real_hecras_path)

                hecras_manifest = {
                    "scenario_id": hyd_data.scenario_id,
                    "name": hyd_data.name,
                    "dam_id": "dam-sayers-001",
                    "dam_name": "Foster Joseph Sayers Dam (Bald Eagle Creek, PA)",
                    "source_type": "HECRAS_REAL_RESULT",
                    "breach_parameters": {
                        "breach_width_m": 60.96,  # 200 ft breach
                        "breach_formation_min": 120.0,
                        "breach_elevation_m": 182.88,
                        "initial_pool_level_m": 192.0,
                        "peak_discharge_m3s": 2450.0
                    },
                    "simulation": {
                        "duration_min": 4320,  # 72 hours (433 timesteps @ 10-min)
                        "solver": f"{hyd_data.solver} ({hyd_data.solver_version})",
                        "terrain_source": "USACE Bald Eagle Creek LiDAR / DTM 20ft",
                        "crs": hyd_data.crs,
                        "units": hyd_data.native_units,
                        "status": "READY",
                        "completed_at": datetime.now(timezone.utc).isoformat()
                    },
                    "artifacts": {
                        "hdf5_result": {
                            "file": os.path.basename(real_hecras_path),
                            "sha256": hyd_data.sha256_checksum,
                            "type": "HECRAS_REAL_RESULT"
                        }
                    },
                    "scientific_validation": {
                        "benchmark_test": "USACE HEC-RAS 2D Unsteady Output Verification",
                        "validation_status": "VALIDATION_NOT_ESTABLISHED",
                        "road_integration_status": "ROAD_DATA_UNAVAILABLE"
                    }
                }

                be_context = ScenarioContext(
                    scenario_id=hyd_data.scenario_id,
                    name=hecras_manifest["name"],
                    manifest=hecras_manifest,
                    source_type="HECRAS_REAL_RESULT",
                    roads={},
                    evacuation_points={},
                    inundation={"type": "FeatureCollection", "features": []},
                    edge_hydraulics={},
                    hydraulic_data=hyd_data,
                    crs=hyd_data.crs,
                    geography_mode="SCENARIO_LOCAL",
                    artifacts_provenance=hecras_manifest["artifacts"],
                    is_valid=True,
                    validation_error=None
                )
                self.scenario_contexts[hyd_data.scenario_id] = be_context

                # Empty edge hydraulics: enforces geographical boundary guard (no Tehri roads mapped to PA!)
                self.scenarios[hyd_data.scenario_id] = {
                    "manifest": hecras_manifest,
                    "inundation": {"type": "FeatureCollection", "features": []},
                    "edge_hydraulics": {},
                    "roads": {},
                    "evacuation_points": {},
                    "source_type": "HECRAS_REAL_RESULT",
                    "hydraulic_data": hyd_data,
                    "road_integration_status": "ROAD_DATA_UNAVAILABLE",
                    "is_valid": True,
                    "validation_error": None
                }
            except Exception as e:
                print(f"Warning: Failed to load genuine HEC-RAS HDF5 artifact: {e}")

    def get_dam(self, dam_id: str) -> Optional[Dict[str, Any]]:
        return self.dams.get(dam_id)

    def list_scenarios(self) -> List[Dict[str, Any]]:
        all_scens = []
        for sc_id, data in {**self.scenarios, **self.custom_scenarios}.items():
            m = data["manifest"]
            source_type = data.get("source_type", "SYNTHETIC_TEST_FIXTURE")
            
            # Categorize scenarios
            if sc_id in ["SCENARIO_CENTRAL", "SCENARIO_MINIMUM", "SCENARIO_MAXIMUM"]:
                cat = "AUTHORITATIVE"
                order_rank = 0 if sc_id == "SCENARIO_CENTRAL" else (1 if sc_id == "SCENARIO_MINIMUM" else 2)
            elif source_type == "HECRAS_REAL_RESULT":
                cat = "RESEARCH_HECRAS"
                order_rank = 10
            else:
                cat = "DEMONSTRATION"
                order_rank = 20

            all_scens.append({
                "id": m["scenario_id"],
                "dam_id": m["dam_id"],
                "dam_name": m["dam_name"],
                "name": m["name"],
                "source_type": source_type,
                "category": cat,
                "_order_rank": order_rank,
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
        
        # Sort by order rank then peak discharge descending
        all_scens.sort(key=lambda s: (s["_order_rank"], -s["peak_discharge_m3s"]))
        # Remove internal order rank before returning
        for s in all_scens:
            s.pop("_order_rank", None)
            
        return all_scens

    def get_scenario(self, scenario_id: str) -> Optional[Dict[str, Any]]:
        if scenario_id in self.scenarios:
            return self.scenarios[scenario_id]
        if scenario_id in self.custom_scenarios:
            return self.custom_scenarios[scenario_id]
        return None

    def get_scenario_context(self, scenario_id: str) -> Optional[ScenarioContext]:
        if scenario_id in self.scenario_contexts:
            return self.scenario_contexts[scenario_id]
        if scenario_id in self.custom_scenarios:
            cs = self.custom_scenarios[scenario_id]
            return ScenarioContext(
                scenario_id=scenario_id,
                name=cs["manifest"]["name"],
                manifest=cs["manifest"],
                source_type=cs.get("source_type", "CUSTOM_SIMULATION"),
                roads=cs.get("roads", self.roads),
                evacuation_points=cs.get("evacuation_points", self.evacuation_points),
                inundation=cs.get("inundation", {"type": "FeatureCollection", "features": []}),
                edge_hydraulics=cs.get("edge_hydraulics", {}),
                hydraulic_data=None,
                crs=cs["manifest"].get("simulation", {}).get("crs", "EPSG:32644"),
                geography_mode="INHERIT_STUDY_AREA",
                artifacts_provenance=cs["manifest"].get("artifacts", {}),
                is_valid=True,
                validation_error=None
            )
        return None

db = Database()
