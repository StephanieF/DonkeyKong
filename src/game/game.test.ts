import { describe, expect, it } from "vitest";
import { type Barrel, spawnBarrel, stepBarrel } from "./barrel";
import { createMario, type Input, type Mario, stepMario } from "./mario";
import { hitsBarrel, jumpedOver, reachedPauline } from "./rules";
import {
  FLOOR,
  GIRDERS,
  LADDERS,
  ladderBottomY,
  ladderTopY,
  landingGirder,
  rollDirection,
  surfaceY,
} from "./stage1";

const DT = 1 / 60;
const airborne = (m: Mario) => m.mode === "air"; // avoids TS narrowing on earlier assignments
const NO_INPUT: Input = { left: false, right: false, up: false, down: false, jump: false };
const input = (over: Partial<Input>): Input => ({ ...NO_INPUT, ...over });

describe("stage 1 geometry", () => {
  it("matches the surfaces traced from the artwork", () => {
    expect(surfaceY(GIRDERS[2], 16)).toBe(66);
    expect(surfaceY(GIRDERS[2], 191)).toBe(59);
    expect(surfaceY(GIRDERS[FLOOR], 100)).toBe(184);
  });

  it("has every ladder joining two girders it actually stands on, upper above lower", () => {
    for (const l of LADDERS) {
      const upper = GIRDERS[l.upper];
      const lower = GIRDERS[l.lower];
      expect(l.x).toBeGreaterThanOrEqual(upper.x0);
      expect(l.x).toBeLessThanOrEqual(upper.x1);
      expect(l.x).toBeGreaterThanOrEqual(lower.x0);
      expect(l.x).toBeLessThanOrEqual(lower.x1);
      expect(ladderTopY(l)).toBeLessThan(ladderBottomY(l));
    }
  });

  it("alternates roll direction down the slopes and sends floor barrels to the oil drum", () => {
    expect([1, 2, 3, 4, 5, 6].map((i) => rollDirection(GIRDERS[i]))).toEqual([1, -1, 1, -1, 1, -1]);
  });

  it("lands things on the topmost girder they cross", () => {
    expect(landingGirder(50, 20, 40)).toBe(1);
    expect(landingGirder(50, 20, 40, 2)).toBe(-1);
  });
});

describe("barrels", () => {
  it("roll from Kong down every girder to the oil drum", () => {
    const b = spawnBarrel();
    const visited: number[] = [];
    let t = 0;
    while (stepBarrel(b, DT)) {
      t += DT;
      if (b.mode === "roll" && visited.at(-1) !== b.girder) visited.push(b.girder);
      if (t > 120) throw new Error("barrel never finished");
    }
    expect(visited).toEqual([1, 2, 3, 4, 5, 6]);
    expect(t).toBeGreaterThan(20);
    expect(t).toBeLessThan(45);
  });
});

function rollingBarrel(girder: number, x: number, dir: -1 | 1): Barrel {
  return { ...spawnBarrel(), mode: "roll", girder, x, y: surfaceY(GIRDERS[girder], x), dir, vx: 0, vy: 0 };
}

describe("mario", () => {
  const settle = (m: Mario, i: Input, seconds: number) => {
    for (let t = 0; t < seconds; t += DT) stepMario(m, i, DT);
  };
  const walkTo = (m: Mario, x: number) => {
    for (let n = 0; Math.abs(m.x - x) > 0.5 && n < 2000; n++) {
      stepMario(m, input(m.x < x ? { right: true } : { left: true }), DT);
    }
  };
  const climb = (m: Mario, dir: "up" | "down") => {
    for (let n = 0; m.mode !== "ground" || n === 0; n++) {
      stepMario(m, input({ [dir]: true }), DT);
      if (n > 2000) throw new Error("climb never finished");
    }
  };

  it("can climb from the floor to Pauline", () => {
    const m = createMario();
    // [ladder x, girder Mario should arrive on]
    for (const [x, girder] of [
      [84, 5],
      [100, 4],
      [116, 3],
      [76, 2],
      [92, 1],
      [92, 0],
    ] as const) {
      walkTo(m, x);
      climb(m, "up");
      expect(m.girder, `after ladder at x=${x}`).toBe(girder);
    }
    expect(reachedPauline(m)).toBe(true);
  });

  it("can't climb the decorative broken ladders", () => {
    const m = createMario();
    walkTo(m, 68);
    settle(m, input({ up: true }), 1);
    expect(m.mode).toBe("ground");
  });

  it("can't walk into the oil drum", () => {
    const m = createMario();
    settle(m, input({ left: true }), 5);
    expect(m.x).toBe(GIRDERS[FLOOR].walkMinX);
  });

  it("jumps and lands safely on the same girder", () => {
    const m = createMario();
    const before = { x: m.x, y: m.y };
    let fatal = false;
    let n = 0;
    stepMario(m, input({ jump: true }), DT);
    while (airborne(m) && n++ < 600) fatal ||= stepMario(m, NO_INPUT, DT).fatalFall;
    expect(m.mode).toBe("ground");
    expect(m.girder).toBe(FLOOR);
    expect(m.x).toBeCloseTo(before.x);
    expect(m.y).toBeCloseTo(before.y);
    expect(fatal).toBe(false);
  });

  it("dies jumping off a girder end onto the one below", () => {
    const m = createMario();
    m.mode = "ground";
    m.girder = 2;
    m.x = 16;
    m.y = surfaceY(GIRDERS[2], 16);
    stepMario(m, input({ jump: true, left: true }), DT);
    let fatal = false;
    for (let n = 0; airborne(m) && n < 600; n++) fatal ||= stepMario(m, input({}), DT).fatalFall;
    expect(m.girder).toBe(3);
    expect(fatal).toBe(true);
  });

  it("gets hit by a barrel when standing still in its path", () => {
    const m = createMario();
    m.girder = 1;
    m.x = 100;
    m.y = surfaceY(GIRDERS[1], 100);
    const b = rollingBarrel(1, 130, -1);
    let hit = false;
    for (let n = 0; n < 300 && !hit; n++) {
      stepBarrel(b, DT);
      hit = hitsBarrel(m, b);
    }
    expect(hit).toBe(true);
  });

  it("clears a barrel by jumping toward it, and scores the jump", () => {
    const m = createMario();
    m.girder = 1;
    m.x = 100;
    m.y = surfaceY(GIRDERS[1], 100);
    const b = rollingBarrel(1, 130, -1);
    stepMario(m, input({ jump: true, right: true }), DT); // toward the oncoming barrel

    let hit = false;
    let scored = false;
    for (let n = 0; n < 200; n++) {
      stepMario(m, input({}), DT);
      stepBarrel(b, DT);
      hit ||= hitsBarrel(m, b);
      if (jumpedOver(m, b)) {
        scored = true;
        b.scored = true;
      }
    }
    expect(hit).toBe(false);
    expect(scored).toBe(true);
  });
});
