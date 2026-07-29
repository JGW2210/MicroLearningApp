import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { surfacePoints, type CellBody } from './body';
import { prefersReducedMotion } from './motion';
import type { Journey } from './journey';

/**
 * Molecules of a drug arriving at the cell, and whatever becomes of them.
 *
 * Deliberately schematic. These are not molecules to scale — nothing at this
 * magnification would be — and the point is not to depict a β-lactam ring but
 * to answer the two questions the prose answers slowly: how far in did it get,
 * and what happened when it got there. Everything about the path comes from
 * `journey.ts`, which reads it off the mechanism.
 *
 * Written to the object transforms directly rather than through React state:
 * this runs at frame rate, and re-rendering the tree sixty times a second to
 * move five spheres would be absurd.
 */

/** Molecules in flight at once. Enough to read as a stream, few enough to follow. */
const COUNT = 5;
/** Fraction of a cycle spent travelling in; the rest is the ending. */
const APPROACH = 0.55;

interface Props {
  body: CellBody;
  journey: Journey;
}

export function DrugJourney({ body, journey }: Props) {
  const group = useRef<THREE.Group>(null);

  /**
   * Where each molecule comes in.
   *
   * Approaches are spread over the cell surface rather than all arriving at one
   * spot, so the drug reads as surrounding the cell — which it does — and so a
   * single unlucky angle cannot hide the whole animation behind the cut.
   */
  const lanes = useMemo(
    () =>
      surfacePoints(body, journey.startRadius, COUNT)
        .slice(0, COUNT)
        .map(({ position, normal }, i) => ({
          base: position.clone().addScaledVector(normal, -journey.startRadius),
          out: normal.clone(),
          // Staggered so they arrive in a stream rather than in lockstep.
          phase: i / COUNT,
          // A fixed sideways direction for the endings that drift.
          side: new THREE.Vector3()
            .crossVectors(normal, body.ez)
            .normalize()
            .multiplyScalar(i % 2 === 0 ? 1 : -1),
        })),
    [body, journey.startRadius],
  );

  const size = Math.max(journey.startRadius * 0.055, 0.035);
  const clock = useRef(0);
  const _p = new THREE.Vector3();

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    // Asked for less movement: hold every molecule at its ending instead of
    // running the loop. The information is where it stopped and what became of
    // it, and that survives being still.
    const frozen = prefersReducedMotion();
    if (!frozen) clock.current += delta * 0.32;

    g.children.forEach((lane, i) => {
      const { base, out, phase, side } = lanes[i];
      const t = frozen ? 0.78 : (clock.current + phase) % 1;
      const [main, fragA, fragB] = lane.children as THREE.Mesh[];

      // The approach is the same for every ending: in from outside, to the
      // radius the mechanism stops it at.
      const closing = Math.min(t / APPROACH, 1);
      let radius = THREE.MathUtils.lerp(journey.startRadius, journey.stopRadius, closing);
      let opacity = t < 0.06 ? t / 0.06 : 1;
      let drift = 0;
      let split = 0;

      if (t > APPROACH) {
        // ...and then the endings diverge, which is the whole point.
        const after = (t - APPROACH) / (1 - APPROACH);
        switch (journey.fate) {
          case 'docked':
            // Stays. Fades only at the very end so the next one can arrive.
            opacity = after > 0.85 ? (1 - after) / 0.15 : 1;
            break;
          case 'cleaved':
            // Comes apart where the enzyme met it.
            split = after;
            opacity = 1 - after;
            break;
          case 'ejected':
            radius = THREE.MathUtils.lerp(journey.stopRadius, journey.exitRadius, after ** 0.7);
            opacity = 1 - after ** 2;
            break;
          case 'blocked':
            // Recoils off a barrier it cannot cross.
            radius = journey.stopRadius + (journey.startRadius - journey.stopRadius) * after ** 1.5;
            opacity = 1 - after;
            break;
          case 'unbound':
            // Touches the target, then slides away along it.
            drift = after * journey.stopRadius * 0.5;
            opacity = after < 0.2 ? 1 : 1 - (after - 0.2) / 0.8;
            break;
          case 'absent':
            opacity = 1 - after;
            break;
        }
      }

      _p.copy(base).addScaledVector(out, radius).addScaledVector(side, drift);
      lane.position.copy(_p);

      /*
       * No fading against the cut, unlike every other loose element in the cell.
       * The first version copied that behaviour and got it exactly backwards:
       * the removed half is the open half, so a molecule there is the one you
       * can actually watch travelling in, while a molecule on the far side is
       * hidden behind the shells that remain. Depth testing already handles the
       * second case, and dimming the first threw away the only view of the
       * journey the cutaway gives you.
       */
      const setOpacity = (mesh: THREE.Mesh, value: number) => {
        const material = mesh.material as THREE.MeshBasicMaterial;
        material.opacity = Math.max(0, value);
      };

      main.visible = split === 0;
      setOpacity(main, opacity);
      fragA.visible = fragB.visible = split > 0;
      if (split > 0) {
        const apart = split * size * 3.4;
        fragA.position.set(apart, apart * 0.4, 0);
        fragB.position.set(-apart, -apart * 0.5, apart * 0.3);
        setOpacity(fragA, opacity);
        setOpacity(fragB, opacity);
      }
    });
  });

  return (
    <group ref={group}>
      {lanes.map((_, i) => (
        <group key={i}>
          <mesh raycast={() => null}>
            <sphereGeometry args={[size, 14, 10]} />
            <meshBasicMaterial color={journey.color} transparent depthWrite={false} toneMapped={false} />
          </mesh>
          {/* The two halves it breaks into. Idle unless the ending is `cleaved`. */}
          {[0, 1].map((f) => (
            <mesh key={f} visible={false} raycast={() => null}>
              <sphereGeometry args={[size * 0.6, 10, 8]} />
              <meshBasicMaterial color={journey.color} transparent depthWrite={false} toneMapped={false} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
