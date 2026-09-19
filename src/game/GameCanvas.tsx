import { useEffect, useRef } from "react";
import { createGame } from "./createGame";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const k = createGame(canvas);
    return () => k.quit();
  }, []);

  return (
    <div className="game">
      <canvas ref={canvasRef} />
    </div>
  );
}
