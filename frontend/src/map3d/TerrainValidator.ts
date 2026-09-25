/**
 * TerrainValidator.ts
 * Performs client-side validation of 3D terrain geometry, elevation profiles, and ray picking.
 */

import { TerrainLoader } from "./TerrainLoader";
import { AUTHORITATIVE_LANDMARKS } from "./CoordinateTransform";

export interface ValidationReport {
  timestamp: string;
  source: string;
  totalCheckpoints: number;
  maxResidualErrorM: number;
  meanResidualErrorM: number;
  status: "PASS" | "FAIL";
  landmarkChecks: {
    name: string;
    lon: number;
    lat: number;
    expectedElevM: number;
    sampledElevM: number;
    errorM: number;
    status: "PASS" | "FAIL";
  }[];
}

export class TerrainValidator {
  private loader: TerrainLoader;

  constructor() {
    this.loader = TerrainLoader.getInstance();
  }

  public runValidation(): ValidationReport {
    const landmarks = [
      AUTHORITATIVE_LANDMARKS.TEHRI_DAM_CREST,
      AUTHORITATIVE_LANDMARKS.BREACH_INVERT,
      AUTHORITATIVE_LANDMARKS.MALIDEWAL_ORIGIN,
      AUTHORITATIVE_LANDMARKS.LIMITING_EDGE_R02_E07,
      AUTHORITATIVE_LANDMARKS.CHAMBA_SHELTER,
      AUTHORITATIVE_LANDMARKS.DEV_PRAYAG_CONFLUENCE
    ];

    let totalError = 0;
    let maxError = 0;
    const checks = landmarks.map((lm) => {
      const sampled = this.loader.getElevation(lm.lon, lm.lat) ?? 0;
      const error = Math.abs(sampled - lm.elev_m);
      totalError += error;
      if (error > maxError) maxError = error;

      return {
        name: lm.name,
        lon: lm.lon,
        lat: lm.lat,
        expectedElevM: lm.elev_m,
        sampledElevM: sampled,
        errorM: Math.round(error * 100) / 100,
        status: (error < 2.0 ? "PASS" : "FAIL") as "PASS" | "FAIL"
      };
    });

    const meanError = totalError / landmarks.length;
    const pass = maxError < 2.0;

    return {
      timestamp: new Date().toISOString(),
      source: "Copernicus GLO-30 DSM (1-arcsec)",
      totalCheckpoints: landmarks.length,
      maxResidualErrorM: Math.round(maxError * 100) / 100,
      meanResidualErrorM: Math.round(meanError * 100) / 100,
      status: pass ? "PASS" : "FAIL",
      landmarkChecks: checks
    };
  }
}
