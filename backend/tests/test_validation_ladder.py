import pytest
from backend.app.domain.validation_ladder import ValidationLadder

def test_validation_ladder_structure():
    ladder = ValidationLadder.get_validation_ladder()
    assert "levels" in ladder
    assert len(ladder["levels"]) == 5
    assert ladder["overall_status"] == "DEMO-READY RESEARCH PROTOTYPE"

def test_validation_ladder_level_1_software_reproducibility():
    l1 = ValidationLadder.get_level_1_software_reproducibility()
    assert l1["level"] == 1
    assert l1["status"] == "PASS"
    assert l1["evidence_type"] == "NUMERICAL_REPRODUCIBILITY"
    assert l1["metrics"]["arrival_time_determinism"] == "PASS"

def test_validation_ladder_level_2_hydraulic_consistency():
    l2 = ValidationLadder.get_level_2_hydraulic_consistency()
    assert l2["level"] == 2
    assert l2["status"] == "PASS"
    assert l2["evidence_type"] == "HYDRAULIC_CONSISTENCY"
    assert "negative_depth_rejection" in l2["metrics"]

def test_validation_ladder_level_3_independent_scenarios():
    l3 = ValidationLadder.get_level_3_independent_scenarios()
    assert l3["level"] == 3
    assert l3["status"] == "PASS"
    assert l3["evidence_type"] == "INDEPENDENT_SCENARIO_TESTING"
    assert "test_world_alpha_isolation" in l3["metrics"]

def test_validation_ladder_level_4_observational_comparison_data_gap():
    l4_gap = ValidationLadder.get_level_4_observational_comparison(compatible_event=False)
    assert l4_gap["level"] == 4
    assert l4_gap["status"] == "RESEARCH / DATA GAP"
    assert l4_gap["metrics"]["iou"] == "N/A"

def test_validation_ladder_level_4_observational_comparison_controlled():
    l4_ctrl = ValidationLadder.get_level_4_observational_comparison(compatible_event=True)
    assert l4_ctrl["level"] == 4
    assert l4_ctrl["status"] == "PARTIAL"
    assert l4_ctrl["evidence_type"] == "SPATIAL_COMPARISON_METRIC"
    assert l4_ctrl["metrics"]["iou"] == 0.42

def test_validation_ladder_level_5_physical_field_validation():
    l5 = ValidationLadder.get_level_5_physical_field_validation()
    assert l5["level"] == 5
    assert l5["status"] == "NOT_ESTABLISHED"
    assert l5["evidence_type"] == "PHYSICAL_FIELD_VALIDATION"
    assert "NOT_AVAILABLE" in l5["metrics"]["historical_breach_records"]
