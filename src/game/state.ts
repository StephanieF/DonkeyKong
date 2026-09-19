// Run state shared between scenes and the HUD.
export const state = {
  score: 0,
  highScore: 0,
  lives: 3,
};

export function resetState() {
  state.highScore = Math.max(state.highScore, state.score);
  state.score = 0;
  state.lives = 3;
}
