# 05 — Researcher Intervention & Rescue Logging

**Project:** JalRakshak Emergency Decision-Support System  
**Audit Purpose:** Standardized 8-Level Intervention Logging Mechanism  
**Status:** INSTRUMENTED & ACTIVE  

---

## 1. Classification Definitions & Scoring Impact

| Code | Level | Definition | Impact on Task Validity |
| :--- | :--- | :--- | :--- |
| `NO_HELP` | Level 0 | Participant completed task unassisted. | 100% independent validity. |
| `TASK_CLARIFICATION` | Level 1 | Re-read prompt text verbatim. | Valid. |
| `TERMINOLOGY_CLARIFICATION` | Level 2 | Defined neutral terms (e.g. UTC, MSL). | Valid with notation. |
| `NAVIGATION_HELP` | Level 3 | Pointed out UI scroll / drawer toggle. | Non-cognitive assistance. |
| `TECHNICAL_HELP` | Level 4 | Fixed display scaling / browser glitch. | Valid. |
| `PROTOCOL_HELP` | Level 5 | Reminded participant to submit answer. | Valid. |
| `ANSWER_LEAKAGE` | Level 6 | Inadvertent hint provided by observer. | **INVALIDATED (Flagged).** |
| `RESEARCHER_RESCUE` | Level 7 | Observer provided answer to unblock participant. | **RESCUED (Score = 0).** |

---

## 2. Invariant Rule
Any task recorded as `ANSWER_LEAKAGE` or `RESEARCHER_RESCUE` is explicitly logged as **RESCUED** and excluded from independent usability claims.
