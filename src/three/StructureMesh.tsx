import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import type { StructureNode } from '@/types/content';
import { defaultRadius } from './geometry';
import { VIEW_DIR, CLIP_OFFSET } from './focus';
import {
  type CellBody,
  bodyEnds,
  nucleoidCurve,
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

/** A hit only counts if its point is on the visible side of the cross-section. */
function isClippedAway(point: THREE.Vector3): boolean {
  return point.dot(VIEW_DIR) > CLIP_OFFSET + 0.02;
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
function resolvePick(object: THREE.Object3D): { sid: string; size: number } | null {
  let o: THREE.Object3D | null = object;
  while (o) {
    const sid = o.userData?.structureId as string | undefined;
    if (sid) return { sid, size: o.userData.pickSize as number };
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
    () => ({ structureId: structure.id, pickSize: pickSize(structure) }),
    [structure],
  );

  const handlers = {
    onClick: (e: ThreeEvent<MouseEvent>) => {
      // Choose the best target across all hits: smallest visible mesh wins,
      // ties broken by nearest. Only the winning mesh's handler acts.
      const kept = e.intersections.filter((i) => !isClippedAway(i.point));
      let best: { sid: string; size: number; distance: number } | null = null;
      for (const i of kept) {
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
      if (isClippedAway(e.point)) return;
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

  return (
    <group userData={nodeData} {...handlers}>
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

  return (
    <group userData={nodeData} {...handlers}>
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

/** Chromosomal DNA: a torus-knot tangle for cocci, a wavy strand for rods. */
function NucleoidMesh(props: SubProps) {
  const { structure, body, radius, handlers, nodeData } = props;
  const ref = useRef<THREE.Mesh>(null);
  const v = computeVisual(structure, props, 0.9);

  const strand = useMemo(() => {
    const c = nucleoidCurve(body, radius * 1.6);
    return c ? new THREE.TubeGeometry(c, 120, radius * 0.5, 8, false) : null;
  }, [body, radius]);

  useFrame((_, delta) => {
    if (ref.current && props.selected && !strand) ref.current.rotation.y += delta * 0.3;
  });

  const material = (
    <meshStandardMaterial
      color={v.color}
      emissive={v.emissive}
      emissiveIntensity={v.emissiveIntensity}
      transparent
      opacity={v.opacity}
      roughness={0.45}
    />
  );

  if (strand) {
    return (
      <mesh geometry={strand} userData={nodeData} {...handlers}>
        {material}
      </mesh>
    );
  }
  return (
    <mesh ref={ref} userData={nodeData} {...handlers}>
      <torusKnotGeometry args={[radius * 0.6, radius * 0.16, 120, 12, 2, 3]} />
      {material}
    </mesh>
  );
}

/** Small circular plasmid loop. */
function PlasmidMesh(props: SubProps) {
  const { structure, radius, handlers, nodeData } = props;
  const v = computeVisual(structure, props, 0.95);
  return (
    <mesh
      userData={nodeData}
      {...handlers}
      rotation={[Math.PI / 2.5, 0, 0]}
      position={[radius * 0.4, -radius * 0.3, 0]}
    >
      <torusGeometry args={[0.35, 0.05, 16, 48]} />
      <meshStandardMaterial
        color={v.color}
        emissive={v.emissive}
        emissiveIntensity={v.emissiveIntensity}
        transparent
        opacity={v.opacity}
        roughness={0.45}
      />
    </mesh>
  );
}

/** Flagella: radial for cocci, a polar tuft for elongated cells. */
function FlagellaMesh(props: SubProps) {
  const { structure, body, radius, handlers, nodeData } = props;
  const count = structure.geometry?.count ?? 3;
  const v = computeVisual(structure, props, 0.95);

  const curves = useMemo(() => {
    const result: THREE.TubeGeometry[] = [];
    if (body.curve) {
      // Polar tuft from one end, projecting outward along the body axis.
      const end = body.curve.getPointAt(1);
      const outward = body.curve.getTangentAt(1).normalize();
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
        result.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.03, 6, false));
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
      result.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.03, 6, false));
    }
    return result;
  }, [body, count, radius]);

  return (
    <group userData={nodeData} {...handlers}>
      {curves.map((geo, i) => (
        <mesh key={i} geometry={geo}>
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
