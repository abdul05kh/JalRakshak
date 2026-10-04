**JALRAKSHAK — EVIDENCE CLASSIFICATION & CLAIM RULES**
JalRakshak SIH'26 — Evidence Hub

# Classification vocabulary


| Class | Meaning | Rule |
| --- | --- | --- |
| SOURCE-DERIVED | Taken from an external documented source. | Cite source and version/date. |
| DERIVED | Computed deterministically from source data. | Record inputs and method. |
| CONFIGURED | Project-controlled setting. | Do not present as measured reality. |
| ENGINEERING ASSUMPTION | Required but not established by authoritative evidence. | Label explicitly. |
| MODEL DEFAULT | Software/solver default. | Do not call observed reality. |
| TEST_FIXTURE | Synthetic data for software tests. | Never use as physical evidence. |
| SYNTHETIC | Artificial demonstration data. | Never present as field evidence. |
| RESEARCH-ONLY | Exploratory evidence with limitations. | Not operational validation. |
| NOT_ESTABLISHED | Evidence insufficient for claim. | Do not imply validation. |
| DISPLAYED | Visualization of another artifact. | Not independent evidence. |


# Parameter governance

Every consequential parameter should carry source, document/dataset, section/page where applicable, value, unit, date/release, classification and role/confidence.

# Prohibited upgrades

- SOFTWARE-VERIFIED → PHYSICALLY VALIDATED: prohibited.
- RESEARCH-ONLY SAR comparison → GROUND TRUTH: prohibited.
- Solver interface → FULL SOLVER IMPLEMENTATION: prohibited.
- Exposure framework → VALIDATED FINANCIAL DAMAGE PREDICTION: prohibited.
- Static 50 km/h → LIVE TRAFFIC: prohibited.
- Native HEC-RAS execution → UNIVERSAL ARBITRARY SCENARIO GENERATION: prohibited.
- Checksum integrity → hydraulic correctness: prohibited.
