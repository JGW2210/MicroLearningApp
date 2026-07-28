import { useMemo, useState } from 'react';
import type { Organism } from '@/types/content';
import { organisms } from '@/data/organisms';
import { bestAttribute, optionsFor, type KeyAttribute } from '@/data/key';
import { useStore } from '@/state/store';

interface Answered {
  question: string;
  answer: string;
  left: number;
}

/**
 * Work an unknown isolate down to a species, one observation at a time.
 *
 * The app could describe every organism in detail but never asked anything of
 * the reader. This runs the same information backwards: instead of picking a
 * name and being told its properties, you make observations and watch the
 * field narrow — which is the order the work actually happens in.
 *
 * The next question is chosen from what is still on the table rather than
 * followed down a fixed tree, so the panel also shows *why* a test is worth
 * running: a good one is a test whose answer you cannot already guess.
 */
export function IdentifyPanel() {
  const [candidates, setCandidates] = useState<Organism[]>(organisms);
  const [history, setHistory] = useState<Answered[]>([]);
  const [used, setUsed] = useState<Set<string>>(new Set());
  const [reveal, setReveal] = useState(false);
  const selectOrganism = useStore((s) => s.selectOrganism);

  const attr: KeyAttribute | null = useMemo(
    () => (candidates.length > 1 ? bestAttribute(candidates, used) : null),
    [candidates, used],
  );
  const options = useMemo(
    () => (attr ? optionsFor(candidates, attr) : []),
    [candidates, attr],
  );

  const answer = (label: string, remaining: Organism[]) => {
    if (!attr) return;
    setHistory((h) => [...h, { question: attr.question, answer: label, left: remaining.length }]);
    setUsed((u) => new Set(u).add(attr.id));
    setCandidates(remaining);
  };

  const restart = () => {
    setCandidates(organisms);
    setHistory([]);
    setUsed(new Set());
    setReveal(false);
  };

  const solved = candidates.length === 1;
  const stuck = !solved && !attr;

  return (
    <div className="panel-block">
      <h3>Identify an unknown</h3>
      <div className="sub">
        Make observations and watch the field narrow. Each question offered is the one
        that splits what is left most evenly — which is what makes it worth running.
      </div>

      <div className="id-progress">
        <span className="id-count">{candidates.length}</span>
        <span className="sub">
          {candidates.length === 1 ? 'candidate remains' : 'candidates remain'} of {organisms.length}
        </span>
        {history.length > 0 && (
          <button className="btn ghost" onClick={restart}>
            ↺ Start over
          </button>
        )}
      </div>

      {history.length > 0 && (
        <ol className="id-history">
          {history.map((h, i) => (
            <li key={i}>
              <span className="id-q">{h.question}</span>
              <span className="id-a">{h.answer}</span>
              <span className="id-left">→ {h.left} left</span>
            </li>
          ))}
        </ol>
      )}

      {solved ? (
        <div className="callout clinical">
          <span className="k">Identified — {candidates[0].name}</span>
          {candidates[0].morphology}. {candidates[0].clinicalNote}
          <div style={{ marginTop: 8 }}>
            <button className="btn primary" onClick={() => selectOrganism(candidates[0].id)}>
              Open {candidates[0].shortName}
            </button>
          </div>
        </div>
      ) : stuck ? (
        // Honest dead end: the app's data cannot separate these, and saying so
        // is better than inventing a distinction it does not hold.
        <div className="callout">
          <span className="k">No further observation separates these</span>
          {candidates.map((o) => o.shortName).join(', ')} share every property recorded here.
          Telling them apart needs something this app does not carry — serology, MALDI-TOF or
          sequencing.
        </div>
      ) : (
        attr && (
          <>
            <div className="id-question">{attr.question}</div>
            <div className="id-options">
              {options.map((o) => (
                <button
                  key={o.value}
                  className="id-option"
                  onClick={() => answer(o.label, o.remaining)}
                >
                  <span>{o.label}</span>
                  <span className="id-left">{o.remaining.length}</span>
                </button>
              ))}
            </div>
          </>
        )
      )}

      {!solved && candidates.length < organisms.length && (
        <div style={{ marginTop: 10 }}>
          <button className="btn ghost" onClick={() => setReveal(!reveal)}>
            {reveal ? 'Hide' : 'Show'} remaining candidates
          </button>
          {reveal && (
            <div className="id-candidates">
              {candidates.map((o) => (
                <span key={o.id} className="tag">
                  {o.shortName}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
