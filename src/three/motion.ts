/**
 * Whether the viewer has asked for less movement.
 *
 * The CSS side of this is a media query, but the animations that matter most
 * here are not CSS: the camera flies across the scene when you select a
 * structure, and the chromosome turns on the spot while it is selected. Those
 * are the ones worth honouring — a large, unrequested camera move is a
 * classic vestibular trigger, and unlike a hover transition it cannot be
 * ignored by looking away from it.
 *
 * Read once and kept current by a listener, because the alternative is asking
 * the browser on every frame.
 */

const QUERY = '(prefers-reduced-motion: reduce)';

let reduced = false;
if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  const media = window.matchMedia(QUERY);
  reduced = media.matches;
  media.addEventListener('change', (e) => {
    reduced = e.matches;
  });
}

export function prefersReducedMotion(): boolean {
  return reduced;
}
