# 06 — API Specification (Base path: `/api/v1`)

- `POST /scenarios` — Create scenario
- `GET /scenarios` — List scenarios
- `GET /scenarios/{id}` — Scenario metadata & state
- `GET /scenarios/{id}/provenance` — Source/model/hash manifest
- `GET /scenarios/{id}/layers` — Available map layers
- `GET /scenarios/{id}/point-query?lat=...&lon=...` — Arrival time, depth, velocity
- `GET /scenarios/{id}/validation` — QA & benchmark evidence
- `POST /routes/analyze` — EWE route analysis & deadline
- `POST /scenarios/compare` — Comparative scenario analysis
- `GET /health/live`, `GET /health/ready`
