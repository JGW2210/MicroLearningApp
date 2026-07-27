import * as THREE from 'three';
import type { StructureNode } from '@/types/content';
import { defaultRadius } from './geometry';

/** The default viewing direction (the cross-section face points toward it). */
export const VIEW_DIR = new THREE.Vector3(0.55, 0.4, 0.75).normalize();

/** How far along VIEW_DIR the cross-section cut sits (front cap removed beyond this). */
export const CLIP_OFFSET = 0.9;

const UP = new THREE.Vector3(0, 1, 0);

/** Anchor point (on the visible cut face) for a structure's overlay marker. */
export function structureAnchor(structure: StructureNode): THREE.Vector3 {
  const r = structure.geometry?.radius ?? defaultRadius[structure.kind];
  const ringR = Math.sqrt(Math.max(r * r - CLIP_OFFSET * CLIP_OFFSET, 0.25));
  const center = VIEW_DIR.clone().multiplyScalar(CLIP_OFFSET);
  return center.add(UP.clone().multiplyScalar(Math.min(ringR, r)));
}

export interface Focus {
  target: THREE.Vector3;
  distance: number;
}

/**
 * Camera focus for a selected structure. The cross-section is always centred, so
 * we keep the orbit target near the cell centre and scale the distance to the
 * structure's radius — outer layers frame the whole cell, inner ones zoom in.
 */
export function structureFocus(structure: StructureNode): Focus {
  const r = structure.geometry?.radius ?? defaultRadius[structure.kind];
  const distance = THREE.MathUtils.clamp(r * 1.9 + 1.4, 3, 7.5);
  return { target: new THREE.Vector3(0, 0, 0), distance };
}

export const DEFAULT_FOCUS: Focus = {
  target: new THREE.Vector3(0, 0, 0),
  distance: 7.6,
};
