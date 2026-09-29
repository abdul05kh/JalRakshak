"""
Automated Test Suite for Multi-Hydrodynamic-Model Adapters and Model Comparison Engine.
"""

import pytest
from backend.app.domain.hydraulic_adapters.delft3d_adapter import Delft3DAdapter
from backend.app.domain.hydraulic_adapters.sph_adapter import SPHAdapter
from backend.app.domain.hydraulic_adapters.comparison import HydraulicModelComparator


def test_delft3d_and_sph_adapter_statuses():
    d3d = Delft3DAdapter()
    assert d3d.get_model_name() == "Delft3D Flexible Mesh (FM)"
    assert d3d.get_status() == "NOT_CONFIGURED"

    sph = SPHAdapter()
    assert "DualSPHysics" in sph.get_model_name()
    assert sph.get_status() == "NOT_CONFIGURED"

    d3d_fixture = Delft3DAdapter(is_fixture=True)
    assert d3d_fixture.get_status() == "TEST_FIXTURE"


def test_hydraulic_model_comparator():
    model_a = {
        "R01": {"max_depth_m": 2.0, "max_velocity_mps": 3.0, "flood_arrival_s": 3600.0},
        "R02": {"max_depth_m": 1.5, "max_velocity_mps": 2.2, "flood_arrival_s": 4200.0}
    }
    model_b = {
        "R01": {"max_depth_m": 2.2, "max_velocity_mps": 2.8, "flood_arrival_s": 3550.0},
        "R02": {"max_depth_m": 1.3, "max_velocity_mps": 2.5, "flood_arrival_s": 4300.0}
    }

    res = HydraulicModelComparator.compare_scenario_hydraulics(
        model_a_name="HECRAS_2D_CENTRAL",
        model_a_hydraulics=model_a,
        model_b_name="HECRAS_2D_PLAN02",
        model_b_hydraulics=model_b,
        scenario_id="SCENARIO_COMPARISON"
    )
    assert res["status"] == "COMPARISON_AVAILABLE"
    assert res["common_evaluated_edges"] == 2
    metrics = res["summary_metrics"]
    assert metrics["mean_absolute_depth_diff_m"] == 0.20
    assert metrics["mean_absolute_arrival_diff_s"] == 75.0
