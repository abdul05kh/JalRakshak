# JalRakshak

JalRakshak is a dam-break flood decision-support prototype built for **Smart India Hackathon 2026**.

It connects HEC-RAS 2D hydraulic simulation output to road networks and evacuation routes, turning thousands of flood depth/velocity numbers into a single, actionable question:

**"Which route can be used, and how much time is available before water cuts it off?"**

---

## What is JalRakshak?

JalRakshak is not a replacement for flood simulation software.

It is a decision-support layer built on top of hydraulic and geospatial data.

When a dam breaks, flood models can calculate where water goes and when it gets there. But emergency workers on the ground need to know which roads are cut off, which route is safest, and how much time people have before the water reaches critical road segments.

JalRakshak connects flood water calculations to road networks and evacuation routes.

---

## The Problem

Imagine a dam breaks in a mountain valley.

A very large amount of water moves downstream.

A hydraulic model can calculate:
- where the water may go
- how deep the water may get
- how fast the water may move
- when the water may reach each place

These calculations produce thousands of numbers and complex maps.

An emergency decision-maker needs answers to practical questions:
- "Which road can people use right now?"
- "Which road gets flooded first?"
- "How much time is left before that road becomes dangerous?"
- "What is the latest time people can safely start driving?"
- "Which exact spot on the road limits the whole decision?"

JalRakshak is built to help answer those practical questions.

---

## What is HEC-RAS?

HEC-RAS is an established software tool developed by the U.S. Army Corps of Engineers (USACE). It is widely used by engineers to calculate how water moves through rivers, channels, and floodplains.

In this project:
- **HEC-RAS** answers: *"Where is the water going, how deep is it, and when does it arrive?"*
- **JalRakshak** answers: *"What does that water arrival mean for this specific road, this route, and this evacuation deadline?"*

JalRakshak does not compute fluid dynamics on its own. It reads native hydraulic output from HEC-RAS and connects it to the road network.

---

## What JalRakshak Does

Here is how information moves through the system:

1. **Flood Scenario**: A dam-break scenario is selected (for example, a breach at Tehri Dam).
2. **Hydraulic Model Results**: Water depth, velocity, and arrival times are loaded from HEC-RAS 2D HDF5 output **into the backend decision engine**. The operational 3D map visualizes these fields. The cinematic video provides a spatial illustration — see the Two-Layer Architecture section.
3. **Terrain Draping**: The water surface and roads are placed on a 3D terrain map using Copernicus GLO-30 elevation data.
4. **Road Coupling**: The system checks where the flood boundary meets the road network within a 150-meter corridor.
5. **Route Segmentation**: Evacuation routes are split into road segments from origin to safety shelter.
6. **Travel Time**: The system calculates how long it takes a vehicle to drive to each segment based on road type and length.
7. **Arrival Comparison**: For every segment, the system compares flood arrival time with vehicle travel time.
8. **Safety Buffer**: A configured time buffer (default: 3 minutes) is subtracted to prevent last-second departures.
9. **Limiting Segment**: The system identifies the single road segment that closes the window earliest.
10. **Evacuation Deadline**: The system reports the latest feasible departure time and explains why.

```
HEC-RAS Flood Model
        ↓
Flood Inundation & Arrival Map
        ↓
Road Network Coupling
        ↓
Evacuation Route
        ↓
Travel Time & Safety Buffer
        ↓
Latest Feasible Departure Time
        ↓
Limiting Road Bottleneck
        ↓
Decision Support Display
```

---

## What It Does NOT Do

To be scientifically honest, here is what JalRakshak does **not** do:

- It does **not** predict the future with 100% certainty.
- It does **not** guarantee that a route is safe in real life.
- It does **not** replace emergency authorities or trained disaster managers.
- It does **not** replace HEC-RAS or hydraulic engineering software.
- It does **not** simulate live traffic jams unless a real-time traffic sensor feed is connected.
- It does **not** check whether a bridge has collapsed structurally from water force (it only checks if water covers the road).
- It does **not** use AI or machine learning to guess flood arrival times or evacuation deadlines. All deadlines are calculated with deterministic arithmetic from the hydraulic model.
- It does **not** claim field certification or operational clearance. It is an engineering prototype.

