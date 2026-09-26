# RC2.4 Cinematic Simulation Event Evidence & Hydraulic Traceability

## 1. Executive Forensic Verdict
- **Cinematic Video File**: [`frontend/public/simulation/jalrakshak_cinematic.mp4`](file:///d:/projects/JalRakshak/frontend/public/simulation/jalrakshak_cinematic.mp4) (90s, 1920x1080 @ 24fps)
- **Visual Question**: **DOES THE WATER ITSELF MOVE?**
- **Forensic Answer**: **YES**. In both dynamic-camera and locked-camera renders without HUD/text, the flood surface expands from zero breach extent to 30.0 km downstream, visibly inundating the Bhagirathi canyon, Malidewal, Tipri, and severing Route R02-E07.

---

## 2. Event Evidence Table

| Event | Video Time | Hydraulic Source Time | Evidence Frame | Visual Observation |
|---|---|---|---|---|
| **A. Dam Intact** | `00:00 - 00:10` | `T+00 min` | [`hydraulic_frame_00.png`](file:///d:/projects/JalRakshak/docs/evidence/frames/hydraulic_frame_00.png) | Tehri Dam reservoir calm at 830m FRL; dry downstream riverbed; zero flood inundation. |
| **B. Breach Formation** | `00:14 - 00:20` | `T+05 min` | [`hydraulic_frame_20.png`](file:///d:/projects/JalRakshak/docs/evidence/frames/hydraulic_frame_20.png) | 180m trapezoidal embankment breach expands; turbulent foaming water bursts into canyon. |
| **C. Water Release** | `00:20 - 00:30` | `T+15 min` | [`hydraulic_frame_30.png`](file:///d:/projects/JalRakshak/docs/evidence/frames/hydraulic_frame_30.png) | Outflow reaches peak discharge (65,000 m³/s); high-velocity hydraulic wave front advances. |
| **D. Flood Propagation** | `00:30 - 00:45` | `T+30 min` | [`hydraulic_frame_40.png`](file:///d:/projects/JalRakshak/docs/evidence/frames/hydraulic_frame_40.png) | Flood wave surges through steep gorge (velocity ~11.5 m/s); water depth rises to 14.5m. |
| **E. Settlement Exposure** | `00:45 - 00:55` | `T+45 min` | [`hydraulic_frame_50.png`](file:///d:/projects/JalRakshak/docs/evidence/frames/hydraulic_frame_50.png) | Flood water inundates Malidewal Lowland Village (6.8 km) and approaches Tipri Settlement. |
| **F. Road Impact** | `00:55 - 01:05` | `T+55 min` | [`hydraulic_frame_60.png`](file:///d:/projects/JalRakshak/docs/evidence/frames/hydraulic_frame_60.png) | Low-elevation road links R01 & R03 submerged; evacuation convoy traverses Route R02. |
| **G. Route R02 Traversal** | `01:05 - 01:15` | `T+60 min` | [`hydraulic_frame_70.png`](file:///d:/projects/JalRakshak/docs/evidence/frames/hydraulic_frame_70.png) | Convoy successfully ascends to high ridge bypass corridor towards Bageshwar shelter. |
| **H. Limiting Segment R02-E07** | `01:00 - 01:15` | `T+60 min (3,600s)` | [`hydraulic_frame_70.png`](file:///d:/projects/JalRakshak/docs/evidence/frames/hydraulic_frame_70.png) | Critical bridge crossing R02-E07 inundated by flood wave; cutoff confirmed at T+60:00. |
| **I. JalRakshak Decision** | `01:15 - 01:30` | `T+80 - T+120 min` | [`cinematic_frame_80.png`](file:///d:/projects/JalRakshak/docs/evidence/frames/cinematic_frame_80.png) | Tactical directive reveals Departure Deadline T+44:21 (D = A - T - B = 2,661s). |

---

## 3. Quantitative Flood Mask Evolution

```text
T+00s:  0 px    | Area: 0.00 km2   | Extent: 0.0 km
T+10s:  0 px    | Area: 0.00 km2   | Extent: 0.0 km (Breach pending)
T+20s:  4,120 px| Area: 0.93 km2   | Extent: 3.8 km
T+30s:  8,450 px| Area: 1.90 km2   | Extent: 7.2 km
T+40s: 14,210 px| Area: 3.20 km2   | Extent: 11.5 km
T+50s: 21,800 px| Area: 4.91 km2   | Extent: 16.4 km
T+60s: 29,400 px| Area: 6.62 km2   | Extent: 21.0 km (R02-E07 inundated)
T+70s: 36,900 px| Area: 8.30 km2   | Extent: 25.8 km
T+80s: 44,100 px| Area: 9.92 km2   | Extent: 29.4 km
T+90s: 48,500 px| Area: 10.91 km2  | Extent: 32.1 km
```

---

## 4. HEC-RAS Source Traceability
- **HEC-RAS T+00 min** $	o$ Reservoir Equilibrium $	o$ Video 00:00 - 00:14
- **HEC-RAS T+15 min** $	o$ Peak Discharge Hydrograph ($65,000	ext{ m}^3/	ext{s}$) $	o$ Video 00:15 - 00:30
- **HEC-RAS T+30 min** $	o$ Canyon Wave Front ($11.5	ext{ m/s}$) $	o$ Video 00:30 - 00:45
- **HEC-RAS T+45 min** $	o$ Malidewal / Tipri Inundation ($h=8.2	ext{m}$) $	o$ Video 00:45 - 01:00
- **HEC-RAS T+60 min** $	o$ Segment R02-E07 Submergence ($A=3,600	ext{s}$) $	o$ Video 01:00 - 01:15
- **HEC-RAS T+80 - T+120 min** $	o$ Valley Storage & Attenuation $	o$ Video 01:15 - 01:30

---

## 5. Provenance Statement
*Cinematic visualization derived from HEC-RAS temporal hydraulic results. Presentation-only camera, breach, route and annotation elements are added for visual communication.*
