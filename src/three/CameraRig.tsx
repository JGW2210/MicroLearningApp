import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { DEFAULT_FOCUS, VIEW_DIR, type Focus } from './focus';
import { prefersReducedMotion } from './motion';
import { trackPointerGestures } from './pointer';

/** Kept inside the camera's far plane (see `Scene`), with room to spare. */
const MAX_DISTANCE = 200;

interface Props {
  focus: Focus | null;
  /** Changes whenever the focus should re-animate (e.g. selected structure id). */
  focusKey: string;
}

/**
 * Smoothly animates the camera + orbit target toward the focused structure when
 * the selection changes, then hands control back to OrbitControls so the user
 * can freely orbit/zoom without the rig fighting them.
 */
export function CameraRig({ focus, focusKey }: Props) {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera, size } = useThree();
  const animating = useRef(false);
  const desiredPos = useRef(new THREE.Vector3());
  const desiredTarget = useRef(new THREE.Vector3());

  /**
   * The latest focus, held in a ref so it can be read without being depended on.
   *
   * `focus` is a fresh object every render, and the scene re-renders whenever
   * anything is hovered. Depending on it therefore restarted the camera
   * animation on every hover — including mid-orbit, which yanked the view out
   * of the user's hands the moment the cursor crossed a structure. `focusKey`
   * is the honest trigger: it changes when the focus *means* something new.
   */
  const latest = useRef<Focus | null>(focus);
  latest.current = focus;

  useEffect(() => trackPointerGestures(), []);

  // Begin an animation whenever the focus meaningfully changes, or the viewport
  // resizes, deriving the distance so `radius` fits both viewport dimensions.
  useEffect(() => {
    const f: Focus = latest.current ?? DEFAULT_FOCUS;
    const persp = camera as THREE.PerspectiveCamera;
    const vFov = ((persp.fov ?? 42) * Math.PI) / 180;
    const aspect = size.height > 0 ? size.width / size.height : 1;
    // The limiting dimension: portrait is width-limited, landscape height-limited.
    const fit = Math.tan(vFov / 2) * Math.min(1, aspect);
    // `radius` bounds a sphere, so the frustum has to be tangent to that sphere
    // rather than to a flat disc facing the camera at the target's depth. The
    // difference is a factor of cos(half-angle) — invisible on a single cell,
    // but a chain fills the frame edge to edge and the ends of it were the first
    // thing to go.
    const distance = THREE.MathUtils.clamp(
      f.radius / Math.sin(Math.atan(fit)),
      3,
      // The ceiling has to clear the widest thing the scene can frame, which is
      // no longer one cell: a chain of six on a portrait phone needs three times
      // the distance a single cell does.
      MAX_DISTANCE,
    );
    desiredTarget.current.copy(f.target);
    desiredPos.current.copy(f.target).add(VIEW_DIR.clone().multiplyScalar(distance));
    animating.current = true;
  }, [focusKey, size.width, size.height, camera]);

  // Cancel the animation the moment the user grabs the controls.
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const cancel = () => {
      animating.current = false;
    };
    c.addEventListener('start', cancel);
    return () => c.removeEventListener('start', cancel);
  }, []);

  useFrame(() => {
    if (!animating.current) return;
    // Asked for less movement: arrive at the new framing rather than flying to
    // it. The whole point of the animation is to keep you oriented while the
    // view changes, and for anyone who finds that motion unpleasant it does the
    // opposite.
    const ease = prefersReducedMotion() ? 1 : 0.1;
    camera.position.lerp(desiredPos.current, ease);
    if (controls.current) {
      controls.current.target.lerp(desiredTarget.current, ease === 1 ? 1 : 0.12);
      controls.current.update();
    }
    if (camera.position.distanceTo(desiredPos.current) < 0.02) {
      animating.current = false;
    }
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      minDistance={1.6}
      maxDistance={MAX_DISTANCE}
      enableDamping
      dampingFactor={0.08}
    />
  );
}
