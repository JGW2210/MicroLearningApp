import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import { useStore } from '@/state/store';
import { getOrganism } from '@/data/organisms';
import { ProceduralCell } from './ProceduralCell';
import { CameraRig } from './CameraRig';
import {
  buildCellBody,
  bodyDepth,
  cellRadius,
  contactRadius,
  radialReach,
  umPerUnit,
  type CellBody,
} from './body';
import { defaultRadius } from './geometry';
import { type Focus, VIEW_DIR, structureFocus, wholeCellFocus, groupFocus } from './focus';
import { cellGroup } from './arrangement';
import { Companions, DivisionPlanes } from './Companions';
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
  const showArrangement = useStore((s) => s.showArrangement);
  const showDivisionPlanes = useStore((s) => s.showDivisionPlanes);

  const body = useMemo(() => (organism ? buildCellBody(organism) : null), [organism]);

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

  // Where two of these cells would touch, and how much room the whole of one
  // takes: the two measures the arrangement is laid out against.
  const girth = useMemo(
    () => (organism && body ? contactRadius(organism.structures, body.radius) : 1),
    [organism, body],
  );
  const reach = useMemo(
    () => (organism && body ? cellRadius(organism.structures, body) : 1),
    [organism, body],
  );
  const fringe = useMemo(
    () => (organism ? radialReach(organism.structures) : 1),
    [organism],
  );

  // The group is drawn only while the whole cell is what is being looked at.
  // Zooming into one structure — or switching to an overlay, which rings the
  // cell with callouts — is a question about this cell rather than about the
  // arrangement, and companions left standing there just crowd the frame the
  // camera has moved to. They come back with the view.
  const showGroup = showArrangement && !selectedStructureId && overlay === 'none';
  const group = useMemo(
    () =>
      organism && body && showGroup
        ? cellGroup(organism.arrangement, body, girth, reach)
        : null,
    [organism, body, showGroup, girth, reach],
  );

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
  else if (group) focus = groupFocus(body, group);
  else focus = wholeCellFocus(organism.structures, body);

  const focusKey = `${organism.id}:${selectedStructureId ?? 'none'}:${overlay}:${
    showArrangement ? 'group' : 'solo'
  }`;

  // The scene is lit for a single cell: rim lights close in, with a short falloff
  // so the glow stays on the subject. A group is framed several times further
  // back and is several times wider, and lights sized for one cell simply do not
  // reach the far end of it — so the whole rig grows with what is being framed.
  const lightScale = THREE.MathUtils.clamp(focus.radius / 3.4, 1, 6);
  const at = (x: number, y: number, z: number): [number, number, number] => [
    x * lightScale,
    y * lightScale,
    z * lightScale,
  ];

  return (
    <>
    <Canvas
      camera={{ position: initialCam as [number, number, number], fov: 42, near: 0.1, far: 300 }}
      dpr={[1, 2]}
      gl={{ antialias: true, localClippingEnabled: true }}
      onPointerMissed={() => selectStructure(null)}
    >
      <ClipController body={body} halfDepth={halfDepth} cutDepth={cutDepth} />
      <ScaleProbe umPerUnit={umPerSceneUnit} refs={scaleRefs} />
      <color attach="background" args={['#03060c']} />
      {/*
        Fog is tied to what is being framed, not to a fixed pair of distances. A
        group of six cells is framed from three or four times as far back as one
        cell, and constants tuned for the close view swallowed the whole
        arrangement in background colour before it could be seen.
      */}
      <fog attach="fog" args={['#03060c', focus.radius * 3.5, focus.radius * 8.8]} />

      <ambientLight intensity={0.32} />
      <hemisphereLight args={['#9fc4ff', '#140b26', 0.42]} />
      <directionalLight position={[5, 6, 5]} intensity={0.85} />
      {/* Coloured rim lights for the bioluminescent glow. */}
      <pointLight position={at(-7, 3, -3)} intensity={0.8} distance={26 * lightScale} color="#37f0c8" />
      <pointLight position={at(7, -3, 4)} intensity={0.7} distance={26 * lightScale} color="#c86bff" />
      <pointLight position={at(0, 0, 0)} intensity={0.5} distance={8 * lightScale} color="#8ee6c8" />

      {group && <Companions organism={organism} body={body} group={group} />}
      {group && showDivisionPlanes && (
        <DivisionPlanes body={body} group={group} girth={girth} fringe={fringe} />
      )}

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
 *
 * Only the focused cell is cut. Companion cells carry no clipping planes, so an
 * arrangement shows one cell opened up among a group of closed ones — which is
 * the figure the view is trying to be.
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
