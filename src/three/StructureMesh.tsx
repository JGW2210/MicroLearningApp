import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import type { StructureNode } from '@/types/content';
import { defaultRadius, fibonacciSphere, fibonacciVolume } from './geometry';

export interface StructureVisualState {
  selected: boolean;
  hovered: boolean;
  dimmed: boolean;
  /** Emphasised because an antibiotic/resistance overlay targets it. */
  highlighted: boolean;
}

interface Props extends StructureVisualState {
  structure: StructureNode;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

const UP = new THREE.Vector3(0, 1, 0);

/** Shared material tuning derived from selection/hover/overlay state. */
function useMaterialState(
  structure: StructureNode,
  vs: StructureVisualState,
  baseOpacity: number,
) {
  const emissiveIntensity = vs.selected
    ? 0.9
    : vs.hovered
      ? 0.55
      : vs.highlighted
        ? 0.5
        : structure.geometry?.glow ?? 0.12;
  const opacity = vs.dimmed ? baseOpacity * 0.18 : baseOpacity;
  const emissive = vs.highlighted && !vs.selected ? '#ffffff' : structure.color;
  return { emissiveIntensity, opacity, emissive };
}

export function StructureMesh(props: Props) {
  const { structure } = props;
  const radius = structure.geometry?.radius ?? defaultRadius[structure.kind];

  const handlers = {
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (structure.clickable === false) return;
      props.onSelect(structure.id);
    },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      props.onHover(structure.id);
      document.body.style.cursor = 'pointer';
    },
    onPointerOut: () => {
      props.onHover(null);
      document.body.style.cursor = 'auto';
    },
  };

  switch (structure.kind) {
    case 'capsule':
    case 'outer-membrane':
    case 'peptidoglycan':
    case 'mycolic-acid':
    case 'cell-membrane':
    case 'cytoplasm':
      return <ShellMesh {...props} radius={radius} handlers={handlers} />;
    case 'teichoic-acid':
    case 'lps':
    case 'pili':
    case 'fimbriae':
      return <SpikesMesh {...props} radius={radius} handlers={handlers} />;
    case 'ribosomes':
      return <RibosomesMesh {...props} radius={radius} handlers={handlers} />;
    case 'nucleoid':
      return <NucleoidMesh {...props} radius={radius} handlers={handlers} />;
    case 'plasmid':
      return <PlasmidMesh {...props} radius={radius} handlers={handlers} />;
    case 'flagellum':
      return <FlagellaMesh {...props} radius={radius} handlers={handlers} />;
    default:
      return null;
  }
}

type SubProps = Props & {
  radius: number;
  handlers: {
    onClick: (e: ThreeEvent<MouseEvent>) => void;
    onPointerOver: (e: ThreeEvent<PointerEvent>) => void;
    onPointerOut: () => void;
  };
};

/** Cutaway spherical shell for envelope layers. */
function ShellMesh(props: SubProps) {
  const { structure, radius, handlers } = props;
  const ref = useRef<THREE.Mesh>(null);
  const isTranslucent =
    structure.kind === 'capsule' || structure.kind === 'cytoplasm';
  const baseOpacity =
    structure.geometry?.opacity ?? (isTranslucent ? 0.28 : 0.92);
  const mat = useMaterialState(structure, props, baseOpacity);

  useFrame(() => {
    if (!ref.current) return;
    const target = props.selected ? 1.03 : 1;
    ref.current.scale.lerp(new THREE.Vector3(target, target, target), 0.15);
  });

  return (
    <mesh ref={ref} {...handlers}>
      <sphereGeometry args={[radius, 64, 48]} />
      <meshStandardMaterial
        color={structure.color}
        emissive={mat.emissive}
        emissiveIntensity={mat.emissiveIntensity}
        transparent
        opacity={mat.opacity}
        roughness={0.55}
        metalness={0.05}
        side={THREE.DoubleSide}
        depthWrite={!isTranslucent}
      />
    </mesh>
  );
}

