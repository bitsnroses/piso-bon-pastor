// Map geometry (ADR-003). Metres from the portal, x to the east, y to the south, the same
// equirectangular projection the E7 lab used, so the base drawn by scripts/map_base.py and the
// points from the frontmatter line up.
export const VIEW = { x: -1200, y: -1050, w: 2400, h: 1800 };

// Rings at 66 m/min (4 km/h): with it every measured point falls inside the ring of its minutes
// (ADR-002 §10.8). A design constant, not content.
export const RING_SPEED = 66;

export type LatLon = { lat: number; lon: number };

export function project(p: LatLon, origin: LatLon): [number, number] {
  const kx = Math.cos((origin.lat * Math.PI) / 180) * 111320;
  const ky = 110574;
  return [(p.lon - origin.lon) * kx, -(p.lat - origin.lat) * ky];
}

/** Position inside the map box, in % of its width and height. */
export function toPercent([x, y]: [number, number]): [number, number] {
  return [((x - VIEW.x) / VIEW.w) * 100, ((y - VIEW.y) / VIEW.h) * 100];
}
