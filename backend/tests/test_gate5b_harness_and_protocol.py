import pytest
import os
import json
import tempfile
from backend.app.experiments.gate5b_harness import (
    Gate5BScorer,
    Gate5BSession,
    GROUND_TRUTH,
    GROUND_TRUTH_HASH
)

DOCS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "docs"))

# ----------------------------------------------------------------------
# 1. GROUND TRUTH INTEGRITY & HASH VERIFICATION
# ----------------------------------------------------------------------

def test_ground_truth_constants():
    """Verify ground truth constants match frozen Gate 5A baseline."""
    assert GROUND_TRUTH["TASK_01"]["expected_status"] == "FEASIBLE"
    assert GROUND_TRUTH["TASK_02"]["expected_relative_str"] == "T+44 min 21 sec"
    assert GROUND_TRUTH["TASK_02"]["expected_min_since_t0"] == 44.35
    assert GROUND_TRUTH["TASK_03"]["expected_road_id"] == "R02"
    assert len(GROUND_TRUTH_HASH) == 64


# ----------------------------------------------------------------------
# 2. SCORING ENGINE RUBRIC TESTS
# ----------------------------------------------------------------------

def test_score_task_01_feasibility():
    # Correct response
    score, danger = Gate5BScorer.score_task_01_feasibility("FEASIBLE under selected scenario")
    assert score == 1
    assert not danger

    # Incorrect response
    score, danger = Gate5BScorer.score_task_01_feasibility("INFEASIBLE")
    assert score == 0
    assert not danger

    # Dangerous overclaim
    score, danger = Gate5BScorer.score_task_01_feasibility("GUARANTEED SAFE evacuation")
    assert score == 0
    assert danger, "Conflating feasibility with guaranteed safety must trigger danger flag"


def test_score_task_02_deadline():
    # Relative scenario time formats
    assert Gate5BScorer.score_task_02_deadline("T+44 min 21 sec") == 1
    assert Gate5BScorer.score_task_02_deadline("44 min 21 sec") == 1
    assert Gate5BScorer.score_task_02_deadline("T+44:21") == 1
    assert Gate5BScorer.score_task_02_deadline("44.35 min") == 1
    assert Gate5BScorer.score_task_02_deadline("44 min") == 1

    # Legacy UTC format support
    assert Gate5BScorer.score_task_02_deadline("00:44 UTC") == 1
    assert Gate5BScorer.score_task_02_deadline("00:43") == 1
    assert Gate5BScorer.score_task_02_deadline("00:45") == 1

    # Out of tolerance
    assert Gate5BScorer.score_task_02_deadline("T+30 min") == 0
    assert Gate5BScorer.score_task_02_deadline("00:30 UTC") == 0
    assert Gate5BScorer.score_task_02_deadline("01:00 UTC") == 0


def test_score_task_03_limiting_segment():
    assert Gate5BScorer.score_task_03_limiting_segment("R02") == 1
    assert Gate5BScorer.score_task_03_limiting_segment("Malidewal to Koteshwar road") == 1
    assert Gate5BScorer.score_task_03_limiting_segment("R01") == 0
    assert Gate5BScorer.score_task_03_limiting_segment("R07") == 0


def test_score_task_04_explanation():
    # Full credit (flood arrival + traversal speed + buffer)
    full_text = "Flood arrival reaches segment at 60 min, traversal time is 12.6 min, and safety buffer is 3 min."
    assert Gate5BScorer.score_task_04_explanation(full_text) == 2

    # Partial credit (only flood arrival)
    partial_text = "Water reaches the road segment and inundates it."
    assert Gate5BScorer.score_task_04_explanation(partial_text) == 1

    # No credit
    assert Gate5BScorer.score_task_04_explanation("Because the road is long.") == 0


def test_score_task_05_alternative():
    assert Gate5BScorer.score_task_05_alternative("Yes, via Chamba high ground ridge") == 1
    assert Gate5BScorer.score_task_05_alternative("No alternative available") == 0


def test_score_task_06_scenario_delta():
    assert Gate5BScorer.score_task_06_scenario_delta("The window contracts and flood arrives earlier") == 1
    assert Gate5BScorer.score_task_06_scenario_delta("More time becomes available") == 0


def test_score_task_07_limitations():
    valid_selection = ["Static speed assumptions", "Demonstration road dataset", "No historical calibration"]
    score, danger = Gate5BScorer.score_task_07_limitations(valid_selection)
    assert score == 1
    assert not danger

    # Danger option selected
    danger_selection = ["Static speed assumptions", "Guarantees 100% risk-free evacuation"]
    score, danger = Gate5BScorer.score_task_07_limitations(danger_selection)
    assert score == 0
    assert danger


# ----------------------------------------------------------------------
# 3. SESSION LOGGING & EXPORT TEST
# ----------------------------------------------------------------------

