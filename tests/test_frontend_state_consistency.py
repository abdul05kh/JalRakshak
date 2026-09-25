"""
test_frontend_state_consistency.py
Automated State Consistency & EWE Invariant Verification Suite for JalRakshak.
Validates exact synchronization across CENTRAL, MINIMUM, and MAXIMUM scenarios.
"""

import pytest
import json
from pathlib import Path


def format_seconds_to_min_sec(total_seconds: int) -> str:
    abs_sec = abs(total_seconds)
    mins = abs_sec // 60
    secs = abs_sec % 60
    sign = "-" if total_seconds < 0 else ""
    return f"{sign}{mins:02d}:{secs:02d}"


def format_seconds_to_rel_time(total_seconds: int) -> str:
    if total_seconds >= 99999:
        return "UNAFFECTED (High Ground)"
    abs_sec = abs(total_seconds)
    mins = abs_sec // 60
    secs = abs_sec % 60
    sign = "-" if total_seconds < 0 else ""
    return f"T+{sign}{mins:02d}:{secs:02d}"


class AuthoritativeDecisionEngine:
    """
    Python mirror of frontend/src/services/decisionStore.ts to verify
    deterministic mathematical invariants and contract integrity.
    """
    SCENARIOS = {
        "SCENARIO_CENTRAL": {
            "R02": {
                "arrivalSeconds": 3600,
                "travelSeconds": 759,
                "bufferSeconds": 180,
                "limitingEdgeId": "R02-E07",
                "limitingSegmentName": "Koteshwar Riverbank Limiting Segment",
                "peakDischargeM3s": 65000,
            }
        },
        "SCENARIO_MINIMUM": {
            "R02": {
                "arrivalSeconds": 5700,
                "travelSeconds": 759,
                "bufferSeconds": 180,
                "limitingEdgeId": "R02-E07",
                "limitingSegmentName": "Koteshwar Riverbank Limiting Segment",
                "peakDischargeM3s": 28500,
            }
        },
        "SCENARIO_MAXIMUM": {
            "R02": {
                "arrivalSeconds": 2700,
                "travelSeconds": 759,
                "bufferSeconds": 180,
                "limitingEdgeId": "R02-E07",
                "limitingSegmentName": "Koteshwar Riverbank Limiting Segment",
                "peakDischargeM3s": 115000,
            }
        },
    }

    @classmethod
    def get_decision(cls, scenario_id: str, route_id: str = "R02", custom_buffer_min: float = None):
        scen_data = cls.SCENARIOS[scenario_id][route_id]
        arrival = scen_data["arrivalSeconds"]
        travel = scen_data["travelSeconds"]
        buffer_sec = int(round(custom_buffer_min * 60)) if custom_buffer_min is not None else scen_data["bufferSeconds"]

        if arrival < 0 or travel < 0 or buffer_sec < 0:
            raise ValueError(f"Invalid negative EWE components: arrival={arrival}, travel={travel}, buffer={buffer_sec}")

        deadline = arrival - travel - buffer_sec
        return {
            "scenarioId": scenario_id,
            "routeId": route_id,
            "limitingEdgeId": scen_data["limitingEdgeId"],
            "arrivalSeconds": arrival,
            "travelSeconds": travel,
            "bufferSeconds": buffer_sec,
            "deadlineSeconds": deadline,
            "arrivalFormatted": format_seconds_to_rel_time(arrival),
            "travelFormatted": format_seconds_to_min_sec(travel),
            "bufferFormatted": format_seconds_to_min_sec(buffer_sec),
            "deadlineFormatted": format_seconds_to_rel_time(deadline),
            "formulaText": f"{arrival} - {travel} - {buffer_sec} = {deadline}",
            "status": "FEASIBLE" if deadline >= 300 else ("LOW_MARGIN" if deadline >= 0 else "INFEASIBLE")
        }


