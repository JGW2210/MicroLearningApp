import type { CellArrangement, MorphologyKind } from '@/types/content';

/**
 * What a slide looks like down the objective: cells of the right shape, grouped
 * the way that species actually groups, framed as a microscope field.
 *
 * Shape and arrangement are drawn from separate vocabularies because they vary
 * independently — a chain can be cocci or rods, a pair can be either — and the
 * view this replaced could only tell "cocci" from "not cocci" by running a
 * regular expression over a prose sentence.
 */

interface Placement {
  x: number;
  y: number;
  /** Degrees. */
  angle: number;
}

/** A 100 x 100 field. Cells are sized to leave the arrangement legible in it. */
const FIELD = 100;

/* ------------------------------------------------------------------ shapes */

/** Long axis of one cell, used to space cells that touch in an arrangement. */
function cellLength(kind: MorphologyKind): number {
  switch (kind) {
    case 'coccus':
      return 9;
    case 'coccobacillus':
      return 11;
    case 'bacillus':
      return 19;
    case 'vibrio':
      return 20;
    case 'spirillum':
      return 26;
    case 'spirochete':
      return 40;
    case 'club-rod':
      return 18;
    case 'filament':
      return 26;
  }
}

/**
 * The corynebacterial club: a rod that swells at one end, drawn with the
 * metachromatic (volutin) granules that stain darker than the rest of the cell
 * and are half the reason the shape is recognised at all.
 */
function clubPath(length: number): string {
  const h = length / 2;
  return [
    `M${-h},-2.1`,
    `L${h - 3},-4.2`,
    `A4.2,4.2 0 0 1 ${h - 3},4.2`,
    `L${-h},2.1`,
    `A2.1,2.1 0 0 1 ${-h},-2.1`,
    'Z',
  ].join(' ');
}

/** A wavy or curved body, sampled into a path and drawn as a thick stroke. */
function wavePath(length: number, amplitude: number, turns: number): string {
  const steps = 40;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = -length / 2 + length * t;
    const y = Math.sin(t * turns * Math.PI * 2) * amplitude;
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return pts.join(' ');
}

/** An arc, for the comma-shaped vibrio. */
function arcPath(length: number, bow: number): string {
  return `M${-length / 2},${bow} Q0,${-bow * 2.2} ${length / 2},${bow}`;
}

/**
 * One cell, centred on the origin. Round and rod shapes are filled outlines;
 * curved and helical ones are stroked paths, since a spirochaete is essentially
 * a line under the microscope and filling it reads as a worm.
 */
function Cell({ kind, fill, stroke }: { kind: MorphologyKind; fill: string; stroke: string }) {
  const common = { fill, stroke, strokeWidth: 0.8, style: { transition: 'fill 0.4s ease' } };
  switch (kind) {
    case 'coccus':
      return <circle cx={0} cy={0} r={4.5} {...common} />;
    case 'coccobacillus':
      return <rect x={-5.5} y={-3.4} width={11} height={6.8} rx={3.4} {...common} />;
    case 'bacillus':
      return <rect x={-9.5} y={-2.9} width={19} height={5.8} rx={2.9} {...common} />;
    case 'vibrio':
      return <path d={arcPath(20, 3)} fill="none" stroke={fill} strokeWidth={5.6} strokeLinecap="round" style={common.style} />;
    case 'spirillum':
      return <path d={wavePath(26, 4.5, 1.6)} fill="none" stroke={fill} strokeWidth={5} strokeLinecap="round" style={common.style} />;
    case 'spirochete':
      return <path d={wavePath(40, 5, 3.2)} fill="none" stroke={fill} strokeWidth={2.6} strokeLinecap="round" style={common.style} />;
    case 'club-rod':
      return (
        <>
          <path d={clubPath(18)} {...common} />
          <circle cx={5.4} cy={0} r={1.7} fill="#2b1836" opacity={0.6} />
          <circle cx={-6.2} cy={0} r={1.3} fill="#2b1836" opacity={0.6} />
        </>
      );
    case 'filament':
      return <path d={`M${-13},0 L13,0`} fill="none" stroke={fill} strokeWidth={3.4} strokeLinecap="round" style={common.style} />;
  }
}

/* ------------------------------------------------------------- arrangements */

/**
 * Where the cells sit. Each layout is built around why that arrangement forms:
 * chains and pairs run along the single plane the cell divided in, tetrads are
 * two successive perpendicular planes, clusters are division in every plane at
 * once, and palisades are rods that snapped sideways after dividing.
 */
