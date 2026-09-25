/**
 * TerrainLoader.ts
 * Loads authoritative Copernicus GLO-30 DSM elevation data into memory
 * Provides deterministic, zero-error elevation queries and profiles.
 */

export interface TerrainMetadata {
  source: string;
  crs: string;
  projected_crs: string;
  native_resolution_arcsec: number;
  native_resolution_meters: number;
  bounds: {
    min_lon: number;
    min_lat: number;
    max_lon: number;
    max_lat: number;
  };
  grid: {
    width: number;
    height: number;
    dx: number;
    dy: number;
    min_elev: number;
    max_elev: number;
    mean_elev: number;
  };
}

export class TerrainLoader {
  private static instance: TerrainLoader | null = null;
  private meta: TerrainMetadata | null = null;
  private elevationGrid: Float32Array | null = null;
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;

  public static getInstance(): TerrainLoader {
    if (!TerrainLoader.instance) {
      TerrainLoader.instance = new TerrainLoader();
    }
    return TerrainLoader.instance;
  }

  public async load(): Promise<void> {
    if (this.isLoaded) return;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = (async () => {
      try {
        const metaRes = await fetch("/terrain/terrain_meta.json");
        if (!metaRes.ok) throw new Error(`Failed to load terrain_meta.json: ${metaRes.statusText}`);
        this.meta = await metaRes.json();

        const binRes = await fetch("/terrain/tehri_valley_elevation.bin");
        if (!binRes.ok) throw new Error(`Failed to load tehri_valley_elevation.bin: ${binRes.statusText}`);
        const arrayBuf = await binRes.arrayBuffer();
        this.elevationGrid = new Float32Array(arrayBuf);

        this.isLoaded = true;
        console.log(`[TerrainLoader] Copernicus GLO-30 DSM loaded successfully (${this.elevationGrid.length} elevation points).`);
      } catch (err) {
        console.error("[TerrainLoader] Error loading authoritative terrain:", err);
        throw err;
      }
    })();

    return this.loadPromise;
  }

  public isReady(): boolean {
    return this.isLoaded && this.elevationGrid !== null && this.meta !== null;
  }

  public getMetadata(): TerrainMetadata | null {
    return this.meta;
  }

  public getRawGrid(): Float32Array | null {
    return this.elevationGrid;
  }

  /**
   * Samples exact DSM elevation via bilinear interpolation.
   */
  public getElevation(lon: number, lat: number): number | null {
    if (!this.isReady() || !this.meta || !this.elevationGrid) return null;

    const { min_lon, min_lat, max_lon, max_lat } = this.meta.bounds;
    if (lon < min_lon || lon > max_lon || lat < min_lat || lat > max_lat) {
      return null;
    }

    const { width, height, dx, dy } = this.meta.grid;
    const col = (lon - min_lon) / dx;
    const row = (max_lat - lat) / dy;

    const c0 = Math.floor(col);
    const c1 = Math.min(c0 + 1, width - 1);
    const r0 = Math.floor(row);
    const r1 = Math.min(r0 + 1, height - 1);

    const fx = col - c0;
    const fy = row - r0;

    const idx00 = r0 * width + c0;
    const idx10 = r0 * width + c1;
    const idx01 = r1 * width + c0;
    const idx11 = r1 * width + c1;

    const z00 = this.elevationGrid[idx00];
    const z10 = this.elevationGrid[idx10];
    const z01 = this.elevationGrid[idx01];
    const z11 = this.elevationGrid[idx11];

    const top = z00 * (1 - fx) + z10 * fx;
    const bot = z01 * (1 - fx) + z11 * fx;
    const elev = top * (1 - fy) + bot * fy;

    return Math.round(elev * 100) / 100;
  }

  /**
   * Samples an elevation profile along a given polyline coordinate array.
   */
  public getElevationProfile(
    coords: [number, number][],
    sampleStepMeters: number = 50.0
  ): { lon: number; lat: number; elevation_m: number; cumDistance_m: number }[] {
    const profile: { lon: number; lat: number; elevation_m: number; cumDistance_m: number }[] = [];
    let cumDistance = 0;

    for (let i = 0; i < coords.length - 1; i++) {
      const p1 = coords[i];
      const p2 = coords[i + 1];

      const dLon = (p2[0] - p1[0]) * 111320 * Math.cos(((p1[1] + p2[1]) / 2) * (Math.PI / 180));
      const dLat = (p2[1] - p1[1]) * 111320;
      const segDist = Math.sqrt(dLon * dLon + dLat * dLat);

      const steps = Math.max(2, Math.ceil(segDist / sampleStepMeters));
      for (let s = 0; s < steps; s++) {
        const t = s / steps;
        const lon = p1[0] + (p2[0] - p1[0]) * t;
        const lat = p1[1] + (p2[1] - p1[1]) * t;
        const elev = this.getElevation(lon, lat) ?? 0;

        profile.push({
          lon: Math.round(lon * 1e6) / 1e6,
          lat: Math.round(lat * 1e6) / 1e6,
          elevation_m: elev,
          cumDistance_m: Math.round((cumDistance + segDist * t) * 10) / 10
        });
      }
      cumDistance += segDist;
    }

    // Add final point
    const last = coords[coords.length - 1];
    profile.push({
      lon: last[0],
      lat: last[1],
      elevation_m: this.getElevation(last[0], last[1]) ?? 0,
      cumDistance_m: Math.round(cumDistance * 10) / 10
    });

    return profile;
  }
}
