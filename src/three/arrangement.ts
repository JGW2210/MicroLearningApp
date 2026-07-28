import * as THREE from 'three';
import type { CellArrangement } from '@/types/content';
import { bodyCenter, type CellBody } from './body';

/**
 * Where the other cells of the group sit.
 *
 * Arrangement is usually catalogued — chains, tetrads, clusters — as though it
 * were a list of shapes to memorise. It is not: every form on the list is the
 * visible record of two facts about how the cell divided, which plane the
 * septum went down and whether the daughters came apart afterwards. Laying the
 * group out in three dimensions rather than as a flat drawing is what makes that
 * legible, because the planes are then real planes you can look along, and a
 * tetrad's two perpendicular divisions stop being a claim about the picture and
 * become something you can see by orbiting round it.
 *
 * So the layouts here are built from division events, not from coordinates: each
 * cell records the cell it budded from and which round of division produced it,
 * and the septum between them falls out of that pair. `MicroscopyField`'s 2D
 * `layout()` draws the same forms for the microscope view; this is the same
 * biology given a third dimension and a causal history.
 */

/** One cell of the group, placed relative to the focused cell's own centre. */
export interface CellPlacement {
  offset: THREE.Vector3;
  /** Rotation about the cell's own centre — the focused cell is never rotated. */
  rotation: THREE.Quaternion;
}

/** The interface two daughters share: the plane the mother divided down. */
export interface Septum {
  position: THREE.Vector3;
  normal: THREE.Vector3;
  /** Which round of division opened it. 1 is the first plane. */
  generation: number;
}

export interface CellGroup {
  /** `placements[0]` is always the focused cell: no offset, no rotation. */
  placements: CellPlacement[];
  septa: Septum[];
  /** Centre of the whole group, relative to the focused cell's centre. */
  centre: THREE.Vector3;
  /** Radius about `centre` that contains every cell in it. */
  radius: number;
}

/** A cell under construction: where it sits, which way it points, where it came from. */
interface Cell {
  pos: THREE.Vector3;
  dir: THREE.Vector3;
  parent: number;
  generation: number;
  /** Joined daughters share a septum; cells that separated after dividing do not. */
  joined: boolean;
}

/**
 * @param girth  radius of the cell's outermost envelope layer — how fat it is,
 *   which is what sets how far apart two touching cells sit.
 * @param reach  radius of a sphere containing the whole drawn cell, used to
 *   space cells that are *not* touching and to size the group for the camera.
 */
