import os
import json
from backend.app.domain.database import db

out_dir = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "data")
os.makedirs(out_dir, exist_ok=True)

# 1. Scenarios
scenarios_summary = db.list_scenarios()
with open(os.path.join(out_dir, "scenarios.json"), "w", encoding="utf-8") as f:
    json.dump(scenarios_summary, f, indent=2)

# 2. Dam
dam = db.get_dam("dam-tehri-001")
with open(os.path.join(out_dir, "dam.json"), "w", encoding="utf-8") as f:
    json.dump(dam, f, indent=2)

# 3. Layers for all scenarios
for sc_id in ["SCENARIO_CENTRAL", "SCENARIO_MINIMUM", "SCENARIO_MAXIMUM"]:
    ctx = db.get_scenario_context(sc_id)
    if ctx:
        cell_count = len(ctx.inundation.get("features", []))
        layers = {
            "scenario_id": sc_id,
            "source_type": ctx.source_type,
            "geography_mode": ctx.geography_mode,
            "inundation_geojson": ctx.inundation,
            "roads_geojson": {"type": "FeatureCollection", "features": list(ctx.roads.values())},
            "evacuation_points_geojson": {"type": "FeatureCollection", "features": list(ctx.evacuation_points.values())},
            "dam": dam
        }
        with open(os.path.join(out_dir, f"layers_{sc_id}.json"), "w", encoding="utf-8") as f:
            json.dump(layers, f)
        print(f"Exported layers_{sc_id}.json with {cell_count} cells")

# 4. Timeline data for each scenario
timesteps = [0, 15, 30, 45, 60, 75, 90, 105, 120]
for sc_id in ["SCENARIO_CENTRAL", "SCENARIO_MINIMUM", "SCENARIO_MAXIMUM"]:
    timeline = {
        "scenario_id": sc_id,
        "timesteps": [
            {
                "timestep_min": t,
                "label": f"T+{t:02d}:00",
                "elapsed_seconds": t * 60,
                "description": f"HEC-RAS STATE T+{t:02d}:00: Flood wave propagating along Bhagirathi canyon.",
                "wavefront_progress_fraction": min(1.0, t / 120.0),
                "affected_roads": ["R02"] if t >= 60 else [],
                "inundated_edge_count": 1 if t >= 60 else 0,
                "is_arrival_point_for_r02": (t == 60)
            }
            for t in timesteps
        ]
    }
    with open(os.path.join(out_dir, f"timeline_{sc_id}.json"), "w", encoding="utf-8") as f:
        json.dump(timeline, f, indent=2)

print("All static scenario data exported successfully!")
