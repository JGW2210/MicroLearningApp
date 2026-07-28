import * as THREE from 'three';

/** The default viewing direction (the cross-section face points toward it). */
export const VIEW_DIR = new THREE.Vector3(0.55, 0.4, 0.75).normalize();

/** How far along VIEW_DIR the cross-section cut sits (front cap removed beyond this). */
export const CLIP_OFFSET = 0.9;

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
