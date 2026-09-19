// Arcade-style portrait playfield (the original cabinet drew 224x256).
export const GAME_WIDTH = 224;
export const GAME_HEIGHT = 256;

// Stage 1 artwork is a 192x189 image placed below the HUD and Kong's perch.
export const STAGE_X = 16;
export const STAGE_Y = 56;
export const STAGE_WIDTH = 192;
export const FLOOR_Y = STAGE_Y + 184; // top of the bottom girder

export const GRAVITY = 900;
export const MOVE_SPEED = 45;
export const JUMP_FORCE = 200;

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
