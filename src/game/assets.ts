import type { KAPLAYCtx } from "kaplay";

const audio = (name: string) => `/assets/audio/dk-a2600_${name}.wav`;

// Sound effects from the Atari 2600 port, served from public/assets/audio.
export const SOUNDS = {
  jump: audio("jump"),
  over: audio("over"),
  walk: audio("walk"),
  die: audio("die"),
  victory: audio("victory"),
} as const;

export type SoundName = keyof typeof SOUNDS;

export function loadAssets(k: KAPLAYCtx) {
  for (const [name, url] of Object.entries(SOUNDS)) {
    k.loadSound(name, url);
  }

  // TODO(sprites): once public/assets/sprites/general.png is in place, slice it with
  // k.loadSpriteAtlas("general", "/assets/sprites/general.png", { ...frames }).
}
