/**
 * Stage 1 geometry, in stage-local pixels (0,0 = top-left of the 192x189 artwork).
 *
 * Measured from the artwork: each girder's top surface was traced column by column and
 * the four sloped ones fit a straight line to within ~1px. y grows downward, so a
 * girder whose y1 > y0 slopes down to the right (barrels roll right on it).
 */
export interface Girder {
  x0: number;
  x1: number;
  /** Surface height at x0 and x1. */
  y0: number;
  y1: number;
  /** Direction barrels roll on a flat girder. */
  flatDir?: -1 | 1;
  /** Mario can't walk left of this (the oil drum blocks the floor). */
  walkMinX?: number;
}

export interface Ladder {
  x: number;
  /** Indices into GIRDERS: the girder at the top and the girder at the bottom. */
  upper: number;
  lower: number;
}

export const GIRDERS: readonly Girder[] = [
  { x0: 0, x1: 95, y0: 0, y1: 0 }, // 0: top platform (Kong, Pauline)
  { x0: 0, x1: 175, y0: 32, y1: 32, flatDir: 1 }, // 1
  { x0: 16, x1: 191, y0: 66, y1: 59 }, // 2
  { x0: 0, x1: 175, y0: 90, y1: 97 }, // 3
  { x0: 16, x1: 191, y0: 129, y1: 121 }, // 4
  { x0: 0, x1: 175, y0: 153, y1: 160 }, // 5
  { x0: 0, x1: 191, y0: 184, y1: 184, flatDir: -1, walkMinX: 28 }, // 6: floor
];

export const FLOOR = GIRDERS.length - 1;
export const TOP_PLATFORM = 0;

/** Oil drum: barrels reaching the floor at or left of this x are gone. */
export const OIL_DRUM_X = 24;

/**
 * Ladders Mario can climb. Broken ladders are not climbable: the two in the artwork
 * (x=68 and x=140) are deliberately not listed. The ladders at x=84 (floor) and x=92
 * (under the top girder) are the only links between their girders, so they are drawn
 * whole in assets-src/arcade-style.png.
 */
export const LADDERS: readonly Ladder[] = [
  { x: 4, upper: 0, lower: 1 },
  { x: 92, upper: 0, lower: 1 },
  { x: 92, upper: 1, lower: 2 },
  { x: 36, upper: 2, lower: 3 },
  { x: 76, upper: 2, lower: 3 },
  { x: 116, upper: 3, lower: 4 },
  { x: 156, upper: 3, lower: 4 },
  { x: 36, upper: 4, lower: 5 },
  { x: 100, upper: 4, lower: 5 },
  { x: 84, upper: 5, lower: 6 },
];

/** Where Kong and Pauline stand on the top platform. */
export const KONG_BOX = { l: 2, r: 42, t: -24, b: 0 } as const;
export const KONG_HAND = { x: 46, y: -12 } as const;
export const PAULINE_X = 78;

export function surfaceY(g: Girder, x: number): number {
  const t = (x - g.x0) / (g.x1 - g.x0);
  return g.y0 + (g.y1 - g.y0) * Math.min(1, Math.max(0, t));
}

export function ladderTopY(l: Ladder): number {
  return surfaceY(GIRDERS[l.upper], l.x);
}

export function ladderBottomY(l: Ladder): number {
  return surfaceY(GIRDERS[l.lower], l.x);
}

/** Direction a barrel rolls once it lands on this girder. */
export function rollDirection(g: Girder): -1 | 1 {
  const slope = g.y1 - g.y0;
  if (slope > 0) return 1;
  if (slope < 0) return -1;
  return g.flatDir ?? 1;
}

/**
 * The topmost girder whose surface something falling from prevY to y at column x
 * crosses on this step, or -1. `minIndex` lets barrels ignore the top platform.
 */
export function landingGirder(x: number, prevY: number, y: number, minIndex = 0): number {
  let best = -1;
  let bestY = Infinity;
  for (let i = minIndex; i < GIRDERS.length; i++) {
    const g = GIRDERS[i];
    if (x < g.x0 || x > g.x1) continue;
    const s = surfaceY(g, x);
    if (prevY <= s + 0.01 && y >= s && s < bestY) {
      best = i;
      bestY = s;
    }
  }
  return best;
}
