import os
import sys
from datetime import datetime, timezone

sys.path.insert(0, os.path.abspath("."))

from backend.app.domain.database import db
from backend.app.domain.hecras_adapter import HecRasHdfAdapter
from backend.app.domain.road_hydraulic_mapper import RoadHydraulicMapper
from backend.app.domain.ewe_engine import EvacuationWindowEngine

def run_all_scenarios_audit():
    mapper = RoadHydraulicMapper(target_crs="EPSG:32644", search_radius_m=150.0, sample_spacing_m=50.0)
    adapter = HecRasHdfAdapter(default_threshold_m=0.30)
    ewe = EvacuationWindowEngine(db.roads, db.evacuation_points)
    dep_dt = datetime(2026, 9, 24, 0, 0, 0, tzinfo=timezone.utc)

    for scen_name, filename in [
        ("SCENARIO_MINIMUM (28.5k)", "tehri_15km_scenario_minimum.p01.hdf"),
        ("SCENARIO_CENTRAL (65k)", "tehri_15km_scenario_central.p01.hdf"),
        ("SCENARIO_MAXIMUM (115k)", "tehri_15km_scenario_maximum.p01.hdf")
    ]:
        hdf_path = os.path.abspath(os.path.join("artifacts/hecras/tehri_gate3b", filename))
        hyd_data = adapter.load_scenario(hdf_path)
        edge_hyd = mapper.map_roads_to_hydraulics(db.roads, hyd_data)
        
        r1_list = ewe.analyze_evacuation("N-MALIDEWAL", "N-KOTESHWAR", edge_hyd, dep_dt, safety_buffer_min=3.0)
        r2_list = ewe.analyze_evacuation("N-MALIDEWAL", "N-CHAMBA", edge_hyd, dep_dt, safety_buffer_min=3.0)

        print(f"\n=================== {scen_name} ===================")
        eh_r02 = edge_hyd.get("R02", {})
        print(f"R02: arrival_s={eh_r02.get('arrival_s')} ({eh_r02.get('arrival_s',0)/60.0:.2f} min), max_depth={eh_r02.get('max_depth_m')}m, cells={eh_r02.get('provenance',{}).get('coupled_cells_count')}")
        if r1_list:
            r1 = r1_list[0]
            print(f"Route 1 (Malidewal -> Koteshwar): status={r1['status']}, deadline={r1['deadline_utc']}, margin={r1['margin_min']} min, limiting={r1['limiting_segment']['road_id'] if r1['limiting_segment'] else 'None'}")
        if r2_list:
            r2 = r2_list[0]
            print(f"Route 2 (Malidewal -> Chamba):    status={r2['status']}, deadline={r2['deadline_utc']}, margin={r2['margin_min']} min, limiting={r2['limiting_segment']['road_id'] if r2['limiting_segment'] else 'None'}")

if __name__ == "__main__":
    run_all_scenarios_audit()
