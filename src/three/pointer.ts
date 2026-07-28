/**
 * Tells an orbit gesture apart from a click.
 *
 * OrbitControls and the structure picker share one pointer. A drag to rotate
 * ends with a pointerup wherever the cursor happens to be, and the browser —
 * and so react-three-fiber — reports that as a click on whatever mesh is under
 * it. Selecting on that meant almost every orbit finished by flying the camera
 * at some structure the user never meant to choose.
 *
 * So a gesture only counts as a click if the pointer barely moved. The slop is
 * in pixels rather than scene units because it is a description of the hand,
 * not of the model: a few pixels of travel is someone holding still, at any
 * zoom level.
 */
const DRAG_SLOP_PX = 5;

let origin: { x: number; y: number } | null = null;
let dragged = false;

function onDown(e: PointerEvent) {
  origin = { x: e.clientX, y: e.clientY };
  // Cleared here rather than on release, because the click that ends a gesture
  // is dispatched *after* pointerup and still needs to see the verdict.
  dragged = false;
}

function onMove(e: PointerEvent) {
  if (!origin) return;
  if (Math.hypot(e.clientX - origin.x, e.clientY - origin.y) > DRAG_SLOP_PX) dragged = true;
}

function onUp() {
  origin = null;
}

/** Start watching pointer gestures. Returns a teardown for effect cleanup. */
export function trackPointerGestures(): () => void {
  window.addEventListener('pointerdown', onDown, true);
  window.addEventListener('pointermove', onMove, true);
  window.addEventListener('pointerup', onUp, true);
  window.addEventListener('pointercancel', onUp, true);
  return () => {
    window.removeEventListener('pointerdown', onDown, true);
    window.removeEventListener('pointermove', onMove, true);
    window.removeEventListener('pointerup', onUp, true);
    window.removeEventListener('pointercancel', onUp, true);
  };
}

/** True if the gesture that just ended travelled far enough to be an orbit. */
export function wasDrag(): boolean {
  return dragged;
}

/** True while a pointer is down — i.e. the user is mid-gesture. */
export function isPointerDown(): boolean {
  return origin !== null;
}
