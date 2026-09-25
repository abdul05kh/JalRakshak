# SCENEVIEW LIFECYCLE & STRICTMODE INTEGRATION

**Document:** SceneView Lifecycle Architecture  
**Version:** RC2.1  
**Status:** ACTIVE  

---

## 1. Lifecycle Invariant: Exactly One Live SceneView

The operational experience requires exactly one active SceneView mounted to the DOM.

```text
React Mount -> Initialize Engine -> Load GLO-30 DSM -> view.when() -> READY
React Unmount -> Abort pending promises -> Engine Teardown -> view.destroy() -> DESTROYED
```

---

## 2. Cancellation-Safe React StrictMode Handling

In React 18 StrictMode, components undergo a synchronous mount-unmount-remount cycle. If asynchronous initialization is not guarded, the first engine's `view.when()` will resolve on a detached DOM node, causing WebGL context leaks or black viewports.

### Guard Implementation:
```ts
useEffect(() => {
  let isMounted = true;
  let activeEngine: ArcGISTerrainEngine | null = null;

  async function init() {
    const engine = new ArcGISTerrainEngine(containerRef.current!, callbacks);
    activeEngine = engine;
    await engine.initialize();
    
    // StrictMode unmount check:
    if (!isMounted) {
      engine.destroy();
      return;
    }
  }

  init();

  return () => {
    isMounted = false;
    if (activeEngine) {
      activeEngine.destroy();
      activeEngine = null;
    }
  };
}, []);
```

---

## 3. DOM Sizing & ResizeObserver

ArcGIS SceneView requires non-zero DOM container dimensions ($>0\text{px}$) to allocate WebGL framebuffers. `ArcGISTerrainEngine` mounts a native `ResizeObserver` on the container to automatically invoke `view.resize()` whenever viewport or layout dimensions shift.
