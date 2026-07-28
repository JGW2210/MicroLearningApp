import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import { useStore } from '@/state/store';
import { getOrganism } from '@/data/organisms';
import { ProceduralCell } from './ProceduralCell';
import { CameraRig } from './CameraRig';
import { buildBody } from './body';
import { defaultRadius } from './geometry';
import { type Focus, VIEW_DIR } from './focus';
import { updateClipPlane } from './clip';

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

  const initialCam = useMemo(() => VIEW_DIR.clone().multiplyScalar(12).toArray(), []);

  if (!organism || !body) return null;

  // World radius that must stay in view. CameraRig turns this into a distance
  // that fits the current viewport aspect (portrait phone or wide desktop).
  const wholeCell = Math.max(body.radius, body.length * 0.5 + body.radius);
  const ringR = Math.max(body.radius, body.length * 0.5) + body.radius * 0.5 + 1.25;

  const selectedStructure = organism.structures.find((s) => s.id === selectedStructureId);
  const structRadius = selectedStructure
    ? selectedStructure.geometry?.radius ?? defaultRadius[selectedStructure.kind]
    : 0;

  let radius = wholeCell * 1.12;
  if (selectedStructure) radius = Math.max(structRadius * 1.7 + 0.6, wholeCell * 0.55);
  else if (overlay !== 'none') radius = ringR + 0.9;

  const focus: Focus = { target: new THREE.Vector3(0, 0, 0), radius };
  const focusKey = `${organism.id}:${selectedStructureId ?? 'none'}:${overlay}`;

  return (
    <Canvas
      camera={{ position: initialCam as [number, number, number], fov: 42, near: 0.1, far: 100 }}
      dpr={[1, 2]}
      gl={{ antialias: true, localClippingEnabled: true }}
      onPointerMissed={() => selectStructure(null)}
    >
      <ClipController />
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

/** Keeps the cross-section plane cutting through the cell centre, facing the camera. */
function ClipController() {
  useFrame(({ camera, controls }) => {
    const target =
      (controls as { target?: THREE.Vector3 } | null)?.target ?? ORIGIN;
    updateClipPlane(camera.position, target);
  });
  return null;
}

const ORIGIN = new THREE.Vector3(0, 0, 0);
