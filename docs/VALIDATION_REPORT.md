# JalRakshak — Scientific Validation Report
**Validation Level:** Level A (Software Verification) & Level B (Analytical Benchmark)  
**Status:** VALIDATION NOT ESTABLISHED for Empirical Field Datasets (Level C)

---

## 1. Multi-Level Validation Framework

```text
Level A: Software Verification & Mathematical Properties      --> PASSED (30+ automated tests)
Level B: Analytical Hydrodynamic Benchmark (Ritter 1892)      --> PASSED (Closed-form comparison)
Level C: Empirical Satellite SAR / Gauge Field Validation    --> NOT RUN (Validation not established)
```

---

## 2. Level A: Evacuation Window Engine Proofs
The core theorem $D_{\text{deadline}} = \min_i(A_i - T_i - B)$ is verified against 17 boundary edge cases:
- Exact departure at deadline ($D = D_{\text{deadline}} \implies \text{FEASIBLE}$, margin = 0 min)
- Departure $1\text{ s}$ prior ($D = D_{\text{deadline}} - 1\text{ s} \implies \text{FEASIBLE}$)
- Departure $1\text{ s}$ past ($D = D_{\text{deadline}} + 1\text{ s} \implies \text{INFEASIBLE}$)
- Monotonicity with respect to arrival time: $\frac{\partial D}{\partial A_i} \ge 0$
- Monotonicity with respect to travel time: $\frac{\partial D}{\partial T_i} \le 0$
- Monotonicity with respect to buffer: $\frac{\partial D}{\partial B} \le 0$

---

## 3. Level B: Ritter (1892) Dam-Break Benchmark
Testing against the closed-form 1D Ritter analytical dam break over a dry horizontal bed confirms shallow water shock-front propagation mathematics and mass conservation.

---

## 4. Level C: Empirical Validation Audit
- **Field Gauges:** No observed time-series stage records exist for this dam-break test scenario.
- **Sentinel-1 SAR:** No satellite SAR extent rasters are bundled; empirical IoU is truthfully reported as `NOT RUN / N/A`.
