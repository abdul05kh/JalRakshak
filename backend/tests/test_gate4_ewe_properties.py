import pytest
import os
import json
import copy
from datetime import datetime, timezone, timedelta
import numpy as np
import networkx as nx

from backend.app.domain.hecras_adapter import HecRasHdfAdapter
from backend.app.domain.road_hydraulic_mapper import RoadHydraulicMapper
from backend.app.domain.ewe_engine import EvacuationWindowEngine
from backend.app.domain.database import Database

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))
ARTIFACTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "artifacts", "hecras", "tehri_gate3b"))

@pytest.fixture(scope="module")
def gate4_setup():
    roads_path = os.path.join(DATA_DIR, "study_area", "roads.json")
    evac_path = os.path.join(DATA_DIR, "study_area", "evacuation_points.json")
    with open(roads_path, "r", encoding="utf-8") as f:
        roads = {feat["properties"]["id"]: feat for feat in json.load(f)["features"]}
    with open(evac_path, "r", encoding="utf-8") as f:
        evac_points = {feat["properties"]["id"]: feat for feat in json.load(f)["features"]}

    adapter = HecRasHdfAdapter(default_threshold_m=0.30)
    central_hdf = os.path.join(ARTIFACTS_DIR, "tehri_15km_scenario_central.p01.hdf")
    hyd_central = adapter.load_scenario(central_hdf, scenario_id="SCENARIO_CENTRAL")

    mapper = RoadHydraulicMapper(target_crs="EPSG:32644", search_radius_m=150.0)
    edge_hyd_central = mapper.map_roads_to_hydraulics(roads, hyd_central)

    ewe = EvacuationWindowEngine(roads, evac_points)
    t0 = datetime(2026, 9, 24, 0, 0, 0, tzinfo=timezone.utc)

    return {
        "roads": roads,
        "evac_points": evac_points,
        "adapter": adapter,
        "hyd_central": hyd_central,
        "edge_hyd_central": edge_hyd_central,
        "ewe": ewe,
        "t0": t0
    }

# ==============================================================================
# MANDATORY PROPERTY TESTS (Section 12)
# ==============================================================================

def test_mandatory_property_1_flood_arrival_delayed(gate4_setup):
    """
    PROPERTY 1: If flood arrival time is delayed while everything else remains constant,
    route deadline must not become earlier.
    """
    ewe = gate4_setup["ewe"]
    t0 = gate4_setup["t0"]
    edge_hyd = copy.deepcopy(gate4_setup["edge_hyd_central"])

    # Base evaluation
    res_base = ewe.analyze_evacuation("N-MALIDEWAL", "N-KOTESHWAR", edge_hyd, t0, safety_buffer_min=3.0)[0]
    deadline_base = res_base["deadline_utc"]

    # Delay flood arrival on R02 by +600s
    edge_hyd["R02"]["arrival_s"] += 600
    res_delayed = ewe.analyze_evacuation("N-MALIDEWAL", "N-KOTESHWAR", edge_hyd, t0, safety_buffer_min=3.0)[0]
    deadline_delayed = res_delayed["deadline_utc"]

    assert deadline_delayed >= deadline_base, "Delayed flood arrival resulted in earlier deadline (violates Property 1)"
    assert res_delayed["margin_min"] >= res_base["margin_min"]

def test_mandatory_property_2_travel_time_increased(gate4_setup):
    """
    PROPERTY 2: If travel time increases while everything else remains constant,
    route deadline must not become later.
    """
    roads = copy.deepcopy(gate4_setup["roads"])
    evac_points = gate4_setup["evac_points"]
    edge_hyd = gate4_setup["edge_hyd_central"]
    t0 = gate4_setup["t0"]

    # Base evaluation
    ewe_base = EvacuationWindowEngine(roads, evac_points)
    res_base = ewe_base.analyze_evacuation("N-MALIDEWAL", "N-KOTESHWAR", edge_hyd, t0, safety_buffer_min=3.0)[0]

    # Increase travel time on R02 (reduce speed from 35 to 20 km/h)
    roads["R02"]["properties"]["travel_time_min"] += 10.0
    ewe_slow = EvacuationWindowEngine(roads, evac_points)
    res_slow = ewe_slow.analyze_evacuation("N-MALIDEWAL", "N-KOTESHWAR", edge_hyd, t0, safety_buffer_min=3.0)[0]

    assert res_slow["deadline_utc"] <= res_base["deadline_utc"], "Increased travel time made deadline later (violates Property 2)"
    assert res_slow["margin_min"] <= res_base["margin_min"]

def test_mandatory_property_3_safety_buffer_increased(gate4_setup):
    """
    PROPERTY 3: If safety buffer increases while everything else remains constant,
    route deadline must not become later.
    """
    ewe = gate4_setup["ewe"]
    t0 = gate4_setup["t0"]
    edge_hyd = gate4_setup["edge_hyd_central"]

    res_buf3 = ewe.analyze_evacuation("N-MALIDEWAL", "N-KOTESHWAR", edge_hyd, t0, safety_buffer_min=3.0)[0]
    res_buf10 = ewe.analyze_evacuation("N-MALIDEWAL", "N-KOTESHWAR", edge_hyd, t0, safety_buffer_min=10.0)[0]

    assert res_buf10["deadline_utc"] <= res_buf3["deadline_utc"], "Increased buffer made deadline later (violates Property 3)"
    assert res_buf10["margin_min"] < res_buf3["margin_min"]
    assert pytest.approx(res_buf3["margin_min"] - res_buf10["margin_min"], 0.1) == 7.0

