import os
import sys
import time
import json
from datetime import datetime, timezone

sys.path.insert(0, os.path.abspath("."))

from backend.app.experiments.gate5b_harness import (
    Gate5BSession,
    Gate5BScorer,
    GROUND_TRUTH,
    GROUND_TRUTH_HASH
)

def run_technical_dry_run_suite():
    output_dir = os.path.abspath("artifacts/gate5b/dry_run")
    os.makedirs(output_dir, exist_ok=True)

    print("==================================================================")
    print("STARTING TECHNICAL DRY RUN INSTRUMENTATION TEST (NOT HUMAN DATA)")
    print("==================================================================")
    print(f"Ground Truth Sealed Hash: {GROUND_TRUTH_HASH}")

    # ------------------------------------------------------------------
    # SESSION 1: DRYRUN-TECH-001 (Order A -> B, Engineering Analyst Profile)
    # ------------------------------------------------------------------
    s1 = Gate5BSession(
        participant_id="DRYRUN-TECH-001",
        participant_category="TECHNICAL_DRY_RUN_PROFILE_A",
        counterbalance_group="GROUP_1_A_THEN_B"
    )

    # 1. Comprehension Check (All correct)
    comp1 = s1.record_comprehension_check({
        "q1_arrival_time": "B",
        "q2_travel_time": "B",
        "q3_safety_buffer": "B",
        "q4_feasible_not_safe": "B"
    })
    assert comp1["all_correct"] is True, "Comprehension check failed for S1"

    # Condition A Trials (Raw Hydraulic Representation)
    t0 = time.time()
    # Trial 1: Task 01 - Feasibility (Manual calculation)
    s1.record_trial(
        trial_index=1,
        condition="CONDITION_A_RAW_HYDRAULIC",
        task_id="TASK_01",
        start_time=t0,
        end_time=t0 + 42.5,
        raw_response={"status_selected": "FEASIBLE"}
    )
    # Trial 2: Task 02 - Deadline (Calculated: 60m - 12.65m - 3m = 44.35m -> T+44 min 21 sec)
    s1.record_trial(
        trial_index=2,
        condition="CONDITION_A_RAW_HYDRAULIC",
        task_id="TASK_02",
        start_time=t0 + 43.0,
        end_time=t0 + 98.2,
        raw_response={"deadline_entered": "T+44 min 21 sec"}
    )
    # Trial 3: Task 03 - Limiting Segment (Inspected stations -> R02 at 60 min)
    s1.record_trial(
        trial_index=3,
        condition="CONDITION_A_RAW_HYDRAULIC",
        task_id="TASK_03",
        start_time=t0 + 99.0,
        end_time=t0 + 135.0,
        raw_response={"limiting_segment_entered": "R02"}
    )

    # Washout Interval Simulation (5 min)
    t_washout = t0 + 435.0

    # Condition B Trials (JalRakshak Decision Representation)
    # Trial 4: Task 04 - Causal Explanation
    s1.record_trial(
        trial_index=4,
        condition="CONDITION_B_JALRAKSHAK",
        task_id="TASK_04",
        start_time=t_washout,
        end_time=t_washout + 25.0,
        raw_response={"reason_text": "Flood arrival at segment R02 is 60 min, traversal time is 12.65 min, and safety buffer is 3 min."}
    )
    # Trial 5: Task 05 - Alternative Route
    s1.record_trial(
        trial_index=5,
        condition="CONDITION_B_JALRAKSHAK",
        task_id="TASK_05",
        start_time=t_washout + 26.0,
        end_time=t_washout + 41.0,
        raw_response={"alternative_selected": "Yes, High Ridge Bypass via R01"}
    )
    # Trial 6: Task 06 - Scenario Delta (Central -> Maximum)
    s1.record_trial(
        trial_index=6,
        condition="CONDITION_B_JALRAKSHAK",
        task_id="TASK_06",
        start_time=t_washout + 42.0,
        end_time=t_washout + 58.0,
        raw_response={"scenario_delta_selected": "Departure window contracts significantly (earlier arrival)"}
    )
    # Trial 7: Task 07 - Limitation Awareness
    s1.record_trial(
        trial_index=7,
        condition="CONDITION_B_JALRAKSHAK",
        task_id="TASK_07",
        start_time=t_washout + 59.0,
        end_time=t_washout + 75.0,
        raw_response={"limitations_selected": [
            "Static speed assumptions",
            "Demonstration road dataset",
            "No historical calibration"
        ]}
    )

    s1.qualitative_feedback = {
        "condition_a_usability": "Raw rasters require manual arithmetic for travel time and buffer subtraction, but mathematically solvable.",
        "condition_b_clarity": "Decision panel directly surfaces arrival, traversal, and minimum deadline clearly.",
        "time_format_feedback": "T+MM:SS notation is unambiguous compared to clock UTC."
    }

    p1_json = s1.export_json(output_dir)
    print(f"Exported S1 JSON: {p1_json}")

    # ------------------------------------------------------------------
    # SESSION 2: DRYRUN-TECH-002 (Order B -> A, Boundary & Error Testing)
    # ------------------------------------------------------------------
    s2 = Gate5BSession(
        participant_id="DRYRUN-TECH-002",
        participant_category="TECHNICAL_DRY_RUN_PROFILE_B_ERRORS",
        counterbalance_group="GROUP_2_B_THEN_A"
    )

    # 1. Comprehension Check (Misconception on Q4)
    comp2 = s2.record_comprehension_check({
        "q1_arrival_time": "B",
        "q2_travel_time": "B",
        "q3_safety_buffer": "B",
        "q4_feasible_not_safe": "A" # Deliberately testing misconception detection
    })
    assert comp2["all_correct"] is False, "Comprehension error detection failed for S2"
    assert "q4_feasible_not_safe" in comp2["misconceptions_flagged"]

    # Condition B Trials (JalRakshak Decision Representation first)
    tb0 = time.time() + 1000.0
    # Trial 1: Task 01 - Dangerous Overclaim Test
    s2.record_trial(
        trial_index=1,
        condition="CONDITION_B_JALRAKSHAK",
        task_id="TASK_01",
        start_time=tb0,
        end_time=tb0 + 12.0,
        raw_response={"status_selected": "GUARANTEED SAFE"}
    )
    # Trial 2: Task 02 - Boundary tolerance deadline test (44.0 min -> 44 min)
    s2.record_trial(
        trial_index=2,
        condition="CONDITION_B_JALRAKSHAK",
        task_id="TASK_02",
        start_time=tb0 + 13.0,
        end_time=tb0 + 26.0,
        raw_response={"deadline_entered": "44.0 min"}
    )
    # Trial 3: Task 03 - Limiting segment incorrect test
    s2.record_trial(
        trial_index=3,
        condition="CONDITION_B_JALRAKSHAK",
        task_id="TASK_03",
        start_time=tb0 + 27.0,
        end_time=tb0 + 39.0,
        raw_response={"limiting_segment_entered": "R01"}
    )

    tb_washout = tb0 + 350.0
    # Condition A Trials (Raw Hydraulic Representation second)
    # Trial 4: Task 04 - Partial explanation test
    s2.record_trial(
        trial_index=4,
        condition="CONDITION_A_RAW_HYDRAULIC",
        task_id="TASK_04",
        start_time=tb_washout,
        end_time=tb_washout + 60.0,
        raw_response={"reason_text": "Water reaches road at 60 min."}
    )
    # Trial 5: Task 05 - Alternative route negative answer
    s2.record_trial(
        trial_index=5,
        condition="CONDITION_A_RAW_HYDRAULIC",
        task_id="TASK_05",
        start_time=tb_washout + 61.0,
        end_time=tb_washout + 95.0,
        raw_response={"alternative_selected": "No, all routes flooded"}
    )
    # Trial 6: Task 06 - Scenario delta incorrect
    s2.record_trial(
        trial_index=6,
        condition="CONDITION_A_RAW_HYDRAULIC",
        task_id="TASK_06",
        start_time=tb_washout + 96.0,
        end_time=tb_washout + 140.0,
        raw_response={"scenario_delta_selected": "Window expands"}
    )
    # Trial 7: Task 07 - Limitation danger option test
    s2.record_trial(
        trial_index=7,
        condition="CONDITION_A_RAW_HYDRAULIC",
        task_id="TASK_07",
        start_time=tb_washout + 141.0,
        end_time=tb_washout + 165.0,
        raw_response={"limitations_selected": [
            "Static speed assumptions",
            "Guarantees 100% risk-free evacuation"
        ]}
    )

    p2_json = s2.export_json(output_dir)
    print(f"Exported S2 JSON: {p2_json}")

    # Export CSV summary of dry run
    csv_path = os.path.join(output_dir, "dry_run_trials_summary.csv")
    rows = s1.export_csv_rows() + s2.export_csv_rows()
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        import csv
        fieldnames = list(rows[0].keys())
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for r in rows:
            writer.writerow(r)
    print(f"Exported CSV: {csv_path}")

    print("\n--- S1 Trial Scoring Summary ---")
    for t in s1.trials:
        print(f"  Trial {t['trial_index']} ({t['condition']}, {t['task_id']}): duration={t['duration_seconds']}s, scores={t['scores']}")

    print("\n--- S2 Trial Scoring Summary (Boundary/Error Branch Testing) ---")
    for t in s2.trials:
        print(f"  Trial {t['trial_index']} ({t['condition']}, {t['task_id']}): duration={t['duration_seconds']}s, scores={t['scores']}")

    print("\nDRY RUN SUITE COMPLETED SUCCESSFULLY.")

if __name__ == "__main__":
    run_technical_dry_run_suite()
