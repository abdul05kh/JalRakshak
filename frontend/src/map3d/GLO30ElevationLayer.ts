/**
 * GLO30ElevationLayer.ts
 * Authoritative Copernicus GLO-30 DSM Custom Elevation Layer for ArcGIS Maps SDK 5.1 SceneView
 * Streams the exact 1-arcsecond GLO-30 DSM elevation grid (EGM96 / EGM2008 MSL datum) to Map.ground.
 * Strictly adheres to project bounds with zero fake fallbacks (outside points return noDataValue: -9999).
 */

import BaseElevationLayer from "@arcgis/core/layers/BaseElevationLayer";
import Extent from "@arcgis/core/geometry/Extent";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import { updateDiagnostics } from "./Diagnostics";

const C_WEB_MERCATOR = 20037508.3427892;

interface TerrainMeta {
  source: string;
  crs: string;
  projected_crs: string;
  native_resolution_arcsec: number;
  native_resolution_meters: number;
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

function latLonToWebMercator(lat: number, lon: number): { x: number; y: number } {
  const x = (lon / 180) * C_WEB_MERCATOR;
  const rad = (lat * Math.PI) / 180;
  const y = (Math.log(Math.tan(Math.PI / 4 + rad / 2)) / Math.PI) * C_WEB_MERCATOR;
  return { x, y };
}

export const GLO30ElevationLayer = BaseElevationLayer.createSubclass({
  declaredClass: "esri.layers.GLO30ElevationLayer",

  properties: {
    title: "Copernicus GLO-30 DSM (1-arcsec)",
    spatialReference: SpatialReference.WebMercator,
    fullExtent: new Extent({
      xmin: 8705175.76,
      ymin: 3510444.60,
      xmax: 8766399.78,
      ymax: 3574744.15,
      spatialReference: SpatialReference.WebMercator
    })
  },

  elevationGrid: null as Float32Array | null,
  meta: null as TerrainMeta | null,
  loadPromise: null as Promise<void> | null,
  layerTileSize: 256,
  tileCache: new Map<string, any>(),

  async load(): Promise<any> {
    if (!this.loadPromise) {
      this.loadPromise = this.initGrid();
    }
    await this.loadPromise;
    return this;
  },

  async initGrid(): Promise<void> {
    updateDiagnostics((d) => {
      d.terrain.metadataRequested = true;
      d.terrain.binaryRequested = true;
    });

    try {
      const [metaRes, binRes] = await Promise.all([
        fetch("/terrain/terrain_meta.json"),
        fetch("/terrain/tehri_valley_elevation.bin")
      ]);

      if (!metaRes.ok) throw new Error(`HTTP ${metaRes.status} fetching terrain_meta.json`);
      if (!binRes.ok) throw new Error(`HTTP ${binRes.status} fetching tehri_valley_elevation.bin`);

      this.meta = await metaRes.json();
      const buffer = await binRes.arrayBuffer();
      this.elevationGrid = new Float32Array(buffer);

      if (this.meta) {
        const pMin = latLonToWebMercator(this.meta.bounds.min_lat, this.meta.bounds.min_lon);
        const pMax = latLonToWebMercator(this.meta.bounds.max_lat, this.meta.bounds.max_lon);
        this.fullExtent = new Extent({
          xmin: pMin.x,
          ymin: pMin.y,
          xmax: pMax.x,
          ymax: pMax.y,
          spatialReference: SpatialReference.WebMercator
        });
      }

      updateDiagnostics((d) => {
        d.terrain.metadataLoaded = true;
        d.terrain.binaryLoaded = true;
        d.terrain.binaryBytes = buffer.byteLength;
        d.ground.loaded = true;
        d.ground.layerCount = 1;
      });

      console.log(`[GLO30ElevationLayer] Loaded authoritative GLO-30 DSM (${this.elevationGrid.length} points, ${buffer.byteLength} bytes).`);
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      console.error("[GLO30ElevationLayer] Fatal failure loading GLO-30 DSM terrain:", err);
      updateDiagnostics((d) => {
        d.ground.loadError = errMsg;
        d.terrain.tileFailures += 1;
      });
      throw err;
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
    const tileKey = `${level}/${row}/${col}`;
    if (this.tileCache.has(tileKey)) {
      return this.tileCache.get(tileKey);
    }

    if (!this.elevationGrid) {
      await this.load();
    }

    updateDiagnostics((d) => {
      d.terrain.tileRequests += 1;
      d.terrain.lastTile = tileKey;
    });

    const tileSize = this.layerTileSize;
    const numTiles = Math.pow(2, level);
    const tileSpanM = (2 * C_WEB_MERCATOR) / numTiles;

    const xmin = -C_WEB_MERCATOR + col * tileSpanM;
    const xmax = xmin + tileSpanM;
    const ymax = C_WEB_MERCATOR - row * tileSpanM;
    const ymin = ymax - tileSpanM;

    // Fast bounding box intersection test against terrain extent
    if (this.meta) {
      const pMin = latLonToWebMercator(this.meta.bounds.min_lat, this.meta.bounds.min_lon);
      const pMax = latLonToWebMercator(this.meta.bounds.max_lat, this.meta.bounds.max_lon);

      if (xmax < pMin.x || xmin > pMax.x || ymax < pMin.y || ymin > pMax.y) {
        // Tile is completely outside terrain coverage -> Return noDataValue
        const emptyResult = {
          values: new Float32Array(tileSize * tileSize).fill(-9999),
          width: tileSize,
          height: tileSize,
          maxZ: -9999,
          minZ: -9999,
          noDataValue: -9999
        };
        this.tileCache.set(tileKey, emptyResult);
        updateDiagnostics((d) => {
          d.terrain.noDataSamples += tileSize * tileSize;
          d.terrain.tileSuccesses += 1;
        });
        return emptyResult;
      }
    }

    const dx = (xmax - xmin) / (tileSize - 1);
    const dy = (ymax - ymin) / (tileSize - 1);

    const values = new Float32Array(tileSize * tileSize);
    let minZ = 99999;
    let maxZ = -99999;
    let validCount = 0;
    let noDataCount = 0;

    for (let r = 0; r < tileSize; r++) {
      const y = ymax - r * dy;
      // Convert Web Mercator Y to WGS84 latitude
      const lat = (180 / Math.PI) * (2 * Math.atan(Math.exp((y / C_WEB_MERCATOR) * Math.PI)) - Math.PI / 2);

      for (let c = 0; c < tileSize; c++) {
        const x = xmin + c * dx;
        // Convert Web Mercator X to WGS84 longitude
        const lon = (x / C_WEB_MERCATOR) * 180;

        const elev = this.getElevationAt(lon, lat);
        if (elev !== null) {
          values[r * tileSize + c] = elev;
          if (elev < minZ) minZ = elev;
          if (elev > maxZ) maxZ = elev;
          validCount++;
        } else {
          values[r * tileSize + c] = -9999;
          noDataCount++;
        }
      }
    }

    const tileResult = {
      values,
      width: tileSize,
      height: tileSize,
      maxZ: maxZ > -99999 ? maxZ : -9999,
      minZ: minZ < 99999 ? minZ : -9999,
      noDataValue: -9999
    };

    if (this.tileCache.size < 500) {
      this.tileCache.set(tileKey, tileResult);
    }

    updateDiagnostics((d) => {
      d.terrain.tileSuccesses += 1;
      d.terrain.validSamples += validCount;
      d.terrain.noDataSamples += noDataCount;
    });

    return tileResult;
  }
});

export type GLO30ElevationLayerInstance = InstanceType<typeof GLO30ElevationLayer>;
