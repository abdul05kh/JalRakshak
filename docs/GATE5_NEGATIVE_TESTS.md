# GATE 5 — NEGATIVE & BOUNDARY TEST MATRIX

**Project:** JalRakshak — SIH'26  
**Gate:** Gate 5 (Officer Decision Validation & Decision-Support Closure)  
**Status:** COMPLETED & DEFENDED  
**Date:** 2026-09-24  

---

## 1. Negative Test Suite Strategy

Safety-critical emergency software must never fail silently, crash without an error response, or fallback to an unsafe `FEASIBLE` status when presented with invalid, corrupt, or missing data.

---

## 2. Negative Test Scenarios & Defended Behaviors

| Test ID | Input Condition | Injected Fault / Boundary Violation | Expected System Behavior | Actual Result | Status |
|:---|:---|:---|:---|:---|:---:|
| **NEG-01** | `GET /scenarios/non-existent-id` | Non-existent scenario identifier | Returns `404 Not Found` with structured error JSON `{"code": "SCENARIO_NOT_FOUND"}`. | `404 Not Found` returned | **PASS** |
| **NEG-02** | `POST /routes/analyze` with unknown scenario | Unknown `scenario_id` | Returns `404 Not Found` with error code `SCENARIO_NOT_FOUND`. | `404 Not Found` returned | **PASS** |
| **NEG-03** | `POST /scenarios` with invalid breach width | Negative breach width $w = -10.0\text{ m}$ | Rejects creation with `422 Unprocessable Entity` or `400 Bad Request`. | `422/400` validation error | **PASS** |
| **NEG-04** | `POST /scenarios` with zero formation time | $t_{\text{form}} = 0.0\text{ min}$ | Pydantic validation rejects with `gt=0` constraint failure. | `422` validation error | **PASS** |
| **NEG-05** | `POST /routes/analyze` with disconnected OD | Origin / Destination nodes with no topological path | Returns `NO_FEASIBLE_ROUTE` with explicit explanation. | `NO_FEASIBLE_ROUTE` returned | **PASS** |
| **NEG-06** | EWE evaluation with missing edge hydraulics | Segment `R02` missing from hydraulic dictionary | Returns `DATA GAP` status; never defaults to `FEASIBLE` or `SAFE`. | `DATA GAP` returned | **PASS** |
| **NEG-07** | EWE evaluation with negative time margin | Departure time requested $50\text{ min}$ post-breach | Returns `INFEASIBLE` with negative margin and clearance deficit. | `INFEASIBLE` returned | **PASS** |
| **NEG-08** | EWE evaluation with out-of-bounds coordinates | Lat/Lon query far outside Tehri region ($90.0, 180.0$) | Snaps safely to nearest defined bounding node with offset distance noted. | Snapped safely | **PASS** |
| **NEG-09** | Hydraulic adapter loading corrupted HDF5 | Corrupted or truncated `.hdf` file header | Catches `HDF5ExtError` / `OSError`, logs forensic warning, returns clean failure. | Exception handled safely | **PASS** |
| **NEG-10** | Attempted artifact mutation via API | Client attempts to POST or PUT changes to frozen Gate 3 HDF5 | Frozen artifacts are read-only (`mode='r'`); API exposes no mutation endpoint. | Mutability blocked | **PASS** |
| **NEG-11** | CRS Coordinate mismatch | Ingestion of coordinates outside UTM 44N | Strict validation of EPSG:32644 projection prevents coordinate skew. | Enforced | **PASS** |
| **NEG-12** | Safety Buffer Sensitivity Linearity | Buffer variations $B \in [0, 3, 5, 10, 15, 20]\text{ min}$ | Exact linear deadline shift: $\Delta D_{\text{deadline}} = -\Delta B$. | Linearity verified | **PASS** |

---

## 3. Negative Test Verification Summary

- **Total Negative Tests Executed:** 12
- **Failures / Crashes:** 0
- **Silent Fallbacks to FEASIBLE:** 0
- **Negative Testing Verdict:** **100% PASS**
