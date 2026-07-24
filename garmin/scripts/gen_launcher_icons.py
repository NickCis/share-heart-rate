#!/usr/bin/env python3
"""Generate red heart + share launcher icons from each device's compiler.json size."""

from __future__ import annotations

import json
import math
import re
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
DEVICES = Path.home() / ".Garmin" / "ConnectIQ" / "Devices"
MANIFEST = ROOT / "manifest.xml"

BG = (0, 0, 0, 255)
RED = (255, 0, 0, 255)

DRAWABLES_XML = """\
<?xml version="1.0" encoding="UTF-8"?>
<drawables>
  <bitmap id="LauncherIcon" filename="launcher_icon.png"/>
</drawables>
"""


def product_ids() -> list[str]:
    text = MANIFEST.read_text()
    return sorted(set(re.findall(r'<iq:product id="([^"]+)"', text)))


def icon_size(product_id: str) -> tuple[int, int]:
    path = DEVICES / product_id / "compiler.json"
    data = json.loads(path.read_text())
    icon = data.get("launcherIcon") or {}
    return int(icon.get("width", 40)), int(icon.get("height", 40))


def draw_heart(draw: ImageDraw.ImageDraw, cx: float, cy: float, scale: float) -> None:
    points: list[tuple[float, float]] = []
    for i in range(360):
        t = math.radians(i)
        x = 16 * (math.sin(t) ** 3)
        y = (
            13 * math.cos(t)
            - 5 * math.cos(2 * t)
            - 2 * math.cos(3 * t)
            - math.cos(4 * t)
        )
        points.append((x, -y))
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
    ox = cx - ((minx + maxx) / 2) * scale
    oy = cy - ((miny + maxy) / 2) * scale
    scaled = [(ox + x * scale, oy + y * scale) for x, y in points]
    draw.polygon(scaled, fill=RED)


def draw_share(draw: ImageDraw.ImageDraw, size: int) -> None:
    # Classic three-node share glyph in the lower-right quadrant.
    s = float(size)
    nodes = [
        (s * 0.62, s * 0.28),
        (s * 0.84, s * 0.50),
        (s * 0.62, s * 0.72),
    ]
    width = max(2, int(round(s * 0.06)))
    radius = max(2, int(round(s * 0.075)))
    for a, b in ((nodes[0], nodes[1]), (nodes[2], nodes[1])):
        draw.line([a, b], fill=RED, width=width)
    for x, y in nodes:
        draw.ellipse([x - radius, y - radius, x + radius, y + radius], fill=RED)


def render(width: int, height: int) -> Image.Image:
    side = max(width, height)
    img = Image.new("RGBA", (side, side), BG)
    draw = ImageDraw.Draw(img)
    # Heart left-of-center so the share glyph fits.
    draw_heart(draw, side * 0.40, side * 0.50, side * 0.0205)
    draw_share(draw, side)
    if width == height:
        return img
    # Rectangular icons: center-crop height.
    top = max(0, (side - height) // 2)
    return img.crop((0, top, width, top + height))


def write_icon(dir_path: Path, img: Image.Image) -> None:
    drawables = dir_path / "drawables"
    drawables.mkdir(parents=True, exist_ok=True)
    img.save(drawables / "launcher_icon.png")
    (drawables / "drawables.xml").write_text(DRAWABLES_XML)
    print(f"wrote {drawables / 'launcher_icon.png'} ({img.size[0]}x{img.size[1]})")


def main() -> None:
    cache: dict[tuple[int, int], Image.Image] = {}
    default = cache.setdefault((40, 40), render(40, 40))
    write_icon(ROOT / "resources", default)

    for product_id in product_ids():
        size = icon_size(product_id)
        img = cache.setdefault(size, render(*size))
        if size == (40, 40):
            # Default resources/ already covers 40×40 devices.
            continue
        write_icon(ROOT / f"resources-{product_id}", img)


if __name__ == "__main__":
    main()
