# ROAD NETWORK & COUPLING VALIDATION (GATES D & E)
**Project**: JalRakshak Emergency Evacuation Decision-Support System  
**Document**: Gates D & E — Source-Derived Road Network & 150m Hydraulic Coupling  
**Date**: September 25, 2026  
**Status**: COMPLETE / ACCEPTED (GATES D & E PASS)  

---

## 1. Executive Summary

Roadway visualization in JalRakshak renders the authoritative source-derived transportation vectors clamped directly to the Copernicus GLO-30 3D terrain surface.

Road impact is determined through a validated $150\text{m}$ spatial coupling envelope with $\le 50\text{m}$ geodesic point densification. Structural pavement/bridge collapse is **not modeled**; roads are classified strictly as `OPEN`, `AFFECTED`, `INUNDATED`, or `LIMITING` based on hydraulic water depth.

---

## 2. Road Network Hierarchy & Visual Encodings

| Network Element | Visual Encoding | Source Lineage | Function & Hierarchy |
| :--- | :--- | :--- | :--- |
| **All Background Roads** | Subdued Dark Charcoal (`rgba(100, 116, 139, 0.4)`) | OpenStreetMap / PWD vectors | Regional geographic context without cluttering operational focus. |
| **Active Route (R02)** | Glowing High-Contrast Emerald Green (`#22c55e`, width 4px) | Evaluated Dijkstra Route Graph | Primary recommended evacuation path from Malidewal to Chamba. |
| **Limiting Segment (`R02-E07`)** | High-Visibility Amber/Crimson (`#f59e0b`, width 6px) | $\arg\min_i (A_i - T_i - B)$ | Critical bottleneck segment determining route closure window. |
| **Alternative Routes (R01, R03)**| Muted Indigo / Slate (`rgba(148, 163, 184, 0.6)`) | Route Graph alternatives | Secondary evacuation options for comparative analysis. |

---

## 3. Spatial Hydraulic Coupling Methodology (150m Envelope)

1. **Geodesic Densification**: Road LineStrings are subdivided into discrete evaluation nodes at intervals $\Delta s \le 50\,\text{m}$.
2. **Coupling Search**: For each road node $p_j$, the nearest 2D hydraulic mesh cell within $r \le 150\,\text{m}$ is queried.
3. **Elevation Gating**: Mesh cells separated by steep valley ridges ($|\Delta z| > 30\,\text{m}$) are excluded to prevent cross-ridge flood bleeding.
4. **Impassability Inundation**: A segment is flagged as impassable when coupled water depth $h \ge 0.30\,\text{m}$.

---

## 4. Bottleneck Segment `R02-E07` Traceability

- **Segment ID**: `R02-E07` (Koteshwar Riverbank Reach).
- **Coordinates**: $(78.5020^\circ\text{E}, 30.2825^\circ\text{N})$ to $(78.5080^\circ\text{E}, 30.2880^\circ\text{N})$.
- **Elevation**: $982.4\,\text{m}$ aMSL (Valley floor riverbank road).
- **CENTRAL Flood Arrival ($A_{\text{R02-E07}}$)**: $3600\,\text{s}$ ($T+60:00$).
- **Cumulative Travel Time ($T_{\text{R02-E07}}$)**: $759\,\text{s}$ ($12:39$).
- **Safety Buffer ($B$)**: $180\,\text{s}$ ($03:00$).
- **Departure Deadline**: $D = 3600 - 759 - 180 = 2661\,\text{s}$ (**$T+44:21$**).

---

## 5. Gates D & E Verdict

**GATES D & E STATUS: PASS**  
Road vectors conform precisely to 3D terrain geometry, and road impact derivation is 100% mathematically traceable to the 150m spatial coupling pipeline.
