/**
 * Content schema for the MicroLearning platform.
 *
 * Everything the 3D engine and UI render is driven by these types. Adding a new
 * organism, antibiotic, or resistance mechanism is a matter of authoring a data
 * object that conforms to this schema — no changes to rendering code required.
 */

export type GramCategory =
  | 'gram-positive'
  | 'gram-negative'
  | 'acid-fast'
  | 'non-staining';

/** High-level grouping used for the legend and to filter what can be clicked. */
export type StructureGroup = 'envelope' | 'surface' | 'internal' | 'appendage';

/**
 * The procedural renderer maps `kind` to a geometry generator. Each envelope
 * layer is drawn as a wedge-cut spherical shell so inner layers stay visible in
 * a cutaway view; appendages and internal contents use their own generators.
 */
export type StructureKind =
  | 'capsule'
  | 'outer-membrane'
  | 'lps'
  | 'peptidoglycan'
  | 'teichoic-acid'
  | 'mycolic-acid'
  | 'cell-membrane'
  | 'cytoplasm'
  | 'nucleoid'
  | 'ribosomes'
  | 'plasmid'
  | 'flagellum'
  | 'pili'
  | 'fimbriae';

/** Geometry hints consumed by the procedural cell builder. All optional; sane
 * defaults are applied per `kind`. */
export interface GeometrySpec {
  /** Radius of the shell (in scene units) for envelope layers. */
  radius?: number;
  /** Visual band thickness for envelope layers. */
  thickness?: number;
  /** Count for repeated elements (ribosomes, pili, teichoic spikes). */
  count?: number;
  /** Opacity override (capsule/LPS are translucent). */
  opacity?: number;
  /** Emissive glow strength for teaching emphasis. */
  glow?: number;
}

export interface StructureNode {
  id: string;
  name: string;
  /** Short label shown on hover / in the legend. */
  shortLabel: string;
  group: StructureGroup;
  kind: StructureKind;
  color: string;
  /** One-line summary shown on hover. */
  summary: string;
  /** Full explanation shown in the info panel when clicked. */
  description: string;
  /** Clinically relevant "why it matters" note. */
  clinicalRelevance?: string;
  geometry?: GeometrySpec;
  /** IDs of antibiotic targets that act on this structure (for cross-linking). */
  drugTargetIds?: string[];
  clickable?: boolean;
}

export interface AntibioticTarget {
  id: string;
  drugClass: string;
  examples: string[];
  /** Structure id this drug class binds/acts on. */
  targetStructureId: string;
  /** Where on/in the cell the action occurs (label for the overlay marker). */
  siteLabel: string;
  mechanism: string;
  /** 'bactericidal' | 'bacteriostatic' | context-dependent. */
  effect: 'bactericidal' | 'bacteriostatic' | 'variable';
  color: string;
}

export type ResistanceType =
  | 'enzymatic-inactivation'
  | 'target-modification'
  | 'target-bypass'
  | 'efflux'
  | 'porin-loss'
  | 'reduced-permeability';

export interface ResistanceMechanism {
  id: string;
  name: string;
  /** Gene(s) responsible, e.g. "mecA", "blaZ". */
  gene?: string;
  type: ResistanceType;
  /** Drug class ids this mechanism defeats (references AntibioticTarget.id). */
  defeatsDrugIds: string[];
  /** Structure id where the mechanism is visualized. */
  locusStructureId?: string;
  description: string;
  clinicalImpact: string;
}

export interface GenomicVariation {
  id: string;
  gene: string;
  /** e.g. "SCCmec cassette acquisition", "point mutation in rpoB". */
  variation: string;
  effect: string;
  /** How this changes treatment / drug selection. */
  treatmentChange: string;
}

export interface AgarAppearance {
  medium: string;
  /** Descriptive appearance of colonies on this medium. */
  appearance: string;
  /** Approx colony color for the rendered plate. */
  colonyColor: string;
  /** Approx medium/base color for the rendered plate. */
  mediumColor: string;
  /** Whether colonies show a halo/zone (e.g. hemolysis). */
  halo?: { color: string; label: string };
  note: string;
}

export interface GramStainProfile {
  category: GramCategory;
  /** Final microscopy color: purple / pink-red / red (AFB) / not-visualized. */
  resultColor: string;
  microscopyAppearance: string;
  explanation: string;
}

/** Overall cell shape. Drives the parametric centreline the 3D body is built on. */
export type MorphologyKind =
  | 'coccus'
  | 'bacillus'
  | 'coccobacillus'
  | 'vibrio'
  | 'spirillum'
  | 'spirochete';

/**
 * Parametric description of a cell's overall shape. Each envelope layer is swept
 * as a tube (with rounded caps) of its own radius around this shared centreline;
 * for cocci the centreline degenerates to a point and layers are spheres.
 */
export interface BodyShape {
  kind: MorphologyKind;
  /** Outer body radius — tube radius for elongated cells, sphere radius for cocci. */
  radius: number;
  /** End-to-end centreline length for elongated shapes (ignored for cocci). */
  length?: number;
  /** Arc sweep (in units of PI) for vibrio comma curvature. */
  curvature?: number;
  /** Number of helical turns for spirilla/spirochaetes. */
  turns?: number;
  /** Helix coil radius for spirals. */
  amplitude?: number;
}

export interface Organism {
  id: string;
  name: string;
  shortName: string;
  gramCategory: GramCategory;
  /** e.g. "Gram-positive cocci in clusters". */
  morphology: string;
  /** Parametric 3D cell shape. */
  body: BodyShape;
  /** Short clinical framing. */
  clinicalNote: string;
  /** Depth flag: 'deep' fully authored; 'overview' lighter template entry. */
  depth: 'deep' | 'overview';
  structures: StructureNode[];
  antibiotics: AntibioticTarget[];
  resistance: ResistanceMechanism[];
  genomics: GenomicVariation[];
  agar: AgarAppearance[];
  gramStain: GramStainProfile;
}

/** The interactive stain-walkthrough steps (shared across the app). */
export interface GramStainStep {
  id: string;
  reagent: string;
  action: string;
  detail: string;
  /** Color applied to a generic cell at this step, per category. */
  colorByCategory: Record<GramCategory, string>;
}
