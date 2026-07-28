# MicroLearningApp — handoff

Paste this into a fresh chat to pick the work up cold.

## Project

Interactive microbiology teaching app: a procedural 3D bacterial cell explorer plus a
Gram/stain module. React + TypeScript + Vite + three.js (react-three-fiber), zustand for state.

- **Repo**: `JGW2210/MicroLearningApp`, working dir `/home/user/MicroLearningApp`
- **Branch**: `main` (default).
- **Deploy**: GitHub Pages via `.github/workflows/deploy.yml`, triggers on push to `main`.
  Live at `https://jgw2210.github.io/MicroLearningApp/`.
- **Checks**: `npm run typecheck`, `npm test`, `npm run build`. CI runs all three on
  pull requests; the deploy workflow runs the tests itself before publishing.

## State of the feature list

The agreed list is complete. The last two items — **arrangement in 3D** and the
**structure-labelling self-test** — are described under "Architecture notes" below, since
they are now part of the app rather than work outstanding.

## Architecture notes worth knowing

### Content

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
- **`src/data/arrangements.ts`** — one short causal sentence per arrangement, plus how many
  differently-aimed division planes the form records. `rounds` there has to agree with the
  layouts in `three/arrangement.ts`, which is what actually generates the septa.

### Geometry

- **`src/three/body.ts`** — parametric cell bodies. Two invariants are enforced here and
  must keep holding:
  - `sweepableCoil()` guarantees no swept envelope layer is fatter than its centreline's
    radius of curvature (otherwise the tube folds through itself).
  - `nucleoidStrand()` keeps the chromosome inside the innermost membrane.
  Curved bodies are **exact analytic curves**, not Catmull-Rom splines — a spline fitted to
  a coil bends up to 28% tighter than the coil it sampled, which silently breaks the first
  invariant.

  It also carries three radii that are easy to confuse and mean different things:
  `sweptRadius` (widest shell — what the body's bends must carry), `contactRadius` (widest
  shell *excluding the capsule* — where two cells of a group touch, because capsules merge
  rather than hold cells apart), and `radialReach`/`cellRadius` (how far anything is drawn,
  including fringes and a swelling endospore — what the camera has to frame).
- **`src/three/shell.ts`** — `shellSurface`/`cappedTube`. Held apart from `StructureMesh`
  because an arrangement builds one envelope geometry and shares it across the whole group.
- **`src/three/clip.ts`** — the cutaway. The removed half is redrawn faintly against the
  complement plane rather than discarded. Only the focused cell is clipped; companions
  carry no clipping planes, so a group shows one cell opened up among closed ones.
- **`src/three/pointer.ts`** — distinguishes an orbit drag from a click, so releasing a
  drag over a structure does not select it.

### Arrangement in 3D

- **`src/three/arrangement.ts`** builds the group from *division events*, not coordinates:
  each cell records which cell it budded from and which round of division produced it, and
  the septum between them falls out of that pair. `MicroscopyField.tsx`'s `layout()` draws
  the same forms in 2D for the microscope view.
- **`src/three/Companions.tsx`** renders the other cells as envelope only (outermost solid
  layer plus capsule), sharing one geometry, taking no part in picking. `DivisionPlanes`
  draws each septum as a collar standing proud of the join, coloured by generation.
- `placements[0]` is always the focused cell with no offset and no rotation. That is load
  bearing: the clip plane is anchored at that cell's centre in world space, so moving or
  turning it would move the cut off-centre.
- The group is only drawn while the whole cell is what is being looked at — selecting a
  structure or switching to an overlay hides it and returns the camera to that cell.
- Framing: `groupFocus()` targets the group's bounding box centre, and `CameraRig` fits the
  camera **tangent to the bounding sphere** (`radius / sin(atan(fit))`, not `radius / fit`).
  The flat-disc fit under-shoots by 1/cos(half-angle), which is invisible on one cell and
  crops the ends off a chain. Scene fog and the rim-light rig both scale with `focus.radius`
  for the same reason: constants tuned for a close-up swallowed a whole group.

### Structure self-test

- **`src/data/quiz.ts`** builds a run: one question per selectable structure, alternating
  `locate` ("click the peptidoglycan" — answered on the model, using the existing
  `bestTarget()` picking) and `name` (a structure is lit, four names offered).
- **The answers leak from four unrelated places** — the legend in the left rail, the hover
  chip over the stage, the structures list, and the overlay callout pills. They are
  suppressed centrally through `useLabelsHidden()` in the store, *not* per component; a
  half-suppressed version publishes its own answer key. `QuizPanel` is the only surface
  allowed to print a name during a run, and only when naming it is the teaching.
- Leaving the module or changing organism ends the run, which is what keeps the Gram
  module's copy (`TestPanel`, `StainWalkthrough`) out of the problem entirely.
- Starting a run opens the cut to at least half, since half the answers are inside the cell.
- `dimStrength` (Scene → ProceduralCell → StructureMesh) pushes the unlit structures back
  harder under test than when browsing: at the browsing setting a lit scatter of ribosomes
  was not reliably distinguishable from an unlit one.

### Keyboard and screen-reader access

