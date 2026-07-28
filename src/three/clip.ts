import { createContext, useContext } from 'react';
import * as THREE from 'three';

/**
 * A live cross-section: one plane through a cell, plus its exact complement.
 *
 * The plane passes through the cell centre and faces the camera, so the near
 * half is always removed and you look straight into the exposed interior — a
 * true half-cell cut, at any orbit angle. It is applied per-material rather than
 * globally on the renderer, so annotation geometry (callout dots, leader lines)
 * is never sliced.
 *
 * The same plane backs the raycast filter, so clicks ignore hits that land on
 * the removed half and fall through to what is actually visible.
 *
 * This used to be a pair of module-level planes shared by every material in the
 * app, which was correct for exactly as long as there was one cell. Comparing
 * two organisms side by side needs a cut through each of two centres, and a
 * single shared plane can only pass through one of them: the second cell would
 * be sliced at whatever depth happened to suit the first, which at some orbit
 * angles means not sliced at all and at others means removed entirely.
 */
export interface Cutaway {
  /** Hand these to a material that should show the half being kept. */
  clip: THREE.Plane[];
  /** ...and these to the faint ghost of the half being removed. */
  ghost: THREE.Plane[];
  /**
   * Re-aim the plane so it faces the camera, cutting through `center` shifted by
   * `offset` along the view axis.
   *
   * The cut surface sits at `center + offset · viewDir`, so a positive offset
   * moves it toward the viewer (a shallower cut that keeps more of the cell) and
   * a negative offset pushes it past the centre. Offset 0 is an exact half-cell.
   */
  update(cameraPos: THREE.Vector3, center: THREE.Vector3, offset?: number): void;
  /**
   * True when a point lies on the removed half (three.js discards fragments
   * whose signed distance is negative). The epsilon keeps points sitting exactly
   * on the cut face — where the callout anchors live — on the visible side.
   */
  isClipped(point: THREE.Vector3): boolean;
}

/** How much of its normal opacity a ghosted element keeps. */
export const GHOST_OPACITY = 0.16;

export function createCutaway(): Cutaway {
  const clipPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
  const ghostPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  // Stable array identities: these are handed to `clippingPlanes`, and a fresh
  // array each frame would have three.js rebuilding the shader every frame.
  const clip = [clipPlane];
  const ghost = [ghostPlane];
  const dir = new THREE.Vector3();

  return {
    clip,
    ghost,
    update(cameraPos, center, offset = 0) {
      dir.copy(cameraPos).sub(center);
      if (dir.lengthSq() < 1e-8) return;
      dir.normalize();
      // Keep the far side: distance(p) = dir · (center - p) + offset >= 0.
      clipPlane.normal.copy(dir).negate();
      clipPlane.constant = dir.dot(center) + offset;
      // ...and the ghost keeps exactly the negation, so the two halves tile the
      // cell with no seam and no overlap at the cut face.
      ghostPlane.normal.copy(dir);
      ghostPlane.constant = -clipPlane.constant;
    },
    isClipped(point) {
      return clipPlane.distanceToPoint(point) < -0.02;
    },
  };
}

/**
 * The cutaway the meshes of the surrounding cell should use.
 *
 * Provided per `Scene`, so two scenes side by side each cut their own cell
 * through its own centre. The default exists so a mesh rendered outside any
 * scene still has planes to reference rather than crashing.
 */
export const CutawayContext = createContext<Cutaway>(createCutaway());

export function useCutaway(): Cutaway {
  return useContext(CutawayContext);
}
