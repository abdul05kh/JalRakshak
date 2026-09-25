# 13 — Responsive Viewport & Device Audit

**Project:** JalRakshak Emergency Decision-Support System  
**Viewports Tested:** Desktop (1920x1080), Laptop (1366x768), Tablet (1024x768), Narrow (768x1024)  
**Status:** PASS  

---

## 1. Viewport Adaptation Strategy

| Viewport Category | Layout Mode | Decision Console Width | Map Behavior |
| :--- | :--- | :--- | :--- |
| **Desktop / Laptop ($\ge 1200\text{px}$)** | Split Screen (Console Left/Right + Map Fill) | Fixed 420px column | Interactive Leaflet Viewport (Remaining width) |
| **Tablet ($768\text{px} - 1199\text{px}$)** | Stacked / Collapsible Split | 380px or Stacked Top | Full width below/beside |
| **Narrow Mobile ($< 768\text{px}$)** | Vertical Hierarchy Flow | 100% Width Full Column | Positioned below Level 1/2/3 Decision Cards |

---

## 2. Hierarchy Preservation Under Resizing
On narrow screens, the hierarchy strictly avoids shrinking text to illegibility. The Decision Card (`✓ FEASIBLE`, `LEAVE BY T+44:21`) remains prominently rendered at the top, followed by `[WHY?]`, followed by the Map, followed by Provenance Drawers.
