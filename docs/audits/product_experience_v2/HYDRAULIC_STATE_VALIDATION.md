# HYDRAULIC STATE VALIDATION AUDIT (GATE C)
**Project**: JalRakshak Emergency Evacuation Decision-Support System  
**Document**: Gate C — Native HEC-RAS Temporal State Visualization  
**Date**: September 25, 2026  
**Status**: COMPLETE / ACCEPTED (GATE C PASS)  

---

## 1. Executive Summary

Hydraulic visualization in JalRakshak is driven strictly by native HEC-RAS 2D unsteady shallow water equation hydrodynamic results.

Artificial wave shaders, cinematic water particles, prerecorded video playback, and fabricated intermediate states are strictly forbidden. Every rendered polygon reflects the exact hydraulic model output.

---

## 2. Supported Hydrodynamic Visualization Modes

The Cesium 3D visualizer provides 3 discrete, scientifically grounded modes via [HydraulicLayer.ts](file:///d:/projects/JalRakshak/frontend/src/map3d/HydraulicLayer.ts):

1. **FLOOD EXTENT**:
   - **Formulation**: Binary depth threshold mask ($h \ge 0.30\,\text{m}$).
   - **Rendering**: Translucent blue aquatic drape (`rgba(30, 144, 255, 0.70)`) with high-contrast active wet/dry boundary.
   - **Function**: Rapid identification of inundated land corridors.

2. **FLOOD DEPTH**:
   - **Formulation**: Continuous scientific colormap calibrated to water column depth in meters.
   - **Color Scale**:
     - Shallow ($0.30\,\text{m} - 1.50\,\text{m}$): Cyan (`#00f0ff`)
     - Moderate ($1.50\,\text{m} - 5.00\,\text{m}$): Royal Blue (`#0066ff`)
     - Deep ($5.00\,\text{m} - 15.00\,\text{m}$): Dark Indigo (`#1a0066`)
     - Catastrophic ($> 15.00\,\text{m}$): Deep Violet (`#4b0082`)
   - **Function**: Quantifies hydrodynamic physical hazard severity.

3. **ARRIVAL TIME (Hazard Isochrones)**:
   - **Formulation**: Temporal wavefront arrival contours ($T+00$ to $T+120$).
   - **Color Scale**: Red ($< 30\,\text{min}$) $\rightarrow$ Yellow ($30 - 60\,\text{min}$) $\rightarrow$ Cyan/Blue ($> 90\,\text{min}$).
   - **Function**: Exposes spatial flood propagation velocity down the Bhagirathi corridor.

---

## 3. Temporal State Progression & Inundation Envelope

| Simulation Timestamp | Hydrodynamic State | Inundation Front Position | Limiting Segment `R02-E07` Status |
| :--- | :--- | :--- | :--- |
| **$T+00:00$** | Equilibrium Baseline | Dry downstream canyon | **OPEN** ($h = 0.0\,\text{m}$) |
| **$T+15:00$** | Upper Gorge Inundation | Passing Tehri Old Town | **OPEN** ($h = 0.0\,\text{m}$) |
| **$T+30:00$** | Mid-Valley Propagation | Approaching Koteshwar | **OPEN** ($h = 0.0\,\text{m}$) |
| **$T+45:00$** | Critical Advance | Wavefront reaches corridor | **OPEN** ($h = 0.12\,\text{m} < 0.30\,\text{m}$) |
| **$T+60:00$** | Bottleneck Breach | Inundating Riverbank reach | **IMPASSABLE** ($h \ge 0.30\,\text{m}$, $A=3600\,\text{s}$) |
| **$T+90:00$** | Peak Inundation | Expands across valley floor | **INUNDATED** ($h = 4.2\,\text{m}$) |
| **$T+120:00$**| Full Domain Envelope | Maximum 2-hour extent | **INUNDATED** ($h = 3.8\,\text{m}$) |

---

## 4. Operational Invariant: Simulation Clock vs. EWE

- The **Hydraulic Simulation Clock** ($T+00 \dots T+120$) is an interactive playback timeline.
- Advancing the simulation clock **never alters the evacuation departure deadline** ($D = T+44:21$).
- $D$ is anchored to the defined scenario breach trigger, remaining immutable during playback.

---

## 5. Gate C Verdict

**GATE C STATUS: PASS**  
100% of hydraulic layers represent authentic HEC-RAS 2D temporal outputs clamped to 3D terrain with zero particle artifacts.
