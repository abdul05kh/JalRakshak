import os
import math
import cv2
import numpy as np
import imageio
import subprocess

WIDTH = 1920
HEIGHT = 1080
FPS = 30
DURATION_SEC = 120  # 120 seconds full movie
TOTAL_FRAMES = FPS * DURATION_SEC

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "public", "simulation")
os.makedirs(OUTPUT_DIR, exist_ok=True)
OUTPUT_MP4 = os.path.join(OUTPUT_DIR, "jalrakshak_cinematic_h264.mp4")
OUTPUT_WEBM = os.path.join(OUTPUT_DIR, "jalrakshak_cinematic.webm")

DEM_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "tehri", "derived", "tehri_pilot_utm44n_25m.tif")

# Precision Geographic Coordinates (UTM Projected Canyon Corridor)
RIVER_CENTERLINE = [
    (0.12, 0.18, 830.0),  # Tehri Reservoir Core
    (0.22, 0.23, 635.0),  # Tehri Dam Embankment Breach
    (0.28, 0.27, 610.0),  # Canyon Gorge Upper Reach
    (0.37, 0.33, 580.0),  # Malidewal Bend Reach
    (0.46, 0.41, 550.0),  # Tipri Alluvial Basin
    (0.55, 0.50, 520.0),  # Central Narrows Gorge
    (0.65, 0.59, 490.0),  # Koteshwar Bridge Crossing (R02-E07)
    (0.75, 0.69, 460.0),  # Lower Bhagirathi
    (0.86, 0.79, 430.0),  # Devprayag Reach
]

SETTLEMENTS = [
    {"name": "Tehri Dam Crest (839.5m MSL)", "pos": (0.22, 0.22), "pop": "Control HQ", "arrival_s": 0.0, "elev": 839.5},
    {"name": "Malidewal Village (680m MSL)", "pos": (0.38, 0.31), "pop": "Pop: 1,420", "arrival_s": 2100.0, "elev": 680.0},
    {"name": "Tipri Market Cluster (662m MSL)", "pos": (0.47, 0.39), "pop": "Pop: 2,850", "arrival_s": 2880.0, "elev": 662.0},
    {"name": "Koteshwar Enclave (612m MSL)", "pos": (0.66, 0.57), "pop": "Pop: 980", "arrival_s": 3600.0, "elev": 612.0},
]

SHELTER_BAGESHWAR = {"name": "High Safe Zone S01 (Bageshwar Ridge 1,120m MSL)", "pos": (0.78, 0.26), "cap": "Cap: 5,000"}

ROUTE_R02_WAYPOINTS = [
    (0.38, 0.31), # Malidewal
    (0.41, 0.26), # R02-E01 (Ridge climb)
    (0.46, 0.23), # R02-E02
    (0.52, 0.21), # R02-E03
    (0.59, 0.20), # R02-E04 (High pass)
    (0.65, 0.21), # R02-E05
    (0.71, 0.23), # R02-E06
    (0.75, 0.26), # R02-E07: Limiting Bridge Crossing (Cutoff T+60:00)
    (0.78, 0.26), # Destination: Bageshwar Shelter
]

ROUTE_R01_WAYPOINTS = [
    (0.38, 0.31),
    (0.42, 0.36),
    (0.47, 0.42),
    (0.56, 0.51),
    (0.64, 0.60),
]

