"""
JalRakshak Gate 5B — Human Decision Usefulness Experiment Harness & Precision Control
Automated administration, scoring, observation tracking, and audit export tool.
"""

import os
import json
import csv
import time
import hashlib
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple

PROTOCOL_VERSION = "2.1.0-gate5b-precision"
UI_VERSION = "2.1.0-gate5b-precision"
SCORING_VERSION = "2.1.0-gate5b-precision"
EXPERIMENT_VERSION = "2.1.0-gate5b-precision"

GROUND_TRUTH = {
    "TASK_01": {
        "domain": "route_feasibility",
        "expected_status": "FEASIBLE",
        "allowed_variants": ["FEASIBLE", "FEASIBLE UNDER SELECTED SCENARIO", "FEASIBLE UNDER CONFIGURED RULES"],
        "rejected_variants": ["SAFE", "GUARANTEED SAFE", "GUARANTEED", "ZERO RISK", "SAFE ROUTE", "RISK-FREE"]
    },
    "TASK_02": {
        "domain": "latest_feasible_departure",
        "expected_min_since_t0": 44.35,
        "expected_relative_str": "T+44 min 21 sec",
        "expected_utc_str": "00:44",
        "expected_deadline_seconds": 2661,
        "tolerance_min": 1.5
    },
    "TASK_03": {
        "domain": "limiting_segment",
        "expected_road_id": "R02",
        "allowed_names": ["R02", "SEGMENT 2", "MALIDEWAL TO KOTESHWAR", "VALLEY ROAD"]
    },
    "TASK_04": {
        "domain": "causal_reason",
        "required_keywords": [
            ["arrival", "flood", "water", "inundat", "reaches"],
            ["travel", "speed", "travers", "time"],
            ["buffer", "safety", "clearance"]
        ]
    },
    "TASK_05": {
        "domain": "alternative_routes",
        "expected_alternative_exists": True,
        "allowed_keywords": ["CHAMBA", "R01", "RIDGE", "HIGH GROUND", "MOUNTAIN"]
    },
    "TASK_06": {
        "domain": "scenario_delta",
        "expected_window_contracts": True,
        "allowed_keywords": ["CONTRACT", "SHRINK", "EARLIER", "REDUCE", "LESS TIME", "LOW MARGIN", "INFEASIBLE"]
    },
    "TASK_07": {
        "domain": "limitation_awareness",
        "valid_limitations": [
            "STATIC_SPEEDS",
            "DEMO_ROAD_DATASET",
            "NO_HISTORICAL_CALIBRATION"
        ],
        "danger_option": "GUARANTEED_SAFE"
    }
}

GROUND_TRUTH_HASH = hashlib.sha256(json.dumps(GROUND_TRUTH, sort_keys=True).encode("utf-8")).hexdigest()

VALID_RESEARCHER_INTERVENTIONS = {
    "NO_HELP",
    "RESEARCHER_HELP",
    "TASK_CLARIFICATION",
    "TECHNICAL_HELP",
    "PROTOCOL_HELP"
}

VALID_EXPERIMENT_MODES = {
    "TECHNICAL_DRY_RUN",
    "INTERNAL_HUMAN_PILOT",
    "FORMAL_HUMAN_STUDY"
}


def determine_session_mode(participant_id: str) -> str:
    """Classify trial mode based on participant ID prefix."""
    pid = participant_id.strip().upper()
    if pid.startswith("DRYRUN-TECH") or pid.startswith("TECH-"):
        return "TECHNICAL_DRY_RUN"
    elif pid.startswith("DRYRUN-HUMAN") or pid.startswith("PILOT-") or pid.startswith("INTERNAL-"):
        return "INTERNAL_HUMAN_PILOT"
    elif pid.startswith("P") and len(pid) >= 4 and pid[1:].isdigit():
        return "FORMAL_HUMAN_STUDY"
    elif pid.startswith("FORMAL-"):
        return "FORMAL_HUMAN_STUDY"
    return "INTERNAL_HUMAN_PILOT"


