import { Canvas } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import { useStore } from '@/state/store';
import { getOrganism } from '@/data/organisms';
import { ProceduralCell } from './ProceduralCell';
import { CameraRig } from './CameraRig';
import { buildBody } from './body';
import { defaultRadius } from './geometry';
import { type Focus, VIEW_DIR, CLIP_OFFSET } from './focus';

interface Props {
  organismId: string | null;
}

export function Scene({ organismId }: Props) {
  const organism = getOrganism(organismId);
  const selectedStructureId = useStore((s) => s.selectedStructureId);
  const hoveredStructureId = useStore((s) => s.hoveredStructureId);
  const overlay = useStore((s) => s.overlay);
  const selectedMechanismId = useStore((s) => s.selectedMechanismId);
  const selectStructure = useStore((s) => s.selectStructure);
  const hoverStructure = useStore((s) => s.hoverStructure);
  const selectMechanism = useStore((s) => s.selectMechanism);

  const body = useMemo(() => (organism ? buildBody(organism.body) : null), [organism]);

  // Frame the whole cell, accounting for elongated shapes. Overlays pull back a
  // little to leave room for the leader-line callouts around the cell.
  const bodyExtent = body ? Math.max(body.length * 0.62, body.radius * 2.2) : 4;
  const overlayMargin = overlay !== 'none' ? 1.95 : 1;
  const defaultDistance = THREE.MathUtils.clamp(
    (bodyExtent + (body?.radius ?? 2) * 1.6) * overlayMargin,
    6,
    24,
  );

  const initialCam = useMemo(
    () => VIEW_DIR.clone().multiplyScalar(defaultDistance).toArray(),
    [defaultDistance],
  );

  // A world-space cross-section: remove the front cap so every envelope layer is
  // visible as a concentric ring, at any zoom level.
  const clipPlane = useMemo(
    () => new THREE.Plane(VIEW_DIR.clone().negate(), CLIP_OFFSET),
    [],
  );

  if (!organism) return null;

  const selectedStructure = organism.structures.find((s) => s.id === selectedStructureId);
  const structRadius = selectedStructure
    ? selectedStructure.geometry?.radius ?? defaultRadius[selectedStructure.kind]
    : 0;
  const focus: Focus = {
    target: new THREE.Vector3(0, 0, 0),
    distance: selectedStructure
      ? THREE.MathUtils.clamp(Math.max(structRadius * 1.9 + 1.4, bodyExtent * 0.78), 3.5, 15)
      : defaultDistance,
  };
  const focusKey = `${organism.id}:${selectedStructureId ?? 'none'}:${overlay}`;

  return (
    <Canvas
      camera={{ position: initialCam as [number, number, number], fov: 42, near: 0.1, far: 100 }}
      dpr={[1, 2]}
      gl={{ antialias: true, localClippingEnabled: true }}
      onCreated={({ gl }) => {
        gl.clippingPlanes = [clipPlane];
      }}
      onPointerMissed={() => selectStructure(null)}
    >
      <color attach="background" args={['#03060c']} />
      <fog attach="fog" args={['#03060c', 12, 30]} />

      <ambientLight intensity={0.32} />
      <hemisphereLight args={['#9fc4ff', '#140b26', 0.42]} />
      <directionalLight position={[5, 6, 5]} intensity={0.85} />
      {/* Coloured rim lights for the bioluminescent glow. */}
      <pointLight position={[-7, 3, -3]} intensity={0.8} distance={26} color="#37f0c8" />
      <pointLight position={[7, -3, 4]} intensity={0.7} distance={26} color="#c86bff" />
      <pointLight position={[0, 0, 0]} intensity={0.5} distance={8} color="#8ee6c8" />

      <ProceduralCell
        organism={organism}
        selectedStructureId={selectedStructureId}
        hoveredStructureId={hoveredStructureId}
        selectedMechanismId={selectedMechanismId}
        overlay={overlay}
        onSelectStructure={selectStructure}
        onHoverStructure={hoverStructure}
        onSelectMechanism={selectMechanism}
      />

      <CameraRig focus={focus} focusKey={focusKey} />
    </Canvas>
  );
}
