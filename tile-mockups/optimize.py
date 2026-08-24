#!/usr/bin/env python3
"""Optimize generated PNGs into web-ready WebP at several widths."""
import os, glob, sys
from PIL import Image

SRC = sys.argv[1] if len(sys.argv) > 1 else '/tmp/claude-0/-home-user-Patterson/12461214-ea46-5420-912e-8248457d292c/scratchpad/gen'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets')
os.makedirs(OUT, exist_ok=True)

# name -> (target_aspect or None). Crops centrally (biased toward top for interiors).
ASPECT = {
    '01-marble-master-bath': 21/9, '25-dark-marble-hero': 21/9, '23-greatroom-lfp': 21/9,
    '03-herringbone-shower': 3/4, '08-dark-basalt-shower': 3/4, '14-cement-tile-mudroom': 3/4,
    '20-powder-room': 3/4, '30-steam-shower': 3/4,
    '34-sample-stack': 3/4, '35-finished-wall-level': 3/4,
}
WIDTHS = [(1800, 80), (1100, 78), (620, 74)]

def crop_to(im, ratio, bias=0.45):
    w, h = im.size
    cur = w / h
    if abs(cur - ratio) < 0.01: return im
    if cur > ratio:                      # too wide -> crop sides
        nw = int(h * ratio); x = (w - nw) // 2
        return im.crop((x, 0, x + nw, h))
    nh = int(w / ratio); y = int((h - nh) * bias)   # too tall -> crop, keep upper-middle
    return im.crop((0, y, w, y + nh))

total = 0
for f in sorted(glob.glob(os.path.join(SRC, '*.png'))):
    base = os.path.basename(f)[:-4]
    im = Image.open(f).convert('RGB')
    if base in ASPECT:
        im = crop_to(im, ASPECT[base])
    for w, q in WIDTHS:
        if im.width < w and w != WIDTHS[-1][0]:
            if im.width < w * 0.75: continue
        scale = min(1.0, w / im.width)
        size = (max(1, round(im.width * scale)), max(1, round(im.height * scale)))
        out = im.resize(size, Image.LANCZOS)
        p = os.path.join(OUT, f'{base}-{w}.webp')
        out.save(p, 'WEBP', quality=q, method=6)
        total += os.path.getsize(p)
    print(f'{base:30s} {im.size}')
print(f'\ntotal assets: {total/1e6:.1f} MB across {len(glob.glob(os.path.join(OUT,"*.webp")))} files')
