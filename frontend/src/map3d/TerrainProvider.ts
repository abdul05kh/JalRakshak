/**
 * TerrainProvider.ts
 * Implements a high-precision, real 3D Cesium TerrainProvider
 * backed directly by the authoritative Copernicus GLO-30 DSM dataset.
 */

import * as Cesium from "cesium";
import { TerrainLoader } from "./TerrainLoader";

export interface TerrainProviderOptions {
  exaggeration?: number;
  tileResolution?: number; // default 65x65
}

export class JalRakshakTerrainProvider {
  private customProvider: Cesium.CustomHeightmapTerrainProvider | null = null;
  private terrainLoader: TerrainLoader;
  private tilingScheme: Cesium.GeographicTilingScheme;
  private tileResolution: number;

  constructor(options: TerrainProviderOptions = {}) {
    this.terrainLoader = TerrainLoader.getInstance();
    this.tilingScheme = new Cesium.GeographicTilingScheme();
    this.tileResolution = options.tileResolution || 65;
  }

  public async initialize(): Promise<Cesium.TerrainProvider> {
    await this.terrainLoader.load();
    const meta = this.terrainLoader.getMetadata();

    const width = this.tileResolution;
    const height = this.tileResolution;
    const tilingScheme = this.tilingScheme;
    const loader = this.terrainLoader;

    this.customProvider = new Cesium.CustomHeightmapTerrainProvider({
      width,
      height,
      tilingScheme,
      callback: (x: number, y: number, level: number) => {
        const rectangle = tilingScheme.tileXYToRectangle(x, y, level);
        const west = Cesium.Math.toDegrees(rectangle.west);
        const south = Cesium.Math.toDegrees(rectangle.south);
        const east = Cesium.Math.toDegrees(rectangle.east);
        const north = Cesium.Math.toDegrees(rectangle.north);

        const heights = new Float32Array(width * height);
        const lonStep = (east - west) / (width - 1);
        const latStep = (north - south) / (height - 1);

        for (let row = 0; row < height; row++) {
          const lat = north - row * latStep;
          for (let col = 0; col < width; col++) {
            const lon = west + col * lonStep;
            const sampled = loader.getElevation(lon, lat);

            // If inside authoritative dataset, use exact GLO-30 elevation
            // Otherwise use regional mean or graceful boundary clamping
            if (sampled !== null) {
              heights[row * width + col] = sampled;
            } else {
              // Graceful exterior approximation for regional context
              const meanElev = meta ? meta.grid.mean_elev : 1200.0;
              heights[row * width + col] = meanElev;
            }
          }
        }

        return heights;
      }
    });

    console.log("[JalRakshakTerrainProvider] Authoritative Cesium Terrain Provider initialized.");
    return this.customProvider;
  }

  public getProvider(): Cesium.TerrainProvider | null {
    return this.customProvider;
  }
}
