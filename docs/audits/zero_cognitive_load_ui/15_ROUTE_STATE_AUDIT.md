# 15 — Route State & Switching Audit

**Project:** JalRakshak Emergency Decision-Support System  
**Audit Purpose:** Verify Multi-Route Evaluation & State Synchronization  
**Status:** PASS  

---

## 1. Route Evaluation Matrix (Central Scenario Baseline)

| Route ID / Corridor | Origin $\rightarrow$ Destination | Length | Limiting Segment | Travel Time | Arrival Time | Deadline | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **R02 (Primary)** | Malidewal $\rightarrow$ Koteshwar | $10.5\text{ km}$ | **R02** | `12:39` | `T+60:00` | `T+44:21` | **FEASIBLE** |
| **R01 (Alternative 1)** | Malidewal $\rightarrow$ Higher Ridge | $7.2\text{ km}$ | **R01** | `8:38` | `T+90:00` | `T+78:22` | **FEASIBLE** |
| **R03 (Alternative 2)** | Valley Bottom $\rightarrow$ Low Shelter | $14.1\text{ km}$ | **R03** | `16:55` | `T+18:00` | `IMPASSIBLE` | **INFEASIBLE** |

---

## 2. Route Switching Integrity
- Switching between routes updates:
  - Route name and geometry on map.
  - Active limiting segment highlight.
  - Feasibility badge and decision margin.
  - Plain-language explanation in `[WHY?]`.
- No lingering data from previous route selections remains in the UI.
