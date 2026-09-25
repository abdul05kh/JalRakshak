# JalRakshak — Flood Arrival Time Computation Method
**Method Specification:** Threshold-Crossing Hydrodynamic Arrival Time  
**Governing Rule:** RULE 1 (NEVER FABRICATE) & RULE 5 (NO "99% ACCURATE")

---

## 1. Governing Arrival Time Equation

Arrival time $A(c)$ for a given 2D cell $c$ is defined as the earliest time $t$ at which the water depth exceeds an operational threshold $H_{\text{threshold}}$:

$$A(c) = \min \left\{ t \in [0, T_{\text{sim}}] \mid \text{Depth}(c, t) \ge H_{\text{threshold}} \right\}$$

Where:
- $\text{Depth}(c, t) = \max\left(0.0, \text{WSE}(c, t) - z_{\text{min}}(c)\right)$
- $\text{WSE}(c, t)$ is the Water Surface Elevation from HEC-RAS HDF5.
- $z_{\text{min}}(c)$ is the Cell Minimum Elevation.
- $H_{\text{threshold}}$ is the configured inundation depth threshold (default: $0.30\text{ m}$ for vehicular evacuation).

If $\text{Depth}(c, t) < H_{\text{threshold}}$ for all $t \in [0, T_{\text{sim}}]$, the cell is classified as **UNAFFECTED** ($A(c) = \infty$ / `null`).

---

## 2. Scientific Rules & Edge Case Handling

1. **Monotonicity with Respect to Threshold:**
   For any cell $c$, if $H_1 < H_2$, then $A(c, H_1) \le A(c, H_2)$. An increased flood depth requirement can never result in an earlier arrival time.
2. **Never Derive from Maximum Depth:**
   Peak water depth occurs long after initial flood wave arrival. Using peak time would create fatal delays in emergency evacuation planning. Arrival time strictly captures the leading hazard front.
3. **Discrete Time Step Interpolation:**
   Given computational output timesteps $t_k$ and $t_{k+1}$ where $d_k < H_{\text{threshold}} \le d_{k+1}$, linear time interpolation may be applied:
   $$A_{\text{interp}}(c) = t_k + (t_{k+1} - t_k) \cdot \frac{H_{\text{threshold}} - d_k}{d_{k+1} - d_k}$$
   In conservative mode, $A(c) = t_k$ (the lower bounding timestep) is used.
4. **Data Gaps:**
   If water surface elevation data is missing or corrupted at cell $c$, $A(c)$ returns `DATA_GAP`. It is never assumed to be zero.
