import GameCanvas from "./game/GameCanvas";

export default function App() {
  return (
    <main className="app">
      <h1 className="sr-only">Donkey Kong</h1>
      <GameCanvas />
      <footer className="app__footer">
        <p>Arrows / WASD to move and climb · Space to jump</p>
        <p className="app__credits">
          Sprites:{" "}
          <a href="https://www.spriters-resource.com/atari_2600/donkeykong/asset/2110/">Zeph</a>,{" "}
          <a href="https://www.spriters-resource.com/custom_edited/donkeykongcustoms/asset/487599/">Nick edits</a>{" "}
          · Sounds: <a href="https://themushroomkingdom.net/media/dk-a2600/wav">The Blue Prophet</a>
        </p>
      </footer>
    </main>
  );
}
