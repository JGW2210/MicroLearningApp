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
  const { camera } = useThree();
  const animating = useRef(false);
  const desiredPos = useRef(new THREE.Vector3());
  const desiredTarget = useRef(new THREE.Vector3());

  // Begin an animation whenever the focus target changes.
  useEffect(() => {
    const f: Focus = focus ?? DEFAULT_FOCUS;
    desiredTarget.current.copy(f.target);
    desiredPos.current.copy(f.target).add(VIEW_DIR.clone().multiplyScalar(f.distance));
    animating.current = true;
  }, [focus, focusKey]);

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
      maxDistance={12}
      enableDamping
      dampingFactor={0.08}
    />
  );
}
