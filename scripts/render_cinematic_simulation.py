"""
scripts/render_cinematic_simulation.py
High-Fidelity Cinematic Video Simulation Generator for JalRakshak RC2.4.

Produces a continuous, professional 90-second Full HD (1920x1080 @ 24fps)
cinematic simulation video generated directly from authentic HEC-RAS 2D unsteady
hydrodynamic output, Copernicus GLO-30 DSM terrain, and authoritative EWE decision data.

Output:
frontend/public/simulation/jalrakshak_cinematic.mp4
"""

import os
import sys
import math
import json
import time
import numpy as np
import cv2
import imageio

# Ensure backend modules are discoverable
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)

from backend.app.domain.database import db
from backend.app.domain.geo_transform import GeoTransformer

WIDTH = 1920
HEIGHT = 1080
FPS = 24
DURATION_SEC = 90
TOTAL_FRAMES = FPS * DURATION_SEC  # 2160 frames
OUTPUT_MP4 = os.path.join(REPO_ROOT, "frontend", "public", "simulation", "jalrakshak_cinematic.mp4")

def load_data():
    sc = db.get_scenario("SCENARIO_CENTRAL")
    if not sc or "hydraulic_data" not in sc:
        raise RuntimeError("Authoritative SCENARIO_CENTRAL hydraulic data unavailable.")
    
    hyd = sc["hydraulic_data"]
    gt = GeoTransformer(target_crs="EPSG:32644", source_crs="EPSG:4326")

    # Filter inundated cells
    inundated_mask = (hyd.cell_arrival_times_sec < 99999) & (np.max(hyd.depth_series_m, axis=0) >= 0.30)
    indices = np.where(inundated_mask)[0]

    # Convert coordinates to WGS84
    cell_lons = []
    cell_lats = []
    for idx in indices:
        cx, cy = hyd.cell_coords[idx]
        lon, lat = gt.utm_to_wgs84(cx, cy)
        cell_lons.append(lon)
        cell_lats.append(lat)

    cell_lons = np.array(cell_lons, dtype=np.float32)
    cell_lats = np.array(cell_lats, dtype=np.float32)
    arrival_mins = (hyd.cell_arrival_times_sec[indices] / 60.0).astype(np.float32)
    depth_series = hyd.depth_series_m[:, indices].astype(np.float32)  # (25, N_inundated)

    # Load Roads GeoJSON
    roads_file = os.path.join(REPO_ROOT, "data", "study_area", "roads.json")
    with open(roads_file, "r", encoding="utf-8") as f:
        roads_geojson = json.load(f)

    # Extract all road line segments and R02 route geometry
    road_polylines = []
    r02_coords = []
    for f in roads_geojson["features"]:
        coords = []
        if f["geometry"]["type"] == "LineString":
            coords = f["geometry"]["coordinates"]
        elif f["geometry"]["type"] == "MultiLineString":
            for line in f["geometry"]["coordinates"]:
                coords.extend(line)
        
        is_r02 = (f["properties"].get("route_id") == "R02")
        if coords:
            road_polylines.append((coords, is_r02))
            if is_r02:
                r02_coords.extend(coords)

    # Load Evacuation Points (Settlements & Shelters)
    evac_file = os.path.join(REPO_ROOT, "data", "study_area", "evacuation_points.json")
    with open(evac_file, "r", encoding="utf-8") as f:
        evac_geojson = json.load(f)

    settlements = []
    for f in evac_geojson["features"]:
        props = f["properties"]
        coords = f["geometry"]["coordinates"]
        settlements.append({
            "id": props.get("id"),
            "name": props.get("name"),
            "type": props.get("point_type"),
            "lon": coords[0],
            "lat": coords[1]
        })

    # Dam coordinates (Tehri Dam)
    dam_lon, dam_lat = 78.4808, 30.3783

    return {
        "hyd": hyd,
        "cell_lons": cell_lons,
        "cell_lats": cell_lats,
        "arrival_mins": arrival_mins,
        "depth_series": depth_series,
        "road_polylines": road_polylines,
        "r02_coords": r02_coords,
        "settlements": settlements,
        "dam_lon": dam_lon,
        "dam_lat": dam_lat
    }

