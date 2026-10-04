**JALRAKSHAK — GEE / SENTINEL-1 DATA CARD & RESEARCH REPORT**
JalRakshak SIH'26 — Evidence Hub

# Purpose

GEE/Sentinel-1 is a complementary observation layer. It can support discrepancy analysis around modeled events; it is not automatically ground truth.

# Current research record


| Item | Record |
| --- | --- |
| Collection | COPERNICUS/S1_GRD |
| Indexed scenes | 969 for the configured AOI/query in the documented audit |
| Orbit examples | 63 descending; 129 ascending |
| Controlled example | 2024-07-25 00:44 to 2024-08-06 00:44, Orbit 63 descending |
| Processing direction | Multi-temporal SAR change detection with acquisition/orbit comparability checks |
| Additional screening | JRC historical water occurrence, slope and proximity screening |


# Why it is research-only

- SAR backscatter changes have water and non-water causes.
- Urban double-bounce and acquisition geometry can complicate interpretation.
- Historical water occurrence is not contemporaneous ground truth.
- Observed and simulated extents must be compatible before metrics are computed.
- IoU, precision, recall and F1 are comparison metrics, not proof of physical validity.
- Live automated acquisition/processing remains configuration dependent.

# Safe claim

JalRakshak includes a research-oriented Sentinel-1 comparison workflow for observational discrepancy analysis when compatible simulated and observed extents are available.

# Forbidden claim

“Sentinel-1 validates the Tehri hydraulic model” is not supported by the current evidence.

## Research Scope Notice
Sentinel-1 C-band SAR backscatter depressions serve as candidate water masks for historical observation comparisons (e.g., July 2024 Balganga flash flood). They do NOT represent physical validation of hypothetical Tehri Dam breach simulations.
