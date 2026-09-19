import kaplay, { type KAPLAYCtx } from "kaplay";
import { loadAssets } from "./assets";
import { GAME_HEIGHT, GAME_WIDTH, SCENES } from "./constants";
import { registerLevelScene } from "./scenes/level";
import { registerTitleScene } from "./scenes/title";

/**
 * Boots a KAPLAY instance onto the given canvas. React owns the canvas element;
 * KAPLAY owns everything drawn on it. Call `k.quit()` to tear it down.
 */
export function createGame(canvas: HTMLCanvasElement): KAPLAYCtx {
  const k = kaplay({
    canvas,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    letterbox: true,
    crisp: true,
    background: [0, 0, 0],
    global: false, // keep KAPLAY out of window so React StrictMode double-mounts are safe
    debug: import.meta.env.DEV,
  });

  loadAssets(k);
  registerTitleScene(k);
  registerLevelScene(k);
  k.go(SCENES.title);

  return k;
}
