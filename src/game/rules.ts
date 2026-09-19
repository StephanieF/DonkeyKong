import type { Barrel } from "./barrel";
import type { Mario } from "./mario";
import { KONG_BOX, PAULINE_X, TOP_PLATFORM } from "./stage1";

interface Box {
  l: number;
  r: number;
  t: number;
  b: number;
}

const overlaps = (a: Box, b: Box) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;

const marioBox = (m: Mario): Box => ({ l: m.x - 3, r: m.x + 3, t: m.y - 14, b: m.y });
const barrelBox = (b: Barrel): Box => ({ l: b.x - 4, r: b.x + 4, t: b.y - 8, b: b.y });

export function hitsBarrel(m: Mario, b: Barrel): boolean {
  return overlaps(marioBox(m), barrelBox(b));
}

export function touchesKong(m: Mario): boolean {
  return overlaps(marioBox(m), KONG_BOX);
}

/**
 * Mario is airborne directly over a rolling barrel with clear air between them.
 * Callers should mark the barrel `scored` when this returns true.
 */
export function jumpedOver(m: Mario, b: Barrel): boolean {
  if (m.mode !== "air" || b.scored || b.mode !== "roll") return false;
  const barrelTop = b.y - 8;
  return Math.abs(m.x - b.x) <= 3 && m.y < barrelTop && m.y >= barrelTop - 26;
}

export function reachedPauline(m: Mario): boolean {
  return m.mode === "ground" && m.girder === TOP_PLATFORM && m.x >= PAULINE_X - 8;
}
