/**
 * LayerController.ts
 * Manages layer states, lighting, basemaps, and visibility toggles.
 */

export interface Map3DLayerState {
  terrain: boolean;
  lighting: boolean;
  basemap: boolean;
  river: boolean;
  reservoir: boolean;
  dam: boolean;
  breach: boolean;
  allRoads: boolean;
  r02Route: boolean;
  limitingSegment: boolean;
  shelters: boolean;
  origins: boolean;
  hecRasMesh: boolean;
  floodInundation: boolean;
  thematicMode: "EXTENT" | "DEPTH" | "ARRIVAL";
  verticalExaggeration: number; // 1.0 or 1.5
}

export const DEFAULT_LAYER_STATE: Map3DLayerState = {
  terrain: true,
  lighting: true,
  basemap: true,
  river: true,
  reservoir: true,
  dam: true,
  breach: true,
  allRoads: true,
  r02Route: true,
  limitingSegment: true,
  shelters: true,
  origins: true,
  hecRasMesh: false,
  floodInundation: true,
  thematicMode: "EXTENT",
  verticalExaggeration: 1.0
};
