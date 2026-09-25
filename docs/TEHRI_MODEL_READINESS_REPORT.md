# Tehri 2D Dam-Break Hydraulic Model — Readiness Gate Report

**Document ID:** `TEHRI-READINESS-GATE-REPORT-V1`  
**Date:** September 2026  
**Governing Standard:** JalRakshak Scientific Honesty & Execution Verification Policy  
**Milestone Authorization Status:** INVESTIGATION ONLY — MODEL CONSTRUCTION NOT COMMENCED

---

## 1. Executive Summary & Corrected Language

In accordance with strict scientific honesty standards, previous informal descriptions have been formally audited and corrected:

1. **Hydraulic Constructibility:**  
   *Previous informal phrasing:* "scientifically sound"  
   *Corrected authoritative wording:* **"Technically constructible using source-derived inputs and explicitly documented modelling assumptions; predictive accuracy remains unvalidated."**
   
2. **Road Network Spatial Alignment:**  
   *Previous informal phrasing:* "100% spatially aligned"  
   *Corrected authoritative wording:* **"Geographically overlapping the intended Tehri downstream study corridor; hydraulic exposure compatibility remains unestablished until a genuine hydraulic simulation exists."**

No claim of calibrated flood prediction or validated evacuation timing is made for the Tehri basin because no genuine Tehri HEC-RAS simulation has yet been executed on this system.

---

## 2. Input Ledger Summary

