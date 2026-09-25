# Primary Decision View & Comprehension Audit
**Audit Date:** 2026-09-24  
**Audit Standard:** Sub-5-Second Emergency Decision-Maker Comprehension Test  

---

## 1. Primary Viewport Structure Check

The primary viewport of the JalRakshak Decision Console renders the decision immediately without requiring menu navigation or drawer opening:

```
============================================================
JALRAKSHAK EVACUATION DECISION CONSOLE
============================================================
SCENARIO:       CENTRAL FLOOD SCENARIO (65,000 m³/s)
EVALUATED ROUTE: Malidewal → Chamba

STATUS:         [ FEASIBLE ] (Conditional on model assumptions)

------------------------------------------------------------
LATEST FEASIBLE DEPARTURE:
       T + 44 : 21
Under current scenario and configured assumptions
------------------------------------------------------------

LIMITING SEGMENT: R02
DECISION MARGIN:  +44.4 min

============================================================
LEVEL 2: DECISION EQUATION (WHY?)
------------------------------------------------------------
Flood reaches route:      T + 60 : 00
minus Travel time:      -     12 : 39
minus Safety buffer:    -     03 : 00
------------------------------------------------------------
Latest feasible departure: = T + 44 : 21
============================================================
```

---

## 2. 5-Second Comprehension Checklist (Technical Audit)

| Evaluation Question | Required Answer | UI Presentation in Primary View | Audit Result |
| :--- | :--- | :--- | :--- |
| **1. WHAT SCENARIO?** | Central Flood Scenario ($Q_p = 65,000\text{ m}^3/\text{s}$) | Displayed in Header and Decision Panel header | **PASS** |
| **2. WHAT ROUTE?** | Malidewal to Chamba ($10.53\text{ km}$) | Displayed prominently at top of Decision Panel | **PASS** |
| **3. CAN I USE IT?** | FEASIBLE | Hero green badge with check icon and conditional subtitle | **PASS** |
| **4. UNTIL WHEN?** | $T+44:21$ ($2,661\text{ s}$) | 28px Monospace Hero display: `T+44:21` | **PASS** |
| **5. WHAT LIMITS IT?** | Segment $R02$ | Explicit `Limiting Segment: R02` metric & map highlight | **PASS** |
| **6. WHY?** | $60:00 - 12:39 - 03:00 = 44:21$ | Direct arithmetic subtraction block in Level 2 | **PASS** |
| **7. WHAT ASSUMPTIONS?** | 150m corridor, 50km/h speed, 3m buffer | Accessible via `[Evidence & Provenance]` drawer | **PASS** |

---

## 3. Visual Separation of Arrival vs Departure
To prevent the dangerous confusion between **flood arrival time** and **evacuation departure deadline**, the UI provides distinct, visually separated labels:
- **`FLOOD REACHES ROUTE:`** $T+60:00$ (Timestamp when water depth exceeds $0.3\text{ m}$ on limiting segment $R02$).
- **`LATEST FEASIBLE DEPARTURE:`** $T+44:21$ (Latest time an evacuating vehicle can leave the origin settlement).

They are never displayed uncaptioned or adjacent without arithmetic signage.
