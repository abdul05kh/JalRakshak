/**
 * CesiumViewer.tsx
 * Pure 3D Geospatial Terrain Viewport for JalRakshak
 * Hosts CesiumJS Viewer + Copernicus GLO-30 DSM terrain engine.
 */

import React, { useEffect, useRef, useState } from "react";
import { TerrainEngine } from "./TerrainEngine";
import { AUTHORITATIVE_CAMERA_PRESETS } from "./CameraController";
import { DEFAULT_LAYER_STATE } from "./LayerController";
import type { Map3DLayerState } from "./LayerController";
import type { RoadFeature, EvacuationPointFeature, RouteAlternative } from "../types";
import { Mountain, MapPin, X } from "lucide-react";

interface CesiumViewerProps {
  inundationGeoJSON: any;
  roads: RoadFeature[];
  evacPoints: EvacuationPointFeature[];
  activeRoute: RouteAlternative | null;
  thematicMode?: "EXTENT" | "DEPTH" | "ARRIVAL";
  selectedTimelineStep?: string;
  cameraPreset?: string;
  selectedEdgeId?: string;
  onSelectEdgeId?: (edgeId: string) => void;
  onSwitchTo2D?: () => void;
}

// Global Instrumentation for Map Lifecycle Stability
if (typeof window !== "undefined") {
  (window as any).__JALRAKSHAK_VIEWER_CREATED_COUNT__ = (window as any).__JALRAKSHAK_VIEWER_CREATED_COUNT__ || 0;
}

