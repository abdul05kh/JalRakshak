# Tehri 2D Dam-Break Model — Pre-Pilot Forensic Evidence Audit

**Document ID:** `TEHRI-PRE-PILOT-EVIDENCE-AUDIT-V1`  
**Date:** September 2026  
**Governing Standard:** JalRakshak Strict Scientific Honesty & Traceability Policy  
**Milestone:** PRE-PILOT FORENSIC AUDIT (PRE-CONSTRUCTION HARD GATE)

---

## 1. Critical Input Forensic Evidence Table

| # | Parameter | Value | Unit | Previous Classification | Source Document | Exact Section / Table | Quoted / Source-Supported Fact | Derivation / Calculation Chain | Scientific Confidence | Forensic Audit Status |
|---|---|---|---|---|---|---|---|---|---|---|
| **1** | Dam Latitude / Longitude | `30.3780° N, 78.4803° E` | Dec Deg | `SOURCE-DERIVED FACT` | CWC National Register of Large Dams (2020) | Entry: `UT09HH0001` (Tehri Dam) | "Location: Tehri Garhwal, Lat: 30°22'40" N, Long: 78°28'50" E" | Decimal degree conversion from DMS | HIGH | **`DIRECTLY_SUPPORTED`** |
| **2** | Dam Crest Elevation | `839.50` | m | `SOURCE-DERIVED FACT` | THDC Technical Factsheet & CWC NRLD | Salient Features: Dam Crest | "Top of Dam: EL 839.50 m" | Direct official specification | HIGH | **`DIRECTLY_SUPPORTED`** |
| **3** | Full Reservoir Level (FRL) | `830.00` | m | `SOURCE-DERIVED FACT` | THDC Project Operating Manual | Salient Features: Reservoir | "Full Reservoir Level (FRL): EL 830.00 m" | Direct official operational rule | HIGH | **`DIRECTLY_SUPPORTED`** |
| **4** | Maximum Water Level (MWL) | `835.00` | m | `SOURCE-DERIVED FACT` | THDC Technical Factsheet | Salient Features: Reservoir | "Maximum Water Level (MWL): EL 835.00 m" | Direct official design level | HIGH | **`DIRECTLY_SUPPORTED`** |
| **5** | Min. Drawdown Level (MDDL) | `740.00` | m | `SOURCE-DERIVED FACT` | THDC Technical Factsheet | Salient Features: Reservoir | "Dead Storage Level (MDDL): EL 740.00 m" | Direct official operational level | HIGH | **`DIRECTLY_SUPPORTED`** |
| **6** | Dam Height (above foundation) | `260.50` | m | `SOURCE-DERIVED FACT` | CWC NRLD (2020) / THDC | Page 142, Entry 1 | "Height above lowest foundation: 260.50 m" | Direct structural specification | HIGH | **`DIRECTLY_SUPPORTED`** |
| **7** | Dam Height (above riverbed) | `239.50` | m | `SOURCE-DERIVED FACT` | THDC Project Report | Chapter 3: Embankment | "Height above river bed: 239.50 m (River bed EL 600.00 m)" | $\Delta z = 839.50\text{ m} - 600.00\text{ m} = 239.50\text{ m}$ | HIGH | **`DIRECTLY_SUPPORTED`** |
| **8** | Dam Crest Length | `575.00` | m | `SOURCE-DERIVED FACT` | THDC Technical Factsheet | Salient Features: Dam | "Length of Dam at crest: 575.00 m" | Direct structural specification | HIGH | **`DIRECTLY_SUPPORTED`** |
| **9** | Dam Crest Width | `20.00` | m | `SOURCE-DERIVED FACT` | THDC Dam Design Report | Section 3.1: Embankment Cross-Section | "Width of Dam at crest: 20.00 m" | Direct structural specification | HIGH | **`DIRECTLY_SUPPORTED`** |
| **10** | Dam Base Width | `1128.00` | m | `SOURCE-DERIVED FACT` | THDC Dam Design Report | Section 3.1: Embankment Cross-Section | "Width of Dam at base: 1128.00 m" | Direct structural specification | HIGH | **`DIRECTLY_SUPPORTED`** |
| **11** | Upstream Embankment Slope | `1V : 2.5H` | ratio | `SOURCE-DERIVED FACT` | THDC Dam Design Report | Section 3.2: Zoning | "Upstream Slope: 1V : 2.5H" | Direct design slope | HIGH | **`DIRECTLY_SUPPORTED`** |
| **12** | Downstream Embankment Slope | `1V : 2.0H` | ratio | `SOURCE-DERIVED FACT` | THDC Dam Design Report | Section 3.2: Zoning | "Downstream Slope: 1V : 2.0H" | Direct design slope | HIGH | **`DIRECTLY_SUPPORTED`** |
| **13** | Gross Storage Capacity | `3540.0` | MCM | `SOURCE-DERIVED FACT` | CWC NRLD (2020) / THDC | Table: Reservoir Storage | "Gross Storage: 3540 MCM ($3.54 \times 10^9\text{ m}^3$)" | Direct official capacity | HIGH | **`DIRECTLY_SUPPORTED`** |
| **14** | Live Storage Capacity | `2615.0` | MCM | `SOURCE-DERIVED FACT` | THDC Technical Factsheet | Table: Reservoir Storage | "Live Storage: 2615 MCM ($2.615 \times 10^9\text{ m}^3$)" | Direct official capacity | HIGH | **`DIRECTLY_SUPPORTED`** |
| **15** | Dead Storage Capacity | `925.0` | MCM | `SOURCE-DERIVED FACT` | THDC Technical Factsheet | Table: Reservoir Storage | "Dead Storage: 925 MCM ($0.925 \times 10^9\text{ m}^3$)" | $\text{Gross} - \text{Live} = 3540 - 2615 = 925\text{ MCM}$ | HIGH | **`DIRECTLY_SUPPORTED`** |
| **16** | Water Spread Area at FRL | `42.0` | $\text{km}^2$ | `SOURCE-DERIVED FACT` | THDC Technical Factsheet | Section: Submergence | "Submergence Area at FRL: 42.0 sq km" | Direct official survey area | HIGH | **`DIRECTLY_SUPPORTED`** |
| **17** | Probable Maximum Flood (PMF) | `15300.0` | $\text{m}^3/\text{s}$ | `MODEL ASSUMPTION` | CWC Spillway Design Flood Report | Chapter 2: Inflow Hydrograph | "PMF Peak Inflow: 15,300 cumec" | Regulatory design flood calculation | MEDIUM | **`DIRECTLY_SUPPORTED`** (as design value; `EXPLICIT_MODEL_ASSUMPTION` as inflow) |
| **18** | Downstream Baseflow | `180.0` | $\text{m}^3/\text{s}$ | `ENGINEERING ASSUMPTION` | CWC Bhagirathi Series (Regional) | Non-Monsoon Baseline | Regional seasonal average (~120–250 m³/s) | Adopted nominal baseline | LOW | **`EXPLICIT_MODEL_ASSUMPTION`** |
| **19** | Downstream Energy Slope ($S_0$) | `0.0040` | m/m | `ENGINEERING ASSUMPTION` | Macro Topographic Profile | Regional slope calculation | Average riverbed fall ($\approx 240\text{m}$ over $60\text{km}$) | Adopted normal depth slope | LOW | **`EXPLICIT_MODEL_ASSUMPTION`** |
| **20** | Manning's $n$ (Channel) | `0.045` | $\text{s}/\text{m}^{1/3}$ | `ENGINEERING ASSUMPTION` | Chow (1959) / CWC (2014) | Table 5-6: Mountain Streams | "Cobbles and large boulders: 0.040–0.060" | Selected mid-range coefficient | MEDIUM | **`EXPLICIT_MODEL_ASSUMPTION`** |
| **21** | Manning's $n$ (Valley Slopes) | `0.065` | $\text{s}/\text{m}^{1/3}$ | `ENGINEERING ASSUMPTION` | Chow (1959) / CWC (2014) | Table 5-6: Steep Rocky Slopes | "Steep rocky mountain sides: 0.050–0.080" | Selected mid-range coefficient | MEDIUM | **`EXPLICIT_MODEL_ASSUMPTION`** |
| **22** | Breach Bottom Width ($B_b$) | `215.0` | m | `MODEL ASSUMPTION` | Froehlich (2008) + Canyon Capping | Equation 1 + Canyon Cap | See Section 4 for detailed audit | $\bar{B}_{\text{raw}} = 492.2\text{m} \xrightarrow{\text{capped}} 376\text{m} \implies B_b = 215\text{m}$ | LOW | **`EXPLICIT_MODEL_ASSUMPTION`** |
| **23** | Breach Formation Time ($t_f$) | `2.4` | hours | `MODEL ASSUMPTION` | Froehlich (2008) / Empirical Range | Section 4: Equation 2 | See Section 5 for detailed audit | Interpolated mid-point ($1.45\text{h} \leftrightarrow 3.23\text{h}$) | LOW | **`EXPLICIT_MODEL_ASSUMPTION`** |
| **24** | Breach Side Slopes ($Z$) | `0.70` | H:1V | `ENGINEERING ASSUMPTION` | CWC Guidelines (2014) | Section 4.3 | "Zoned rockfill with clay core: 0.5–1.0" | Standard midpoint assumption | MEDIUM | **`EXPLICIT_MODEL_ASSUMPTION`** |
| **25** | Breach Invert Elevation ($Z_b$) | `600.0` | m | `MODEL ASSUMPTION` | Dam Toe Level | Assumed complete incision | Riverbed toe elevation | Adopted failure limit | MEDIUM | **`EXPLICIT_MODEL_ASSUMPTION`** |
| **26** | Vertical Datum Offset | `+0.80 ±0.50` | m | `ENGINEERING ASSUMPTION` | Regional Geodetic Literature | Pan-Himalayan Geoid Studies | See Section 2 for detailed audit | Inferred regional geoid offset | LOW | **`NOT_ESTABLISHED`** (Site-specific tie missing) |
| **27** | DEM Abutment Elevation | `840.30` | m | `MODEL ASSUMPTION` | Inferred from $839.5 + 0.8$ | Unsampled / Hypothetical | See Section 3 for detailed audit | Sum of crest + assumed offset | NONE | **`NOT_ESTABLISHED`** (DEM un-downloaded) |

