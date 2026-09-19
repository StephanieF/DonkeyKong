#!/usr/bin/env python3
"""Turn the raw sprite sheet into the runtime atlas.

The Spriters Resource sheets use opaque black backgrounds. KAPLAY draws sprites over
girders and ladders, so we key black out to transparent. Sprite coordinates are
unchanged, so src/game/sprites.ts indexes the atlas exactly as the raw sheet.

Usage: pip install pillow && python3 scripts/build-atlas.py
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets-src" / "arcade-style.png"
OUT = ROOT / "public" / "assets" / "sprites" / "atlas.png"

im = Image.open(SRC).convert("RGBA")
im.putdata([(r, g, b, 0) if (r, g, b) == (0, 0, 0) else (r, g, b, a) for r, g, b, a in im.getdata()])
OUT.parent.mkdir(parents=True, exist_ok=True)
im.save(OUT)
print(f"wrote {OUT.relative_to(ROOT)} ({im.width}x{im.height})")