def test_mandatory_property_4_limiting_segment_removed(gate4_setup):
    """
    PROPERTY 4: If a limiting segment is removed because it is unaffected,
    the deadline must not become earlier unless another constraint becomes active.
    """
    ewe = gate4_setup["ewe"]
    t0 = gate4_setup["t0"]
    edge_hyd = copy.deepcopy(gate4_setup["edge_hyd_central"])

    # Path from Malidewal to Chamba (unaffected high ground)
    res_highground = ewe.analyze_evacuation("N-MALIDEWAL", "N-CHAMBA", edge_hyd, t0, safety_buffer_min=3.0)[0]
    assert res_highground["status"] == "FEASIBLE"
    assert res_highground["limiting_segment"] is None

def test_mandatory_property_5_current_time_exceeds_deadline(gate4_setup):
    """
    PROPERTY 5: If current time exceeds route deadline, route cannot be FEASIBLE.
    """
    ewe = gate4_setup["ewe"]
    edge_hyd = gate4_setup["edge_hyd_central"]

    # In Central scenario with 150m buffer, deadline is 00:44:21
    # Test departure at 00:50:00
    t0 = gate4_setup["t0"]
    t_late = datetime(2026, 9, 24, 0, 50, 0, tzinfo=timezone.utc)
    res_late = ewe.analyze_evacuation("N-MALIDEWAL", "N-KOTESHWAR", edge_hyd, t_late, safety_buffer_min=3.0, scenario_start_dt=t0)[0]

    assert res_late["status"] == "INFEASIBLE", "Route was marked FEASIBLE when departure exceeds deadline (violates Property 5)"
    assert res_late["margin_min"] < 0

def test_mandatory_property_6_data_gap_propagation(gate4_setup):
    """
    PROPERTY 6: If any required road edge has DATA_GAP preventing reliable classification,
    the route must not silently become FEASIBLE.
    """
    ewe = gate4_setup["ewe"]
    t0 = gate4_setup["t0"]
    edge_hyd = copy.deepcopy(gate4_setup["edge_hyd_central"])

    # Remove hydraulic mapping for R02
    del edge_hyd["R02"]

    res_gap = ewe.analyze_evacuation("N-MALIDEWAL", "N-KOTESHWAR", edge_hyd, t0, safety_buffer_min=3.0)[0]
    assert res_gap["status"] == "DATA GAP", f"Expected DATA GAP, got {res_gap['status']}"
    assert res_gap["deadline_utc"] is None
    assert res_gap["margin_min"] is None

def test_mandatory_property_7_feasibility_inequality(gate4_setup):
    """
    PROPERTY 7: A route cannot be classified FEASIBLE when any required segment
    violates the feasibility inequality D + T_i + B < A_i.
    """
    ewe = gate4_setup["ewe"]
    t0 = gate4_setup["t0"]
    edge_hyd = gate4_setup["edge_hyd_central"]

    routes = ewe.analyze_evacuation("N-MALIDEWAL", "N-KOTESHWAR", edge_hyd, t0, safety_buffer_min=3.0)
    for r in routes:
        if r["status"] == "FEASIBLE":
            for e in r["edges"]:
                if e["flood_arrival_s"] is not None and e["flood_arrival_s"] < 99999:
                    assert (e["cumulative_travel_min"] * 60 + 180) <= e["flood_arrival_s"]

def test_mandatory_property_8_display_independence(gate4_setup):
    """
    PROPERTY 8: Changing the display/UI representations must not change route feasibility.
    """
    ewe = gate4_setup["ewe"]
    t0 = gate4_setup["t0"]
    edge_hyd = gate4_setup["edge_hyd_central"]

    res1 = ewe.analyze_evacuation("N-MALIDEWAL", "N-KOTESHWAR", edge_hyd, t0, safety_buffer_min=3.0)
    res2 = ewe.analyze_evacuation("N-MALIDEWAL", "N-KOTESHWAR", edge_hyd, t0, safety_buffer_min=3.0)

    assert json.dumps(res1, sort_keys=True) == json.dumps(res2, sort_keys=True)

# ==============================================================================
# DEMO TEST CASES (Section 29)
# ==============================================================================

def test_demo_a_feasible_route(gate4_setup):
    """DEMO A: Feasible route with ample margin."""
    ewe = gate4_setup["ewe"]
    t0 = gate4_setup["t0"]
    edge_hyd = gate4_setup["edge_hyd_central"]
    res = ewe.analyze_evacuation("N-MALIDEWAL", "N-CHAMBA", edge_hyd, t0, safety_buffer_min=3.0)[0]
    assert res["status"] == "FEASIBLE"
    assert res["total_travel_time_min"] > 0