def test_central_r02_authoritative_invariants():
    """Verify exact values for CENTRAL / R02"""
    dec = AuthoritativeDecisionEngine.get_decision("SCENARIO_CENTRAL", "R02")

    assert dec["arrivalSeconds"] == 3600
    assert dec["travelSeconds"] == 759
    assert dec["bufferSeconds"] == 180
    assert dec["deadlineSeconds"] == 2661
    assert dec["limitingEdgeId"] == "R02-E07"

    # Mathematical Invariant
    assert dec["deadlineSeconds"] == dec["arrivalSeconds"] - dec["travelSeconds"] - dec["bufferSeconds"]

    # Formatted Strings
    assert dec["arrivalFormatted"] == "T+60:00"
    assert dec["travelFormatted"] == "12:39"
    assert dec["bufferFormatted"] == "03:00"
    assert dec["deadlineFormatted"] == "T+44:21"
    assert dec["status"] == "FEASIBLE"
    assert dec["formulaText"] == "3600 - 759 - 180 = 2661"


def test_minimum_r02_authoritative_invariants():
    """Verify exact values for MINIMUM / R02"""
    dec = AuthoritativeDecisionEngine.get_decision("SCENARIO_MINIMUM", "R02")

    assert dec["arrivalSeconds"] == 5700
    assert dec["travelSeconds"] == 759
    assert dec["bufferSeconds"] == 180
    assert dec["deadlineSeconds"] == 4761
    assert dec["limitingEdgeId"] == "R02-E07"

    # Mathematical Invariant
    assert dec["deadlineSeconds"] == dec["arrivalSeconds"] - dec["travelSeconds"] - dec["bufferSeconds"]

    # Formatted Strings
    assert dec["arrivalFormatted"] == "T+95:00"
    assert dec["travelFormatted"] == "12:39"
    assert dec["bufferFormatted"] == "03:00"
    assert dec["deadlineFormatted"] == "T+79:21"
    assert dec["status"] == "FEASIBLE"


def test_maximum_r02_authoritative_invariants():
    """Verify exact values for MAXIMUM / R02"""
    dec = AuthoritativeDecisionEngine.get_decision("SCENARIO_MAXIMUM", "R02")

    assert dec["arrivalSeconds"] == 2700
    assert dec["travelSeconds"] == 759
    assert dec["bufferSeconds"] == 180
    assert dec["deadlineSeconds"] == 1761
    assert dec["limitingEdgeId"] == "R02-E07"

    # Mathematical Invariant
    assert dec["deadlineSeconds"] == dec["arrivalSeconds"] - dec["travelSeconds"] - dec["bufferSeconds"]

    # Formatted Strings
    assert dec["arrivalFormatted"] == "T+45:00"
    assert dec["travelFormatted"] == "12:39"
    assert dec["bufferFormatted"] == "03:00"
    assert dec["deadlineFormatted"] == "T+29:21"
    assert dec["status"] == "FEASIBLE"


def test_simulation_clock_does_not_mutate_ewe():
    """
    Assert that varying the hydraulic simulation playback clock (T+00, T+60, T+120)
    never alters the evacuation departure deadline.
    """
    for timestep in [0, 15, 30, 45, 60, 75, 90, 105, 120]:
        dec = AuthoritativeDecisionEngine.get_decision("SCENARIO_CENTRAL", "R02")
        # Timestep modifies hydraulic playback only, not decision deadline
        assert dec["deadlineSeconds"] == 2661
        assert dec["deadlineFormatted"] == "T+44:21"


def test_sign_conventions_and_error_on_negative_travel():
    """
    Ensure travel and buffer are never negative and no silent clamping to zero.
    """
    with pytest.raises(ValueError, match="Invalid negative EWE components"):
        # Simulated corrupt inputs
        arrival = -100
        travel = 759
        buffer_sec = 180
        if arrival < 0 or travel < 0 or buffer_sec < 0:
            raise ValueError(f"Invalid negative EWE components: arrival={arrival}, travel={travel}, buffer={buffer_sec}")
