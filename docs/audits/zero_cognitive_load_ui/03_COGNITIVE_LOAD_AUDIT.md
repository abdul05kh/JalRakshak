# 03 — Cognitive Load Audit

**Project:** JalRakshak Emergency Decision-Support System  
**Audit Standard:** Cognitive Load Theory (Sweller) & Human Factors Engineering  
**Status:** PASS  

---

## 1. Cognitive Load Categories & Reductions

### A. Intrinsic Cognitive Load
- **Definition:** The mental effort required to understand the core question: *"Can I use route R02 and when must I leave?"*
- **Mitigation:** The system pre-calculates the Evacuation Window Equation ($EWE$) deterministically:
  $$\text{Deadline} = T_{\text{arrival}} - T_{\text{travel}} - T_{\text{buffer}}$$
- The operator never has to perform manual conversions, coordinate lookups, or depth threshold checks.

### B. Extraneous Cognitive Load (Eliminated)
- **Eliminated Visual Clutter:**
  - Removed 33 technical data points from initial screen.
  - Eliminated complex 3D meshes, particle flow animations, flashing warning banners, and multi-tier nested cards.
  - Removed technical jargon (`Diffusion Wave Solver`, `LineString Perpendicularity`, `EPSG:32644`).
- **Eliminated Action Confusion:**
  - One primary flow: Scenario $\rightarrow$ Route $\rightarrow$ Decision $\rightarrow$ Why $\rightarrow$ Map.
  - No competing "Calculate", "Run Model", or "Execute" buttons needed for standard review.

### C. Germane Cognitive Load (Enhanced)
- Direct arithmetic transparency in `[WHY?]`:
  $$60:00 - 12:39 - 03:00 = 44:21$$
- Operators construct accurate mental models of why a route is feasible or infeasible without hydraulic training.
