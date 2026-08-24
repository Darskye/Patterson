# DTITile — website redesign concepts

Three complete, self-contained homepage concepts for **DTITile** (dtitile.com), a tile and
natural-stone installer serving the Atlanta Metro. Each concept has its own logo, palette,
type pairing and interaction model.

| | Concept | Direction | Type | Accent |
|---|---|---|---|---|
| **A** | **Atelier** | Dark editorial luxury, heavy scroll-driven motion | Cormorant Garamond · Inter | Brass `#C6A461` |
| **B** | **Journal** | Warm architectural-magazine, typographic, restrained | Fraunces · Inter | Clay `#B0532B` |
| **C** | **Grid** | Bone-and-ink modular grid, bold and contemporary | Archivo · JetBrains Mono | Kiln `#FF4D18` |

## Layout

```
src/         authored HTML (uses {{IMG:name}} and {{SVG:name}} tokens)
assets/      optimised WebP photography, three widths each (620 / 1100 / 1800)
logos/       the three logo marks as SVG (+ a compact variant of mark B)
dist/        built, fully self-contained HTML — open directly in a browser
screenshots/ rendered captures used during review
```

## Build

`build.py` inlines every image as a `data:` URI and every logo as inline SVG, so each page in
`dist/` is a single file with no external dependencies except Google Fonts.

```bash
python3 build.py                 # build all
python3 build.py site1-atelier.html   # build one
python3 optimize.py [SRC_DIR]    # re-encode source PNGs to WebP
```

Helper scripts for review (require Playwright + Chromium):

```bash
node shot.js <file> <out.png> [w] [h] [fullPage] [waitMs]
node scroll-shots.js <file> <outPrefix> [w] [h] [steps]
```

## Content accuracy

Accurate to the live site: the DTITile name, the Atlanta Metro service area, the phone number
**404.384.8819**, the service categories, and the "precision and polish, detail and such" line.

Placeholder, to confirm before launch:

- Statistics (24 years, 1,400+ rooms, 18 communities) are illustrative.
- Testimonials and project locations are written examples, not real reviews.
- Spec-sheet tolerances in concept C are industry-typical values.
- Photography is AI-generated, styled on the three real job photos from dtitile.com. It is
  intended to be replaced with real job photography — the layouts are built to take it.
- Forms show a success state but do not submit anywhere.
- No photographs of the owner or crew appear anywhere in the concepts.
