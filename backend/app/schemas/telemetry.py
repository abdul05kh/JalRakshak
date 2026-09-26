from pydantic import BaseModel, Field
from datetime import datetime

class ReservoirTelemetryReading(BaseModel):
    station_id: str
    timestamp_utc: datetime
    water_elevation_m: float = Field(..., ge=500.0, le=900.0)
    inflow_discharge_cumecs: float = Field(..., ge=0.0)
    spillway_discharge_cumecs: float = Field(..., ge=0.0)
    pore_water_pressure_kpa: float = Field(..., ge=0.0)
    seismograph_pga_g: float = Field(default=0.0, ge=0.0)
