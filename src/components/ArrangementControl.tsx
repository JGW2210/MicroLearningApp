import type { Organism } from '@/types/content';
import { useStore } from '@/state/store';
import { arrangementNote } from '@/data/arrangements';
import { GENERATION_COLORS } from '@/three/Companions';

/**
 * The switch between one cell and the group it really grows in.
 *
 * Kept as a switch rather than as the default because the two views answer
 * different questions: a single cell is what you cut open to find the ribosomes,
 * and the group is what you read off a slide. Showing the group always would
 * shrink the cell being studied to a fraction of the frame for the sake of
 * context you only sometimes want.
 */
export function ArrangementControl({ organism }: { organism: Organism }) {
  const showArrangement = useStore((s) => s.showArrangement);
  const setShowArrangement = useStore((s) => s.setShowArrangement);
  const showDivisionPlanes = useStore((s) => s.showDivisionPlanes);
  const setShowDivisionPlanes = useStore((s) => s.setShowDivisionPlanes);
  const note = arrangementNote[organism.arrangement];
  // Single cells are the one arrangement with nothing joined, so there is no
  // plane to draw and the toggle would do nothing.
  const hasPlanes = note.rounds > 0;
  const rounds = ['1st division plane', '2nd', '3rd'].slice(0, note.rounds);

  return (
    <div className="arr-control">
      <div className="rail-label" style={{ marginTop: 0 }}>
        View
      </div>
      <div className="seg">
        <button
          className={showArrangement ? '' : 'active'}
          onClick={() => setShowArrangement(false)}
        >
          Single cell
        </button>
        <button
          className={showArrangement ? 'active' : ''}
          onClick={() => setShowArrangement(true)}
        >
          Arrangement
        </button>
      </div>

      {showArrangement && (
        <>
          <div className="callout" style={{ marginTop: 10 }}>
            <span className="k">{note.label}</span>
            {note.why}
          </div>
          {hasPlanes && (
            <>
              <button
                className={`btn ghost ${showDivisionPlanes ? 'active' : ''}`}
                style={{ marginTop: 8, width: '100%' }}
                onClick={() => setShowDivisionPlanes(!showDivisionPlanes)}
                aria-pressed={showDivisionPlanes}
              >
                {showDivisionPlanes ? '◉' : '○'} Division planes
              </button>
              {showDivisionPlanes && rounds.length > 1 && (
                <div className="plane-key">
                  {rounds.map((label, i) => (
                    <span key={label} className="chip">
                      <span className="swatch" style={{ background: GENERATION_COLORS[i] }} />
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
