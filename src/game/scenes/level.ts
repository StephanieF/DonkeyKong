import type { KAPLAYCtx } from "kaplay";
import type { SoundName } from "../assets";
import { type Barrel, nextThrowDelay, spawnBarrel, stepBarrel } from "../barrel";
import {
  FIRST_BARREL_DELAY,
  POINTS_JUMP_BARREL,
  POINTS_LEVEL_CLEAR,
  SCENES,
  STAGE_X,
  STAGE_Y,
  COLORS,
  GAME_WIDTH,
} from "../constants";
import { addHud, addLabel } from "../hud";
import { createMario, type Input, stepMario } from "../mario";
import { hitsBarrel, jumpedOver, reachedPauline, touchesKong } from "../rules";
import { MARIO_WALK } from "../sprites";
import { PAULINE_X } from "../stage1";
import { state } from "../state";

const WALK_FPS = 10;
const WALK_SOUND_INTERVAL = 0.4;
const DEATH_SECONDS = 1.8;
const LEVEL_CLEAR_SECONDS = 2.5;
const GAME_OVER_SECONDS = 3;

type Phase = "playing" | "dying" | "won" | "gameover";

/**
 * Stage 1: Kong throws barrels that roll down the girders, Mario climbs ladders and
 * jumps them, and reaching Pauline clears the level. All movement rules live in
 * mario.ts / barrel.ts / rules.ts; this scene only feeds them input and draws the result.
 */
export function registerLevelScene(k: KAPLAYCtx) {
  k.scene(SCENES.level, () => {
    const refreshHud = addHud(k);
    const play = (name: SoundName) => k.play(name);

    // Stage-local pixels -> screen pixels
    const sx = (x: number) => STAGE_X + x;
    const sy = (y: number) => STAGE_Y + y;

    k.add([k.sprite("stage-1"), k.pos(STAGE_X, STAGE_Y)]);

    // Kong and Pauline share the top girder.
    const kong = k.add([k.sprite("kong-0"), k.pos(sx(2), sy(-24))]);
    kong.onUpdate(() => {
      kong.sprite = Math.floor(k.time() * 2.5) % 2 ? "kong-1" : "kong-0";
    });
    const pauline = k.add([k.sprite("pauline-0"), k.pos(sx(PAULINE_X), sy(-16))]);
    pauline.onUpdate(() => {
      pauline.sprite = Math.floor(k.time() * 3) % 2 ? "pauline-1" : "pauline-0";
    });

    const mario = createMario();
    const marioObj = k.add([k.sprite("mario-0"), k.pos(0, 0), k.anchor("center"), k.rotate(0), k.z(2)]);

    const barrels: { sim: Barrel; obj: ReturnType<typeof addBarrelObj> }[] = [];
    function addBarrelObj() {
      return k.add([k.sprite("barrel-side"), k.pos(0, 0), k.anchor("center"), k.z(1)]);
    }

    let phase: Phase = "playing";
    let phaseTimer = 0;
    let nextThrow = k.time() + FIRST_BARREL_DELAY;
    let nextWalkSound = 0;
    let jumpQueued = false;
    k.onKeyPress("space", () => {
      jumpQueued = true;
    });

    const readInput = (): Input => {
      const input: Input = {
        left: k.isKeyDown("left") || k.isKeyDown("a"),
        right: k.isKeyDown("right") || k.isKeyDown("d"),
        up: k.isKeyDown("up") || k.isKeyDown("w"),
        down: k.isKeyDown("down") || k.isKeyDown("s"),
        jump: jumpQueued,
      };
      jumpQueued = false;
      return input;
    };

    const drawMario = (moving: boolean) => {
      marioObj.pos = k.vec2(sx(mario.x), sy(mario.y) - 8);
      marioObj.flipX = mario.facing < 0;
      if (mario.mode === "air") marioObj.sprite = "mario-4";
      else if (mario.mode === "climb") marioObj.sprite = `climb-${Math.floor(mario.travelled / 4) % 2}`;
      else if (moving) marioObj.sprite = MARIO_WALK[Math.floor(k.time() * WALK_FPS) % MARIO_WALK.length];
      else marioObj.sprite = "mario-0";
    };

    const drawBarrel = ({ sim, obj }: (typeof barrels)[number]) => {
      obj.pos = k.vec2(sx(sim.x), sy(sim.y) - 4);
      obj.sprite = sim.mode === "air" ? "barrel-side" : Math.floor(sim.rolled / 6) % 2 ? "barrel-1" : "barrel-0";
    };

    const clearBarrels = () => {
      for (const b of barrels) b.obj.destroy();
      barrels.length = 0;
    };

    const die = () => {
      phase = "dying";
      phaseTimer = DEATH_SECONDS;
      play("die");
    };

    const respawn = () => {
      Object.assign(mario, createMario());
      marioObj.angle = 0;
      clearBarrels();
      nextThrow = k.time() + FIRST_BARREL_DELAY;
      phase = "playing";
    };

    const stepPlaying = (dt: number) => {
      const input = readInput();
      const moving = (input.left || input.right) && mario.mode === "ground";
      const events = stepMario(mario, input, dt);
      if (events.jumped) play("jump");

      if (moving) {
        if (k.time() >= nextWalkSound) {
          play("walk");
          nextWalkSound = k.time() + WALK_SOUND_INTERVAL;
        }
      } else {
        nextWalkSound = 0;
      }

      if (k.time() >= nextThrow) {
        const sim = spawnBarrel();
        barrels.push({ sim, obj: addBarrelObj() });
        nextThrow = k.time() + nextThrowDelay();
      }

      let hit = events.fatalFall || touchesKong(mario);
      for (let i = barrels.length - 1; i >= 0; i--) {
        const entry = barrels[i];
        if (!stepBarrel(entry.sim, dt)) {
          entry.obj.destroy();
          barrels.splice(i, 1);
          continue;
        }
        drawBarrel(entry);
        if (hitsBarrel(mario, entry.sim)) hit = true;
        if (jumpedOver(mario, entry.sim)) {
          entry.sim.scored = true;
          state.score += POINTS_JUMP_BARREL;
          refreshHud();
          play("over");
        }
      }

      drawMario(moving);

      if (hit) {
        die();
      } else if (reachedPauline(mario)) {
        phase = "won";
        phaseTimer = LEVEL_CLEAR_SECONDS;
        state.score += POINTS_LEVEL_CLEAR;
        refreshHud();
        play("victory");
      }
    };

    k.onUpdate(() => {
      // Cap dt so a stalled tab can't teleport Mario or a barrel through a girder.
      const dt = Math.min(k.dt(), 1 / 30);

      if (phase === "playing") {
        stepPlaying(dt);
        return;
      }

      phaseTimer -= dt;
      if (phase === "dying") {
        marioObj.angle += 540 * dt;
        if (phaseTimer <= 0) {
          state.lives -= 1;
          refreshHud();
          if (state.lives > 0) {
            respawn();
          } else {
            phase = "gameover";
            phaseTimer = GAME_OVER_SECONDS;
            addLabel(k, "GAME OVER", GAME_WIDTH / 2, 130, COLORS.red, { size: 16, anchor: "center" });
          }
        }
      } else if (phaseTimer <= 0) {
        k.go(phase === "won" ? SCENES.level : SCENES.title);
      }
    });

    drawMario(false);
  });
}
