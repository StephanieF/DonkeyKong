import type { KAPLAYCtx } from "kaplay";
import type { SoundName } from "../assets";
import {
  FLOOR_Y,
  GAME_WIDTH,
  GRAVITY,
  JUMP_FORCE,
  MOVE_SPEED,
  SCENES,
  STAGE_WIDTH,
  STAGE_X,
  STAGE_Y,
} from "../constants";
import { addHud } from "../hud";
import { MARIO_WALK } from "../sprites";
import { resetState } from "../state";

const MARIO_SIZE = 16;
const WALK_FPS = 10;
const WALK_SOUND_INTERVAL = 0.4;

/**
 * Stage 1 as artwork plus a flat floor. Kong and Pauline animate, Mario walks and jumps
 * on the bottom girder. Sloped girders, ladders and barrels are the next milestone.
 */
export function registerLevelScene(k: KAPLAYCtx) {
  k.scene(SCENES.level, () => {
    resetState();
    k.setGravity(GRAVITY);
    addHud(k);
    const play = (name: SoundName) => k.play(name);

    k.add([k.sprite("stage-1"), k.pos(STAGE_X, STAGE_Y)]);

    // Kong and Pauline share the top girder.
    const kong = k.add([k.sprite("kong-0"), k.pos(STAGE_X + 2, STAGE_Y - 24)]);
    kong.onUpdate(() => {
      kong.sprite = Math.floor(k.time() * 2.5) % 2 ? "kong-1" : "kong-0";
    });
    const pauline = k.add([k.sprite("pauline-0"), k.pos(STAGE_X + 78, STAGE_Y - 16)]);
    pauline.onUpdate(() => {
      pauline.sprite = Math.floor(k.time() * 3) % 2 ? "pauline-1" : "pauline-0";
    });

    // Invisible floor collider over the bottom girder.
    k.add([
      k.rect(GAME_WIDTH, 8),
      k.pos(0, FLOOR_Y),
      k.opacity(0),
      k.area(),
      k.body({ isStatic: true }),
    ]);

    const mario = k.add([
      k.sprite("mario-0"),
      k.pos(STAGE_X + 40, FLOOR_Y - MARIO_SIZE),
      k.area(),
      k.body(),
    ]);

    let nextWalkSound = 0;
    mario.onUpdate(() => {
      const left = k.isKeyDown("left") || k.isKeyDown("a");
      const right = k.isKeyDown("right") || k.isKeyDown("d");
      const dir = Number(right) - Number(left);
      const grounded = mario.isGrounded();

      mario.move(dir * MOVE_SPEED, 0);
      mario.pos.x = k.clamp(mario.pos.x, STAGE_X, STAGE_X + STAGE_WIDTH - MARIO_SIZE);
      if (dir !== 0) mario.flipX = dir < 0;

      if (!grounded) {
        mario.sprite = "mario-4";
      } else if (dir !== 0) {
        mario.sprite = MARIO_WALK[Math.floor(k.time() * WALK_FPS) % MARIO_WALK.length];
        if (k.time() >= nextWalkSound) {
          play("walk");
          nextWalkSound = k.time() + WALK_SOUND_INTERVAL;
        }
      } else {
        mario.sprite = "mario-0";
        nextWalkSound = 0;
      }
    });

    k.onKeyPress("space", () => {
      if (!mario.isGrounded()) return;
      mario.jump(JUMP_FORCE);
      play("jump");
    });
  });
}
