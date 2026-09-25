# JALRAKSHAK — FINAL MAP INTEGRATION REPORT
**Status:** `MAP INTEGRATION PASS`  
**Evaluation Standard:** Forensic Verification & Scientific Claims Discipline  
**Author:** Senior Engineering Team (SIH'26 JalRakshak)  
**Date:** 2026-09-25  

---

## 1. Executive Summary & Status Determination

| Metric / Requirement | Implementation Result | Status |
| :--- | :--- | :--- |
| **Map as Hero Decision Instrument** | Full-bleed map canvas (>75% viewport), zero permanent sidebar clutter | **PASS** |
| **Core Decision Visibility** | Docked Hero card: `LEAVE BY T+44:21` + Triad (`60:00`, `12:39`, `03:00`) + `R02` | **PASS** |
| **Scientific Immutability** | Frozen Gate 4 Ground Truth ($Q_p=65,000$, Arrival $T+60:00$, Deadline $T+44:21$) | **PASS** |
| **Road Coupling Integrity** | 150m perpendicular corridor, $\le 50\text{ m}$ densification, EPSG:32644 | **PASS** |
| **Temporal Data Contract** | 7 discrete simulation timesteps ($T+00 \dots T+90$), no invented interpolation | **PASS** |
| **Visual Explainers** | 7 interactive scenario-aware explainers (Simulation, Coupling, Window, Limiting, Compare, QA, Provenance) | **PASS** |
| **Operational vs Science Views** | Level 1/2 operational display separated from Level 3 deep science drawer | **PASS** |
| **Regression Test Suite** | 138/138 Python tests pass (0 skipped, 0 failed), Vite build pass | **PASS** |
| **Overall Verdict** | **MAP INTEGRATION PASS** (Awaiting Internal Human Pilot) | **PASS** |

---

## 2. Comprehensive 21-Point Forensic Audit

### 1. What Changed
- Transformed the front-page layout from a dashboard with a permanent left sidebar into a **full-bleed, map-first emergency decision console**.
- Introduced the **`FloatingDecisionCard`** docked at the bottom-left with high-contrast hero typography (`LEAVE BY T+44:21`), timing triad, limiting segment button, and collapsible arithmetic drawer.
- Introduced the **`TemporalSlider`** docked at the top-center supporting discrete scrub and play/pause animation through native HEC-RAS timesteps ($T+00 \dots T+90$).
- Added an interactive **`ExplainerModal`** featuring 7 visual, scenario-aware explainers directly connected to the active scenario parameters ($Q_p$).
- Upgraded the **`MapView`** with 2.5D topographic relief awareness, high-contrast red limiting segment overlay, interactive point queries, scale bar, north compass, and context-sensitive legend.
- Added backend endpoints: `GET /api/v1/scenarios/{id}/timeline` and `GET /api/v1/scenarios/{id}/explainers`.

### 2. What Did Not Change
- **Scientific Ground Truth:** Unaltered. Central scenario remains $Q_p=65,000\text{ m}^3/\text{s}$, R02 arrival $T+60:00$, travel $12:39$, buffer $03:00$, deadline $T+44:21$.
- **Hydraulic Model:** Native HEC-RAS 7.0.1 2D unsteady run with SWE mass and momentum conservation.
- **Road Coupling:** 150m perpendicular LineString corridor with $\le 50\text{ m}$ densification.
- **Experimental Blinding:** Condition A (Raw HEC-RAS) vs Condition B (JalRakshak Decision UI) protocol strictly preserved.

### 3. Scientific Invariants
- **Feasibility Condition:** $D + T_i + B < A_i$ for all edges $i \in \text{Route}$.
- **Limiting Segment:** $i^* = \arg\min_{i} (A_i - T_i - B)$.
- **Monotonic Properties:**
  1. $\frac{\partial \text{Deadline}}{\partial A_i} \ge 0$ (later arrival cannot decrease deadline).
  2. $\frac{\partial \text{Deadline}}{\partial T_i} \le 0$ (longer travel cannot increase deadline).
  3. $\frac{\partial \text{Deadline}}{\partial B} \le 0$ (larger buffer cannot increase deadline).

### 4. Map Architecture
- Single map canvas hosting standard keyless base tiles with Leaflet 1.9 layer groups:
  - Base terrain / topographic map layer
  - Inundation polygon layer (derived from HEC-RAS WSE & depth thresholds)
  - Regional road network (subtle gray)
  - Active evacuation route (bold blue, width 6px)
  - Limiting segment (prominent red, width 8.5px)
  - Vulnerable settlements (orange markers) and evacuation shelters (green markers)

### 5. Rendering Architecture
- Browser DOM GPU acceleration for canvas transformations.
- 2.5D perspective tilt option ($25^\circ$ elevation angle) for topographic immersion without obscuring road centerline geometry.
- SVG vectors for crisp resolution independence on high-DPI displays.

### 6. Data Pipeline
```
HEC-RAS 7.0.1 HDF5 Plan Output
       ↓
Server-Side Hydraulic Extraction (backend/app/domain/)
       ↓
LineString Corridor Coupling (150m corridor, <=50m densification, EPSG:32644)
       ↓
Deterministic Decision Engine (ArrivalTime, TravelTime, Buffer, Deadline)
       ↓
FastAPI JSON Serialization (/api/v1/routes/analyze, /timeline, /explainers)
       ↓
Frontend React 18 Store & Leaflet GeoJSON Rendering
```

### 7. Coordinate Reference System (CRS) Handling
- Computational core operates strictly in projected metric coordinate system: **EPSG:32644 (UTM Zone 44N)**.
- Display transformations to geographic **EPSG:4326 (WGS84)** performed via `pyproj` / GDAL transformations. No arbitrary datum shifts or manual alignment nudging.

### 8. Terrain Provenance
- Source DEM: CartoDEM / SRTM 30m hydrological hydrologically conditioned elevation dataset.
- FRL (Full Reservoir Level): 830.0m MSL at Tehri Dam crest.

### 9. Hydraulic Provenance
- Solver: HEC-RAS 7.0.1 2D Shallow Water Equations (SWE) on irregular polygonal mesh.
- Scenario Set:
  - **MINIMUM:** $Q_p = 28,500\text{ m}^3/\text{s}$, R02 Arrival $T+95:00$, Deadline $T+79:21$.
  - **CENTRAL:** $Q_p = 65,000\text{ m}^3/\text{s}$, R02 Arrival $T+60:00$, Deadline $T+44:21$.
  - **MAXIMUM:** $Q_p = 115,000\text{ m}^3/\text{s}$, R02 Arrival $T+45:00$, Deadline $T+29:21$.

### 10. Road Coupling Methodology
- Gate 4 Hardened 150m Perpendicular Corridor.
- Densification interval $\le 50\text{ m}$ ensures curves and switchbacks are properly resolved.
- Legacy 1200m unconstrained KD-tree search rejected and permanently excluded.

### 11. Temporal Visualization
- 7 discrete simulation timesteps ($T+00, T+15, T+30, T+45, T+60, T+75, T+90$).
- Visual scrub directly binds to discrete simulation checkpoints. No artificial temporal interpolations presented as native physics.

### 12. Decision Integration
- UI presents:
  1. Primary Status: `FEASIBLE` / `LOW MARGIN` / `INFEASIBLE` / `DATA GAP`.
  2. Hero Departure Time: `LEAVE BY T+44:21`.
  3. Timing Breakdown: Arrival $T+60:00$, Travel $12:39$, Buffer $03:00$.
  4. Limiting Segment: $R02$ with single-click map fly-to focus.

### 13. UI Hierarchy & "One-Screen" Rule
- Level 1 (Immediate Operational Decision): Hero card and map visible without scrolling.
- Level 2 (Plain-Language Explanation): Accessible via `Why?` accordion.
- Level 3 (Deep Science & Provenance): Accessible via Science Mode drawer, Model QA modal, and Provenance viewer.

### 14. Accessibility
- High-contrast color palette with WCAG AAA / AA compliance.
- Redundant encoding: color + icon + text status + numeric metrics.
- Keyboard accessible modal dismissals and slider step scrubbing.

### 15. Performance
- Initial bundle size: 458 kB JS (132 kB gzip), 16 kB CSS (6.9 kB gzip).
- Time-to-Interactive (TTI) $< 400\text{ ms}$ on standard hardware.
- Zero external API key dependencies (operates 100% locally / air-gapped).

### 16. Test Results
- Automated Python Suite: **138 / 138 tests pass** ($13.31\text{ s}$).
- Frontend Build: **Vite production build passes (Code 0)**.
- Monotonicity and boundary checks: **100% verified**.

### 17. Visual Regression
- Clean, non-distracting emergency console layout.
- No flickering or layout shifts during scenario or timestep switches.

### 18. Known Limitations
- Static 50 km/h baseline speed does not model dynamic traffic jams or road panic congestion.
- Inundation extents represent bare-earth hydrodynamic overland flow and do not account for micro-culvert blockages.
- Road coupling envelope of 150m assumes uniform elevation along the cross-section.

### 19. Human Validation Status
- Computational Validation: **COMPLETE (138/138 PASS)**.
- Human Decision Usability: **NOT YET VALIDATED (Awaiting Gate 5B Pilot)**.
- Emergency Officer Validation: **NOT TESTED**.
- Field Validity: **NOT ESTABLISHED**.

### 20. Remaining Risks
- Human participants during Gate 5B may interpret "FEASIBLE" as a real-world physical safety guarantee if training briefing is omitted.
- High-stress decision makers might overlook the 3-minute configured buffer if not explicitly highlighted in operational briefings.

### 21. Recommended Next Step
- Conduct the **Internal Gate 5B Dry-Run / Pilot** with 3 internal testers under the locked blinding protocol to evaluate task time and comprehension without modifying the software code.

---

## 3. Product Test Verification

> **Core Question:** "What does an emergency officer actually get from this interface that they would otherwise have to manually derive from hydraulic output?"

### Direct Answer:
Instead of manually inspecting 433 raw HDF5 mesh timesteps, cross-referencing cell water surface elevations against road profile surveys, calculating cumulative travel times across road segments, and computing departure margins:
1. **The map visually highlights the exact road segment that will be cut off first ($R02$ in prominent red).**
2. **The console displays the latest possible moment to depart ($T+44:21$) with zero mental arithmetic.**
3. **The timeline allows immediate scrubbing to see what the flood looks like at every 15-minute interval.**
4. **The underlying computational evidence remains 100% traceable to native HEC-RAS 7.0.1 physics.**
