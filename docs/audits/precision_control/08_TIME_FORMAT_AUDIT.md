# 08 — Time Format Standardization & T+ Notation Audit
**Audit Date:** 2026-09-24  
**Audited Components:** `DecisionPanel.tsx`, `Sidebar.tsx`, `MapView.tsx`, `gate5b_harness.py`  

---

## 1. Time Format Standardization
To eliminate participant confusion during emergency decision-support tasks, relative scenario time is standardized to **`T+MM:SS`** or **`T+HH:MM:SS`** relative to $T+00:00$ (breach inception).

### Canonical Time Mapping Table

| Metric | Internal Value | Standardized UI Display | Context Label |
| :--- | :--- | :--- | :--- |
| **Breach Inception** | $0\text{ s}$ | `T + 00:00` | Scenario Reference Time |
| **Flood Arrival at R02** | $3,600\text{ s}$ | `T+60:00` | Flood reaches route |
| **Traversal Time** | $759.24\text{ s}$ | `12:39` | Travel time |
| **Emergency Safety Buffer** | $180.0\text{ s}$ | `03:00` | Safety buffer |
| **Latest Feasible Departure** | $2,660.76\text{ s}$ | `T+44:21` | LATEST FEASIBLE DEPARTURE |

---

## 2. Formatting Helpers Single Authority
In `DecisionPanel.tsx`, time formatting is handled by explicit conversion functions:
- `formatRelTime(seconds)` $\to$ `T+MM:SS`
- `formatMinSec(minutes)` $\to$ `MM:SS`

No participant-facing view displays raw fractional minutes (e.g. `44.346 min`) or uncaptioned UTC timestamp strings without relative context.
