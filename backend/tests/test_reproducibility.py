import os
from datetime import datetime, timezone
from backend.app.domain.database import db
from backend.app.domain.hecras_adapter import HecRasHdfAdapter
from backend.app.domain.road_hydraulic_mapper import RoadHydraulicMapper
from backend.app.domain.ewe_engine import EvacuationWindowEngine

ARTIFACTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "artifacts", "hecras"))
HDF5_PATH = os.path.join(ARTIFACTS_DIR, "tehri_dam_break.p01.hdf")

def test_pipeline_reproducibility():
    adapter = HecRasHdfAdapter(default_threshold_m=0.30)
    mapper = RoadHydraulicMapper(target_crs="EPSG:32644", search_radius_m=1200.0)

    # Run 1
    hyd1 = adapter.load_scenario(HDF5_PATH)
    roads1 = mapper.map_roads_to_hydraulics(db.roads, hyd1)
    ewe1 = EvacuationWindowEngine(db.roads, db.evacuation_points)
    now_utc = datetime(2026, 9, 24, 6, 0, 0, tzinfo=timezone.utc)
    res1 = ewe1.analyze_evacuation("N-MALIDEWAL", "N-CHAMBA", roads1, now_utc, safety_buffer_min=3.0)

    # Run 2
    hyd2 = adapter.load_scenario(HDF5_PATH)
    roads2 = mapper.map_roads_to_hydraulics(db.roads, hyd2)
    ewe2 = EvacuationWindowEngine(db.roads, db.evacuation_points)
    res2 = ewe2.analyze_evacuation("N-MALIDEWAL", "N-CHAMBA", roads2, now_utc, safety_buffer_min=3.0)

    # Assert exact numerical and structural equivalence
    assert hyd1.sha256_checksum == hyd2.sha256_checksum
    assert len(res1) == len(res2)
    for r1, r2 in zip(res1, res2):
        assert r1["status"] == r2["status"]
        assert r1["deadline_utc"] == r2["deadline_utc"]
        assert r1["margin_min"] == r2["margin_min"]
        assert r1["limiting_segment"]["road_id"] == r2["limiting_segment"]["road_id"]
        assert r1["total_travel_time_min"] == r2["total_travel_time_min"]
