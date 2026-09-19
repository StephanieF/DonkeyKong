import type { KAPLAYCtx } from "kaplay";
import { COLORS, GAME_WIDTH, SCENES } from "../constants";
import { addHud, addLabel } from "../hud";
import { resetState } from "../state";

export function registerTitleScene(k: KAPLAYCtx) {
  k.scene(SCENES.title, () => {
    resetState();
    addHud(k);

    const kong = k.add([
      k.sprite("kong-0"),
      k.pos(GAME_WIDTH / 2, 56),
      k.anchor("top"),
      k.scale(2),
    ]);
    kong.onUpdate(() => {
      kong.sprite = Math.floor(k.time() * 2.5) % 2 ? "kong-1" : "kong-0";
    });

    addLabel(k, "DONKEY KONG", GAME_WIDTH / 2, 120, COLORS.orange, { size: 16, anchor: "top" });
    addLabel(k, "ATARI 2600 STYLE", GAME_WIDTH / 2, 146, COLORS.pink, { anchor: "top" });

    const prompt = addLabel(k, "PUSH SPACE TO START", GAME_WIDTH / 2, 182, COLORS.white, { anchor: "top" });
    prompt.onUpdate(() => {
      prompt.hidden = Math.floor(k.time() * 2) % 2 === 1;
    });

    addLabel(k, "SPRITES: ZEPH, NICK EDITS", GAME_WIDTH / 2, 230, COLORS.cyan, { anchor: "top" });
    addLabel(k, "SOUNDS: THE BLUE PROPHET", GAME_WIDTH / 2, 242, COLORS.cyan, { anchor: "top" });

    const start = () => k.go(SCENES.level);
    k.onKeyPress("space", start);
    k.onClick(start);
  });
}
