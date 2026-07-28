import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';

const COLLAPSED = 0.36; // fraction of the available height when peeking
const EXPANDED = 0.9;
const TAP_SLOP = 5; // px of movement below which a gesture counts as a tap

/**
 * A bottom sheet you can drag with a finger (pointer events, so it works on iOS
 * Safari) or tap to toggle. Height follows the drag and snaps to peek/expanded
 * on release. The canvas above is sized to the peek height, so the cell stays
 * fully visible while the sheet is collapsed.
 */
export function BottomSheet({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [parentH, setParentH] = useState(0);
  const [height, setHeight] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ startY: number; startH: number; moved: boolean } | null>(null);

  useEffect(() => {
    const measure = () => {
      const p = ref.current?.parentElement;
      if (p) setParentH(p.clientHeight);
      setHeight(null); // recollapse on resize / rotation
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const min = parentH * COLLAPSED;
  const max = parentH * EXPANDED;
  const h = height ?? min;
  const mid = (min + max) / 2;

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (!parentH) return;
    drag.current = { startY: e.clientY, startH: h, moved: false };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (!drag.current) return;
    const dy = drag.current.startY - e.clientY; // up = positive = taller
    if (Math.abs(dy) > TAP_SLOP) drag.current.moved = true;
    setHeight(Math.min(max, Math.max(min, drag.current.startH + dy)));
  };

  const onPointerUp = () => {
    if (!drag.current) return;
    if (!drag.current.moved) {
      // Treat as a tap: toggle.
      setHeight(h > mid ? min : max);
    } else {
      // Snap to whichever end is nearer.
      setHeight(h > mid ? max : min);
    }
    drag.current = null;
    setDragging(false);
  };

  return (
    <div
      ref={ref}
      className={`bottom-sheet ${dragging ? 'dragging' : ''} ${h > mid ? 'expanded' : ''}`}
      style={parentH ? { height: h } : undefined}
    >
      <button
        className="sheet-handle"
        aria-label="Drag or tap to resize details"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <span className="grip" />
      </button>
      <div className="sheet-body">{children}</div>
    </div>
  );
}
