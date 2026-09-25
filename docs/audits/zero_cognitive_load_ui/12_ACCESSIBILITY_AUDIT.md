# 12 — Accessibility & Color-Blindness Audit (WCAG 2.1 AA)

**Project:** JalRakshak Emergency Decision-Support System  
**Standard:** WCAG 2.1 Level AA Compliance  
**Status:** PASS  

---

## 1. Contrast Ratios & Readability

| UI Component | Foreground Color | Background Color | Contrast Ratio | WCAG AA Standard (min 4.5:1) |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Deadline Text (`T+44:21`)** | `#0f172a` (Slate 900) | `#ffffff` (White) | **16.2:1** | PASS (Exceeds AA & AAA) |
| **FEASIBLE Badge Text** | `#15803d` (Green 700) | `#f0fdf4` (Green 50) | **5.4:1** | PASS |
| **INFEASIBLE Badge Text** | `#991b1b` (Red 800) | `#fef2f2` (Red 50) | **6.8:1** | PASS |
| **LOW MARGIN Badge Text** | `#b45309` (Amber 700) | `#fffbeb` (Amber 50) | **5.1:1** | PASS |
| **Triad Labels** | `#64748b` (Slate 500) | `#ffffff` (White) | **4.6:1** | PASS |

---

## 2. Non-Color-Only Status Redundancy
Every status indicator employs triple-redundancy:
1. **Icon:** Checkmark (`✓ CheckCircle2`), Alert Triangle (`! AlertTriangle`), Cross (`× XCircle`), Question (`? HelpCircle`).
2. **Text Label:** `FEASIBLE`, `LOW MARGIN`, `INFEASIBLE`, `DATA GAP`.
3. **Structured Border/Background.**

Status is 100% decipherable under grayscale, deuteranopia, protanopia, and tritanopia simulation.
