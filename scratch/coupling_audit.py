import os
import sys
import json
import numpy as np
from datetime import datetime, timezone

sys.path.insert(0, os.path.abspath("."))

from backend.app.domain.database import db
from backend.app.domain.hecras_adapter import HecRasHdfAdapter
from backend.app.domain.road_hydraulic_mapper import RoadHydraulicMapper
from backend.app.domain.ewe_engine import EvacuationWindowEngine

def run_coupling_audit():
    hdf_path = os.path.abspath("artifacts/hecras/tehri_gate3b/tehri_15km_scenario_central.p01.hdf")
    print(f"Loading HDF5: {hdf_path}")
    adapter = HecRasHdfAdapter(default_threshold_m=0.30)
    hyd_data = adapter.load_scenario(hdf_path)
    print(f"Cells in mesh: {hyd_data.cell_coords.shape[0]}")
    print(f"Timesteps: {hyd_data.depth_series.shape[0]}")

    results = {}
    dep_dt = datetime(2026, 9, 24, 0, 0, 0, tzinfo=timezone.utc)

    for radius in [1200.0, 150.0]:
        mapper = RoadHydraulicMapper(target_crs="EPSG:32644", search_radius_m=radius, sample_spacing_m=50.0)
        edge_hyd = mapper.map_roads_to_hydraulics(db.roads, hyd_data)
        
        ewe = EvacuationWindowEngine(db.roads, db.evacuation_points)
        
        # Route 1: Malidewal to Koteshwar
        r1_list = ewe.analyze_evacuation("N-MALIDEWAL", "N-KOTESHWAR", edge_hyd, dep_dt, safety_buffer_min=3.0)
        # Route 2: Malidewal to Chamba
        r2_list = ewe.analyze_evacuation("N-MALIDEWAL", "N-CHAMBA", edge_hyd, dep_dt, safety_buffer_min=3.0)

        results[radius] = {
            "edge_hydraulics": edge_hyd,
            "r1": r1_list[0] if r1_list else None,
            "r2": r2_list[0] if r2_list else None
        }

    print("\n=================== DETAILED COMPARISON ===================")
    print("Segment Details for R02:")
    old_r02 = results[1200.0]["edge_hydraulics"]["R02"]
    new_r02 = results[150.0]["edge_hydraulics"]["R02"]

    print(f"OLD (1200m) R02: arrival={old_r02['arrival_s']}s ({old_r02['arrival_s']/60.0:.2f} min), depth={old_r02['max_depth_m']}m, cells={old_r02['provenance']['coupled_cells_count']}")
    print(f"NEW (150m)  R02: arrival={new_r02['arrival_s']}s ({new_r02['arrival_s']/60.0:.2f} min), depth={new_r02['max_depth_m']}m, cells={new_r02['provenance']['coupled_cells_count']}")

    print("\nAll Roads Comparison:")
    print(f"{'Road ID':<8} | {'OLD (1200m) Arr (s)':<20} | {'NEW (150m) Arr (s)':<20} | {'OLD Depth':<10} | {'NEW Depth':<10} | {'OLD Cells':<10} | {'NEW Cells':<10}")
    print("-" * 105)
    for r_id in sorted(db.roads.keys()):
        o = results[1200.0]["edge_hydraulics"][r_id]
        n = results[150.0]["edge_hydraulics"][r_id]
        o_arr = f"{o['arrival_s']} ({o['arrival_s']/60.0:.1f}m)" if o['arrival_s'] < 99999 else "None (99999)"
        n_arr = f"{n['arrival_s']} ({n['arrival_s']/60.0:.1f}m)" if n['arrival_s'] < 99999 else "None (99999)"
        print(f"{r_id:<8} | {o_arr:<20} | {n_arr:<20} | {o['max_depth_m']:<10.2f} | {n['max_depth_m']:<10.2f} | {o['provenance']['coupled_cells_count']:<10} | {n['provenance']['coupled_cells_count']:<10}")

    print("\n=================== ROUTE 1 (MALIDEWAL -> KOTESHWAR) ===================")
    for radius in [1200.0, 150.0]:
        r1 = results[radius]["r1"]
        print(f"\n--- RADIUS {radius}m ---")
        print(f"Status: {r1['status']}")
        print(f"Total Distance: {r1['total_distance_m']} m")
        print(f"Total Travel Time: {r1['total_travel_time_min']} min")
        print(f"Deadline UTC: {r1['deadline_utc']}")
        print(f"Margin: {r1['margin_min']} min")
        print(f"Limiting Segment: {r1['limiting_segment']['road_id'] if r1['limiting_segment'] else 'None'}")
        if r1['limiting_segment']:
            ls = r1['limiting_segment']
            print(f"  Limiting Arrival: {ls['flood_arrival_s']}s ({ls['flood_arrival_s']/60.0:.2f} min)")
            print(f"  Limiting Cum Travel: {ls['cumulative_travel_min']} min")
            print(f"  Limiting Depth: {ls['max_depth_m']} m")
            print(f"  Limiting Reason: {ls['failure_reason']}")
        print(f"Explanation: {r1['explanation']}")

    print("\n=================== ROUTE 2 (MALIDEWAL -> CHAMBA) ===================")
    for radius in [1200.0, 150.0]:
        r2 = results[radius]["r2"]
        print(f"\n--- RADIUS {radius}m ---")
        print(f"Status: {r2['status']}")
        print(f"Total Travel Time: {r2['total_travel_time_min']} min")
        print(f"Deadline UTC: {r2['deadline_utc']}")
        print(f"Margin: {r2['margin_min']} min")
        print(f"Limiting Segment: {r2['limiting_segment']['road_id'] if r2['limiting_segment'] else 'None'}")
        print(f"Explanation: {r2['explanation']}")

if __name__ == "__main__":
    run_coupling_audit()
