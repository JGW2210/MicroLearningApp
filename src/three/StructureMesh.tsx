import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import type { StructureNode } from '@/types/content';
import { defaultRadius } from './geometry';
import { CLIP_PLANES, isClipped } from './clip';
import {
  type CellBody,
  bodyEnds,
  plasmidAnchor,
  polarAxis,
  supercoiledLoop,
  surfacePoints,
  tubeSegments,
  volumePoints,
} from './body';

export interface StructureVisualState {
  selected: boolean;
  hovered: boolean;
  dimmed: boolean;
  /** Emphasised because an antibiotic/resistance overlay targets it. */
  highlighted: boolean;
}

interface Props extends StructureVisualState {
  structure: StructureNode;
  body: CellBody;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

const UP = new THREE.Vector3(0, 1, 0);

/**
 * Cutaway convention: continuous envelope shells are sliced by the cross-section,
 * while small discrete contents (ribosomes, DNA, spikes, flagella) are drawn
 * WHOLE — a half-sliced granule reads as a rendering artefact, not anatomy.
 * Those elements are instead culled per-instance by which half they sit in, so
 * nothing floats in front of the cut face.
 */
function isSliced(kind: StructureNode['kind']): boolean {
  return (
    kind === 'capsule' ||
    kind === 'outer-membrane' ||
    kind === 'peptidoglycan' ||
    kind === 'mycolic-acid' ||
    kind === 'cell-membrane' ||
    kind === 'cytoplasm'
  );
}

const _wp = new THREE.Vector3();

/**
 * Hides whole child meshes that fall on the removed half. Children may carry a
 * `cullPoint` in userData when their geometry is baked in world coordinates
 * (flagella), otherwise their own position is used.
 */
function useHalfCull(ref: React.RefObject<THREE.Group | null>, enabled = true) {
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    for (const child of g.children) {
      if (!enabled) {
        child.visible = true;
        continue;
      }
      const cp = child.userData?.cullPoint as THREE.Vector3 | undefined;
      if (cp) _wp.copy(cp);
      else child.getWorldPosition(_wp);
      child.visible = !isClipped(_wp);
    }
  });
}

/** Walk up the tree — a hit on a culled child must not count. */
function isVisibleInTree(object: THREE.Object3D): boolean {
  let o: THREE.Object3D | null = object;
  while (o) {
    if (!o.visible) return false;
    o = o.parent;
  }
  return true;
}

/**
 * Effective click size — smaller wins when meshes overlap, so inner granules and
 * thin surface features can be selected through the larger shells around them.
 */
function pickSize(structure: StructureNode): number {
  if (structure.kind === 'ribosomes' || structure.kind === 'nucleoid' || structure.kind === 'plasmid')
    return 0.25;
  if (
    structure.kind === 'teichoic-acid' ||
    structure.kind === 'lps' ||
    structure.kind === 'pili' ||
    structure.kind === 'fimbriae'
  )
    return 0.4;
  return structure.geometry?.radius ?? defaultRadius[structure.kind];
}

/** Climb parents to find the structure a hit object belongs to. */
function resolvePick(
  object: THREE.Object3D,
): { sid: string; size: number; sliced: boolean } | null {
  let o: THREE.Object3D | null = object;
  while (o) {
    const sid = o.userData?.structureId as string | undefined;
    if (sid)
      return {
        sid,
        size: o.userData.pickSize as number,
        sliced: o.userData.sliced as boolean,
      };
    o = o.parent;
  }
  return null;
}

/**
 * Vibrancy-first visual state. The focused element becomes brighter, more
 * saturated and self-glowing; the rest keep their colour and fade only gently.
 */
function computeVisual(
  structure: StructureNode,
  vs: StructureVisualState,
  baseOpacity: number,
) {
  const base = new THREE.Color(structure.color);
  let color = base;
  let emissiveIntensity = structure.geometry?.glow ?? 0.12;
  let opacity = baseOpacity;

  if (vs.selected) {
    color = base.clone().offsetHSL(0, 0.16, 0.07);
    emissiveIntensity = 0.6;
  } else if (vs.highlighted) {
    color = base.clone().offsetHSL(0, 0.12, 0.05);
    emissiveIntensity = 0.45;
  } else if (vs.hovered) {
    color = base.clone().offsetHSL(0, 0.09, 0.04);
    emissiveIntensity = 0.34;
  } else if (vs.dimmed) {
    color = base.clone().offsetHSL(0, -0.14, -0.02);
    emissiveIntensity = 0.05;
    opacity = baseOpacity * 0.72;
  }

  const hex = `#${color.getHexString()}`;
  return { color: hex, emissive: hex, emissiveIntensity, opacity };
}

