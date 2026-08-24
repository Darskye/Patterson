#!/usr/bin/env python3
"""Generate the three DTI Tile logo marks as precise SVG."""
import math, os
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'logos')
os.makedirs(OUT, exist_ok=True)

def rot(p, deg, c=(0, 0)):
    a = math.radians(deg); x, y = p[0]-c[0], p[1]-c[1]
    return (c[0] + x*math.cos(a) - y*math.sin(a), c[1] + x*math.sin(a) + y*math.cos(a))

def pts(ps): return ' '.join(f'{x:.2f},{y:.2f}' for x, y in ps)

# ─────────────────────────────────────────────────────────── MARK A · Lozenge
# A diamond-set tile field with one subdivided "detail" quadrant.
def mark_a():
    C = (70, 70); s = []
    def sq(x, y, w, h):  # square in unrotated frame -> rotated 45 about centre
        p = [(x, y), (x+w, y), (x+w, y+h), (x, y+h)]
        return [rot((C[0]+px, C[1]+py), 45, C) for px, py in p]
    # outer hairline diamond
    s.append(f'<polygon points="{pts(sq(-48,-48,96,96))}" fill="none" '
             f'stroke="currentColor" stroke-width="1.6" opacity=".55"/>')
    G, S = 5.0, 35.5                       # grout gap, quadrant size (35.5+5+35.5 = 76)
    quads = [(-38,-38), (2,-38), (-38,2), (2,2)]
    for i, (qx, qy) in enumerate(quads):
        if i == 1:                          # one quadrant subdivided -> "the detail"
            t = (S - G) / 2
            for dx in (0, t+G):
                for dy in (0, t+G):
                    s.append(f'<polygon points="{pts(sq(qx+dx, qy+dy, t, t))}" fill="currentColor"/>')
        else:
            s.append(f'<polygon points="{pts(sq(qx,qy,S,S))}" fill="currentColor"/>')
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140" fill="none">{"".join(s)}</svg>'

# ───────────────────────────────────────────────────── MARK B · Craftsman seal
def hexagon(cx, cy, r):
    return [(cx + r*math.cos(math.radians(90 + k*60)),
             cy - r*math.sin(math.radians(90 + k*60))) for k in range(6)]

def mark_b():
    C = (70, 70); s = []
    s.append(f'<circle cx="70" cy="70" r="67" fill="none" stroke="currentColor" stroke-width="1.4"/>')
    s.append(f'<circle cx="70" cy="70" r="62" fill="none" stroke="currentColor" stroke-width="0.7" opacity=".6"/>')
    r = 10.4; d = math.sqrt(3) * r + 1.1     # neighbour distance + hairline gap
    cells = [(0, 0)] + [(d*math.cos(math.radians(k*60)), -d*math.sin(math.radians(k*60))) for k in range(6)]
    filled = {0, 1, 4}                       # centre + upper-right + lower-left
    for i, (dx, dy) in enumerate(cells):
        p = hexagon(C[0]+dx, C[1]+dy, r)
        if i in filled:
            s.append(f'<polygon points="{pts(p)}" fill="currentColor"/>')
        else:
            s.append(f'<polygon points="{pts(p)}" fill="none" stroke="currentColor" '
                     f'stroke-width="1.5" opacity=".78"/>')
    # ring text
    # top arc reads left->right over the top; bottom arc left->right under the bottom
    s.append('<defs><path id="rt" d="M 18.5,70 A 51.5,51.5 0 0 1 121.5,70"/>'
             '<path id="rb" d="M 21.5,70 A 48.5,48.5 0 0 0 118.5,70"/></defs>')
    s.append('<text font-family="Georgia,\'Times New Roman\',serif" font-size="11" letter-spacing="3.4" '
             'fill="currentColor"><textPath href="#rt" startOffset="50%" text-anchor="middle">'
             'DTI TILE CO.</textPath></text>')
    s.append('<text font-family="Georgia,\'Times New Roman\',serif" font-size="8.4" letter-spacing="2.8" '
             'fill="currentColor" opacity=".7"><textPath href="#rb" startOffset="50%" '
             'text-anchor="middle">ATLANTA · GEORGIA</textPath></text>')
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140" fill="none">{"".join(s)}</svg>'

# ────────────────────────────────────────────────────── MARK C · Herringbone
def mark_c():
    W = 27.0                                  # tile width; tiles are 2W x W
    tiles = []
    for i in range(-4, 5):
        for j in range(-4, 5):
            ox, oy = 3*i - 1*j, 1*i + 1*j     # lattice a=(3,1) b=(-1,1)
            tiles.append((ox, oy, 2, 1))      # horizontal
            tiles.append((ox+2, oy, 1, 2))    # vertical
    s = ['<defs><clipPath id="hbclip"><rect x="4" y="4" width="112" height="112" rx="3"/></clipPath></defs>',
         '<rect x="4" y="4" width="112" height="112" rx="3" fill="currentColor"/>',
         '<g clip-path="url(#hbclip)">']
    inset = 3.4                               # generous grout joint = graphic weight
    for (ox, oy, tw, th) in tiles:
        x, y = ox*W + inset, oy*W + inset
        w, h = tw*W - 2*inset, th*W - 2*inset
        p = [(x, y), (x+w, y), (x+w, y+h), (x, y+h)]
        p = [rot(q, 45, (0, 0)) for q in p]
        p = [(q[0] + 60, q[1] + 60) for q in p]
        if max(q[0] for q in p) < 0 or min(q[0] for q in p) > 120: continue
        if max(q[1] for q in p) < 0 or min(q[1] for q in p) > 120: continue
        cx = sum(q[0] for q in p) / 4; cy = sum(q[1] for q in p) / 4
        cls = 'hb-a' if math.hypot(cx - 60, cy - 60) < 26 else 'hb-t'
        s.append(f'<polygon points="{pts(p)}" class="{cls}"/>')
    s.append('</g>')
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">{"".join(s)}</svg>'

def mark_b_compact():
    C = (70, 70); s = []
    r = 19.0; d = math.sqrt(3) * r + 2.0
    cells = [(0, 0)] + [(d*math.cos(math.radians(k*60)), -d*math.sin(math.radians(k*60))) for k in range(6)]
    for i, (dx, dy) in enumerate(cells):
        p = hexagon(C[0]+dx, C[1]+dy, r)
        if i in {0, 1, 4}:
            s.append(f'<polygon points="{pts(p)}" fill="currentColor"/>')
        else:
            s.append(f'<polygon points="{pts(p)}" fill="none" stroke="currentColor" stroke-width="2.6"/>')
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140" fill="none">{"".join(s)}</svg>'

for name, svg in (('mark-a-lozenge', mark_a()), ('mark-b-seal', mark_b()),
                  ('mark-b-seal-compact', mark_b_compact()), ('mark-c-herringbone', mark_c())):
    open(os.path.join(OUT, name + '.svg'), 'w').write(svg)
    print(f'{name}.svg  {len(svg)} bytes')
