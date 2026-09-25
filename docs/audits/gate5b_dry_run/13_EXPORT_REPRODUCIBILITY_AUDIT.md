# GATE 5B TECHNICAL DRY RUN — EXPORT REPRODUCIBILITY AUDIT
**Document ID:** `13_EXPORT_REPRODUCIBILITY_AUDIT.md`
**Timestamp:** 2026-09-24T18:41:50+05:30 (Local)
**Scope:** Independent Recomputation of Scores from Raw Exported Data

---

## 1. Independent Recomputation Verification

To prove that no opaque or non-reproducible scoring logic exists, an independent script parsed the raw responses in `session_DRYRUN-TECH-001.json` and recomputed all task scores strictly from first principles.

### Comparison Table:
| Trial Index | Task ID | Raw Response | Application Generated Score | Independently Recomputed Score | Discrepancy |
| :---: | :---: | :--- | :---: | :---: | :---: |
| 1 | `TASK_01` | `"status_selected": "FEASIBLE"` | 1 | 1 | **NONE** |
| 2 | `TASK_02` | `"deadline_entered": "T+44 min 21 sec"` | 1 | 1 | **NONE** |
| 3 | `TASK_03` | `"limiting_segment_entered": "R02"` | 1 | 1 | **NONE** |
| 4 | `TASK_04` | Causal explanation text | 2 | 2 | **NONE** |
| 5 | `TASK_05` | `"alternative_selected": "Yes..."` | 1 | 1 | **NONE** |
| 6 | `TASK_06` | `"scenario_delta_selected": "Contracts..."` | 1 | 1 | **NONE** |
| 7 | `TASK_07` | 3 valid limitations | 1 | 1 | **NONE** |

---

## 2. Verdict
- **Recomputation Discrepancy:** **0 discrepancies across all trials**
- **Export Reproducibility Status:** **100% REPRODUCIBLE (PASS)**
