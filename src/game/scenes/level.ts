import type { KAPLAYCtx } from "kaplay";
import type { SoundName } from "../assets";
import { GAME_HEIGHT, GAME_WIDTH, GRAVITY, JUMP_FORCE, MOVE_SPEED, SCENES } from "../constants";

/**
 * Placeholder level: one platform and a rectangle standing in for Mario, just enough
 * to prove input, physics and audio work end to end. Real sprites and girders come later.
 */
export function registerLevelScene(k: KAPLAYCtx) {
  k.scene(SCENES.level, () => {
    k.setGravity(GRAVITY);
    const play = (name: SoundName) => k.play(name);

    k.add([
      k.rect(GAME_WIDTH, 8),
      k.pos(0, GAME_HEIGHT - 16),
      k.color(200, 60, 60),
      k.area(),
      k.body({ isStatic: true }),
    ]);

    const mario = k.add([
      k.rect(8, 12),
      k.pos(16, GAME_HEIGHT - 40),
      k.color(80, 120, 255),
      k.area(),
      k.body(),
    ]);

    const walk = (dir: -1 | 1) => {
      mario.move(dir * MOVE_SPEED, 0);
    };
    k.onKeyDown(["left", "a"], () => walk(-1));
    k.onKeyDown(["right", "d"], () => walk(1));
    k.onKeyPress(["left", "a", "right", "d"], () => mario.isGrounded() && play("walk"));
    k.onKeyPress("space", () => {
      if (!mario.isGrounded()) return;
      mario.jump(JUMP_FORCE);
      play("jump");
    });

    mario.onUpdate(() => {
      mario.pos.x = k.clamp(mario.pos.x, 0, GAME_WIDTH - mario.width);
    });
  });
}
