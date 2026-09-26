# JALRAKSHAK RC2.3 — DEDICATED CINEMATIC TECHNICAL SIMULATION MODE

**Release**: `RC2.3 — Cinematic Technical Simulation Mode`  
**Date**: September 26, 2026  
**Module**: [`frontend/src/simulation/`](file:///d:/projects/JalRakshak/frontend/src/simulation/)  
**Status**: **IMPLEMENTED & BROWSER-VERIFIED**

---

## 1. Purpose & Core Philosophy

The cinematic simulation mode in JalRakshak exists to communicate the complete disaster trajectory and clearly demonstrate the transformation from raw hydraulic physics to operational emergency decision support.

The simulation is **presentation-only**. It visualizes:
$$\text{Tehri Dam} \longrightarrow \text{Breach Initiation} \longrightarrow \text{Wavefront Propagation} \longrightarrow \text{Terrain Channeling} \longrightarrow \text{Settlement Exposure} \longrightarrow \text{Road Impact} \longrightarrow \text{Limiting Segment Bottleneck} \longrightarrow \text{JalRakshak Decision Transformation}$$

> **NON-NEGOTIABLE SCIENTIFIC BOUNDARY:**  
> The simulation visualization does **not** alter, calculate, or replace authoritative backend EWE decisions. Visual interpolation between hydraulic keyframes is used solely for graphical continuity.

---

## 2. Architecture & Component Hierarchy

The simulation is strictly separated from the operational map inside `frontend/src/simulation/`:

```text
CinematicSimulationView (Main View Container)
    │
    ├── SimulationHUD (Top Banner, Minimalist HUD, Bottom Timeline Player)
    │
    ├── DecisionReveal (Climax Overlay: HEC-RAS -> Road Coupling -> EWE -> Deadline)
    │
    ├── SimulationTimeline (10 Deterministic Narrative Phases & HEC-RAS Mapping)
    │
    └── MapView / ArcGISSceneViewer (Shared 3D WebGL2 SceneView Singleton)
```

### Deterministic Presentation Phases

| Phase | Time Window | Title | Camera Preset | Target HEC-RAS Keyframe |
|:---:|:---:|---|:---:|:---:|
| **1. Intro** | $0 - 14\text{s}$ | Tehri Dam Reservoir & Upstream Basin | `TEHRI_DAM` | $T+00:00$ |
| **2. Breach** | $14 - 28\text{s}$ | Breach Initiation at 635m Invert | `BREACH_LOCATION` | $T+10:00$ |
| **3. Release** | $28 - 44\text{s}$ | Peak Hydrodynamic Discharge Wavefront | `BREACH_LOCATION` | $T+20:00$ |
| **4. Propagation** | $44 - 62\text{s}$ | Downstream Hydraulic Wavefront Propagation | `DOWNSTREAM_VALLEY` | $T+35:00$ |
| **5. Settlements** | $62 - 78\text{s}$ | Downstream Settlement Exposure (Malidewal/Tipri) | `DOWNSTREAM_VALLEY` | $T+45:00$ |
| **6. Roads** | $78 - 92\text{s}$ | Transport Network Intersection & Route R02 | `R02_ROUTE` | $T+50:00$ |
| **7. Traversal** | $92 - 106\text{s}$ | Modeled Evacuation Traversal Progression | `R02_ROUTE` | $T+55:00$ |
| **8. Limiting Edge** | $106 - 118\text{s}$ | Limiting Segment R02-E07 Threshold Reached | `R02_E07_LIMITING` | $T+60:00$ |
| **9. Transformation**| $118 - 130\text{s}$| JalRakshak Decision Transformation | `R02_ROUTE` | $T+60:00$ |
| **10. Climax Reveal**| $130 - 140\text{s}$| Latest Feasible Departure: LEAVE BY T+44:21 | `VALLEY_OVERVIEW` | $T+60:00$ |

---

## 3. Disambiguated Temporal Clocks

The simulation maintains three clearly separated clocks:

1. **Simulation Presentation Clock**: `elapsedSec` ($00:00 \to 02:20$, controlled by Play, Pause, Speed 0.5x-4x, Scrub).
2. **Hydraulic Source Keyframe Time**: Quantized native 5-min HEC-RAS timestep ($T+00 \to T+120$).
3. **Evacuation Decision Deadline**: Closed-form mathematical output $D = \min_i(A_i - T_i - B) = T+44:21$ ($2661\text{s}$).

---

## 4. Scientific Invariants & Limits

- **Zero EWE Mutation**: Presentation speed (0.5x to 4x), scrub position, and camera movements cannot modify EWE results.
- **Dynamic Traffic Excluded**: Evacuation progression along road vertices is modeled static traversal; dynamic traffic congestion is out of scope.
- **Structural Failure Excluded**: Inundation corresponds to $h \ge 0.30\text{m}$; building collapse, scour, and bridge failure are unmodeled.
- **Vertical Datum**: Explicitly declared as `NOT_ESTABLISHED`.