export function cellGroup(
  arrangement: CellArrangement,
  body: CellBody,
  girth: number,
  reach: number,
): CellGroup {
  const { ex, ey, ez } = body;
  const half = body.curve ? body.length / 2 : 0;
  /** Centre-to-centre distance of two cells joined end to end. */
  const along = (half + girth) * 2 * 0.94;
  /** ...and of two joined flank to flank. */
  const across = girth * 2 * 0.9;
  /** Full end-to-end extent of one cell along its own axis. */
  const span = (half + girth) * 2;

  const cells: Cell[] = [
    { pos: new THREE.Vector3(), dir: ex.clone(), parent: -1, generation: 0, joined: false },
  ];
  const add = (
    pos: THREE.Vector3,
    dir: THREE.Vector3,
    parent: number,
    generation: number,
    joined = true,
  ) => cells.push({ pos, dir: dir.clone().normalize(), parent, generation, joined }) - 1;

  /** Turn a direction within the plane of the screen, and a little out of it. */
  const swing = (dir: THREE.Vector3, inPlane: number, outOfPlane = 0) =>
    dir
      .clone()
      .applyAxisAngle(ez, inPlane)
      .applyAxisAngle(ey, outOfPlane)
      .normalize();

  /**
   * The direction the group's first division ran along.
   *
   * A septum is a disc, and a disc whose normal lies in the plane of the screen
   * is drawn as a line: the default camera looks square across `ex`, so a pair
   * or a tetrad built strictly along it presents its first plane exactly
   * edge-on and invisible until the student thinks to orbit. A round cell has no
   * axis of its own to respect, so the group is turned a little into the screen
   * and the plane opens up. An elongated cell does have one — the whole group
   * follows the axis its cells are already drawn along — so it keeps `ex` and
   * the answer there is to orbit.
   */
  const axis = body.curve ? ex.clone() : swing(ex, 0, 0.3);

  /**
   * Hinge a daughter off the far end of `parent`, the way a snapping division
   * leaves a V: the two cells stay attached at the septum while the rest of each
   * swings away from it.
   */
  const hinge = (parent: number, angle: number, generation = 1) => {
    const p = cells[parent];
    const dir = swing(p.dir, angle);
    const vertex = p.pos.clone().addScaledVector(p.dir, span / 2);
    return add(vertex.clone().addScaledVector(dir, span * 0.47), dir, parent, generation);
  };

  switch (arrangement) {
    case 'pairs':
      // One division, then the pair stops. The septum between them is the only
      // plane this organism ever uses.
      add(axis.clone().multiplyScalar(along), axis, 0, 1);
      break;

    case 'tetrads': {
      // Two divisions at right angles. Drawn as a square rather than a line so
      // the second plane is visibly perpendicular to the first, which is the
      // whole distinction from a four-cell chain.
      const s = across;
      const at = (a: number, b: number) =>
        new THREE.Vector3().addScaledVector(axis, a).addScaledVector(ey, b);
      add(at(s, 0), axis, 0, 1);
      add(at(0, s), axis, 0, 2);
      add(at(s, s), axis, 1, 2);
      break;
    }

    case 'chains': {
      // One plane, used over and over, with the daughters never separating. The
      // chain is grown outward from the focused cell so it sits in the middle of
      // its own chain rather than dangling off one end.
      const n = body.curve ? 4 : 6;
      const before = Math.round((n - 1) / 2);
      // A real chain is not a ruled line: it drifts as the cells settle against
      // one another, so each link turns a little on both axes.
      const dirAt = (k: number) =>
        swing(axis, Math.sin(k * 0.85) * 0.28, Math.sin(k * 1.3 + 1) * 0.12);
      const index = new Map<number, number>([[0, 0]]);
      let pos = new THREE.Vector3();
      for (let k = 1; k <= n - 1 - before; k++) {
        pos = pos.clone().addScaledVector(dirAt(k - 1), along);
        index.set(k, add(pos, dirAt(k), index.get(k - 1)!, 1));
      }
      pos = new THREE.Vector3();
      for (let k = -1; k >= -before; k--) {
        pos = pos.clone().addScaledVector(dirAt(k), -along);
        index.set(k, add(pos, dirAt(k), index.get(k + 1)!, 1));
      }
      break;
    }

    case 'clusters': {
      // Division in every plane at once, and nothing separates: each new cell
      // buds off whichever face of the bunch has room, so the septa end up
      // pointing everywhere. That is the difference from a chain, and it is only
      // apparent in three dimensions.
      const dirs: THREE.Vector3[] = [];
      const golden = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < 26; i++) {
        const y = 1 - (i / 25) * 2;
        const rad = Math.sqrt(Math.max(0, 1 - y * y));
        const dir = new THREE.Vector3()
          .addScaledVector(axis, Math.cos(golden * i) * rad)
          .addScaledVector(ey, y)
          .addScaledVector(ez, Math.sin(golden * i) * rad)
          .normalize();
        // The bunch grows away from the viewer. A cluster is the one arrangement
        // that closes around a cell on every side, and grown in every direction
        // it buried the cell being studied inside itself — switching to the
        // group view made the open cell you were looking at disappear.
        if (dir.dot(ez) < 0.15) dirs.push(dir);
      }
      // Two daughters per cell before the next one starts budding. Letting one
      // cell take every daughter it had room for produced a rosette — six cells
      // evenly spaced around one — which is a flower, not a bunch. Capping it
      // pushes growth out onto the daughters and gives the irregular, lumpy
      // outline the arrangement is named for.
      const children = new Map<number, number>();
      for (let i = 1; i < 7; i++) {
        let placed = false;
        for (let p = 0; p < cells.length && !placed; p++) {
          if ((children.get(p) ?? 0) >= 2) continue;
          for (let d = 0; d < dirs.length && !placed; d++) {
            const pos = cells[p].pos
              .clone()
              .addScaledVector(dirs[(d + i * 9) % dirs.length], across);
            if (cells.some((c) => c.pos.distanceTo(pos) < across * 0.93)) continue;
            add(pos, axis, p, Math.min(cells[p].generation + 1, 3));
            children.set(p, (children.get(p) ?? 0) + 1);
            placed = true;
          }
        }
      }
      break;
    }

    case 'palisades': {
      // Snapping division: the outer wall holds while the inner one splits, so
      // the daughters hinge apart into a V instead of parting. Repeated, the
      // rods end up stacked alongside each other like a fence — which is why the
      // fence neighbours carry no septum between their flanks. They are not
      // joined there; they merely came to lie there.
      const flank = across * 1.15;
      hinge(0, 0.7);
      const upper = add(
        new THREE.Vector3().addScaledVector(ey, flank).addScaledVector(axis, span * 0.16),
        swing(axis, 0.05),
        0,
        1,
        false,
      );
      add(
        new THREE.Vector3().addScaledVector(ey, -flank).addScaledVector(axis, -span * 0.2),
        swing(axis, -0.06),
        0,
        1,
        false,
      );
      hinge(upper, -0.6);
      break;
    }

    case 'filaments': {
      // Cells that stay joined end to end and then branch, growing as a thread
      // rather than as separate cells. The joins are drawn tighter than in the
      // other arrangements because a filament reads as one continuous body.
      const tight = (half + girth) * 2 * 0.98;
      const ahead = add(axis.clone().multiplyScalar(tight), axis, 0, 1);
      add(axis.clone().multiplyScalar(-tight), axis, 0, 1);
      // The thread has to carry on past the branch point, or the branch reads as
      // a kink in a thread that stopped rather than as a second thread leaving
      // one that did not.
      add(axis.clone().multiplyScalar(tight * 2), axis, ahead, 1);
      // A branch is a wall laid down at an angle to the thread, so it counts as
      // a division of its own kind and is coloured apart from the cross-walls.
      hinge(ahead, 0.95, 2);
      break;
    }

    case 'single':
    default: {
      // Daughters separate cleanly, so there is nothing to draw a septum
      // between: three individuals, at their own angles, with clear water
      // between them. Spacing goes by `reach` rather than by girth precisely
      // because these cells are not touching.
      const d = reach * 1.9;
      const place = (a: number, b: number, c: number, turn: number, tilt: number) =>
        add(
          new THREE.Vector3()
            .addScaledVector(axis, d * a)
            .addScaledVector(ey, d * b)
            .addScaledVector(ez, d * c),
          swing(axis, turn, tilt),
          -1,
          0,
          false,
        );
      place(0.62, 0.78, -0.3, 0.6, 0.35);
      place(-0.72, -0.7, 0.25, -0.5, -0.2);
      break;
    }
  }

  return finish(cells, body, girth, reach);
}

