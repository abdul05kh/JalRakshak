# 13 — Arrival vs Departure Distinction Audit

**Project:** JalRakshak Emergency Decision-Support System  
**Audit Purpose:** Prevent Fatal Timing Confusion in Emergency Contexts  
**Status:** PASS  

---

## 1. Differentiation Strategy

| Parameter | Display Label | Font Size | Placement | Semantics |
| :--- | :--- | :--- | :--- | :--- |
| **Flood Arrival Time** | `Flood reaches route: T+60:00` | 13px monospace | Triad Info Box | Time when flood cuts off route corridor. |
| **Departure Deadline** | `LEAVE BY T+44:21` | **36px monospace (Hero)** | Giant Decision Hero Card | Time by which evacuee must start traveling. |

---

## 2. Participant Safeguards
The interface never displays raw unlabelled timestamps like `T+60:00` next to `T+44:21` without full contextual wording.