---

## Two-Layer Architecture

JalRakshak has two distinct, clearly separated layers with different data sources:

```
LAYER 1 — OPERATIONAL DECISION ENGINE  (scientifically authoritative)
──────────────────────────────────────────────────────────────────────
HEC-RAS 2D HDF5 output (WSE, depth, velocity, arrival times)
        │
        ▼ backend/app/domain/hecras_adapter.py
Hydraulic inundation fields
        │
        ▼ 150 m road-corridor coupling (EPSG:32644)
Road-segment flood arrival times
        │
        ▼ backend/app/algorithms/
D = min_i(A_i − T_i − B)    ← deterministic EWE arithmetic
        │
        ▼ REST API  →  React frontend
Evacuation deadline + limiting road segment on 3D ArcGIS map


LAYER 2 — CINEMATIC VISUALIZATION  (presentation illustration)
──────────────────────────────────────────────────────────────────────────
Copernicus GLO-30 DEM  →  terrain shading canvas (real DEM, required)
        +
Hand-authored Bhagirathi corridor centreline
        +
EWE scenario-derived settlement inundation timings
        │
        ▼ scripts/render_cinematic_simulation.py  →  H.264 + WebM
Cinematic flood animation
        │
        ▼ /simulation page
Spatial illustration of the scenario; decision card shows EWE deadline
```

> **Key distinction:** All evacuation deadlines shown in the application come from the
> Layer 1 engine reading real HEC-RAS HDF5 output. The cinematic video (Layer 2) is a
> spatial illustration — it is **not** a frame-by-frame render of HEC-RAS hydraulic fields.
> Flow particles in the video are cinematic tracers, not HEC-RAS velocity vectors.
> HUD values (Q, h, Fr) are representative scenario parameters, not live cell reads.
> See `scripts/render_cinematic_simulation.py` (module docstring) for the full provenance notice.

---

## Evacuation Window

The Evacuation Window Engine compares two clocks for every road segment on a route:

1. **Clock A**: When does the flood water reach this segment?
2. **Clock B**: How long does it take an evacuee to drive here from the starting point?

If we also want a safety margin, we subtract a safety buffer.

The formula is:

$$\text{Latest Departure for Segment } i = \text{Flood Arrival}_i - \text{Travel Time}_i - \text{Safety Buffer}$$

$$D_{\text{deadline}} = \min_i(A_i - T_i - B)$$

Where:
- $A_i$ = Time when water reaches segment $i$ (from HEC-RAS)
- $T_i$ = Driving time from start point to segment $i$ (from route length and speed)
- $B$ = Safety buffer (configured safety margin, default 3 minutes)
- $D_{\text{deadline}}$ = The latest time you can leave the start point and still pass every segment before water arrives

The segment with the smallest $D$ is called the **limiting road segment**. It is the bottleneck that controls the whole route.

*Note: This is a mathematical calculation based on model inputs. It is not a guarantee of physical safety.*

---

## Default Scenario & Route

In the current prototype, the default scenario is:

- **Study Area**: Tehri Dam and Bhagirathi River Valley (Uttarakhand, India)
- **Central Scenario**: Peak discharge $Q_p = 65,000\text{ m}^3\text{/s}$
- **Primary Route (R02)**: Malidewal Village (`VILL-02`) to Koteshwar (`VILL-01`) via Riverbank Road
- **Limiting Segment**: `R02-E07` (Koteshwar Riverbank Segment)
- **Modelled Flood Arrival at Limiting Segment**: $T+60:00$ (60 minutes after breach)
- **Modelled Travel Time to Limiting Segment**: $12:39$ (12 minutes 39 seconds)
- **Configured Safety Buffer**: $03:00$ (3 minutes)
- **Modelled Departure Deadline**: **$T+44:21$** (44 minutes 21 seconds after breach)

