# Final Reviewer Attack Test & Defense Package

**Target Audience:** Technical Jury & NTRO / MIC Evaluators  
**Project:** JalRakshak (SIH26161)  
**Document Purpose:** Direct, evidence-based answers to critical engineering, scientific, and operational questions.

---

### Q1: "What does JalRakshak provide that HEC-RAS itself does not provide?"
**Answer:** HEC-RAS solves unsteady shallow water equations to compute massive grids of depths, velocities, and water levels over time. It does **not** perform road network coupling, traversal time calculations, safety buffer accounting, or latest-departure deadline minimization. JalRakshak takes raw HEC-RAS 2D HDF5 outputs and transforms them into an actionable operational answer for emergency officers: **WHERE** the flood will go, **WHEN** it cuts off each corridor, the **LATEST FEASIBLE DEPARTURE TIME**, and the **GOVERNING LIMITING ROAD SEGMENT**.  
*Evidence:* [`backend/app/domain/decision.py`](../backend/app/domain/decision.py), [`backend/app/domain/road_hydraulic_mapper.py`](../backend/app/domain/road_hydraulic_mapper.py).

---

### Q2: "Where does your latest departure time come from?"
**Answer:** It is derived from the deterministic Evacuation Window Engine formula:
$$D_{\text{deadline}} = \min_{i=1}^n \left( A_i - T_i - B \right)$$
where $A_i$ is the earliest arrival time of floodwater ($h \ge 0.30\,\text{m}$ or $v \ge 1.0\,\text{m/s}$) at segment $e_i$, $T_i$ is the cumulative travel time from origin to segment $e_i$, and $B$ is the configured safety buffer (default: $3\,\text{min}$).  
*Evidence:* [`backend/app/domain/ewe_engine.py`](../backend/app/domain/ewe_engine.py).

---

### Q3: "Can I trace this decision back to a real hydraulic artifact?"
**Answer:** Yes. Every decision is cryptographically bound to its source HEC-RAS plan file via real-time physical SHA-256 disk hashing (`tehri_15km_scenario_central.p01.hdf`). The provenance record displays the exact HDF5 plan file, grid resolution ($50\text{--}100\,\text{m}$), and timestamp.  
*Evidence:* [`backend/app/domain/provenance.py`](../backend/app/domain/provenance.py), `GET /api/v1/scenarios/{id}/verify-provenance`.

---

### Q4: "What happens if the route changes?"
**Answer:** The decision engine dynamically recalculates the sequence of road segments $e_1, \dots, e_n$, extracts their corresponding coupled flood arrival times $A_i$, and recomputes the new limiting segment and departure deadline. If no road path exists between the chosen origin and shelter, the system outputs `NO_FEASIBLE_ROUTE` / `INFEASIBLE`.  
*Evidence:* [`backend/tests/test_ewe_properties.py`](../backend/tests/test_ewe_properties.py) (Property 8 & Golden Case D).

---

### Q5: "What happens if the flood arrives later?"
**Answer:** If flood arrival $A_i$ increases on any segment, the deadline $D_{\text{deadline}}$ monotonically increases or remains unchanged. It mathematically cannot become earlier.  
*Evidence:* Verified in `test_property_1_flood_arrival_monotonicity`.

---

### Q6: "What happens if travel time increases?"
**Answer:** If traversal time $T_i$ increases (e.g. lower vehicle speed or longer detour), the departure deadline monotonically decreases. It mathematically cannot become later.  
*Evidence:* Verified in `test_property_2_travel_time_monotonicity`.

---

### Q7: "Can this run on another river?"
**Answer:** Yes. The backend and frontend are entirely data-driven. Hydraulic grids, road geometries, and evacuation origins are ingested through standard schemas without hardcoded coordinates or city names.  
*Evidence:* [`backend/tests/test_scenario_generalization_blackbox.py`](../backend/tests/test_scenario_generalization_blackbox.py).

---