function layout(kind: MorphologyKind, arrangement: CellArrangement): Placement[] {
  const c = FIELD / 2;
  const L = cellLength(kind);
  // Cells that touch sit one body apart, with a hair of overlap so they read as
  // joined rather than merely near.
  const step = L * 0.92;

  switch (arrangement) {
    case 'pairs': {
      // Divided once and stayed together: two cells, long axes aligned.
      const pairs: Placement[] = [];
      const spots = [
        [c - 22, c - 16, -12],
        [c + 16, c + 4, 28],
        [c - 8, c + 22, 8],
      ];
      for (const [px, py, a] of spots) {
        const rad = (a * Math.PI) / 180;
        const dx = (Math.cos(rad) * step) / 2;
        const dy = (Math.sin(rad) * step) / 2;
        pairs.push({ x: px - dx, y: py - dy, angle: a });
        pairs.push({ x: px + dx, y: py + dy, angle: a });
      }
      return pairs;
    }

    case 'tetrads': {
      // Two perpendicular division planes: a square of four.
      const out: Placement[] = [];
      for (const [gx, gy] of [
        [c - 18, c - 12],
        [c + 18, c + 14],
      ]) {
        const h = step / 2;
        out.push(
          { x: gx - h, y: gy - h, angle: 0 },
          { x: gx + h, y: gy - h, angle: 0 },
          { x: gx - h, y: gy + h, angle: 0 },
          { x: gx + h, y: gy + h, angle: 0 },
        );
      }
      return out;
    }

    case 'chains': {
      // One division plane, daughters never separate: a chain that drifts.
      const out: Placement[] = [];
      const runs = [
        { n: 7, x0: c - 34, y0: c - 20, a: 22 },
        { n: 5, x0: c - 10, y0: c + 26, a: -14 },
      ];
      for (const r of runs) {
        let x = r.x0;
        let y = r.y0;
        for (let i = 0; i < r.n; i++) {
          // Let the chain wander, the way a real one curves across the field.
          const a = r.a + Math.sin(i * 0.9) * 16;
          const rad = (a * Math.PI) / 180;
          out.push({ x, y, angle: a });
          x += Math.cos(rad) * step;
          y += Math.sin(rad) * step;
        }
      }
      return out;
    }

    case 'clusters': {
      // Division in every plane: an irregular grape-like bunch.
      return [
        [-10, -10], [3, -14], [15, -8], [-14, 2], [0, -1],
        [12, 4], [-6, 12], [7, 14], [18, 6], [-17, -6],
      ].map(([dx, dy]) => ({ x: c + dx * (L / 9), y: c + dy * (L / 9), angle: 0 }));
    }

    case 'palisades': {
      // Snapping division: rods line up like a fence, with V and L forms where
      // a pair hinged apart but did not separate.
      const out: Placement[] = [];
      for (let i = 0; i < 5; i++) {
        out.push({ x: c - 30 + i * (L * 0.34), y: c - 12 + (i % 2) * 3, angle: 78 + (i % 2) * 6 });
      }
      // A V and an L, the "Chinese letter" forms.
      out.push({ x: c + 14, y: c + 16, angle: 34 });
      out.push({ x: c + 14 + L * 0.42, y: c + 16 + L * 0.3, angle: -38 });
      out.push({ x: c - 16, y: c + 26, angle: 4 });
      out.push({ x: c - 16 + L * 0.46, y: c + 26 + L * 0.24, angle: 82 });
      return out;
    }

    case 'filaments': {
      // Branching threads: a main filament with side branches off it.
      // Segments butt end to end so the thread reads as continuous rather than
      // as separate cells, which caps how much of it fits: two short trunks,
      // angled apart so they do not cross, each throwing off one branch.
      const out: Placement[] = [];
      const link = L * 0.98;
      const trunks = [
        { x0: c - 26, y0: c - 20, a: 18, n: 3, branch: 1, bAngle: 54 },
        { x0: c - 20, y0: c + 24, a: -6, n: 2, branch: 0, bAngle: -46 },
      ];
      for (const t of trunks) {
        let x = t.x0;
        let y = t.y0;
        const rad = (t.a * Math.PI) / 180;
        for (let i = 0; i < t.n; i++) {
          out.push({ x, y, angle: t.a });
          if (i === t.branch) {
            const br = ((t.a + t.bAngle) * Math.PI) / 180;
            out.push({
              x: x + Math.cos(rad) * link * 0.5 + (Math.cos(br) * link) / 2,
              y: y + Math.sin(rad) * link * 0.5 + (Math.sin(br) * link) / 2,
              angle: t.a + t.bAngle,
            });
          }
          x += Math.cos(rad) * link;
          y += Math.sin(rad) * link;
        }
      }
      return out;
    }

    case 'single':
    default:
      // Separating cleanly after division: scattered individuals.
      return [
        { x: c - 26, y: c - 20, angle: 24 },
        { x: c + 14, y: c - 26, angle: -18 },
        { x: c + 26, y: c + 6, angle: 52 },
        { x: c - 16, y: c + 12, angle: 8 },
        { x: c + 2, y: c + 28, angle: -34 },
      ];
  }
}

