# RC2.1 BROWSER VERIFICATION & PROOF OF RENDERING

**Document:** RC2.1 Browser Verification Report  
**Date:** September 26, 2026  
**Artifact Recording:** `rc21_browser_verify_1790369011313.webp`  

---

## 1. Verified Visual Surfaces & Components

During browser subagent execution at `http://localhost:5173/`, the following were independently verified in the Chromium engine:

### A. 3D Himalayan Topography (GLO-30 DSM)
- Elevation model loaded: Copernicus GLO-30 DSM ($1,100 \times 1,000$ grid).
- Tile fetch metrics: $242 / 242$ tiles fetched ($100\%$).
- Elevation query at cursor: $1,162.40\text{ m MSL}$ (Valley crest) and $916.80\text{ m MSL}$ (Riverbed).
- Zero flat synthetic fallbacks ($600\text{m}$ / $830\text{m}$).

### B. Evacuation Route & Limiting Edge Visualization
- Authoritative Route R02 displayed across Himalayan terrain.
- Limiting edge `R02-E07` highlighted in high-contrast crimson red ($6.0\text{px}$ width).
- Clicking `R02-E07` opens the telemetry drawer displaying edge length ($1.1\text{ km}$), travel time ($02:39$), flood arrival ($T+60:00$), and safety margin ($+44:21$).

### C. Backend Evacuation Window Estimation (EWE)
- Central Scenario ($Q_p = 65,000\text{ m}^3/\text{s}$):
  - **Status:** `FEASIBLE`
  - **Leave By:** `T+44:21`
  - **Flood Arrival ($A$):** `T+60:00`
  - **Travel Time ($T$):** `12:39`
  - **Safety Buffer ($B$):** `03:00`
  - **Formula:** $60:00 - 12:39 - 03:00 = 44:21$.
- Extreme Scenario ($Q_p = 152,000\text{ m}^3/\text{s}$):
  - **Status:** `UNFEASIBLE`
  - **Leave By:** `T-02:40` (Negative margin; evacuation impossible prior to inundation).

### D. Camera Presets
- Verified 3D camera viewpoints: `OVERVIEW`, `TEHRI DAM`, `BREACH`, `ROUTE R02`, `LIMITING R02-E07`, `CHAMBA SHELTER`.

### E. Diagnostic Console
- Route `/arcgis-terrain-test` live with real-time WebGL, SceneView, tile requests, and container dimension indicators.
