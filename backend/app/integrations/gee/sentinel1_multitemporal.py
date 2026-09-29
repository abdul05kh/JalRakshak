"""
Sentinel-1 Multi-Temporal Statistical Change Detection Workflow.

Methodological Reference:
- Copernicus Sentinel-1 Synthetic Aperture Radar (SAR) Ground Range Detected (GRD)
- Multi-temporal statistical change detection (Log-ratio / Z-score over baseline stack)
- JRC Global Surface Water: Used strictly as HISTORICAL WATER OCCURRENCE screening layer (not permanent 2024 truth)
- Configured Research Screening Parameters: Slope < 10 deg, water proximity, connected pixel cleaning

Provenance Classes:
- OBSERVED_FLOOD_CANDIDATE
- RESEARCH_ONLY
- METHOD_DEMONSTRATION
"""

from typing import Dict, Any, List, Optional
from datetime import datetime


class Sentinel1MultiTemporalPipeline:
    """Configures and documents multi-temporal statistical flood detection."""

    # Authoritative Sentinel-1 Orbit 63 Descending baseline stack for Tehri/Uttarakhand region
    ORBIT_63_TIME_SERIES_2024 = [
        "2024-06-07T00:44:00Z",
        "2024-06-19T00:44:00Z",
        "2024-07-01T00:44:00Z",
        "2024-07-13T00:44:00Z",
        "2024-07-25T00:44:00Z",  # Pre-event reference
        "2024-08-06T00:44:00Z",  # Post-event observation
        "2024-08-18T00:44:00Z",
        "2024-08-30T00:44:00Z",
        "2024-09-11T00:44:00Z",
        "2024-09-23T00:44:00Z"
    ]

    DEFAULT_SCREENING_CONFIG = {
        "slope_threshold_deg": 10.0,
        "slope_source": "Copernicus GLO-30 DSM (Configured Research Screening Parameter)",
        "connected_pixels_min": 8,
        "jrc_occurrence_threshold_pct": 50,
        "jrc_layer_role": "HISTORICAL WATER OCCURRENCE (1984-2021 historical baseline screening)",
        "polarization": "VV & VH dual-polarization ratio"
    }

    @classmethod
    def get_pipeline_manifest(
        cls,
        event_date: str = "2024-08-06",
        mode: str = "RESEARCH_MODE"
    ) -> Dict[str, Any]:
        """Returns the full scientific provenance manifest for the Sentinel-1 pipeline."""
        return {
            "pipeline_name": "Sentinel-1 Multi-Temporal Statistical Change Detection",
            "execution_mode": mode,
            "provenance_class": "RESEARCH_ONLY",
            "satellite_sensor": "Copernicus Sentinel-1 SAR (C-band 5.405 GHz)",
            "acquisition_geometry": {
                "relative_orbit": 63,
                "pass_direction": "DESCENDING",
                "instrument_mode": "IW (Interferometric Wide Swath)",
                "pixel_spacing_m": 10.0
            },
            "temporal_baseline": {
                "pre_event_scene": "2024-07-25T00:44:00Z",
                "post_event_scene": "2024-08-06T00:44:00Z",
                "baseline_stack_scenes_count": len(cls.ORBIT_63_TIME_SERIES_2024)
            },
            "statistical_methodology": {
                "speckle_filter": "Refined Lee (7x7 window)",
                "change_metric": "Log-Ratio Difference: 10 * log10(sigma0_post / sigma0_pre)",
                "threshold_criterion": "Statistical Z-Score (< -2.5 sigma relative to multi-temporal baseline)",
                "dual_pol_combination": "min(VV_diff, VH_diff)"
            },
            "screening_layers": cls.DEFAULT_SCREENING_CONFIG,
            "scientific_limitations": [
                "JRC Global Surface Water occurrence represents historical frequency (1984-2021) and is not a 2024 current water boundary.",
                "Copernicus GLO-30 DSM contains canopy and building heights that can induce false terrain shadowing.",
                "July-August 2024 precipitation events in Balganga valley are geographically distinct from Tehri Dam breach simulations.",
                "Satellite observed flood masks represent surface backscatter depression and are not calibrated ground truth for hydraulic models."
            ]
        }
