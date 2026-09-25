# JALRAKSHAK — TRAVEL TIME ASSUMPTIONS AUDIT
**Pre-Human Audit Kinematic Assumption Transparency**
**Status:** COMPLETED — ASSUMPTION EXPLICITLY BOUNDED

---

## 1. Scope of Travel Time Model

In the current JalRakshak system (Gate 4 / Gate 5 / Gate 5B), route traversal time is calculated using a **piecewise constant kinematic velocity model**:
$$T_{\text{travel}} = \sum_{k=1}^N \frac{L_k}{v_k}$$
where $L_k$ is the road segment length (meters) and $v_k$ is the configured design traversal speed (e.g. $50\text{ km/h} \approx 13.89\text{ m/s}$).

---

## 2. Audit Findings & Non-Claims

| Assumed Feature | Current System Reality | Explicit Non-Claim & Limitation Disclosure |
| :--- | :--- | :--- |
| **Dynamic Traffic Congestion** | **Not modeled.** Traversal speed does not degrade due to vehicle queueing or panic evacuation density. | The system explicitly notes that travel time assumes free-flow transit at configured design speed ($50\text{ km/h}$). |
| **Hydrodynamic Speed Degradation** | **Not modeled.** Vehicles do not slow down when shallow water ($<0.30\text{ m}$) is on the roadway. | Traversal assumes full speed until depth reaches $0.30\text{ m}$ (where status abruptly transitions to `INFEASIBLE`). |
| **Geotechnical / Landslide Blocking** | **Not modeled.** Terrain slope failures or fallen debris are not integrated. | The model covers purely 2D hydrodynamic surface inundation. |
| **Live Vehicle Telemetry (GPS)** | **Not modeled.** Vehicle position is estimated parametrically from departure timestamp. | No real-time GPS tracking or connected-vehicle hardware is claimed. |

---

## 3. Disclosures in Participant Task Materials

All participant task descriptions state the following exact operational premise:
> *"Assume standard evacuation vehicle convoy travelling at a constant nominal speed of 50 km/h (13.89 m/s) with a mandatory 3.0-minute operational margin."*

---

## 4. Verdict
- **Assumption Transparency:** ✅ **100% DISCLOSED**
- **Zero Fabrication:** Kinematic limits are honestly bounded without false claims of dynamic traffic simulation.