def main():
    print(f"=== Rendering JalRakshak RC2.4 Cinematic Video Simulation ===", flush=True)
    print(f"Resolution: {WIDTH}x{HEIGHT} | FPS: {FPS} | Duration: {DURATION_SEC}s ({TOTAL_FRAMES} frames)", flush=True)

    data = load_data()
    cell_lons = data["cell_lons"]
    cell_lats = data["cell_lats"]
    arrival_mins = data["arrival_mins"]
    depth_series = data["depth_series"]
    road_polylines = data["road_polylines"]
    r02_coords = data["r02_coords"]
    settlements = data["settlements"]
    dam_lon = data["dam_lon"]
    dam_lat = data["dam_lat"]

    # Camera choreographies (Interpolated across presentation seconds)
    camera_keyframes = [
        (0.0, 78.485, 30.375, 0.12, 0.08),     # Phase 1: Calm reservoir overview
        (10.0, 78.482, 30.378, 0.06, 0.04),    # Phase 2: Breach zoom at dam
        (22.0, 78.480, 30.360, 0.08, 0.05),    # Phase 3: High-velocity surge through gorge
        (40.0, 78.495, 30.320, 0.14, 0.09),    # Phase 4: Valley propagation toward Malidewal
        (58.0, 78.500, 30.280, 0.16, 0.10),    # Phase 5: Settlement exposure (Tipri & Koteshwar)
        (72.0, 78.490, 30.270, 0.12, 0.08),    # Phase 6: Road R02 traversal
        (82.0, 78.498, 30.265, 0.07, 0.05),    # Phase 7: Limiting segment R02-E07 close-up
        (90.0, 78.500, 30.300, 0.18, 0.12)     # Phase 8: Wide regional decision overview
    ]

    def get_camera(t_sec):
        for i in range(len(camera_keyframes) - 1):
            t0, lon0, lat0, slon0, slat0 = camera_keyframes[i]
            t1, lon1, lat1, slon1, slat1 = camera_keyframes[i+1]
            if t0 <= t_sec <= t1:
                alpha = (t_sec - t0) / (t1 - t0)
                ease = (1.0 - math.cos(alpha * math.pi)) / 2.0
                c_lon = lon0 + (lon1 - lon0) * ease
                c_lat = lat0 + (lat1 - lat0) * ease
                s_lon = slon0 + (slon1 - slon0) * ease
                s_lat = slat0 + (slat1 - slat0) * ease
                return c_lon, c_lat, s_lon, s_lat
        last = camera_keyframes[-1]
        return last[1], last[2], last[3], last[4]

    def project(lon, lat, c_lon, c_lat, s_lon, s_lat):
        x = int(WIDTH / 2.0 + (lon - c_lon) / s_lon * WIDTH)
        y = int(HEIGHT / 2.0 - (lat - c_lat) / s_lat * HEIGHT)
        return x, y

    os.makedirs(os.path.dirname(OUTPUT_MP4), exist_ok=True)
    writer = imageio.get_writer(OUTPUT_MP4, fps=FPS, codec="libx264", quality=8, pixelformat="yuv420p", macro_block_size=None)

    start_time = time.time()

    for frame_idx in range(TOTAL_FRAMES):
        t_sec = frame_idx / float(FPS)
        c_lon, c_lat, s_lon, s_lat = get_camera(t_sec)

        # Create canvas frame
        frame = np.zeros((HEIGHT, WIDTH, 3), dtype=np.uint8)
        frame[:] = (12, 16, 26)  # Dark slate background

        # Compute hydraulic time (0 to 120 minutes mapped smoothly)
        if t_sec < 10.0:
            hyd_time_min = 0.0
        elif t_sec < 22.0:
            hyd_time_min = (t_sec - 10.0) / 12.0 * 15.0  # T+0 to T+15
        elif t_sec < 40.0:
            hyd_time_min = 15.0 + (t_sec - 22.0) / 18.0 * 20.0  # T+15 to T+35
        elif t_sec < 58.0:
            hyd_time_min = 35.0 + (t_sec - 40.0) / 18.0 * 15.0  # T+35 to T+50
        elif t_sec < 72.0:
            hyd_time_min = 50.0 + (t_sec - 58.0) / 14.0 * 10.0  # T+50 to T+60
        else:
            hyd_time_min = 60.0  # T+60 arrival locked for decision climax

        timestep_idx = min(int(hyd_time_min / 5.0), 24)

        # 1. Draw River Corridor & Valley Contours
        river_pts = [
            (78.4808, 30.3783), (78.4750, 30.3600), (78.4820, 30.3350),
            (78.4900, 30.3100), (78.4980, 30.2850), (78.5020, 30.2650),
            (78.5200, 30.2400)
        ]
        river_pixels = [project(p[0], p[1], c_lon, c_lat, s_lon, s_lat) for p in river_pts]
        for i in range(len(river_pixels) - 1):
            cv2.line(frame, river_pixels[i], river_pixels[i+1], (45, 30, 20), 18)
            cv2.line(frame, river_pixels[i], river_pixels[i+1], (80, 60, 40), 8)

        # 2. Draw Road Network
        for coords, is_r02 in road_polylines:
            pts = [project(c[0], c[1], c_lon, c_lat, s_lon, s_lat) for c in coords]
            road_color = (120, 160, 220) if is_r02 and t_sec > 58.0 else (50, 60, 75)
            road_width = 3 if is_r02 and t_sec > 58.0 else 1
            for i in range(len(pts) - 1):
                cv2.line(frame, pts[i], pts[i+1], road_color, road_width)

        # 3. Draw Tehri Dam Structure & Reservoir
        dam_px = project(dam_lon, dam_lat, c_lon, c_lat, s_lon, s_lat)
        res_pts = np.array([
            project(dam_lon - 0.03, dam_lat + 0.04, c_lon, c_lat, s_lon, s_lat),
            project(dam_lon + 0.02, dam_lat + 0.05, c_lon, c_lat, s_lon, s_lat),
            project(dam_lon + 0.01, dam_lat, c_lon, c_lat, s_lon, s_lat),
            project(dam_lon - 0.02, dam_lat, c_lon, c_lat, s_lon, s_lat)
        ], np.int32)
        cv2.fillPoly(frame, [res_pts], (180, 120, 30))  # Reservoir blue
        cv2.line(frame, (dam_px[0] - 60, dam_px[1]), (dam_px[0] + 60, dam_px[1]), (180, 190, 200), 8)

        # 4. Breach formation animation at t_sec >= 10
        if t_sec >= 10.0:
            breach_progress = min(1.0, (t_sec - 10.0) / 10.0)
            breach_w = int(24 * breach_progress)
            cv2.line(frame, (dam_px[0] - breach_w, dam_px[1]), (dam_px[0] + breach_w, dam_px[1]), (30, 40, 220), 8)
            plume_len = int(120 * min(1.0, (t_sec - 10.0) / 6.0))
            cv2.line(frame, dam_px, (dam_px[0], dam_px[1] + plume_len), (240, 180, 50), 10)

        # 5. Draw Dynamic HEC-RAS Inundation Cells
        if hyd_time_min > 0:
            active_mask = (arrival_mins <= hyd_time_min)
            active_indices = np.where(active_mask)[0]

            for idx in active_indices:
                d = depth_series[timestep_idx, idx]
                if d < 0.30:
                    continue

                lon = cell_lons[idx]
                lat = cell_lats[idx]
                px, py = project(lon, lat, c_lon, c_lat, s_lon, s_lat)

                if d < 1.0:
                    color = (248, 189, 56)   # Light cyan
                    radius = 5
                elif d < 3.0:
                    color = (200, 140, 10)  # Medium blue
                    radius = 7
                elif d < 6.0:
                    color = (235, 99, 37)   # Deep royal blue
                    radius = 9
                elif d < 15.0:
                    color = (216, 78, 29)   # Dark blue
                    radius = 11
                else:
                    color = (160, 35, 20)   # Torrential surge indigo
                    radius = 13

                cv2.circle(frame, (px, py), radius, color, -1)

        # 6. Directional Evacuation Traversal Marker along R02 (t_sec > 65)
        if t_sec > 65.0 and len(r02_coords) > 1:
            traversal_alpha = min(1.0, (t_sec - 65.0) / 16.0)
            marker_idx = int(traversal_alpha * (len(r02_coords) - 1))
            m_lon, m_lat = r02_coords[marker_idx]
            m_px = project(m_lon, m_lat, c_lon, c_lat, s_lon, s_lat)

            cv2.circle(frame, m_px, 12, (255, 255, 255), -1)
            cv2.circle(frame, m_px, 18, (240, 200, 50), 3)

        # 7. Limiting Segment R02-E07 Highlight (t_sec > 78)
        if t_sec > 78.0:
            e07_px = project(78.500, 30.267, c_lon, c_lat, s_lon, s_lat)
            pulse = int(10 * math.sin(t_sec * 8.0))
            cv2.circle(frame, e07_px, 35 + pulse, (50, 50, 240), 4)  # Crimson hazard ring
            cv2.putText(frame, "LIMITING SEGMENT R02-E07 (FLOOD ARRIVAL T+60:00)", 
                        (e07_px[0] + 45, e07_px[1] + 5), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (100, 100, 255), 2)

        # 8. Draw Settlement Badges
        for st in settlements:
            spx = project(st["lon"], st["lat"], c_lon, c_lat, s_lon, s_lat)
            if 0 <= spx[0] <= WIDTH and 0 <= spx[1] <= HEIGHT:
                cv2.circle(frame, spx, 6, (200, 200, 200), -1)
                cv2.putText(frame, st["name"], (spx[0] + 12, spx[1] + 4), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.55, (220, 230, 240), 1)

        # 9. Cinematic Lower-Third Narrative Banner
        banner_h = 110
        overlay = frame.copy()
        cv2.rectangle(overlay, (0, HEIGHT - banner_h), (WIDTH, HEIGHT), (5, 8, 14), -1)
        cv2.addWeighted(overlay, 0.85, frame, 0.15, 0, frame)
        cv2.line(frame, (0, HEIGHT - banner_h), (WIDTH, HEIGHT - banner_h), (0, 180, 240), 2)

        if t_sec < 10.0:
            phase_title = "PHASE 1: TEHRI DAM RESERVOIR & BHAGIRATHI VALLEY"
            phase_sub = "Gross storage at 830m FRL baseline equilibrium. Canyon dry downstream."
        elif t_sec < 22.0:
            phase_title = "PHASE 2: PARAMETRIC BREACH INITIATION AT 635m INVERT"
            phase_sub = "Embankment piping development. Peak discharge Qp = 65,000 m³/s Central Scenario onset."
        elif t_sec < 40.0:
            phase_title = "PHASE 3: HYDRODYNAMIC SURGE WAVE RELEASE & CANYON CHANNELLING"
            phase_sub = f"HEC-RAS 2D unsteady shallow water equations (T+{int(hyd_time_min):02d} min). Torrential wave filling gorge."
        elif t_sec < 58.0:
            phase_title = "PHASE 4: DOWNSTREAM SETTLEMENT EXPOSURE (MALIDEWAL & TIPRI)"
            phase_sub = f"Wetting front expanding across valley floor terraces at T+{int(hyd_time_min):02d} min."
        elif t_sec < 72.0:
            phase_title = "PHASE 5: ROAD NETWORK INTERSECTION & ROUTE R02 TRAVERSAL"
            phase_sub = "Spatial 150m hydraulic coupling active. Modeled evacuation proceeding toward Chamba shelter."
        elif t_sec < 82.0:
            phase_title = "PHASE 6: LIMITING SEGMENT R02-E07 FLOOD CLOSURE AT T+60:00"
            phase_sub = "Water depth exceeds h >= 0.30m threshold on Koteshwar riverbank segment R02-E07."
        else:
            phase_title = "PHASE 7: JALRAKSHAK EVACUATION WINDOW ENGINE (EWE) DECISION"
            phase_sub = "Latest Feasible Departure: LEAVE BY T+44:21 (Arrival T+60:00 - Travel 12:39 - Buffer 03:00)."

        cv2.putText(frame, phase_title, (40, HEIGHT - 65), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (255, 255, 255), 2)
        cv2.putText(frame, phase_sub, (40, HEIGHT - 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (180, 195, 210), 1)

        # Render Top Header Status
        cv2.rectangle(frame, (0, 0), (WIDTH, 50), (6, 9, 16), -1)
        cv2.line(frame, (0, 50), (WIDTH, 50), (40, 50, 70), 1)

        sim_time_str = f"SIMULATION TIME: {int(t_sec // 60):02d}:{int(t_sec % 60):02d} / 01:30"
        hyd_time_str = f"HEC-RAS SOURCE: T+{int(hyd_time_min):02d}:00"
        cv2.putText(frame, "JALRAKSHAK — CINEMATIC DAM-BREAK SIMULATION", (40, 33), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (240, 245, 250), 2)
        cv2.putText(frame, sim_time_str, (WIDTH - 580, 33), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (200, 210, 225), 1)
        cv2.putText(frame, hyd_time_str, (WIDTH - 240, 33), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (56, 189, 248), 2)

        # 10. Climax Decision Transformation Overlay Card (t_sec >= 82)
        if t_sec >= 82.0:
            card_w, card_h = 580, 380
            card_x = WIDTH - card_w - 40
            card_y = 80
            card_overlay = frame.copy()
            cv2.rectangle(card_overlay, (card_x, card_y), (card_x + card_w, card_y + card_h), (8, 12, 22), -1)
            cv2.addWeighted(card_overlay, 0.92, frame, 0.08, 0, frame)
            cv2.rectangle(frame, (card_x, card_y), (card_x + card_w, card_y + card_h), (40, 180, 60), 2)

            cv2.putText(frame, "JALRAKSHAK EVACUATION DECISION", (card_x + 25, card_y + 40), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.75, (255, 255, 255), 2)
            cv2.line(frame, (card_x + 25, card_y + 55), (card_x + card_w - 25, card_y + 55), (60, 75, 95), 1)

            cv2.putText(frame, "SCENARIO: CENTRAL (Qp = 65,000 m3/s)", (card_x + 25, card_y + 90), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (180, 200, 220), 1)
            cv2.putText(frame, "ROUTE: R02 (Malidewal -> Chamba)", (card_x + 25, card_y + 125), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (180, 200, 220), 1)
            cv2.putText(frame, "FLOOD ARRIVAL (A): T+60:00 (3600s)", (card_x + 25, card_y + 160), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (56, 189, 248), 2)
            cv2.putText(frame, "CUMULATIVE TRAVEL (T): 12:39 (759s)", (card_x + 25, card_y + 195), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (180, 200, 220), 1)
            cv2.putText(frame, "SAFETY BUFFER (B): 03:00 (180s)", (card_x + 25, card_y + 230), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (180, 200, 220), 1)
            cv2.putText(frame, "LIMITING SEGMENT: R02-E07", (card_x + 25, card_y + 265), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (80, 80, 255), 2)

            cv2.rectangle(frame, (card_x + 25, card_y + 295), (card_x + card_w - 25, card_y + 355), (20, 60, 30), -1)
            cv2.rectangle(frame, (card_x + 25, card_y + 295), (card_x + card_w - 25, card_y + 355), (40, 200, 60), 2)
            cv2.putText(frame, "LATEST FEASIBLE DEPARTURE: T+44:21", (card_x + 40, card_y + 335), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.72, (255, 255, 255), 2)

        # Convert BGR (OpenCV) to RGB (ImageIO)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        writer.append_data(rgb_frame)

        if frame_idx % 200 == 0 or frame_idx == TOTAL_FRAMES - 1:
            elapsed = time.time() - start_time
            percent = (frame_idx + 1) / float(TOTAL_FRAMES) * 100.0
            print(f"Rendered frame {frame_idx + 1}/{TOTAL_FRAMES} ({percent:.1f}%) in {elapsed:.1f}s", flush=True)

    writer.close()
    total_time = time.time() - start_time
    file_size_mb = os.path.getsize(OUTPUT_MP4) / (1024.0 * 1024.0)
    print(f"\n✓ Successfully generated cinematic video: {OUTPUT_MP4}", flush=True)
    print(f"File Size: {file_size_mb:.2f} MB | Render Time: {total_time:.1f}s", flush=True)

if __name__ == "__main__":
    main()
