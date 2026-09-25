# 01 — Pilot Protocol Confirmation & Codebase Freeze

**Project:** JalRakshak Emergency Decision-Support System  
**Protocol Version:** Gate 5B Protocol v1.2 (Counterbalanced 2-Condition Design)  
**Execution Mode:** Internal Pilot Protocol Freeze  
**Status:** FROZEN & READY FOR PARTICIPANTS  

---

## 1. Codebase & Ground-Truth Freeze Record

| Artifact / Subsystem | Frozen Version / Identifier | Integrity Hash / Value | State |
| :--- | :--- | :--- | :--- |
| **Backend Decision Engine** | `backend/app/domain/ewe_engine.py` (v1.2) | Deterministic Invariant Checked | **FROZEN** |
| **Spatial Road Coupling** | 150m strict corridor, $\le 50\text{ m}$ densification | EPSG:32644 LineString Perpendicularity | **FROZEN** |
| **Ground-Truth Manifest** | Authoritative Scenarios (28.5k / 65k / 115k m³/s) | `f91a5330...` | **FROZEN** |
| **Frontend Production Build** | Vite Client Bundle (`dist/assets/`) | Build verified in 570ms | **FROZEN** |
| **Automated Tests** | 136 Pytest Test Suite | 136 / 136 PASS | **FROZEN** |
| **Condition A Definition** | Raw 2D Depth/Velocity Map + Point Probe | Zero EWE deadline or badge leakage | **FROZEN** |
| **Condition B Definition** | JalRakshak Decision Console | `LEAVE BY T+44:21` + `✓ FEASIBLE` + `[WHY?]` | **FROZEN** |

---

## 2. Experimental Invariants Enforced
- Zero UI/backend edits permitted during human testing sessions.
- No researcher prompting or solution hinting (`ANSWER_LEAKING` $\rightarrow$ invalidates task).
- All prospective claims restricted to empirical observation.
