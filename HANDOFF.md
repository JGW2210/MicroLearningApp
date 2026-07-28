# MicroLearningApp — handoff

Paste this into a fresh chat to pick the work up cold.

## Project

Interactive microbiology teaching app: a procedural 3D bacterial cell explorer plus a
Gram/stain module. React + TypeScript + Vite + three.js (react-three-fiber), zustand for state.

- **Repo**: `JGW2210/MicroLearningApp`, working dir `/home/user/MicroLearningApp`
- **Branch**: `main` (default). Latest commit `d2b0bb8`.
- **Deploy**: GitHub Pages via `.github/workflows/deploy.yml`, triggers on push to `main`.
  Live at `https://jgw2210.github.io/MicroLearningApp/`.
- **Checks**: `npm run typecheck`, `npm run build`. There is no test runner.

## Remaining tasks

Two items are outstanding from an agreed feature list. Both were deliberately not started
rather than rushed.

### 1. Arrangement in 3D

Render the cell **group** in its real arrangement in the 3D scene, not one isolated cell —
a chain of streptococci, a tetrad, a palisade. Arrangement follows from the plane the cell
divides in and whether daughters separate, so seeing it in 3D explains *why* each form
arises rather than just cataloguing it.

- `organism.arrangement` (type `CellArrangement`) already exists and is authored for all 17
  organisms. The 2D layouts in `src/components/MicroscopyField.tsx` (`layout()`) are a
  working reference for the geometry of each form.
- The 3D cell is built by `ProceduralCell` from a single `CellBody` (`src/three/body.ts`).
  Expect to add a transform set (position + rotation per cell) and instance the whole cell.
- **Watch out**: `wholeCellFocus()` in `src/three/focus.ts` fits the camera from
  `body.radius`/`body.length` only. It already under-fits things protruding past the
  envelope (a swelling endospore); a multi-cell group will break framing outright unless
  the focus radius accounts for the whole arrangement's extent.
- Perf: each cell is already many meshes (every shell is drawn twice for the ghost half).
  A chain of 7 will multiply that — consider instancing or a reduced LOD for non-focused cells.

### 2. Structure-labelling self-test

Hide the labels on the 3D model and have the student name each structure, scoring as they go.

- **The hard part**: the answer leaks from several places at once. Labels appear in
  `InfoPanel.tsx`, the hover chip in `Scene.tsx`'s `stage-overlay`, the callout pills in
  `ProceduralCell.tsx` (`Callouts`), and `TestPanel`/`StainWalkthrough` copy. A half-done
  version gives away its own answers. Suppress them centrally — a store flag read by every
  labelled surface — rather than per-component.
- Structures are `organism.structures[]`, each with `id`, `name`, `shortLabel`, `group`.
  Picking is already solved: `bestTarget()` in `StructureMesh.tsx` resolves a click to the
  smallest visible mesh, so "click the peptidoglycan" works without new hit-testing.

## Architecture notes worth knowing

- **`src/data/organisms/*.ts`** — one file per organism, registered in `index.ts`. Each is a
  full `Organism` (schema in `src/types/content.ts`): structures, antibiotics, resistance,
  genomics, agar, gramStain, plus `arrangement`, `tests`, `haemolysis`.
- **`src/data/stains.ts`** — four stain protocols (Gram, Ziehl-Neelsen, Schaeffer-Fulton,
  India ink) as data. Includes the colour-blind-safe palette map and `faintFor`, which
  renders "barely stains" as genuine faintness rather than a pale colour.
- **`src/data/tests.ts`** — nine bench tests defined once; organisms carry only results.
- **`src/data/key.ts`** — the identification key is **derived**, not authored: it recomputes
  the best next question by which observation splits remaining candidates most evenly. Do
  not replace it with a hand-written tree; it cannot drift from the data as written.
- **`src/three/body.ts`** — parametric cell bodies. Two invariants are enforced here and
  must keep holding:
  - `sweepableCoil()` guarantees no swept envelope layer is fatter than its centreline's
    radius of curvature (otherwise the tube folds through itself).
  - `nucleoidStrand()` keeps the chromosome inside the innermost membrane.
  Curved bodies are **exact analytic curves**, not Catmull-Rom splines — a spline fitted to
  a coil bends up to 28% tighter than the coil it sampled, which silently breaks the first
  invariant.
- **`src/three/clip.ts`** — the cutaway. The removed half is redrawn faintly against the
  complement plane rather than discarded.
- **`src/three/pointer.ts`** — distinguishes an orbit drag from a click, so releasing a
  drag over a structure does not select it.

## Verification scripts

Not in the repo — recreate if needed. They bundle `src/three/body.ts` with esbuild and
assert the two geometry invariants, and walk every organism through the identification key
checking each resolves uniquely (17/17 at last run). Worth re-running after any change to
`body.ts` or to organism radii.

## Known rough edges (not bugs to fix blindly — deliberate or low priority)

- The identification key opens on **shape**, not Gram category, because shape splits 17
  organisms eight ways and Gram only four. Defensible (both are read off the same film) but
  differs from a textbook key. Easy to pin Gram first if preferred.
- Hovering the envelope layers registers nothing in the half-cut view — the near surfaces
  are clipped and the ray resolves to inner structures. Pre-existing.
- *A. israelii*'s lower filament branch touches the upper trunk, closing into a triangle
  rather than reading as an open branch (`MicroscopyField.tsx`, `filaments` layout).
- Long rods sit tight against the edges of a tall narrow viewport — same `wholeCellFocus`
  limitation noted above.

## Conventions

- Comments explain **why**, not what. Several encode reasoning that is expensive to
  rediscover (the curvature guard, the spline-tightening trap, the ghost-clearing order in
  `StructureMesh.tsx`'s `onPointerOut`). Keep that style.
- Commit messages are prose explaining the reasoning and what was wrong before.
- Verify visually where it matters: Playwright + Chromium at `/opt/pw-browsers/chromium`
  (`--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader` for WebGL headless).