Alternative scenarios included in model data:
- **Minimum Breach Scenario**: $Q_p = 28,500\text{ m}^3\text{/s}$ (Deadline: $T+79:21$)
- **Maximum Breach Scenario**: $Q_p = 115,000\text{ m}^3\text{/s}$ (Deadline: $T+29:21$)

---

## Current Assumptions

Every model requires assumptions. The assumptions currently used in JalRakshak are:

1. **Fixed Travel Speed**: Travel times assume a steady driving speed based on road category (e.g. 40–50 km/h on paved mountain roads). It does not currently model panic, traffic jams, or stopped cars.
2. **Fixed Safety Buffer**: A default 3-minute buffer is applied across all segments. Decision-makers can adjust this value.
3. **Road Coupling Corridor**: The system searches for flood water within 150 meters of the road centerline.
4. **Water Inundation Threshold**: A road segment is considered flooded when water depth exceeds $0.3\text{ meters}$ ($30\text{ cm}$) or flow velocity exceeds $1.0\text{ m/s}$.
5. **Terrain Model**: Terrain elevations come from the 30-meter Copernicus GLO-30 Digital Surface Model. Small physical features narrower than 30 meters (such as small culverts or narrow roadside ditches) are not resolved.
6. **Manning's Friction**: Roughness values ($n = 0.035$ riverbed, $n = 0.055$ floodplain) are standard literature estimates, not calibrated against historical flood gauges.

---

## Data Sources

The repository uses the following datasets:

| Dataset | What It Is | How It Is Used | Data Category |
|---|---|---|---|
| **HEC-RAS 2D HDF (`.p01.hdf`)** | Native 2D unsteady shallow water equation output from HEC-RAS 7.0.1 | Provides water surface elevation, depth, velocity, and arrival timestamps | Real Source Data |
| **Copernicus GLO-30 DSM** | 30-meter satellite elevation raster (EGM96 / UTM Zone 44N) | Provides ground elevation for 3D terrain draping and road elevation profiles | Real Source Data |
| **OpenStreetMap (OSM)** | Road network vector geometry (LineStrings) | Provides road centerline coordinates, lengths, and road types for Route R01 and R02 | Real Source Data |
| **Tehri Dam Geometry** | Published dam crest (830m MSL) and breach invert (635m MSL) | Identifies dam location and breach parameters | Real Source Data |
| **Evacuation Points** | Settlement points and shelter locations (Malidewal, Chamba, Koteshwar) | Defines origin and destination points for route analysis | Configured / Derived |
| **Analytical Dam-Break Fixture** | Ritter (1892) 1D analytical dam-break solution | Used in automated tests to verify hydrodynamic solver equations | Test Fixture |

---

## Three Types of Data

We separate data into three clear categories:

1. **Real Source Data**: Files obtained directly from official or authoritative sources (e.g., Copernicus GLO-30 DSM, OpenStreetMap extracts, USACE HEC-RAS software runs).
2. **Derived Data**: Information calculated directly from real source data using transparent code (e.g., route travel times, road elevation profiles, evacuation windows).
3. **Test / Demo Fixtures**: Standard mathematical problems or synthetic test cases used solely to verify software code correctness in unit tests (e.g., Ritter 1892 analytical validation tests).

We do not mix these categories, and test fixtures are never presented as real valley measurements.

---

## Current Status

