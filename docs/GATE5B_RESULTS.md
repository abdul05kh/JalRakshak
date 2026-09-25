# GATE 5B — EXPERIMENTAL RESULTS & EVIDENCE LOG

**Project:** JalRakshak — SIH'26  
**Gate:** Gate 5B (Human Decision Usefulness Validation)  
**Status:** **HUMAN DATA NOT YET AVAILABLE (PROTOCOL READY)**  
**Date:** 2026-09-24  

---

## 1. Zero-Fabrication Certification

In strict accordance with Gate 5B's zero-fabrication mandate:
- **No simulated human response data has been generated.**
- **No synthetic completion times or fake participant scores have been inserted.**
- **No fabricated emergency officer interviews or user quotes exist.**

The experimental harness, participant task book, ground-truth freeze, and pre-registered scoring rubrics are fully implemented and verified. The gate stands in state **`PROTOCOL READY — HUMAN DATA REQUIRED`** awaiting live participant intake.

---

## 2. Participant Cohort Summary (Pending Live Administration)

| Metric | Condition A (Raw HEC-RAS Output) | Condition B (JalRakshak Decision Panel) |
|:---|:---:|:---:|
| **Enrolled Participants ($N$)** | `[ PENDING LIVE DATA ]` | `[ PENDING LIVE DATA ]` |
| **Completed Trials** | `[ PENDING LIVE DATA ]` | `[ PENDING LIVE DATA ]` |
| **Decision Accuracy ($M_1$)** | `[ PENDING LIVE DATA ]` | `[ PENDING LIVE DATA ]` |
| **Median Decision Time ($M_2$)** | `[ PENDING LIVE DATA ]` | `[ PENDING LIVE DATA ]` |
| **Deadline Accuracy ($M_3$)** | `[ PENDING LIVE DATA ]` | `[ PENDING LIVE DATA ]` |
| **Limiting Segment Accuracy ($M_4$)**| `[ PENDING LIVE DATA ]` | `[ PENDING LIVE DATA ]` |
| **Mean Explanation Score ($M_5$)**| `[ PENDING LIVE DATA ]` | `[ PENDING LIVE DATA ]` |
| **Limitation Awareness Rate ($M_6$)**| `[ PENDING LIVE DATA ]` | `[ PENDING LIVE DATA ]` |
| **Safety Misinterpretation Count ($M_7$)**| `[ PENDING LIVE DATA ]` | `[ PENDING LIVE DATA ]` |

---

## 3. Trial Data Log Template (Awaiting Participant Execution)

```csv
participant_id,participant_category,condition,task_id,duration_seconds,status_correct,deadline_correct,limiting_segment_correct,explanation_score,limitation_awareness,misinterpreted_as_safety
# LIVE TRIAL RECORDS WILL BE APPENDED HERE UPON EXECUTION
```

---

## 4. Next Operational Step

Administer the frozen task protocol to $N = 3 \text{ to } 5$ voluntary technical participants using [`backend/app/experiments/gate5b_harness.py`](file:///d:/projects/JalRakshak/backend/app/experiments/gate5b_harness.py) and export observed metrics directly into this ledger.