export function StructureMesh(props: Props) {
  const { structure } = props;
  const radius = structure.geometry?.radius ?? defaultRadius[structure.kind];
  const nodeData = useMemo(
    () => ({
      structureId: structure.id,
      pickSize: pickSize(structure),
      sliced: isSliced(structure.kind),
    }),
    [structure],
  );

  /** A hit counts only if it is actually visible: not on a culled instance, and
   * not on the removed half of a sliced shell. */
  const hitIsVisible = (i: ThreeEvent<MouseEvent>['intersections'][number]) => {
    if (!isVisibleInTree(i.object)) return false;
    const pick = resolvePick(i.object);
    if (!pick) return false;
    return !(pick.sliced && isClipped(i.point));
  };

  const handlers = {
    onClick: (e: ThreeEvent<MouseEvent>) => {
      // Choose the best target across all hits: smallest visible mesh wins,
      // ties broken by nearest. Only the winning mesh's handler acts.
      let best: { sid: string; size: number; distance: number } | null = null;
      for (const i of e.intersections) {
        if (!hitIsVisible(i)) continue;
        const pick = resolvePick(i.object);
        if (!pick) continue;
        if (
          !best ||
          pick.size < best.size - 1e-3 ||
          (Math.abs(pick.size - best.size) < 1e-3 && i.distance < best.distance)
        ) {
          best = { sid: pick.sid, size: pick.size, distance: i.distance };
        }
      }
      if (!best || best.sid !== structure.id) return;
      e.stopPropagation();
      if (structure.clickable === false) return;
      props.onSelect(structure.id);
    },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      if (!isVisibleInTree(e.object)) return;
      if (isSliced(structure.kind) && isClipped(e.point)) return;
      e.stopPropagation();
      props.onHover(structure.id);
      document.body.style.cursor = 'pointer';
    },
    onPointerOut: () => {
      props.onHover(null);
      document.body.style.cursor = 'auto';
    },
  };

  const sub = { ...props, radius, handlers, nodeData };

  switch (structure.kind) {
    case 'capsule':
    case 'outer-membrane':
    case 'peptidoglycan':
    case 'mycolic-acid':
    case 'cell-membrane':
    case 'cytoplasm':
      return <ShellMesh {...sub} />;
    case 'teichoic-acid':
    case 'lps':
    case 'pili':
    case 'fimbriae':
      return <SpikesMesh {...sub} />;
    case 'ribosomes':
      return <RibosomesMesh {...sub} />;
    case 'nucleoid':
      return <NucleoidMesh {...sub} />;
    case 'plasmid':
      return <PlasmidMesh {...sub} />;
    case 'flagellum':
      return <FlagellaMesh {...sub} />;
    default:
      return null;
  }
}

type NodeData = { structureId: string; pickSize: number };
type SubProps = Props & {
  radius: number;
  nodeData: NodeData;
  handlers: {
    onClick: (e: ThreeEvent<MouseEvent>) => void;
    onPointerOver: (e: ThreeEvent<PointerEvent>) => void;
    onPointerOut: () => void;
  };
};

/** Envelope layer: a sphere for cocci, or a capped tube swept along the body. */
function ShellMesh(props: SubProps) {
  const { structure, body, radius, handlers, nodeData } = props;
  const ref = useRef<THREE.Group>(null);
  const isTranslucent = structure.kind === 'capsule' || structure.kind === 'cytoplasm';
  const baseOpacity = structure.geometry?.opacity ?? (isTranslucent ? 0.28 : 0.92);
  const v = computeVisual(structure, props, baseOpacity);

  const tube = useMemo(
    () =>
      body.curve
        ? new THREE.TubeGeometry(body.curve, tubeSegments(body), radius, 20, false)
        : null,
    [body, radius],
  );
  const ends = useMemo(() => bodyEnds(body), [body]);

  useFrame(() => {
    if (!ref.current) return;
    const target = props.selected ? 1.02 : 1;
    ref.current.scale.lerp(new THREE.Vector3(target, target, target), 0.15);
  });

  const makeMat = () => (
    <meshStandardMaterial
      color={v.color}
      emissive={v.emissive}
      emissiveIntensity={v.emissiveIntensity}
      transparent
      opacity={v.opacity}
      roughness={0.5}
      metalness={0.05}
      side={THREE.DoubleSide}
      depthWrite={!isTranslucent}
      clippingPlanes={CLIP_PLANES}
    />
  );

  return (
    <group ref={ref} userData={nodeData} {...handlers}>
      {tube ? (
        <>
          <mesh geometry={tube}>{makeMat()}</mesh>
          <mesh position={ends.a}>
            <sphereGeometry args={[radius, 24, 18]} />
            {makeMat()}
          </mesh>
          <mesh position={ends.b}>
            <sphereGeometry args={[radius, 24, 18]} />
            {makeMat()}
          </mesh>
        </>
      ) : (
        <mesh>
          <sphereGeometry args={[radius, 64, 48]} />
          {makeMat()}
        </mesh>
      )}
    </group>
  );
}

