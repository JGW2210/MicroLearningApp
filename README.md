# MicroLearning — Interactive Microbiology

An interactive, three.js-powered atlas for learning clinical microbiology. Rotate a
bacterial cell in 3D, click any structure to zoom in and read about it, overlay where
antibiotics strike and how resistance defeats them, and walk through the Gram stain
reagent by reagent.

This repository is the **framework scaffold**: the full engine plus one deeply
authored organism (_Staphylococcus aureus_) as the template, and lighter "overview"
entries for the other Gram categories. Adding a new organism is data entry — no
rendering code required.

## Stack

- **React + [react-three-fiber](https://github.com/pmndrs/react-three-fiber)** — declarative three.js
- **[drei](https://github.com/pmndrs/drei)** — camera controls, HTML overlays
- **Vite + TypeScript**
- **Zustand** — navigation / selection state
- Procedural, stylized "textbook" 3D — no external 3D assets to license

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
npm run preview    # serve the production build
```

## Deploying to GitHub Pages

This is a Vite app, so GitHub Pages serves the **built** output (not the source
`index.html`, which points at `/src/main.tsx`). Two ways to publish it:

### Option A — GitHub Actions (recommended, no committed build artifacts)

A workflow at `.github/workflows/deploy.yml` builds the app and publishes it on every
push. One-time setup:

1. Push this branch (already the repo's default branch).
2. In the repo: **Settings → Pages → Build and deployment → Source → GitHub Actions**.

That's it — the next push builds and deploys automatically. The site goes live at
`https://<user>.github.io/<repo>/` (for this repo, `https://jgw2210.github.io/microlearningapp/`).
You can also trigger it manually from the **Actions** tab (“Deploy to GitHub Pages” →
Run workflow).

### Option B — commit a prebuilt folder

If you'd rather not use Actions:

```bash
npm run build
# copy dist/ to docs/ (or push dist to a gh-pages branch)
```

Then **Settings → Pages → Source → Deploy from a branch → /docs**. A `.nojekyll` file
is included so Pages serves the `assets/` folder untouched.

Either way, `vite.config.ts` sets `base: './'` so all asset paths are **relative** and
the app works correctly under the `/<repo>/` project-pages subpath.

## What's built

### 1. Bacterial Structure & Morphology (`structure` module)

- A procedural cell rendered as a **live cross-section** (a world-space clipping
  plane removes the front cap so every envelope layer shows as a concentric ring).
- **Click any structure** (in the 3D view or the legend) to smoothly zoom in; the
  info panel shows a summary, full description, and clinical relevance.
- **Teaching overlays**:
  - _Antibiotic targets_ — floating pins mark where each drug class acts; the panel
    explains the mechanism and which resistance defeats it.
  - _Resistance_ — pins mark the locus of each mechanism (gene, type, clinical impact).
- **Genomics** — resistance genes / variations and how each one changes treatment.

### 2. Gram Staining & Appearance (`gram` module)

- Four categories: **Gram-positive, Gram-negative, acid-fast, non-staining/atypical**,
  each with example species.
- **Interactive stain walkthrough** — step through crystal violet → iodine →
  decolouriser → safranin and watch why each category diverges.
- **Agar appearance** — a stylized petri dish per relevant medium (blood, MacConkey,
  Löwenstein-Jensen, …) rendered from data, with colony/halo descriptions.
- The interactive 3D cell sits alongside the stain lab.

## Project structure

```
src/
  types/content.ts         # The content schema (the backbone). Read this first.
  state/store.ts           # Zustand app state (module, selection, overlay, gram step)
  data/
    organisms/             # One file per organism + a registry index
    gramStainSteps.ts      # Shared stain-walkthrough steps
  three/
    Scene.tsx              # Canvas, lighting, cross-section clip plane
    ProceduralCell.tsx     # Assembles an organism's structures + overlay pins
    StructureMesh.tsx      # Procedural geometry per structure `kind`
    CameraRig.tsx          # Click-to-zoom camera animation
    geometry.ts / focus.ts # Geometry + camera-focus helpers
  components/              # React UI (modules, panels, agar plates, walkthrough)
```

## Adding a new organism

1. Create `src/data/organisms/<name>.ts` exporting an `Organism` (see
   `staphylococcus-aureus.ts` for the fully-worked template and every field).
2. Register it in `src/data/organisms/index.ts`.

That's it — it appears in the organism pickers, renders in 3D from its `structures`,
and populates the antibiotic/resistance/genomics/agar/gram views automatically.

### The `structures` array drives the 3D model

Each structure declares a `kind` that maps to a procedural geometry generator:

| kind | rendered as |
| --- | --- |
| `capsule`, `outer-membrane`, `peptidoglycan`, `mycolic-acid`, `cell-membrane`, `cytoplasm` | concentric spherical shell (cross-sectioned) |
| `teichoic-acid`, `lps`, `pili`, `fimbriae` | radial surface spikes/brush |
| `ribosomes` | scattered granules |
| `nucleoid` | supercoiled DNA (torus knot) |
| `plasmid` | small loop |
| `flagellum` | wavy projecting tube |

Optional `geometry` hints (`radius`, `thickness`, `count`, `opacity`, `glow`) tune the
look; sensible defaults are applied per kind.

## Roadmap ideas

- Split-view **compare** mode (two organisms side by side) — the store already has a
  `compareOrganismId` slot.
- Animated resistance mechanisms at the molecular site (β-lactamase cleaving a ring, etc.).
- Real micrograph / agar photo tab alongside the stylized renders.
- More organisms per category, and additional modules (metabolism, virulence factors).
- Code-splitting the three.js bundle (currently one chunk).

## Accuracy note

Content is authored for teaching and kept clinically faithful, but this is an
educational tool — not a substitute for current guidelines or primary references.