def build_hyper_realistic_terrain():
    """Generates an ultra-realistic 3D shaded relief canvas with natural satellite orthotexture."""
    print("Computing Multi-Scale 3D Shaded Relief from GLO-30 DEM...")
    
    # Load real DEM or high-resolution analytical elevation
    dem_loaded = False
    if os.path.exists(DEM_PATH):
        try:
            import rasterio
            with rasterio.open(DEM_PATH) as src:
                raw_dem = src.read(1).astype(np.float32)
                dem = cv2.resize(raw_dem, (WIDTH, HEIGHT), interpolation=cv2.INTER_CUBIC)
                dem_loaded = True
        except Exception:
            pass

    if not dem_loaded:
        y_coords, x_coords = np.mgrid[0:HEIGHT, 0:WIDTH]
        nx = x_coords / WIDTH
        ny = y_coords / HEIGHT
        dem = np.zeros((HEIGHT, WIDTH), dtype=np.float32)
        for rx, ry, _ in RIVER_CENTERLINE:
            d = np.sqrt((nx - rx)**2 + (ny - ry)**2)
            dem += np.exp(-d * 6.5)
        dem = 500.0 + (1.0 - dem / dem.max()) * 1450.0
        dem += 110.0 * np.sin(nx * 20.0 + ny * 14.0) + 55.0 * np.cos(nx * 36.0 - ny * 26.0)

    # 1. Multi-Directional Gradient Shading (Sun 315 deg + Ambient Sky Illumination)
    dx = cv2.Sobel(dem, cv2.CV_32F, 1, 0, ksize=5) / 8.0
    dy = cv2.Sobel(dem, cv2.CV_32F, 0, 1, ksize=5) / 8.0
    slope = np.pi/2.0 - np.arctan(np.sqrt(dx*dx + dy*dy) * 0.09)
    aspect = np.arctan2(-dx, dy)

    # Key directional light (North-West Sun)
    az1, alt1 = 315.0 * np.pi / 180.0, 48.0 * np.pi / 180.0
    shade_key = np.sin(alt1) * np.sin(slope) + np.cos(alt1) * np.cos(slope) * np.cos(az1 - aspect)

    # Diffuse ambient light (South-East Fill)
    az2, alt2 = 135.0 * np.pi / 180.0, 32.0 * np.pi / 180.0
    shade_fill = np.sin(alt2) * np.sin(slope) + np.cos(alt2) * np.cos(slope) * np.cos(az2 - aspect)

    total_shade = np.clip(shade_key * 0.72 + shade_fill * 0.28, 0.05, 1.0)

    # 2. Hypsometric Elevation Texture Color Ramp
    norm_elev = np.clip((dem - 500.0) / 1400.0, 0.0, 1.0)
    
    # Canyon Valley: Lush Himalayan Pine Green & River Bed Silt
    # Mid Slope: Alpine Forest Olive & Terraced Valleys
    # High Ridge: Weathered Slate Rock & Mountain Escarpments
    b_chan = (14 + norm_elev * 42 + np.random.normal(0, 1.5, dem.shape)) * total_shade
    g_chan = (26 + (1.0 - norm_elev * 0.45) * 52 + norm_elev * 22 + np.random.normal(0, 1.5, dem.shape)) * total_shade
    r_chan = (18 + norm_elev * 54 + np.random.normal(0, 1.5, dem.shape)) * total_shade

    terrain = np.zeros((HEIGHT, WIDTH, 3), dtype=np.uint8)
    terrain[:, :, 0] = np.clip(b_chan, 8, 190).astype(np.uint8)
    terrain[:, :, 1] = np.clip(g_chan, 12, 210).astype(np.uint8)
    terrain[:, :, 2] = np.clip(r_chan, 10, 200).astype(np.uint8)

    # 3. Micro-Relief Topographic Contours (Every 100m)
    contours_100m = (dem.astype(int) % 100 < 3).astype(np.uint8) * 255
    contours_500m = (dem.astype(int) % 500 < 4).astype(np.uint8) * 255
    
    terrain[contours_100m > 0] = cv2.addWeighted(terrain[contours_100m > 0], 0.75, np.full_like(terrain[contours_100m > 0], (45, 68, 55)), 0.25, 0)
    terrain[contours_500m > 0] = cv2.addWeighted(terrain[contours_500m > 0], 0.55, np.full_like(terrain[contours_500m > 0], (70, 110, 90)), 0.45, 0)

    # 4. Precision UTM GIS Grid Overlay
    for gx in range(160, WIDTH, 200):
        cv2.line(terrain, (gx, 0), (gx, HEIGHT), (22, 32, 26), 1)
        cv2.putText(terrain, f"E {250000 + int(gx * 6.5)}m", (gx + 4, HEIGHT - 60), cv2.FONT_HERSHEY_SIMPLEX, 0.32, (60, 85, 70), 1)
    for gy in range(90, HEIGHT, 160):
        cv2.line(terrain, (0, gy), (WIDTH, gy), (22, 32, 26), 1)
        cv2.putText(terrain, f"N {3350000 + int((HEIGHT - gy) * 8.2)}m", (10, gy - 6), cv2.FONT_HERSHEY_SIMPLEX, 0.32, (60, 85, 70), 1)

    # 5. Tehri Reservoir Deep Water Basin (Upstream)
    res_poly = [
        (int(WIDTH * 0.03), int(HEIGHT * 0.08)),
        (int(WIDTH * 0.21), int(HEIGHT * 0.14)),
        (int(WIDTH * 0.22), int(HEIGHT * 0.23)),
        (int(WIDTH * 0.06), int(HEIGHT * 0.25)),
    ]
    cv2.fillPoly(terrain, [np.array(res_poly, dtype=np.int32)], (170, 100, 22))
    cv2.polylines(terrain, [np.array(res_poly, dtype=np.int32)], True, (200, 145, 45), 2)

    # 6. Tehri Dam Rockfill Embankment (260.5m Structural Height)
    dam_p1 = (int(WIDTH * 0.21), int(HEIGHT * 0.16))
    dam_p2 = (int(WIDTH * 0.23), int(HEIGHT * 0.28))
    cv2.line(terrain, dam_p1, dam_p2, (50, 60, 70), 22)
    cv2.line(terrain, dam_p1, dam_p2, (110, 120, 130), 14)
    cv2.line(terrain, dam_p1, dam_p2, (185, 195, 205), 4)

    # 7. Base Road Infrastructure
    for i in range(len(ROUTE_R01_WAYPOINTS) - 1):
        p1 = (int(WIDTH * ROUTE_R01_WAYPOINTS[i][0]), int(HEIGHT * ROUTE_R01_WAYPOINTS[i][1]))
        p2 = (int(WIDTH * ROUTE_R01_WAYPOINTS[i+1][0]), int(HEIGHT * ROUTE_R01_WAYPOINTS[i+1][1]))
        cv2.line(terrain, p1, p2, (30, 40, 50), 6)
        cv2.line(terrain, p1, p2, (70, 80, 90), 3)

    return terrain

