// The Atari 2600 renders a 160x192 picture; we keep that as our logical resolution.
export const GAME_WIDTH = 160;
export const GAME_HEIGHT = 192;

export const GRAVITY = 900;
export const MOVE_SPEED = 40;
export const JUMP_FORCE = 230;

export const SCENES = {
  title: "title",
  level: "level",
} as const;
