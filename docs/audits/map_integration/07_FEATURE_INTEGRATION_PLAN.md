# 07 — Feature Integration & Implementation Plan

**Project:** JalRakshak Emergency Decision-Support System  
**Plan Scope:** Phase 1 through Phase 12 Execution Roadmap  
**Status:** READY FOR IMPLEMENTATION  

---

## 1. Implementation Roadmap

| Phase | Description | Components & Deliverables | Verification |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Map Data Pipeline & Timeline API | Backend endpoint `/scenarios/{id}/timeline` returning discrete timesteps | Pytest API tests |
| **Phase 2** | Full-Bleed Map & 3D Terrain Relief | Enhanced `MapView.tsx` with topographic elevation contours & Leaflet tilt/relief | Browser inspection |
| **Phase 3** | Temporal Flood Slider Component | `TemporalSlider.tsx` controlling flood propagation ($T+00 \dots T+90$) | Temporal state tests |
| **Phase 4** | Route Visualization & Status Overlays | Directional route corridor, active alternatives, shelter markers | Route tests |
| **Phase 5** | Docked Decision Hero Card | `FloatingDecisionCard.tsx` rendering `LEAVE BY T+44:21` + triad | Layout audit |
| **Phase 6** | Limiting Segment Interaction | Limiting segment zoom/highlight bridge to causal explanation | Click interaction tests |
| **Phase 7** | Operational Mode Simplification | Clean top bar, minimal legend, zero clutter | 5-second design target |
| **Phase 8** | Science / Audit View Mode | `ScienceDrawer.tsx` revealing full HEC-RAS solver, CRS, hashes | Provenance tests |
| **Phase 9** | Interactive Visual Explainers (01 to 07)| `ExplainerModal.tsx` with scenario-aware animations | Explainer tests |
| **Phase 10** | Test Suite & Regression Verification | 136 backend tests + new map integration tests | Full test execution |
| **Phase 11** | Performance & Responsiveness | Memory, framerate, payload checks | Preflight check |
| **Phase 12** | Human-Pilot Compatibility & Final Report | `FINAL_MAP_INTEGRATION_REPORT.md` | Gate 5B verification |
