import os
import math
import numpy as np
import cv2

WIDTH = 1920
HEIGHT = 1080
FPS = 24
DURATION_SEC = 90  # 90 seconds continuous full HD movie
TOTAL_FRAMES = FPS * DURATION_SEC

OUTPUT_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "frontend", "public", "simulation", "jalrakshak_cinematic.mp4"
)
os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

# Colors (BGR)
COLOR_BG = (15, 20, 28)
COLOR_TERRAIN_LOW = (35, 45, 40)
COLOR_TERRAIN_MID = (45, 55, 48)
COLOR_TERRAIN_HIGH = (60, 68, 62)
COLOR_RESERVOIR = (180, 120, 30)
COLOR_FLOOD_LOW = (220, 160, 40)
COLOR_FLOOD_MID = (240, 190, 50)
COLOR_FLOOD_DEEP = (255, 210, 60)
COLOR_DAM_BODY = (120, 130, 140)
COLOR_DAM_CREST = (180, 190, 200)
COLOR_ROAD_NORMAL = (100, 110, 120)
COLOR_ROAD_IMPACTED = (60, 70, 230)
COLOR_ROUTE_R02 = (80, 220, 100)
COLOR_LIMITING_SEGMENT = (40, 50, 240)
COLOR_SETTLEMENT = (220, 220, 220)
COLOR_SHELTER = (60, 230, 120)
COLOR_HUD_BG = (20, 26, 38)
COLOR_HUD_BORDER = (80, 120, 160)
COLOR_TEXT_WHITE = (240, 245, 250)
COLOR_TEXT_MUTED = (140, 155, 170)
COLOR_TEXT_ACCENT = (240, 180, 40)
COLOR_TEXT_CRITICAL = (60, 70, 240)

# Waypoints & Entities
RIVER_PATH = [
    (0.18, 0.22), # Reservoir
    (0.25, 0.26), # Dam Breach Invert
    (0.32, 0.32), # Upper Gorge
    (0.40, 0.38), # Malidewal Bend
    (0.48, 0.46), # Tipri Valley
    (0.56, 0.54), # Canyon Narrows
    (0.65, 0.62), # Koteshwar Reach
    (0.74, 0.70), # Lower Bhagirathi
    (0.84, 0.78), # Devprayag Confluence
]

SETTLEMENTS = [
    {"name": "Tehri Dam Crest (830m FRL)", "pos": (0.25, 0.25), "pop": "HQ Control", "arrival_t": 0.0},
    {"name": "Malidewal Settlement", "pos": (0.42, 0.36), "pop": "Pop: 1,420", "arrival_t": 35.0},
    {"name": "Tipri Market Cluster", "pos": (0.50, 0.44), "pop": "Pop: 2,850", "arrival_t": 48.0},
    {"name": "Koteshwar Enclave", "pos": (0.66, 0.60), "pop": "Pop: 980", "arrival_t": 60.0},
]

SHELTER_BAGESHWAR = {"name": "High Shelter S01 (Bageshwar Ridge 1,120m MSL)", "pos": (0.78, 0.32)}

ROUTE_R02_NODES = [
    (0.42, 0.36), # Origin: Malidewal
    (0.45, 0.31), # E01
    (0.50, 0.28), # E02
    (0.56, 0.26), # E03
    (0.62, 0.25), # E04
    (0.68, 0.26), # E05
    (0.72, 0.29), # E06
    (0.76, 0.31), # E07: Limiting Bridge Segment
    (0.78, 0.32), # Destination: Bageshwar Shelter
]

def map_to_screen(nx, ny):
    cx = WIDTH * 0.5
    cy = HEIGHT * 0.5
    iso_x = (nx - 0.5) * WIDTH * 1.15
    iso_y = (ny - 0.5) * HEIGHT * 1.15
    return int(cx + iso_x), int(cy + iso_y)

