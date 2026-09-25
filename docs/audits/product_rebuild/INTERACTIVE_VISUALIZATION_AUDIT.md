# JALRAKSHAK — INTERACTIVE VISUALIZATION & DATA REALITY AUDIT
**Audit Date**: 2026-09-25  
**Audit Purpose**: Identify decorative vs. genuinely functional elements before interactive hardening.  

---

## 1. Inventory of UI Elements & Functionality Status

| Component / Feature | Current State | Classification | Planned Hardening Action |
| :--- | :--- | :--- | :--- |
| **Operational Default Scenario** | `SCENARIO_CENTRAL` ($Q_p = 65,000\text{ m}^3/\text{s}$) | `GENUINE` | Ensure zero legacy `28,400 m³/s` demo contamination in operational mode. |
| **3D Camera Presets Toolbar** | Preset buttons existed in UI state but lacked automated coordinate binding in `MapView.tsx` | `PARTIALLY FUNCTIONAL` | Add explicit camera coordinate registry (`center, zoom, pitch, bearing`) with `map.flyTo()` and popup highlighting. |
| **Hydraulic Thematic Mode Switcher** | Extent / Depth / Arrival buttons changed state but had limited layer paint property mutation | `PARTIALLY FUNCTIONAL` | Wire dynamic MapLibre GL paint property mutations for Depth (multi-band ramp) and Arrival (isochrones). |
| **Simulation Timeline Scrubbing** | $T+00 \dots T+120$ with play/pause and step | `GENUINE` | Connect timeline scrubbing to dynamic flood polygon opacity, extent scaling, and affected edge highlights. |
| **Flood Simulation View** | 7-scene narrative presentation was largely text-focused | `PARTIALLY FUNCTIONAL` | Embed live interactive 3D map canvas directly inside the simulation view to visually demonstrate the causal chain. |
| **Road Impact Edge Table ↔ Map Link** | Edge table had rows `R02-E01` to `R02-E07` but lacked bidirectional map fly-to | `PARTIALLY FUNCTIONAL` | Implement bidirectional click: table row click flies map to edge; map edge click highlights table row. |
| **Limiting Segment Highlighting** | `R02-E07` identified in table and decision card | `GENUINE` | Add pulsating bounding marker, endpoint pins, and arrival callout flag on the 3D map. |
| **Decision Arithmetic Triad** | $D = A_i - T_i - B$ ($60:00 - 12:39 - 03:00 = 44:21$) | `GENUINE` | Dynamically bound to authoritative backend API response across all scenarios. |
| **Scientific Claims & Terminology** | "Copernicus GLO-30 DSM", "Model assumption", "Artifact integrity" | `GENUINE` | Ensure zero unsupported claims ("zero numerical dispersion", "bare-earth DEM", "PWD road ownership"). |

---

## 2. Camera Registry & Coordinates

```typescript
export const CAMERA_PRESETS = {
  OVERVIEW: { center: [78.455, 30.330], zoom: 12.0, pitch: 58, bearing: 32, label: "Valley Overview" },
  DAM: { center: [78.480, 30.378], zoom: 14.5, pitch: 60, bearing: 18, label: "Tehri Dam Crest" },
  BREACH: { center: [78.480, 30.375], zoom: 15.5, pitch: 65, bearing: 45, label: "Breach Invert (635m Model Assumption)" },
  LIMITING: { center: [78.502, 30.2825], zoom: 14.8, pitch: 62, bearing: 50, label: "Limiting Edge (R02-E07)" },
  SHELTER: { center: [78.3965, 30.3475], zoom: 15.0, pitch: 55, bearing: -20, label: "Chamba Shelter (High Ground)" }
};
```

---

## 3. Data Integrity & Scenario Mapping Lock

- **`SCENARIO_CENTRAL`**: $Q_p = 65,000\text{ m}^3/\text{s}$ $\to$ Arrival $T+60:00$, Travel $12:39$, Buffer $03:00$, Deadline **`T+44:21`**.
- **`SCENARIO_MINIMUM`**: $Q_p = 28,500\text{ m}^3/\text{s}$ $\to$ Arrival $T+95:00$, Travel $12:39$, Buffer $03:00$, Deadline **`T+79:21`**.
- **`SCENARIO_MAXIMUM`**: $Q_p = 115,000\text{ m}^3/\text{s}$ $\to$ Arrival $T+45:00$, Travel $12:39$, Buffer $03:00$, Deadline **`T+29:21`**.
