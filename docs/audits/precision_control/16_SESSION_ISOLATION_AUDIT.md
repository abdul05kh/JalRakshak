# 16 — Session Isolation & Mode Partitioning Audit
**Audit Date:** 2026-09-24  
**Audited Engine:** `backend/app/experiments/gate5b_harness.py`  

---

## 1. Mode Partitioning
The experiment harness enforces strict tri-state mode isolation based on participant ID prefixes:
1. **`TECHNICAL_DRY_RUN`:** Automated verification sessions (`DRYRUN-TECH-001`, `DRYRUN-TECH-002`).
2. **`INTERNAL_HUMAN_PILOT`:** Internal pre-pilot calibration sessions (`DRYRUN-HUMAN-001`, `DRYRUN-HUMAN-002`).
3. **`FORMAL_HUMAN_STUDY`:** Formal experimental participant cohorts (`P001`, `P002`, ...).

---

## 2. Contamination Prevention Verification
- Technical dry-run records are marked with `"experiment_mode": "TECHNICAL_DRY_RUN"` and quarantined from human datasets.
- Internal pilot sessions are tagged `"experiment_mode": "INTERNAL_HUMAN_PILOT"` and cannot silently merge into formal statistical aggregates.
- Each participant session is uniquely instantiated with a dedicated timestamped `session_id`, ensuring zero cross-participant state carryover.
