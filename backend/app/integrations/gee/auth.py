"""
Google Earth Engine (GEE) Authentication & Provider Abstraction.

Manages connection to Google Earth Engine API using Service Account or OAuth credentials.
Truthfully reports CONFIGURED vs NOT_CONFIGURED without faking live satellite data.
"""

import os
from typing import Dict, Any, Optional


class GEEAuthProvider:
    """Manages Google Earth Engine authentication state."""

    def __init__(self):
        self.service_account = os.getenv("GEE_SERVICE_ACCOUNT")
        self.private_key_path = os.getenv("GEE_PRIVATE_KEY_PATH")
        self.project_id = os.getenv("GEE_PROJECT_ID", "jalrakshak-sih26")
        self._is_initialized = False
        self._auth_error: Optional[str] = None

    def initialize(self) -> bool:
        """Attempts real initialization if ee and credentials are present."""
        try:
            import ee
            if self.service_account and self.private_key_path and os.path.exists(self.private_key_path):
                credentials = ee.ServiceAccountCredentials(self.service_account, self.private_key_path)
                ee.Initialize(credentials, project=self.project_id)
                self._is_initialized = True
                self._auth_error = None
                return True
            else:
                self._is_initialized = False
                self._auth_error = "GEE credentials not provided in environment (GEE_SERVICE_ACCOUNT / GEE_PRIVATE_KEY_PATH)"
                return False
        except ImportError:
            self._is_initialized = False
            self._auth_error = "earthengine-api Python package is not installed."
            return False
        except Exception as e:
            self._is_initialized = False
            self._auth_error = str(e)
            return False

    def get_status(self) -> Dict[str, Any]:
        """Returns truthful operational status of GEE provider."""
        return {
            "status": "CONFIGURED" if self._is_initialized else "NOT_CONFIGURED",
            "provider": "Google Earth Engine",
            "supported_sensors": ["COPERNICUS/S1_GRD (Sentinel-1 SAR)", "COPERNICUS/S2_SR_HARMONIZED (Sentinel-2 MSI)"],
            "project_id": self.project_id if self._is_initialized else None,
            "error_detail": self._auth_error,
            "scientific_disclaimer": "Observed remote sensing flood extent represents satellite imagery classification and is not an automated recalibration of 2D hydrodynamic simulations."
        }
