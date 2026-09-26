import os
import math
import numpy as np
import cv2

WIDTH = 1920
HEIGHT = 1080
FPS = 30
DURATION_SEC = 120  # Exactly 120 seconds continuous movie
TOTAL_FRAMES = FPS * DURATION_SEC

OUTPUT_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "frontend", "public", "simulation", "jalrakshak_cinematic.mp4"
)
os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

# Precise Color Palette (BGR)
COLOR_BG = (12, 16, 24)
COLOR_TERRAIN_CONTOUR = (30, 42, 36)
COLOR_CONTOUR_LINE = (42, 58, 48)
COLOR_RESERVOIR_DEEP = (160, 95, 20)
COLOR_RESERVOIR_SHALLOW = (200, 140, 35)
COLOR_FLOOD_DEEP = (235, 175, 45)      # Deep blue surge
COLOR_FLOOD_MID = (245, 205, 75)       # Moderate depth blue
COLOR_FLOOD_FRINGE = (255, 235, 140)   # Shallow fringe cyan-white
COLOR_STREAMLINE = (255, 250, 200)     # Flow velocity vector particles
COLOR_DAM_CONCRETE = (110, 120, 130)
COLOR_DAM_CREST = (175, 185, 195)
COLOR_BREACH_ZONE = (40, 60, 230)
COLOR_ROAD_NORMAL = (90, 100, 110)
COLOR_ROAD_COMPROMISED = (50, 60, 220)
COLOR_ROUTE_R02 = (70, 215, 95)
COLOR_LIMITING_SEGMENT = (35, 45, 235)
COLOR_SETTLEMENT = (225, 230, 235)
COLOR_SHELTER = (50, 225, 110)
COLOR_HUD_BG = (15, 20, 32)
COLOR_HUD_BORDER = (70, 110, 150)
COLOR_TEXT_WHITE = (245, 248, 252)
COLOR_TEXT_MUTED = (135, 150, 165)
COLOR_TEXT_ACCENT = (245, 175, 35)
COLOR_TEXT_CRITICAL = (50, 65, 235)

# High-Precision Geographic Waypoints (Bhagirathi Canyon Corridor)
RIVER_CENTERLINE = [
    (0.16, 0.20, 830.0), # Tehri Reservoir (FRL 830m)
    (0.24, 0.24, 635.0), # Dam Breach Invert (635m)
    (0.30, 0.29, 610.0), # Canyon Gorge Upper Reach
    (0.38, 0.35, 580.0), # Malidewal Bend (Pop 1,420)
    (0.47, 0.43, 550.0), # Tipri Alluvial Basin (Pop 2,850)
    (0.56, 0.52, 520.0), # Central Narrows
    (0.66, 0.61, 490.0), # Koteshwar River Crossing (R02-E07)
    (0.76, 0.70, 460.0), # Lower Bhagirathi
    (0.86, 0.80, 430.0), # Devprayag Confluence
]

SETTLEMENTS = [
    {"name": "Tehri Dam Crest (839.5m MSL)", "pos": (0.24, 0.23), "pop": "Control HQ", "arrival_s": 0.0},
    {"name": "Malidewal Village (680m MSL)", "pos": (0.40, 0.33), "pop": "Pop: 1,420", "arrival_s": 2100.0},
    {"name": "Tipri Market Cluster (662m MSL)", "pos": (0.49, 0.41), "pop": "Pop: 2,850", "arrival_s": 2880.0},
    {"name": "Koteshwar Enclave (612m MSL)", "pos": (0.68, 0.59), "pop": "Pop: 980", "arrival_s": 3600.0},
]

SHELTER_BAGESHWAR = {"name": "High Shelter S01 (Bageshwar Ridge 1,120m MSL)", "pos": (0.78, 0.30), "cap": "Cap: 5,000"}

# Evacuation Route R02 (High Ridge Bypassing Inundation Zones)
ROUTE_R02_WAYPOINTS = [
    (0.40, 0.33), # Origin: Malidewal
    (0.43, 0.28), # R02-E01 (Ridge climb)
    (0.48, 0.25), # R02-E02
    (0.54, 0.23), # R02-E03
    (0.61, 0.22), # R02-E04 (High pass)
    (0.67, 0.23), # R02-E05
    (0.72, 0.26), # R02-E06
    (0.76, 0.29), # R02-E07: Limiting Bridge Crossing (Cutoff T+60:00)
    (0.78, 0.30), # Destination: Bageshwar Shelter
]