class Gate5BScorer:
    """Deterministic, pre-registered scoring engine for Gate 5B participant responses."""

    @staticmethod
    def score_task_01_feasibility(response_text: str) -> Tuple[int, bool]:
        """Score route feasibility choice (0 or 1) and detect safety misinterpretations."""
        norm = response_text.strip().upper()
        misinterpreted = any(d in norm for d in GROUND_TRUTH["TASK_01"]["rejected_variants"])
        if misinterpreted:
            return 0, True
        
        # If INFEASIBLE or DATA GAP is chosen, it is incorrect
        if "INFEASIBLE" in norm or "DATA GAP" in norm or "LOW MARGIN" in norm:
            return 0, False

        is_correct = any(v in norm for v in GROUND_TRUTH["TASK_01"]["allowed_variants"])
        return (1 if is_correct else 0), False

    @staticmethod
    def score_task_02_deadline(response_text: str) -> int:
        """Score departure deadline within +/- 1.5 min tolerance (relative scenario time or minutes)."""
        norm = response_text.strip().upper()
        
        # Check standard relative scenario time strings e.g. T+44 min 21 sec, T+44:21, T+44, 44 min 21 sec
        for valid_pattern in ["T+44", "T+43", "T+45", "44 MIN 21 SEC", "44.35", "44:21", "00:44", "00:43", "00:45", "2661"]:
            if valid_pattern in norm:
                return 1

        # Accept pure minutes representation e.g. 44, 44.35, 44.4, 44 min
        cleaned = norm.replace("T+", "").replace("MINUTES", "").replace("MIN", "").replace("SEC", "").replace("S", "").replace("UTC", "").strip()
        try:
            if ":" in cleaned:
                parts = cleaned.split(":")
                mins = float(parts[0]) + float(parts[1]) / 60.0
                if abs(mins - 44.35) <= 1.5:
                    return 1
            else:
                val = float(cleaned)
                if abs(val - 44.35) <= 1.5 or abs(val - 2661.0) <= 90.0:
                    return 1
        except ValueError:
            pass
        return 0

    @staticmethod
    def score_task_03_limiting_segment(response_text: str) -> int:
        """Score limiting segment identification."""
        norm = response_text.strip().upper()
        if any(name in norm for name in GROUND_TRUTH["TASK_03"]["allowed_names"]):
            return 1
        return 0

    @staticmethod
    def score_task_04_explanation(response_text: str) -> int:
        """Score causal explanation on a 0-2 scale using keyword intersection."""
        norm = response_text.strip().lower()
        matched_groups = 0
        for group in GROUND_TRUTH["TASK_04"]["required_keywords"]:
            if any(kw in norm for kw in group):
                matched_groups += 1
        
        if matched_groups >= 3:
            return 2
        elif matched_groups >= 1:
            return 1
        return 0

    @staticmethod
    def score_task_05_alternative(response_text: str) -> int:
        """Score alternative route discovery."""
        norm = response_text.strip().upper()
        if "NO" in norm and "YES" not in norm:
            return 0
        if any(kw in norm for kw in GROUND_TRUTH["TASK_05"]["allowed_keywords"]):
            return 1
        return 1 if "YES" in norm else 0

    @staticmethod
    def score_task_06_scenario_delta(response_text: str) -> int:
        """Score scenario comparison delta understanding."""
        norm = response_text.strip().upper()
        if any(kw in norm for kw in GROUND_TRUTH["TASK_06"]["allowed_keywords"]):
            return 1
        return 0

    @staticmethod
    def score_task_07_limitations(selected_options: List[str]) -> Tuple[int, bool]:
        """Score limitation awareness and detect dangerous overconfidence."""
        norm_opts = [opt.strip().upper() for opt in selected_options]
        misinterpreted = any("GUARANTEE" in opt or "100%" in opt or "RISK-FREE" in opt for opt in norm_opts)
        
        # Valid awareness requires at least 2 valid selections without the danger option
        valid_count = sum(1 for opt in norm_opts if any(v in opt for v in ["STATIC", "DEMO", "CALIBRAT", "HISTORICAL"]))
        if misinterpreted:
            return 0, True
        if valid_count >= 2:
            return 1, False
        return 0, False