def build_base_terrain():
    terrain = np.full((HEIGHT, WIDTH, 3), COLOR_BG, dtype=np.uint8)
    grid_rows, grid_cols = 30, 48
    for r in range(grid_rows - 1):
        for c in range(grid_cols - 1):
            nx1, ny1 = c / grid_cols, r / grid_rows
            nx2, ny2 = (c + 1) / grid_cols, (r + 1) / grid_rows
            
            p1 = map_to_screen(nx1, ny1)
            p2 = map_to_screen(nx2, ny1)
            p3 = map_to_screen(nx2, ny2)
            p4 = map_to_screen(nx1, ny2)
            
            dist_to_river = min(math.hypot(nx1 - rx, ny1 - ry) for rx, ry in RIVER_PATH)
            shade = int(np.clip(26 + dist_to_river * 95 + 8 * math.sin(r * 0.4 + c * 0.3), 20, 80))
            poly_color = (shade - 4, shade + 3, shade)
            cv2.fillPoly(terrain, [np.array([p1, p2, p3, p4], dtype=np.int32)], poly_color)
            cv2.polylines(terrain, [np.array([p1, p2, p3, p4], dtype=np.int32)], True, (shade + 12, shade + 18, shade + 14), 1)
            
    # Base reservoir
    res_pts = [
        map_to_screen(0.08, 0.12),
        map_to_screen(0.24, 0.18),
        map_to_screen(0.25, 0.25),
        map_to_screen(0.12, 0.26),
    ]
    cv2.fillPoly(terrain, [np.array(res_pts, dtype=np.int32)], COLOR_RESERVOIR)
    
    # Dam Embankment Line
    dam_p1 = map_to_screen(0.24, 0.20)
    dam_p2 = map_to_screen(0.26, 0.29)
    cv2.line(terrain, dam_p1, dam_p2, COLOR_DAM_BODY, 14)
    cv2.line(terrain, dam_p1, dam_p2, COLOR_DAM_CREST, 6)
    return terrain

