import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import { useStore } from '@/state/store';
import { getOrganism } from '@/data/organisms';
import { ProceduralCell } from './ProceduralCell';
import { CameraRig } from './CameraRig';
import { buildBody, bodyDepth, umPerUnit, type CellBody } from './body';
import { defaultRadius } from './geometry';
import { type Focus, VIEW_DIR, structureFocus, wholeCellFocus } from './focus';
import { updateClipPlane } from './clip';
import { ScaleBar, ScaleProbe, useScaleBarRefs } from './ScaleBar';

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
  const cutDepth = useStore((s) => s.cutDepth);

  const body = useMemo(() => (organism ? buildBody(organism.body) : null), [organism]);

  const initialCam = useMemo(() => VIEW_DIR.clone().multiplyScalar(12).toArray(), []);

  // Half-extent along the view axis, so the cut-depth slider means the same
  // thing on a tiny coccus and a long spirochaete.
  const halfDepth = useMemo(() => {
    if (!organism || !body) return 1;
    const outer = Math.max(
      ...organism.structures.map(
        (s) => s.geometry?.radius ?? defaultRadius[s.kind],
      ),
    );
    return bodyDepth(body, outer);
  }, [organism, body]);

  const scaleRefs = useScaleBarRefs();
  const umPerSceneUnit = useMemo(
    () => (organism && body ? umPerUnit(body, organism.body.sizeUm) : 1),
    [organism, body],
  );

  if (!organism || !body) return null;

  const ringR = Math.max(body.radius, body.length * 0.5) + body.radius * 0.5 + 1.25;

  const selectedStructure = organism.structures.find((s) => s.id === selectedStructureId);

  // World radius that must stay in view. CameraRig turns this into a distance
  // that fits the current viewport aspect (portrait phone or wide desktop).
  let focus: Focus;
  if (selectedStructure) focus = structureFocus(selectedStructure, body);
  else if (overlay !== 'none')
    focus = { target: new THREE.Vector3(0, 0, 0), radius: ringR + 0.9 };
  else focus = wholeCellFocus(body);

  const focusKey = `${organism.id}:${selectedStructureId ?? 'none'}:${overlay}`;

  return (
    <>
    <Canvas
      camera={{ position: initialCam as [number, number, number], fov: 42, near: 0.1, far: 100 }}
      dpr={[1, 2]}
      gl={{ antialias: true, localClippingEnabled: true }}
      onPointerMissed={() => selectStructure(null)}
    >
      <ClipController body={body} halfDepth={halfDepth} cutDepth={cutDepth} />
      <ScaleProbe umPerUnit={umPerSceneUnit} refs={scaleRefs} />
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
    <ScaleBar refs={scaleRefs} />
    </>
  );
}

/**
 * Keeps the cross-section facing the camera. The plane stays anchored to the
 * cell centre (not the orbit target) so the cut is stable while you fly around
 * or focus a local feature; `cutDepth` slides it along the view axis.
 */
function ClipController({
  body,
  halfDepth,
  cutDepth,
}: {
  body: CellBody;
  halfDepth: number;
  cutDepth: number;
}) {
  const center = useMemo(() => body.curve?.getPointAt(0.5) ?? ORIGIN.clone(), [body]);
  useFrame(({ camera }) => {
    // depth 0 → plane at the near surface (intact); 0.5 → dead centre (half).
    updateClipPlane(camera.position, center, halfDepth * (1 - 2 * cutDepth));
  });
  return null;
}

const ORIGIN = new THREE.Vector3(0, 0, 0);
