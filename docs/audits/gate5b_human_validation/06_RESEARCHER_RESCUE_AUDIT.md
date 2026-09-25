# 06 — Researcher Rescue & Intervention Audit

**Project:** JalRakshak Emergency Decision-Support System  
**Audit Purpose:** Standardized 8-Category Intervention Taxonomy  
**Status:** PASS  

---

## 1. Researcher Intervention Taxonomy

| Code | Category | Definition | Impact on Task Validity |
| :--- | :--- | :--- | :--- |
| `NO_HELP` | No Intervention | Participant completes task independently. | Full independent validity. |
| `TASK_CLARIFICATION` | Re-reading Prompt | Researcher re-reads prompt without providing hints. | Valid. |
| `TERMINOLOGY_CLARIFICATION` | General Definition | Explaining general terms (e.g., "what is UTC?"). | Valid with notation. |
| `UI_NAVIGATION_HELP` | Interface Guidance | Pointing out where drawers or toggles are located. | Non-cognitive assistance. |
| `TECHNICAL_HELP` | System Glitch Fix | Addressing browser zoom or hardware glitches. | Valid. |
| `PROTOCOL_HELP` | Process Reminder | Reminding participant to speak thoughts aloud. | Valid. |
| `ANSWER_LEAKING` | Hinting Solution | Providing information that directly hints at the answer. | **INVALIDATED (Flagged).** |
| `RESEARCHER_RESCUE` | Direct Assistance | Researcher provides the answer to prevent stalling. | **RESCUED (Scored as 0).** |

---

## 2. Hard Rule
Any task classified as `ANSWER_LEAKING` or `RESEARCHER_RESCUE` is strictly recorded as **RESCUED** and excluded from independent usability claims.