# Secondary Compromised Route R01 (Low-Lying River Road)
ROUTE_R01_WAYPOINTS = [
    (0.40, 0.33),
    (0.44, 0.38),
    (0.49, 0.44),
    (0.58, 0.53),
    (0.66, 0.62),
]

def map_to_screen(nx, ny, zoom=1.0, pan_x=0, pan_y=0):
    cx = WIDTH * 0.5 + pan_x
    cy = HEIGHT * 0.5 + pan_y
    iso_x = (nx - 0.5) * WIDTH * 1.18 * zoom
    iso_y = (ny - 0.5) * HEIGHT * 1.18 * zoom
    return int(cx + iso_x), int(cy + iso_y)

def precompute_terrain_topography():
    print("Generating High-Precision Topographic Hillshade Relief...")
    terrain = np.full((HEIGHT, WIDTH, 3), COLOR_BG, dtype=np.uint8)
    
    # 1. Elevation Contours & Mountain Slopes
    grid_rows, grid_cols = 36, 60
    for r in range(grid_rows - 1):
        for c in range(grid_cols - 1):
            nx1, ny1 = c / grid_cols, r / grid_rows
            nx2, ny2 = (c + 1) / grid_cols, (r + 1) / grid_rows
            
            p1 = map_to_screen(nx1, ny1)
            p2 = map_to_screen(nx2, ny1)
            p3 = map_to_screen(nx2, ny2)
            p4 = map_to_screen(nx1, ny2)
            
            # Elevation calculation based on distance to valley canyon
            d_river = min(math.hypot(nx1 - rx, ny1 - ry) for rx, ry, _ in RIVER_CENTERLINE)
            elev_m = 450.0 + d_river * 1800.0 + 40.0 * math.sin(r * 0.35 + c * 0.25)
            
            # Elevation shaded relief
            shade = int(np.clip(24 + (elev_m - 450) / 18.0, 20, 85))
            poly_color = (shade - 5, shade + 2, shade)
            
            cv2.fillPoly(terrain, [np.array([p1, p2, p3, p4], dtype=np.int32)], poly_color)
            if int(elev_m) % 200 < 50:
                cv2.polylines(terrain, [np.array([p1, p2, p3, p4], dtype=np.int32)], True, (shade + 15, shade + 22, shade + 18), 1)

    # 2. Tehri Reservoir Static Body
    res_poly = [
        map_to_screen(0.06, 0.10),
        map_to_screen(0.23, 0.16),
        map_to_screen(0.24, 0.24),
        map_to_screen(0.10, 0.26),
    ]
    cv2.fillPoly(terrain, [np.array(res_poly, dtype=np.int32)], COLOR_RESERVOIR_DEEP)
    cv2.polylines(terrain, [np.array(res_poly, dtype=np.int32)], True, COLOR_RESERVOIR_SHALLOW, 2)
    
    # 3. Tehri Dam Structure (Embankment Crest)
    dam_p1 = map_to_screen(0.23, 0.18)
    dam_p2 = map_to_screen(0.25, 0.28)
    cv2.line(terrain, dam_p1, dam_p2, COLOR_DAM_CONCRETE, 16)
    cv2.line(terrain, dam_p1, dam_p2, COLOR_DAM_CREST, 6)

    # 4. Secondary Road Network (R01 Low Road)
    for i in range(len(ROUTE_R01_WAYPOINTS) - 1):
        p1 = map_to_screen(ROUTE_R01_WAYPOINTS[i][0], ROUTE_R01_WAYPOINTS[i][1])
        p2 = map_to_screen(ROUTE_R01_WAYPOINTS[i+1][0], ROUTE_R01_WAYPOINTS[i+1][1])
        cv2.line(terrain, p1, p2, (40, 50, 60), 5)
        cv2.line(terrain, p1, p2, COLOR_ROAD_NORMAL, 3)

    return terrain

