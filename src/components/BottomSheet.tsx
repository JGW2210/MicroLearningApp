import { useState, type ReactNode } from 'react';

/**
 * A draggable-style bottom sheet for mobile: tap the handle to expand/collapse
 * between a peek height and near-full screen. Content scrolls inside.
 */
export function BottomSheet({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`bottom-sheet ${expanded ? 'expanded' : ''}`}>
      <button
        className="sheet-handle"
        onClick={() => setExpanded((e) => !e)}
        aria-label={expanded ? 'Collapse details' : 'Expand details'}
      >
        <span className="grip" />
      </button>
      <div className="sheet-body">{children}</div>
    </div>
  );
}