class Gate5BSession:
    """Manages an individual participant trial session with strict provenance tracking."""

    def __init__(self, participant_id: str, participant_category: str, counterbalance_group: str):
        self.participant_id = participant_id.strip()
        self.participant_category = participant_category.strip()
        self.counterbalance_group = counterbalance_group.strip()
        self.mode = determine_session_mode(self.participant_id)
        self.session_id = f"sess_{self.participant_id}_{int(time.time())}"
        self.comprehension_check: Optional[Dict[str, Any]] = None
        self.trials: List[Dict[str, Any]] = []
        self.researcher_observations: List[Dict[str, Any]] = []
        self.qualitative_feedback: Dict[str, str] = {}

    def record_comprehension_check(self, answers: Dict[str, str]) -> Dict[str, Any]:
        """Record pre-test comprehension check answers (diagnostic only, not scored as performance)."""
        correct_answers = {
            "q1_arrival_time": "B",
            "q2_travel_time": "B",
            "q3_safety_buffer": "B",
            "q4_feasible_not_safe": "B"
        }
        misconceptions = []
        for q, expected in correct_answers.items():
            if answers.get(q, "").strip().upper() != expected:
                misconceptions.append(q)
        
        self.comprehension_check = {
            "answers": answers,
            "all_correct": len(misconceptions) == 0,
            "misconceptions_flagged": misconceptions,
            "recorded_at_iso": datetime.now(timezone.utc).isoformat()
        }
        return self.comprehension_check

    def record_researcher_observation(
        self,
        task_id: str,
        intervention_type: str = "NO_HELP",
        hesitation_seconds: float = 0.0,
        notes: str = ""
    ):
        """Record researcher sidecar observation without altering participant UI."""
        if intervention_type not in VALID_RESEARCHER_INTERVENTIONS:
            intervention_type = "NO_HELP"
        self.researcher_observations.append({
            "task_id": task_id,
            "intervention_type": intervention_type,
            "hesitation_seconds": round(hesitation_seconds, 2),
            "notes": notes,
            "timestamp_iso": datetime.now(timezone.utc).isoformat()
        })

    def record_trial(
        self,
        trial_index: int,
        condition: str,
        task_id: str,
        start_time: float,
        end_time: float,
        raw_response: Dict[str, Any],
        researcher_intervention: str = "NO_HELP"
    ) -> Dict[str, Any]:
        duration_s = max(0.0, end_time - start_time)
        scores = {}
        misinterpreted_flag = False

        if researcher_intervention not in VALID_RESEARCHER_INTERVENTIONS:
            researcher_intervention = "NO_HELP"

        if task_id == "TASK_01":
            s1, mis = Gate5BScorer.score_task_01_feasibility(raw_response.get("status_selected", ""))
            scores["status_correct"] = s1
            misinterpreted_flag = misinterpreted_flag or mis
        elif task_id == "TASK_02":
            scores["deadline_correct"] = Gate5BScorer.score_task_02_deadline(raw_response.get("deadline_entered", ""))
        elif task_id == "TASK_03":
            scores["limiting_segment_correct"] = Gate5BScorer.score_task_03_limiting_segment(raw_response.get("limiting_segment_entered", ""))
        elif task_id == "TASK_04":
            scores["explanation_score"] = Gate5BScorer.score_task_04_explanation(raw_response.get("reason_text", ""))
        elif task_id == "TASK_05":
            scores["alternative_correct"] = Gate5BScorer.score_task_05_alternative(raw_response.get("alternative_selected", ""))
        elif task_id == "TASK_06":
            scores["scenario_delta_correct"] = Gate5BScorer.score_task_06_scenario_delta(raw_response.get("scenario_delta_selected", ""))
        elif task_id == "TASK_07":
            s7, mis = Gate5BScorer.score_task_07_limitations(raw_response.get("limitations_selected", []))
            scores["limitation_awareness_score"] = s7
            misinterpreted_flag = misinterpreted_flag or mis

        scores["misinterpreted_as_safety"] = misinterpreted_flag

        trial_record = {
            "trial_index": trial_index,
            "condition": condition,
            "task_id": task_id,
            "start_iso": datetime.fromtimestamp(start_time, tz=timezone.utc).isoformat(),
            "end_iso": datetime.fromtimestamp(end_time, tz=timezone.utc).isoformat(),
            "duration_seconds": round(duration_s, 2),
            "researcher_intervention": researcher_intervention,
            "raw_response": raw_response,
            "scores": scores
        }
        self.trials.append(trial_record)
        return trial_record

    def export_json(self, output_dir: str) -> str:
        os.makedirs(output_dir, exist_ok=True)
        out_path = os.path.join(output_dir, f"session_{self.participant_id}.json")
        payload = {
            "session_id": self.session_id,
            "participant_id": self.participant_id,
            "participant_category": self.participant_category,
            "counterbalance_group": self.counterbalance_group,
            "experiment_mode": self.mode,
            "protocol_version": PROTOCOL_VERSION,
            "ui_version": UI_VERSION,
            "scoring_version": SCORING_VERSION,
            "ground_truth_hash": GROUND_TRUTH_HASH,
            "comprehension_check": self.comprehension_check,
            "trials": self.trials,
            "researcher_observations": self.researcher_observations,
            "qualitative_feedback": self.qualitative_feedback,
            "exported_at_iso": datetime.now(timezone.utc).isoformat()
        }
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)
        return out_path

    def export_csv_rows(self) -> List[Dict[str, Any]]:
        rows = []
        for t in self.trials:
            sc = t["scores"]
            rows.append({
                "participant_id": self.participant_id,
                "participant_category": self.participant_category,
                "experiment_mode": self.mode,
                "condition": t["condition"],
                "task_id": t["task_id"],
                "duration_seconds": t["duration_seconds"],
                "researcher_intervention": t.get("researcher_intervention", "NO_HELP"),
                "status_correct": sc.get("status_correct", ""),
                "deadline_correct": sc.get("deadline_correct", ""),
                "limiting_segment_correct": sc.get("limiting_segment_correct", ""),
                "explanation_score": sc.get("explanation_score", ""),
                "alternative_correct": sc.get("alternative_correct", ""),
                "scenario_delta_correct": sc.get("scenario_delta_correct", ""),
                "limitation_awareness_score": sc.get("limitation_awareness_score", ""),
                "misinterpreted_as_safety": sc.get("misinterpreted_as_safety", False)
            })
        return rows
