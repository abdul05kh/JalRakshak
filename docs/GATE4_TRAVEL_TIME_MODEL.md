# GATE 4 TRAVEL-TIME MODEL
## Mathematical and Engineering Specification for Road Network Traversal

**Document ID:** `DOC-GATE4-TRAVEL-TIME-001`  
**Status:** APPROVED  
**Date:** 2026-09-24  
**Author:** Backend Architect & Systems Engineer  

---

## 1. Classification & Scientific Integrity

```
+---------------------------------------------------------------------------------------------------+
|                               TRAVEL-TIME MODEL CLASSIFICATION                                    |
|                                                                                                   |
|  MODEL_STATUS         = ENGINEERING_ASSUMPTION (Static baseline speed by road hierarchy class)    |
|  ROAD_NETWORK_SCOPE   = DEMONSTRATION_DATASET (17 road segments, 11 junction nodes)               |
|  REAL_TIME_TRAFFIC    = UNAVAILABLE (No live sensor / probe vehicle telemetry integrated)         |
|  DYNAMIC_FLOOD_SPEED  = NOT_MODELED (Static speed subject to cutoff arrival constraints)         |
+---------------------------------------------------------------------------------------------------+
```

### Critical Operational Limitation:
Current travel time is based on configured road-speed assumptions and does not dynamically model speed reduction caused by progressive flood depth. Therefore, the Evacuation Window Engine (EWE) currently evaluates:
> **Route traversal under configured travel-time assumptions subject to flood-arrival constraints.**

The calculation is an **engineering assumption** based on standard mountain road design speeds in Uttarakhand. It is **never** presented as measured real-time traffic data or dynamic flood-induced vehicular hydrodynamics.

---

## 2. Fundamental Traversal Equation

For an individual directed road edge $e$:
$$T(e) = \frac{L(e)}{V_{\text{eff}}(e)}$$

Where:
- $L(e)$: Road segment centerline length in meters ($\text{m}$).
- $V_{\text{eff}}(e)$: Effective traversal speed in meters per second ($\text{m/s}$).
- $T(e)$: Edge travel time in seconds ($\text{s}$).

For an ordered route consisting of edges $e_1, e_2, \dots, e_n$:
$$T_i = \sum_{k=1}^i T(e_k)$$
Where $T_i$ is the cumulative travel time from the route origin to the completion of edge $e_i$.

---

## 3. Road Hierarchy Speed Table

In the absence of live telemetry, $V_{\text{eff}}(e)$ is determined by the road functional classification derived from OpenStreetMap / PWD datasets:

| Road Class | Nominal Speed ($\text{km/h}$) | Effective Speed ($\text{m/s}$) | Road Characteristics in Bhagirathi Valley |
| :--- | :--- | :--- | :--- |
| **`PRIMARY`** | $40 - 45\text{ km/h}$ | $11.11 - 12.50\text{ m/s}$ | Paved two-lane state highway (e.g., NH-34, Chamba-Rishikesh highway). |
| **`SECONDARY`** | $30 - 35\text{ km/h}$ | $8.33 - 9.72\text{ m/s}$ | Single-lane paved or reinforced mountain connecting road. |
| **`TERTIARY`** | $25\text{ km/h}$ | $6.94\text{ m/s}$ | Narrow paved rural access road with steep gradient. |
| **`LOCAL`** | $20\text{ km/h}$ | $5.56\text{ m/s}$ | Settlement lane / ghat approach. |
| **`URBAN`** | $25\text{ km/h}$ | $6.94\text{ m/s}$ | Urban township street (e.g., Muni Ki Reti / Rishikesh). |

---

## 4. Road Network Scope

The current demonstration transport network consists of **17 road segments and 11 junction nodes** covering the Tehri to Rishikesh Bhagirathi corridor. This is documented as:
$$\text{ROAD\_NETWORK\_SCOPE} = \text{DEMONSTRATION\_DATASET}$$
It is not claimed to be the exhaustive, all-inclusive road network of Uttarakhand.

---

## 5. Missing Speed & Data Gap Behavior

- If an edge lacks a documented `speed_kmh` and its `road_class` is unrecognized:
  - The engine flags the edge as `DATA_GAP`.
  - The route traversing this edge cannot be marked `FEASIBLE`.
  - The system does **not** silently substitute zero or infinity.
