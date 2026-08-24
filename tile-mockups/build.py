#!/usr/bin/env python3
"""Inline images + logo SVGs into self-contained HTML.

Source files in src/ use tokens:
    {{IMG:01-marble-master-bath-1100}}   -> data:image/webp;base64,...
    {{SVG:mark-a-lozenge}}               -> inline <svg> markup
"""
import base64, os, re, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC, DIST = os.path.join(ROOT, 'src'), os.path.join(ROOT, 'dist')
ASSETS, LOGOS = os.path.join(ROOT, 'assets'), os.path.join(ROOT, 'logos')
os.makedirs(DIST, exist_ok=True)

_cache = {}
def img_uri(name):
    if name not in _cache:
        p = os.path.join(ASSETS, name + '.webp')
        if not os.path.exists(p):
            raise SystemExit(f'!! missing asset: {p}')
        _cache[name] = 'data:image/webp;base64,' + base64.b64encode(open(p, 'rb').read()).decode()
    return _cache[name]

def svg_markup(name):
    p = os.path.join(LOGOS, name + '.svg')
    if not os.path.exists(p):
        raise SystemExit(f'!! missing logo: {p}')
    return open(p).read().strip()

def build(fn):
    html = open(os.path.join(SRC, fn)).read()
    used = set()
    def sub_img(m):
        used.add(m.group(1)); return img_uri(m.group(1))
    html = re.sub(r'\{\{IMG:([A-Za-z0-9_-]+)\}\}', sub_img, html)
    html = re.sub(r'\{\{SVG:([A-Za-z0-9_-]+)\}\}', lambda m: svg_markup(m.group(1)), html)
    left = re.findall(r'\{\{[^}]+\}\}', html)
    if left:
        raise SystemExit(f'!! unresolved tokens in {fn}: {sorted(set(left))}')
    out = os.path.join(DIST, fn)
    open(out, 'w').write(html)
    mb = len(html.encode()) / 1e6
    flag = '  ** OVER 16MB **' if mb > 16 else ''
    print(f'{fn:24s} {mb:6.2f} MB   {len(used):2d} images{flag}')
    return mb

if __name__ == '__main__':
    targets = sys.argv[1:] or sorted(f for f in os.listdir(SRC) if f.endswith('.html'))
    for f in targets:
        build(f)
