import * as THREE from 'three';

/**
 * The live cross-section plane.
 *
 * It passes through the cell centre and faces the camera, so the near half of
 * the cell is always removed and you look straight into the exposed interior —
 * a true half-cell cut, at any orbit angle. It is applied per-material (see
 * `CLIP_PLANES`) rather than globally on the renderer, so annotation geometry
 * (callout dots, leader lines) is never sliced.
 *
 * The same plane backs the raycast filter, so clicks ignore hits that land on
 * the removed half and fall through to what is actually visible.
 */
export const clipPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);

/** Stable array identity for material `clippingPlanes` props. */
export const CLIP_PLANES = [clipPlane];

const _dir = new THREE.Vector3();

/**
 * Re-aim the plane so it faces the camera, cutting through `center` shifted by
 * `offset` along the view axis.
 *
 * The cut surface sits at `center + offset · viewDir`, so a positive offset
 * moves it toward the viewer (a shallower cut that keeps more of the cell) and a
 * negative offset pushes it past the centre (a deeper cut). Offset 0 is an
 * exact half-cell.
 */
export function updateClipPlane(
  cameraPos: THREE.Vector3,
  center: THREE.Vector3,
  offset = 0,
) {
  _dir.copy(cameraPos).sub(center);
  if (_dir.lengthSq() < 1e-8) return;
  _dir.normalize();
  // Keep the far side: distance(p) = dir · (center - p) + offset >= 0.
  clipPlane.normal.copy(_dir).negate();
  clipPlane.constant = _dir.dot(center) + offset;
}

/**
 * True when a point lies on the removed half (three.js discards fragments whose
 * signed distance is negative). The epsilon keeps points sitting exactly on the
 * cut face — where the callout anchors live — on the visible side.
 */
export function isClipped(point: THREE.Vector3): boolean {
  return clipPlane.distanceToPoint(point) < -0.02;
}
