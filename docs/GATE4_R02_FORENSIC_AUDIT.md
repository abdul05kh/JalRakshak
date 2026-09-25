# GATE 4 R02 ROAD SEGMENT FORENSIC AUDIT
## Physical Reconciliation of Downstream Canyon Depth ($31.70\text{ m}$) vs Dam Toe ($27.25\text{ m}$)

**Document ID:** `DOC-GATE4-R02-AUDIT-001`  
**Status:** COMPLETED & RECONCILED  
**Date:** 2026-09-24  
**Author:** Hydraulic Decision-Support Engineer & Scientific QA Lead  

---

## 1. Executive Summary

During the initial Gate 4 evaluation, R02 (Malidewal to Koteshwar secondary road) reported approximately $37.37\text{ m}$ peak depth, whereas the frozen Dam Toe monitoring station (Cell 6100) reported $27.25\text{ m}$. 

This audit demonstrates:
1. **Topographical Riverbed Gradient:** The Bhagirathi valley drops over $208.5\text{ m}$ vertically between the Tehri dam toe ($z = 814.0\text{ m}$) and the downstream reach approaching Koteshwar ($z = 605.5\text{ m}$).
2. **Canyon Convergence & Wave Accumulation:** Downstream hydraulic narrowing causes peak water surface elevation to reach $637.13\text{ m}$ over a $605.50\text{ m}$ bed elevation, yielding a true road-corridor depth of **$31.63\text{ m} - 31.70\text{ m}$**.
3. **Previous $37.37\text{ m}$ Explanation:** The earlier $37.37\text{ m}$ figure occurred because the un-densified $1,200\text{ m}$ buffer reached into a deep riverbed depression (Cell 2723, $z = 608.06\text{ m}$, $\text{WSE} = 645.31\text{ m}$) located $450\text{ m}$ off the road alignment.
4. With the hardened $150\text{ m}$ corridor buffer, the authoritative peak depth on R02 is **$31.70\text{ m}$**, occurring at $t = 4,800\text{ s}$ ($80\text{ min}$) with flood threshold arrival at $t = 3,600\text{ s}$ ($60\text{ min}$).

---

## 2. R02 Geometry & Cell Inspection

### 2.1 Road Segment Geometry
- **Identifier:** `R02`
- **Junction Nodes:** `N-MALIDEWAL` $\longrightarrow$ `N-KOTESHWAR`
- **Class:** `SECONDARY`
- **Length:** $7,365\text{ m}$ ($7.37\text{ km}$)
- **Configured Speed:** $35\text{ km/h}$
- **Calculated Traversal Time ($T_i$):** $12.65\text{ min}$ ($759.0\text{ s}$)
- **Coordinate Envelope (UTM 44N):** Easting $258,000 - 259,500\text{ m}$, Northing $3,353,500 - 3,363,500\text{ m}$.

### 2.2 Key Hydraulic Cells Coupled to R02 Corridor ($\le 150\text{ m}$)

| Cell ID | Centroid $(X, Y)$ (UTM 44N) | Dist to R02 | Terrain Bed $z_{\text{min}}$ | Max WSE | Max Depth | Time of Peak Depth | Arrival Time ($H=0.3\text{m}$) | Corridor Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **6100** (Dam Toe) | $(258000.0, 3363500.0)$ | $0.1\text{ m}$ | $814.00\text{ m}$ | $841.25\text{ m}$ | $27.25\text{ m}$ | $3,600\text{ s}$ ($60\text{ min}$) | $900\text{ s}$ ($15\text{ min}$) | Dam Toe Inflow Zone |
| **1844** | $(258700.0, 3354800.0)$ | $35.2\text{ m}$ | $605.50\text{ m}$ | $636.39\text{ m}$ | $30.89\text{ m}$ | $4,800\text{ s}$ ($80\text{ min}$) | $3,600\text{ s}$ ($60\text{ min}$) | R02 Road Corridor |
| **1894** (Peak Cell) | $(258800.0, 3354900.0)$ | $42.8\text{ m}$ | $605.50\text{ m}$ | $637.13\text{ m}$ | **$31.63\text{ m}$** | $4,800\text{ s}$ ($80\text{ min}$) | $3,600\text{ s}$ ($60\text{ min}$) | R02 Road Corridor |
| **1943** | $(258900.0, 3355000.0)$ | $112.5\text{ m}$ | $605.50\text{ m}$ | $637.20\text{ m}$ | **$31.70\text{ m}$** | $4,800\text{ s}$ ($80\text{ min}$) | $3,600\text{ s}$ ($60\text{ min}$) | R02 Corridor Flank |
| **1408** | $(259200.0, 3353900.0)$ | $88.1\text{ m}$ | $603.50\text{ m}$ | $632.97\text{ m}$ | $29.47\text{ m}$ | $5,100\text{ s}$ ($85\text{ min}$) | $3,600\text{ s}$ ($60\text{ min}$) | R02 Approach to Koteshwar |

---

## 3. Physical Causal Explanation

1. **Why does R02 flood at $t = 3,600\text{ s}$ ($60\text{ min}$)?**
   The dam breach wave initiates at $t=0$ and travels through the $15\text{ km}$ Bhagirathi canyon. It reaches the upstream dam toe at $15\text{ min}$ ($900\text{ s}$) and propagates down-valley at an average wave celerity of $\approx 2.5 - 3.0\text{ m/s}$, reaching the mid-valley R02 corridor cells ($7-9\text{ km}$ downstream) at $t = 3,600\text{ s}$ ($60\text{ min}$).

2. **Why is depth higher downstream than at the dam toe?**
   At the dam toe, water spreads over a wider upstream plain ($z=814\text{ m}$). As the wave travels downstream, the Bhagirathi riverbed plummets into a steep gorge ($z=605.5\text{ m}$). Canyon constriction forces the water stage up to $637.13\text{ m}$, generating $31.70\text{ m}$ of water depth.

3. **Conclusion:**
   The $31.70\text{ m}$ peak depth on R02 under `SCENARIO_CENTRAL` is physically and hydraulically consistent with the 2D finite-volume solution of HEC-RAS 7.0.1.