/** Radial spikes/brush layer (teichoic acids, LPS, pili, fimbriae). */
function SpikesMesh(props: SubProps) {
  const { structure, body, radius, handlers, nodeData } = props;
  const count = structure.geometry?.count ?? 60;
  const v = computeVisual(structure, props, 0.95);

  const spikes = useMemo(() => {
    return surfacePoints(body, radius, count).map(({ position, normal }) => {
      const q = new THREE.Quaternion().setFromUnitVectors(UP, normal);
      return {
        position: position.toArray() as [number, number, number],
        quaternion: [q.x, q.y, q.z, q.w] as [number, number, number, number],
      };
    });
  }, [body, count, radius]);

  const isHairlike = structure.kind === 'pili' || structure.kind === 'fimbriae';
  const len = isHairlike ? 0.9 : 0.35;
  const thick = isHairlike ? 0.02 : 0.04;

  // Whole spikes are hidden or shown — never sliced through. The selected
  // structure is always shown complete, so focusing it can't hide half of it.
  const ref = useRef<THREE.Group>(null);
  useHalfCull(ref, !props.selected);

  return (
    <group ref={ref} userData={nodeData} {...handlers}>
      {spikes.map((s, i) => (
        <mesh key={i} position={s.position} quaternion={s.quaternion}>
          <cylinderGeometry args={[thick * 0.6, thick, len, 6]} />
          <meshStandardMaterial
            color={v.color}
            emissive={v.emissive}
            emissiveIntensity={v.emissiveIntensity}
            transparent
            opacity={v.opacity}
            roughness={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Scattered ribosome granules through the body volume. */
function RibosomesMesh(props: SubProps) {
  const { structure, body, radius, handlers, nodeData } = props;
  const count = structure.geometry?.count ?? 80;
  const v = computeVisual(structure, props, 1);
  const positions = useMemo(
    () => volumePoints(body, radius, count).map((p) => p.toArray() as [number, number, number]),
    [body, count, radius],
  );

  // Granules in the removed half are hidden whole; the rest render intact.
  const ref = useRef<THREE.Group>(null);
  useHalfCull(ref, !props.selected);

  return (
    <group ref={ref} userData={nodeData} {...handlers}>
      {positions.map((p, i) => (
        <mesh key={i} position={p}>
          <icosahedronGeometry args={[0.055, 0]} />
          <meshStandardMaterial
            color={v.color}
            emissive={v.emissive}
            emissiveIntensity={v.emissiveIntensity}
            transparent
            opacity={v.opacity}
            roughness={0.4}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * The chromosome: a single closed, supercoiled circular loop fitted to the cell.
 * Always drawn whole inside the cut — it is one continuous object, so slicing it
 * would read as a rendering artefact.
 */
function NucleoidMesh(props: SubProps) {
  const { structure, body, radius, handlers, nodeData } = props;
  const ref = useRef<THREE.Mesh>(null);
  const v = computeVisual(structure, props, 0.92);

  const geo = useMemo(() => {
    // Size the loop from the authored nucleoid radius, capped so the strand —
    // including its supercoil swing and its own thickness — stays inside the
    // cytoplasm rather than poking through the envelope.
    const girth = Math.min(radius * 1.45, body.radius * 0.52);
    const extent = body.curve ? Math.max(body.length * 0.32, girth) : girth;
    const spacing = girth * 0.28;
    const { curve, segments } = supercoiledLoop(body, extent, girth, spacing);
    return new THREE.TubeGeometry(curve, segments, spacing * 0.2, 7, true);
  }, [body, radius]);

  useFrame((_, delta) => {
    if (ref.current && props.selected) ref.current.rotation.z += delta * 0.12;
  });

  return (
    <mesh ref={ref} geometry={geo} userData={nodeData} {...handlers}>
      <meshStandardMaterial
        color={v.color}
        emissive={v.emissive}
        emissiveIntensity={v.emissiveIntensity}
        transparent
        opacity={v.opacity}
        roughness={0.42}
      />
    </mesh>
  );
}

/**
 * Plasmids: small closed circles of extrachromosomal DNA, drawn separate from
 * the nucleoid because that independence is the teaching point — they replicate
 * on their own and move between cells by conjugation.
 */
function PlasmidMesh(props: SubProps) {
  const { structure, body, radius, handlers, nodeData } = props;
  const count = structure.geometry?.count ?? 2;
  const v = computeVisual(structure, props, 0.96);
  const ref = useRef<THREE.Group>(null);

  const loops = useMemo(() => {
    const inner = Math.max(body.radius * 0.5, 0.2);
    return Array.from({ length: count }, (_, i) => {
      const loopR = radius > 0 ? radius : inner * 0.42;
      // Vary the sizes a little so they read as a population, not copies.
      const r = loopR * (0.7 + 0.3 * ((i * 0.53) % 1));
      const tubeR = Math.max(r * 0.17, 0.02);
      // Twist each loop differently so they read as separate circles.
      const rot: [number, number, number] = [
        Math.PI * (0.28 + i * 0.16),
        Math.PI * (0.12 + i * 0.33),
        Math.PI * (i * 0.21),
      ];
      return {
        position: plasmidAnchor(body, i, inner).toArray() as [number, number, number],
        rotation: rot,
        args: [r, tubeR, 12, 64] as [number, number, number, number],
      };
    });
  }, [body, count, radius]);

  useFrame((_, delta) => {
    if (ref.current && props.selected) ref.current.rotation.y += delta * 0.25;
  });

  return (
    <group ref={ref} userData={nodeData} {...handlers}>
      {loops.map((l, i) => (
        <mesh key={i} position={l.position} rotation={l.rotation}>
          <torusGeometry args={l.args} />
          <meshStandardMaterial
            color={v.color}
            emissive={v.emissive}
            emissiveIntensity={v.emissiveIntensity}
            transparent
            opacity={v.opacity}
            roughness={0.42}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Flagella: radial for cocci, a polar tuft for elongated cells. */
function FlagellaMesh(props: SubProps) {
  const { structure, body, radius, handlers, nodeData } = props;
  const count = structure.geometry?.count ?? 3;
  const v = computeVisual(structure, props, 0.95);

  // Each entry carries a representative point, since the tube geometry is baked
  // in world coordinates and the mesh itself sits at the origin.
  const curves = useMemo(() => {
    const result: { geo: THREE.TubeGeometry; cullPoint: THREE.Vector3 }[] = [];
    const add = (pts: THREE.Vector3[]) =>
      result.push({
        geo: new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.03, 6, false),
        cullPoint: pts[Math.floor(pts.length / 2)].clone(),
      });
    if (body.curve) {
      // Polar tuft from one end, projecting away from the cell along its axis.
      const { end, outward } = polarAxis(body);
      const perp = body.ey.clone();
      for (let f = 0; f < count; f++) {
        const spread = (f - (count - 1) / 2) * 0.35;
        const base = end.clone().addScaledVector(perp, spread * radius);
        const pts: THREE.Vector3[] = [];
        const segments = 6;
        for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          const along = base.clone().addScaledVector(outward, t * radius * 3.4);
          const wave = Math.sin(t * Math.PI * 3 + f) * 0.4 * (1 - t * 0.2);
          along.addScaledVector(body.ez, wave);
          pts.push(along);
        }
        add(pts);
      }
      return result;
    }
    // Coccus: radial wavy tails.
    for (let f = 0; f < count; f++) {
      const angle = (f / count) * Math.PI * 2;
      const base = new THREE.Vector3(Math.cos(angle) * radius * 0.7, Math.sin(angle) * radius * 0.7, 0);
      const dir = base.clone().normalize();
      const pts: THREE.Vector3[] = [];
      const segments = 5;
      const perp = new THREE.Vector3(-dir.y, dir.x, 0.3).normalize();
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const along = base.clone().add(dir.clone().multiplyScalar(t * 2.4));
        along.add(perp.clone().multiplyScalar(Math.sin(t * Math.PI * 3) * 0.35 * (1 - t * 0.3)));
        pts.push(along);
      }
      add(pts);
    }
    return result;
  }, [body, count, radius]);

  // Flagella project outside the envelope, so the cross-section never applies to
  // them: the full tuft always stays visible.
  return (
    <group userData={nodeData} {...handlers}>
      {curves.map((c, i) => (
        <mesh key={i} geometry={c.geo} userData={{ cullPoint: c.cullPoint }}>
          <meshStandardMaterial
            color={v.color}
            emissive={v.emissive}
            emissiveIntensity={v.emissiveIntensity}
            transparent
            opacity={v.opacity}
            roughness={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}
