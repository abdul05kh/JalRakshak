/**
 * ArcGISCameraController.ts
 * Authoritative 3D Camera Preset Controller for ArcGIS Maps SDK 5.1 SceneView
 */

import type SceneView from "@arcgis/core/views/SceneView";
import Point from "@arcgis/core/geometry/Point";

export interface CameraPresetConfig {
  target: [number, number]; // [lon, lat]
  heading: number; // degrees
  tilt: number; // degrees
  scale?: number;
  position: {
    longitude: number;
    latitude: number;
    z: number; // elevation MSL (meters)
  };
  label: string;
  description: string;
}

export const AUTHORITATIVE_CAMERA_PRESETS: Record<string, CameraPresetConfig> = {
  VALLEY_OVERVIEW: {
    target: [78.480, 30.310],
    heading: 20,
    tilt: 45,
    position: {
      longitude: 78.445,
      latitude: 30.220,
      z: 4200
    },
    label: "Tehri Valley Overview",
    description: "30km Bhagirathi River Gorge & Valley 3D Terrain"
  },
  TEHRI_DAM: {
    target: [78.4803, 30.3780],
    heading: 15,
    tilt: 50,
    position: {
      longitude: 78.468,
      latitude: 30.345,
      z: 2200
    },
    label: "Tehri Dam Crest",
    description: "260.5m Earth & Rockfill Dam Structure (830m Crest MSL)"
  },
  BREACH_LOCATION: {
    target: [78.4790, 30.3750],
    heading: 25,
    tilt: 48,
    position: {
      longitude: 78.465,
      latitude: 30.340,
      z: 2100
    },
    label: "Breach Invert (635m Model Assumption)",
    description: "Modeled Crest Failure — Invert 635m MSL Assumption"
  },
  DOWNSTREAM_VALLEY: {
    target: [78.495, 30.310],
    heading: 140,
    tilt: 50,
    position: {
      longitude: 78.465,
      latitude: 30.355,
      z: 2800
    },
    label: "Downstream Alluvial Corridor",
    description: "Bhagirathi Gorge downstream expansion reach"
  },
  R02_ROUTE: {
    target: [78.485, 30.320],
    heading: 65,
    tilt: 45,
    position: {
      longitude: 78.435,
      latitude: 30.300,
      z: 3400
    },
    label: "Route R02 Evacuation Corridor",
    description: "Malidewal to Koteshwar / Chamba corridor"
  },
  R02_E07_LIMITING: {
    target: [78.502, 30.2825],
    heading: 35,
    tilt: 45,
    position: {
      longitude: 78.480,
      latitude: 30.255,
      z: 2000
    },
    label: "Limiting Segment R02-E07",
    description: "Koteshwar Riverbank Limiting Bottleneck (Arrival T+60:00)"
  },
  CHAMBA_SHELTER: {
    target: [78.3965, 30.3475],
    heading: 30,
    tilt: 45,
    position: {
      longitude: 78.375,
      latitude: 30.315,
      z: 3200
    },
    label: "Chamba High-Ground Shelter",
    description: "Designated High-Ground Evacuation Facility (1650m MSL)"
  }
};

export class ArcGISCameraController {
  private view: SceneView;

  constructor(view: SceneView) {
    this.view = view;
  }

  public flyToPreset(presetKey: keyof typeof AUTHORITATIVE_CAMERA_PRESETS, duration: number = 1500): Promise<void> {
    const preset = AUTHORITATIVE_CAMERA_PRESETS[presetKey];
    if (!preset) return Promise.resolve();

    const cameraPos = new Point({
      longitude: preset.position.longitude,
      latitude: preset.position.latitude,
      z: preset.position.z
    });

    const targetPos = new Point({
      longitude: preset.target[0],
      latitude: preset.target[1],
      z: 650.0
    });

    return this.view.goTo(
      {
        target: targetPos,
        position: cameraPos,
        heading: preset.heading,
        tilt: preset.tilt
      },
      {
        duration,
        easing: "ease-in-out"
      }
    ).catch((err) => {
      if (err.name !== "AbortError") {
        console.warn("[ArcGISCameraController] goTo error:", err);
      }
    });
  }

  public getCameraState() {
    const cam = this.view.camera;
    return {
      longitude: cam.position.longitude,
      latitude: cam.position.latitude,
      height: cam.position.z,
      headingDeg: cam.heading,
      tiltDeg: cam.tilt
    };
  }
}