/* -------------------------------------------------------------------- view */

interface Props {
  kind: MorphologyKind;
  arrangement: CellArrangement;
  /** Current stain colour for the cells. */
  color: string;
  /** Dimmed right down when the organism does not take the stain at all. */
  visible?: boolean;
  /** Hatch the cells as well as colouring them (colour-blind-safe mode). */
  hatched?: boolean;
  /** Real length of one cell, in micrometres — what makes the scale bar honest. */
  cellUm?: number;
  size?: number;
}

/** Bar lengths that read as measurements rather than as arbitrary numbers. */
const NICE_BARS = [0.5, 1, 2, 5, 10, 20, 50];

export function MicroscopyField({
  kind,
  arrangement,
  color,
  visible = true,
  hatched = false,
  cellUm = 2,
  size = 230,
}: Props) {
  const cells = layout(kind, arrangement);
  const opacity = visible ? 1 : 0.12;
  // Cells are drawn at a legible fixed size whatever the species, so the field's
  // real width follows from how big this organism's cell actually is. That keeps
  // the bar truthful across a 1 µm coccus and a 25 µm spirochaete.
  const fieldUm = (FIELD / cellLength(kind)) * cellUm;
  const target = fieldUm / 4;
  const barUm = NICE_BARS.reduce((a, b) => (Math.abs(b - target) < Math.abs(a - target) ? b : a));
  const barW = (barUm / fieldUm) * FIELD;

  return (
    <svg viewBox={`0 0 ${FIELD} ${FIELD}`} width={size} height={size} role="img"
      aria-label={`Microscopy view: ${arrangement} ${kind}`}>
      <defs>
        <clipPath id="mf-field">
          <circle cx={FIELD / 2} cy={FIELD / 2} r={FIELD / 2 - 1} />
        </clipPath>
        <radialGradient id="mf-vignette">
          <stop offset="70%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
        </radialGradient>
        {/* Second channel for the stain result, so it does not rest on hue alone. */}
        <pattern id="mf-hatch" width="3" height="3" patternTransform="rotate(45)"
          patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="3" stroke="#0a0f1a" strokeWidth="1.1" opacity="0.55" />
        </pattern>
      </defs>

      {/* The bright field behind the smear. */}
      <circle cx={FIELD / 2} cy={FIELD / 2} r={FIELD / 2 - 1} fill="#f4f1ea" />

      <g clipPath="url(#mf-field)" style={{ opacity }}>
        {cells.map((p, i) => (
          <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${p.angle})`}>
            <Cell kind={kind} fill={color} stroke="#0a0f1a" />
            {hatched && <Cell kind={kind} fill="url(#mf-hatch)" stroke="none" />}
          </g>
        ))}
      </g>

      <circle cx={FIELD / 2} cy={FIELD / 2} r={FIELD / 2 - 1} fill="url(#mf-vignette)" />
      <circle cx={FIELD / 2} cy={FIELD / 2} r={FIELD / 2 - 1} fill="none" stroke="#1b2740" strokeWidth="2" />

      {/* Scale bar and objective, so the view maps onto a real eyepiece. */}
      <g transform={`translate(${FIELD / 2 - barW / 2} ${FIELD - 12})`}>
        <rect x={0} y={0} width={barW} height={1.6} fill="#0a0f1a" rx={0.8} />
        <text x={barW / 2} y={-2} textAnchor="middle" fontSize="5" fill="#0a0f1a">
          {barUm} µm
        </text>
      </g>
      <text x={FIELD / 2} y={11} textAnchor="middle" fontSize="5" fill="#5c6478" opacity="0.75">
        ×1000 oil
      </text>
    </svg>
  );
}
