import type { Organism, StructureNode } from '@/types/content';

/**
 * The structure self-test.
 *
 * Recognising a labelled diagram is not the same skill as recognising the thing
 * itself, and the app spends most of its time teaching the first. So the test
 * takes the labels away and asks the two questions the labels were answering:
 * *where* is this structure, and *what* is this one. They are deliberately not
 * the same question — pointing at the peptidoglycan when told its name, and
 * naming the layer being pointed at, fail in different ways — so a run
 * alternates between them.
 *
 * Everything the test hides is hidden centrally (see `labelsHidden` in the
 * store) rather than per component. A half-suppressed version gives away its own
 * answers: the hover chip, the legend, the structures list and the overlay
 * callouts all name the same structures, and any one of them left on is a
 * complete answer key.
 */

export type QuizMode = 'locate' | 'name';

export interface QuizQuestion {
  /** The structure being asked about — the right answer either way. */
  structureId: string;
  mode: QuizMode;
  /** `name` mode only: the ids offered as answers, the right one among them. */
  options: string[];
}

export interface QuizState {
  organismId: string;
  questions: QuizQuestion[];
  index: number;
  /** Structure id the student picked for the current question; null until answered. */
  picked: string | null;
  correct: number;
  /** Structures answered wrongly — what is worth going back over afterwards. */
  missed: string[];
}

/** How many names a `name` question offers, target included. */
const OPTION_COUNT = 4;

/** Structures the test can ask about: the ones the model lets you select. */
export function quizzable(organism: Organism): StructureNode[] {
  return organism.structures.filter((s) => s.clickable !== false);
}

export function buildQuiz(organism: Organism): QuizQuestion[] {
  const pool = quizzable(organism);
  const order = shuffle(pool.map((s) => s.id));

  return order.map((structureId, i) => {
    // Distractors come from the same organism, so the choice is never settled by
    // noticing that three of the four names belong to a different cell.
    const others = shuffle(order.filter((id) => id !== structureId));
    return {
      structureId,
      mode: i % 2 === 0 ? 'locate' : 'name',
      options: shuffle([structureId, ...others.slice(0, OPTION_COUNT - 1)]),
    };
  });
}

export function startState(organism: Organism): QuizState {
  return {
    organismId: organism.id,
    questions: buildQuiz(organism),
    index: 0,
    picked: null,
    correct: 0,
    missed: [],
  };
}

export function currentQuestion(quiz: QuizState): QuizQuestion | null {
  return quiz.questions[quiz.index] ?? null;
}

/** True once every question has been answered. */
export function isFinished(quiz: QuizState): boolean {
  return quiz.index >= quiz.questions.length;
}

/**
 * What the model should light up.
 *
 * Nothing while a `locate` question is open — highlighting the answer would be
 * the answer. A `name` question has to point at something to be a question at
 * all, and once either kind is answered the right structure is shown, whether or
 * not that is what the student picked.
 */
export function highlightedStructure(quiz: QuizState): string | null {
  const q = currentQuestion(quiz);
  if (!q) return null;
  return quiz.picked !== null || q.mode === 'name' ? q.structureId : null;
}

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
