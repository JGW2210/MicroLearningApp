import type { Organism } from '@/types/content';
import { useStore } from '@/state/store';
import { gramStainSteps } from '@/data/gramStainSteps';

/** Interactive Gram-stain reagent walkthrough with an animated cell preview. */
export function StainWalkthrough({ organism }: { organism: Organism }) {
  const step = useStore((s) => s.gramStep);
  const setStep = useStore((s) => s.setGramStep);

  const total = gramStainSteps.length;
  const current = step >= 0 ? gramStainSteps[step] : null;
  const cellColor = current
    ? current.colorByCategory[organism.gramCategory]
    : '#2a3550';
  const isCocci = /cocci/i.test(organism.morphology);

  return (
    <div className="panel-block">
      <h3>Gram stain walkthrough</h3>
      <div className="sub">
        Follow each reagent and watch why {organism.shortName} ends up{' '}
        {organism.gramStain.microscopyAppearance.toLowerCase()}.
      </div>

      <div className="stepper">
        {gramStainSteps.map((_, i) => (
          <div
            key={i}
            className={`step-dot ${i < step ? 'done' : i === step ? 'current' : ''}`}
          />
        ))}
      </div>

      <div className="stain-cell-wrap">
        <StainCells color={cellColor} cocci={isCocci} visible={organism.gramCategory !== 'non-staining' || step < 0} />
      </div>

      {current ? (
        <>
          <div style={{ marginTop: 12 }}>
            <strong style={{ fontSize: 14 }}>
              {step + 1}. {current.reagent}
            </strong>
            <span className="sub" style={{ marginLeft: 8 }}>{current.action}</span>
          </div>
          <p style={{ fontSize: 13 }}>{current.detail}</p>
        </>
      ) : (
        <p style={{ fontSize: 13, marginTop: 12 }}>
          Press <strong>Start</strong> to run the stain one reagent at a time.
        </p>
      )}

      {step === total - 1 && (
        <div className="callout clinical">
          <span className="k">Result — {organism.gramStain.category}</span>
          {organism.gramStain.microscopyAppearance}. {organism.gramStain.explanation}
        </div>
      )}

      <div className="walk-controls">
        <button className="btn" disabled={step < 0} onClick={() => setStep(step - 1)}>
          ← Back
        </button>
        {step < total - 1 ? (
          <button className="btn primary" onClick={() => setStep(step + 1)}>
            {step < 0 ? 'Start' : 'Next reagent →'}
          </button>
        ) : (
          <button className="btn" onClick={() => setStep(-1)}>
            ↺ Restart
          </button>
        )}
      </div>
    </div>
  );
}

/** A tiny cluster of cocci or rods that takes on the current stain colour. */
function StainCells({ color, cocci, visible }: { color: string; cocci: boolean; visible: boolean }) {
  const opacity = visible ? 1 : 0.12;
  const stroke = '#0a0f1a';
  return (
    <svg viewBox="0 0 120 90" width="220" height="165" aria-hidden>
      {cocci ? (
        // Grape-like cluster of cocci.
        [
          [45, 38],
          [58, 34],
          [70, 40],
          [52, 48],
          [65, 52],
          [40, 50],
          [76, 50],
          [58, 60],
        ].map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r="9"
            fill={color}
            stroke={stroke}
            strokeWidth="1"
            style={{ transition: 'fill 0.4s ease', opacity }}
          />
        ))
      ) : (
        // Scattered rods (bacilli).
        [
          [30, 30, 20],
          [60, 26, -15],
          [78, 44, 40],
          [40, 55, 10],
          [64, 60, -25],
        ].map(([x, y, rot], i) => (
          <rect
            key={i}
            x={x}
            y={y}
            width="26"
            height="11"
            rx="5.5"
            fill={color}
            stroke={stroke}
            strokeWidth="1"
            transform={`rotate(${rot} ${x + 13} ${y + 5.5})`}
            style={{ transition: 'fill 0.4s ease', opacity }}
          />
        ))
      )}
    </svg>
  );
}
