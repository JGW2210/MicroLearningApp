import * as THREE from 'three';
import { tubeSegments, type CellBody } from './body';

/**
 * The closed surfaces every envelope layer is drawn from.
 *
 * Held apart from the meshes that use them because a cell is not always rendered
 * alone: an arrangement draws the same envelope again for each companion cell in
 * the group, and building one geometry to share is the difference between one
 * swept tube and nine.
 */

const CAP_UP = new THREE.Vector3(0, 1, 0);

/**
 * One closed surface at `r`: the swept tube plus a hemisphere at each pole,
 * aimed outward so it continues the tube instead of burying a dome inside it.
 * Cocci degenerate to a single sphere.
 */
export function shellSurface(body: CellBody, r: number): THREE.BufferGeometry {
  if (!body.curve) return new THREE.SphereGeometry(r, 64, 48);
  return cappedTube(body.curve, r, tubeSegments(body));
}

/**
 * A closed sausage: a tube swept along `curve`, sealed at each end by a
 * hemisphere aimed along the curve's own tangent so the join is smooth and
 * nothing is left protruding backwards into the interior.
 */
export function cappedTube(
  curve: THREE.Curve<THREE.Vector3>,
  r: number,
  segments: number,
): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [new THREE.TubeGeometry(curve, segments, r, 20, false)];
  const caps: { point: THREE.Vector3; outward: THREE.Vector3 }[] = [
    { point: curve.getPointAt(0), outward: curve.getTangentAt(0).negate() },
    { point: curve.getPointAt(1), outward: curve.getTangentAt(1) },
  ];
  for (const cap of caps) {
    // A half sphere, swung from +Y onto the pole's outward direction.
    const half = new THREE.SphereGeometry(r, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    half.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(CAP_UP, cap.outward));
    half.translate(cap.point.x, cap.point.y, cap.point.z);
    parts.push(half);
  }
  return mergeGeometries(parts);
}

/** Concatenate geometries that share an attribute layout, without indices. */
export function mergeGeometries(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const out = new THREE.BufferGeometry();
  const nonIndexed = parts.map((g) => (g.index ? g.toNonIndexed() : g));
  for (const attr of ['position', 'normal'] as const) {
    let total = 0;
    for (const g of nonIndexed) total += g.attributes[attr].count * 3;
    const merged = new Float32Array(total);
    let o = 0;
    for (const g of nonIndexed) {
      merged.set(g.attributes[attr].array as Float32Array, o);
      o += g.attributes[attr].count * 3;
    }
    out.setAttribute(attr, new THREE.BufferAttribute(merged, 3));
  }
  return out;
}
