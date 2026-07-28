import { useState } from 'react';
import type { Organism, TestId } from '@/types/content';
import { organisms } from '@/data/organisms';
import {
  HAEMOLYSIS_INFO,
  OUTCOME_COLOR,
  OUTCOME_LABEL,
  getTest,
  testDefinitions,
} from '@/data/tests';

/**
 * The step between the stain and the diagnosis.
 *
 * Microscopy gets you to "Gram-positive cocci in clusters" and stops; naming the
 * species is biochemistry. Each result here is shown with what the test would
 * have said about everything else, because a test is only worth running for what
 * it rules out — a lone "catalase positive" teaches nothing, while "catalase
 * positive, which excludes every streptococcus" is the actual reasoning.
 */
export function TestPanel({ organism }: { organism: Organism }) {
  const [open, setOpen] = useState<TestId | null>(null);
  const haem = HAEMOLYSIS_INFO[organism.haemolysis];

  /** How many other organisms in the app share this result. */
  const narrowing = (id: TestId) => {
    const mine = organism.tests[id];
    if (!mine || mine === 'not-applicable') return null;
    const tested = organisms.filter((o) => {
      const r = o.tests[id];
      return r && r !== 'not-applicable';
    });
    const same = tested.filter((o) => o.tests[id] === mine);
    return { same: same.length, of: tested.length };
  };

  const applicable = testDefinitions.filter((t) => {
    const r = organism.tests[t.id];
    return r && r !== 'not-applicable';
  });

  return (
    <div className="panel-block">
      <h3>Bench tests</h3>
      <div className="sub">
        A stain and an arrangement narrow {organism.shortName} to a genus at best. These are
        what carry it to a species.
      </div>

      {organism.haemolysis !== 'not-applicable' && (
        <div className="haem-row">
          <span className="haem-swatch" style={{ background: haem.color }} />
          <div>
            <strong style={{ fontSize: 13 }}>Haemolysis — {haem.label}</strong>
            <div className="sub" style={{ marginTop: 2 }}>{haem.detail}</div>
          </div>
        </div>
      )}

      {applicable.length === 0 ? (
        <p style={{ fontSize: 13 }}>
          {organism.shortName} is not identified by routine bench biochemistry — it needs
          serology, PCR or special culture, which is itself the diagnostic clue.
        </p>
      ) : (
        <div className="test-grid">
          {applicable.map((t) => {
            const result = organism.tests[t.id]!;
            const n = narrowing(t.id);
            const isOpen = open === t.id;
            return (
              <button
                key={t.id}
                className={`test-row ${isOpen ? 'active' : ''}`}
                onClick={() => setOpen(isOpen ? null : t.id)}
                aria-expanded={isOpen}
              >
                <span className="test-name">{t.name}</span>
                <span className="test-result" style={{ color: OUTCOME_COLOR[result] }}>
                  {OUTCOME_LABEL[result]}
                </span>
                {n && (
                  <span className="test-narrow">
                    {n.same} of {n.of}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {open && getTest(open) && (
        <div className="callout">
          <span className="k">{getTest(open)!.question}</span>
          {getTest(open)!.principle}
          <div className="sub" style={{ marginTop: 6 }}>
            <strong>Positive:</strong> {getTest(open)!.reads.positive} ·{' '}
            <strong>Negative:</strong> {getTest(open)!.reads.negative}
          </div>
          <div className="sub" style={{ marginTop: 6 }}>
            <strong>Why it is run:</strong> {getTest(open)!.discriminates}
          </div>
        </div>
      )}
    </div>
  );
}
