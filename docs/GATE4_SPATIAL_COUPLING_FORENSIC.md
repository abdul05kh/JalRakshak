# GATE 4 SPATIAL COUPLING FORENSIC AUDIT
## Evaluation of Search Tolerances, Geometry Densification, and Spurious Inundation Elimination

**Document ID:** `DOC-GATE4-COUPLING-FORENSIC-001`  
**Status:** AUDITED & HARDENED  
**Date:** 2026-09-24  
**Author:** Principal Systems Engineer & GIS Lead  

---

## 1. Forensic Discovery & Defect Root Cause

### 1.1 The Previous Method Defect
The initial spatial coupling implementation queried a KD-tree using:
$$R_{\text{search}} = 1,200\text{ m}$$
Crucially, KD-tree queries were only executed at the **sparse vertices** of the vector LineStrings (e.g., 3 coordinates along a $7.4\text{ km}$ road). 

**Impact of Previous Method:**
1. To bridge the gap between sparse vertices, the radius had to be artificially inflated to $1,200\text{ m}$.
2. This $1,200\text{ m}$ sphere captured deep thalweg cells deep in the canyon floor ($>450\text{ m}$ away horizontally and $>100\text{ m}$ below vertically), falsely associating high-ridge bypasses (such as R17 Devprayag-Chamba) with riverbed flood arrival ($t = 4200\text{ s}$).
3. Furthermore, it inflated the peak depth on R02 from its true road-level inundation ($31.70\text{ m}$) to deep riverbed pool depths ($37.37\text{ m} - 39.19\text{ m}$).

---

## 2. Hardened Method: Geometry Densification & Strict Buffer

### 2.1 Algorithmic Reformulation
1. **LineString Densification:** The projected `EPSG:32644` LineString is sampled at regular intervals $\Delta s \le 50.0\text{ m}$ ($0.5\Delta x$ of the $100\text{ m}$ HEC-RAS grid).
2. **Exact Orthogonal Distance:** For candidate cells, the exact perpendicular distance from the 2D cell centroid $(x_c, y_c)$ to the LineString segment is computed:
   $$d_{\perp}(c, \text{Line}) = \min_{p \in \text{Line}} \|(x_c, y_c) - p\|_2$$
3. **Strict Buffer Radius:** Cells are included in the road exposure corridor if and only if:
   $$d_{\perp}(c, \text{Line}) \le R_{\text{buffer}}$$
   Where $R_{\text{buffer}} = 150.0\text{ m} = 1.5 \times \Delta x$.

---

## 3. Comparative Sensitivity of Spatial Buffer Tolerances

We tested 5 spatial tolerances on the Central HEC-RAS scenario ($Q_p = 65,000\text{ m}^3/\text{s}$, $\Delta x = 100\text{ m}$):

| Road Segment | Corridor Buffer $R$ | Coupled Cells | Inundated Cells | Min Dist to Mesh | First Flood Arrival ($H=0.3\text{m}$) | Peak Depth ($d_{\text{max}}$) | Status Classification |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **R02** (Malidewal-Koteshwar) | $50\text{ m}$ ($0.5\Delta x$) | 75 | 12 | $0.1\text{ m}$ | $3,600\text{ s}$ ($60\text{ min}$) | $30.89\text{ m}$ | `INUNDATED` |
| **R02** (Malidewal-Koteshwar) | $100\text{ m}$ ($1.0\Delta x$) | 152 | 22 | $0.1\text{ m}$ | $3,600\text{ s}$ ($60\text{ min}$) | $31.63\text{ m}$ | `INUNDATED` |
| **R02** (Malidewal-Koteshwar) | **$150\text{ m}$ ($1.5\Delta x$, Baseline)**| **230** | **34** | **$0.1\text{ m}$** | **$3,600\text{ s}$ ($60\text{ min}$)** | **$31.70\text{ m}$** | **`INUNDATED`** |
| **R02** (Malidewal-Koteshwar) | $200\text{ m}$ ($2.0\Delta x$) | 307 | 47 | $0.1\text{ m}$ | $3,600\text{ s}$ ($60\text{ min}$) | $31.86\text{ m}$ | `INUNDATED` |
| **R02** (Malidewal-Koteshwar) | $500\text{ m}$ ($5.0\Delta x$) | 816 | 132 | $0.1\text{ m}$ | $3,300\text{ s}$ ($55\text{ min}$) | $37.25\text{ m}$ | `INUNDATED` (Deep Pool) |
| **R01** (Malidewal-Chamba) | **$150\text{ m}$** | 39 | 0 | $3.0\text{ m}$ | `NULL` ($99999\text{ s}$) | $0.00\text{ m}$ | `OPEN` (High Ground) |
| **R03** (Koteshwar-Devprayag) | **$150\text{ m}$** | 52 | 0 | $1.2\text{ m}$ | `NULL` ($99999\text{ s}$) | $0.00\text{ m}$ | `OPEN` (High Ground) |
| **R17** (Devprayag-Chamba) | **$150\text{ m}$** | 91 | 0 | $0.7\text{ m}$ | `NULL` ($99999\text{ s}$) | $0.00\text{ m}$ | `OPEN` (High Ground) |
| **R04-R16** (Ridge Bypasses) | **$150\text{ m}$** | 0 | 0 | $>5,000\text{ m}$ | `NULL` ($99999\text{ s}$) | $0.00\text{ m}$ | `OPEN` (High Ground) |

---

## 4. Conclusion & Scientific Defense

1. **Elimination of Spurious Inundation:** At $R_{\text{buffer}} = 150\text{ m}$, high ground roads (R01, R03, R17) are 100% free of spurious channel flood coupling.
2. **True Road Elevation Capture:** R02 road corridor cells correctly reflect flood arrival at $t = 3,600\text{ s}$ ($60\text{ min}$) with peak depth $31.70\text{ m}$.
3. **Standard Locked:** $R_{\text{buffer}} = 150.0\text{ m}$ and $\Delta s = 50.0\text{ m}$ are formally locked into `RoadHydraulicMapper`.
