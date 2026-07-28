import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import type { StructureNode } from '@/types/content';
import { defaultRadius, isShell, isWall, roughen, spikeForm } from './geometry';
import { CLIP_PLANES, GHOST_OPACITY, GHOST_PLANES, isClipped } from './clip';
import { isPointerDown, wasDrag } from './pointer';
import { cappedTube, shellSurface } from './shell';
import {
  type CellBody,
  type CellLayout,
  INTERIOR_HEADROOM,
  NUCLEOID_AXIAL,
  endoflagellum,
  nucleoidStrand,
  plasmidAnchor,
  polarAxis,
  surfacePoints,
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
  /** Radii the cell's contents and appendages are positioned against. */
  layout: CellLayout;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

const UP = new THREE.Vector3(0, 1, 0);

/**
 * Cutaway convention: continuous envelope shells are sliced by the cross-section,
 * while small discrete contents (ribosomes, DNA, spikes, flagella) are drawn
 * WHOLE — a half-sliced granule reads as a rendering artefact, not anatomy.
 * Those elements are instead faded per-instance by which half they sit in, so
 * nothing solid floats in front of the cut face.
 */
const isSliced = isShell;

const _wp = new THREE.Vector3();

/**
 * Fades whole child meshes that fall on the removed half down to a ghost rather
 * than hiding them, so the cut shows a cell opened up instead of a cell with a
 * piece missing. Children may carry a `cullPoint` in userData when their
 * geometry is baked in world coordinates (flagella), otherwise their own
 * position is used.
 *
 * `baseOpacity` is passed in rather than captured because selection and dimming
 * move it: reading it back off the material would latch whatever this hook
 * itself wrote on the previous frame.
 */
function useHalfGhost(
  ref: React.RefObject<THREE.Group | null>,
  baseOpacity: number,
  enabled = true,
) {
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    for (const child of g.children) {
      const mat = (child as THREE.Mesh).material as THREE.Material & { opacity: number };
      const ghosted = enabled && (() => {
        const cp = child.userData?.cullPoint as THREE.Vector3 | undefined;
        if (cp) _wp.copy(cp);
        else child.getWorldPosition(_wp);
        return isClipped(_wp);
      })();
      child.userData.ghosted = ghosted;
      if (!mat) continue;
      mat.opacity = ghosted ? baseOpacity * GHOST_OPACITY : baseOpacity;
      mat.depthWrite = !ghosted;
    }
  });
}

