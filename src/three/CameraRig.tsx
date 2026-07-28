import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { DEFAULT_FOCUS, VIEW_DIR, type Focus } from './focus';

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

  // Begin an animation whenever the focus target OR the viewport size changes,
  // deriving the distance so `radius` fits both viewport dimensions.
  useEffect(() => {
    const f: Focus = focus ?? DEFAULT_FOCUS;
    const persp = camera as THREE.PerspectiveCamera;
    const vFov = ((persp.fov ?? 42) * Math.PI) / 180;
    const aspect = size.height > 0 ? size.width / size.height : 1;
    // The limiting dimension: portrait is width-limited, landscape height-limited.
    const fit = Math.tan(vFov / 2) * Math.min(1, aspect);
    const distance = THREE.MathUtils.clamp(f.radius / fit, 3, 60);
    desiredTarget.current.copy(f.target);
    desiredPos.current.copy(f.target).add(VIEW_DIR.clone().multiplyScalar(distance));
    animating.current = true;
  }, [focus, focusKey, size.width, size.height, camera]);

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
    camera.position.lerp(desiredPos.current, 0.1);
    if (controls.current) {
      controls.current.target.lerp(desiredTarget.current, 0.12);
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
      maxDistance={60}
      enableDamping
      dampingFactor={0.08}
    />
  );
}
