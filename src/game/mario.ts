import {
  CLIMB_GRAB,
  CLIMB_SPEED,
  GRAVITY,
  JUMP_FORCE,
  MAX_SAFE_FALL,
  MOVE_SPEED,
  STAGE_WIDTH,
} from "./constants";
import {
  FLOOR,
  GIRDERS,
  LADDERS,
  type Ladder,
  landingGirder,
  ladderBottomY,
  ladderTopY,
  surfaceY,
} from "./stage1";

export type MarioMode = "ground" | "air" | "climb";

/** Mario in stage-local pixels; (x, y) is the point between his feet. */
export interface Mario {
  x: number;
  y: number;
  vy: number;
  mode: MarioMode;
  /** Girder Mario stands on (ground mode) or last stood on. */
  girder: number;
  ladder: Ladder | null;
  /** Horizontal direction locked in at take-off, like the arcade. */
  airDir: -1 | 0 | 1;
  /** Highest point of the current jump or fall (smallest y). */
  peakY: number;
  facing: -1 | 1;
  /** Total distance walked/climbed, drives animation frames. */
  travelled: number;
}

export interface Input {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  /** True only on the frame the jump key went down. */
  jump: boolean;
}

export interface MarioEvents {
  jumped: boolean;
  /** Landed after falling too far. */
  fatalFall: boolean;
}

export const START_X = 40;

export function createMario(): Mario {
  return {
    x: START_X,
    y: surfaceY(GIRDERS[FLOOR], START_X),
    vy: 0,
    mode: "ground",
    girder: FLOOR,
    ladder: null,
    airDir: 0,
    peakY: 0,
    facing: 1,
    travelled: 0,
  };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function findLadder(m: Mario, direction: "up" | "down"): Ladder | undefined {
  return LADDERS.find(
    (l) =>
      Math.abs(m.x - l.x) <= CLIMB_GRAB && (direction === "up" ? l.lower === m.girder : l.upper === m.girder),
  );
}

export function stepMario(m: Mario, input: Input, dt: number): MarioEvents {
  const events: MarioEvents = { jumped: false, fatalFall: false };
  const dir = (Number(input.right) - Number(input.left)) as -1 | 0 | 1;

  if (m.mode === "ground") {
    const g = GIRDERS[m.girder];

    if (input.jump) {
      m.mode = "air";
      m.vy = -JUMP_FORCE;
      m.airDir = dir;
      m.peakY = m.y;
      events.jumped = true;
      return events;
    }

    const wantClimb = input.up ? "up" : input.down ? "down" : null;
    const ladder = wantClimb ? findLadder(m, wantClimb) : undefined;
    if (ladder) {
      m.mode = "climb";
      m.ladder = ladder;
      m.x = ladder.x;
      return events;
    }

    if (dir !== 0) {
      m.facing = dir;
      m.x = clamp(m.x + dir * MOVE_SPEED * dt, g.walkMinX ?? g.x0, g.x1);
      m.travelled += MOVE_SPEED * dt;
    }
    m.y = surfaceY(g, m.x);
    return events;
  }

  if (m.mode === "climb" && m.ladder) {
    const l = m.ladder;
    const step = (Number(input.down) - Number(input.up)) * CLIMB_SPEED * dt;
    m.y += step;
    m.travelled += Math.abs(step);

    const top = ladderTopY(l);
    const bottom = ladderBottomY(l);
    if (m.y <= top) {
      m.y = top;
      m.girder = l.upper;
      m.mode = "ground";
      m.ladder = null;
    } else if (m.y >= bottom) {
      m.y = bottom;
      m.girder = l.lower;
      m.mode = "ground";
      m.ladder = null;
    }
    return events;
  }

  // air
  const prevY = m.y;
  m.vy += GRAVITY * dt;
  m.y += m.vy * dt;
  m.x = clamp(m.x + m.airDir * MOVE_SPEED * dt, 0, STAGE_WIDTH - 1);
  m.peakY = Math.min(m.peakY, m.y);
  if (m.airDir !== 0) m.facing = m.airDir;

  if (m.vy > 0) {
    const landed = landingGirder(m.x, prevY, m.y);
    if (landed >= 0) {
      m.girder = landed;
      m.y = surfaceY(GIRDERS[landed], m.x);
      m.mode = "ground";
      m.vy = 0;
      events.fatalFall = m.y - m.peakY > MAX_SAFE_FALL;
    }
  }
  return events;
}