/** Walk up the tree — a hit on a hidden or ghosted child must not count. */
function isVisibleInTree(object: THREE.Object3D): boolean {
  let o: THREE.Object3D | null = object;
  while (o) {
    if (!o.visible || o.userData?.ghosted) return false;
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

  /**
   * The structure the cursor is really on: the smallest visible mesh under the
   * ray, ties broken by nearest. Every envelope layer encloses everything
   * inside it, so the nearest hit is almost always the outermost shell — going
   * by nearest alone would make a ribosome unreachable through the cytoplasm
   * around it. Hover and click both resolve through here, so what lights up
   * under the cursor is always what a click would select.
   */
  const bestTarget = (intersections: ThreeEvent<MouseEvent>['intersections']) => {
    let best: { sid: string; size: number; distance: number } | null = null;
    for (const i of intersections) {
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
    return best;
  };

  /** Only the winning mesh's handler acts; the rest let the event pass on. */
  const wins = (e: ThreeEvent<PointerEvent> | ThreeEvent<MouseEvent>) =>
    bestTarget(e.intersections)?.sid === structure.id;

  const hover = (e: ThreeEvent<PointerEvent>) => {
    // Mid-gesture the cursor is steering the camera, not pointing at things.
    if (isPointerDown()) return;
    if (!wins(e)) return;
    e.stopPropagation();
    props.onHover(structure.id);
    document.body.style.cursor = 'pointer';
  };

  const handlers = {
    onClick: (e: ThreeEvent<MouseEvent>) => {
      if (!wins(e)) return;
      // A gesture that travelled was an orbit, not a choice. Swallow it so
      // releasing the mouse over a structure does not fly the camera at it.
      if (wasDrag()) return;
      e.stopPropagation();
      if (structure.clickable === false) return;
      props.onSelect(structure.id);
    },
    onPointerOver: hover,
    // Re-resolved on movement as well as on entry: sliding from the cytoplasm
    // onto a granule beneath it never re-enters any mesh, so entry alone would
    // leave the highlight stuck on whatever the pointer first crossed.
    onPointerMove: hover,
    onPointerOut: (e: ThreeEvent<PointerEvent>) => {
      // Leaving one mesh while still inside the shells around it must not blank
      // the highlight: within a single move, `out` on the mesh being left can be
      // dispatched after `move` on the mesh being entered, so clearing
      // unconditionally would undo a highlight that was just correctly set.
      // Yield if anything still under the cursor owns it.
      const best = bestTarget(e.intersections);
      if (best && best.sid !== structure.id) return;
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
    case 'inclusion':
      return <InclusionsMesh {...sub} />;
    case 'endospore':
      return <EndosporeMesh {...sub} />;
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
    onPointerOut: (e: ThreeEvent<PointerEvent>) => void;
  };
};

/** The stretch of centreline a structure occupies, as its own curve. */
function centrelineSpan(body: CellBody, fraction: number): THREE.Curve<THREE.Vector3> {
  const lo = 0.5 - fraction / 2;
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 24; i++) pts.push(body.curve!.getPointAt(lo + fraction * (i / 24)));
  return new THREE.CatmullRomCurve3(pts);
}

/** Envelope layer: a closed shell swept along the body, with the cut half ghosted. */
function ShellMesh(props: SubProps) {
  const { structure, body, radius, handlers, nodeData } = props;
  const ref = useRef<THREE.Group>(null);
  const kind = structure.kind;
  const isCapsule = kind === 'capsule';
  const isTranslucent = isCapsule || kind === 'cytoplasm';
  const isWaxy = kind === 'mycolic-acid';
  const baseOpacity = structure.geometry?.opacity ?? (isTranslucent ? 0.28 : 0.92);
  const v = computeVisual(structure, props, baseOpacity);
  const thickness = structure.geometry?.thickness ?? 0;

  /**
   * Walls get an inner surface as well as an outer one, so the cut face shows a
   * band of the authored thickness rather than a single line — which is what
   * makes the periplasm visible, and the thick Gram-positive wall obviously
   * thicker than the Gram-negative one. The capsule and the cytoplasm are
   * regions, not walls, so they keep one bounding surface.
   *
   * The capsule instead gets several roughened surfaces at falling opacity: a
   * real capsule is a loose gel that fades out into the medium, and a crisp
   * shell edge is exactly the thing a capsule does not have.
   */
  const surfaces = useMemo(() => {
    if (isCapsule) {
      return [0.86, 0.94, 1].map((f, i) => ({
        geo: roughen(shellSurface(body, radius * f), radius * 0.035, 2.6 / Math.max(radius, 0.2)),
        opacity: 1 - i * 0.28,
      }));
    }
    const outer = { geo: shellSurface(body, radius), opacity: 1 };
    if (isWaxy) roughen(outer.geo, radius * 0.012, 9 / Math.max(radius, 0.2));
    if (!isWall(kind) || thickness <= 0) return [outer];
    const inner = Math.max(radius - thickness, radius * 0.25);
    return [outer, { geo: shellSurface(body, inner), opacity: 1 }];
  }, [body, radius, kind, thickness, isCapsule, isWaxy]);

  useFrame(() => {
    if (!ref.current) return;
    const target = props.selected ? 1.02 : 1;
    ref.current.scale.lerp(new THREE.Vector3(target, target, target), 0.15);
  });

  const mat = (opacity: number, ghost: boolean) => (
    <meshStandardMaterial
      color={v.color}
      emissive={v.emissive}
      emissiveIntensity={v.emissiveIntensity}
      transparent
      opacity={opacity * (ghost ? GHOST_OPACITY : 1)}
      // Wax is denser and a little glossier than a lipid bilayer; that sheen is
      // the whole reason the acid-fast wall resists stains and drugs.
      roughness={isWaxy ? 0.26 : 0.5}
      metalness={isWaxy ? 0.12 : 0.05}
      side={THREE.DoubleSide}
      depthWrite={!isTranslucent && !ghost}
      clippingPlanes={ghost ? GHOST_PLANES : CLIP_PLANES}
    />
  );

  return (
    <group ref={ref} userData={nodeData} {...handlers}>
      {surfaces.map((s, i) => (
        <mesh key={`k${i}`} geometry={s.geo}>
          {mat(v.opacity * s.opacity, false)}
        </mesh>
      ))}
      {/* The removed half, kept as a faint shell so the silhouette survives the cut. */}
      {surfaces.map((s, i) => (
        <mesh key={`g${i}`} geometry={s.geo} raycast={() => null}>
          {mat(v.opacity * s.opacity, true)}
        </mesh>
      ))}
    </group>
  );
}

function SpikesMesh(props: SubProps) {
  const { structure, body, radius, handlers, nodeData } = props;
  const count = structure.geometry?.count ?? 60;
  const v = computeVisual(structure, props, 0.95);
  const form = spikeForm[structure.kind] ?? spikeForm.lps;
  const isPili = structure.kind === 'pili';

  const spikes = useMemo(() => {
    return surfacePoints(body, radius, count).map(({ position, normal }, i) => {
      const q = new THREE.Quaternion().setFromUnitVectors(UP, normal);
      // One conjugative pilus, long and thick: the one that hands a resistance
      // plasmid to the next cell, so it earns being told apart from the rest.
      const sex = isPili && i === 0;
      const len = form.len * (sex ? 2.4 : 1);
      return {
        position: position.clone().addScaledVector(normal, len / 2).toArray() as [number, number, number],
        quaternion: [q.x, q.y, q.z, q.w] as [number, number, number, number],
        args: [form.tip * (sex ? 1.5 : 1), form.base * (sex ? 1.5 : 1), len, 6] as [
          number, number, number, number,
        ],
      };
    });
  }, [body, count, radius, form, isPili]);

  // Whole spikes are ghosted or shown — never sliced through. The selected
  // structure is always shown complete, so focusing it can't fade half of it.
  const ref = useRef<THREE.Group>(null);
  useHalfGhost(ref, v.opacity, !props.selected);

  return (
    <group ref={ref} userData={nodeData} {...handlers}>
      {spikes.map((s, i) => (
        <mesh key={i} position={s.position} quaternion={s.quaternion}>
          <cylinderGeometry args={s.args} />
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

/**
 * Ribosomes, crowded into the cytoplasm around the chromosome.
 *
 * They used to be scattered evenly through the whole volume, which put them
 * straight on top of the nucleoid. A real nucleoid excludes ribosomes — the
 * DNA-filled region is simply too dense for them — so they occupy the space
 * between it and the membrane, and that exclusion is visible under EM.
 */
function RibosomesMesh(props: SubProps) {
  const { structure, body, layout, handlers, nodeData } = props;
  const count = structure.geometry?.count ?? 80;
  const v = computeVisual(structure, props, 1);
  const positions = useMemo(
    () =>
      volumePoints(
        body,
        layout.interior * INTERIOR_HEADROOM,
        count,
        layout.nucleoid > 0 ? layout.nucleoid * 1.06 : 0,
        NUCLEOID_AXIAL * 1.2,
      ).map((p) => p.toArray() as [number, number, number]),
    [body, count, layout],
  );

  // Granules in the removed half fade to a ghost; the rest render intact.
  const ref = useRef<THREE.Group>(null);
  useHalfGhost(ref, v.opacity, !props.selected);

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
  const { structure, body, layout, handlers, nodeData } = props;
  const ref = useRef<THREE.Mesh>(null);
  const v = computeVisual(structure, props, 0.92);
  // Both readings are true and they teach different things, so the model shows
  // whichever is being asked about: the lobed region the chromosome actually
  // occupies at rest, and the single closed circle it actually is when you
  // select it to ask what the chromosome *is*.
  const asLoop = props.selected;

  const geo = useMemo(() => {
    const outer = layout.nucleoid;
    if (asLoop) {
      const strand = nucleoidStrand(body, outer);
      return new THREE.TubeGeometry(strand.curve, strand.segments, strand.radius, 8, true);
    }
    // The resting nucleoid: an irregular lobed mass. Built at 78% of the space
    // it is allowed so the lobes have somewhere to go — `roughen` displaces by
    // at most its amplitude, and the two together come to `outer` exactly, which
    // is already capped inside the cytoplasm.
    const core = outer * 0.78;
    const lobes = outer * 0.2;
    const blob = body.curve
      ? // Follows the centreline, so it stays inside a comma or a coil too.
        cappedTube(centrelineSpan(body, NUCLEOID_AXIAL), core, 60)
      : new THREE.SphereGeometry(core, 40, 28);
    return roughen(blob, lobes, 2.4 / Math.max(outer, 0.2));
  }, [body, layout, asLoop]);

  /**
   * The loop is baked in world space, so it can only be spun about an axis the
   * cell itself is symmetric around — any axis through a coccus, the long axis of
   * a straight rod. Curved and helical bodies have no such axis: spinning those
   * sweeps the chromosome straight out through the cell wall, so they stay put
   * and show selection by their glow alone.
   */
  const spinAxis = useMemo(() => {
    if (!body.curve) return body.ey.clone();
    if (body.kind === 'bacillus' || body.kind === 'coccobacillus') return body.ex.clone();
    return null;
  }, [body]);
  const spin = useRef(0);

  useFrame((_, delta) => {
    if (!ref.current || !props.selected || !spinAxis) return;
    spin.current += delta * 0.22;
    ref.current.setRotationFromAxisAngle(spinAxis, spin.current);
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
  const { structure, body, radius, layout, handlers, nodeData } = props;
  const count = structure.geometry?.count ?? 2;
  const v = computeVisual(structure, props, 0.96);
  const ref = useRef<THREE.Group>(null);

  const loops = useMemo(() => {
    const limit = layout.interior * INTERIOR_HEADROOM;
    return Array.from({ length: count }, (_, i) => {
      // Vary the sizes a little so they read as a population, not copies.
      const loopR = Math.min(radius > 0 ? radius : limit * 0.3, limit * 0.42);
      const r = loopR * (0.72 + 0.28 * ((i * 0.53) % 1));
      const tubeR = Math.max(r * 0.18, 0.015);
      // Sit as far out as the loop fits, which is also what keeps plasmids clear
      // of the chromosome filling the middle of the cell.
      const ring = Math.max(limit - r - tubeR, 0);
      // Twist each loop differently so they read as separate circles.
      const rot: [number, number, number] = [
        Math.PI * (0.28 + i * 0.16),
        Math.PI * (0.12 + i * 0.33),
        Math.PI * (i * 0.21),
      ];
      return {
        position: plasmidAnchor(body, i, ring).toArray() as [number, number, number],
        rotation: rot,
        args: [r, tubeR, 12, 64] as [number, number, number, number],
      };
    });
  }, [body, count, layout, radius]);

  // Each circle turns on the spot. Orbiting the whole group instead would swing
  // the outer plasmids through the cell wall of anything but a coccus.
  useFrame((_, delta) => {
    if (!ref.current || !props.selected) return;
    for (const child of ref.current.children) child.rotation.z += delta * 0.5;
  });

  // Whole plasmids are ghosted or shown — never sliced through, and never left
  // floating solid in front of the cut face.
  useHalfGhost(ref, v.opacity, !props.selected);

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

/**
 * Flagella, anchored where they actually attach.
 *
 * The filament used to begin at the centreline, so every flagellum ran out
 * through the cytoplasm and the cutaway showed it crossing the cell. A real
 * flagellum is built on a basal body seated in the envelope: rings through the
 * membranes, a short hook, then the filament outside. It is drawn that way here
 * — the rotor is the motor, and it is what several motility and vaccine targets
 * act on.
 *
 * Spirochaetes are the exception and get their own treatment (see
 * `endoflagellum`): their filaments never leave the cell.
 */
function FlagellaMesh(props: SubProps) {
  const { structure, body, layout, handlers, nodeData } = props;
  const count = structure.geometry?.count ?? 3;
  const v = computeVisual(structure, props, 0.95);
  const surface = layout.envelope;

  const parts = useMemo(() => {
    const filaments: { geo: THREE.TubeGeometry; cullPoint: THREE.Vector3 }[] = [];
    const rotors: { position: THREE.Vector3; quaternion: THREE.Quaternion; r: number }[] = [];
    const addFilament = (pts: THREE.Vector3[], thickness: number) =>
      filaments.push({
        geo: new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, thickness, 6, false),
        cullPoint: pts[Math.floor(pts.length / 2)].clone(),
      });

    // Spirochaete: endoflagella coiled inside the periplasm, anchored at both
    // poles and overlapping in the middle — the reason the whole cell corkscrews.
    if (body.kind === 'spirochete') {
      const periplasm = (layout.interior + layout.envelope) / 2;
      for (let f = 0; f < Math.max(count, 2); f++) {
        const pts = endoflagellum(
          body,
          periplasm - layout.interior * 0.12,
          (f % 2) as 0 | 1,
          0.72,
          1.4,
          (f * Math.PI * 2) / Math.max(count, 2),
        );
        if (pts.length) addFilament(pts, 0.022);
      }
      return { filaments, rotors };
    }

    const anchor = (base: THREE.Vector3, outward: THREE.Vector3, phase: number) => {
      // Rotor rings sit in the envelope; the filament starts at the surface.
      const q = new THREE.Quaternion().setFromUnitVectors(UP, outward);
      rotors.push({ position: base.clone().addScaledVector(outward, -0.02), quaternion: q, r: 0.075 });
      rotors.push({
        position: base.clone().addScaledVector(outward, -(surface - layout.interior) * 0.75),
        quaternion: q,
        r: 0.055,
      });
      const pts: THREE.Vector3[] = [];
      const segments = 12;
      const perp = new THREE.Vector3().crossVectors(outward, body.ez).normalize();
      const swing = new THREE.Vector3().crossVectors(outward, perp).normalize();
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const along = base.clone().addScaledVector(outward, t * surface * 3.2);
        // A short straight hook, then the filament's helical wave.
        const amp = Math.min(t / 0.18, 1) * 0.34 * (1 - t * 0.2);
        const a = t * Math.PI * 3.4 + phase;
        along.addScaledVector(swing, Math.sin(a) * amp).addScaledVector(perp, Math.cos(a) * amp * 0.5);
        pts.push(along);
      }
      addFilament(pts, 0.03);
    };

    if (body.curve) {
      // Polar tuft: every filament leaves through the pole's surface.
      const { end, outward } = polarAxis(body);
      const perp = body.ey.clone();
      for (let f = 0; f < count; f++) {
        const spread = (f - (count - 1) / 2) * 0.3;
        const dir = outward.clone().addScaledVector(perp, spread).normalize();
        anchor(end.clone().addScaledVector(dir, surface), dir, f);
      }
      return { filaments, rotors };
    }
    // Coccus: peritrichous, leaving radially all over the surface.
    for (let f = 0; f < count; f++) {
      const angle = (f / count) * Math.PI * 2;
      const tilt = ((f * 0.37) % 1) - 0.5;
      const dir = new THREE.Vector3(Math.cos(angle), Math.sin(angle), tilt).normalize();
      anchor(dir.clone().multiplyScalar(surface), dir, f);
    }
    return { filaments, rotors };
  }, [body, count, layout, surface]);

  // Filaments outside the envelope still ghost with the cut, so the near-side
  // ones do not hang solid in front of an opened cell.
  const ref = useRef<THREE.Group>(null);
  useHalfGhost(ref, v.opacity, !props.selected);

  const mat = (
    <meshStandardMaterial
      color={v.color}
      emissive={v.emissive}
      emissiveIntensity={v.emissiveIntensity}
      transparent
      opacity={v.opacity}
      roughness={0.5}
    />
  );

  return (
    <group ref={ref} userData={nodeData} {...handlers}>
      {parts.filaments.map((c, i) => (
        <mesh key={`f${i}`} geometry={c.geo} userData={{ cullPoint: c.cullPoint }}>
          {mat}
        </mesh>
      ))}
      {parts.rotors.map((r, i) => (
        <mesh key={`r${i}`} position={r.position} quaternion={r.quaternion}>
          <cylinderGeometry args={[r.r, r.r, 0.035, 12]} />
          {mat}
        </mesh>
      ))}
    </group>
  );
}

/**
 * The endospore: a dormant survival body built inside the mother cell, not a
 * reproductive one — one cell makes one spore, so it is a way of persisting
 * rather than of multiplying.
 *
 * Where it forms and whether it is wider than the cell that made it are two of
 * the standard identification features, so both are read off the data rather
 * than fixed: a terminal spore broad enough to distend the mother cell gives
 * Clostridium tetani its drumstick, while a central spore narrower than the rod
 * leaves a Bacillus straight-sided. When it is the wider of the two it is drawn
 * bulging through the envelope, because that is exactly what it does.
 */
function EndosporeMesh(props: SubProps) {
  const { structure, body, radius, handlers, nodeData } = props;
  const v = computeVisual(structure, props, 0.97);
  const where = structure.geometry?.position ?? 'central';

  const spore = useMemo(() => {
    const t = where === 'central' ? 0.5 : where === 'subterminal' ? 0.74 : 0.87;
    const centre = body.curve ? body.curve.getPointAt(t) : new THREE.Vector3();
    const axis = body.curve ? body.curve.getTangentAt(t).normalize() : body.ex.clone();
    // Slightly prolate, lying along the cell — a spore is an oval, not a ball.
    const quat = new THREE.Quaternion().setFromUnitVectors(UP, axis);
    return { position: centre.toArray() as [number, number, number], quaternion: quat };
  }, [body, where]);

  const ref = useRef<THREE.Group>(null);
  useHalfGhost(ref, v.opacity, !props.selected);

  const mat = (opacity: number) => (
    <meshStandardMaterial
      color={v.color}
      emissive={v.emissive}
      emissiveIntensity={v.emissiveIntensity}
      transparent
      opacity={opacity}
      roughness={0.3}
      metalness={0.05}
    />
  );

  return (
    <group ref={ref} userData={nodeData} {...handlers}>
      {/* Core: dehydrated, calcium-dipicolinate-packed, and highly refractile. */}
      <mesh position={spore.position} quaternion={spore.quaternion} scale={[1, 1.18, 1]}>
        <sphereGeometry args={[radius, 28, 20]} />
        {mat(v.opacity)}
      </mesh>
      {/* Coat: the tough proteinaceous layers that make it so hard to kill. */}
      <mesh position={spore.position} quaternion={spore.quaternion} scale={[1, 1.18, 1]}>
        <sphereGeometry args={[radius * 1.16, 24, 16]} />
        {mat(v.opacity * 0.3)}
      </mesh>
    </group>
  );
}

/**
 * Storage granules: reserve material the cell has set aside, distinct from the
 * ribosomes around them because they are supply rather than machinery.
 */
function InclusionsMesh(props: SubProps) {
  const { structure, body, radius, layout, handlers, nodeData } = props;
  const count = structure.geometry?.count ?? 6;
  const v = computeVisual(structure, props, 0.95);
  const positions = useMemo(
    () =>
      volumePoints(
        body,
        layout.interior * INTERIOR_HEADROOM - radius,
        count,
        layout.nucleoid > 0 ? layout.nucleoid * 1.1 : 0,
        NUCLEOID_AXIAL * 1.2,
      ),
    [body, count, layout, radius],
  );

  const ref = useRef<THREE.Group>(null);
  useHalfGhost(ref, v.opacity, !props.selected);

  return (
    <group ref={ref} userData={nodeData} {...handlers}>
      {positions.map((p, i) => (
        <mesh key={i} position={p.toArray() as [number, number, number]}>
          <sphereGeometry args={[radius * (0.7 + 0.3 * ((i * 0.53) % 1)), 16, 12]} />
          <meshStandardMaterial
            color={v.color}
            emissive={v.emissive}
            emissiveIntensity={v.emissiveIntensity}
            transparent
            opacity={v.opacity}
            roughness={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}