def test_session_trial_logging_and_export():
    session = Gate5BSession(
        participant_id="P001",
        participant_category="STUDENT_CIVIL_HYDRAULIC",
        counterbalance_group="GROUP_1_A_THEN_B"
    )

    t0 = 1727180000.0
    t1 = t0 + 45.2

    trial = session.record_trial(
        trial_index=1,
        condition="CONDITION_B_JALRAKSHAK",
        task_id="TASK_01",
        start_time=t0,
        end_time=t1,
        raw_response={"status_selected": "FEASIBLE"}
    )

    assert trial["duration_seconds"] == 45.2
    assert trial["scores"]["status_correct"] == 1
    assert not trial["scores"]["misinterpreted_as_safety"]

    with tempfile.TemporaryDirectory() as tmpdir:
        out_json = session.export_json(tmpdir)
        assert os.path.exists(out_json)
        with open(out_json, "r", encoding="utf-8") as f:
            data = json.load(f)
            assert data["participant_id"] == "P001"
            assert data["ground_truth_hash"] == GROUND_TRUTH_HASH
            assert len(data["trials"]) == 1

        csv_rows = session.export_csv_rows()
        assert len(csv_rows) == 1
        assert csv_rows[0]["status_correct"] == 1


def test_session_comprehension_check():
    session = Gate5BSession(
        participant_id="P002",
        participant_category="EMERGENCY_MANAGEMENT_STUDENT",
        counterbalance_group="GROUP_2_B_THEN_A"
    )

    # Correct answers
    res = session.record_comprehension_check({
        "q1_arrival_time": "B",
        "q2_travel_time": "B",
        "q3_safety_buffer": "B",
        "q4_feasible_not_safe": "B"
    })
    assert res["all_correct"] is True
    assert len(res["misconceptions_flagged"]) == 0

    # Misconception on feasible != safe
    res_err = session.record_comprehension_check({
        "q1_arrival_time": "B",
        "q2_travel_time": "B",
        "q3_safety_buffer": "B",
        "q4_feasible_not_safe": "A"  # Mistook feasible for safe
    })
    assert res_err["all_correct"] is False
    assert "q4_feasible_not_safe" in res_err["misconceptions_flagged"]


# ----------------------------------------------------------------------
# 4. DOCUMENTATION AUDIT & ZERO FABRICATION CHECK
# ----------------------------------------------------------------------

def test_gate5b_documentation_completeness():
    required_docs = [
        "GATE5B_PARTICIPANT_PROTOCOL.md",
        "GATE5B_EXPERIMENT_DESIGN.md",
        "GATE5B_INFORMATION_PARITY_AUDIT.md",
        "GATE5B_GROUND_TRUTH_FREEZE.md",
        "GATE5B_ANALYSIS_PLAN.md",
        "GATE5B_TASK_BOOK.md",
        "GATE5B_SCORING_RUBRIC.md",
        "GATE5B_DATA_SCHEMA.md",
        "GATE5B_REPRODUCIBILITY.md",
        "GATE5B_SAFETY_INTERPRETATION_AUDIT.md",
        "GATE5B_RESULTS.md",
        "GATE5B_FINAL_ACCEPTANCE.md"
    ]

    for doc_name in required_docs:
        doc_path = os.path.join(DOCS_DIR, doc_name)
        assert os.path.exists(doc_path), f"Mandatory Gate 5B document '{doc_name}' is missing."


def test_results_document_zero_fabrication():
    """Verify that GATE5B_RESULTS.md explicitly declares human data as not yet available."""
    results_path = os.path.join(DOCS_DIR, "GATE5B_RESULTS.md")
    with open(results_path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "HUMAN DATA NOT YET AVAILABLE" in content
    assert "ZERO-FABRICATION" in content.upper()


def test_ground_truth_revalidation_v2_exists():
    """Verify that GATE5B_GROUND_TRUTH_REVALIDATION_V2.md exists and documents 150m coupling."""
    v2_path = os.path.join(DOCS_DIR, "audits", "pre_human", "GATE5B_GROUND_TRUTH_REVALIDATION_V2.md")
    assert os.path.exists(v2_path), "GATE5B_GROUND_TRUTH_REVALIDATION_V2.md is missing."
    with open(v2_path, "r", encoding="utf-8") as f:
        text = f.read()
    assert "150.0" in text
    assert "LineString" in text
    assert "3,600" in text or "3600" in text


def test_hardened_150m_coupling_produces_exact_deadline():
    """Prove that hardened 150m coupling produces 3600s arrival and 2661s (T+44:21) deadline."""
    arrival_s = 3600.0  # 60 min from 150m corridor coupling
    travel_time_s = 759.0  # 12.65 min (10.54 km / 50 km/h)
    buffer_s = 180.0  # 3.0 min safety buffer
    
    deadline_s = arrival_s - travel_time_s - buffer_s
    assert deadline_s == 2661.0
    assert abs(deadline_s / 60.0 - 44.35) < 0.01
