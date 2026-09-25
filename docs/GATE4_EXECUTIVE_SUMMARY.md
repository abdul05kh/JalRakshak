# GATE 4 EXECUTIVE SUMMARY
## Transforming Frozen HEC-RAS Hydrodynamics into Deterministic Evacuation Route Decisions

**Project:** JalRakshak SIH'26  
**Gate:** GATE 4 — EVACUATION WINDOW ENGINE & HYDRAULIC DECISION SUPPORT  
**Status:** **PASSED**  
**Date:** 2026-09-24  

---

## 1. The Core Operational Problem

Raw 2D hydraulic simulation models (such as USACE HEC-RAS) output complex, high-dimensional physical grids: hundreds of thousands of cell water surface elevations ($\text{WSE}$), face velocity vectors, and boundary stages over time.

An emergency management officer under severe time pressure during a dam-break alert cannot digest raw hydrodynamic depth rasters to make immediate transport decisions. An officer requires answers to five fundamental questions:

1. **Which evacuation routes are feasible right now?**
2. **Until what exact minute can vehicles depart safely?**
3. **How much time margin remains before the route is cut off?**
4. **Which specific road segment constrains the route?**
5. **Why did that constraint occur, and under what hydraulic assumptions?**

---

## 2. The JalRakshak Solution: The Evacuation Window Engine (EWE)

Gate 4 operationalizes the frozen, genuine HEC-RAS 7.0.1 2D simulation results into an auditable, deterministic mathematical pipeline:

$$\text{HYDRAULIC PROPAGATION} \longrightarrow \text{FLOOD ARRIVAL} \longrightarrow \text{ROAD EXPOSURE} \longrightarrow \text{ROUTE FEASIBILITY} \longrightarrow \text{LATEST DEPARTURE} \longrightarrow \text{LIMITING SEGMENT} \longrightarrow \text{DETERMINISTIC WHY} \longrightarrow \text{OFFICER DECISION}$$

### Core Mathematical Invariant:
For an evacuation route comprising road segments $e_1, e_2, \dots, e_n$ with cumulative traversal time $T_i$, flood arrival time $A_i$, and configured safety buffer $B$:

$$D_{\text{deadline}} = \min_{i} (A_i - T_i - B)$$

A route is **FEASIBLE** for departure $D$ if and only if:
$$D \le D_{\text{deadline}}$$

The bottleneck road segment producing this minimum is mathematically isolated as the **LIMITING SEGMENT**, giving the officer an immediate, unambiguous causal explanation.

---

## 3. Key Achievements & Evidence

1. **Gate 3 Hydraulic Freeze Respected (100%):**
   - Zero modifications to HEC-RAS meshes, geometries, or solver timesteps.
   - All 7 frozen Gate 3B Tehri HDF5 files ingested with bit-exact SHA-256 cryptographic verification.
2. **Hardened Geometry-Based Spatial Coupling:**
   - Road LineStrings densified at $\Delta s \le 50\text{ m}$ and buffered at $150\text{ m}$ ($1.5\Delta x$), eliminating spurious riverbed associations on mountain ridge bypasses.
   - R02 road-corridor peak depth verified at $31.70\text{ m}$ (downstream riverbed elevation $z = 605.5\text{ m}$ vs dam toe $z = 814.0\text{ m}$).
3. **Officer-First Decision Interface:**
   - Giant status cards (`FEASIBLE`, `LOW MARGIN`, `INFEASIBLE`, `DATA GAP`).
   - Departure deadlines and remaining margins prominently displayed.
   - Limiting segments highlighted directly on map and decision panel.
4. **Multi-Scenario Comparison:**
   - Instant side-by-side comparison across `MINIMUM` ($28,500\text{ m}^3/\text{s}$), `CENTRAL` ($65,000\text{ m}^3/\text{s}$), and `MAXIMUM` ($115,000\text{ m}^3/\text{s}$) demonstrating observed monotonic scenario ordering for the tested scenarios.
5. **Zero AI Decision Tampering:**
   - Numerical calculations, routing, and feasibility classifications are 100% deterministic graph/math operations.
   - AI is strictly constrained to narrative summaries and conversational queries over the structured provenance log.
6. **Rigorous Scientific QA:**
   - 88 automated tests passing across backend test suite.
   - All 8 mandatory mathematical invariants verified.
   - 100% bit-exact reproducibility.
