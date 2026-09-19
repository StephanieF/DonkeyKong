import { BARREL_SPEED, GRAVITY } from "./constants";
import { GIRDERS, KONG_HAND, landingGirder, OIL_DRUM_X, FLOOR, rollDirection, surfaceY } from "./stage1";

/** A barrel in stage-local pixels; (x, y) is the point at the bottom centre. */
export interface Barrel {
  x: number;
  y: number;
  vx: number;
  vy: number;
  mode: "air" | "roll";
  girder: number;
  dir: -1 | 1;
  /** Distance rolled, drives the rolling animation. */
  rolled: number;
  /** Set once Mario has been awarded points for jumping it. */
  scored: boolean;
}

/** Kong tosses a barrel from his hand; it arcs over the top girder and lands on the next. */
export function spawnBarrel(): Barrel {
  return {
    x: KONG_HAND.x,
    y: KONG_HAND.y,
    vx: 30,
    vy: -70,
    mode: "air",
    girder: -1,
    dir: 1,
    rolled: 0,
    scored: false,
  };
}

/** Advances a barrel by dt seconds. Returns false once it has left play. */
export function stepBarrel(b: Barrel, dt: number): boolean {
  if (b.mode === "roll") {
    const g = GIRDERS[b.girder];
    b.x += b.dir * BARREL_SPEED * dt;
    b.rolled += BARREL_SPEED * dt;

    if (b.girder === FLOOR && b.x <= OIL_DRUM_X) return false;

    if (b.x < g.x0 || b.x > g.x1) {
      // rolled off the end: drop to the girder below, carrying a little momentum
      b.mode = "air";
      b.vx = b.dir * BARREL_SPEED * 0.5;
      b.vy = 0;
    } else {
      b.y = surfaceY(g, b.x);
    }
    return true;
  }

  const prevY = b.y;
  b.vy += GRAVITY * dt;
  b.y += b.vy * dt;
  b.x += b.vx * dt;

  if (b.vy > 0) {
    // index 1: barrels ignore the top platform so they can drop past Kong's perch
    const landed = landingGirder(b.x, prevY, b.y, 1);
    if (landed >= 0) {
      b.mode = "roll";
      b.girder = landed;
      b.y = surfaceY(GIRDERS[landed], b.x);
      b.dir = rollDirection(GIRDERS[landed]);
    }
  }
  return b.y < 260;
}
