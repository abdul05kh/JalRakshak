"""
Terrain-RGB Tile Generator for JalRakshak
Samples the authoritative Copernicus GLO-30 DSM GeoTIFF (EPSG:4326) and generates
Mapbox Terrain-RGB encoded raster DEM tiles for MapLibre GL 3D terrain rendering.

Encoding formula (Mapbox Terrain-RGB):
elevation = -10000 + (R * 256 * 256 + G * 256 + B) * 0.1
"""

import os
import math
import numpy as np
import rasterio
from rasterio.windows import from_bounds
from PIL import Image

RAW_DSM_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "tehri", "raw", "Copernicus_DSM_COG_10_N30_00_E078_00_DEM.tif"))
OUTPUT_TILES_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "terrain-tiles"))

def tile_to_lonlat_bounds(z, x, y):
    """Calculate (min_lon, min_lat, max_lon, max_lat) for slippy map tile (z, x, y)."""
    n = 2.0 ** z
    lon_min = x / n * 360.0 - 180.0
    lat_rad_max = math.atan(math.sinh(math.pi * (1.0 - 2.0 * y / n)))
    lat_max = math.degrees(lat_rad_max)
    
    lon_max = (x + 1) / n * 360.0 - 180.0
    lat_rad_min = math.atan(math.sinh(math.pi * (1.0 - 2.0 * (y + 1) / n)))
    lat_min = math.degrees(lat_rad_min)
    
    return (lon_min, lat_min, lon_max, lat_max)

def deg2num(lat_deg, lon_deg, zoom):
    lat_rad = math.radians(lat_deg)
    n = 2.0 ** zoom
    xtile = int((lon_deg + 180.0) / 360.0 * n)
    ytile = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
    return (xtile, ytile)

def elevation_to_terrain_rgb(elev_array):
    """
    Encode elevation in meters to Terrain-RGB (R, G, B) uint8 arrays.
    elevation = -10000 + (R * 65536 + G * 256 + B) * 0.1
    val = round((elev + 10000) * 10)
    """
    # Clip negative or nodata values safely
    safe_elev = np.clip(elev_array, -500.0, 9000.0)
    val = np.round((safe_elev + 10000.0) * 10.0).astype(np.int64)
    
    r = ((val // 65536) % 256).astype(np.uint8)
    g = ((val // 256) % 256).astype(np.uint8)
    b = (val % 256).astype(np.uint8)
    
    rgb = np.stack([r, g, b], axis=-1)
    return rgb

def generate_tiles():
    if not os.path.exists(RAW_DSM_PATH):
        raise FileNotFoundError(f"Raw DSM not found at {RAW_DSM_PATH}")

    print(f"Opening authoritative Copernicus GLO-30 DSM: {RAW_DSM_PATH}")
    with rasterio.open(RAW_DSM_PATH) as src:
        dsm_bounds = src.bounds
        print(f"DSM Bounds: {dsm_bounds}, CRS: {src.crs}, Resolution: {src.res}")

        # Study area bounds with buffer: Lon [78.20, 78.70], Lat [30.10, 30.50]
        study_lon_min, study_lat_min = 78.20, 30.10
        study_lon_max, study_lat_max = 78.70, 30.50

        total_generated = 0
        for z in range(10, 15):
            min_x, min_y = deg2num(study_lat_max, study_lon_min, z)
            max_x, max_y = deg2num(study_lat_min, study_lon_max, z)
            
            print(f"Generating Zoom {z}: X in [{min_x}..{max_x}], Y in [{min_y}..{max_y}]...")
            for x in range(min_x, max_x + 1):
                for y in range(min_y, max_y + 1):
                    lon_min, lat_min, lon_max, lat_max = tile_to_lonlat_bounds(z, x, y)
                    
                    # Read window from GeoTIFF with 256x256 target dimension
                    window = from_bounds(lon_min, lat_min, lon_max, lat_max, src.transform)
                    elev_data = src.read(
                        1,
                        window=window,
                        out_shape=(256, 256),
                        resampling=rasterio.enums.Resampling.bilinear,
                        fill_value=0.0
                    )
                    
                    # Convert to Terrain-RGB
                    rgb_img_data = elevation_to_terrain_rgb(elev_data)
                    img = Image.fromarray(rgb_img_data, mode="RGB")
                    
                    # Ensure output dir exists
                    tile_dir = os.path.join(OUTPUT_TILES_DIR, str(z), str(x))
                    os.makedirs(tile_dir, exist_ok=True)
                    tile_file = os.path.join(tile_dir, f"{y}.png")
                    img.save(tile_file, format="PNG")
                    total_generated += 1

        print(f"Successfully generated {total_generated} Terrain-RGB tiles in {OUTPUT_TILES_DIR}")

if __name__ == "__main__":
    generate_tiles()
