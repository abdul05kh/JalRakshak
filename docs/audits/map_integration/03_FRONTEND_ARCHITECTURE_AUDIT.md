# 03 — Frontend Architecture & Component Audit

**Project:** JalRakshak Emergency Decision-Support System  
**Framework:** React 18 + TypeScript + Vite + Leaflet + Lucide Icons  
**Status:** PASS  

---

## 1. Component Hierarchy & Layout Transformation

### Legacy Layout (Sidebar Heavy):
- `Header` (58px top)
- `Sidebar` (240px fixed left column with scenario info, layer toggles, breach params)
- `MapView` (Remaining center width)
- `DecisionPanel` (420px fixed right column)

### Target Layout (Map-First Dominance):
```text
┌────────────────────────────────────────────────────────────────────────┐
│ TOP BAR: JALRAKSHAK │ SCENARIO ▼ │ ROUTE ▼ │ [OPERATIONAL / SCIENCE]    │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│                       PRIMARY FULL-BLEED MAP                           │
│                                                                        │
│   [3D Relief / Contour Toggle]        [Layer Controls Overlay]         │
│   [North / Compass / Tilt]                                             │
│                                                                        │
│                      ┌────────────────────────────┐                    │
│                      │   FLOOD TIMELINE SLIDER    │                    │
│                      │  T+00 ─ T+30 ─ T+60 ─ T+90 │                    │
│                      └────────────────────────────┘                    │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ FLOATING DOCKED DECISION CARD:                                 │   │
│   │   ✓ FEASIBLE   │  LEAVE BY T+44:21   │  LIMITING: R02          │   │
│   │   Arrival: T+60:00 │ Travel: 12:39 │ Buffer: 03:00             │   │
│   │   [ WHY? ]   [ CHANGE ROUTE ]   [ INTERACTIVE EXPLAINERS ]     │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Refactoring Strategy
1. **`App.tsx`:** Coordinates state, active scenario, selected route, temporal slider position, operational vs science view mode, and modal states.
2. **`MapView.tsx`:** Enhanced full-bleed interactive map with 3D/2.5D topographic relief awareness, flood time evolution, route traversal paths, animated limiting segment focus, and contextual tooltips.
3. **`FloatingDecisionCard.tsx`:** Docked bottom card presenting the Level 1 decision and Level 2 timing triad without blocking the central map canvas.
4. **`TemporalSlider.tsx`:** Discrete native timestep controller driving temporal flood layers.
5. **`ExplainerModal.tsx`:** Interactive scenario-aware step-through animations for the 7 core concepts.
6. **`ScienceDrawer.tsx`:** Complete audit mode exposing HEC-RAS solver details, CRS, mesh, DEM provenance, and SHA-256 hashes.
