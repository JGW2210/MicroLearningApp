import * as THREE from 'three';
import type { StructureNode } from '@/types/content';
import { defaultRadius } from './geometry';
import { bodyCenter, polarAxis, type CellBody } from './body';

/** The default viewing direction (the cross-section face points toward it). */
export const VIEW_DIR = new THREE.Vector3(0.55, 0.4, 0.75).normalize();

/**
 * A framing target expressed as a world-space point plus the radius that must be
 * kept in view. The camera distance is derived from this radius AND the current
 * viewport aspect (see CameraRig), so cells fit on portrait phones and wide
 * desktops alike.
 */
export interface Focus {
  target: THREE.Vector3;
  radius: number;
}

export const DEFAULT_FOCUS: Focus = {
  target: new THREE.Vector3(0, 0, 0),
  radius: 3.4,
};

/** Frames the whole cell. */
export function wholeCellFocus(body: CellBody): Focus {
  return {
    target: bodyCenter(body),
    radius: Math.max(body.radius, body.length * 0.5 + body.radius) * 1.12,
  };
}

/**
 * Where the camera should fly when a structure is selected.
 *
 * Most structures are distributed over the whole cell, so they frame the body.
 * Localised features are different: a polar flagellar tuft sits at one end, so
 * focusing the cell centre would leave it off to the side — those get their own
 * anchor so the camera actually lands on the thing you clicked.
 */
export function structureFocus(structure: StructureNode, body: CellBody): Focus {
  const r = structure.geometry?.radius ?? defaultRadius[structure.kind];
  const center = bodyCenter(body);
  const extent = Math.max(body.radius, body.length * 0.5 + body.radius);

  // Polar flagellar tuft on an elongated cell — frame the pole it grows from.
  // `reach` mirrors how FlagellaMesh lays the filaments out.
  if (structure.kind === 'flagellum' && body.curve) {
    const { end, outward } = polarAxis(body);
    const reach = r * 3.4;
    return {
      target: end.clone().addScaledVector(outward, reach * 0.5),
      radius: Math.max(reach * 0.85, body.radius * 2.2),
    };
  }

  // Everything else is body-wide; keep enough of the cell in frame to stay
  // oriented, and never zoom closer than the structure itself.
  const spread = body.curve ? extent * 0.62 : r * 1.7;
  return { target: center, radius: Math.max(r * 1.7, spread) };
}
