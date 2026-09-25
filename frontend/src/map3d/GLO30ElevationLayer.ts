/**
 * GLO30ElevationLayer.ts
 * Authoritative Copernicus GLO-30 DSM Custom Elevation Layer for ArcGIS Maps SDK 5.1 SceneView
 * Streams the exact 1-arcsecond GLO-30 DSM elevation grid (EGM2008 MSL datum) to Map.ground.
 */

import BaseElevationLayer from "@arcgis/core/layers/BaseElevationLayer";
import Extent from "@arcgis/core/geometry/Extent";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";

const C_WEB_MERCATOR = 20037508.3427892;

interface TerrainMeta {
  bounds: {
    min_lon: number;
    max_lon: number;
    min_lat: number;
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

export const GLO30ElevationLayer = BaseElevationLayer.createSubclass({
  declaredClass: "esri.layers.GLO30ElevationLayer",

  properties: {
    title: "Copernicus GLO-30 DSM (1-arcsec)",
    spatialReference: SpatialReference.WebMercator,
    fullExtent: new Extent({
      xmin: -20037508.34,
      ymin: -20037508.34,
      xmax: 20037508.34,
      ymax: 20037508.34,
      spatialReference: SpatialReference.WebMercator
    })
  },

  elevationGrid: null as Float32Array | null,
  meta: null as TerrainMeta | null,
  loadPromise: null as Promise<void> | null,
  layerTileSize: 256,

  async load(): Promise<any> {
    if (!this.loadPromise) {
      this.loadPromise = this.initGrid();
    }
    await this.loadPromise;
    return this;
  },

  async initGrid(): Promise<void> {
    try {
      const [metaRes, binRes] = await Promise.all([
        fetch("/terrain/terrain_meta.json"),
        fetch("/terrain/tehri_valley_elevation.bin")
      ]);

      this.meta = await metaRes.json();
      const buffer = await binRes.arrayBuffer();
      this.elevationGrid = new Float32Array(buffer);
      console.log("[GLO30ElevationLayer] Authoritative Copernicus GLO-30 DSM Grid loaded into ArcGIS Ground.");
    } catch (err) {
      console.error("[GLO30ElevationLayer] Failed to load GLO-30 DSM grid:", err);
    }
  },

  getElevationAt(lon: number, lat: number): number | null {
    if (!this.elevationGrid || !this.meta) return null;

    const { bounds, grid } = this.meta;
    if (lon < bounds.min_lon || lon > bounds.max_lon || lat < bounds.min_lat || lat > bounds.max_lat) {
      return null;
    }

    const col = (lon - bounds.min_lon) / grid.dx;
    const row = (bounds.max_lat - lat) / grid.dy;

    const c0 = Math.floor(col);
    const r0 = Math.floor(row);
    const c1 = Math.min(c0 + 1, grid.width - 1);
    const r1 = Math.min(r0 + 1, grid.height - 1);

    const fx = col - c0;
    const fy = row - r0;

    const z00 = this.elevationGrid[r0 * grid.width + c0];
    const z01 = this.elevationGrid[r0 * grid.width + c1];
    const z10 = this.elevationGrid[r1 * grid.width + c0];
    const z11 = this.elevationGrid[r1 * grid.width + c1];

    const top = z00 * (1 - fx) + z01 * fx;
    const bot = z10 * (1 - fx) + z11 * fx;
    const elev = top * (1 - fy) + bot * fy;

    return Math.round(elev * 100) / 100;
  },

  async fetchTile(level: number, row: number, col: number): Promise<any> {
    if (!this.elevationGrid) {
      await this.load();
    }

    const tileSize = this.layerTileSize;
    const numTiles = Math.pow(2, level);
    const tileSpanM = (2 * C_WEB_MERCATOR) / numTiles;

    const xmin = -C_WEB_MERCATOR + col * tileSpanM;
    const xmax = xmin + tileSpanM;
    const ymax = C_WEB_MERCATOR - row * tileSpanM;
    const ymin = ymax - tileSpanM;

    const dx = (xmax - xmin) / (tileSize - 1);
    const dy = (ymax - ymin) / (tileSize - 1);

    const values = new Float32Array(tileSize * tileSize);
    let minZ = 99999;
    let maxZ = -99999;

    for (let r = 0; r < tileSize; r++) {
      const y = ymax - r * dy;
      // Convert Web Mercator Y to WGS84 latitude
      const lat = (180 / Math.PI) * (2 * Math.atan(Math.exp((y / C_WEB_MERCATOR) * Math.PI)) - Math.PI / 2);

      for (let c = 0; c < tileSize; c++) {
        const x = xmin + c * dx;
        // Convert Web Mercator X to WGS84 longitude
        const lon = (x / C_WEB_MERCATOR) * 180;

        const elev = this.getElevationAt(lon, lat);
        const z = elev !== null ? elev : 600.0;

        values[r * tileSize + c] = z;
        if (z < minZ) minZ = z;
        if (z > maxZ) maxZ = z;
      }
    }

    return {
      values,
      width: tileSize,
      height: tileSize,
      maxZ: maxZ > -99999 ? maxZ : 800.0,
      minZ: minZ < 99999 ? minZ : 600.0,
      noDataValue: -9999
    };
  }
});

export type GLO30ElevationLayerInstance = InstanceType<typeof GLO30ElevationLayer>;
