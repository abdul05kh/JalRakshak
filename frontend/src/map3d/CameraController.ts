/**
 * CameraController.ts
 * Manages 3D geospatial camera movement, smooth transitions, and authoritative presets.
 */

import * as Cesium from "cesium";

export interface CameraPreset {
  id: string;
  name: string;
  description: string;
  destination: {
    longitude: number;
    latitude: number;
    height: number;
  };
  orientation: {
    heading: number; // in degrees
    pitch: number;   // in degrees
    roll: number;    // in degrees
  };
}

export const AUTHORITATIVE_CAMERA_PRESETS: Record<string, CameraPreset> = {
  VALLEY_OVERVIEW: {
    id: "VALLEY_OVERVIEW",
    name: "Valley Overview",
    description: "Regional view of Tehri Gorge, Bhagirathi River, and mountain topography",
    destination: {
      longitude: 78.4750,
      latitude: 30.2900,
      height: 12500.0
    },
    orientation: {
      heading: 355.0,
      pitch: -38.0,
      roll: 0.0
    }
  },
  TEHRI_DAM: {
    id: "TEHRI_DAM",
    name: "Tehri Dam Crest",
    description: "260.5m Earth and rockfill dam structure (830m MSL crest)",
    destination: {
      longitude: 78.4803,
      latitude: 30.3620,
      height: 2800.0
    },
    orientation: {
      heading: 0.0,
      pitch: -32.0,
      roll: 0.0
    }
  },
  BREACH_LOCATION: {
    id: "BREACH_LOCATION",
    name: "Breach Location",
    description: "Modeled dam breach invert location (635m MSL Assumption)",
    destination: {
      longitude: 78.4790,
      latitude: 30.3680,
      height: 1800.0
    },
    orientation: {
      heading: 10.0,
      pitch: -35.0,
      roll: 0.0
    }
  },
  DOWNSTREAM_VALLEY: {
    id: "DOWNSTREAM_VALLEY",
    name: "Downstream Valley",
    description: "Bhagirathi river gorge between Tehri and Koteshwar",
    destination: {
      longitude: 78.4850,
      latitude: 30.3300,
      height: 5200.0
    },
    orientation: {
      heading: 165.0,
      pitch: -35.0,
      roll: 0.0
    }
  },
  R02_ROUTE: {
    id: "R02_ROUTE",
    name: "R02 Evacuation Route",
    description: "Primary evacuation corridor traversing steep valley terrain",
    destination: {
      longitude: 78.4850,
      latitude: 30.3100,
      height: 6500.0
    },
    orientation: {
      heading: 330.0,
      pitch: -42.0,
      roll: 0.0
    }
  },
  R02_E07_LIMITING: {
    id: "R02_E07_LIMITING",
    name: "R02-E07 Limiting Segment",
    description: "Critical riverbank bottleneck near Koteshwar (9.0 min flood arrival)",
    destination: {
      longitude: 78.5020,
      latitude: 30.2720,
      height: 1900.0
    },
    orientation: {
      heading: 350.0,
      pitch: -32.0,
      roll: 0.0
    }
  },
  CHAMBA_SHELTER: {
    id: "CHAMBA_SHELTER",
    name: "Chamba Safe Shelter",
    description: "High-ground ridge safe haven at 1648m MSL",
    destination: {
      longitude: 78.3965,
      latitude: 30.3320,
      height: 2600.0
    },
    orientation: {
      heading: 5.0,
      pitch: -36.0,
      roll: 0.0
    }
  }
};

export class CameraController {
  private viewer: Cesium.Viewer;

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
  }

  public flyToPreset(presetKey: keyof typeof AUTHORITATIVE_CAMERA_PRESETS, duration: number = 2.0): void {
    const preset = AUTHORITATIVE_CAMERA_PRESETS[presetKey];
    if (!preset) return;

    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        preset.destination.longitude,
        preset.destination.latitude,
        preset.destination.height
      ),
      orientation: {
        heading: Cesium.Math.toRadians(preset.orientation.heading),
        pitch: Cesium.Math.toRadians(preset.orientation.pitch),
        roll: Cesium.Math.toRadians(preset.orientation.roll)
      },
      duration
    });
  }

  public flyToCoordinate(lon: number, lat: number, height: number = 3000.0, pitchDeg: number = -45.0, duration: number = 1.8): void {
    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
      orientation: {
        heading: this.viewer.camera.heading,
        pitch: Cesium.Math.toRadians(pitchDeg),
        roll: 0.0
      },
      duration
    });
  }

  public getCameraState(): {
    longitude: number;
    latitude: number;
    height: number;
    headingDeg: number;
    pitchDeg: number;
    rollDeg: number;
  } {
    const cartographic = Cesium.Cartographic.fromCartesian(this.viewer.camera.position);
    return {
      longitude: Math.round(Cesium.Math.toDegrees(cartographic.longitude) * 1e5) / 1e5,
      latitude: Math.round(Cesium.Math.toDegrees(cartographic.latitude) * 1e5) / 1e5,
      height: Math.round(cartographic.height),
      headingDeg: Math.round(Cesium.Math.toDegrees(this.viewer.camera.heading)),
      pitchDeg: Math.round(Cesium.Math.toDegrees(this.viewer.camera.pitch)),
      rollDeg: Math.round(Cesium.Math.toDegrees(this.viewer.camera.roll))
    };
  }
}