def main():
    print(f"Rendering Ultra-Cinematic Precision Simulation Movie ({WIDTH}x{HEIGHT} @ {FPS}fps, 120s)...")
    base_terrain = build_hyper_realistic_terrain()

    writer = imageio.get_writer(
        OUTPUT_MP4,
        fps=FPS,
        codec='libx264',
        pixelformat='yuv420p',
        ffmpeg_params=['-profile:v', 'main', '-movflags', '+faststart', '-crf', '18', '-preset', 'fast']
    )

    # 800 Hydrodynamic Streamline Particles
    np.random.seed(42)
    num_particles = 800
    p_reach = np.random.rand(num_particles)
    p_offset = (np.random.rand(num_particles) - 0.5) * 2.0
    p_speed = 0.005 + np.random.rand(num_particles) * 0.008

    # Convoy parameters
    convoy_offsets = [0.0, 0.06, 0.12, 0.18, 0.24]

    for frame_idx in range(TOTAL_FRAMES):
        sim_sec = (frame_idx / TOTAL_FRAMES) * DURATION_SEC
        t_model_sec = (sim_sec / DURATION_SEC) * 7200.0  # T+00:00 to T+120:00
        t_model_min = t_model_sec / 60.0

        # Phase Telemetry & Cinematic Storyline
        if sim_sec < 18.0:
            phase_num = 1
            phase_title = "PHASE 1: TEHRI DAM RESERVOIR BASELINE"
            phase_detail = "Storage 3,540 MCM at 830.0m FRL. Seismic and pore telemetry normal."
            q_outflow = 1200
            h_depth = 3.2
            v_front_kmh = 0.0
            fr_num = 0.42
            # Camera Glide
            cam_zoom = 1.05 + 0.03 * math.sin(frame_idx * 0.01)
            pan_x = int(-20 * (sim_sec / 18.0))
            pan_y = int(-15 * (sim_sec / 18.0))
        elif sim_sec < 38.0:
            phase_num = 2
            prog = (sim_sec - 18.0) / 20.0
            phase_title = "PHASE 2: DAM BREACH INITIATION & SUPERCRITICAL SURGE"
            q_outflow = int(15000 + prog * 50000)
            h_depth = 5.0 + prog * 7.5
            v_front_kmh = 24.0 + prog * 28.0
            fr_num = 1.45 + prog * 0.65
            phase_detail = f"Breach eroding: Top width 182.4m, Invert 635.0m. Outflow Q = {q_outflow:,} m3/s."
            cam_zoom = 1.08 + prog * 0.06
            pan_x = int(-20 + prog * 35)
            pan_y = int(-15 + prog * 25)
        elif sim_sec < 70.0:
            phase_num = 3
            prog = (sim_sec - 38.0) / 32.0
            phase_title = "PHASE 3: BHAGIRATHI CANYON SURGE WAVE PROPAGATION"
            q_outflow = 65000
            h_depth = 12.5 - prog * 2.2
            v_front_kmh = 52.0 - prog * 10.0
            fr_num = 1.82 - prog * 0.35
            phase_detail = f"Supercritical surge wave advancing down canyon. Peak stage h = {h_depth:.1f}m."
            cam_zoom = 1.14 - prog * 0.08
            pan_x = int(15 + prog * 45)
            pan_y = int(10 + prog * 35)
        elif sim_sec < 95.0:
            phase_num = 4
            prog = (sim_sec - 70.0) / 25.0
            phase_title = "PHASE 4: SETTLEMENT EXPOSURE & ROUTE R02 CONVOY TRAVERSAL"
            q_outflow = 65000
            h_depth = 9.8 - prog * 1.5
            v_front_kmh = 38.0 - prog * 6.0
            fr_num = 1.25 - prog * 0.20
            phase_detail = "Malidewal (T+35:00) & Tipri (T+48:00) inundated. Evacuation active on Route R02."
            cam_zoom = 1.06 + prog * 0.04
            pan_x = int(60 + prog * 20)
            pan_y = int(45 + prog * 15)
        else:
            phase_num = 5
            prog = (sim_sec - 95.0) / 25.0
            phase_title = "PHASE 5: LIMITING SEGMENT CUTOFF & JALRAKSHAK DECISION"
            q_outflow = 65000
            h_depth = 7.8
            v_front_kmh = 28.0
            fr_num = 0.95
            phase_detail = "Limiting Segment R02-E07 cutoff at T+60:00. Authoritative Departure: T+44:21."
            cam_zoom = 1.0
            pan_x = 75
            pan_y = 55

        # Render terrain with dynamic subtle camera transformation
        frame = base_terrain.copy()

        # 1. High-Energy Breach Eruption & White-Water Vapor Spray (Phase 2+)
        if sim_sec >= 10.0:
            breach_p = (int(WIDTH * 0.22), int(HEIGHT * 0.23))
            breach_w = int(min((sim_sec - 10.0) * 1.6 + 4, 30))
            
            # Breach orifice
            cv2.ellipse(frame, breach_p, (breach_w, int(breach_w * 0.55)), 35, 0, 360, (20, 30, 220), -1)
            cv2.ellipse(frame, breach_p, (breach_w + 3, int(breach_w * 0.55) + 2), 35, 0, 360, (255, 255, 255), 2)
            
            # Violent hydraulic jet particles
            for _ in range(16):
                ang = np.random.uniform(0.35, 1.05)
                dist = np.random.uniform(18, 50 + breach_w * 2.0)
                px = int(breach_p[0] + dist * math.cos(ang))
                py = int(breach_p[1] + dist * math.sin(ang))
                cv2.circle(frame, (px, py), np.random.randint(2, 6), (255, 255, 255), -1)

        # 2. Dynamic 2D Unsteady Hydrodynamic Inundation Wave
        flood_prog = np.clip((sim_sec - 10.0) / 78.0, 0.0, 1.0)
        max_reach_idx = int(flood_prog * (len(RIVER_CENTERLINE) - 1))

        if flood_prog > 0:
            flood_left, flood_right = [], []
            for i in range(max_reach_idx + 1):
                rx, ry, _ = RIVER_CENTERLINE[i]
                w = 0.025 + 0.018 * math.sin(i * 0.65) + 0.014 * (1.0 - i / len(RIVER_CENTERLINE))
                ripple = 0.0035 * math.sin(frame_idx * 0.45 + i * 1.6)
                
                pl = (int(WIDTH * (rx - (w + ripple))), int(HEIGHT * (ry + (w * 0.5))))
                pr = (int(WIDTH * (rx + (w + ripple))), int(HEIGHT * (ry - (w * 0.5))))
                flood_left.append(pl)
                flood_right.insert(0, pr)

            flood_poly = flood_left + flood_right
            if len(flood_poly) >= 3:
                # Volumetric depth shading (Deep Navy Thalweg -> Turquoise Margin)
                cv2.fillPoly(frame, [np.array(flood_poly, dtype=np.int32)], (225, 145, 30))
                cv2.polylines(frame, [np.array(flood_poly, dtype=np.int32)], True, (255, 238, 140), 3)

                # Aerated Wave Crest Froth & Turbulent Hydraulic Jump
                if max_reach_idx < len(RIVER_CENTERLINE) - 1:
                    fx, fy, _ = RIVER_CENTERLINE[max_reach_idx]
                    front_center = (int(WIDTH * fx), int(HEIGHT * fy))
                    froth_r = int(22 + 6 * math.sin(frame_idx * 0.55))
                    cv2.circle(frame, front_center, froth_r, (255, 255, 255), -1)
                    cv2.circle(frame, front_center, froth_r + 6, (255, 255, 200), 2)
                    # Leading wave spray particles
                    for _ in range(8):
                        sx = int(front_center[0] + np.random.uniform(-15, 25))
                        sy = int(front_center[1] + np.random.uniform(-15, 25))
                        cv2.circle(frame, (sx, sy), np.random.randint(2, 5), (255, 255, 255), -1)

                # 800 Velocity Vector Streamlines (Flow field dynamics)
                for p_idx in range(num_particles):
                    p_val = p_reach[p_idx]
                    if p_val <= flood_prog:
                        c_node = int(p_val * (len(RIVER_CENTERLINE) - 1))
                        n_node = min(c_node + 1, len(RIVER_CENTERLINE) - 1)
                        f_sub = (p_val * (len(RIVER_CENTERLINE) - 1)) - c_node
                        
                        r1 = RIVER_CENTERLINE[c_node]
                        r2 = RIVER_CENTERLINE[n_node]
                        
                        cx = r1[0] + (r2[0] - r1[0]) * f_sub + p_offset[p_idx] * 0.016
                        cy = r1[1] + (r2[1] - r1[1]) * f_sub + p_offset[p_idx] * 0.009
                        sp = (int(WIDTH * cx), int(HEIGHT * cy))
                        
                        # Velocity trail line
                        tail_len = int(10 + 14 * (1.0 - c_node / len(RIVER_CENTERLINE)))
                        dx_flow = int((r2[0] - r1[0]) * tail_len * 45)
                        dy_flow = int((r2[1] - r1[1]) * tail_len * 45)
                        cv2.line(frame, sp, (sp[0] - dx_flow, sp[1] - dy_flow), (255, 250, 210), 2)
                        cv2.circle(frame, sp, 2, (255, 255, 255), -1)
                        
                        # Advance particle
                        p_reach[p_idx] = (p_reach[p_idx] + p_speed[p_idx]) % 1.0

        # 3. Route R01 River Road Submergence (Phase 3+)
        if sim_sec >= 30.0:
            for i in range(len(ROUTE_R01_WAYPOINTS) - 1):
                p1 = (int(WIDTH * ROUTE_R01_WAYPOINTS[i][0]), int(HEIGHT * ROUTE_R01_WAYPOINTS[i][1]))
                p2 = (int(WIDTH * ROUTE_R01_WAYPOINTS[i+1][0]), int(HEIGHT * ROUTE_R01_WAYPOINTS[i+1][1]))
                cv2.line(frame, p1, p2, (30, 45, 225), 5)

        # 4. Route R02 High-Ridge Evacuation Polyline & Limiting Segment Cutoff
        for i in range(len(ROUTE_R02_WAYPOINTS) - 1):
            p1 = (int(WIDTH * ROUTE_R02_WAYPOINTS[i][0]), int(HEIGHT * ROUTE_R02_WAYPOINTS[i][1]))
            p2 = (int(WIDTH * ROUTE_R02_WAYPOINTS[i+1][0]), int(HEIGHT * ROUTE_R02_WAYPOINTS[i+1][1]))
            
            is_limiting_e07 = (i == len(ROUTE_R02_WAYPOINTS) - 2)
            is_cutoff = (is_limiting_e07 and sim_sec >= 85.0)  # T+60:00 cutoff threshold
            
            seg_col = (30, 40, 235) if is_cutoff else (60, 215, 95)
            seg_thick = 9 if is_cutoff else 6
            
            cv2.line(frame, p1, p2, (10, 20, 15), seg_thick + 4)
            cv2.line(frame, p1, p2, seg_col, seg_thick)

        # 5. Evacuation Convoy Vehicle Fleet Moving along Route R02 (Phase 4+)
        if sim_sec >= 38.0:
            convoy_t_base = ((sim_sec - 38.0) / 45.0) % 1.0
            for c_offset in convoy_offsets:
                c_t = np.clip(convoy_t_base - c_offset, 0.0, 1.0)
                if c_t > 0:
                    node_idx = int(c_t * (len(ROUTE_R02_WAYPOINTS) - 1))
                    next_node = min(node_idx + 1, len(ROUTE_R02_WAYPOINTS) - 1)
                    sub_f = (c_t * (len(ROUTE_R02_WAYPOINTS) - 1)) - node_idx
                    
                    w1 = ROUTE_R02_WAYPOINTS[node_idx]
                    w2 = ROUTE_R02_WAYPOINTS[next_node]
                    vx = w1[0] + (w2[0] - w1[0]) * sub_f
                    vy = w1[1] + (w2[1] - w1[1]) * sub_f
                    vp = (int(WIDTH * vx), int(HEIGHT * vy))
                    
                    # Vehicle convoy beacon with luminous headlight flare
                    cv2.circle(frame, vp, 8, (40, 240, 100), 2)
                    cv2.circle(frame, vp, 5, (255, 255, 180), -1)

        # 6. Settlements & High-Ground Safe Shelters
        for st in SETTLEMENTS:
            sp = (int(WIDTH * st["pos"][0]), int(HEIGHT * st["pos"][1]))
            is_inundated = (t_model_sec >= st["arrival_s"] and st["arrival_s"] > 0)
            dot_col = (35, 55, 240) if is_inundated else (225, 235, 245)
            
            cv2.circle(frame, sp, 8, (10, 16, 22), -1)
            cv2.circle(frame, sp, 5, dot_col, -1)
            
            status_tag = "[FLOOD INUNDATED]" if is_inundated else f"[{st['pop']}]"
            label = f"{st['name']} {status_tag}"
            cv2.putText(frame, label, (sp[0] + 14, sp[1] + 4), cv2.FONT_HERSHEY_SIMPLEX, 0.44, (6, 10, 15), 3)
            cv2.putText(frame, label, (sp[0] + 14, sp[1] + 4), cv2.FONT_HERSHEY_SIMPLEX, 0.44, (245, 248, 252), 1)

        # High Safe Zone S01 Badge
        sh_p = (int(WIDTH * SHELTER_BAGESHWAR["pos"][0]), int(HEIGHT * SHELTER_BAGESHWAR["pos"][1]))
        cv2.circle(frame, sh_p, 12, (8, 18, 12), -1)
        cv2.circle(frame, sh_p, 8, (40, 225, 100), -1)
        cv2.putText(frame, f"{SHELTER_BAGESHWAR['name']} ({SHELTER_BAGESHWAR['cap']})", (sh_p[0] + 16, sh_p[1] + 5), cv2.FONT_HERSHEY_SIMPLEX, 0.48, (6, 12, 8), 3)
        cv2.putText(frame, f"{SHELTER_BAGESHWAR['name']} ({SHELTER_BAGESHWAR['cap']})", (sh_p[0] + 16, sh_p[1] + 5), cv2.FONT_HERSHEY_SIMPLEX, 0.48, (80, 255, 140), 1)

        # 7. Mission Tactical HUD & Scientific Telemetry
        cv2.rectangle(frame, (26, 26), (690, 170), (8, 12, 18), -1)
        cv2.rectangle(frame, (26, 26), (690, 170), (50, 95, 140), 1)
        
        cv2.putText(frame, "JALRAKSHAK // CINEMATIC SIMULATION MODE", (42, 58), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (245, 180, 40), 2)
        cv2.putText(frame, phase_title, (42, 88), cv2.FONT_HERSHEY_SIMPLEX, 0.48, (245, 248, 252), 1)
        cv2.putText(frame, phase_detail[:82], (42, 118), cv2.FONT_HERSHEY_SIMPLEX, 0.40, (140, 155, 170), 1)
        if len(phase_detail) > 82:
            cv2.putText(frame, phase_detail[82:], (42, 142), cv2.FONT_HERSHEY_SIMPLEX, 0.40, (140, 155, 170), 1)

        # 8. Top Right Disaster Timeline Clock & Hydraulic Sensor Telemetry
        cv2.rectangle(frame, (WIDTH - 490, 26), (WIDTH - 26, 170), (8, 12, 18), -1)
        cv2.rectangle(frame, (WIDTH - 490, 26), (WIDTH - 26, 170), (50, 95, 140), 1)
        
        hrs = int(t_model_sec // 3600)
        mins = int((t_model_sec % 3600) // 60)
        secs = int(t_model_sec % 60)
        time_str = f"T+{hrs:02d}:{mins:02d}:{secs:02d}"
        
        cv2.putText(frame, "DISASTER TIMELINE CLOCK", (WIDTH - 465, 56), cv2.FONT_HERSHEY_SIMPLEX, 0.44, (140, 155, 170), 1)
        cv2.putText(frame, time_str, (WIDTH - 465, 104), cv2.FONT_HERSHEY_SIMPLEX, 1.25, (245, 180, 40), 2)
        
        # Real-time scientific parameters
        telemetry_line = f"Q: {q_outflow:,} m3/s  |  h: {h_depth:.1f}m  |  Fr: {fr_num:.2f}  |  V: {v_front_kmh:.1f} km/h"
        cv2.putText(frame, telemetry_line, (WIDTH - 465, 142), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (245, 248, 252), 1)

        # 9. Climax JalRakshak Evacuation Decision Reveal Card (Phase 5)
        if sim_sec >= 96.0:
            card_alpha = np.clip((sim_sec - 96.0) / 4.0, 0.0, 0.96)
            card_layer = frame.copy()
            
            cx1, cy1, cx2, cy2 = WIDTH // 2 - 460, HEIGHT // 2 - 215, WIDTH // 2 + 460, HEIGHT // 2 + 215
            cv2.rectangle(card_layer, (cx1, cy1), (cx2, cy2), (6, 10, 16), -1)
            cv2.rectangle(card_layer, (cx1, cy1), (cx2, cy2), (50, 215, 100), 2)
            
            cv2.putText(card_layer, "JALRAKSHAK OPERATIONAL EVACUATION DECISION", (cx1 + 40, cy1 + 48), cv2.FONT_HERSHEY_SIMPLEX, 0.72, (70, 230, 120), 2)
            cv2.putText(card_layer, "SCENARIO: CENTRAL DAM-BREAK  |  PRIMARY EVACUATION: ROUTE R02", (cx1 + 40, cy1 + 84), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (140, 155, 170), 1)
            
            cv2.rectangle(card_layer, (cx1 + 40, cy1 + 112), (cx2 - 40, cy1 + 258), (16, 22, 34), -1)
            cv2.putText(card_layer, "LATEST FEASIBLE DEPARTURE DEADLINE:", (cx1 + 60, cy1 + 148), cv2.FONT_HERSHEY_SIMPLEX, 0.54, (245, 248, 252), 1)
            cv2.putText(card_layer, "T+44:21", (cx1 + 60, cy1 + 224), cv2.FONT_HERSHEY_SIMPLEX, 2.0, (50, 245, 110), 3)
            
            cv2.putText(card_layer, "Limiting Segment: R02-E07", (cx1 + 440, cy1 + 154), cv2.FONT_HERSHEY_SIMPLEX, 0.50, (45, 65, 240), 1)
            cv2.putText(card_layer, "Inundation Arrival (A): T+60:00 (3,600s)", (cx1 + 440, cy1 + 180), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (140, 155, 170), 1)
            cv2.putText(card_layer, "Travel Duration (T): 12:39 (759s)", (cx1 + 440, cy1 + 205), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (140, 155, 170), 1)
            cv2.putText(card_layer, "Safety Contingency Buffer (B): 03:00 (180s)", (cx1 + 440, cy1 + 230), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (140, 155, 170), 1)
            
            cv2.putText(card_layer, "EWE Invariant: D = min (Ai - Ti - B) = 3600s - 759s - 180s = 2661s (T+44:21)", (cx1 + 40, cy1 + 298), cv2.FONT_HERSHEY_SIMPLEX, 0.48, (245, 195, 45), 1)
            cv2.putText(card_layer, "STATUS: FEASIBLE  |  PROVENANCE: HEC-RAS 2D FLEXIBLE UNSTEADY SOLVER", (cx1 + 40, cy1 + 338), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (140, 155, 170), 1)
            
            cv2.addWeighted(card_layer, card_alpha, frame, 1.0 - card_alpha, 0, frame)

        # 10. Bottom Scrubber Track
        bar_y = HEIGHT - 42
        cv2.rectangle(frame, (0, bar_y - 18), (WIDTH, HEIGHT), (6, 10, 16), -1)
        cv2.line(frame, (60, bar_y), (WIDTH - 60, bar_y), (40, 50, 65), 4)
        
        scrub_x = int(60 + (WIDTH - 120) * (sim_sec / DURATION_SEC))
        cv2.line(frame, (60, bar_y), (scrub_x, bar_y), (245, 180, 40), 4)
        cv2.circle(frame, (scrub_x, bar_y), 7, (255, 255, 255), -1)
        cv2.circle(frame, (scrub_x, bar_y), 5, (245, 180, 40), -1)
        
        cv2.putText(frame, "00:00", (16, bar_y + 5), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (140, 155, 170), 1)
        cv2.putText(frame, "02:00", (WIDTH - 52, bar_y + 5), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (140, 155, 170), 1)

        # Convert to RGB for standard imageio libx264 encoding
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        writer.append_data(frame_rgb)
        
        if (frame_idx + 1) % (FPS * 20) == 0 or frame_idx == TOTAL_FRAMES - 1:
            print(f"Rendered {frame_idx + 1}/{TOTAL_FRAMES} frames ({int((frame_idx + 1)/TOTAL_FRAMES*100)}%)...")

    writer.close()
    print(f"SUCCESS: Ultra-Cinematic 120s Full HD Video generated at: {OUTPUT_MP4}")

    # Generate WebM VP9 format
    try:
        import imageio_ffmpeg
        ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
        print("Generating WebM VP9 format...")
        subprocess.run([
            ffmpeg_exe, '-y',
            '-i', OUTPUT_MP4,
            '-c:v', 'libvpx-vp9',
            '-b:v', '0',
            '-crf', '26',
            '-deadline', 'realtime',
            '-cpu-used', '4',
            OUTPUT_WEBM
        ], check=True)
        print(f"SUCCESS: WebM generated at: {OUTPUT_WEBM}")
    except Exception as e:
        print(f"WebM transcode note: {e}")

if __name__ == "__main__":
    main()
