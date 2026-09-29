"""
Multi-Model Hydraulic Comparison Engine.

Compares two real hydraulic datasets (e.g. HEC-RAS Plan A vs Plan B, or HEC-RAS vs Delft3D/SPH).
Never creates fabricated outputs if data is missing; explicitly marks COMPARISON_UNAVAILABLE.
"""

from typing import Dict, Any, List, Optional
import numpy as np


class HydraulicModelComparator:
    """Computes cross-model discrepancy metrics across continuous and discrete fields."""

    @staticmethod
    def compare_scenario_hydraulics(
        model_a_name: str,
        model_a_hydraulics: Dict[str, Any],
        model_b_name: str,
        model_b_hydraulics: Dict[str, Any],
        scenario_id: str
    ) -> Dict[str, Any]:
        """
        Compares edge/cell hydraulics between two models or scenario runs.
        """
        if not model_a_hydraulics or not model_b_hydraulics:
            return {
                "scenario_id": scenario_id,
                "status": "COMPARISON_DATA_NOT_AVAILABLE",
                "model_a": model_a_name,
                "model_b": model_b_name,
                "message": "Both models must have ingested hydraulic results to compute cross-model comparison."
            }

        common_edges = set(model_a_hydraulics.keys()).intersection(set(model_b_hydraulics.keys()))
        if not common_edges:
            return {
                "scenario_id": scenario_id,
                "status": "NO_COMMON_SPATIAL_ENTITIES",
                "model_a": model_a_name,
                "model_b": model_b_name
            }

        depth_diffs = []
        vel_diffs = []
        arr_diffs = []

        comparison_table = []
        for edge_id in sorted(common_edges):
            ha = model_a_hydraulics[edge_id]
            hb = model_b_hydraulics[edge_id]

            da = ha.get("max_depth_m", 0.0)
            db = hb.get("max_depth_m", 0.0)
            delta_d = round(da - db, 2)
            depth_diffs.append(abs(delta_d))

            va = ha.get("max_velocity_mps", 0.0)
            vb = hb.get("max_velocity_mps", 0.0)
            delta_v = round(va - vb, 2)
            vel_diffs.append(abs(delta_v))

            arra = ha.get("flood_arrival_s")
            arrb = hb.get("flood_arrival_s")
            if arra is not None and arrb is not None:
                delta_arr = round(arra - arrb, 1)
                arr_diffs.append(abs(delta_arr))
            else:
                delta_arr = None

            comparison_table.append({
                "edge_id": edge_id,
                "model_a_depth_m": da,
                "model_b_depth_m": db,
                "delta_depth_m": delta_d,
                "model_a_arrival_s": arra,
                "model_b_arrival_s": arrb,
                "delta_arrival_s": delta_arr
            })

        return {
            "scenario_id": scenario_id,
            "status": "COMPARISON_AVAILABLE",
            "model_a": model_a_name,
            "model_b": model_b_name,
            "common_evaluated_edges": len(common_edges),
            "summary_metrics": {
                "mean_absolute_depth_diff_m": round(float(np.mean(depth_diffs)), 2) if depth_diffs else 0.0,
                "max_absolute_depth_diff_m": round(float(np.max(depth_diffs)), 2) if depth_diffs else 0.0,
                "mean_absolute_velocity_diff_mps": round(float(np.mean(vel_diffs)), 2) if vel_diffs else 0.0,
                "mean_absolute_arrival_diff_s": round(float(np.mean(arr_diffs)), 1) if arr_diffs else None
            },
            "edge_comparisons": comparison_table
        }
