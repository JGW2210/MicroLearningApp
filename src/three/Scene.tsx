import { Canvas } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import { useStore } from '@/state/store';
import { getOrganism } from '@/data/organisms';
import { ProceduralCell } from './ProceduralCell';
import { CameraRig } from './CameraRig';
import { structureFocus, VIEW_DIR, CLIP_OFFSET } from './focus';

interface Props {
  organismId: string | null;
}

export function Scene({ organismId }: Props) {
  const organism = getOrganism(organismId);
  const selectedStructureId = useStore((s) => s.selectedStructureId);
  const hoveredStructureId = useStore((s) => s.hoveredStructureId);
  const overlay = useStore((s) => s.overlay);
  const selectStructure = useStore((s) => s.selectStructure);
  const hoverStructure = useStore((s) => s.hoverStructure);
  const selectMechanism = useStore((s) => s.selectMechanism);

  const initialCam = useMemo(() => VIEW_DIR.clone().multiplyScalar(7.4).toArray(), []);

  // A world-space cross-section: remove the front cap so every envelope layer is
  // visible as a concentric ring, at any zoom level.
  const clipPlane = useMemo(
    () => new THREE.Plane(VIEW_DIR.clone().negate(), CLIP_OFFSET),
    [],
  );

  if (!organism) return null;

  const selectedStructure = organism.structures.find((s) => s.id === selectedStructureId);
  const focus = selectedStructure ? structureFocus(selectedStructure) : null;
  const focusKey = `${organism.id}:${selectedStructureId ?? 'none'}`;

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
      <color attach="background" args={['#070b14']} />
      <fog attach="fog" args={['#070b14', 10, 22]} />

      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#bcd4ff', '#1a1330', 0.6]} />
      <directionalLight position={[5, 6, 5]} intensity={1.1} />
      <directionalLight position={[-6, -2, -4]} intensity={0.4} color="#88aaff" />
      <pointLight position={[0, 0, 0]} intensity={0.5} distance={6} color="#8ee6c8" />

      <ProceduralCell
        organism={organism}
        selectedStructureId={selectedStructureId}
        hoveredStructureId={hoveredStructureId}
        overlay={overlay}
        onSelectStructure={selectStructure}
        onHoverStructure={hoverStructure}
        onSelectMechanism={selectMechanism}
      />

      <CameraRig focus={focus} focusKey={focusKey} />
    </Canvas>
  );
}
