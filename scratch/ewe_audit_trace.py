import os
import json
from datetime import datetime, timezone
from backend.app.domain.database import db
from backend.app.domain.ewe_engine import EvacuationWindowEngine, EWE_ALGORITHM_VERSION

def generate_audit():
    ewe = EvacuationWindowEngine(db.roads, db.evacuation_points)
    now_utc = datetime(2026, 9, 23, 20, 0, 0, tzinfo=timezone.utc)
    departure_str = now_utc.strftime("%Y-%m-%dT%H:%M:%SZ")

    routes_to_trace = [
        ("scen-tehri-001-baseline", "Scenario A — Baseline (50m, 15min)", "N-MALIDEWAL", "N-CHAMBA", "Malidewal -> Chamba Shelter"),
        ("scen-tehri-001-baseline", "Scenario A — Baseline (50m, 15min)", "N-MALIDEWAL", "N-KOTESHWAR", "Malidewal -> Koteshwar Settlement"),
        ("scen-tehri-002-catastrophic", "Scenario B — Catastrophic (120m, 8min)", "N-MALIDEWAL", "N-CHAMBA", "Malidewal -> Chamba Shelter"),
        ("scen-tehri-002-catastrophic", "Scenario B — Catastrophic (120m, 8min)", "N-SHIVPURI", "N-KUNJAPURI", "Shivpuri -> Kunjapuri Ridge"),
        ("scen-tehri-002-catastrophic", "Scenario B — Catastrophic (120m, 8min)", "N-TAPOVAN", "N-NARENDRANAGAR", "Tapovan -> Narendra Nagar")
    ]

    audit_records = []

    for sc_id, sc_name, origin, dest, label in routes_to_trace:
        sc = db.get_scenario(sc_id)
        edge_hyd = sc["edge_hydraulics"]
        
        # Evaluate route
        results = ewe.analyze_evacuation(
            origin_node=origin,
            dest_node=dest,
            edge_hydraulics=edge_hyd,
            departure_dt=now_utc,
            safety_buffer_min=3.0,
            depth_limit_m=0.3,
            velocity_limit_mps=1.0
        )

        for route_idx, route in enumerate(results):
            edge_candidates = []
            calculated_candidates = []
            
            for e in route["edges"]:
                a_i = e["flood_arrival_s"] if e["flood_arrival_s"] is not None else 99999
                t_i = round(e["cumulative_travel_min"] * 60.0, 1)
                b = 180.0 # 3 min
                cand = a_i - t_i - b if a_i < 99999 else float("inf")
                calculated_candidates.append(cand)
                
                edge_candidates.append({
                    "edge_id": e["edge_id"],
                    "u": e["u"],
                    "v": e["v"],
                    "road_class": e["road_class"],
                    "length_m": e["length_m"],
                    "travel_time_min": e["travel_time_min"],
                    "cumulative_travel_time_s": t_i,
                    "flood_arrival_s": a_i if a_i < 99999 else None,
                    "safety_buffer_s": b,
                    "deadline_candidate_s": cand if cand != float("inf") else None,
                    "depth_m": e["max_depth_m"],
                    "velocity_mps": e["max_velocity_mps"],
                    "depth_threshold_m": 0.3,
                    "velocity_threshold_mps": 1.0,
                    "edge_feasible": e["edge_feasible"],
                    "failure_reason": e["failure_reason"]
                })

            # Mathematical verification: D_deadline = min_i(cand_i)
            finite_cands = [c for c in calculated_candidates if c != float("inf")]
            computed_min = min(finite_cands) if finite_cands else float("inf")
            
            record = {
                "scenario_id": sc_id,
                "scenario_name": sc_name,
                "route_label": label,
                "route_path": route["name"],
                "departure_time_utc": departure_str,
                "safety_buffer_min": 3.0,
                "algorithm_version": EWE_ALGORITHM_VERSION,
                "mathematical_formula": "D_deadline = min_i(A_i - T_i - B)",
                "calculated_min_candidate_s": computed_min if computed_min != float("inf") else "INFINITE_SAFE",
                "derived_margin_min": route["margin_min"],
                "derived_deadline_utc": route["deadline_utc"],
                "route_status": route["status"],
                "limiting_edge": route["limiting_segment"]["road_id"] if route["limiting_segment"] else None,
                "explanation": route["explanation"],
                "edge_candidates": edge_candidates
            }
            audit_records.append(record)

    out_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "ewe_audit_manifest.json"))
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(audit_records, f, indent=2)

    print(f"Generated {len(audit_records)} machine-readable EWE lineage audit records.")

if __name__ == "__main__":
    generate_audit()
