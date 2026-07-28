import type { Organism, StructureKind, StructureNode } from '@/types/content';
import { organisms } from './organisms';
import { isShell } from '@/three/geometry';

/**
 * Reading one cell against another.
 *
 * Structure ids are namespaced per organism — `sa-peptidoglycan`, not
 * `peptidoglycan` — so nothing about a selection carries across on its own.
 * What carries is `kind`, which is a shared vocabulary by design: it is what
 * the renderer dispatches on, so two organisms that both declare a
 * `peptidoglycan` are making the same claim about the same layer.
 *
 * That makes `kind` the right hinge for a comparison, and it makes *absence*
 * legible as well as presence: asking for the outer membrane of a
 * Gram-positive returns nothing, and the nothing is the lesson.
 */

/** Where a structure id lives, whichever organism owns it. */
export function findStructure(
  id: string | null,
): { organism: Organism; structure: StructureNode } | null {
  if (!id) return null;
  for (const organism of organisms) {
    const structure = organism.structures.find((s) => s.id === id);
    if (structure) return { organism, structure };
  }
  return null;
}

/**
 * What this organism shows for the current selection: its own structure if the
 * selection is its own, otherwise its equivalent layer.
 *
 * Selecting the wall in one cell should light the wall in both — that side by
 * side reading is the entire reason for showing two. Exact id first, so an
 * organism that ever carried two structures of one kind still resolves to the
 * one actually chosen.
 */
export function structureFor(
  organism: Organism,
  selectedId: string | null,
): StructureNode | undefined {
  if (!selectedId) return undefined;
  const own = organism.structures.find((s) => s.id === selectedId);
  if (own) return own;
  const selected = findStructure(selectedId);
  if (!selected) return undefined;
  return organism.structures.find((s) => s.kind === selected.structure.kind);
}

/** Envelope layers, outermost first — the order you would describe a cell in. */
export function envelopeOf(organism: Organism): StructureNode[] {
  return organism.structures.filter((s) => isShell(s.kind) || s.kind === 'lps');
}

/**
 * Kinds every bacterium has, whether or not a given model bothers to draw them.
 *
 * Their absence from an organism's `structures` is a decision about what that
 * diagram is for, never a fact about the organism — so reporting it as a
 * difference states a falsehood. The first run of this comparison announced
 * that E. coli has no ribosomes, which is both wrong and exactly the kind of
 * wrong a student would take away, since it appeared in the same list as the
 * genuine differences.
 */
const UNIVERSAL: StructureKind[] = ['cytoplasm', 'ribosomes', 'nucleoid'];

/**
 * What one cell has that the other does not.
 *
 * Derived rather than written, so it cannot describe a difference the models do
 * not actually show, and so it keeps up as organisms are authored. This is the
 * comparison that pays: the outer membrane and LPS on one side and the teichoic
 * acids on the other are exactly why the two take different drugs. Absence is
 * only reported where absence can be real — see `UNIVERSAL`.
 */
export function differences(
  a: Organism,
  b: Organism,
): { onlyInA: StructureNode[]; onlyInB: StructureNode[]; shared: StructureNode[] } {
  const kindsOf = (o: Organism) => new Set(o.structures.map((s) => s.kind));
  const inA = kindsOf(a);
  const inB = kindsOf(b);
  const tellsYouSomething = (s: StructureNode) => !UNIVERSAL.includes(s.kind);
  return {
    onlyInA: a.structures.filter((s) => !inB.has(s.kind) && tellsYouSomething(s)),
    onlyInB: b.structures.filter((s) => !inA.has(s.kind) && tellsYouSomething(s)),
    shared: a.structures.filter((s) => inB.has(s.kind)),
  };
}
