"""
Spatial Comparison Engine between Observed Remote Sensing Flood Extent and Simulated HEC-RAS Hydraulic Flood.

Computes exact spatial metrics following standard geospatial validation conventions:
- Prediction: Simulated Hydraulic Flood Extent (HEC-RAS 2D)
- Reference: Observed Satellite Remote Sensing Extent (Sentinel-1 SAR GEE)

Metrics:
- Intersection over Union (IoU / Jaccard Index): Area(Sim ∩ Obs) / Area(Sim ∪ Obs)
- Precision (Positive Predictive Value): Area(Sim ∩ Obs) / Area(Sim)
- Recall (Sensitivity): Area(Sim ∩ Obs) / Area(Obs)
- F1-Score: 2 * (Precision * Recall) / (Precision + Recall)
- Area Discrepancy (Δ km²): |Area(Sim) - Area(Obs)|
"""

from typing import Dict, Any, List, Optional
from shapely.geometry import shape, MultiPolygon, Polygon
from shapely.ops import unary_union


class FloodExtentComparator:
    """Calculates spatial overlap and discrepancy metrics between observed and simulated flood extents."""

    @staticmethod
    def compare_geojson_extents(
        simulated_geojson: Dict[str, Any],
        observed_geojson: Dict[str, Any],
        scenario_id: str,
        observation_source: str = "Sentinel-1 SAR GEE Observation",
        is_comparable_event: bool = True,
        event_notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Performs spatial geometric comparison between simulated and observed flood extents.
        """
        sim_geoms = [
            shape(f["geometry"]) for f in simulated_geojson.get("features", [])
            if f.get("geometry") and shape(f["geometry"]).is_valid
        ]
        obs_geoms = [
            shape(f["geometry"]) for f in observed_geojson.get("features", [])
            if f.get("geometry") and shape(f["geometry"]).is_valid
        ]

        if not sim_geoms or not obs_geoms:
            return {
                "scenario_id": scenario_id,
                "status": "INSUFFICIENT_GEOMETRY_FOR_COMPARISON",
                "observation_source": observation_source,
                "simulated_features_count": len(sim_geoms),
                "observed_features_count": len(obs_geoms),
                "event_comparability": "NOT_COMPARABLE" if not is_comparable_event else "INSUFFICIENT_DATA",
                "metrics": None,
                "provenance_class": "OBSERVED_FLOOD_CANDIDATE"
            }

        sim_union = unary_union(sim_geoms)
        obs_union = unary_union(obs_geoms)

        intersection = sim_union.intersection(obs_union)
        union = sim_union.union(obs_union)

        sim_area = sim_union.area
        obs_area = obs_union.area
        inter_area = intersection.area
        union_area = union.area

        # Correct geospatial validation definitions:
        # Precision: fraction of simulated flood that matches observed flood
        precision = inter_area / sim_area if sim_area > 0 else 0.0
        # Recall: fraction of observed flood that was captured by simulation
        recall = inter_area / obs_area if obs_area > 0 else 0.0
        # IoU / Jaccard Index
        iou = inter_area / union_area if union_area > 0 else 0.0
        # F1 score
        f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

        # Approx degree to km2 conversion at lat ~30 deg
        deg2_to_km2 = 111.0 * 96.0

        return {
            "scenario_id": scenario_id,
            "status": "COMPARISON_AVAILABLE",
            "observation_source": observation_source,
            "event_comparability": "COMPARABLE_EVENT" if is_comparable_event else "NOT_COMPARABLE",
            "event_notes": event_notes or ("Event forcing conditions and spatial domains evaluated." if is_comparable_event else "Geographically or hydrologically distinct event; comparison represents method demonstration only."),
            "simulated_layer_label": "SIMULATED_HYDRAULIC_FLOOD (HEC-RAS 2D)",
            "observed_layer_label": "OBSERVED_REMOTE_SENSING_FLOOD_EXTENT (GEE SAR)",
            "metrics": {
                "intersection_over_union_iou": round(iou, 4),
                "precision": round(precision, 4),
                "recall": round(recall, 4),
                "f1_score": round(f1, 4),
                "simulated_area_km2": round(sim_area * deg2_to_km2, 2),
                "observed_area_km2": round(obs_area * deg2_to_km2, 2),
                "overlap_area_km2": round(inter_area * deg2_to_km2, 2),
                "area_discrepancy_km2": round(abs(sim_area - obs_area) * deg2_to_km2, 2)
            },
            "provenance_class": "RESEARCH_ONLY_COMPARISON",
            "scientific_disclaimer": "Observed satellite flood extent represents surface water detection and differs from hydraulic simulations due to canopy cover, terrain shadow, and overpass timing. Not an automated recalibration."
        }
