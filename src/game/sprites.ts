import type { SpriteAtlasData } from "kaplay";

/**
 * Frame table for public/assets/sprites/atlas.png, generated from Nick edits'
 * "Atari 2600 Donkey Kong (Arcade-Style)" sheet by scripts/build-atlas.py.
 * Coordinates are pixels in that sheet; each sprite sits inside a 1px lavender box
 * on the source sheet, so x/y here are the box origin + 1.
 */
export const ATLAS_URL = "/assets/sprites/atlas.png";

const frame = (x: number, y: number, width: number, height: number) => ({ x, y, width, height });

// Score digits are laid out 1-5 on the first row, 6-9 then 0 on the second.
const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
const digitFrames = (prefix: string, x0: number) =>
  Object.fromEntries(
    DIGITS.map((d, i) => [`${prefix}-${d}`, frame(x0 + (i % 5) * 19, 76 + Math.floor(i / 5) * 19, 12, 12)]),
  );

export const ATLAS: SpriteAtlasData = {
  // Donkey Kong: two beating-chest frames
  "kong-0": frame(4, 10, 40, 24),
  "kong-1": frame(47, 10, 40, 24),

  // Mario (stage 1 colours): 0 stand, 1-3 walk poses, 4 jump, then two climb frames
  "mario-0": frame(4, 43, 16, 16),
  "mario-1": frame(23, 43, 16, 16),
  "mario-2": frame(42, 43, 16, 16),
  "mario-3": frame(61, 43, 16, 16),
  "mario-4": frame(82, 43, 16, 16),
  "climb-0": frame(104, 43, 16, 16),
  "climb-1": frame(123, 43, 16, 16),

  // Pauline: two "help!" frames
  "pauline-0": frame(4, 74, 16, 16),
  "pauline-1": frame(25, 74, 16, 16),

  // Lives icons (stage 1 pink, stage 2 cyan)
  "life-pink": frame(93, 75, 14, 14),
  "life-cyan": frame(112, 75, 14, 14),

  // Barrels (rolling frames + the on-end frame), fireballs
  "barrel-0": frame(4, 99, 16, 8),
  "barrel-1": frame(23, 99, 16, 8),
  "barrel-side": frame(42, 99, 16, 8),
  "fireball-0": frame(63, 102, 16, 16),
  "fireball-1": frame(84, 102, 16, 16),

  // Stage 1 girders and ladders, black already keyed out
  "stage-1": frame(20, 183, 192, 189),

  ...digitFrames("orange", 135),
  ...digitFrames("blue", 232),
};

export const MARIO_WALK = ["mario-1", "mario-2", "mario-3"] as const;
