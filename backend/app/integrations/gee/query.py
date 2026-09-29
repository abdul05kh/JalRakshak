"""
GEE Scene Query Builder & Remote Sensing Pipeline.

Constructs catalog search queries for Sentinel-1 Synthetic Aperture Radar (SAR)
and Sentinel-2 MultiSpectral Instrument (MSI) over specified study areas.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta


class GEEQueryBuilder:
    """Builds remote sensing query parameters for open-source flood datasets."""

    def __init__(self, auth_provider):
        self.auth = auth_provider

    def build_sentinel1_flood_query(
        self,
        bbox: List[float],
        event_date: str,
        pre_event_days: int = 15,
        post_event_days: int = 5,
        polarization: str = "VH"
    ) -> Dict[str, Any]:
        """
        Builds a structured SAR query for dual-temporal flood extent extraction.
        
        Args:
            bbox: [min_lon, min_lat, max_lon, max_lat]
            event_date: YYYY-MM-DD
            pre_event_days: baseline dry-period window
            post_event_days: post-breach/flood observation window
            polarization: 'VH' or 'VV' (VH is preferred for inland water roughness contrast)
        """
        evt_dt = datetime.strptime(event_date, "%Y-%m-%d")
        pre_start = (evt_dt - timedelta(days=pre_event_days)).strftime("%Y-%m-%d")
        pre_end = evt_dt.strftime("%Y-%m-%d")
        post_start = evt_dt.strftime("%Y-%m-%d")
        post_end = (evt_dt + timedelta(days=post_event_days)).strftime("%Y-%m-%d")

        return {
            "dataset": "COPERNICUS/S1_GRD",
            "bbox": bbox,
            "instrument_mode": "IW",
            "polarization": polarization,
            "orbit_pass": "DESCENDING",
            "pre_event_window": [pre_start, pre_end],
            "post_event_window": [post_start, post_end],
            "processing_algorithm": "Bitemporal SAR Backscatter Ratio (Otsu Thresholding)",
            "output_layer_name": "OBSERVED_REMOTE_SENSING_FLOOD_EXTENT"
        }