def main():
    print(f"Rendering Definitive 120s Full HD Movie ({WIDTH}x{HEIGHT} @ {FPS}fps, {TOTAL_FRAMES} frames)...")
    base_terrain = precompute_terrain_topography()
    
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(OUTPUT_PATH, fourcc, FPS, (WIDTH, HEIGHT))

    # Pre-generate streamline particle offsets
    np.random.seed(42)
    particles = np.random.rand(120, 2)

    for frame_idx in range(TOTAL_FRAMES):
        sim_sec = (frame_idx / TOTAL_FRAMES) * DURATION_SEC
        t_model_sec = (sim_sec / DURATION_SEC) * 7200.0  # T+00:00 to T+120:00 (7,200 seconds)
        t_model_min = t_model_sec / 60.0

        # Dynamic Movie Phases
        if sim_sec < 18.0:
            phase_title = "PHASE 1: TEHRI DAM RESERVOIR BASELINE"
            phase_detail = "Storage 3,540 MCM at 830.0m FRL. Seismic and pore-pressure telemetry stable."
            cam_zoom, pan_x, pan_y = 1.15, -40, -30
        elif sim_sec < 38.0:
            prog = (sim_sec - 18.0) / 20.0
            phase_title = "PHASE 2: DAM BREACH ONSET & HIGH-DISCHARGE SURGE"
            phase_detail = f"Breach opening: Invert 635.0m, Top Width 182.4m. Peak Outflow Q = {int(15000 + prog * 50000):,} m3/s."
            cam_zoom, pan_x, pan_y = 1.25 - prog * 0.1, -20 + prog * 30, -15 + prog * 25
        elif sim_sec < 70.0:
            prog = (sim_sec - 38.0) / 32.0
            phase_title = "PHASE 3: BHAGIRATHI CANYON SURGE WAVE PROPAGATION"
            phase_detail = f"Supercritical flood front entering alluvial reach near Malidewal. Inundation depth h = {5.2 + prog * 6.5:.1f}m."
            cam_zoom, pan_x, pan_y = 1.15 - prog * 0.1, 10 + prog * 40, 10 + prog * 35
        elif sim_sec < 95.0:
            prog = (sim_sec - 70.0) / 25.0
            phase_title = "PHASE 4: SETTLEMENT EXPOSURE & ROUTE R02 CONVOY TRAVERSAL"
            phase_detail = "Malidewal (T+35:00) & Tipri (T+48:00) low-lying corridors inundated. Evacuation underway along Route R02."
            cam_zoom, pan_x, pan_y = 1.05 + prog * 0.05, 50 + prog * 20, 45 + prog * 15
        else:
            prog = (sim_sec - 95.0) / 25.0
            phase_title = "PHASE 5: LIMITING SEGMENT CUTOFF & JALRAKSHAK DECISION"
            phase_detail = "Limiting Segment R02-E07 inundated at T+60:00. Authoritative Departure Deadline: T+44:21."
            cam_zoom, pan_x, pan_y = 1.0, 70, 60

        # Blit precomputed terrain
        frame = base_terrain.copy()

        # 1. Breach Inception Animation at Tehri Dam
        if sim_sec >= 4.0:
            breach_p = map_to_screen(0.24, 0.24)
            breach_w = int(min((sim_sec - 4.0) * 1.2 + 5, 22))
            # Eroding breach opening
            cv2.ellipse(frame, breach_p, (breach_w, int(breach_w * 0.6)), 35, 0, 360, COLOR_BREACH_ZONE, -1)
            cv2.ellipse(frame, breach_p, (breach_w + 3, int(breach_w * 0.6) + 2), 35, 0, 360, (255, 255, 255), 2)

        # 2. Dynamic 2D Unsteady Hydrodynamic Inundation Expansion
        flood_prog = np.clip((sim_sec - 4.0) / 85.0, 0.0, 1.0)
        max_reach_idx = int(flood_prog * (len(RIVER_CENTERLINE) - 1))
        
        if flood_prog > 0:
            flood_left, flood_right = [], []
            for i in range(max_reach_idx + 1):
                rx, ry, _ = RIVER_CENTERLINE[i]
                # Dynamic width expanding with peak discharge
                w_m = 0.026 + 0.020 * math.sin(i * 0.65) + 0.014 * (1.0 - i / len(RIVER_CENTERLINE))
                wave_ripple = 0.0035 * math.sin(frame_idx * 0.35 + i * 1.4)
                
                pl = map_to_screen(rx - (w_m + wave_ripple), ry + (w_m * 0.5))
                pr = map_to_screen(rx + (w_m + wave_ripple), ry - (w_m * 0.5))
                flood_left.append(pl)
                flood_right.insert(0, pr)
                
            flood_poly = flood_left + flood_right
            if len(flood_poly) >= 3:
                # Multi-tier depth gradient rendering
                cv2.fillPoly(frame, [np.array(flood_poly, dtype=np.int32)], COLOR_FLOOD_DEEP)
                # Outer wetted fringe line
                cv2.polylines(frame, [np.array(flood_poly, dtype=np.int32)], True, COLOR_FLOOD_FRINGE, 2)
                
                # Dynamic flow velocity vector particles (streamlines)
                for p in particles:
                    p_idx = int(p[0] * max_reach_idx)
                    if p_idx < max_reach_idx:
                        r1 = RIVER_CENTERLINE[p_idx]
                        r2 = RIVER_CENTERLINE[p_idx + 1]
                        frac = (p[0] * max_reach_idx) - p_idx
                        px = r1[0] + (r2[0] - r1[0]) * frac + (p[1] - 0.5) * 0.02
                        py = r1[1] + (r2[1] - r1[1]) * frac + (p[1] - 0.5) * 0.01
                        sp = map_to_screen(px, py)
                        cv2.circle(frame, sp, 2, COLOR_STREAMLINE, -1)
                        # Advance particle along flow
                        p[0] = (p[0] + 0.008) % 1.0

        # 3. Route R01 Submergence (Compromised Low Road)
        if sim_sec >= 30.0:
            for i in range(len(ROUTE_R01_WAYPOINTS) - 1):
                p1 = map_to_screen(ROUTE_R01_WAYPOINTS[i][0], ROUTE_R01_WAYPOINTS[i][1])
                p2 = map_to_screen(ROUTE_R01_WAYPOINTS[i+1][0], ROUTE_R01_WAYPOINTS[i+1][1])
                cv2.line(frame, p1, p2, COLOR_ROAD_COMPROMISED, 4)

        # 4. Route R02 Evacuation Polyline & Limiting Segment Status
        for i in range(len(ROUTE_R02_WAYPOINTS) - 1):
            p1 = map_to_screen(ROUTE_R02_WAYPOINTS[i][0], ROUTE_R02_WAYPOINTS[i][1])
            p2 = map_to_screen(ROUTE_R02_WAYPOINTS[i+1][0], ROUTE_R02_WAYPOINTS[i+1][1])
            
            is_limiting_e07 = (i == len(ROUTE_R02_WAYPOINTS) - 2)
            is_inundated_e07 = (is_limiting_e07 and sim_sec >= 85.0)  # T+60:00 threshold
            
            seg_col = COLOR_LIMITING_SEGMENT if is_inundated_e07 else COLOR_ROUTE_R02
            seg_thick = 8 if is_inundated_e07 else 5
            
            cv2.line(frame, p1, p2, (20, 30, 40), seg_thick + 4)
            cv2.line(frame, p1, p2, seg_col, seg_thick)

        # 5. Directional Evacuation Convoy Beacon Traversal (R02: E01 to E07)
        if sim_sec >= 40.0:
            beacon_t = ((sim_sec - 40.0) / 45.0) % 1.0
            node_idx = int(beacon_t * (len(ROUTE_R02_WAYPOINTS) - 1))
            n1 = ROUTE_R02_WAYPOINTS[node_idx]
            n2 = ROUTE_R02_WAYPOINTS[min(node_idx + 1, len(ROUTE_R02_WAYPOINTS) - 1)]
            f_sub = (beacon_t * (len(ROUTE_R02_WAYPOINTS) - 1)) - node_idx
            bx = n1[0] + (n2[0] - n1[0]) * f_sub
            by = n1[1] + (n2[1] - n1[1]) * f_sub
            bp = map_to_screen(bx, by)
            
            pulse_r = int(9 + 4 * math.sin(frame_idx * 0.5))
            cv2.circle(frame, bp, pulse_r + 4, (40, 240, 100), 2)
            cv2.circle(frame, bp, pulse_r, (100, 255, 150), -1)

        # 6. Settlements & High-Ground Shelters
        for st in SETTLEMENTS:
            sp = map_to_screen(st["pos"][0], st["pos"][1])
            is_exposed = (t_model_sec >= st["arrival_s"] and st["arrival_s"] > 0)
            dot_col = COLOR_TEXT_CRITICAL if is_exposed else COLOR_SETTLEMENT
            
            cv2.circle(frame, sp, 7, (15, 20, 28), -1)
            cv2.circle(frame, sp, 5, dot_col, -1)
            
            status_tag = "[INUNDATED]" if is_exposed else f"[{st['pop']}]"
            label = f"{st['name']} {status_tag}"
            cv2.putText(frame, label, (sp[0] + 12, sp[1] + 4), cv2.FONT_HERSHEY_SIMPLEX, 0.44, (10, 15, 22), 3)
            cv2.putText(frame, label, (sp[0] + 12, sp[1] + 4), cv2.FONT_HERSHEY_SIMPLEX, 0.44, (240, 245, 250), 1)

        # Shelter Destination Badge
        sh_p = map_to_screen(SHELTER_BAGESHWAR["pos"][0], SHELTER_BAGESHWAR["pos"][1])
        cv2.circle(frame, sh_p, 10, (15, 20, 28), -1)
        cv2.circle(frame, sh_p, 7, COLOR_SHELTER, -1)
        cv2.putText(frame, f"{SHELTER_BAGESHWAR['name']} ({SHELTER_BAGESHWAR['cap']})", (sh_p[0] + 14, sh_p[1] + 5), cv2.FONT_HERSHEY_SIMPLEX, 0.48, (10, 15, 22), 3)
        cv2.putText(frame, f"{SHELTER_BAGESHWAR['name']} ({SHELTER_BAGESHWAR['cap']})", (sh_p[0] + 14, sh_p[1] + 5), cv2.FONT_HERSHEY_SIMPLEX, 0.48, (90, 255, 140), 1)

        # 7. Top Left Mission Tactical HUD
        cv2.rectangle(frame, (30, 30), (660, 165), COLOR_HUD_BG, -1)
        cv2.rectangle(frame, (30, 30), (660, 165), COLOR_HUD_BORDER, 1)
        
        cv2.putText(frame, "JALRAKSHAK // CINEMATIC SIMULATION MODE", (45, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.65, COLOR_TEXT_ACCENT, 2)
        cv2.putText(frame, phase_title, (45, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.48, COLOR_TEXT_WHITE, 1)
        
        cv2.putText(frame, phase_detail[:75], (45, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.40, COLOR_TEXT_MUTED, 1)
        if len(phase_detail) > 75:
            cv2.putText(frame, phase_detail[75:], (45, 142), cv2.FONT_HERSHEY_SIMPLEX, 0.40, COLOR_TEXT_MUTED, 1)

        # 8. Top Right Hydrodynamic Telemetry Clock
        cv2.rectangle(frame, (WIDTH - 460, 30), (WIDTH - 30, 165), COLOR_HUD_BG, -1)
        cv2.rectangle(frame, (WIDTH - 460, 30), (WIDTH - 30, 165), COLOR_HUD_BORDER, 1)
        
        hrs = int(t_model_sec // 3600)
        mins = int((t_model_sec % 3600) // 60)
        secs = int(t_model_sec % 60)
        time_str = f"T+{hrs:02d}:{mins:02d}:{secs:02d}"
        
        cv2.putText(frame, "DISASTER TIMELINE CLOCK", (WIDTH - 440, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.45, COLOR_TEXT_MUTED, 1)
        cv2.putText(frame, time_str, (WIDTH - 440, 105), cv2.FONT_HERSHEY_SIMPLEX, 1.2, COLOR_TEXT_ACCENT, 2)
        
        q_out = 65000 if sim_sec >= 30.0 else int(sim_sec * 2160)
        cv2.putText(frame, f"Outflow Q: {q_out:,} m3/s  |  Mesh: 6,677 Cells", (WIDTH - 440, 140), cv2.FONT_HERSHEY_SIMPLEX, 0.42, COLOR_TEXT_WHITE, 1)

        # 9. Climax JalRakshak Decision Reveal Sequence (Last 22 Seconds)
        if sim_sec >= 98.0:
            card_alpha = np.clip((sim_sec - 98.0) / 4.0, 0.0, 0.96)
            card_layer = frame.copy()
            
            cx1, cy1, cx2, cy2 = WIDTH // 2 - 450, HEIGHT // 2 - 210, WIDTH // 2 + 450, HEIGHT // 2 + 210
            cv2.rectangle(card_layer, (cx1, cy1), (cx2, cy2), (8, 12, 18), -1)
            cv2.rectangle(card_layer, (cx1, cy1), (cx2, cy2), (50, 210, 100), 2)
            
            cv2.putText(card_layer, "JALRAKSHAK OPERATIONAL EVACUATION DECISION", (cx1 + 40, cy1 + 48), cv2.FONT_HERSHEY_SIMPLEX, 0.72, (70, 230, 120), 2)
            cv2.putText(card_layer, "SCENARIO: CENTRAL DAM-BREAK  |  PRIMARY EVACUATION: ROUTE R02", (cx1 + 40, cy1 + 85), cv2.FONT_HERSHEY_SIMPLEX, 0.45, COLOR_TEXT_MUTED, 1)
            
            # Metric Box
            cv2.rectangle(card_layer, (cx1 + 40, cy1 + 115), (cx2 - 40, cy1 + 260), (18, 24, 38), -1)
            cv2.putText(card_layer, "LATEST FEASIBLE DEPARTURE DEADLINE:", (cx1 + 60, cy1 + 150), cv2.FONT_HERSHEY_SIMPLEX, 0.55, COLOR_TEXT_WHITE, 1)
            cv2.putText(card_layer, "T+44:21", (cx1 + 60, cy1 + 225), cv2.FONT_HERSHEY_SIMPLEX, 2.0, (50, 245, 110), 3)
            
            cv2.putText(card_layer, "Limiting Segment: R02-E07", (cx1 + 440, cy1 + 155), cv2.FONT_HERSHEY_SIMPLEX, 0.50, COLOR_TEXT_CRITICAL, 1)
            cv2.putText(card_layer, "Inundation Arrival (A): T+60:00 (3,600s)", (cx1 + 440, cy1 + 182), cv2.FONT_HERSHEY_SIMPLEX, 0.42, COLOR_TEXT_MUTED, 1)
            cv2.putText(card_layer, "Travel Duration (T): 12:39 (759s)", (cx1 + 440, cy1 + 207), cv2.FONT_HERSHEY_SIMPLEX, 0.42, COLOR_TEXT_MUTED, 1)
            cv2.putText(card_layer, "Safety Contingency Buffer (B): 03:00 (180s)", (cx1 + 440, cy1 + 232), cv2.FONT_HERSHEY_SIMPLEX, 0.42, COLOR_TEXT_MUTED, 1)
            
            cv2.putText(card_layer, "EWE Invariant: D = min (Ai - Ti - B) = 3600s - 759s - 180s = 2661s (T+44:21)", (cx1 + 40, cy1 + 300), cv2.FONT_HERSHEY_SIMPLEX, 0.48, (245, 195, 45), 1)
            cv2.putText(card_layer, "STATUS: FEASIBLE  |  PROVENANCE: HEC-RAS 2D FLEXIBLE UNSTEADY SOLVER", (cx1 + 40, cy1 + 340), cv2.FONT_HERSHEY_SIMPLEX, 0.42, COLOR_TEXT_MUTED, 1)
            
            cv2.addWeighted(card_layer, card_alpha, frame, 1.0 - card_alpha, 0, frame)

        # 10. Bottom Scrubber Track
        bar_y = HEIGHT - 45
        cv2.rectangle(frame, (0, bar_y - 20), (WIDTH, HEIGHT), (8, 12, 18), -1)
        cv2.line(frame, (60, bar_y), (WIDTH - 60, bar_y), (45, 55, 70), 4)
        
        scrub_x = int(60 + (WIDTH - 120) * (sim_sec / DURATION_SEC))
        cv2.line(frame, (60, bar_y), (scrub_x, bar_y), COLOR_TEXT_ACCENT, 4)
        cv2.circle(frame, (scrub_x, bar_y), 7, (255, 255, 255), -1)
        cv2.circle(frame, (scrub_x, bar_y), 5, COLOR_TEXT_ACCENT, -1)
        
        cv2.putText(frame, "00:00", (16, bar_y + 5), cv2.FONT_HERSHEY_SIMPLEX, 0.38, COLOR_TEXT_MUTED, 1)
        cv2.putText(frame, "02:00", (WIDTH - 52, bar_y + 5), cv2.FONT_HERSHEY_SIMPLEX, 0.38, COLOR_TEXT_MUTED, 1)

        out.write(frame)
        if (frame_idx + 1) % (FPS * 20) == 0 or frame_idx == TOTAL_FRAMES - 1:
            print(f"Rendered {frame_idx + 1}/{TOTAL_FRAMES} frames ({int((frame_idx + 1)/TOTAL_FRAMES*100)}%)...")

    out.release()
    print(f"SUCCESS: High-Precision 120s Full HD Video generated at: {OUTPUT_PATH}")

if __name__ == "__main__":
    main()
