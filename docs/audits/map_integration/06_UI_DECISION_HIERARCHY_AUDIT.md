# 06 — UI Decision Hierarchy & Map-First Layout Audit

**Project:** JalRakshak Emergency Decision-Support System  
**Design Principle:** Map as the Primary Operational Instrument  
**Status:** PASS  

---

## 1. Information Hierarchy & Spatial Alignment

```text
LEVEL 1 — PRIMARY MAP (Dominant Viewport)
   ├─ Visual Inundation Wavefront (Spatial Location & Depth)
   ├─ Evacuation Route Corridor (Path & Direction)
   ├─ Limiting Segment Focus (Prominent Red Highlight)
   └─ Evacuation Shelters (Destination Pins)

LEVEL 2 — OPERATIONAL DECISION (Docked Hero Card)
   ├─ Status: ✓ FEASIBLE
   └─ Departure Deadline: LEAVE BY T+44:21 (Hero Metric, 32px font)

LEVEL 3 — TIMING TRIAD & EXPLANATION
   ├─ Flood reaches route: T+60:00
   ├─ Travel time: 12:39
   ├─ Safety buffer: 03:00
   └─ Arithmetic breakdown in [WHY?]: 60:00 - 12:39 - 03:00 = 44:21

LEVEL 4 — TEMPORAL FLOOD SLIDER
   └─ Controls flood propagation: T+00 ── T+30 ── T+60 ── T+90

LEVEL 5 — PROGRESSIVE DISCLOSURE
   ├─ [CHANGE ROUTE]: Origin/Destination selector & threshold config
   ├─ [INTERACTIVE EXPLAINERS]: 7 scenario-aware visual explainers
   └─ [SCIENCE / AUDIT MODE]: Complete HEC-RAS parameters, CRS, provenance hashes
```

---

## 2. Accessibility & Layout Constraints
- The map occupies $> 75\%$ of screen area.
- The decision card is docked at the bottom/side and never pushes primary indicators below the fold.
- The user sees: **The Hazard**, **The Road**, **The Time**, **The Decision** simultaneously on a single screen.