### Q8: "Show me evidence that it isn't hardcoded to Tehri."
**Answer:** In automated CI testing, the decision engine runs on two structurally independent synthetic test worlds (`TEST_WORLD_ALPHA` and `TEST_WORLD_BETA`) featuring completely different river geometries, road networks, and arrival patterns, yielding correct data-driven limiting segments with zero Tehri references.  
*Evidence:* [`backend/tests/test_scenario_generalization_blackbox.py`](../backend/tests/test_scenario_generalization_blackbox.py).

---

### Q9: "Have you physically validated this model?"
**Answer:** **No, physical validation is NOT ESTABLISHED.** Tehri Dam has never suffered a catastrophic breach failure in recorded history. Therefore, no physical field survey records or high-water breach hydrographs exist to calibrate the breach outflow. The simulation represents a forward numerical simulation from USACE HEC-RAS 2D.  
*Evidence:* Level 5 of the Scientific Validation Ladder ([`backend/app/domain/validation_ladder.py`](../backend/app/domain/validation_ladder.py)).

---

### Q10: "What exactly does Sentinel-1 validate?"
**Answer:** Sentinel-1 Synthetic Aperture Radar (SAR) provides **observational monitoring of surface water backscatter change**, not uncalibrated ground truth for numerical hydrodynamic validation. Spatial metrics (IoU, precision, recall, $F_1$) quantify geometric agreement when compatible contemporaneous events are supplied.  
*Evidence:* [`backend/app/integrations/gee/comparison.py`](../backend/app/integrations/gee/comparison.py).

---

### Q11: "Did you actually run Delft3D or SPH?"
**Answer:** In the current demonstration environment, Delft3D FM and DualSPHysics SPH are structured as **standardized adapter interfaces** (`HydraulicModelAdapter`). Where proprietary commercial binaries are not installed on the host machine, the system marks them as `NOT_CONFIGURED` rather than procedurally fabricating fake outputs.  
*Evidence:* [`backend/app/domain/hydraulic_adapters/`](../backend/app/domain/hydraulic_adapters/).

---

### Q12: "Are your roads structurally failing?"
**Answer:** No. JalRakshak evaluates **hydraulic inundation cut-off** ($h \ge 0.30\,\text{m}$ or $v \ge 1.0\,\text{m/s}$ exceeding safe vehicular traversal limits), not geotechnical slope collapse or bridge structural failure.  
*Evidence:* [`backend/app/domain/gis.py`](../backend/app/domain/gis.py).

---

### Q13: "Does FEASIBLE mean SAFE?"
**Answer:** **No.** `FEASIBLE` strictly means that the calculated evacuation margin is positive under declared model assumptions ($50\,\text{km/h}$ static speed, $3\,\text{min}$ buffer). It does not guarantee physical safety against unmodelled dynamic traffic congestion, vehicle breakdowns, or landslides.  
*Evidence:* Model limitation disclaimers in UI and documentation.

---

### Q14: "What assumptions does the evacuation decision depend on?"
**Answer:**
1. Vehicle travel speed is static at $50\,\text{km/h}$ ($13.89\,\text{m/s}$).
2. Safety clearance buffer is configured at $3.0\,\text{min}$ ($180\,\text{s}$).
3. Critical water depth is $0.30\,\text{m}$ (passenger car stability threshold).
4. Road-hydraulic coupling uses a $150\,\text{m}$ perpendicular corridor with $50\,\text{m}$ segment densification.  
*Evidence:* UI Decision Console Assumptions Panel.

---

### Q15: "Can I reproduce the decision?"
**Answer:** Yes. The entire numerical pipeline is 100% deterministic and verified across 193 automated test suites. Identical scenario inputs produce bit-for-bit identical departure deadlines, margins, and limiting segment IDs.  
*Evidence:* `test_property_9_determinism` in [`backend/tests/test_ewe_properties.py`](../backend/tests/test_ewe_properties.py).
