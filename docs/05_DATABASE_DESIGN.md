# 05 — Database Design

Entities:
- `dams` (id, name, authority, latitude, longitude, river_name, reservoir_name)
- `scenarios` (id, dam_id, name, status, breach_width_m, breach_formation_min, breach_elevation_m, duration_min)
- `hydraulic_runs` (id, scenario_id, status, solver_log_uri, qa_status, input_hash, output_hash)
- `raster_artifacts` (id, hydraulic_run_id, artifact_type, uri, crs, checksum)
- `roads` (id, source, geometry, road_class, speed_kmh)
- `evacuation_points` (id, type, name, geometry, capacity)
- `route_runs` (id, scenario_id, origin_id, destination_id, departure_time, safety_buffer_min)
- `route_results` (id, route_run_id, status, distance_m, travel_time_min, deadline_utc, limiting_edge_id, explanation)
- `validation_runs` (id, test_name, benchmark_type, expected, observed, metrics, status)
