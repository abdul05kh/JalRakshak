/**
 * Authoritative Operational Colors for JalRakshak
 * Aligned with Beige + Light Blue Command Center Design System.
 * Note: 'safe' is aliased strictly to 'feasible' for backwards compatibility,
 * but the authoritative concept is 'feasible' under configured engineering assumptions.
 */

export const OPERATIONAL_COLORS = {
  // Decision & State Colors
  feasible: '#3F7D62', // Restrained Hydrological Forest Green
  safe: '#3F7D62',     // Backwards-compatible alias for feasible (never represents absolute safety)
  lowMargin: '#A97835', // Warm Muted Amber
  caution: '#A97835',
  infeasible: '#A84C4C', // Subdued Brick Red
  critical: '#A84C4C',
  dataGap: '#65747A',   // Slate Gray
  inundated: '#3D8EAE', // Restrained Medium Water Blue

  // Surface & Base Palette
  background: '#F4EFE6',      // Warm Beige
  surface: '#FBF8F2',         // Light Cream Surface
  surfaceAlt: '#EDE7DC',      // Deeper Cream Surface
  border: '#D8D1C5',          // Warm Gray Border
  borderStrong: '#BCB3A4',

  // Head-Up Display (Command Center Overlays)
  hudBackground: 'rgba(251, 248, 242, 0.95)', // Cream with high opacity
  hudBorder: 'rgba(216, 209, 197, 0.85)',
  hudGlow: 'rgba(118, 184, 208, 0.25)',

  // Routes
  routeOptimal: '#3F7D62',
  routeCompromised: '#A84C4C',
  routeLimitingSegment: '#A84C4C',

  // Typography
  textPrimary: '#24343A',
  textSecondary: '#65747A',
  textMuted: '#8A989E',

  // Hydrological Highlights
  waterAccent: '#76B8D0',
  waterDark: '#24566A'
} as const;
