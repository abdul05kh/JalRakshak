import os
import pytest
from backend.app.domain.database import db
from backend.app.domain.hecras_adapter import HecRasHdfAdapter
from backend.app.domain.road_hydraulic_mapper import RoadHydraulicMapper

ARTIFACTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "artifacts", "hecras"))
HDF5_PATH = os.path.join(ARTIFACTS_DIR, "tehri_dam_break.p01.hdf")

def test_road_spatial_mapping():
    assert os.path.exists(HDF5_PATH)
    adapter = HecRasHdfAdapter(default_threshold_m=0.30)
    hyd_data = adapter.load_scenario(HDF5_PATH)
    mapper = RoadHydraulicMapper(target_crs="EPSG:32644", search_radius_m=1200.0)

    edge_hyd = mapper.map_roads_to_hydraulics(db.roads, hyd_data)

    assert len(edge_hyd) == len(db.roads)
    for road_id, props in edge_hyd.items():
        assert "arrival_s" in props
        assert "max_depth_m" in props
        assert "max_vel_mps" in props
        assert "status" in props
        assert props["max_depth_m"] >= 0.0

def test_conservative_road_arrival_assignment():
    adapter = HecRasHdfAdapter(default_threshold_m=0.30)
    hyd_data = adapter.load_scenario(HDF5_PATH)
    mapper = RoadHydraulicMapper(target_crs="EPSG:32644", search_radius_m=1200.0)
    edge_hyd = mapper.map_roads_to_hydraulics(db.roads, hyd_data)

    # Lowland roads near dam (R02, R03) must experience flood arrival
    assert edge_hyd["R02"]["arrival_s"] < 99999
    assert edge_hyd["R02"]["inundated"] is True
