# 06 — Arrival vs Departure Distinction Audit

**Project:** JalRakshak Emergency Decision-Support System  
**Safety Criticality:** HIGH (Prevents confusion between flood arrival and evacuation deadline)  
**Status:** PASS  

---

## 1. Safety Rationale

Confusing the time the flood reaches a road (`T+60:00`) with the time a vehicle must leave (`T+44:21`) could lead to fatal evacuation failure. The UI strictly enforces unambiguous differentiation.

---

## 2. Visual & Semantic Separation Ledger

| Dimension | Flood Arrival (`T+60:00`) | Latest Departure (`T+44:21`) | Separation Mechanism |
| :--- | :--- | :--- | :--- |
| **Label Text** | `Flood reaches route:` | `LEAVE BY:` | Explicit, distinct verbs |
| **Font Size** | 13px monospace | **36px monospace (Heroic)** | 2.8x font scaling disparity |
| **Container** | Triad Box (Secondary) | Dedicated Hero Center Card | Physical spatial bounding |
| **Color Treatment** | Dark Slate (`#0f172a`) | Bold Green/Black (`#166534`/`#0f172a`) | Distinct contrast hierarchy |
| **Explanation Text** | "Flood reaches route at T+60:00" | "Latest feasible departure is T+44:21" | Full contextual sentence in `[WHY?]` |

---

## 3. Real-Time Countdown Prevention
The UI displays scenario-relative hydraulic timestamps (e.g., `T+44:21` or `12:44 UTC`). It strictly **does not render a ticking real-world countdown** (e.g., "44 minutes remaining"), preventing misinterpretation when the simulation starts from an arbitrary hydrologic base hour.
