**JALRAKSHAK — LIMITATIONS, SCOPE & RED-TEAM REPORT**
JalRakshak SIH'26 — Evidence Hub

# Critical limitations


| Area | Limitation | Impact | Safe wording |
| --- | --- | --- | --- |
| Terrain | GLO-30 is DSM. | Surface objects can affect elevations. | Say DSM; expose resolution/limitations. |
| Vertical datum | Not established in all records. | Potential systematic elevation issue. | Mark NOT_ESTABLISHED until verified. |
| Calibration | No established physical Tehri calibration. | Cannot claim calibrated model. | Use demonstration/scenario language. |
| Remote sensing | SAR confounders/event matching. | Not automatic ground truth. | Research-only discrepancy layer. |
| Travel | Static speed assumption. | No live traffic. | Configured assumption. |
| Road impact | Inundation ≠ structural failure. | Avoid structural-damage wording. | Road flood-impact/inundation. |
| SPH/Delft3D | Interfaces only unless runs evidenced. | Not full implementation. | Interface status. |
| Exposure/loss | No complete validated vulnerability chain. | Cannot claim accurate financial loss. | Framework only. |
| Generalization | Independent test worlds only. | Not universal rivers. | Scoped data-driven architecture. |
| Arbitrary HEC-RAS scenario generation | Not universal end-to-end. | Limits flexibility. | Prepared result ingestion. |
| Operational deployment | Prototype evidence is not certification. | Emergency use needs stronger validation. | Demo-ready research prototype. |


# Red-team questions

- What exact HEC-RAS artifact produced this map?
- Where is the checksum?
- How was arrival time calculated?
- Why is the road affected?
- What happens when an edge has no hydraulic value?
- What is the speed assumption?
- Can you create a brand-new arbitrary HEC-RAS scenario?
- Where is the SPH run?
- Where is the Delft3D run?
- What is the field-validation dataset?
- Does Sentinel-1 prove the model is correct?
- Why should an officer trust the departure deadline?
