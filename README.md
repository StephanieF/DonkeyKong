# Donkey Kong (Atari 2600) in React

A recreation of the 1982 Atari 2600 *Donkey Kong*, built with **React + KAPLAY** and hosted on **Cloudflare Pages**.

> Fan project for learning. Donkey Kong is a Nintendo property and the Atari 2600 port was made by Coleco; see [Asset licensing](#asset-licensing) before publishing.

## Stack

| Concern | Choice | Notes |
| --- | --- | --- |
| UI shell | React 19 + TypeScript | Owns the page, canvas element, and (later) HUD/menus/touch controls |
| Game engine | [KAPLAY](https://kaplayjs.com/) 3001 | Scenes, sprites, physics, input, audio. Runs with `global: false` |
| Bundler | Vite 8 | `npm run dev` / `npm run build` |
| Hosting | Cloudflare Pages | Static site: build output is `dist/` |
| Resolution | 224 × 256 logical | Arcade-style portrait playfield, letterboxed and scaled with pixelated rendering |
| Font | Press Start 2P (`@fontsource`) | Self-hosted, loaded at 8px so text stays crisp |

## Resources

| Asset | Source | Where it lives |
| --- | --- | --- |
| Arcade-style sprites (Kong, Mario, Pauline, barrels, fireballs, digits, lives, stages), 459×387 PNG, by **Nick edits** | [The Spriters Resource, asset 487599](https://www.spriters-resource.com/custom_edited/donkeykongcustoms/asset/487599/) | `assets-src/arcade-style.png`, built into `public/assets/sprites/atlas.png` (**in use**) |
| Original Atari 2600 sprites ("General Sprites", 409×280 PNG), ripped by **Zeph** | [The Spriters Resource, asset 2110](https://www.spriters-resource.com/atari_2600/donkeykong/asset/2110/) | `assets-src/general.png` (reference, not used yet) |
| Sound effects (jump, over, walk, die, victory), by **The Blue Prophet** | [The Mushroom Kingdom, DK A2600 WAVs](https://themushroomkingdom.net/media/dk-a2600/wav) | `public/assets/audio/dk-a2600_*.wav` |
| Game engine | [KAPLAY docs](https://kaplayjs.com/docs/) | npm dependency |

Sprite sheets are downloaded from `https://www.spriters-resource.com/media/assets/<id-prefix>/<id>.png` (the page's "Download Asset" link); the site rejects script requests without a browser User-Agent and Referer.

## Architecture

How the external services, the repo, and the runtime relate:

```mermaid
graph LR
  subgraph External["External resources"]
    SR["The Spriters Resource<br/>arcade-style + Atari sprite sheets"]
    TMK["The Mushroom Kingdom<br/>Atari 2600 WAV files"]
    NPM["npm registry<br/>react, kaplay, vite"]
  end

  subgraph Repo["Git repository"]
    RAW["assets-src<br/>raw sprite sheets"]
    KEY["scripts/build-atlas.py<br/>keys black to transparent"]
    ASSETS["public/assets<br/>atlas.png + audio"]
    SRC["src<br/>React app + game code"]
  end

  subgraph CF["Cloudflare"]
    BUILD["Pages build<br/>npm run build"]
    CDN["Pages CDN<br/>static dist/"]
  end

  subgraph Browser["Player's browser"]
    REACT["React<br/>App + GameCanvas"]
    KAPLAY["KAPLAY instance<br/>scenes, physics, input"]
    CANVAS["Canvas / WebGL"]
    WA["Web Audio"]
  end

  SR -. "download" .-> RAW
  RAW --> KEY
  KEY --> ASSETS
  TMK -. "download" .-> ASSETS
  NPM --> BUILD
  ASSETS --> BUILD
  SRC --> BUILD
  BUILD --> CDN
  CDN -->|"HTML, JS, sprites, WAVs"| REACT
  REACT -->|"mounts canvas, calls createGame"| KAPLAY
  KAPLAY --> CANVAS
  KAPLAY --> WA
```

Runtime ownership: React owns the `<canvas>` element and its lifecycle (mount creates the KAPLAY instance, unmount calls `k.quit()`). KAPLAY owns everything drawn on the canvas. They talk only through `createGame(canvas)`; if the HUD moves into React later, add a small event bridge rather than sharing state directly.

### Game flow

```mermaid
stateDiagram-v2
  [*] --> Title
  Title --> Level: Space / click
  Level --> Level: Barrel jumped (score)
  Level --> Dead: Hit by barrel
  Dead --> Level: Lives remaining
  Dead --> GameOver: No lives left
  Level --> LevelComplete: Reach Pauline
  LevelComplete --> Level: Next round
  GameOver --> Title
```

All of these states exist today (`src/game/scenes/level.ts`), except that barrels only score when jumped and there is no bonus timer yet.

## Project structure

```
.
├── index.html
├── wrangler.toml            # Cloudflare Pages config for `npm run deploy`
├── assets-src/              # raw sprite sheets (not shipped)
├── scripts/build-atlas.py   # raw sheet -> transparent atlas
├── public/assets/
│   ├── audio/               # dk-a2600_{jump,over,walk,die,victory}.wav
│   └── sprites/atlas.png    # generated, black keyed to transparent
└── src/
    ├── main.tsx             # React entry
    ├── App.tsx              # page layout + credits footer
    ├── index.css
    └── game/
        ├── GameCanvas.tsx   # React <-> KAPLAY bridge (mount / cleanup)
        ├── createGame.ts    # kaplay() init, asset load, scene registration
        ├── constants.ts     # resolution, stage placement, physics tuning, palette
        ├── sprites.ts       # frame table indexing atlas.png
        ├── assets.ts        # font, sprite atlas and sound loading
        ├── stage1.ts        # girder surfaces, ladders, Kong/Pauline positions (measured from the art)
        ├── mario.ts         # Mario movement: walk, jump, climb, fall damage (pure logic)
        ├── barrel.ts        # barrel throw + roll + drop physics (pure logic)
        ├── rules.ts         # hits, jump-over scoring, reaching Pauline (pure logic)
        ├── game.test.ts     # vitest: geometry, barrel route, full climb to Pauline, hit/clear
        ├── hud.ts           # 1UP / high score / lives readout
        ├── state.ts         # score, high score, lives
        └── scenes/          # title.ts, level.ts (draws the logic, plays sounds, runs death/win flow)
```

If you change `assets-src/arcade-style.png`, regenerate the atlas with `pip install pillow && python3 scripts/build-atlas.py`.

## Getting started

```bash
nvm use          # Node 26 (see .nvmrc)
npm install
npm run dev      # http://localhost:5173
```

Other scripts: `npm test` (game-logic tests), `npm run build`, `npm run preview`, `npm run typecheck`.

**Controls:** arrows or WASD to walk and climb ladders, Space to jump. Jump *toward* an oncoming barrel: a standing jump is too short to clear one.

## Deploying to Cloudflare Pages

**Option A: Git integration (recommended).** In the Cloudflare dashboard, go to Workers & Pages > Create > Pages > Connect to Git, then set:

| Setting | Value |
| --- | --- |
| Framework preset | Vite (or None) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Environment variable | `NODE_VERSION` = `26` |

Every push to `main` deploys to production; other branches get preview URLs.

**Option B: Direct upload from your machine.**

```bash
npx wrangler login
npm run deploy
```

The first run asks you to create the Pages project (`donkeykong`, per `wrangler.toml`).

## Roadmap

- [x] **0. Scaffold**: Vite + React + KAPLAY, title scene, builds clean
- [x] **1. Sprites and look**: arcade-style atlas, pixel font, HUD with sprite digits, title screen, stage 1 artwork
- [x] **2. Girders and ladders**: Mario walks the sloped girders and climbs ladders (climb frames), falling too far is fatal
- [x] **3. Barrels**: Kong throws one every 2 to 3 seconds; they roll down the slopes, drop to the next girder, and burn out at the oil drum
- [x] **4. Game rules**: 100 points per barrel jumped (`over` sound), death by barrel, Kong or a long fall (`die`), 3 lives, game over, reaching Pauline clears the level (`victory`, +1000)
- [ ] **4b. Missing rules**: bonus timer, barrels that take ladders, fireballs, hammers, level speed-up
- [ ] **5. Stage 2**: the rivets stage artwork and cyan palette are already in the atlas
- [ ] **6. Polish**: on-screen touch controls for mobile, pause, high score in `localStorage`, mute toggle
- [ ] **7. Ship**: Cloudflare Pages project, custom domain, CI typecheck and tests on PRs

## Asset licensing and credits

The sprites and sounds come from a commercial game and fan rips, so treat this as a private learning project unless you sort out rights first.

- **Zeph's** Atari 2600 rip states "No credit necessary".
- **Nick edits'** arcade-style sheet asks: "Please give credit if used". Credit is shown in the page footer and on the title screen. Keep it if you publish.
- **The Blue Prophet's** sounds carry no stated license; they are credited in the same places.
- Donkey Kong itself belongs to Nintendo, and neither source page grants rights to it.

Before making the deployed site public, decide whether to keep the site private or unlisted, swap in original art and audio, or get permission from the rights holders.

## Design notes and known gaps

- **Tunable numbers** live in `src/game/constants.ts`: barrel interval, speeds, jump height, points. The Atari 2600 values aren't documented, so these are playable guesses, not measurements.
- **Ladders:** the artwork draws four ladders with a gap. Two of them (x=84 floor to girder 5, x=92 girder 1 to girder 2) are the only link between their girders, so they are climbable or the stage couldn't be finished. The other two (x=68, x=140) stay decorative. The list is `LADDERS` in `stage1.ts`, and a test proves the floor-to-Pauline route works.
- **Barrels** drop past the top platform after Kong throws them, so they never roll into Pauline. They don't yet choose to take ladders.
- **Mario** can't walk off girder ends (he can only leave them by jumping) and can't walk into the oil drum. Touching Kong is fatal, so the left ladder on the top platform is a trap.
- Keyboard only. Sounds are untested by ear: they fire on jump, walk, barrel jump, death and level clear.
