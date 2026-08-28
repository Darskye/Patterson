# VAN OPS — hacker-van screen graphics

Nine interactive screens for the panel-van sequence: Leo breaking into Hallowell House
to pull the shipping manifest that proves the stolen artifacts are in the basement.

Everything runs offline in a browser. No build step, no install, no internet on the day.

---

## Run it

```bash
./serve.sh          # macOS / Linux   (serve.bat on Windows)
```

Then open **http://localhost:8080/** on every monitor. That page is the console — click a
card to open that screen in its own window, drag the window to the display you want, press
**F** for fullscreen. Repeat for each monitor.

> Double-clicking the HTML files also works and still looks right, but the browser blocks
> screen-to-screen messaging on `file://`, so the monitors won't move together. Use the
> server if you want the wall to react as one.

**`wall.html`** shows every screen at once on a single display — for checking the whole
rig before the shoot, or driving a rehearsal off one laptop. Click a pane to hand it the
keyboard, then press `1`-`5` and watch the others follow. Narrow it with
`wall.html?screens=schematic,cameras,terminal`. It's a setup tool: on the day, run one
screen per monitor, fullscreen.

---

## The one thing to know

**Every keyboard drives every screen.** Press a key on any monitor and the whole wall
responds together. A presenter clicker works too — its arrow keys step forward and back.

| Key | What the whole wall does |
|---|---|
| `1` `2` `3` `4` `5` | Jump to a story phase: Recon / Breach / Inside / Vault / Exfil |
| `←` `→` | Step the phase back / forward (clicker-friendly) |
| `A` | **ALARM** — everything goes red at once |
| `X` | Glitch burst across all monitors |
| `B` | Blackout flash — for cutting the power |
| `T` | Cycle look: phosphor green / amber / ice blue |
| `G` | Scanlines + vignette on/off (turn off if your camera moirés) |
| `F` | Fullscreen this monitor |
| `?` | Show the keymap card |

The five phases are the sequence. Hit `3` and the cameras start looping, the alarm zones
go to bypass, the floodlights die, the route lights up on the schematic and the girl's
dot moves up the drive — all on different monitors, all at once.

---

## The screens

| Screen | What it is | Screen keys |
|---|---|---|
| **Schematic** | Hallowell House in plan — three levels plus the basement vault. Rooms, door swings, patrol, camera cones, sensors, and the animated route in. Click any room to inspect it. | `Q` `W` `E` level · `R` route · `Z` bypass · `V` vault |
| **Cameras** | One feed at a time, full frame. Plays your own footage; scroll to zoom into it, scroll sideways for the next camera. Full CCTV grade over the top. | scroll · `←` `→` · `Q`…`O` jump · `E` look · `L`/`K` loop |
| **Shell** | The hero. An eleven-stage intrusion into the freight company, ending on the decrypted bill of lading. | see below |
| **Network map** | Lateral movement across the estate network; hosts flip to OWNED as the intrusion walks in. | `Space` advance · `\` drop |
| **Key recovery** | Eight reels falling one at a time onto the vault code, with a thermal read of the keypad. | `Space` run · `\` reset |
| **Building systems** | Power, alarm zones, mag-locks, climate. Releasing a door here opens it on the schematic. | `Z` zones · `O` doors · `P` mains |
| **Signal intercept** | Spectrum, waterfall, direction finder, and the guards' radio traffic typing itself out. | `↑` `↓` tune · `Space` hold |
| **Ground trace** | The estate from above — the van, the girl walking in, the patrol, the truck booked for six. | `Tab` next unit |
| **Data wall** | Pure background plate. Nothing to drive; point a camera at it. | — |

### Your own camera footage

Open the **Cameras** screen and either drag your clips onto the window or click
**LOAD FOOTAGE** and point it at the folder. Every video in it becomes a channel, in
filename order — nothing is renamed or copied. Drop them in `vanops/media/` instead and
they load themselves every time.

- **scroll** zooms into the footage, centred on the pointer, up to 6x
- **scroll sideways** (or shift+scroll on a mouse) moves to the next camera
- **drag** pans while zoomed, **double-click** snaps back
- **`E`** cycles the look: off / light / full / heavy — grade, sensor grain, scanlines,
  chroma split, dropped frames, block tearing, all drawn over your clip
- channels with no clip fall back to the drawn plate, so the screen is never blank

If a channel reads **NOSIG**, Chrome can't decode that file — usually ProRes or HEVC in a
`.mov`. One line fixes it:

```bash
ffmpeg -i "yourclip.mov" -c:v libx264 -crf 18 -pix_fmt yuv420p -an "cam1.mp4"
```

### Shooting the terminal

It boots in **SCRIPT MODE**. The actor mashes the keyboard and the hack types itself —
correctly, at a good pace, the same every take. Nothing they type can break it.

- **any key** — types the next chunk, then runs that stage
- **`M`** — slams the decrypted manifest up over the shell (the payoff card)
- **`\`** — resets to stage zero for the next take
- **backtick** — switches to LIVE MODE, a real prompt if you want a shot of him typing a
  specific command (`help` lists them; `run` plays the whole intrusion by itself)

The hack drives the wall as it goes — stage 3 pushes everyone to BREACH, stage 5 to
INSIDE, the last stage to VAULT and opens the manifest.

---

## Changing the names

Every character, place and prop name lives in one block at the top of
**`assets/data.js`** — `FICTION`. Change it there and all nine screens update.

```js
operator:  'LEO',                  // him
handle:    'GHOSTLINE',            // his handle, all over the terminal
partner:   'RAVEN',                // her
estate:    'HALLOWELL HOUSE',
address:   '1180 HALLOWELL RD',
shipper:   'MERIDIAN FREIGHT & BONDED WAREHOUSE',
```

Below that in the same file: the floor plans (`FLOORS`), the camera list, the manifest
line items and chain of custody (`MANIFEST`), the radio dialogue (`CHATTER`), and the
network hosts. All plain data — edit the text, reload the page.

To redraw a room, change its `x, y, w, h` in `FLOORS`. The plan is a 1000 × 700 grid at
22 units per metre.

---

## Notes for the DP

- Nothing is pure black or pure white — highlights sit around `#d0ffe8` so they don't
  bloom wide open, and the darkest tone is `#04070a` so shadows don't crush.
- If the scanline overlay beats against your sensor, press `G` to kill it. Everything
  still reads.
- Amber (`T`) photographs warmer and reads older/CRT; ice blue is colder and more clinical.
  Green is the default.
- Camera feeds and background noise are seeded, so two takes of the same screen match
  frame for frame. Guard positions and patrol timing repeat exactly.
- Want real plates instead of the drawn camera feeds? Drop clips into `media/` and swap
  the canvas for a `<video>` in `screens/cameras.html` — the OSD overlay stays put.

---

## What's inside

```
index.html          the console / launcher
wall.html           all nine on one display, for setup and rehearsal
screens/            the nine monitors
assets/core.css     design tokens, panel chrome, CRT overlay
assets/core.js      cue bus, keymap, shared animation loop
assets/data.js      ALL the fiction — names, floor plans, manifest, dialogue
vendor/             augmented-ui (BSD-2-Clause) — the notched sci-fi panel borders
media/              drop your own camera plates here
```

Type is JetBrains Mono when there's internet, and falls back cleanly to the system
monospace when there isn't. Everything else is hand-drawn SVG and canvas — no CDN,
no runtime downloads, nothing to fail on location.
