/**
 * MapView.tsx
 * Primary Map Viewport for JalRakshak
 * Hosts the Authoritative 3D Geospatial Terrain Engine (CesiumJS + Copernicus GLO-30 DSM)
 * with optional 2D Cartographic View (MapLibre GL).
 */

import React, { useState } from "react";
import { CesiumViewer } from "../map3d/CesiumViewer";
import type { RoadFeature, EvacuationPointFeature, RouteAlternative, PointQueryResponse } from "../types";
import { Mountain, Layers } from "lucide-react";

export interface CameraPresetConfig {
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
  label: string;
  description: string;
  elevation_m?: number;
}

export const CAMERA_PRESETS: Record<string, CameraPresetConfig> = {
  OVERVIEW: {
    center: [78.475, 30.290],
    zoom: 12.0,
    pitch: 58,
    bearing: 32,
    label: "Valley Overview",
    description: "30km Bhagirathi River Gorge & Tehri Valley Terrain",
    elevation_m: 650.0
  },
  DAM: {
    center: [78.4803, 30.378],
    zoom: 14.5,
    pitch: 60,
    bearing: 18,
    label: "Tehri Dam Crest",
    description: "260.5m Earth & Rockfill Dam Structure (830m Crest)",
    elevation_m: 830.0
  },
  BREACH: {
    center: [78.479, 30.375],
    zoom: 15.5,
    pitch: 65,
    bearing: 45,
    label: "Breach Invert (635m Model Assumption)",
    description: "Modeled Breach Location — Invert 635m MSL Assumption",
    elevation_m: 635.0
  },
  LIMITING: {
    center: [78.502, 30.2825],
    zoom: 14.8,
    pitch: 62,
    bearing: 50,
    label: "Limiting Edge (R02-E07)",
    description: "Koteshwar Riverbank Corridor — Earliest Flood Inundation Point",
    elevation_m: 612.0
  },
  SHELTER: {
    center: [78.3965, 30.3475],
    zoom: 15.0,
    pitch: 55,
    bearing: -20,
    label: "Chamba Shelter (High Ground)",
    description: "Designated Safe Evacuation High-Ground Facility (1650m)",
    elevation_m: 1650.0
  }
};

interface MapViewProps {
  inundationGeoJSON: any;
  roads: RoadFeature[];
  evacPoints: EvacuationPointFeature[];
  activeRoute: RouteAlternative | null;
  mapViewState?: "2D" | "3D" | "SCIENCE";
  thematicMode?: "EXTENT" | "DEPTH" | "ARRIVAL";
  selectedTimelineStep?: string;
  focusLimitingSignal?: number;
  cameraPreset?: string;
  selectedEdgeId?: string;
  onSelectEdgeId?: (edgeId: string) => void;
  layerVisibility?: {
    inundation: boolean;
    roads: boolean;
    origins: boolean;
    destinations: boolean;
  };
  onMapClick?: (lat: number, lon: number) => void;
  pointQueryData?: PointQueryResponse | null;
  showValidationControls?: boolean;
}

export const MapView: React.FC<MapViewProps> = ({
  inundationGeoJSON,
  roads,
  evacPoints,
  activeRoute,
  mapViewState = "3D",
  thematicMode = "EXTENT",
  selectedTimelineStep = "T+60",
  cameraPreset = "VALLEY_OVERVIEW",
  selectedEdgeId,
  onSelectEdgeId
}) => {
  const [currentMode, setCurrentMode] = useState<"3D" | "2D">(
    mapViewState === "2D" ? "2D" : "3D"
  );

  // Translate camera preset key
  let mappedPreset = "VALLEY_OVERVIEW";
  if (cameraPreset === "DAM") mappedPreset = "TEHRI_DAM";
  else if (cameraPreset === "BREACH") mappedPreset = "BREACH_LOCATION";
  else if (cameraPreset === "LIMITING") mappedPreset = "R02_E07_LIMITING";
  else if (cameraPreset === "SHELTER") mappedPreset = "CHAMBA_SHELTER";
  else if (cameraPreset === "DOWNSTREAM") mappedPreset = "DOWNSTREAM_VALLEY";
  else if (cameraPreset === "R02") mappedPreset = "R02_ROUTE";

  if (currentMode === "3D") {
    return (
      <div className="w-full h-full relative">
        <CesiumViewer
          inundationGeoJSON={inundationGeoJSON}
          roads={roads}
          evacPoints={evacPoints}
          activeRoute={activeRoute}
          thematicMode={thematicMode}
          selectedTimelineStep={selectedTimelineStep}
          cameraPreset={mappedPreset}
          selectedEdgeId={selectedEdgeId}
          onSelectEdgeId={onSelectEdgeId}
          onSwitchTo2D={() => setCurrentMode("2D")}
        />
      </div>
    );
  }

  // 2D Cartographic View Fallback
  return (
    <div className="w-full h-full relative bg-slate-900 flex flex-col items-center justify-center text-white">
      <div className="flex flex-col items-center gap-3 p-6 bg-slate-800/90 rounded-xl border border-slate-700 shadow-2xl max-w-md text-center">
        <Layers className="w-10 h-10 text-amber-400" />
        <h3 className="text-lg font-bold">2D Cartographic View Mode</h3>
        <p className="text-xs text-slate-400">
          The primary visualization for JalRakshak is the True 3D Geospatial Terrain Engine. Switch back to 3D to inspect real mountain relief, valley depth, and road-terrain clamping.
        </p>
        <button
          onClick={() => setCurrentMode("3D")}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-cyan-900/50 transition"
        >
          <Mountain className="w-4 h-4" />
          Switch to 3D Terrain Engine
        </button>
      </div>
    </div>
  );
};

export default MapView;
