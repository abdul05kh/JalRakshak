/**
 * Diagnostics.ts
 * Real-time diagnostic state tracker for JalRakshak 3D Geospatial Engine
 * Exposes window.__JALRAKSHAK_DIAGNOSTICS__ for comprehensive forensic monitoring.
 */

export interface JalRakshakDiagnostics {
  timestamp: string;
  environment: string;
  buildMode: string;

  container: {
    width: number;
    height: number;
    clientWidth: number;
    clientHeight: number;
    devicePixelRatio: number;
  };

  webgl: {
    supported: boolean;
    renderer: string;
    vendor: string;
    version: string;
  };

  sceneView: {
    created: boolean;
    ready: boolean;
    destroyed: boolean;
    updating: boolean;
    width: number;
    height: number;
    fatalError: string | null;
  };

  map: {
    created: boolean;
    loaded: boolean;
    basemapStatus: string;
  };

  ground: {
    created: boolean;
    loaded: boolean;
    visible: boolean;
    layerCount: number;
    loadError: string | null;
  };

  terrain: {
    metadataRequested: boolean;
    metadataLoaded: boolean;
    binaryRequested: boolean;
    binaryLoaded: boolean;
    binaryBytes: number;
    tileRequests: number;
    tileSuccesses: number;
    tileFailures: number;
    noDataSamples: number;
    validSamples: number;
    lastTile: string | null;
  };

  hydraulics: {
    sourceLoaded: boolean;
    featureCount: number;
    visibleFeatureCount: number;
  };

  roads: {
    sourceLoaded: boolean;
    featureCount: number;
    renderedFeatureCount: number;
  };

  infrastructure: {
    renderedFeatureCount: number;
  };
}

export function createInitialDiagnostics(): JalRakshakDiagnostics {
  let webglInfo = {
    supported: false,
    renderer: "UNKNOWN",
    vendor: "UNKNOWN",
    version: "UNKNOWN"
  };

  if (typeof document !== "undefined") {
    try {
      const canvas = document.createElement("canvas");
      const gl = (canvas.getContext("webgl2") || canvas.getContext("webgl")) as WebGLRenderingContext | null;
      if (gl) {
        webglInfo.supported = true;
        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        if (debugInfo) {
          webglInfo.vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || "UNKNOWN";
          webglInfo.renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "UNKNOWN";
        }
        webglInfo.version = gl.getParameter(gl.VERSION) || "UNKNOWN";
      }
    } catch (e) {
      console.warn("[Diagnostics] WebGL probing failed:", e);
    }
  }

  return {
    timestamp: new Date().toISOString(),
    environment: typeof window !== "undefined" ? "browser" : "node",
    buildMode: import.meta.env?.MODE || "development",

    container: {
      width: 0,
      height: 0,
      clientWidth: 0,
      clientHeight: 0,
      devicePixelRatio: typeof window !== "undefined" ? window.devicePixelRatio : 1
    },

    webgl: webglInfo,

    sceneView: {
      created: false,
      ready: false,
      destroyed: false,
      updating: false,
      width: 0,
      height: 0,
      fatalError: null
    },

    map: {
      created: false,
      loaded: false,
      basemapStatus: "NOT_INITIALIZED"
    },

    ground: {
      created: false,
      loaded: false,
      visible: true,
      layerCount: 0,
      loadError: null
    },

    terrain: {
      metadataRequested: false,
      metadataLoaded: false,
      binaryRequested: false,
      binaryLoaded: false,
      binaryBytes: 0,
      tileRequests: 0,
      tileSuccesses: 0,
      tileFailures: 0,
      noDataSamples: 0,
      validSamples: 0,
      lastTile: null
    },

    hydraulics: {
      sourceLoaded: false,
      featureCount: 0,
      visibleFeatureCount: 0
    },

    roads: {
      sourceLoaded: false,
      featureCount: 0,
      renderedFeatureCount: 0
    },

    infrastructure: {
      renderedFeatureCount: 0
    }
  };
}

// Global initialization
if (typeof window !== "undefined") {
  (window as any).__JALRAKSHAK_DIAGNOSTICS__ = (window as any).__JALRAKSHAK_DIAGNOSTICS__ || createInitialDiagnostics();
}

export function updateDiagnostics(updater: (diag: JalRakshakDiagnostics) => void): void {
  if (typeof window !== "undefined") {
    const diag = (window as any).__JALRAKSHAK_DIAGNOSTICS__ as JalRakshakDiagnostics;
    if (diag) {
      updater(diag);
      diag.timestamp = new Date().toISOString();
    }
  }
}
