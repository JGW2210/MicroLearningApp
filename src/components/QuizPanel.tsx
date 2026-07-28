import type { Organism, StructureNode } from '@/types/content';
import { useStore } from '@/state/store';
import { currentQuestion, isFinished, quizzable } from '@/data/quiz';

/**
 * The structure self-test, and the only surface allowed to print a structure
 * name while a run is going.
 *
 * It names one at a time and only when naming it is the teaching: the target of
 * a `locate` question (you are being asked where it is, not what it is called),
 * and both the answer and whatever was picked instead once a question is closed.
 * Everything else — the legend, the hover chip, the structures list, the overlay
 * callouts — stays dark for the whole run; see `useLabelsHidden`.
 */
export function QuizPanel({ organism }: { organism: Organism }) {
  const quiz = useStore((s) => s.quiz);
  const nextQuestion = useStore((s) => s.nextQuestion);
  const answerQuiz = useStore((s) => s.answerQuiz);
  const endQuiz = useStore((s) => s.endQuiz);
  const startQuiz = useStore((s) => s.startQuiz);

  if (!quiz) return null;

  const find = (id: string): StructureNode | undefined =>
    organism.structures.find((s) => s.id === id);
  const total = quiz.questions.length;

  if (isFinished(quiz)) {
    const missed = quiz.missed.map(find).filter((s): s is StructureNode => Boolean(s));
    return (
      <div className="panel-block">
        <div className="rail-label" style={{ marginTop: 0 }}>
          Structure test — finished
        </div>
        <div className="quiz-score">
          <span className="quiz-score-n">{quiz.correct}</span>
          <span className="quiz-score-d">/ {total}</span>
        </div>
        {missed.length === 0 ? (
          <p>Every structure named and placed. Try another organism — the layers differ.</p>
        ) : (
          <>
            <div className="rail-label">Worth another look</div>
            {missed.map((s) => (
              <div key={s.id} className="list-row" style={{ cursor: 'default' }}>
                <div className="title">
                  <span className="swatch" style={{ background: s.color }} />
                  {s.name}
                </div>
                <div className="desc">{s.summary}</div>
              </div>
            ))}
          </>
        )}
        <div className="walk-controls" style={{ marginTop: 12 }}>
          <button className="btn primary" onClick={() => startQuiz(organism)}>
            Test again
          </button>
          <button className="btn" onClick={endQuiz}>
            Back to the model
          </button>
        </div>
      </div>
    );
  }

  const question = currentQuestion(quiz)!;
  const target = find(question.structureId)!;
  const answered = quiz.picked !== null;
  const right = quiz.picked === question.structureId;
  const picked = quiz.picked ? find(quiz.picked) : undefined;

  return (
    <div className="panel-block">
      <div className="quiz-head">
        <div className="rail-label" style={{ margin: 0 }}>
          Structure test
        </div>
        <span className="quiz-progress">
          {quiz.index + 1} / {total} · {quiz.correct} right
        </span>
      </div>

      <div className="quiz-dots">
        {quiz.questions.map((q, i) => (
          <span
            key={q.structureId}
            className={`quiz-dot ${
              i > quiz.index || (i === quiz.index && !answered)
                ? ''
                : quiz.missed.includes(quiz.questions[i].structureId)
                  ? 'wrong'
                  : 'right'
            } ${i === quiz.index ? 'current' : ''}`}
          />
        ))}
      </div>

      {question.mode === 'locate' ? (
        <>
          <h3 className="quiz-ask">
            Where is the <em>{target.name}</em>?
          </h3>
          <div className="sub">
            {answered
              ? 'It is lit up on the model.'
              : 'Click it on the cell. Orbit to turn the cell, and use the cross-section slider to reach anything inside it.'}
          </div>
        </>
      ) : (
        <>
          <h3 className="quiz-ask">What is the highlighted structure?</h3>
          <div className="quiz-options">
            {question.options.map((id) => {
              const option = find(id);
              if (!option) return null;
              const state = !answered
                ? ''
                : id === question.structureId
                  ? 'right'
                  : id === quiz.picked
                    ? 'wrong'
                    : 'spent';
              return (
                <button
                  key={id}
                  className={`quiz-option ${state}`}
                  disabled={answered}
                  onClick={() => answerQuiz(id)}
                >
                  {option.name}
                </button>
              );
            })}
          </div>
        </>
      )}

      {answered && (
        <>
          <div className={`callout ${right ? 'clinical' : 'warn'}`} style={{ marginTop: 12 }}>
            <span className="k">{right ? 'Correct' : 'Not this one'}</span>
            {!right && picked && question.mode === 'locate' && (
              <div style={{ marginBottom: 6 }}>
                You picked the <strong>{picked.name}</strong>.
              </div>
            )}
            {!right && question.mode === 'name' && (
              <div style={{ marginBottom: 6 }}>
                The highlighted structure is the <strong>{target.name}</strong>.
              </div>
            )}
            {target.summary}
          </div>
          <div className="walk-controls" style={{ marginTop: 10 }}>
            <button className="btn primary" onClick={nextQuestion}>
              {quiz.index + 1 === total ? 'See score' : 'Next'}
            </button>
            <button className="btn" onClick={endQuiz}>
              Stop
            </button>
          </div>
        </>
      )}

      {!answered && (
        <div className="walk-controls" style={{ marginTop: 12 }}>
          <button className="btn" onClick={endQuiz}>
            Stop the test
          </button>
        </div>
      )}
    </div>
  );
}

/** Starts a run — shown wherever the info panel normally lives. */
export function QuizStartButton({ organism }: { organism: Organism }) {
  const startQuiz = useStore((s) => s.startQuiz);
  const count = quizzable(organism).length;
  if (count < 2) return null;
  return (
    <button className="btn primary quiz-start" onClick={() => startQuiz(organism)}>
      Test yourself · {count} structures
    </button>
  );
}