| System Component | Status | Description |
|---|---|---|
| **Backend API (FastAPI)** | IMPLEMENTED & TESTED | Provides REST endpoints for scenarios, dam data, road impact, timeline, and route analysis |
| **Hydraulic Integration** | IMPLEMENTED & TESTED | Direct parsing of HEC-RAS 2D HDF output files with zero synthetic fallback |
| **3D Map Engine** | IMPLEMENTED & TESTED | Built on ArcGIS Maps SDK for JavaScript 5.1 (`SceneView`) with custom GLO-30 DSM elevation provider |
| **Road-Hydraulic Coupling** | IMPLEMENTED & TESTED | 150m corridor spatial coupling with road densification ($\le 50\text{m}$) |
| **Evacuation Window Engine** | IMPLEMENTED & TESTED | Deterministic $D = A - T - B$ arithmetic with limiting edge identification |
| **Timeline Simulation** | IMPLEMENTED & TESTED | Continuous interactive playback ($T+00 \dots T+120$) with 1x, 2x, 5x speed and scrubbing |
| **Interactive Telemetry** | IMPLEMENTED & TESTED | 3D segment clicking, road telemetry drawer, and one-click camera focus on bottlenecks |
| **Cryptographic Provenance** | IMPLEMENTED & TESTED | SHA-256 integrity verification across model and terrain files |
| **Dynamic Traffic Congestion** | DATA GAP / FUTURE WORK | Real-time sensor feeds and vehicle density queuing are not yet connected |
| **Field Validation** | NOT YET VALIDATED | Prototype has undergone computational and laboratory pilot verification; no operational field deployment is claimed |

---

## Project Structure

```
JalRakshak/
├── backend/                  # Server application (Python / FastAPI)
│   ├── app/
│   │   ├── api/              # REST API endpoints (/api/scenarios, /api/routes, etc.)
│   │   └── domain/           # Core logic (HEC-RAS parser, EWE engine, database)
│   ├── tests/                # Backend unit and property tests (179 test cases)
│   └── requirements.txt      # Python dependency manifest
├── frontend/                 # Web interface (React, TypeScript, Vite, ArcGIS Maps SDK 5.1)
│   ├── public/terrain/       # Copernicus GLO-30 DSM elevation binary files
│   ├── public/simulation/    # Pre-rendered cinematic visualization (H.264 + WebM)
│   └── src/
│       ├── components/       # UI components (Header, MapView, Telemetry drawer, etc.)
│       ├── map3d/            # ArcGIS 3D engine, custom elevation layer, hydraulic layers
│       ├── views/            # Full-screen operational views (3D Map, Simulation, Decision, etc.)
│       └── services/         # API client — reads VITE_API_BASE_URL from environment
├── artifacts/                # Authoritative HEC-RAS models and execution manifests
│   └── hecras/               # Native HEC-RAS HDF files and run manifests
├── data/                     # Source GIS rasters and dataset conditioning scripts
├── docs/                     # Full technical documentation, mathematical specs, and audit reports
├── scripts/                  # Utility scripts, including render_cinematic_simulation.py
├── tests/                    # Integration and geospatial alignment tests (22 test cases)
├── Dockerfile                # Production container (Google Cloud Run target)
├── pytest.ini                # Test runner configuration
└── README.md                 # This document
```

---

## Deployment Configuration

JalRakshak targets a **Firebase Hosting + Google Cloud Run** production topology:

```
Firebase Hosting (React/Vite)  ─HTTPS►  Cloud Run (FastAPI backend)
         │                                      │
         └─ serves SPA + cinematic MP4/WebM      └─ reads HEC-RAS HDF artifacts
```

### Frontend — `VITE_API_BASE_URL`

```bash
# Local development: create frontend/.env.local  (gitignored)
VITE_API_BASE_URL=http://localhost:8000/api/v1

# Production CI/CD build step
VITE_API_BASE_URL=https://your-cloudrun-service.run.app/api/v1 npm run build
```

### Backend — Dockerfile

```bash
# Build the image
docker build -t jalrakshak-backend .

# Run locally (Tehri scenarios load automatically; BaldEagle is optional)
docker run -p 8000:8000 jalrakshak-backend

# Run with optional BaldEagle HDF artifact
docker run -p 8000:8000 \
  -e REAL_HECRAS_HDF_PATH=/app/artifacts/hecras/BaldEagleDamBrk.p05.hdf \
  -v /local/path/to/artifact:/app/artifacts/hecras \
  jalrakshak-backend
```

> **Never** hardcode a Windows local path (`C:\HEC_Work\...`) in production.
> `REAL_HECRAS_HDF_PATH` defaults to unset (optional scenario not loaded);
> the primary Tehri Gate 3B HDF scenarios remain fully available without it.

---

## How to Run

