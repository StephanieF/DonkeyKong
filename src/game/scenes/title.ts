import type { KAPLAYCtx } from "kaplay";
import { GAME_HEIGHT, GAME_WIDTH, SCENES } from "../constants";

export function registerTitleScene(k: KAPLAYCtx) {
  k.scene(SCENES.title, () => {
    k.add([
      k.text("DONKEY KONG", { size: 14 }),
      k.pos(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20),
      k.anchor("center"),
      k.color(228, 87, 46),
    ]);
    k.add([
      k.text("PRESS SPACE", { size: 8 }),
      k.pos(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10),
      k.anchor("center"),
    ]);

    const start = () => k.go(SCENES.level);
    k.onKeyPress("space", start);
    k.onClick(start);
  });
}