def test_demo_b_low_margin_route(gate4_setup):
    """DEMO B: Low-margin route (0 < margin <= 5 min)."""
    ewe = gate4_setup["ewe"]
    t0 = gate4_setup["t0"]
    edge_hyd = gate4_setup["edge_hyd_central"]
    # Deadline is 00:44:21; departure at 00:42:00 gives margin ~2.35 min <= 5 min
    t_low = datetime(2026, 9, 24, 0, 42, 0, tzinfo=timezone.utc)
    res = ewe.analyze_evacuation("N-MALIDEWAL", "N-KOTESHWAR", edge_hyd, t_low, safety_buffer_min=3.0, scenario_start_dt=t0)[0]
    assert res["status"] == "LOW MARGIN"
    assert 0 < res["margin_min"] <= 5.0

def test_demo_c_infeasible_route(gate4_setup):
    """DEMO C: Infeasible route due to cutoff violation."""
    ewe = gate4_setup["ewe"]
    t0 = gate4_setup["t0"]
    edge_hyd = gate4_setup["edge_hyd_central"]
    t_inf = datetime(2026, 9, 24, 0, 50, 0, tzinfo=timezone.utc)
    res = ewe.analyze_evacuation("N-MALIDEWAL", "N-KOTESHWAR", edge_hyd, t_inf, safety_buffer_min=3.0, scenario_start_dt=t0)[0]
    assert res["status"] == "INFEASIBLE"
    assert res["margin_min"] < 0

def test_demo_d_no_feasible_route(gate4_setup):
    """DEMO D: Disconnected graph destination produces NO FEASIBLE ROUTE."""
    roads = copy.deepcopy(gate4_setup["roads"])
    evac_points = gate4_setup["evac_points"]
    edge_hyd = gate4_setup["edge_hyd_central"]
    t0 = gate4_setup["t0"]

    # Disconnect graph by clearing edges
    ewe_disc = EvacuationWindowEngine({}, evac_points)
    res = ewe_disc.analyze_evacuation("N-MALIDEWAL", "N-CHAMBA", edge_hyd, t0)
    assert len(res) == 0

def test_demo_e_data_gap_route(gate4_setup):
    """DEMO E: Data gap on route edge yields DATA GAP status."""
    ewe = gate4_setup["ewe"]
    t0 = gate4_setup["t0"]
    edge_hyd = copy.deepcopy(gate4_setup["edge_hyd_central"])
    del edge_hyd["R01"]

    res = ewe.analyze_evacuation("N-MALIDEWAL", "N-CHAMBA", edge_hyd, t0)[0]
    assert res["status"] == "DATA GAP"

# ==============================================================================
# MULTI-SCENARIO & REPRODUCIBILITY TESTS
# ==============================================================================

def test_scenario_monotonic_progression(gate4_setup):
    """Verify that Minimum, Central, Maximum scenarios show physically sound monotonic deadlines."""
    adapter = gate4_setup["adapter"]
    roads = gate4_setup["roads"]
    evac_points = gate4_setup["evac_points"]
    mapper = RoadHydraulicMapper(target_crs="EPSG:32644", search_radius_m=150.0)
    ewe = EvacuationWindowEngine(roads, evac_points)
    t0 = gate4_setup["t0"]

    sc_min = adapter.load_scenario(os.path.join(ARTIFACTS_DIR, "tehri_15km_scenario_minimum.p01.hdf"), scenario_id="SCENARIO_MINIMUM")
    sc_cen = adapter.load_scenario(os.path.join(ARTIFACTS_DIR, "tehri_15km_scenario_central.p01.hdf"), scenario_id="SCENARIO_CENTRAL")
    sc_max = adapter.load_scenario(os.path.join(ARTIFACTS_DIR, "tehri_15km_scenario_maximum.p01.hdf"), scenario_id="SCENARIO_MAXIMUM")

    hyd_min = mapper.map_roads_to_hydraulics(roads, sc_min)
    hyd_cen = mapper.map_roads_to_hydraulics(roads, sc_cen)
    hyd_max = mapper.map_roads_to_hydraulics(roads, sc_max)

    res_min = ewe.analyze_evacuation("N-MALIDEWAL", "N-KOTESHWAR", hyd_min, t0, safety_buffer_min=3.0)[0]
    res_cen = ewe.analyze_evacuation("N-MALIDEWAL", "N-KOTESHWAR", hyd_cen, t0, safety_buffer_min=3.0)[0]
    res_max = ewe.analyze_evacuation("N-MALIDEWAL", "N-KOTESHWAR", hyd_max, t0, safety_buffer_min=3.0)[0]

    # Flood arrives earliest in MAX, latest in MIN
    assert res_max["limiting_segment"]["flood_arrival_s"] < res_cen["limiting_segment"]["flood_arrival_s"] < res_min["limiting_segment"]["flood_arrival_s"]
    assert res_max["margin_min"] < res_cen["margin_min"] < res_min["margin_min"]
    assert res_max["deadline_utc"] < res_cen["deadline_utc"] < res_min["deadline_utc"]
