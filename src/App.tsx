import GameCanvas from "./game/GameCanvas";

export default function App() {
  return (
    <main className="app">
      <h1 className="app__title">Donkey Kong</h1>
      <GameCanvas />
      <p className="app__help">Arrow keys / A D to move · Space to jump</p>
    </main>
  );
}