### Requirements
- **Python**: Version 3.11, 3.12, or 3.14
- **Node.js**: Version 20 or higher
- **Web Browser**: Modern browser with WebGL support (Chrome, Edge, Firefox)

### Step 1: Clone the Repository
```bash
git clone https://github.com/abdul05kh/JalRakshak.git
cd JalRakshak
```

### Step 2: Set Up and Start Backend
```bash
# Optional: Create and activate a virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
# source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt   # or: pip install fastapi uvicorn h5py pydantic pytest

# Start FastAPI server
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
```
Backend will be live at: `http://localhost:8000` (API docs at `http://localhost:8000/docs`).

### Step 3: Set Up and Start Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev -- --host --port 5173
```
Frontend will be live at: `http://localhost:5173`.

---

## Testing

We run automated tests to make sure software changes do not break calculations or map behavior.

To run the complete test suite:

```bash
# Run integration and geospatial alignment tests (22 tests)
pytest tests/

# Run backend unit and property tests (179 tests)
pytest backend/tests/

# Build frontend to verify TypeScript compilation
cd frontend
npm run build
```

**Current Test Results** (commit `881365a`):
- `tests/`: 22 passed / 22 tests (100% pass)
- `backend/tests/`: 179 passed / 179 tests (100% pass)
- Total: **201 tests collected, 201 passed**
- `frontend build`: Passes with zero TypeScript errors

---

## Known Limitations

We explicitly document our known limitations:

1. **Digital Elevation Resolution**: We use 30-meter Copernicus GLO-30 DSM. Local features narrower than 30 meters are not represented in the terrain surface.
2. **Static Vehicle Speeds**: Driving times assume clear roads at standard speeds. Real emergency evacuations may encounter congestion, debris, or stalled vehicles.
3. **No Structural Assessment**: A road is flagged as unsafe based on water depth and flow velocity. The model does not compute bridge scouring or pavement erosion.
4. **Uncalibrated Roughness**: Friction values are engineering estimates from standard literature rather than calibrated against physical gauge measurements during a real flood.
5. **Not Field Certified**: This software is an engineering hackathon prototype developed for research and demonstration. It has not been certified for real-world emergency management.
6. **Cinematic Video Provenance**: The `/simulation` video is a cinematic visualization derived from project scenario data and the GLO-30 DEM. It is **not** a direct frame-by-frame render of HEC-RAS hydraulic output. Flow particles are cinematic tracers; HUD values are representative scenario parameters. See `scripts/render_cinematic_simulation.py` (module docstring) for the full provenance statement.
7. **Deployment Status**: Firebase Hosting and Cloud Run deployment configuration is included but not yet live. The `Dockerfile` and environment variable documentation provide the deployment path.

---

## Team

The JalRakshak project is developed by our student engineering team:

- **Abdul Khader** — Team Lead / ML Engineer
- **Manivarun** — Backend & Database Engineer
- **Zakir** — Frontend & 3D Geospatial Visualization Engineer
- **Numaan** — AI Engineer
- **Thanishka** — QA & Automated Testing Engineer
- **Siri Chandana** — Hydrodynamics & GIS Engineer

---

## Why We Built It

The central question behind JalRakshak is:

> *"What does an emergency decision-maker need that raw hydraulic simulation output does not directly provide?"*

A hydraulic model produces vast amounts of water depth and velocity data. But an emergency coordinator managing an evacuation must know:
- Which road will become impassable first?
- When must the last vehicle leave?
- Which specific segment is the critical bottleneck?

JalRakshak exists to bridge that gap between computational fluid mechanics and practical emergency decisions.

---

## License & Data Attribution

- **Source Code**: MIT License.
- **HEC-RAS**: Developed by the U.S. Army Corps of Engineers (USACE). HEC-RAS is public domain software.
- **Terrain Data**: Copernicus GLO-30 Digital Surface Model provided by the European Space Agency (ESA) under the Copernicus open data policy.
- **Road Geometry**: © OpenStreetMap contributors, licensed under the Open Database License (ODbL).
