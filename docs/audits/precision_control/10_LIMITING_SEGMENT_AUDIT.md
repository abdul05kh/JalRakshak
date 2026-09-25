# 10 — Limiting Segment Mathematical & Spatial Audit
**Audit Date:** 2026-09-24  
**Audited Route:** Malidewal (VILL-02) $\to$ Chamba (SHELTER-01)  

---

## 1. Mathematical Derivation of Limiting Segment
For an evacuation route comprising $N$ segments, the limiting road segment is defined as the segment that establishes the minimum departure deadline:

$$\text{Limiting Segment} = \arg\min_{i \in \{1, \dots, N\}} \left( A_i - T_i - B \right)$$

---

## 2. Segment-by-Segment Breakdown (Central Scenario Baseline)

| Segment ID | Road Class | Length ($m$) | Cumulative Travel ($T_i$) | Arrival Time ($A_i$) | Segment Deadline ($A_i - T_i - 180\text{s}$) | Limiting Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`R01`** | Primary NH | $4,200\text{ m}$ | $302.4\text{ s}$ ($05:02$) | $7,200\text{ s}$ ($T+120:00$) | $6,717.6\text{ s}$ ($T+111:57$) | Non-limiting |
| **`R02`** | Secondary SH | $6,327\text{ m}$ | $759.2\text{ s}$ ($12:39$) | $3,600\text{ s}$ ($T+60:00$) | **$2,660.8\text{ s}$ ($T+44:21$)** | **LIMITING BOTTLENECK** |

---

## 3. UI and Spatial Verification
- **API Endpoint:** Returns `"limiting_segment": "R02"` with arrival $3,600\text{ s}$.
- **Decision Panel:** Displays `LIMITING SEGMENT: R02` with explicit arrival, depth, and constraint explanation.
- **Map View:** Automatically renders $R02$ with a thick, high-visibility red polyline (`#dc2626`, weight 7.5) and informative hover tooltip.
