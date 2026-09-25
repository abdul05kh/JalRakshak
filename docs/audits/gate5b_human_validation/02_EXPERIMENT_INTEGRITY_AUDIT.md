# 02 — Experiment Integrity Audit

**Project:** JalRakshak Emergency Decision-Support System  
**Audit Dimension:** Scientific & Methodological Fairness  
**Status:** PASS  

---

## 1. Experimental Invariants

The experiment is designed to evaluate whether JalRakshak's decision representations improve human speed, accuracy, and comprehension relative to raw hydraulic GIS outputs.

### Invariant Protections:
1. **No Artificial Handicap on Condition A:** Condition A presents a functional, high-resolution Leaflet map displaying raw 2D water depth, velocity contours, and point probe inspection tools.
2. **Zero Information Leakage:** Condition A receives no precomputed EWE departure deadlines, feasibility tags, or highlighted limiting segment indicators.
3. **Counterbalancing:** Participants are assigned counterbalanced condition orders ($A \rightarrow B$ or $B \rightarrow A$) to control for order and learning effects.
4. **Frozen Task Book:** All 7 participant tasks have immutable, pre-declared wording and unambiguous evaluation criteria.