- **`src/components/StructureListbox.tsx`** is the model's keyboard route, and the only
  non-obvious piece. Everything else in the app was already reachable, because it is all
  real buttons; the canvas was not. It presents the organism's structures as an ARIA
  listbox ordered outside in, moves a cursor with the arrow keys that drives the same
  `hoverStructure` highlight the pointer does, and commits with Enter — to a selection
  normally, to an answer during a test.
- The outside-in ordering is the point rather than a convenience: walking an envelope's
  layers in order is the same spatial fact the pointer gets by hovering across them. So
  during a test the options announce **position only** — "Structure 3 of 7, counting
  inward from the outside" — which is answerable from real knowledge without reading the
  answer aloud.
- `tests/keyboard.test.ts` guards parity: a structure that is clickable but missing from
  the list is unreachable without a mouse, and nobody testing with a mouse will notice.
- `src/three/motion.ts` gates the camera fly and the nucleoid/plasmid spin on
  `prefers-reduced-motion`. The CSS side is a media query as usual; those two are not CSS.

## Verification

`npm test` (vitest, ~2.5s, node environment — no DOM or GL needed). `tests/` guards the
things that fail *silently*, which is a deliberately narrow brief: a folded cell wall
looks like a lighting artefact, a chromosome outside its membrane looks like a stylistic
choice, and a mistyped `targetStructureId` just quietly stops a drug appearing in a panel.

- `geometry.test.ts` — the two `body.ts` invariants, against every organism.
- `key.test.ts` — every organism resolves uniquely through the derived key, in ≤6 steps.
- `content.test.ts` — the id cross-references, envelope nesting, registry uniqueness.
- `arrangement.test.ts` — the focused cell stays at the group origin unrotated (the clip
  plane depends on it), and no layout emits more division rounds than
  `arrangementNote.rounds` claims.
- `quiz.test.ts` — a run covers each structure once and never omits its own answer,
  checked over 25 shuffles since the queue is randomised.
- `keyboard.test.ts` — the keyboard route offers exactly the structures the pointer can
  select, ordered outside in.

The suite was mutation-checked when written: flattening the coils fails the sweep test on
both coiled organisms, building the nucleoid loop in the world plane fails containment on
*H. pylori*, breaking a drug→structure id fails content, and disagreeing with
`arrangementNote.rounds` fails arrangement. Worth repeating the exercise if you add a
test — one that cannot fail is worse than none, because it reads like cover.

Two known non-failures worth understanding before you "fix" them: removing
`clampInsideBody` alone does not fail the nucleoid test, and neither does breaking the
radius budget alone. They are redundant on purpose, and each covers the other.

CI runs typecheck, tests and build on every pull request (`.github/workflows/checks.yml`),
and the deploy workflow runs the tests itself before publishing, so a red suite blocks the
live site rather than merely being visible beside it.

Visual checking is still manual: Playwright + Chromium (see Conventions), installed
ad hoc rather than as a dependency. Note that the headless SwiftShader renderer runs at
roughly 5 fps, so the camera's lerp needs several seconds to settle before a screenshot —
a shot taken too early looks like a framing bug.

## Known rough edges (not bugs to fix blindly — deliberate or low priority)

- The identification key opens on **shape**, not Gram category, because shape splits 17
  organisms eight ways and Gram only four. Defensible (both are read off the same film) but
  differs from a textbook key. Easy to pin Gram first if preferred.
- Hovering the envelope layers registers nothing in the half-cut view — the near surfaces
  are clipped and the ray resolves to inner structures. Pre-existing.
- *A. israelii*'s lower filament branch touches the upper trunk in the **2D** microscopy
  field, closing into a triangle rather than reading as an open branch
  (`MicroscopyField.tsx`, `filaments` layout). The 3D arrangement does not have this
  problem.
- A septum whose normal is the body's long axis is drawn exactly edge-on from the default
  camera, because the camera looks square across that axis. Cocci lean their groups off it
  so the plane opens up; elongated cells keep their own axis and the answer is to orbit.
- Picking is an onion: `bestTarget()` resolves to the smallest mesh under the ray, so each
  envelope layer is reachable only in the annular band where nothing smaller is also under
  the cursor. This is fine for browsing and the self-test makes it more noticeable than it
  used to be.
- The three.js chunk is ~850 kB. It is deferred rather than shrunk: nothing needs it
  until a 3D view is opened, and the home page's hero streams it in after paint. What
  has to arrive first is about 160 kB, and `vite.config.ts` fails the build if that
  grows past 250 kB or if three.js finds its way onto the critical path — which it did
  three times while the split was being set up, each time invisibly.

## Conventions

- Comments explain **why**, not what. Several encode reasoning that is expensive to
  rediscover (the curvature guard, the spline-tightening trap, the bounding-sphere camera
  fit, the ghost-clearing order in `StructureMesh.tsx`'s `onPointerOut`). Keep that style.
- Commit messages are prose explaining the reasoning and what was wrong before.
- Verify visually where it matters: Playwright + Chromium at `/opt/pw-browsers/chromium`
  (`--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader` for WebGL headless).
