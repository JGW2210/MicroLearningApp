import { describe, expect, it } from 'vitest';
import { organisms } from '@/data/organisms';
import { buildQuiz, quizzable, highlightedStructure, startState } from '@/data/quiz';

/**
 * A test that gives away its answers, or cannot be answered, is worse than no
 * test. The shuffle means neither failure would show up reliably by playing a
 * round, so each organism's questions are built repeatedly here.
 */

/** Rounds per organism. The queue is shuffled, so once proves nothing. */
const ROUNDS = 25;

describe.each(organisms.map((o) => [o.shortName, o] as const))('%s', (_name, organism) => {
  const pool = quizzable(organism);

  it('has enough selectable structures to be worth a run', () => {
    expect(pool.length).toBeGreaterThanOrEqual(2);
  });

  it('asks about each structure exactly once, in every shuffle', () => {
    for (let round = 0; round < ROUNDS; round++) {
      const asked = buildQuiz(organism).map((q) => q.structureId).sort();
      expect(asked).toEqual(pool.map((s) => s.id).sort());
    }
  });

  it('always offers the right answer among the choices', () => {
    for (let round = 0; round < ROUNDS; round++) {
      for (const q of buildQuiz(organism)) {
        expect(q.options, `${q.structureId} not among its own options`).toContain(q.structureId);
        expect(new Set(q.options).size, 'duplicate option').toBe(q.options.length);
        // Distractors come from the same organism, so the answer is never
        // settled by noticing that three of four names belong elsewhere.
        for (const id of q.options) {
          expect(pool.map((s) => s.id)).toContain(id);
        }
      }
    }
  });

  it('exercises both kinds of question wherever it can', () => {
    const modes = new Set(buildQuiz(organism).map((q) => q.mode));
    expect(modes.has('locate')).toBe(true);
    if (pool.length > 1) expect(modes.has('name')).toBe(true);
  });
});

describe('what the model gives away', () => {
  it('lights nothing while a locate question is open', () => {
    for (const organism of organisms) {
      for (let round = 0; round < ROUNDS; round++) {
        const quiz = startState(organism);
        // The first question of a run is always a locate question; highlighting
        // its target would be handing over the answer.
        if (quiz.questions[0].mode !== 'locate') continue;
        expect(highlightedStructure(quiz)).toBeNull();
      }
    }
  });

  it('lights the target once the question is answered, right or wrong', () => {
    const organism = organisms[0];
    const quiz = startState(organism);
    const target = quiz.questions[0].structureId;
    const wrong = quizzable(organism).find((s) => s.id !== target)!.id;
    expect(highlightedStructure({ ...quiz, picked: wrong })).toBe(target);
    expect(highlightedStructure({ ...quiz, picked: target })).toBe(target);
  });

  it('points at something for a name question, since otherwise there is no question', () => {
    for (const organism of organisms) {
      const quiz = startState(organism);
      const named = quiz.questions.find((q) => q.mode === 'name');
      if (!named) continue;
      const at = quiz.questions.indexOf(named);
      expect(highlightedStructure({ ...quiz, index: at })).toBe(named.structureId);
    }
  });
});
