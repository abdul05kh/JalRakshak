# RC2 Road Interaction & Telemetry Architecture
## JalRakshak Emergency Decision-Support System

### 1. Road Network Segmentation & Invariants
In JalRakshak, roads are not passive map lines; they are physical evacuation corridors coupled to the hydrodynamic flood wave.

#### Route R02 (Chamba via Koteshwar — Primary Evacuation Route)
- Origin: Malidewal Departure Point (`VILL-02`, $78.4842^\circ\text{E}, 30.3812^\circ\text{N}, 648\text{m}$)
- Destination: Koteshwar Terminal (`VILL-01`, $78.5031^\circ\text{E}, 30.2872^\circ\text{N}, 582\text{m}$)
- Total Length: $10.53\text{ km}$
- Route Segment Breakdown:
  1. `R02-E01`: Malidewal Upper Exit ($1.42\text{ km}$, safe ridge)
  2. `R02-E02`: Bhagirathi River Gorge Bypass ($1.85\text{ km}$)
  3. `R02-E03`: Chham Link Road ($1.21\text{ km}$)
  4. `R02-E04`: Tehri Downstream Embankment Road ($1.64\text{ km}$)
  5. `R02-E05`: Koteshwar North Approach ($1.38\text{ km}$)
  6. `R02-E06`: Hydro-tunnel Overpass ($1.49\text{ km}$)
  7. `R02-E07`: **Koteshwar Riverbank Limiting Segment** ($1.54\text{ km}$) — **LIMITING EDGE**

---

### 2. Deterministic Road Telemetry Formulation
For any road segment $i$:
$$D_i = A_i - T_i - B$$
Where:
- $A_i$: Hydrodynamic flood arrival time (HEC-RAS $h \ge 0.3\text{m}$ or $v \ge 1.0\text{ m/s}$). For `R02-E07`, $A = T+60:00$ (1.00h).
- $T_i$: Cumulative travel time from origin to segment entry ($T = 12:39$ / 0.21h).
- $B$: Safety buffer ($B = 03:00$ / 0.05h).
- $D_i$: Latest feasible departure time. For `R02-E07`, $D = T+44:21$ (0.74h).

The limiting edge is defined deterministically as:
$$D_{\text{deadline}} = \min_i(D_i) = D_{\text{R02-E07}} = T+44:21$$

---

### 3. Interactive 3D Road Picking & Styling
- **Hit-Testing**: `view.on("click")` executes `view.hitTest(event)` against the `ArcGISRoadLayer`.
- **Telemetry Drawer**: Clicking any road segment highlights it in bright cyan/amber and populates the bottom-right Road Telemetry Drawer with:
  - Edge ID (`R02-E07`)
  - Segment Length ($1.54\text{ km}$)
  - Cumulative Travel Time ($12:39$)
  - Flood Arrival Time ($T+60:00$)
  - Available Evacuation Margin ($+44:21$)
  - Limiting Classification: `LIMITING BOTTLENECK`
- **Focus Limiting Camera Action**: Clicking "FOCUS LIMITING (R02-E07)" animates the ArcGIS camera to position:
  - Lon: $78.4985^\circ\text{E}$, Lat: $30.2920^\circ\text{N}$, Altitude: $1,400\text{m}$, Heading: $340^\circ$, Pitch: $62^\circ$.
