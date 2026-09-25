# JALRAKSHAK — TIME TERMINOLOGY AUDIT & STANDARDIZATION
**Pre-Human Audit Forensic Reconciliation**
**Status:** COMPLETED & STANDARDIZED

---

## 1. Problem Statement

In previous Gate 5/5B documentation, the departure deadline for Route 1 (Malidewal $\to$ Koteshwar) under the Central Breach Scenario was frequently written as:
> `00:44 UTC` or `00:44:21 UTC`

### Why This Was Scientifically Flawed for Human Testing:
1. **Wall-Clock Ambiguity:** In human cognitive experiments, presenting an operational flood decision as a wall-clock UTC timestamp (`00:44 UTC`) confuses participants regarding whether the simulation refers to real-world midnight/morning, local Indian Standard Time (IST = UTC+5:30), or elapsed scenario time.
2. **Loss of Precision:** `00:44` rounded off the exact $21\text{ seconds}$ ($44.35\text{ min}$ vs $44.0\text{ min}$).
3. **Decoupled Physics:** Flood simulation physics are evaluated relative to the moment of dam breach initiation ($T_0 = 0$), not an arbitrary global clock.

---

## 2. Standardized Time Representation

All experimental materials, participant instructions, scoring rubrics, task books, ground-truth manifests, and test harnesses are standardized to:

| Format Type | Standardized Representation | Example |
| :--- | :--- | :--- |
| **Primary Participant Display** | **`T+MM min SS sec`** | **`T+44 min 21 sec`** |
| **Descriptive Text** | **`MM min SS sec after scenario activation`** | **`44 min 21 sec after breach activation`** |
| **Decimal Minutes** | **`MM.mm min`** | **`44.35 min`** |
| **Elapsed Seconds** | **`SSSS s`** | **`2661 s`** |
| **Departure Margin** | **`+MM.m min`** | **`+44.4 min`** |

---

## 3. Mathematical Traceability of Ground Truth

For Route 1 (Malidewal $\to$ Koteshwar, length $10.54\text{ km}$, speed $50\text{ km/h}$, travel time $12.65\text{ min} = 759\text{ s}$):
- **Limiting Road Segment:** `R02` (Chainage $6.50\text{ km}$)
- **Earliest Hydraulic Inundation Arrival at R02 ($A_{\text{R02}}$):** $T+60.00\text{ min}$ ($3,600\text{ s}$)
- **Travel Time from Origin to R02 ($T_{\text{R02}}$):** $12.65\text{ min}$ ($759\text{ s}$)
- **Configured Operational Safety Buffer ($B$):** $3.00\text{ min}$ ($180\text{ s}$)
- **Latest Feasible Departure ($D_{\text{deadline}}$):**
  $$D_{\text{deadline}} = A_{\text{R02}} - T_{\text{R02}} - B = 3600\text{ s} - 759\text{ s} - 180\text{ s} = 2661\text{ s} = \mathbf{T+44\text{ min } 21\text{ sec}}\ (44.35\text{ min})$$

---

## 4. Reconciliation Table Across Repository Artifacts

| Document / Code Location | Old Representation | Corrected Standardized Representation | Verification Status |
| :--- | :--- | :--- | :--- |
| `docs/GATE5B_GROUND_TRUTH_FREEZE.md` | `00:44 UTC` | `T+44 min 21 sec` ($44.35\text{ min}$) | ✅ **UPDATED** |
| `docs/GATE5B_TASK_BOOK.md` | `00:44 UTC` | `T+44 min 21 sec` ($44.35\text{ min}$) | ✅ **UPDATED** |
| `docs/GATE5B_SCORING_RUBRIC.md` | `00:44 UTC` | `T+44 min 21 sec` (Accepts $43.0$ to $45.5\text{ min}$) | ✅ **UPDATED** |
| `backend/app/experiments/gate5b_harness.py` | `"00:44"` | `"T+44 min 21 sec"` / `44.35 min` | ✅ **UPDATED** |
| `backend/tests/test_gate5b_harness_and_protocol.py` | `"00:44"` | `"T+44 min 21 sec"` / `44.35 min` | ✅ **UPDATED** |
