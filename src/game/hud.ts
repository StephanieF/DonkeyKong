import type { KAPLAYCtx } from "kaplay";
import { COLORS, FONT } from "./constants";
import { state } from "./state";

const DIGIT_SPACING = 13;
const SCORE_DIGITS = 6;

export function addLabel(
  k: KAPLAYCtx,
  text: string,
  x: number,
  y: number,
  color: readonly [number, number, number],
  opts: { size?: number; anchor?: "topleft" | "top" | "center" } = {},
) {
  return k.add([
    k.text(text, { font: FONT, size: opts.size ?? 8 }),
    k.pos(x, y),
    k.anchor(opts.anchor ?? "topleft"),
    k.color(...color),
  ]);
}

/** A row of score digits drawn with the sheet's own numerals. */
function addNumber(k: KAPLAYCtx, x: number, y: number, digits: number) {
  const cells = Array.from({ length: digits }, (_, i) =>
    k.add([k.sprite("orange-0"), k.pos(x + i * DIGIT_SPACING, y)]),
  );
  return (value: number) => {
    const text = String(Math.max(0, Math.floor(value))).padStart(digits, "0").slice(-digits);
    cells.forEach((cell, i) => {
      cell.sprite = `orange-${text[i]}`;
    });
  };
}

/** Top-of-screen readout: 1UP score, high score, remaining lives. Returns a refresh fn. */
export function addHud(k: KAPLAYCtx) {
  // Three columns: score (6..84), high score (92..170), lives icon + count (180..209).
  addLabel(k, "1UP", 6, 6, COLORS.red);
  addLabel(k, "HIGH SCORE", 92, 6, COLORS.red);

  const setScore = addNumber(k, 6, 17, SCORE_DIGITS);
  const setHigh = addNumber(k, 92, 17, SCORE_DIGITS);

  k.add([k.sprite("life-pink"), k.pos(180, 16)]);
  const setLives = addNumber(k, 197, 17, 1);

  const refresh = () => {
    setScore(state.score);
    setHigh(Math.max(state.score, state.highScore));
    setLives(state.lives);
  };
  refresh();
  return refresh;
}
