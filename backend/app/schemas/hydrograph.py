from pydantic import BaseModel, Field
from typing import List

class HydrographPoint(BaseModel):
    timestamp_seconds: float = Field(..., ge=0.0, description="Elapsed time in seconds from breach inception")
    discharge_m3s: float = Field(..., ge=0.0, description="Instantaneous outflow rate in cubic meters per second")
    stage_elevation_m: float = Field(..., ge=500.0, le=1000.0, description="Water surface elevation at breach section")

class BreachHydrograph(BaseModel):
    scenario_id: str
    peak_discharge_m3s: float = Field(..., gt=0.0)
    time_to_peak_seconds: float = Field(..., gt=0.0)
    total_outflow_volume_m3: float = Field(..., gt=0.0)
    time_series: List[HydrographPoint]