---

## 2. Forensic Audit — Vertical Datum

### Audited Claim:
> `VERTICAL_DATUM_COMPATIBILITY = ESTABLISHED_WITH_DOCUMENTED_OFFSET (+0.80 m ±0.50 m)`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       VERTICAL DATUM FORENSIC AUDIT                         │
├──────────────────────────────────┬──────────────────────────────────────────┤
│ A. Tehri Engineering Datum       │ Survey of India Great Trigonometrical    │
│                                  │ Survey (GTS) MSL (Karachi/Mumbai datum)  │
│ B. Copernicus GLO-30 Datum       │ Earth Gravitational Model 2008 (EGM2008) │
│ C. Tehri-Specific Geodetic Tie   │ ABSENT in open public records            │
│ D. Transfer Method               │ Regional literature interpolation        │
│ E. Control Point Coordinates     │ None surveyed at Tehri Dam abutments     │
│ F. Nature of the +0.80m Value    │ REGIONAL INFERENCE / ASSUMED             │
└──────────────────────────────────┴──────────────────────────────────────────┘
```

### Forensic Finding:
The $+0.80\text{ m}$ value was derived from pan-Himalayan regional geodetic comparisons (NGRI / Survey of India levelling across northern India), **NOT from an empirical GNSS levelling benchmark tie at Tehri Dam ($30.378^\circ\text{N}, 78.480^\circ\text{E}$)**.

### Mandatory Classification Downgrade:
In strict compliance with execution rules:
```
VERTICAL_DATUM_COMPATIBILITY = NOT_ESTABLISHED
```

**Modelling Protocol:**  
Because no site-specific vertical shift grid exists, the hydraulic model **must NOT apply an unverified $+0.80\text{ m}$ correction**. Instead, the model geometry must be evaluated entirely in the native Copernicus DEM coordinate space (EGM2008 geoid), with the structural crest height tied directly to the local DEM abutment elevation sampled when the DEM is acquired.

---

## 3. Forensic Audit — The 840.3 m DEM Abutment Elevation

### Audited Claim:
> "dam crest tied to DEM abutments (840.3 m)"

### Forensic Finding:
1. **Source:** Synthetic sum ($839.50\text{ m} \text{ [GTS Crest]} + 0.80\text{ m} \text{ [Assumed Offset]} = 840.30\text{ m}$).
2. **Extraction Location / Coordinates:** Not extracted from a downloaded GeoTIFF because **the Copernicus DEM raster has not been downloaded to this machine**.
3. **Dataset Version:** Hypothetical reference to Copernicus GLO-30.

### Mandatory Reclassification:
```
Status: NOT_ESTABLISHED / HYPOTHETICAL PLACEHOLDER
```
**Correct Rule:** The actual DEM abutment elevation can only be established after the DEM GeoTIFF is downloaded and sampled at $(30.378^\circ\text{N}, 78.480^\circ\text{E})$.

---

## 4. Forensic Audit — Breach Geometry Calculations

### Audited Claim:
> $B_b = 215.0\text{ m}, t_f = 2.4\text{ h}, Z = 0.70\text{ H:1V}, \bar{B} = 376\text{ m}$

### Detailed Mathematical Chain:
1. **Froehlich (2008) Equation for Average Breach Width:**
   $$\bar{B} = 0.27 \cdot K_0 \cdot V_w^{0.32} \cdot h_w^{0.04}$$
   - $K_0 = 1.3$ (Overtopping mode)
   - $V_w = 3.54 \times 10^9\text{ m}^3$ ($3,540\text{ MCM}$ gross storage)
   - $h_w = 230.0\text{ m}$ ($830.0\text{ m} - 600.0\text{ m}$)
   - $V_w^{0.32} = 1129.54$
   - $h_w^{0.04} = 1.2416$
   - **Calculated Raw Average Width:**
     $$\bar{B}_{\text{raw}} = 0.27 \times 1.3 \times 1129.54 \times 1.2416 = 492.25\text{ m}$$

2. **Where did 376.0 m come from?**
   - The raw empirical result ($\bar{B} = 492.25\text{ m}$) exceeds the physical width of the Bhagirathi rock canyon at mid-dam height.
   - An engineering cap of $\bar{B} = 376.0\text{ m}$ was introduced based on nominal valley width.
   - **Critical Finding:** The value $376.0\text{ m}$ is an **uncalibrated geometric assumption**, NOT a direct output of Froehlich (2008).

3. **HEC-RAS Bottom Width Conversion:**
   $$B_b = \bar{B} - Z \cdot h_b$$
   - For assumed $\bar{B} = 376.0\text{ m}, Z = 0.70, h_b = 230.0\text{ m}$:
     $$B_b = 376.0 - (0.70 \times 230.0) = 376.0 - 161.0 = 215.0\text{ m}$$
   - For raw Froehlich $\bar{B} = 492.25\text{ m}$:
     $$B_b = 492.25 - 161.0 = 331.25\text{ m}$$

```
Classification: EXPLICIT_MODEL_ASSUMPTION (Canyon-Capped Empirical Scenario)
```

---

## 5. Forensic Audit — Breach Formation Time ($t_f$)

### Audited Claim:
> $t_f = 2.4\text{ hours}$

### Mathematical Evaluation:
1. **Froehlich (2008) Dimensionless Formula:**
   $$t_f = 63.2 \cdot \sqrt{\frac{V_w}{g \cdot h_w^2}} = 63.2 \cdot \sqrt{\frac{3.54 \times 10^9}{9.81 \times (230)^2}} = 5,219.8\text{ s} \approx 1.45\text{ hours}$$
2. **Froehlich (2008) Multi-Variable Regression Formulation:**
   $$t_f = 0.0177 \cdot \left(\frac{V_w}{h_w^2}\right)^{0.47} = 0.0177 \cdot (66,918.7)^{0.47} \approx 3.23\text{ hours}$$
3. **MacDonald & Langridge-Monopolis (1984):** $\approx 1.5 - 2.5\text{ hours}$.

### Forensic Finding:
The value $t_f = 2.4\text{ hours}$ ($144\text{ min}$) is an **interpolated midpoint assumption** between the fast dimension formula ($1.45\text{h}$) and the slower multi-variable regression ($3.23\text{h}$).

```
Classification: EXPLICIT_MODEL_ASSUMPTION (Midpoint Regression Sensitivity Value)
```

---

## 6. Forensic Audit — PMF and Boundary Conditions

| Input | Value | Source Verification | True Nature | Mandatory Classification |
| :--- | :--- | :--- | :--- | :--- |
| **PMF Peak Inflow** | $15,300\text{ m}^3/\text{s}$ | CWC Spillway Design Study for Tehri | Official regulatory design flood; not an observed event | **`DIRECTLY_SUPPORTED`** (as design spec); **`EXPLICIT_MODEL_ASSUMPTION`** (as breach inflow) |
| **Initial Baseflow** | $180.0\text{ m}^3/\text{s}$ | Regional CWC monthly mean ranges | Estimated seasonal non-monsoon river baseflow | **`EXPLICIT_MODEL_ASSUMPTION`** |
| **Friction Slope ($S_0$)** | $0.0040$ | Macro topography ($240\text{m} / 60\text{km}$) | Regional reach slope estimate; not surveyed at Devprayag | **`EXPLICIT_MODEL_ASSUMPTION`** |

---

## 7. Forensic Audit — Reservoir Initialization & Drawdown Dynamics

### Audited Claims:
1. *"The reservoir is initialized as a static storage pool containing $3.54 \times 10^9\text{ m}^3$ water."*
2. *"Peak outflow is dominated by head rather than deep reservoir bed contours."*

### Forensic Evaluation:
1. **Gross vs. Live vs. Dead Storage:**
   - At FRL ($830.0\text{ m}$), gross storage is $3,540\text{ MCM}$.
   - Dead storage below MDDL ($740.0\text{ m}$) is $925\text{ MCM}$.
   - If a catastrophic breach cuts down to riverbed toe ($600.0\text{ m}$), water between $740\text{ m}$ and $600\text{ m}$ is releasable, but sediment buildup in the dead storage zone will limit active drainage.
2. **Dynamic Drawdown vs. Single Volume Point:**
   - Initializing a single volume point ($3,540\text{ MCM}$) at $830\text{ m}$ in a 2D mesh **does NOT guarantee physically accurate stage-storage relationships as water levels recede** from $830\text{ m} \to 740\text{ m} \to 600\text{ m}$.
   - **Hydraulic Consequence:** An inaccurate stage-volume curve alters the rate of head loss $\frac{dH}{dt}$, directly impacting breach outflow attenuation and duration.

```
Classification: EXPLICIT_MODEL_ASSUMPTION (Single-Point Macro Storage Approximation)
Sensitivity Requirement: Drawdown Volume Bounds ±15%
```

---

## 8. Forensic Audit — Model Domain Justification

### Audited Claim:
> Tehri $\to$ Devprayag (~42 km) is the *"Minimum Defensible Domain"*.

### Forensic Finding:
Calling 42 km the "Minimum Defensible Domain" implies a completed hydraulic proof of wave attenuation and travel time. Because no hydraulic model has yet run:
- Flood arrival times ($<90\text{ min}$) are **unverified hypotheses**.
- Downstream boundary backwater effects at Devprayag are **unsimulated**.

### Mandatory Terminology Change:
```
Previous: "Minimum Defensible Domain"
Corrected: "PRELIMINARY DOMAIN HYPOTHESIS"
```

---

## 9. Forensic Audit — Mesh Resolution & Numerics

### Audited Values:
- $25\text{ m} \times 25\text{ m}$ cells
- $5 - 10\text{ m}$ refinement
- $\approx 25,000$ cells
- $0.5 - 2.0\text{ s}$ timestep
- $Cr \le 1.0$

### Forensic Finding:
These values are **`PRELIMINARY MODEL PARAMETERS`** derived from theoretical shallow water stability equations, not validated runtime configurations. Actual cell counts and stable timesteps will be determined dynamically by HEC-RAS 2D during the pilot execution.

```
Classification: PRELIMINARY_MODEL_PARAMETERS (Subject to Pilot Tuning)
```

---

## 10. Check: Are There Critical Blockers?

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      BLOCKER CLASSIFICATION SUMMARY                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. CONSTRUCTION BLOCKERS (Preventing software execution):                   │
│    STATUS: NONE                                                             │
│    Rationale: HEC-RAS 2D can ingest Copernicus DEM, insert an SA/2D         │
│    Connection for the dam, apply empirical breach rules, and solve SWE-ELM. │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. SCIENTIFIC VALIDATION LIMITATIONS:                                       │
│    STATUS: CRITICAL / UNVALIDATED                                           │
│    Rationale: Zero historical breach data exists for Tehri Dam. All         │
│    hydraulic outputs represent regulatory scenarios, not validated events.  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. DECISION-IMPACTING UNCERTAINTIES:                                        │
│    STATUS: SIGNIFICANT                                                      │
│    - Submerged gorge bathymetry (±10% arrival time sensitivity)             │
│    - Empirical breach width ($B_b \in [140\text{m}, 330\text{m}]$)          │
│    - Breach formation time ($t_f \in [1.0\text{h}, 3.5\text{h}]$)           │
│    - Riverbed Manning's roughness ($n \in [0.035, 0.065]$)                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 11. Claim Hygiene Register

| Flagged Term / Claim | File Location | Forensic Evaluation | Exact Replacement Wording |
| :--- | :--- | :--- | :--- |
| `SOURCE_LOCK_COMPLETE` | `docs/TEHRI_MODEL_SPECIFICATION.md:90` | Overstates certainty for empirical/assumed parameters | **`INPUT_PROVENANCE_AUDITED_WITH_EXPLICIT_ASSUMPTIONS`** |
| `MODEL_SPECIFICATION_READY` | `docs/TEHRI_MODEL_SPECIFICATION.md:94` | Implies final validated spec prior to numerical testing | **`PRE_PILOT_SPECIFICATION_LOCKED`** |
| `ESTABLISHED_WITH_DOCUMENTED_OFFSET` | `docs/TEHRI_SOURCE_LOCK_REPORT.md:64` | Datum offset is regionally inferred, not site-measured | **`VERTICAL_DATUM_COMPATIBILITY = NOT_ESTABLISHED (Native DEM Space Preserved)`** |
| `Minimum Defensible Domain` | `docs/TEHRI_MODEL_READINESS_REPORT.md:139` | Hydraulic attenuation is unproven prior to run | **`PRELIMINARY DOMAIN HYPOTHESIS`** |
| `Source-Locked Assumptions` | `docs/TEHRI_MODEL_SPECIFICATION.md:102` | Contradictory oxymoron ("locked assumption") | **`Explicit Documented Model Assumptions`** |
| `100% spatially aligned` | Previous audit notes | Overstates hydraulic compatibility | **`Geographically overlapping intended study corridor`** |
| `scientifically sound` | Previous audit notes | Overstates predictive validation | **`Technically constructible using source-derived inputs`** |

---

## 12. Final Pre-Pilot Acceptance Gate

```
═════════════════════════════════════════════════════════════════════════════
                       FINAL ACCEPTANCE GATE EVALUATION
═════════════════════════════════════════════════════════════════════════════

1. SOURCE_LOCK_STATUS:
   STATUS: COMPLETE_WITH_HONEST_CLASSIFICATION_DOWNGRADES
   Evidence: All 27 parameters audited; all empirical/unmeasured values
   demoted from "fact" to EXPLICIT_MODEL_ASSUMPTION or NOT_ESTABLISHED.

2. MODEL_SPECIFICATION_STATUS:
   STATUS: READY_FOR_PILOT_FEASIBILITY_TESTING_ONLY
   Evidence: Numerical setup is defensible for testing computational stability;
   predictive claims are strictly barred.

3. PILOT_AUTHORIZATION:
   STATUS: AUTHORIZED_FOR_NUMERICAL_FEASIBILITY_TESTING_ONLY
   Condition: Stage-1 Pilot (Tehri Dam to Koteshwar, ~15 km) may be constructed
   strictly as a numerical solver feasibility test.

═════════════════════════════════════════════════════════════════════════════
```

---

## 13. Strict Stop Verification

- **DEM Download:** NOT COMMENCED.
- **HEC-RAS Model Files:** NOT CREATED.
- **Hydraulic Simulation:** NOT EXECUTED.
- **Road Exposure / EWE:** NOT MODIFIED.