/** Resolve the built cells into placements, septa, and a sphere to frame. */
function finish(cells: Cell[], body: CellBody, girth: number, reach: number): CellGroup {
  const placements = cells.map((c) => ({
    offset: c.pos,
    rotation: new THREE.Quaternion().setFromUnitVectors(body.ex, c.dir),
  }));

  const septa: Septum[] = [];
  for (const c of cells) {
    if (c.parent < 0 || !c.joined) continue;
    const p = cells[c.parent];
    const normal = c.pos.clone().sub(p.pos);
    if (normal.lengthSq() < 1e-9) continue;
    septa.push({
      // Midway between the two centres for cells joined face to face; for a
      // hinged pair that midpoint still lands in the wedge between them, which
      // is where the septum they swung apart around actually is.
      position: p.pos.clone().add(c.pos).multiplyScalar(0.5),
      normal: normal.normalize(),
      generation: c.generation,
    });
  }

  // Frame the group by its bounding box rather than by the average position: a
  // chain's cells are all on one line, and averaging would centre it correctly
  // only by luck.
  const box = new THREE.Box3();
  for (const c of cells) box.expandByPoint(c.pos);
  const centre = box.getCenter(new THREE.Vector3());
  let radius = 0;
  for (const c of cells) radius = Math.max(radius, c.pos.distanceTo(centre));

  return { placements, septa, centre, radius: radius + Math.max(reach, girth) };
}

/**
 * World transform for one companion cell.
 *
 * The cell's geometry is baked in world coordinates around its own centre, so a
 * placement has to rotate about that centre rather than about the scene origin —
 * otherwise a rotated companion swings out on a lever as long as the cell is
 * from the origin. Composing T(offset)·T(c)·R·T(−c) collapses to a single group
 * with this position and rotation.
 */
export function placementTransform(
  placement: CellPlacement,
  body: CellBody,
): { position: THREE.Vector3; quaternion: THREE.Quaternion } {
  const c = bodyCenter(body);
  return {
    position: c.clone().sub(c.clone().applyQuaternion(placement.rotation)).add(placement.offset),
    quaternion: placement.rotation,
  };
}
