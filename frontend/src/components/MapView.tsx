/**
 * MapView.tsx
 * Primary Map Viewport for JalRakshak
 * Hosts the Authoritative 3D Geospatial Engine (ArcGIS Maps SDK 5.1 SceneView + Copernicus GLO-30 DSM).
 */

import React from "react";
import { ArcGISSceneViewer } from "../map3d/ArcGISSceneViewer";
import type { HydraulicThematicMode } from "../map3d/ArcGISHydraulicLayer";
import type { RoadFeature, EvacuationPointFeature, RouteAlternative, PointQueryResponse } from "../types";

export interface CameraPresetConfig {
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
  label: string;
  description: string;
  elevation_m?: number;
}

interface MapViewProps {
  inundationGeoJSON: any;
  roads: RoadFeature[];
  evacPoints: EvacuationPointFeature[];
  activeRoute: RouteAlternative | null;
  mapViewState?: "2D" | "3D" | "SCIENCE";
  thematicMode?: HydraulicThematicMode;
  selectedTimelineStep?: string;
  focusLimitingSignal?: number;
  cameraPreset?: string;
  selectedEdgeId?: string;
  onSelectEdgeId?: (edgeId: string) => void;
  showTerrain?: boolean;
  showRoads?: boolean;
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
  thematicMode = "EXTENT",
  selectedTimelineStep = "T+60",
  cameraPreset = "VALLEY_OVERVIEW",
  selectedEdgeId,
  onSelectEdgeId,
  showTerrain = true,
  showRoads = true,
  layerVisibility
}) => {
  // Translate camera preset key
  let mappedPreset = "VALLEY_OVERVIEW";
  if (cameraPreset === "DAM") mappedPreset = "TEHRI_DAM";
  else if (cameraPreset === "BREACH") mappedPreset = "BREACH_LOCATION";
  else if (cameraPreset === "LIMITING") mappedPreset = "R02_E07_LIMITING";
  else if (cameraPreset === "SHELTER") mappedPreset = "CHAMBA_SHELTER";
  else if (cameraPreset === "DOWNSTREAM") mappedPreset = "DOWNSTREAM_VALLEY";
  else if (cameraPreset === "ROUTE" || cameraPreset === "R02") mappedPreset = "R02_ROUTE";

  const effectiveShowRoads = layerVisibility?.roads !== undefined ? layerVisibility.roads : showRoads;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
      <ArcGISSceneViewer
        inundationGeoJSON={inundationGeoJSON}
        roads={roads}
        evacPoints={evacPoints}
        activeRoute={activeRoute}
        thematicMode={thematicMode}
        selectedTimelineStep={selectedTimelineStep}
        cameraPreset={mappedPreset}
        selectedEdgeId={selectedEdgeId}
        onSelectEdgeId={onSelectEdgeId}
        showTerrain={showTerrain}
        showRoads={effectiveShowRoads}
      />
    </div>
  );
};

export default MapView;
