import { create } from 'zustand';
import type { Organism } from '@/types/content';
import { currentQuestion, isFinished, startState, type QuizState } from '@/data/quiz';

export type ModuleId = 'home' | 'structure' | 'gram';

/** Which teaching overlay is active on the 3D cell. */
export type OverlayMode = 'none' | 'antibiotics' | 'resistance';

interface AppState {
  module: ModuleId;
  organismId: string | null;
  /** Currently focused structure (drives camera zoom + info panel). */
  selectedStructureId: string | null;
  hoveredStructureId: string | null;
  overlay: OverlayMode;
  /** Selected antibiotic/resistance detail id for the info panel. */
  selectedMechanismId: string | null;
  /** Index into the gram-stain walkthrough steps, -1 = not started. */
  gramStep: number;
  /** Compare mode: a second organism to show side-by-side. */
  compareOrganismId: string | null;
  /** Cross-section depth: 0 = intact cell, 0.5 = cut exactly in half, higher = deeper. */
  cutDepth: number;
  /**
   * Re-encode the stain palette for red-green colour blindness. Persisted, since
   * it is an accessibility need rather than a per-visit preference.
   */
  colourBlindSafe: boolean;
  /** Show the cell in its real arrangement — the group, not one isolated cell. */
  showArrangement: boolean;
  /** ...and mark the planes the group divided down. */
  showDivisionPlanes: boolean;
  /** The structure self-test, or null when not testing. */
  quiz: QuizState | null;

  goToModule: (module: ModuleId) => void;
  selectOrganism: (id: string | null) => void;
  selectStructure: (id: string | null) => void;
  hoverStructure: (id: string | null) => void;
  setOverlay: (overlay: OverlayMode) => void;
  selectMechanism: (id: string | null) => void;
  setGramStep: (step: number) => void;
  setCompareOrganism: (id: string | null) => void;
  setCutDepth: (depth: number) => void;
  setColourBlindSafe: (on: boolean) => void;
  setShowArrangement: (on: boolean) => void;
  setShowDivisionPlanes: (on: boolean) => void;
  startQuiz: (organism: Organism) => void;
  answerQuiz: (structureId: string) => void;
  nextQuestion: () => void;
  endQuiz: () => void;
  reset: () => void;
}

/** Cut depth is clamped so the cell is never completely removed. */
export const MAX_CUT_DEPTH = 0.9;

/**
 * The test cannot be taken with the cell shut, because half its answers are
 * inside. Anything shallower than this is opened back up when a run starts.
 */
const TEST_MIN_CUT = 0.5;

export const useStore = create<AppState>((set, get) => ({
  module: 'home',
  organismId: null,
  selectedStructureId: null,
  hoveredStructureId: null,
  overlay: 'none',
  selectedMechanismId: null,
  gramStep: -1,
  compareOrganismId: null,
  cutDepth: 0.5,
  colourBlindSafe:
    typeof localStorage !== 'undefined' && localStorage.getItem('cb-safe') === '1',
  showArrangement: false,
  showDivisionPlanes: true,
  quiz: null,

  goToModule: (module) =>
    set({
      module,
      selectedStructureId: null,
      selectedMechanismId: null,
      overlay: 'none',
      gramStep: module === 'gram' ? -1 : -1,
      // Leaving the module abandons the run. That also settles the labels in
      // the stain walkthrough and the bench tests, which name structures freely
      // and would otherwise have to know about the test.
      quiz: null,
    }),
  selectOrganism: (id) =>
    set((state) => ({
      organismId: id,
      compareOrganismId: state.compareOrganismId === id ? null : state.compareOrganismId,
      selectedStructureId: null,
      selectedMechanismId: null,
      overlay: 'none',
      // A run is about one cell; changing the cell ends it rather than silently
      // scoring answers against an organism the student is no longer looking at.
      quiz: null,
    })),
  selectStructure: (id) => set({ selectedStructureId: id, selectedMechanismId: null }),
  hoverStructure: (id) => set({ hoveredStructureId: id }),
  // Switching teaching mode also drops the current zoom, so the overlay's
  // callouts are framed against the whole cell rather than a close-up.
  setOverlay: (overlay) =>
    set({ overlay, selectedMechanismId: null, selectedStructureId: null }),
  selectMechanism: (id) => set({ selectedMechanismId: id }),
  setGramStep: (step) => set({ gramStep: step }),
  // Comparing a cell with itself is not a comparison, and the picker offers the
  // current organism only until the primary changes underneath it.
  setCompareOrganism: (id) =>
    set((state) => ({
      compareOrganismId: id === state.organismId ? null : id,
      // Two groups side by side is a picture of nothing in particular.
      showArrangement: id ? false : state.showArrangement,
    })),
  setCutDepth: (depth) =>
    set({ cutDepth: Math.min(MAX_CUT_DEPTH, Math.max(0, depth)) }),
  setColourBlindSafe: (on) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem('cb-safe', on ? '1' : '0');
    set({ colourBlindSafe: on });
  },
  setShowArrangement: (on) =>
    set((state) => ({
      showArrangement: on,
      compareOrganismId: on ? null : state.compareOrganismId,
    })),
  setShowDivisionPlanes: (on) => set({ showDivisionPlanes: on }),

  startQuiz: (organism) =>
    set({
      quiz: startState(organism),
      organismId: organism.id,
      // Clear everything that either names a structure or moves the camera off
      // the whole cell, so every run starts from the same view of a bare model.
      selectedStructureId: null,
      selectedMechanismId: null,
      hoveredStructureId: null,
      overlay: 'none',
      showArrangement: false,
      // A run is about knowing one cell. A second one beside it is a reference
      // book left open next to the exam.
      compareOrganismId: null,
      cutDepth: Math.max(get().cutDepth, TEST_MIN_CUT),
    }),

  answerQuiz: (structureId) => {
    const quiz = get().quiz;
    // Only the first pick counts, and only while a question is open — otherwise
    // a stray click on the model would overwrite an answer already given.
    if (!quiz || quiz.picked !== null) return;
    const question = currentQuestion(quiz);
    if (!question) return;
    const right = structureId === question.structureId;
    set({
      quiz: {
        ...quiz,
        picked: structureId,
        correct: quiz.correct + (right ? 1 : 0),
        missed: right ? quiz.missed : [...quiz.missed, question.structureId],
      },
    });
  },

  nextQuestion: () => {
    const quiz = get().quiz;
    if (!quiz || quiz.picked === null) return;
    set({ quiz: { ...quiz, index: quiz.index + 1, picked: null } });
  },

  endQuiz: () => set({ quiz: null, selectedStructureId: null }),

  reset: () =>
    set({
      module: 'home',
      organismId: null,
      selectedStructureId: null,
      hoveredStructureId: null,
      overlay: 'none',
      selectedMechanismId: null,
      gramStep: -1,
      compareOrganismId: null,
      cutDepth: 0.5,
      showArrangement: false,
      quiz: null,
    }),
}));

/**
 * Whether the structure names have to stay hidden.
 *
 * Read by every surface that would otherwise print one. This is a single flag on
 * purpose: the names are shown in four places that know nothing about each
 * other, and suppressing them one component at a time is how a test ends up
 * quietly publishing its own answers.
 */
export function useLabelsHidden(): boolean {
  return useStore((s) => s.quiz !== null && !isFinished(s.quiz));
}