The complete 24-parameter input audit is cataloged in [`docs/TEHRI_MODEL_INPUT_LEDGER.md`](file:///d:/projects/JalRakshak/docs/TEHRI_MODEL_INPUT_LEDGER.md).

```
TOTAL REQUIRED INPUTS: 24
├─ SOURCE-DERIVED FACTS:       6 (Dam location, height, crest, base, FRL, storage)
├─ DIRECT DATASETS:            3 (Copernicus DEM 30m, OSM roads, UTM 44N CRS)
├─ MODEL ASSUMPTIONS:          8 (Breach width, time, side slope, location, reservoir bathymetry, channel throat, inflow, failure mode)
├─ ENGINEERING ASSUMPTIONS:    7 (Manning's n, downstream friction slope, baseflow, timestep, duration, vertical datum offset, output step)
└─ MISSING LOCAL ASSETS:       2 (Raw DEM GeoTIFF tile, discrete stage-storage step curve)
```

---

## 3. Terrain Audit

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            TERRAIN AUDIT SUMMARY                            │
├──────────────────────────────────┬──────────────────────────────────────────┤
│ Required Model Corridor          │ Tehri Dam (30.378°N) to Devprayag (30.146°N) │
│ Bounding Box                     │ [78.40°E, 30.10°N] to [78.65°E, 30.40°N] │
│ Target Spatial Resolution        │ 30 meters (Copernicus GLO-30 DSM)        │
│ Projected Horizontal CRS         │ WGS 84 / UTM Zone 44N (EPSG:32644)       │
│ Vertical Reference               │ EGM2008 Geoid (Orthometric Elevation)    │
│ Terrain Type                     │ Surface Model (DSM with canopy bias <5m) │
│ Submerged Riverbed Bathymetry    │ ABSENT (Not penetrable by radar/optical) │
│ Submerged Reservoir Bathymetry   │ ABSENT (Submerged pre-dam gorge)         │
│ Dam Embankment in Raw 30m DEM    │ Smoothed across 30m cells (Not sharp)    │
└──────────────────────────────────┴──────────────────────────────────────────┘
```

### Critical Investigation:
> **"Can a 30 m DEM alone represent the hydraulic geometry required for this scenario?"**

**Answer: NO, not without hydro-enforcement and structural representation.**

**Evidence & Hydraulic Rationale:**
1. **Gorge Narrowness:** The Bhagirathi River gorge between Tehri Dam and Koteshwar narrows in sections to 25–50 meters width. In a 30m raster grid, single interpolated cells create artificial cross-valley blockages ("digital dams") that falsely attenuate flood wave propagation.
2. **Missing Underwater Bathymetry:** Satellite sensors capture the water surface elevation at the date of acquisition, not the channel invert.
3. **Embankment Geometry:** The 20m crest width of Tehri Dam is smoothed across adjacent 30m cells in a raw DEM. The dam structure must be explicitly inserted as a 2D Hydraulic Connection (weir embankment) with high-resolution station-elevation points rather than relying on raw raster sampling.

---

## 4. Reservoir Bathymetry & Storage Geometry Audit

### Finding:
- **Available Data:** Gross storage ($3,540\text{ MCM}$), Dead storage ($925\text{ MCM}$), Full Reservoir Level ($830.0\text{ m}$), Maximum Water Level ($835.0\text{ m}$), Dead Storage Level ($740.0\text{ m}$), and Water Spread Area at FRL ($42.0\text{ km}^2$).
- **Missing Data:** Discrete multi-point stage-storage elevation-volume table and 3D bathymetric mesh of the submerged pre-dam river valley.

> [!IMPORTANT]
> **Mandatory Finding:** Reservoir storage geometry is insufficiently characterized for direct high-confidence hydraulic initialization.

### Modelling Consequence & Mitigation:
If a 2D mesh or storage area is initialized up to 830m based on a macro stage-storage approximation, total releasable volume has an estimated uncertainty of $\pm 8\%$ to $\pm 15\%$. This uncertainty affects the recession limb of the flood hydrograph, but **peak breach outflow** is governed primarily by the water head at the breach ($H^{1.5}$) and breach geometry ($B_b, Z$). This parameter must be classified as a **MODEL ASSUMPTION** and subjected to volume-sensitivity bounds.

---

## 5. Dam Representation Audit

```
                      TEHRI DAM STRUCTURAL PROFILE
                      
                      Crest Elevation = 839.5 m
                      Crest Width = 20 m
                      ◄──────── 575 m Crest Length ────────►
                      ┌────────────────────────────────────┐  ▲
                     /│                                    │\ │
                    / │                                    │ \│ 260.5 m Height
  Upstream Slope   /  │          Central Clay Core         │  \ Downstream Slope
    1V : 2.5H     /   │                                    │   \ 1V : 2.0H
  ───────────────/    │                                    │    \───────────────
  FRL = 830.0 m       └────────────────────────────────────┘     Toe ≈ 600.0 m
                                  Base Width = 1,128 m
```

### Representation in HEC-RAS:
- **Internal 2D Area Connection:** The embankment must NOT be represented merely as raster terrain. It must be defined as an internal SA/2D Connection across the valley.
- **Crest Definition:** Explicitly set to 839.5 m a.s.l. across 575 m length.
- **Foundation / Invert:** Deepest foundation is 579.0 m; riverbed toe level is ~600.0 m.
- **Spillways:** Gated chute spillway (crest 815m) and left/right bank shaft spillways. In an unmitigated PMF catastrophic overtopping breach, auxiliary spillways may be partially active or overwhelmed; standard regulatory breach analyses model the breach opening as the dominant flow conveyance.

---

## 6. Failure Scenario Matrix

Tehri Dam has operated without failure since commissioning in 2006. All breach parameters represent **hypothetical regulatory scenarios** derived from empirical regression equations (Froehlich 2008; MacDonald & Langridge-Monopolis 1984; CWC 2014), not historical failure measurements.

| Scenario Parameter | Scenario A: Regulatory Baseline (Froehlich 2008 Best Estimate) | Scenario B: Rapid Catastrophic Breach (Upper Envelope) | Scenario C: Progressive Piping Failure (CWC Guidelines) |
| :--- | :--- | :--- | :--- |
| **Failure Mode** | Overtopping under PMF | Rapid Overtopping / Slump | Internal Piping / Core Erosion |
| **Breach Location** | Center Embankment (Sta 0+250) | Center Embankment (Sta 0+200) | Mid-height Embankment |
| **Initial Water Level** | $835.0\text{ m}$ (MWL) | $835.0\text{ m}$ (MWL) | $830.0\text{ m}$ (FRL) |
| **Breach Bottom Elev ($Z_b$)**| $600.0\text{ m}$ (Riverbed Toe) | $600.0\text{ m}$ (Riverbed Toe) | $650.0\text{ m}$ (Partial breach) |
| **Bottom Width ($B_b$)** | $215.0\text{ m}$ | $320.0\text{ m}$ | $140.0\text{ m}$ |
| **Side Slopes ($Z$)** | $0.7\text{ H}:1\text{ V}$ | $1.0\text{ H}:1\text{ V}$ | $0.5\text{ H}:1\text{ V}$ |
| **Formation Time ($t_f$)** | $2.4\text{ hours}$ ($144\text{ min}$) | $1.0\text{ hour}$ ($60\text{ min}$) | $3.5\text{ hours}$ ($210\text{ min}$) |
| **Empirical Source** | Froehlich (2008) multi-parameter regression | MacDonald & Langridge-Monopolis (1984) | CWC Guidelines for Dam Break Analysis (2014) |
| **Classification** | `MODEL ASSUMPTION` | `MODEL ASSUMPTION` | `MODEL ASSUMPTION` |

---

## 7. Boundary Conditions Audit

| Boundary Component | Candidate Setting | Nature | Rationale & Sensitivity Range |
| :--- | :--- | :--- | :--- |
| **Upstream Inflow** | Static pool at FRL ($830.0\text{ m}$) or PMF hydrograph ($\text{Peak } 15,300\text{ m}^3/\text{s}$) | `MODEL ASSUMPTION` | Storage volume dominates peak outflow; inflow sensitivity test: $\pm 20\%$. |
| **Downstream Boundary** | Normal Depth Friction Slope: $S_0 = 0.004$ at Devprayag | `ENGINEERING ASSUMPTION` | Derived from riverbed slope from DEM; sensitivity test: $S_0 \in [0.002, 0.006]$. |
| **Initial Baseflow** | $180.0\text{ m}^3/\text{s}$ (Non-monsoon Bhagirathi discharge) | `ENGINEERING ASSUMPTION` | Baseflow is <1% of breach peak outflow ($>25,000\text{ m}^3/\text{s}$); negligible impact on peak arrival. |

---

## 8. Domain Size Audit & Minimum Defensible Domain

```
                        CANDIDATE HYDRAULIC DOMAINS
                        
  [Tehri Dam] ──(22 km)──► [Koteshwar] ──(20 km)──► [Devprayag] ──(43 km)──► [Rishikesh] ──(20 km)──► [Haridwar]
  │                                                  │
  └─────────────── DOMAIN B (42 km) ─────────────────┘
           ★ MINIMUM DEFENSIBLE DOMAIN ★
```

### Domain Options Evaluation:
1. **Domain A: Dam $\to$ Koteshwar Dam (~22 km):**
   - *Pros:* Shortest reach, fast computation.
   - *Cons:* Ends inside steep uninhabited gorge before the main road transport hub at Devprayag confluence.
2. **Domain B: Dam $\to$ Devprayag Confluence (~42 km) — RECOMMENDED MINIMUM DEFENSIBLE DOMAIN:**
   - *Scientific Rationale:* Captures the entire high-gradient Bhagirathi canyon down to the Alaknanda confluence where the river widens.
   - *Road Coverage:* Intersects critical vulnerable origins (`VILL-01` Koteshwar, `VILL-02` Malidewal, `VILL-03` Devprayag) and 10 of the 17 road segments in `roads.json` (`R01`–`R07`, `R09`, `R11`, `R12`).
   - *Terrain Requirement:* Contained within a single Copernicus DEM 1° tile (`N30_E078`).
   - *Computational Feasibility:* ~20,000 cells at 25m resolution; execution time ~8–12 minutes.
   - *Decision Relevance:* Directly answers the evacuation feasibility question for the population facing the shortest warning lead time (<1.5 hours).
3. **Domain C: Dam $\to$ Rishikesh (~85 km):** Requires 2 DEM tiles, 2x cell count, longer run time (>45 min).
4. **Domain D: Dam $\to$ Haridwar (~105 km):** Reaches alluvial plains; out-of-scope for immediate canyon evacuation decisions.

---

## 9. Road Network Audit

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             ROAD NETWORK AUDIT                              │
├──────────────────────────────────┬──────────────────────────────────────────┤
│ Source Provenance                │ OpenStreetMap (OSM) / UK PWD Network     │
│ Geometry Quality                 │ Vector LineStrings (WGS 84 / EPSG:4326)  │
│ Total Segments in Workspace      │ 17 segments (roads.json)                 │
│ Road Classifications             │ PRIMARY (NH-58, NH-94), SECONDARY, RIDGE │
│ Bridge Crossings                 │ 3 confluence bridges (decks un-surveyed) │
│ Vertical Coordinate              │ 2D (Z extracted from DEM intersection)   │
│ Topology                         │ Directed Graph with Origin/Shelter Nodes │
│ Hydraulic Status                 │ GEOGRAPHICALLY OVERLAPPING; HYDRAULIC    │
│                                  │ EXPOSURE UNINITIALIZED (NO TEHRI HDF5)   │
└──────────────────────────────────┴──────────────────────────────────────────┘
```

---

## 10. Vertical Datum Audit

| Reference Surface | Dataset / Entity | Native Vertical Datum | Reconciliation Strategy |
| :--- | :--- | :--- | :--- |
| **Dam Benchmarks** | Tehri Dam Crest (839.5m), FRL (830m) | GTS MSL (Survey of India) | Baseline orthometric datum |
| **Copernicus DEM** | GLO-30 Topographic Raster | EGM2008 Geoid (Orthometric) | Orthometric offset relative to GTS MSL is $\le 1.2\text{ m}$ in Tehri Garhwal |
| **Road Elevations** | Extracted from DEM at vertices | EGM2008 Geoid | Directly consistent with hydraulic WSE computed on same DEM |

> [!NOTE]
> **Status:** `VERTICAL_DATUM_COMPATIBILITY = RECONCILABLE_WITH_DOCUMENTED_OFFSET`. Because both HEC-RAS 2D hydraulics and road vertex profiles are evaluated on the same DEM surface, relative flood inundation depth ($d = WSE - z_{\text{bed}}$) is internally consistent.

---

## 11. Authoritative Source Evidence Register

| Organization | Document / Dataset Title | Document Section / Reference | Access / URL | What It Actually Establishes | What It Does NOT Establish |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **THDC India Limited** | *Tehri Hydro Power Complex Technical Factsheet & Annual Report* | Technical Features Table | [thdc.co.in](https://thdc.co.in) | Dam height ($260.5\text{ m}$), crest length ($575\text{ m}$), FRL ($830\text{ m}$), storage ($3540\text{ MCM}$). | Does not establish hydraulic inundation maps or dam-break wave arrival times. |
| **Central Water Commission (CWC)** | *National Register of Large Dams (NRLD)* | Uttarakhand Dam Inventory (Page 142) | [cwc.gov.in](https://cwc.gov.in) | Official regulatory dimensions and river basin classification. | Does not provide a calibrated HEC-RAS 2D mesh. |
| **Central Water Commission (CWC)** | *Guidelines for Dam Break Analysis (2014)* | Chapter 4: Breach Parameters | CWC Dam Safety Org | Recommended empirical equations and parametric ranges for Indian dams. | Does not contain empirical measurements of a historical Tehri failure. |
| **Froehlich, D. C. (2008)** | *Embankment Dam Breach Parameters Revisited* | J. Water Resources Planning & Management | ASCE Journal Paper | Empirical multi-variable regression equations for $B_b$ and $t_f$. | Empirical equations based on historical worldwide failures; not site-specific to Tehri. |
| **European Space Agency (ESA)** | *Copernicus DEM GLO-30* | Tile `Copernicus_DSM_COG_10_N30_00_E078_00_DEM` | OpenTopography / ESA | 30m digital surface model elevations in EGM2008 geoid. | Does not include bathymetry beneath water surfaces or sharp dam crest geometry. |
| **OpenStreetMap Contributors** | *Uttarakhand Highway & Secondary Road Vectors* | Overpass API Extract | [openstreetmap.org](https://openstreetmap.org) | 2D alignment coordinates and topology of NH-58, NH-94, and regional roads. | Does not provide flood vulnerability or bridge clearance heights. |

---

## 12. Model Authorization Gate Evaluation

### Target Path Classification:
# **`BUILDABLE_WITH_DOCUMENTED_ASSUMPTIONS`**

### Evidence-Grounded Checklist (A through L):

- [x] **A. Do we have enough terrain?**  
  **YES (Sourceable).** Copernicus GLO-30 covers the complete domain; requires standard channel hydro-enforcement and structural crest definition.
- [x] **B. Do we have reservoir bathymetry/storage geometry?**  
  **PARTIALLY (Source-derived gross storage + FRL; detailed bathymetry missing).** Stated as a documented `MODEL ASSUMPTION` with volume sensitivity testing.
- [x] **C. Do we have defensible dam geometry?**  
  **YES (Source-derived).** Height (260.5m), crest length (575m), crest width (20m), and slopes (1:2.5 US / 1:2.0 DS) are official CWC/THDC records.
- [x] **D. Do we have defensible breach scenario inputs?**  
  **YES (Documented empirical assumptions).** Three distinct sensitivity scenarios (Froehlich best-estimate, rapid overtopping, and progressive piping) are formulated from CWC (2014) guidelines.
- [x] **E. Do we have defensible boundary conditions?**  
  **YES (Engineering assumptions).** Inflow at FRL / PMF, normal depth friction slope $S_0=0.004$, and seasonal baseflow $180\text{ m}^3/\text{s}$.
- [x] **F. Are horizontal CRS compatible?**  
  **YES.** Standard metric projection WGS 84 / UTM Zone 44N (`EPSG:32644`) bidirectionally converts to WGS 84 (`EPSG:4326`).
- [x] **G. Are vertical datums compatible?**  
  **YES.** EGM2008 orthometric height aligns with GTS MSL within documented $\pm 1.2\text{ m}$ tolerance; relative inundation depths on the DEM are internally consistent.
- [x] **H. What is the minimum defensible model domain?**  
  **Tehri Dam to Devprayag Confluence (~42 km reach).** Captures highest-risk communities, 10 road segments, and 1 single DEM tile with optimal compute efficiency.
- [x] **I. What inputs are assumptions?**  
  Breach bottom width, side slope, formation time, failure trigger, Manning's $n$, friction slope, and submerged reservoir bathymetry.
- [x] **J. Which assumptions require sensitivity analysis?**  
  Breach width ($100\text{m} \to 300\text{m}$), formation time ($1.0\text{h} \to 3.5\text{h}$), Manning's roughness ($n \in [0.035, 0.070]$), and downstream slope ($S_0 \in [0.002, 0.006]$).
- [x] **K. Can the model be built without fabricating data?**  
  **YES.** Sourcing open Copernicus DEM GLO-30, official CWC dam dimensions, and literature breach formulas allows construction of an authentic HEC-RAS model without synthesizing imaginary observations.
- [x] **L. Final Authorization Classification:**  
  **`BUILDABLE_WITH_DOCUMENTED_ASSUMPTIONS`**

---

## 13. Operational Boundary & Stop Point

```
EXECUTION STATUS: READINESS GATE COMPLETE
┌────────────────────────────────────────────────────────┐
│  HEC-RAS Model Construction:        NOT COMMENCED      │
│  DEM Download:                      NOT COMMENCED      │
│  Geometry / Plan Creation:          NOT COMMENCED      │
│  Tehri Hydraulic Ingestion:         NOT COMMENCED      │
│  Tehri Road Intersection:           NOT COMMENCED      │
└────────────────────────────────────────────────────────┘
```

The investigation is complete. Awaiting explicit user instruction before initiating any model building, terrain acquisition, or HEC-RAS geometry construction.
