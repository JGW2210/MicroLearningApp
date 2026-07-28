# MicroLearning — Interactive Microbiology

An interactive, three.js-powered atlas for learning clinical microbiology. Open a
bacterial cell up in cross-section and click any structure to read about it, see the
group it really grows in, overlay where antibiotics strike and how resistance defeats
them, walk four differential stains reagent by reagent, and work a species out from a
Gram film and a bench result.

Seventeen organisms are authored: eight in full — every structure, antibiotic target,
resistance mechanism, genomic variation and agar appearance — and nine as lighter
`overview` entries that render and identify correctly but carry less depth. Adding
another is data entry against a schema; no rendering code changes.

## Stack

- **React + [react-three-fiber](https://github.com/pmndrs/react-three-fiber)** — declarative three.js
- **[drei](https://github.com/pmndrs/drei)** — camera controls, HTML overlays
- **Vite + TypeScript**, **Zustand** for navigation and selection state
- **Vitest** for the invariant and content checks
- Procedural, stylized "textbook" 3D — no external 3D assets to license

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # invariant, key, content and quiz checks (~2.5s)
npm run typecheck  # tsc --noEmit, covers src/ and tests/
npm run build      # type-check + production build
npm run preview    # serve the production build
```

CI runs typecheck, tests and build on every pull request. The deploy workflow runs the
tests itself before publishing, so a failing suite stops the site going out rather than
merely being visible beside it. See [Verification](#verification).

## What's built

### 1. Bacterial structure (`structure` module)

- A procedural cell rendered as a **live cross-section**: a world-space clipping plane
  faces the camera at any orbit angle, so every envelope layer reads as a concentric
  band. The removed half is redrawn faintly rather than discarded, so the cut shows a
  cell opened up rather than a cell with a piece missing. A depth slider runs it from
  intact to deep.
- **Click any structure** — in the 3D view or the legend — to fly the camera to it and
  read a summary, a full description and its clinical relevance.
- **Arrangement view** — the cell in the group it actually grows in (chains, tetrads,
  clusters, palisades, branching filaments), with the **division planes** that produced
  it marked and coloured by round. Arrangement follows from the plane a cell divides in
  and whether the daughters separate, and seeing the planes in three dimensions is what
  makes that causal rather than a list of shapes to memorise.
- **Structure self-test** — hides every label and asks where a named structure is, or
  what the highlighted one is called, scoring as you go.
- **Teaching overlays** — _antibiotic targets_ (leader-line callouts at the site each
  drug class acts on, with mechanism and the resistance that defeats it) and
  _resistance_ (the locus of each mechanism, its gene, type and clinical impact).
- An adaptive **scale bar** that stays honest across organisms drawn at different scene
  scales. Every cell is drawn at a comfortable size on screen, so scene units mean
  something different for each one; the bar converts back to real micrometres, across a
  range from 0.3 µm (*M. pneumoniae*) to 25 µm (*B. burgdorferi*) — a factor of eighty.

### 2. Gram staining and identification (`gram` module)

- **Four stains as data**, each stepped through reagent by reagent: Gram,
  Ziehl-Neelsen, the Schaeffer-Fulton endospore stain, and an India-ink capsule
  negative stain. Organisms that "barely stain" render as genuinely faint rather than
  in a pale colour, and a **colour-blind-safe palette** re-encodes the results for
  anyone who cannot read them by hue.
- **Microscopy field** — the organism as it appears on a slide, drawn from its shape and
  arrangement, alongside an **arrangement gallery** that puts the forms side by side.
- **Nine bench tests** (catalase, coagulase, oxidase, urease, indole, lactose, motility,
  optochin, bacitracin) defined once, with organisms carrying only their results.
- **An identification key that is derived, not authored.** It recomputes the best next
  question each time from whichever observation splits the remaining candidates most
  evenly, so it cannot drift from the organism data and it demonstrates the reasoning —
  a good test is one whose answer you cannot guess. Every organism resolves uniquely, in
  six questions or fewer (asserted in `tests/key.test.ts`).
- **Agar appearance** — a stylized plate per relevant medium (blood, MacConkey,
  Löwenstein-Jensen, …) rendered from data, with colony and haemolysis descriptions.

## Verification

`npm test` runs Vitest in a node environment — no DOM or GL needed, because everything
guarded is a pure function over the data.

The suite is deliberately narrow: it covers the failures that are **silent**. A swept
envelope layer fatter than its centreline's bend folds through itself and renders as a
pinched wall that reads as a lighting artefact; a chromosome that escapes its membrane
reads as a stylistic choice; a mistyped `targetStructureId` produces no error at all, it
just quietly stops a drug appearing in the panel that would have listed it. React
rendering is not covered, because review catches that.

| File | Guards |
| --- | --- |
| `tests/geometry.test.ts` | Both `three/body.ts` invariants, against every organism |
| `tests/key.test.ts` | Every organism resolves uniquely through the derived key |
| `tests/content.test.ts` | Id cross-references, envelope nesting, registry uniqueness |
| `tests/arrangement.test.ts` | Group-layout promises the renderer and copy depend on |
| `tests/quiz.test.ts` | A run covers each structure once and never omits its own answer |

If you add a check, mutation-test it — break the thing it names and confirm it goes red.
A test that cannot fail is worse than none, because it reads like cover.

`npm run build` carries one more guard, in `vite.config.ts`: it fails if three.js reaches
the critical path or if the JavaScript needed before first paint exceeds 250 kB. Both are
easy to undo by accident and invisible in the chunk listing when you do — see the comment
there.

## Deploying to GitHub Pages

This is a Vite app, so Pages serves the **built** output, not the source `index.html`
(which points at `/src/main.tsx`). Two ways to publish it:

### Option A — GitHub Actions (recommended, no committed build artifacts)

`.github/workflows/deploy.yml` tests, builds and publishes on every push to `main`.
One-time setup: **Settings → Pages → Build and deployment → Source → GitHub Actions**.

The site goes live at `https://<user>.github.io/<repo>/` — for this repo,
<https://jgw2210.github.io/MicroLearningApp/>. You can also trigger it by hand from the
**Actions** tab ("Deploy to GitHub Pages" → Run workflow).

### Option B — commit a prebuilt folder

```bash
npm run build
# copy dist/ to docs/ (or push dist to a gh-pages branch)
```

Then **Settings → Pages → Source → Deploy from a branch → /docs**. A `.nojekyll` file is
included so Pages serves the `assets/` folder untouched.

Either way, `vite.config.ts` sets `base: './'` so asset paths are **relative** and the app
works under the `/<repo>/` project-pages subpath as well as from a domain root.

## Project structure

```
src/
  types/content.ts       # The content schema — the backbone. Read this first.
  state/store.ts         # Zustand state (module, selection, overlay, cut depth, test)
  data/
    organisms/           # One file per organism + a registry index
    stains.ts            # Four stain protocols + the colour-blind-safe palette
    tests.ts             # The nine bench tests, defined once
    key.ts               # The derived identification key
    arrangements.ts      # What each arrangement is, and the division it records
    quiz.ts              # Question generation for the structure self-test
  three/
    Scene.tsx            # Canvas, lighting, fog, clip plane, focus selection
    ProceduralCell.tsx   # Assembles an organism's structures + overlay callouts
    StructureMesh.tsx    # Procedural geometry and picking, per structure `kind`
    body.ts              # Parametric cell bodies; the two geometry invariants
    arrangement.ts       # Group layouts, built from division events
    Companions.tsx       # The rest of the group, plus the division planes
    shell.ts             # Envelope surfaces, shared between cell and companions
    clip.ts / focus.ts   # The cutaway, and what the camera should frame
    CameraRig.tsx        # Focus animation and bounding-sphere fit
    pointer.ts           # Tells an orbit drag from a click
  components/            # React UI — modules, panels, plates, walkthrough, self-test
tests/                   # Vitest suites (see Verification)
```

## Adding a new organism

1. Create `src/data/organisms/<name>.ts` exporting an `Organism` (see
   `staphylococcus-aureus.ts` for the fully-worked template and every field).
2. Register it in `src/data/organisms/index.ts`.

That's it — it appears in the organism pickers, renders in 3D from its `structures`,
lays out in its arrangement, joins the identification key, and populates the
antibiotic, resistance, genomics, agar and stain views automatically.

Run `npm test` afterwards. The suite checks the new entry's id cross-references, that
its envelope layers nest, that its body's bends can carry its widest layer, that its
chromosome fits inside its membrane, and that it still resolves uniquely through the key
— all things that otherwise fail without an error message.

### The `structures` array drives the 3D model

Each structure declares a `kind` that maps to a procedural geometry generator:

| kind | rendered as |
| --- | --- |
| `capsule`, `outer-membrane`, `peptidoglycan`, `mycolic-acid`, `cell-membrane`, `cytoplasm` | closed shell swept along the cell body, sliced by the cross-section |
| `teichoic-acid`, `lps`, `pili`, `fimbriae` | radial surface filaments, each with its own form |
| `ribosomes` | granules crowded into the cytoplasm around the nucleoid |
| `nucleoid` | a closed, supercoiled circular chromosome fitted to the cell |
| `plasmid` | small independent closed loops, out toward the envelope |
| `inclusion` | storage granules |
| `endospore` | a spore at its authored position, bulging the cell if it is wider |
| `flagellum` | filament on a basal body — or endoflagella inside a spirochaete |

Optional `geometry` hints (`radius`, `thickness`, `count`, `opacity`, `glow`, `position`)
tune the look; sensible defaults are applied per kind.

## Roadmap

Agreed and queued, roughly in order:

- [x] Arrangement in 3D, with the division planes that produce each form
- [x] Structure-labelling self-test
- [x] Invariant/content test suite and CI on pull requests
- [x] Refresh this README
- [x] Code-split the three.js bundle
- [ ] Keyboard and screen-reader access to the model — there are no keyboard handlers
      anywhere yet, which makes the self-test unanswerable without a pointer
- [ ] Split-view **compare** mode; the store has a `compareOrganismId` slot that is not
      yet wired to anything, and the clip plane and camera focus would need to become
      per-cell rather than module singletons
- [ ] Deepen the nine `overview` organisms to `deep`
- [ ] Animated resistance mechanisms at the molecular site (β-lactamase cleaving a ring,
      an efflux pump clearing a drug)

Considered and deferred: a real micrograph / agar photo tab. It is the one idea that
breaks the no-external-assets rule above, and it needs licence and attribution diligence
that the rest of the app does not.

## A note on how it is built

Two things are worth knowing before changing anything under `three/`.

**The curved bodies are exact analytic curves, not splines.** A Catmull-Rom fitted to a
coil bends up to 28% tighter than the coil it sampled, which silently defeats the
clearance calculation that keeps swept layers from folding through themselves.

**The identification key is derived, not authored.** Do not replace it with a
hand-written tree — as written it cannot contradict the organism data, and a tree can.

**Nothing eager may import the organism registry.** It is 134 kB of prose, and importing
it for so much as a count puts all of it in front of the first paint. The home page's
organism count is fetched after mount for exactly this reason. The build fails if it
creeps back.

`HANDOFF.md` carries the fuller version, including the parts that are load-bearing and
not obvious from reading the code.

## Accuracy note

Content is authored for teaching and kept clinically faithful, but this is an
educational tool — not a substitute for current guidelines or primary references.