export const CesiumViewer: React.FC<CesiumViewerProps> = ({
  inundationGeoJSON,
  roads,
  evacPoints,
  activeRoute: _activeRoute,
  thematicMode = "EXTENT",
  selectedTimelineStep = "T+60",
  cameraPreset = "VALLEY_OVERVIEW",
  selectedEdgeId,
  onSelectEdgeId,
  onSwitchTo2D: _onSwitchTo2D
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<TerrainEngine | null>(null);

  const [cursorInfo, setCursorInfo] = useState<{ lon: number; lat: number; elevation_m: number } | null>(null);
  const [layerState] = useState<Map3DLayerState>({ ...DEFAULT_LAYER_STATE });
  const [pickedEntity, setPickedEntity] = useState<{
    type: string;
    title: string;
    properties: Record<string, any>;
    coordinate: { lon: number; lat: number; elev_m: number };
  } | null>(null);

  // Initialize Cesium 3D Terrain Engine (Strictly once per lifecycle)
  useEffect(() => {
    if (!containerRef.current) return;

    if (typeof window !== "undefined") {
      (window as any).__JALRAKSHAK_VIEWER_CREATED_COUNT__ += 1;
      console.log(`[CesiumViewer] Authoritative 3D Viewer initialized. Lifecycle creation count: ${(window as any).__JALRAKSHAK_VIEWER_CREATED_COUNT__}`);
    }

    const engine = new TerrainEngine(containerRef.current, {
      onCursorMove: (info) => setCursorInfo(info),
      onPickEntity: (info) => {
        setPickedEntity(info);
        if (info.properties.edgeId && onSelectEdgeId) {
          onSelectEdgeId(info.properties.edgeId);
        }
      }
    });

    engine.initialize().then(() => {
      engineRef.current = engine;
      engine.updateData(
        roads,
        evacPoints,
        inundationGeoJSON,
        selectedEdgeId,
        thematicMode,
        selectedTimelineStep
      );
    });

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, []);

  // Dynamically update data, timestep, and thematic mode without recreating viewer
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateData(
        roads,
        evacPoints,
        inundationGeoJSON,
        selectedEdgeId,
        thematicMode,
        selectedTimelineStep
      );
    }
  }, [roads, evacPoints, inundationGeoJSON, selectedEdgeId, thematicMode, selectedTimelineStep]);

  // Handle Camera Preset changes deterministically
  useEffect(() => {
    if (engineRef.current && cameraPreset) {
      let mapped = cameraPreset;
      if (mapped === "OVERVIEW") mapped = "VALLEY_OVERVIEW";
      else if (mapped === "DAM") mapped = "TEHRI_DAM";
      else if (mapped === "BREACH") mapped = "BREACH_LOCATION";
      else if (mapped === "DOWNSTREAM") mapped = "DOWNSTREAM_VALLEY";
      else if (mapped === "ROUTE") mapped = "R02_ROUTE";
      else if (mapped === "LIMITING") mapped = "R02_E07_LIMITING";
      else if (mapped === "SHELTER") mapped = "CHAMBA_SHELTER";

      if (mapped in AUTHORITATIVE_CAMERA_PRESETS) {
        engineRef.current.flyToPreset(mapped as any);
      }
    }
  }, [cameraPreset]);

  // Update Layer State
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setLayerState(layerState);
    }
  }, [layerState]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", backgroundColor: "#090d16", overflow: "hidden", userSelect: "none" }}>
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {/* Road Segment Detail Panel (Section 16 Specification) */}
      {pickedEntity && pickedEntity.properties.edgeId && (
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            right: "16px",
            width: "320px",
            backgroundColor: "rgba(11, 17, 32, 0.95)",
            backdropFilter: "blur(12px)",
            padding: "14px",
            borderRadius: "6px",
            border: pickedEntity.properties.is_limiting ? "1.5px solid #ef4444" : "1px solid rgba(56, 189, 248, 0.3)",
            boxShadow: "0 16px 36px rgba(0,0,0,0.6)",
            zIndex: 850,
            fontSize: "11px",
            color: "#f8fafc",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            fontFamily: "Inter, sans-serif"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "6px" }}>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#ffffff", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "#38bdf8" }}>ROAD SEGMENT</span>
                <span style={{ color: "#94a3b8" }}>{pickedEntity.properties.edgeId}</span>
              </div>
              <div style={{ fontSize: "10px", color: "#cbd5e1", marginTop: "2px" }}>
                {pickedEntity.properties.name || "Koteshwar Riverbank Limiting Segment"}
              </div>
            </div>
            <button
              onClick={() => setPickedEntity(null)}
              style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "2px" }}
            >
              <X size={14} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontFamily: "monospace", fontSize: "11px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#94a3b8" }}>LENGTH:</span>
              <strong style={{ color: "#ffffff" }}>{pickedEntity.properties.length_km ? `${pickedEntity.properties.length_km} km` : "2.1 km"}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#94a3b8" }}>TRAVEL TIME:</span>
              <strong style={{ color: "#fbbf24" }}>{pickedEntity.properties.travel_time || "12:39"}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#94a3b8" }}>FLOOD ARRIVAL:</span>
              <strong style={{ color: "#38bdf8" }}>{pickedEntity.properties.flood_arrival || "T+60:00"}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#94a3b8" }}>MARGIN:</span>
              <strong style={{ color: "#4ade80" }}>{pickedEntity.properties.margin || "+44:21"}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#94a3b8" }}>STATUS:</span>
              <strong style={{ color: pickedEntity.properties.is_limiting ? "#ef4444" : "#38bdf8" }}>
                {pickedEntity.properties.status || "LIMITING"}
              </strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#94a3b8" }}>HYDRAULIC THRESHOLD:</span>
              <span style={{ color: "#cbd5e1" }}>h &ge; 0.30 m</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#94a3b8" }}>TRAVERSAL DIRECTION:</span>
              <span style={{ color: "#cbd5e1", fontSize: "10px" }}>Malidewal &rarr; Chamba</span>
            </div>
          </div>
        </div>
      )}

      {/* Generic Feature Inspection Popup (Dam, Shelter, Terrain) */}
      {pickedEntity && !pickedEntity.properties.edgeId && (
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            right: "16px",
            width: "300px",
            backgroundColor: "rgba(11, 17, 32, 0.95)",
            backdropFilter: "blur(12px)",
            padding: "12px",
            borderRadius: "6px",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow: "0 12px 30px rgba(0,0,0,0.5)",
            zIndex: 850,
            fontSize: "11px",
            color: "#f8fafc",
            display: "flex",
            flexDirection: "column",
            gap: "6px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "4px" }}>
            <span style={{ fontWeight: 800, color: "#ffffff", display: "flex", alignItems: "center", gap: "5px" }}>
              <MapPin size={13} color="#38bdf8" />
              <span>{pickedEntity.title}</span>
            </span>
            <button
              onClick={() => setPickedEntity(null)}
              style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
            >
              <X size={13} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "3px", fontFamily: "monospace", fontSize: "10.5px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#94a3b8" }}>Feature Type:</span>
              <strong style={{ color: "#38bdf8" }}>{pickedEntity.type}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#94a3b8" }}>Elevation:</span>
              <strong style={{ color: "#fbbf24" }}>{pickedEntity.coordinate.elev_m.toFixed(2)} m MSL</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#94a3b8" }}>Coordinates:</span>
              <span style={{ color: "#cbd5e1" }}>{pickedEntity.coordinate.lon.toFixed(4)}°E, {pickedEntity.coordinate.lat.toFixed(4)}°N</span>
            </div>
            {Object.entries(pickedEntity.properties).map(([k, v]) => {
              if (k === "type" || typeof v === "object") return null;
              return (
                <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94a3b8", textTransform: "capitalize" }}>{k.replace("_", " ")}:</span>
                  <span style={{ color: "#cbd5e1" }}>{String(v)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Anchored Compact Map Legend (Section 8 Specification) */}
      <div
        style={{
          position: "absolute",
          bottom: "28px",
          left: "14px",
          backgroundColor: "rgba(11, 17, 32, 0.90)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "5px",
          padding: "6px 10px",
          zIndex: 700,
          color: "#f8fafc",
          fontSize: "10px",
          fontFamily: "Inter, sans-serif"
        }}
      >
        {thematicMode === "DEPTH" && (
          <div>
            <div style={{ fontSize: "9.5px", fontWeight: 800, color: "#94a3b8", letterSpacing: "0.5px", marginBottom: "4px" }}>
              FLOOD DEPTH (h &ge; 0.30m)
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: "#38bdf8", opacity: 0.8 }} />
                <span style={{ color: "#cbd5e1" }}>0.3–1m</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: "#0284c7", opacity: 0.85 }} />
                <span style={{ color: "#cbd5e1" }}>1–3m</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: "#0369a1", opacity: 0.9 }} />
                <span style={{ color: "#cbd5e1" }}>3–6m</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: "#1d4ed8", opacity: 0.9 }} />
                <span style={{ color: "#cbd5e1" }}>6–15m</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: "#312e81", opacity: 0.95 }} />
                <span style={{ color: "#cbd5e1" }}>&gt;15m</span>
              </div>
            </div>
          </div>
        )}

        {thematicMode === "EXTENT" && (
          <div>
            <div style={{ fontSize: "9.5px", fontWeight: 800, color: "#94a3b8", letterSpacing: "0.5px", marginBottom: "3px" }}>
              FLOOD EXTENT FOOTPRINT
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "12px", height: "10px", borderRadius: "2px", backgroundColor: "#0284c7", opacity: 0.6 }} />
              <span style={{ color: "#cbd5e1" }}>Modeled Inundation (h &ge; 0.30 m)</span>
            </div>
          </div>
        )}

        {thematicMode === "ARRIVAL" && (
          <div>
            <div style={{ fontSize: "9.5px", fontWeight: 800, color: "#94a3b8", letterSpacing: "0.5px", marginBottom: "4px" }}>
              FLOOD ARRIVAL ISOCHRONES
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: "#ef4444", opacity: 0.8 }} />
                <span style={{ color: "#cbd5e1" }}>&lt;30m</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: "#f97316", opacity: 0.8 }} />
                <span style={{ color: "#cbd5e1" }}>30–45m</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: "#f59e0b", opacity: 0.8 }} />
                <span style={{ color: "#cbd5e1" }}>45–60m</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: "#0284c7", opacity: 0.8 }} />
                <span style={{ color: "#cbd5e1" }}>60–90m</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Real-time Cursor Terrain Inspection Bar (Top Left sub-badge) */}
      <div
        style={{
          position: "absolute",
          bottom: "6px",
          left: "14px",
          backgroundColor: "rgba(11, 17, 32, 0.8)",
          backdropFilter: "blur(6px)",
          padding: "2px 6px",
          borderRadius: "3px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          zIndex: 700,
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "9px",
          color: "#94a3b8",
          fontFamily: "monospace"
        }}
      >
        <Mountain size={10} color="#38bdf8" />
        {cursorInfo ? (
          <span>
            LAT: <strong style={{ color: "#ffffff" }}>{cursorInfo.lat.toFixed(4)}°N</strong> | LON: <strong style={{ color: "#ffffff" }}>{cursorInfo.lon.toFixed(4)}°E</strong> | ELEV: <strong style={{ color: "#fbbf24" }}>{cursorInfo.elevation_m.toFixed(1)}m</strong>
          </span>
        ) : (
          <span>Copernicus GLO-30 DSM (1-arcsec)</span>
        )}
      </div>
    </div>
  );
};
