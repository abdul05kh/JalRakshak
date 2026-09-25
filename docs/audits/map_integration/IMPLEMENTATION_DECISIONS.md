# Implementation Decisions Ledger

**Project:** JalRakshak Emergency Decision-Support System  
**Audit Purpose:** Comprehensive Architectural & Visual Decision Records  
**Date:** 2026-09-25  

---

## Decision Record 01: Map-First Layout Architecture
- **Problem:** Previous UI squeezed the map between a static 240px sidebar and a 420px decision panel, reducing spatial awareness.
- **Chosen Approach:** Full-bleed interactive map canvas occupying $>75\%$ of screen area, with docked, non-intrusive floating decision cards and on-demand modal/drawer progressive disclosure.
- **Scientific Impact:** Zero scientific logic altered; vastly improves operator situational awareness.

## Decision Record 02: Discrete Temporal Timeline
- **Problem:** Continuous time sliders could imply continuous physical simulation frames between discrete HEC-RAS output intervals.
- **Chosen Approach:** Discrete timestep slider matching native/scenario-derived output intervals ($T+00, T+15, T+30, T+45, T+60, T+75, T+90$).
- **Scientific Impact:** Eliminates temporal interpolation artifacts; accurately reflects native simulation states.

## Decision Record 03: Scenario-Aware Interactive Explainers
- **Problem:** Static documentation pages disconnect users from live scenario data.
- **Chosen Approach:** Built-in interactive visual explainers (01 to 07) that dynamically pull values from the currently active scenario (MINIMUM, CENTRAL, MAXIMUM) and selected route.
- **Scientific Impact:** Directly reinforces the mathematical and spatial logic of the decision engine.
