// Arcade-style portrait playfield (the original cabinet drew 224x256).
export const GAME_WIDTH = 224;
export const GAME_HEIGHT = 256;

// Stage 1 artwork is a 192x189 image placed below the HUD and Kong's perch.
// Game logic works in stage-local pixels; add STAGE_X / STAGE_Y to get screen pixels.
export const STAGE_X = 16;
export const STAGE_Y = 56;
export const STAGE_WIDTH = 192;

// Mario
export const GRAVITY = 600;
export const MOVE_SPEED = 45;
export const CLIMB_SPEED = 30;
export const JUMP_FORCE = 170; // apex ~24px, about 0.57s in the air
export const MAX_SAFE_FALL = 30; // falling further than this from the apex is fatal
export const CLIMB_GRAB = 5; // how close (px) to a ladder's centre Mario must be to grab it

// Barrels
export const BARREL_SPEED = 40;
export const BARREL_INTERVAL: readonly [min: number, max: number] = [2.0, 3.0]; // seconds between throws
export const FIRST_BARREL_DELAY = 1.5;

// Scoring (the Atari 2600 values aren't documented; these are tunable guesses)
export const POINTS_JUMP_BARREL = 100;
export const POINTS_LEVEL_CLEAR = 1000;

export const SCENES = {
  title: "title",
  level: "level",
} as const;

// Palette sampled from the sprite sheet (RGB).
export const COLORS = {
  red: [232, 7, 9],
  orange: [244, 186, 21],
  pink: [244, 120, 252],
  cyan: [19, 243, 255],
  white: [255, 255, 255],
} as const;

export const FONT = "arcade";
