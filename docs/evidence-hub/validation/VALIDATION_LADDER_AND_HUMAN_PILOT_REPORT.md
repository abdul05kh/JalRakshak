**JALRAKSHAK — VALIDATION LADDER & HUMAN PILOT REPORT**
JalRakshak SIH'26 — Evidence Hub

# Five-level validation ladder


| Level | Question | Status | Evidence |
| --- | --- | --- | --- |
| 1. Software/numerical reproducibility | Does software behave as specified? | PASS | Latest hardening record: 210 backend tests passed, 1 skipped; frontend production build clean. |
| 2. Hydraulic output & mesh consistency | Are outputs internally consistent with configured mesh? | PASS — scoped | Native HEC-RAS evidence and coupling/volume checks. |
| 3. Independent scenario-world testing | Does scenario architecture isolate data? | PASS — scoped | TEST_WORLD_ALPHA / TEST_WORLD_BETA. |
| 4. Observational remote sensing | Can model be compared with compatible observations? | PARTIAL / RESEARCH | Sentinel-1/GEE workflow. |
| 5. Physical field validation | Does Tehri match trusted physical observations? | NOT_ESTABLISHED | No defensible Tehri field benchmark established. |


# Gate 5B pilot


| Metric | Pilot result | Interpretation |
| --- | --- | --- |
| N | 2 | Exploratory only |
| Decision accuracy | 100% (7/7 each) | Descriptive under protocol |
| Raw hydraulic mean | 53.4 s vs 12.7 s | 76.2% reduction in tested sample |
| Deadline extraction | 72.5 s vs 10.4 s | 85.7% reduction |
| Limiting segment | 54.0 s vs 11.2 s | 79.3% reduction |
| FEASIBLE=SAFE interpretation | 0/7 each | Observed in pilot |
| Researcher rescue | 0/7 each | Observed in pilot |


# Interpretation

N=2 cannot establish generalizable usability or operational readiness. The result is exploratory evidence that the decision-first interface reduced extraction time in the tested protocol.

## Human Pilot Study Summary (Gate 5B)
- **Sample Size:** $N = 2$ (Exploratory evaluation, not a generalized population trial).
- **Decision Accuracy:** 100% (7/7 correct decisions per participant).
- **Mean Time to Identify Feasibility:** Reduced from $53.4\,\text{s}$ (raw hydraulic view) to $12.7\,\text{s}$ (decision support view).
- **Mean Time to Extract Deadline:** Reduced from $72.5\,\text{s}$ to $10.4\,\text{s}$.
- **Mean Time to Identify Limiting Segment:** Reduced from $54.0\,\text{s}$ to $11.2\,\text{s}$.
- **Dangerous 'FEASIBLE = SAFE' Interpretations:** 0/7 per participant.
- **Researcher Interventions Required:** 0.