def main():
    print(f"Rendering Full HD Cinematic Video ({WIDTH}x{HEIGHT} @ {FPS}fps, {TOTAL_FRAMES} frames)...")
    base_terrain = build_base_terrain()
    
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(OUTPUT_PATH, fourcc, FPS, (WIDTH, HEIGHT))

    for frame_idx in range(TOTAL_FRAMES):
        sim_sec = (frame_idx / TOTAL_FRAMES) * DURATION_SEC
        t_model_min = (sim_sec / DURATION_SEC) * 120.0

        if sim_sec < 15.0:
            scene_phase = "PHASE 1: TEHRI DAM RESERVOIR EQUILIBRIUM"
            phase_detail = "Gross reservoir storage 3,540 MCM at 830.0m Full Reservoir Level (FRL). Dam structure intact."
        elif sim_sec < 30.0:
            progress = (sim_sec - 15.0) / 15.0
            scene_phase = "PHASE 2: DAM BREACH INCEPTION & RELEASE"
            phase_detail = f"Breach opening: Invert 635m, Top Width 182m. Instantaneous Outflow Q = {int(15000 + progress * 50000):,} m3/s."
        elif sim_sec < 55.0:
            progress = (sim_sec - 30.0) / 25.0
            scene_phase = "PHASE 3: HYDRODYNAMIC FLOOD WAVE PROPAGATION"
            phase_detail = f"High-velocity surge traveling through Bhagirathi canyon. Inundation depth h = {4.5 + progress * 5.2:.1f}m."
        elif sim_sec < 72.0:
            scene_phase = "PHASE 4: SETTLEMENT EXPOSURE & ROUTE R02 TRAVERSAL"
            phase_detail = "Malidewal & Tipri low-lying approaches inundated. Evacuation convoys moving along High Ridge Route R02."
        else:
            scene_phase = "PHASE 5: LIMITING SEGMENT CUTOFF & JALRAKSHAK DECISION"
            phase_detail = "Segment R02-E07 inundated at T+60:00 (h >= 0.3m). Departure deadline locked at T+44:21."

        # Blit base terrain
        frame = base_terrain.copy()

        # Dynamic Hydrodynamic Breach & Flood Front Wave Expansion
        flood_progress = np.clip((sim_sec - 2.0) / 65.0, 0.0, 1.0)
        max_flood_step = int(flood_progress * (len(RIVER_PATH) - 1))
        
        if flood_progress > 0:
            flood_poly_points_left = []
            flood_poly_points_right = []
            
            for i in range(max_flood_step + 1):
                rx, ry = RIVER_PATH[i]
                w_factor = 0.024 + 0.018 * math.sin(i * 0.7) + 0.012 * (1.0 - i / len(RIVER_PATH))
                ripple = 0.004 * math.sin(frame_idx * 0.4 + i * 1.2)
                
                pl = map_to_screen(rx - (w_factor + ripple), ry + (w_factor * 0.5))
                pr = map_to_screen(rx + (w_factor + ripple), ry - (w_factor * 0.5))
                
                flood_poly_points_left.append(pl)
                flood_poly_points_right.insert(0, pr)
                
            flood_mesh = flood_poly_points_left + flood_poly_points_right
            if len(flood_mesh) >= 3:
                cv2.fillPoly(frame, [np.array(flood_mesh, dtype=np.int32)], COLOR_FLOOD_DEEP)
                cv2.polylines(frame, [np.array(flood_mesh, dtype=np.int32)], True, (255, 240, 120), 3)

        # Breach opening representation at the dam
        if sim_sec >= 2.0:
            breach_p = map_to_screen(0.25, 0.25)
            breach_radius = int(min((sim_sec - 2.0) * 1.5 + 4, 16))
            cv2.circle(frame, breach_p, breach_radius, (255, 255, 255), -1)
            cv2.circle(frame, breach_p, breach_radius + 3, (100, 200, 255), 2)

        # Draw Road Network & Route R02 Traversal
        for i in range(len(ROUTE_R02_NODES) - 1):
            p1 = map_to_screen(ROUTE_R02_NODES[i][0], ROUTE_R02_NODES[i][1])
            p2 = map_to_screen(ROUTE_R02_NODES[i+1][0], ROUTE_R02_NODES[i+1][1])
            
            is_limiting = (i == len(ROUTE_R02_NODES) - 2)
            seg_color = COLOR_LIMITING_SEGMENT if (is_limiting and sim_sec >= 60.0) else COLOR_ROUTE_R02
            seg_thickness = 7 if (is_limiting and sim_sec >= 60.0) else 5
            
            cv2.line(frame, p1, p2, (30, 40, 50), seg_thickness + 4)
            cv2.line(frame, p1, p2, seg_color, seg_thickness)

        # Directional Evacuation Beacon on Route R02
        if sim_sec >= 45.0:
            beacon_progress = ((sim_sec - 45.0) / 35.0) % 1.0
            beacon_idx = int(beacon_progress * (len(ROUTE_R02_NODES) - 1))
            n1 = ROUTE_R02_NODES[beacon_idx]
            n2 = ROUTE_R02_NODES[min(beacon_idx + 1, len(ROUTE_R02_NODES) - 1)]
            frac = (beacon_progress * (len(ROUTE_R02_NODES) - 1)) - beacon_idx
            bx = n1[0] + (n2[0] - n1[0]) * frac
            by = n1[1] + (n2[1] - n1[1]) * frac
            bp = map_to_screen(bx, by)
            
            pulse_radius = int(8 + 4 * math.sin(frame_idx * 0.6))
            cv2.circle(frame, bp, pulse_radius + 4, (60, 240, 120), 2)
            cv2.circle(frame, bp, pulse_radius, (100, 255, 140), -1)

        # Draw Settlements & Shelters
        for st in SETTLEMENTS:
            sp = map_to_screen(st["pos"][0], st["pos"][1])
            is_inundated = (sim_sec >= st["arrival_t"] + 15.0 and st["arrival_t"] > 0)
            dot_color = COLOR_TEXT_CRITICAL if is_inundated else COLOR_SETTLEMENT
            
            cv2.circle(frame, sp, 6, (20, 20, 20), -1)
            cv2.circle(frame, sp, 5, dot_color, -1)
            
            label_text = f"{st['name']} ({st['pop']})"
            cv2.putText(frame, label_text, (sp[0] + 10, sp[1] + 4), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (20, 20, 20), 3)
            cv2.putText(frame, label_text, (sp[0] + 10, sp[1] + 4), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (230, 235, 240), 1)

        # Shelter Destination Badge
        sh_p = map_to_screen(SHELTER_BAGESHWAR["pos"][0], SHELTER_BAGESHWAR["pos"][1])
        cv2.circle(frame, sh_p, 9, (20, 20, 20), -1)
        cv2.circle(frame, sh_p, 7, COLOR_SHELTER, -1)
        cv2.putText(frame, SHELTER_BAGESHWAR["name"], (sh_p[0] + 12, sh_p[1] + 5), cv2.FONT_HERSHEY_SIMPLEX, 0.50, (20, 20, 20), 3)
        cv2.putText(frame, SHELTER_BAGESHWAR["name"], (sh_p[0] + 12, sh_p[1] + 5), cv2.FONT_HERSHEY_SIMPLEX, 0.50, (100, 255, 160), 1)

        # Top Left Tactical Mission HUD
        cv2.rectangle(frame, (30, 30), (620, 160), COLOR_HUD_BG, -1)
        cv2.rectangle(frame, (30, 30), (620, 160), COLOR_HUD_BORDER, 1)
        
        cv2.putText(frame, "JALRAKSHAK // CINEMATIC SIMULATION", (45, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.65, COLOR_TEXT_ACCENT, 2)
        cv2.putText(frame, scene_phase, (45, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.50, COLOR_TEXT_WHITE, 1)
        
        cv2.putText(frame, phase_detail[:70], (45, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.42, COLOR_TEXT_MUTED, 1)
        if len(phase_detail) > 70:
            cv2.putText(frame, phase_detail[70:], (45, 140), cv2.FONT_HERSHEY_SIMPLEX, 0.42, COLOR_TEXT_MUTED, 1)

        # Top Right Live Hydrodynamic Telemetry Clock
        cv2.rectangle(frame, (WIDTH - 440, 30), (WIDTH - 30, 160), COLOR_HUD_BG, -1)
        cv2.rectangle(frame, (WIDTH - 440, 30), (WIDTH - 30, 160), COLOR_HUD_BORDER, 1)
        
        hrs = int(t_model_min // 60)
        mins = int(t_model_min % 60)
        secs = int((t_model_min * 60) % 60)
        time_str = f"T+{hrs:02d}:{mins:02d}:{secs:02d}"
        
        cv2.putText(frame, "SIMULATION CLOCK", (WIDTH - 420, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.45, COLOR_TEXT_MUTED, 1)
        cv2.putText(frame, time_str, (WIDTH - 420, 100), cv2.FONT_HERSHEY_SIMPLEX, 1.1, COLOR_TEXT_ACCENT, 2)
        
        peak_q = 65000 if sim_sec >= 25.0 else int(sim_sec * 2600)
        cv2.putText(frame, f"Outflow: {peak_q:,} m3/s  |  Grid Cells: 6,677", (WIDTH - 420, 135), cv2.FONT_HERSHEY_SIMPLEX, 0.42, COLOR_TEXT_WHITE, 1)

        # Climax Decision Reveal Overlay Card (Last 15 Seconds)
        if sim_sec >= 74.0:
            card_alpha = np.clip((sim_sec - 74.0) / 3.0, 0.0, 0.95)
            card_overlay = frame.copy()
            
            cx1, cy1, cx2, cy2 = WIDTH // 2 - 420, HEIGHT // 2 - 200, WIDTH // 2 + 420, HEIGHT // 2 + 200
            cv2.rectangle(card_overlay, (cx1, cy1), (cx2, cy2), (10, 14, 22), -1)
            cv2.rectangle(card_overlay, (cx1, cy1), (cx2, cy2), (80, 200, 120), 2)
            
            cv2.putText(card_overlay, "JALRAKSHAK OPERATIONAL EVACUATION DECISION", (cx1 + 40, cy1 + 50), cv2.FONT_HERSHEY_SIMPLEX, 0.70, (80, 220, 120), 2)
            cv2.putText(card_overlay, "SCENARIO: CENTRAL DAM-BREAK  |  ROUTING: ROUTE R02 (HIGH RIDGE)", (cx1 + 40, cy1 + 90), cv2.FONT_HERSHEY_SIMPLEX, 0.45, COLOR_TEXT_MUTED, 1)
            
            cv2.rectangle(card_overlay, (cx1 + 40, cy1 + 120), (cx2 - 40, cy1 + 250), (20, 28, 42), -1)
            cv2.putText(card_overlay, "LATEST FEASIBLE DEPARTURE DEADLINE:", (cx1 + 60, cy1 + 155), cv2.FONT_HERSHEY_SIMPLEX, 0.55, COLOR_TEXT_WHITE, 1)
            cv2.putText(card_overlay, "T+44:21", (cx1 + 60, cy1 + 220), cv2.FONT_HERSHEY_SIMPLEX, 1.8, (60, 240, 120), 3)
            
            cv2.putText(card_overlay, "Limiting Segment: R02-E07", (cx1 + 420, cy1 + 160), cv2.FONT_HERSHEY_SIMPLEX, 0.48, COLOR_TEXT_CRITICAL, 1)
            cv2.putText(card_overlay, "Inundation Arrival (A): T+60:00 (3,600s)", (cx1 + 420, cy1 + 185), cv2.FONT_HERSHEY_SIMPLEX, 0.42, COLOR_TEXT_MUTED, 1)
            cv2.putText(card_overlay, "Traversal Time (T): 12:39 (759s)", (cx1 + 420, cy1 + 208), cv2.FONT_HERSHEY_SIMPLEX, 0.42, COLOR_TEXT_MUTED, 1)
            cv2.putText(card_overlay, "Safety Buffer (B): 03:00 (180s)", (cx1 + 420, cy1 + 231), cv2.FONT_HERSHEY_SIMPLEX, 0.42, COLOR_TEXT_MUTED, 1)
            
            cv2.putText(card_overlay, "EWE Formula: D = min (Ai - Ti - B) = 3600 - 759 - 180 = 2661s (T+44:21)", (cx1 + 40, cy1 + 290), cv2.FONT_HERSHEY_SIMPLEX, 0.48, (240, 190, 50), 1)
            cv2.putText(card_overlay, "STATUS: FEASIBLE  |  PROVENANCE: HEC-RAS 2D FLEXIBLE UNSTEADY MESH", (cx1 + 40, cy1 + 330), cv2.FONT_HERSHEY_SIMPLEX, 0.42, COLOR_TEXT_MUTED, 1)
            
            cv2.addWeighted(card_overlay, card_alpha, frame, 1.0 - card_alpha, 0, frame)

        # Bottom Cinematic Scrubber Timeline Bar
        bar_y = HEIGHT - 50
        cv2.rectangle(frame, (0, bar_y - 20), (WIDTH, HEIGHT), (10, 15, 22), -1)
        cv2.line(frame, (60, bar_y), (WIDTH - 60, bar_y), (50, 60, 75), 4)
        
        scrub_x = int(60 + (WIDTH - 120) * (sim_sec / DURATION_SEC))
        cv2.line(frame, (60, bar_y), (scrub_x, bar_y), COLOR_TEXT_ACCENT, 4)
        cv2.circle(frame, (scrub_x, bar_y), 7, (255, 255, 255), -1)
        cv2.circle(frame, (scrub_x, bar_y), 5, COLOR_TEXT_ACCENT, -1)
        
        cv2.putText(frame, "00:00", (20, bar_y + 5), cv2.FONT_HERSHEY_SIMPLEX, 0.38, COLOR_TEXT_MUTED, 1)
        cv2.putText(frame, "01:30", (WIDTH - 50, bar_y + 5), cv2.FONT_HERSHEY_SIMPLEX, 0.38, COLOR_TEXT_MUTED, 1)

        out.write(frame)
        if (frame_idx + 1) % (FPS * 15) == 0 or frame_idx == TOTAL_FRAMES - 1:
            print(f"Rendered {frame_idx + 1}/{TOTAL_FRAMES} frames ({int((frame_idx + 1)/TOTAL_FRAMES*100)}%)...")

    out.release()
    print(f"SUCCESS: Full HD Cinematic Video generated at: {OUTPUT_PATH}")

if __name__ == "__main__":
    main()
