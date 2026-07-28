import { useStore, MAX_CUT_DEPTH } from '@/state/store';

/** Label describing what the current cut reveals. */
function describe(depth: number): string {
  if (depth <= 0.02) return 'Intact cell';
  if (depth < 0.35) return 'Shallow';
  if (depth < 0.62) return 'Half';
  return 'Deep';
}

/** Slider controlling how far the cross-section cuts into the cell. */
export function CutDepthSlider() {
  const cutDepth = useStore((s) => s.cutDepth);
  const setCutDepth = useStore((s) => s.setCutDepth);

  return (
    <div className="cut-slider">
      <div className="cut-slider-head">
        <span className="rail-label" style={{ margin: 0 }}>
          Cross-section
        </span>
        <span className="cut-value">{describe(cutDepth)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={MAX_CUT_DEPTH}
        step={0.01}
        value={cutDepth}
        aria-label="Cross-section depth"
        onChange={(e) => setCutDepth(parseFloat(e.target.value))}
      />
      <div className="cut-ticks">
        <button type="button" onClick={() => setCutDepth(0)}>
          Whole
        </button>
        <button type="button" onClick={() => setCutDepth(0.5)}>
          Half
        </button>
        <button type="button" onClick={() => setCutDepth(MAX_CUT_DEPTH)}>
          Deep
        </button>
      </div>
    </div>
  );
}
