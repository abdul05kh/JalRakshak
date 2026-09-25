# 08 — Comprehension Failure Modes Tracking

**Project:** JalRakshak Emergency Decision-Support System  
**Audit Purpose:** Pre-declared Failure Mode Tracking & Detection  
**Status:** PROTOCOL ACTIVE  

---

## 1. Targeted Failure Modes & Detection Rules

| Failure Mode ID | Potential Cognitive Failure | Detection Rule | Protocol Countermeasure |
| :--- | :--- | :--- | :--- |
| **FAIL-01** | **Arrival vs Departure Confusion** | Participant reports $T+60:00$ when asked for departure deadline. | Hero metric labelled `LEAVE BY` (36px font) vs `Flood reaches route`. |
| **FAIL-02** | **Feasible vs Safe Confusion** | Participant equates `FEASIBLE` to `SAFE` / `NO RISK`. | Persistent disclaimer: *"Not a guarantee of physical safety."* |
| **FAIL-03** | **Travel vs Arrival Confusion** | Participant subtracts travel time incorrectly or confuses duration with timestamp. | Explicit subtraction breakdown in `[WHY?]` panel. |
| **FAIL-04** | **Scenario Direction Reversal** | Participant assumes higher flood discharge yields later departure deadline. | Monotonicity check across MINIMUM, CENTRAL, MAXIMUM. |

---

## 2. Observation Logging
Observers are instructed to record any instance of these failure modes in real-time session logs.
