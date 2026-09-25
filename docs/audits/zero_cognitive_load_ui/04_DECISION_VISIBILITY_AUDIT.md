# 04 — Decision Visibility Audit (Five-Second Rule)

**Project:** JalRakshak Emergency Decision-Support System  
**Test Standard:** Five-Second Viewport Comprehension Test  
**Scenario / Route:** CENTRAL / R02 — Malidewal → Koteshwar  
**Status:** PASS  

---

## 1. Five-Second Viewport Verification

The automated audit verified that on initial load of the CENTRAL / R02 state, all critical decision tokens are rendered above the fold in the primary viewport without requiring:
1. Scrolling
2. Opening a modal or drawer
3. Opening the route breakdown table
4. Hovering or clicking on the map
5. Navigating to secondary tabs

### Visibility Ledger:

| Decision Token | Rendered Value | Viewport Location | Visual Weight | Time to Read |
| :--- | :--- | :--- | :--- | :--- |
| **Scenario Name** | `CENTRAL (65,000 m³/s)` | Top Bar Selector | Medium (12px, 700 weight) | < 1 sec |
| **Route Name** | `R02 — Malidewal → Koteshwar` | Decision Header | Bold (14px, 800 weight) | < 1 sec |
| **Feasibility Status** | `✓ FEASIBLE` | Hero Badge Top | Very Large (24px, 900 weight, Green) | < 1 sec |
| **Departure Deadline** | `LEAVE BY T+44:21` | Hero Card Center | **Heroic (36px, Monospace, Dominant)** | < 1 sec |
| **Flood Arrival** | `Flood reaches route: T+60:00` | Triad Box | Medium (13px, Monospace) | < 2 sec |
| **Limiting Segment** | `Limiting part of route: R02` | Triad Box | High Contrast Red (13px) | < 2 sec |

---

## 2. Automated Visibility Check Result
- **Result:** 100% of core tokens exposed in initial rendering frame.
- **Pass Criteria:** Zero obstruction, zero hidden states for Level 1/2/3 data.
