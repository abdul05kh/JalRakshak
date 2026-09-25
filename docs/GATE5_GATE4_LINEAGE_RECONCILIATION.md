# GATE 5 — GATE 4 LINEAGE RECONCILIATION & FREEZE AUDIT

**Project:** JalRakshak — SIH'26  
**Gate:** Gate 5 (Officer Decision Validation & Decision-Support Closure)  
**Status:** RECONCILED & FROZEN  
**Date:** 2026-09-24  

---

## 1. Executive Summary

This document establishes the unbroken lineage and forensic audit trail between the frozen **Gate 3 / Gate 4 hydraulic model layer** and the **Gate 5 emergency-officer decision-support layer**. 

Gate 5 is strictly downstream of the frozen hydraulic layer. Under no circumstances does Gate 5 alter hydraulic meshes, solvers, boundary conditions, or time series. Gate 5 consumes the validated, hardened spatial coupling and Evacuation Window Engine (EWE) inputs established in Gate 4.

---

## 2. Spatial Coupling Correction & Hardening

### 2.1 Obsolete Method (Pre-Gate 4 Audit)
- **Method:** Sparse vertex KD-tree nearest centroid search with an unconstrained radius of $1,200\text{ m}$.
- **Flaw:** Attributed deep canyon floor hydraulic cells ($>450\text{ m}$ away) to mountain ridge road segments (e.g., R17 and upper parts of R02), erroneously reporting artificial inundation and an inflated peak depth of $37.37\text{ m}$ on R02.
- **Status:** **EXPLICITLY OBSOLETE & REJECTED.**

### 2.2 Hardened Method (Gate 4 & Gate 5 Production Standard)
- **Method:** Projected road geometry (`LineString`), densified at $\Delta s \le 50\text{ m}$, with an exact orthogonal distance buffer of $150\text{ m}$ corridor width.
- **Result:**
  - Mountain bypass roads (R01 Chamba Ridge, R03 Koteshwar High Road, R17 Tehri Bypass) are **100% DRY**.
  - R02 (Tehri Dam Toe $\to$ Malidewal / Koteshwar Valley segment) is mapped to 230 candidate cells, of which 34 flood.
  - Hardened Peak Inundation Depth on R02: **$31.70\text{ m}$** (at cell 1894/1943).
  - Hardened Flood Arrival on R02 at $0.30\text{ m}$ depth threshold: **$3,600\text{ s}$ ($60.0\text{ min}$)**.

---

## 3. R02 Decision Lineage & Depth Reconciliation

### 3.1 Side-by-Side Lineage Comparison

| Metric / Parameter | Obsolete Coupling ($1,200\text{ m}$) | Hardened Coupling ($150\text{ m}$) | Forensic Source / Reason |
|:---|:---|:---|:---|
| **Mapped Cells Count** | 312 cells | 230 cells | Restricted to genuine road corridor |
| **Nearest Cell Distance** | $14.2\text{ m}$ | $14.2\text{ m}$ | True physical road alignment |
| **Peak Depth on Road** | $37.37\text{ m}$ | **$31.70\text{ m}$** | Rejecting distant canyon depression cell |
| **Arrival Time ($0.30\text{ m}$)** | $3,300\text{ s}$ ($55.0\text{ min}$) | **$3,600\text{ s}$ ($60.0\text{ min}$)** | Cell 1894 actual corridor arrival |
| **Estimated Traversal Time**| $12.65\text{ min}$ ($759\text{ s}$) | $12.65\text{ min}$ ($759\text{ s}$) | Static engineering speed ($40\text{ km/h}$) |
| **Configured Safety Buffer**| $3.0\text{ min}$ ($180\text{ s}$) | $3.0\text{ min}$ ($180\text{ s}$) | Operational policy configuration |
| **Departure Deadline ($D_{\text{deadline}}$)** | $\approx 00:39:21\text{ UTC}$ | $\approx \mathbf{00:44:21\text{ UTC}}$ | $3600\text{ s} - 759\text{ s} - 180\text{ s} = 2661\text{ s}$ ($44.35\text{ min}$) |

### 3.2 Physical Elevation Explanation for R02 Depth
- **Dam Toe Reference (Cell 6100):** Minimum terrain elevation $z = 814.00\text{ m}$, Peak $\text{WSE} = 841.25\text{ m} \implies \text{Peak Depth} = 27.25\text{ m}$.
- **R02 Limiting Segment (Cell 1894/1943):** Minimum terrain elevation $z = 605.50\text{ m}$, Peak $\text{WSE} = 637.20\text{ m} \implies \text{Peak Depth} = 31.70\text{ m}$.
- **Causal Physics:** The Bhagirathi riverbed drops $208.5\text{ m}$ over the $15\text{ km}$ reach to Koteshwar, accompanied by canyon narrowing. The $31.70\text{ m}$ depth is a natural physical consequence of hydraulic confinement and downstream grade descent, not an error.

---

## 4. Frozen Hydraulic Artifacts Ledger

| Scenario ID | Native HEC-RAS Plan | Result File | SHA-256 Checksum |
|:---|:---|:---|:---|
| `SCENARIO_MINIMUM` | `tehri_dam_break.p02` | `tehri_dam_break.p02.hdf` | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` (demo fixture verified) |
| `SCENARIO_CENTRAL` | `tehri_dam_break.p01` | `tehri_dam_break.p01.hdf` | `a8497fa979e2c694a1d9405d544062a42099f6b49045dbb2c93fa91bb1641505` |
| `SCENARIO_MAXIMUM` | `tehri_dam_break.p03` | `tehri_dam_break.p03.hdf` | `c5123d449e29f8c679815049b49b2923f66c0d80c3d4a04620f5b9d7e5d26391` |

---

## 5. Decision Lineage Acceptance Criteria

1. **Hydraulic Immutability:** No Gate 5 module modifies or regenerates the HEC-RAS HDF5 files.
2. **Corridor Enforcement:** All spatial mapping calls reject any cell with perpendicular distance $> 150\text{ m}$.
3. **Traceable Lineage:** Every decision object links directly to the underlying HDF5 artifact SHA-256 and scenario parameters.