/** Radial spikes/brush layer (teichoic acids, LPS, pili, fimbriae). */
function SpikesMesh(props: SubProps) {
  const { structure, radius, handlers } = props;
  const count = structure.geometry?.count ?? 60;
  const baseOpacity = props.dimmed ? 0.18 : 0.95;
  const mat = useMaterialState(structure, props, 1);

  const spikes = useMemo(() => {
    const points = fibonacciSphere(count, radius);
    return points.map(([x, y, z]) => {
      const dir = new THREE.Vector3(x, y, z).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(UP, dir);
      return {
        position: [x, y, z] as [number, number, number],
        quaternion: [q.x, q.y, q.z, q.w] as [number, number, number, number],
      };
    });
  }, [count, radius]);

  const isHairlike = structure.kind === 'pili' || structure.kind === 'fimbriae';
  const len = isHairlike ? 0.9 : 0.35;
  const thick = isHairlike ? 0.02 : 0.04;

  return (
    <group {...handlers}>
      {spikes.map((s, i) => (
        <mesh key={i} position={s.position} quaternion={s.quaternion}>
          <cylinderGeometry args={[thick * 0.6, thick, len, 6]} />
          <meshStandardMaterial
            color={structure.color}
            emissive={mat.emissive}
            emissiveIntensity={mat.emissiveIntensity}
            transparent
            opacity={baseOpacity}
            roughness={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Scattered ribosome granules inside the cytoplasm. */
function RibosomesMesh(props: SubProps) {
  const { structure, radius, handlers } = props;
  const count = structure.geometry?.count ?? 80;
  const mat = useMaterialState(structure, props, 1);
  const positions = useMemo(() => fibonacciVolume(count, radius), [count, radius]);

  return (
    <group {...handlers}>
      {positions.map((p, i) => (
        <mesh key={i} position={p}>
          <icosahedronGeometry args={[0.055, 0]} />
          <meshStandardMaterial
            color={structure.color}
            emissive={mat.emissive}
            emissiveIntensity={mat.emissiveIntensity}
            transparent
            opacity={props.dimmed ? 0.15 : 1}
            roughness={0.4}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Supercoiled chromosomal DNA rendered as a torus knot tangle. */
function NucleoidMesh(props: SubProps) {
  const { structure, radius, handlers } = props;
  const ref = useRef<THREE.Mesh>(null);
  const mat = useMaterialState(structure, props, props.dimmed ? 0.2 : 0.9);

  useFrame((_, delta) => {
    if (ref.current && props.selected) ref.current.rotation.y += delta * 0.3;
  });

  return (
    <mesh ref={ref} {...handlers}>
      <torusKnotGeometry args={[radius * 0.6, radius * 0.16, 120, 12, 2, 3]} />
      <meshStandardMaterial
        color={structure.color}
        emissive={mat.emissive}
        emissiveIntensity={mat.emissiveIntensity}
        transparent
        opacity={mat.opacity}
        roughness={0.45}
      />
    </mesh>
  );
}

/** Small circular plasmid loop. */
function PlasmidMesh(props: SubProps) {
  const { structure, radius, handlers } = props;
  const mat = useMaterialState(structure, props, props.dimmed ? 0.2 : 0.95);
  return (
    <mesh {...handlers} rotation={[Math.PI / 2.5, 0, 0]} position={[radius * 0.4, -radius * 0.3, 0]}>
      <torusGeometry args={[0.35, 0.05, 16, 48]} />
      <meshStandardMaterial
        color={structure.color}
        emissive={mat.emissive}
        emissiveIntensity={mat.emissiveIntensity}
        transparent
        opacity={mat.opacity}
        roughness={0.45}
      />
    </mesh>
  );
}

/** One or more flagella as wavy tubes projecting from the surface. */
function FlagellaMesh(props: SubProps) {
  const { structure, radius, handlers } = props;
  const count = structure.geometry?.count ?? 3;
  const mat = useMaterialState(structure, props, props.dimmed ? 0.2 : 0.95);

  const curves = useMemo(() => {
    const result: THREE.TubeGeometry[] = [];
    for (let f = 0; f < count; f++) {
      const angle = (f / count) * Math.PI * 2;
      const base = new THREE.Vector3(
        Math.cos(angle) * radius * 0.7,
        Math.sin(angle) * radius * 0.7,
        0,
      );
      const dir = base.clone().normalize();
      const pts: THREE.Vector3[] = [];
      const segments = 5;
      const perp = new THREE.Vector3(-dir.y, dir.x, 0.3).normalize();
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const along = base.clone().add(dir.clone().multiplyScalar(t * 2.4));
        const wave = Math.sin(t * Math.PI * 3) * 0.35 * (1 - t * 0.3);
        along.add(perp.clone().multiplyScalar(wave));
        pts.push(along);
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      result.push(new THREE.TubeGeometry(curve, 40, 0.03, 6, false));
    }
    return result;
  }, [count, radius]);

  return (
    <group {...handlers}>
      {curves.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <meshStandardMaterial
            color={structure.color}
            emissive={mat.emissive}
            emissiveIntensity={mat.emissiveIntensity}
            transparent
            opacity={mat.opacity}
            roughness={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}
