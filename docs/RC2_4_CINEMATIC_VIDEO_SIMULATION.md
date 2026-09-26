# JalRakshak RC2.4 — Cinematic Video Simulation Specification

## 1. Executive Summary
JalRakshak RC2.4 introduces a dedicated, high-performance **Cinematic Video Simulation** (`frontend/public/simulation/jalrakshak_cinematic.mp4`), generated directly from authentic USACE HEC-RAS 7.0.1 2D unsteady flow results, Copernicus GLO-30 DSM terrain elevation, and the backend Evacuation Window Engine (EWE).

---

## 2. Technical Pipeline & Architecture

```text
               HEC-RAS 7.0.1 HDF5 Artifact
                         │
                         ▼
        Hydraulic Scenario Data Extractor
        (6677 cells, 25 timesteps, depths, arrival)
                         │
                         ▼
          Offline Video Rendering Engine
       (scripts/render_cinematic_simulation.py)
                         │
                         ▼
        Full HD MP4 Video Asset (24fps, 90s)
   (frontend/public/simulation/jalrakshak_cinematic.mp4)
                         │
                         ▼
             HTML5 <video> Hero Player
                         │
       ┌─────────────────┼─────────────────┐
       ▼                 ▼                 ▼
Custom Playback HUD   Scrubbing & Speed  Decision Climax
(SimulationHUD.tsx)     (0.5x to 4x)    (DecisionReveal.tsx)
```

---

## 3. Narrative Phases & Timeline Sequence

| Phase | Time (sec) | Title | Hydraulic Time | Core Visual & Operational Event |
|---|---|---|---|---|
| **Phase 1** | 00:00 – 00:10 | Tehri Dam Reservoir | $T+00\text{ min}$ | Reservoir at $830\text{m}$ FRL; dry canyon downstream. |
| **Phase 2** | 00:10 – 00:22 | Breach Initiation | $T+10\text{ min}$ | Embankment piping at $635\text{m}$ invert ($Q_p = 65,000\text{ m}^3\text{/s}$). |
| **Phase 3** | 00:22 – 00:40 | Wavefront Surge | $T+20\text{ min}$ | High-velocity torrent surges through Himalayan gorge ($d > 20\text{m}$). |
| **Phase 4** | 00:40 – 00:58 | Settlement Exposure | $T+35\text{ min}$ | Wetting front reaches Malidewal and Tipri riparian terraces. |
| **Phase 5** | 00:58 – 00:72 | Transport Network & R02 | $T+50\text{ min}$ | $150\text{m}$ coupling active; evacuation convoy traverses $E01 \to E07$. |
| **Phase 6** | 00:72 – 00:82 | Limiting Segment Cutoff | $T+60\text{ min}$ | Segment `R02-E07` reaches flood threshold ($h \ge 0.30\text{m}$, $d=31.7\text{m}$). |
| **Phase 7** | 00:82 – 00:90 | JalRakshak Decision Climax | $T+60\text{ min}$ | EWE reveals **`LEAVE BY T+44:21`** on `R02-E07` ($A=3600\text{s}, T=759\text{s}, B=180\text{s}$). |

---

## 4. Verification & Testing Evidence
- **Automated Video Tests**: [`tests/test_cinematic_video_verification.py`](file:///d:/projects/JalRakshak/tests/test_cinematic_video_verification.py) verifies video frame count (2160 frames), resolution ($1920 \times 1080$), and statistically significant mean pixel differences across all sequential checkpoints.
- **Backend Invariant Tests**: [`backend/tests/test_simulation_invariants.py`](file:///d:/projects/JalRakshak/backend/tests/test_simulation_invariants.py) proves visual video presentation cannot alter or contaminate authoritative backend EWE calculations.
- **Total Test Suite**: 166/166 passing tests (`pytest backend/tests/ tests/`).
