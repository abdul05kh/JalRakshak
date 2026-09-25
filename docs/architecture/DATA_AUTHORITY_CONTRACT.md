# DATA AUTHORITY CONTRACT

**Document:** Data Ownership & Authority Contract  
**Version:** RC2.1  
**Status:** ACTIVE  

---

## 1. Principles of Data Ownership

1. **Hydraulic Mathematics Authority:** Native HEC-RAS 2D unsteady flow models ($Q_p = 65,000\text{ m}^3/\text{s}$ to $152,000\text{ m}^3/\text{s}$) produce authoritative water surface elevation (WSE), depth ($h$), velocity ($v$), and arrival times ($t_{arr}$).
2. **Decision Engine Authority:** Backend Evacuation Window Estimation (EWE) engine is the sole calculator of limiting segments, departure deadlines, travel times, and feasibility status ($D = \min_i(A_i - T_i - B)$).
3. **Terrain Authority:** Copernicus GLO-30 DSM ($30\text{m}$ resolution) binary is the sole ground elevation authority.
4. **Frontend Responsibility:** Presentation, spatial rendering, UI interaction, animation, and telemetry inspection. The frontend is **STRICTLY FORBIDDEN** from independently calculating decision logic or fabricating missing elevation data.

---

## 2. Field Ownership Matrix

| Field | Source Authority | Processing Engine | Presentation Consumer |
| :--- | :--- | :--- | :--- |
| `elevation_m` | Copernicus GLO-30 DSM Binary | `GLO30ElevationLayer.ts` (Bilinear Interpolation) | `ArcGISSceneViewer.tsx` Ground |
| `max_depth_m` / `arrival_min` | HEC-RAS 2D Model | Backend `hecras_adapter.py` | `ArcGISHydraulicLayer.ts` |
| `latest_departure_time` | Backend EWE Service | `ewe_engine.py` | `DecisionBadge.tsx` (`LEAVE BY`) |
| `limiting_edge_id` | Backend EWE Service | `ewe_engine.py` | `ArcGISRoadLayer.ts` (Crimson Highlight) |
| `travel_time_min` | Static Road Graph ($v=50\text{ km/h}$) | `ewe_engine.py` | `RoadTelemetryDrawer.tsx` |
| `status` | EWE Feasibility ($D \ge 0$) | `ewe_engine.py` | `DecisionBadge.tsx` (`FEASIBLE` / `UNFEASIBLE`) |
