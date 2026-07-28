import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import type { Organism, StructureNode } from '@/types/content';
import { useLabelsHidden, useStore } from '@/state/store';
import { defaultRadius } from '@/three/geometry';

/**
 * A keyboard and screen-reader route into the 3D model.
 *
 * Everything else in the app was already reachable — the legend, the organism
 * list, the overlays and the multiple-choice questions are all real buttons.
 * The model was not, and that mattered more than it looks: the self-test's
 * "where is the peptidoglycan?" is answered by pointing at the cell, so half of
 * a feature built for learning was unavailable to anyone without a mouse.
 *
 * Pointing is replaced by a cursor that walks the cell from the outside in.
 * That ordering is not a convenience — it is the same relationship the model is
 * drawing. Moving through the layers of an envelope in order *is* the spatial
 * fact a mouse gets by hovering across them, so answering by position is the
 * same knowledge and not a lesser version of it.
 *
 * Announced as a listbox rather than a canvas, because a canvas announces
 * nothing. During a test the options give their position and withhold their
 * name, so a screen reader gets the question and not the answer.
 */

/** Structures ordered outside in — the order you would describe a cell in. */
export function outsideIn(structures: StructureNode[]): StructureNode[] {
  return [...structures]
    .filter((s) => s.clickable !== false)
    .sort(
      (a, b) =>
        (b.geometry?.radius ?? defaultRadius[b.kind]) -
        (a.geometry?.radius ?? defaultRadius[a.kind]),
    );
}

export function StructureListbox({ organism }: { organism: Organism }) {
  const selectedStructureId = useStore((s) => s.selectedStructureId);
  const hoverStructure = useStore((s) => s.hoverStructure);
  const selectStructure = useStore((s) => s.selectStructure);
  const quiz = useStore((s) => s.quiz);
  const answerQuiz = useStore((s) => s.answerQuiz);
  const labelsHidden = useLabelsHidden();

  const order = useMemo(() => outsideIn(organism.structures), [organism.structures]);
  const [cursor, setCursor] = useState(0);
  const [focused, setFocused] = useState(false);

  // Back to the outside for each new cell and each new question. A different
  // cell has a different set of layers, so a carried-over cursor lands on
  // something unrelated; and a question that begins wherever the last one ended
  // starts some students two layers in and others at the surface.
  const question = quiz ? quiz.index : -1;
  useEffect(() => setCursor(0), [organism.id, question]);

  // Follow a selection made with the mouse or from the legend, so the two ways
  // in never disagree about where the cursor is.
  useEffect(() => {
    if (!selectedStructureId) return;
    const at = order.findIndex((s) => s.id === selectedStructureId);
    if (at >= 0) setCursor(at);
  }, [selectedStructureId, order]);

  // The model lights the structure under the cursor exactly as it does under
  // the pointer — but only while this has focus, or moving the mouse elsewhere
  // would leave a stale highlight behind.
  const move = (to: number) => {
    const next = Math.max(0, Math.min(order.length - 1, to));
    setCursor(next);
    hoverStructure(order[next]?.id ?? null);
  };

  const commit = () => {
    const structure = order[cursor];
    if (!structure) return;
    if (quiz) answerQuiz(structure.id);
    else selectStructure(structure.id);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        move(cursor + 1);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        move(cursor - 1);
        break;
      case 'Home':
        move(0);
        break;
      case 'End':
        move(order.length - 1);
        break;
      case 'Enter':
      case ' ':
        commit();
        break;
      case 'Escape':
        if (quiz) return;
        selectStructure(null);
        break;
      default:
        return;
    }
    // Only once something was handled: arrow keys scroll the page otherwise,
    // and space scrolls it a long way.
    e.preventDefault();
  };

  if (order.length === 0) return null;
  const active = order[cursor];

  return (
    <div
      className="structure-listbox"
      role="listbox"
      tabIndex={0}
      aria-label={`Structures of ${organism.name}, ordered from the outside in`}
      aria-activedescendant={focused ? `structure-option-${active.id}` : undefined}
      onKeyDown={onKeyDown}
      onFocus={() => {
        setFocused(true);
        hoverStructure(active.id);
      }}
      onBlur={() => {
        setFocused(false);
        hoverStructure(null);
      }}
    >
      {order.map((structure, i) => (
        <div
          key={structure.id}
          id={`structure-option-${structure.id}`}
          role="option"
          aria-selected={structure.id === selectedStructureId}
          className="sr-only"
        >
          {labelsHidden
            ? // Position, not name. It is still an answerable question — the
              // layers of an envelope come in a fixed order — without being the
              // answer read aloud.
              `Structure ${i + 1} of ${order.length}, counting inward from the outside`
            : `${structure.name}. ${structure.group}. ${structure.summary}`}
        </div>
      ))}

      <p className="structure-listbox-hint" aria-hidden={!focused}>
        {focused ? (
          <>
            <kbd>↑</kbd>
            <kbd>↓</kbd> move through the layers ·{' '}
            <kbd>Enter</kbd> {quiz ? 'to answer' : 'to open'}
            {!quiz && (
              <>
                {' '}
                · <kbd>Esc</kbd> to reset
              </>
            )}
          </>
        ) : null}
      </p>
    </div>
  );
}
