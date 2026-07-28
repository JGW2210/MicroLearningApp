import type { Organism } from '@/types/content';

/**
 * OVERVIEW entry — Micrococcus luteus.
 *
 * Here for two reasons. It is the app's only tetrad-former: two successive
 * divisions in perpendicular planes give the flat square of four. And it is the
 * only organism here that is usually not a pathogen — a skin commensal and a
 * common contaminant, which is exactly what makes it the organism you have to
 * be able to tell apart from Staphylococcus on a plate.
 */
export const micrococcusLuteus: Organism = {
  id: 'micrococcus-luteus',
  name: 'Micrococcus luteus',
  shortName: 'M. luteus',
  gramCategory: 'gram-positive',
  morphology: 'Gram-positive cocci in tetrads (~1.0–1.8 µm)',
  arrangement: 'tetrads',
  body: { kind: 'coccus', sizeUm: 1.4, radius: 2.7 },
  clinicalNote:
    'A normal skin and mucosal commensal, and one of the commonest blood-culture contaminants. Genuinely pathogenic only in profound immunosuppression or on prosthetic material.',
  depth: 'overview',

  structures: [
    {
      id: 'mlu-peptidoglycan',
      name: 'Peptidoglycan wall',
      shortLabel: 'Peptidoglycan',
      group: 'envelope',
      kind: 'peptidoglycan',
      color: '#f0b64d',
      summary: 'Thick Gram-positive wall with an unusual peptide cross-bridge.',
      description:
        'A thick multilayered wall retains crystal violet. Micrococcus uses a lysine-alanine cross-bridge rather than the pentaglycine of Staphylococcus — one of the chemical differences behind their different lysostaphin susceptibility.',
      geometry: { radius: 3.0, thickness: 0.44, glow: 0.15 },
      drugTargetIds: ['mlu-penicillin'],
      clickable: true,
    },
    {
      id: 'mlu-teichoic',
      name: 'Teichoic acid',
      shortLabel: 'Teichoic acid',
      group: 'surface',
      kind: 'teichoic-acid',
      color: '#ffd28a',
      summary: 'Wall-threading polymers giving the surface its negative charge.',
      description:
        'Teichoic acids thread through the peptidoglycan and reach the surface, contributing surface charge and helping the organism adhere to skin.',
      geometry: { count: 55, radius: 3.1 },
      clickable: true,
    },
    {
      id: 'mlu-membrane',
      name: 'Cell membrane',
      shortLabel: 'Membrane',
      group: 'envelope',
      kind: 'cell-membrane',
      color: '#5cd6a8',
      summary: 'Bilayer carrying an unusually complete aerobic respiratory chain.',
      description:
        'Micrococcus is a strict aerobe with a well-developed respiratory chain, including the catalase that separates it and the staphylococci from the streptococci.',
      geometry: { radius: 2.4, thickness: 0.2 },
      clickable: true,
    },
    {
      id: 'mlu-carotenoid',
      name: 'Carotenoid pigment granules',
      shortLabel: 'Carotenoids',
      group: 'internal',
      kind: 'inclusion',
      color: '#ffd93d',
      summary: 'Sarcinaxanthin — the yellow that gives luteus its name.',
      description:
        'Membrane-associated carotenoids colour the colonies bright yellow. They quench singlet oxygen and absorb ultraviolet light, protecting a organism that lives on sun-exposed skin.',
      clinicalRelevance:
        'The vivid yellow colony is the first clue that a Gram-positive coccus from a blood culture is a contaminant rather than a staphylococcus.',
      geometry: { count: 7, radius: 0.3 },
      clickable: true,
    },
    {
      id: 'mlu-nucleoid',
      name: 'Nucleoid',
      shortLabel: 'Nucleoid',
      group: 'internal',
      kind: 'nucleoid',
      color: '#c58bff',
      summary: 'One of the smallest free-living bacterial genomes.',
      description:
        'A compact genome of around 2.5 Mb, reflecting a narrow, stable niche on skin rather than the metabolic flexibility of a gut organism.',
      geometry: { radius: 1.2 },
      clickable: true,
    },
    {
      id: 'mlu-ribosomes',
      name: 'Ribosomes',
      shortLabel: 'Ribosomes',
      group: 'internal',
      kind: 'ribosomes',
      color: '#ffd166',
      summary: 'Standard 70S protein synthesis machinery.',
      description: 'The 70S ribosome, susceptible to the usual protein-synthesis inhibitors.',
      geometry: { count: 60, radius: 1.55 },
      clickable: true,
    },
  ],

  antibiotics: [
    {
      id: 'mlu-penicillin',
      drugClass: 'Beta-lactams',
      examples: ['Benzylpenicillin', 'Amoxicillin'],
      targetStructureId: 'mlu-peptidoglycan',
      siteLabel: 'Penicillin-binding proteins',
      mechanism: 'Blocks transpeptidase cross-linking of the wall.',
      effect: 'bactericidal',
      color: '#4dabf7',
    },
    {
      id: 'mlu-vancomycin',
      drugClass: 'Glycopeptides',
      examples: ['Vancomycin'],
      targetStructureId: 'mlu-peptidoglycan',
      siteLabel: 'D-Ala-D-Ala terminus',
      mechanism:
        'Binds the peptidoglycan precursor terminus, physically preventing cross-linking. Used when a Micrococcus is genuinely causing prosthetic-device infection.',
      effect: 'bactericidal',
      color: '#63e6be',
    },
  ],

  resistance: [
    {
      id: 'mlu-susceptible',
      name: 'Largely retained susceptibility',
      type: 'target-modification',
      defeatsDrugIds: [],
      locusStructureId: 'mlu-peptidoglycan',
      description:
        'Micrococcus has stayed broadly susceptible to beta-lactams and glycopeptides. It sits outside the hospital selection pressure that drove mecA into the staphylococci, and carries far less mobile genetic material.',
      clinicalImpact:
        'A useful counterexample: resistance is not inevitable with time, it follows exposure. Beside MRSA, this is the control.',
    },
  ],

  genomics: [
    {
      id: 'mlu-gen-genome',
      gene: 'Whole genome',
      variation: 'Reduced ~2.5 Mb genome with few mobile elements',
      effect:
        'Little capacity to acquire resistance cassettes compared with the staphylococci that share its habitat.',
      treatmentChange:
        'Empirical cover for a true Micrococcus infection remains straightforward.',
    },
  ],

  agar: [
    {
      medium: 'Nutrient / blood agar',
      appearance: 'Bright yellow, opaque, domed colonies; non-haemolytic',
      colonyColor: '#f2d541',
      mediumColor: '#7c1e2b',
      note: 'The vivid yellow carotenoid pigment is the giveaway. Non-haemolytic, unlike S. aureus, which is beta-haemolytic and golden rather than yellow.',
    },
    {
      medium: 'Mannitol salt agar',
      appearance: 'Poor or no growth; no mannitol fermentation',
      colonyColor: '#e8dfa8',
      mediumColor: '#c94f7c',
      note: 'Tolerates salt less well than Staphylococcus and does not ferment mannitol, so the plate stays pink — a quick separation from S. aureus.',
    },
  ],

  gramStain: {
    category: 'gram-positive',
    resultColor: '#5b2a86',
    microscopyAppearance: 'Large purple cocci in tetrads',
    explanation:
      'The thick wall holds the crystal violet, so the cells are purple. They divide in two successive perpendicular planes and the four daughters stay together, giving the flat square of four that distinguishes a tetrad from the irregular three-dimensional bunch of a staphylococcal cluster.',
  },
};
