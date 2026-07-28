import type { Organism } from '@/types/content';

/** OVERVIEW entry — Vibrio cholerae (comma-shaped / vibrio morphology). */
export const vibrioCholerae: Organism = {
  id: 'vibrio-cholerae',
  name: 'Vibrio cholerae',
  shortName: 'V. cholerae',
  gramCategory: 'gram-negative',
  morphology: 'Gram-negative curved (comma-shaped) rods with a single polar flagellum',
  arrangement: 'single',
  body: { kind: 'vibrio', sizeUm: 2, radius: 0.7, length: 3.8, curvature: 0.6 },
  clinicalNote:
    'Cause of epidemic cholera — a secretory, rice-water diarrhoea driven by cholera toxin. Treatment is chiefly aggressive rehydration; antibiotics shorten shedding.',
  depth: 'overview',

  structures: [
    {
      id: 'vc-outer-membrane',
      name: 'Outer membrane',
      shortLabel: 'Outer membrane',
      group: 'envelope',
      kind: 'outer-membrane',
      color: '#8e9bff',
      summary: 'Gram-negative outer bilayer with porins and LPS.',
      description:
        'The asymmetric outer membrane carries porins and lipopolysaccharide and forms the permeability barrier characteristic of Gram-negative bacteria.',
      geometry: { radius: 0.86, thickness: 0.12 },
      clickable: true,
    },
    {
      id: 'vc-lps',
      name: 'Lipopolysaccharide (O antigen)',
      shortLabel: 'LPS / O antigen',
      group: 'surface',
      kind: 'lps',
      color: '#ffb4a2',
      summary: 'The O1/O139 O-antigen defines the epidemic serogroups.',
      description:
        'The O-antigen of LPS defines serogroup. Only the O1 and O139 serogroups carry the epidemic potential associated with cholera toxin production.',
      clinicalRelevance: 'Serogrouping (O1/O139) drives outbreak surveillance and vaccine design.',
      geometry: { count: 80, radius: 0.96, glow: 0.2 },
      clickable: true,
    },
    {
      id: 'vc-peptidoglycan',
      name: 'Peptidoglycan (thin)',
      shortLabel: 'Peptidoglycan',
      group: 'envelope',
      kind: 'peptidoglycan',
      color: '#f0b64d',
      summary: 'Thin periplasmic wall — Gram-negative decolourises to pink.',
      description:
        'A thin peptidoglycan layer sits in the periplasm between the two membranes; its thinness is why the cell loses crystal violet and stains pink.',
      geometry: { radius: 0.72, thickness: 0.1 },
      drugTargetIds: ['vc-betalactam'],
      clickable: true,
    },
    {
      id: 'vc-membrane',
      name: 'Inner membrane',
      shortLabel: 'Inner membrane',
      group: 'envelope',
      kind: 'cell-membrane',
      color: '#5cd6a8',
      summary: 'Respiration, transport, and the boundary of the cytoplasm.',
      description:
        'The inner membrane houses the respiratory chain and transport systems and, with the outer membrane, encloses the periplasm.',
      geometry: { radius: 0.6, thickness: 0.1 },
      clickable: true,
    },
    {
      id: 'vc-nucleoid',
      name: 'Two circular chromosomes',
      shortLabel: 'Nucleoid',
      group: 'internal',
      kind: 'nucleoid',
      color: '#c58bff',
      summary: 'Unusually, V. cholerae carries its genome on two chromosomes.',
      description:
        'V. cholerae has two circular chromosomes. The cholera-toxin genes (ctxAB) are carried by an integrated lysogenic bacteriophage (CTXφ) whose receptor is the toxin-coregulated pilus.',
      clinicalRelevance: 'Toxin acquisition by phage conversion is what turns a strain pathogenic.',
      geometry: { radius: 0.42 },
      clickable: true,
    },
    {
      id: 'vc-ribosomes',
      name: 'Ribosomes',
      shortLabel: 'Ribosomes',
      group: 'internal',
      kind: 'ribosomes',
      color: '#ffd166',
      summary: 'Target of tetracyclines and macrolides.',
      description:
        'The 70S ribosome is the target of the tetracyclines (30S) and macrolides (50S) used to shorten the illness and reduce shedding.',
      geometry: { count: 55, radius: 0.42 },
      drugTargetIds: ['vc-tetracycline', 'vc-macrolide'],
      clickable: true,
    },
    {
      id: 'vc-flagellum',
      name: 'Single polar (sheathed) flagellum',
      shortLabel: 'Polar flagellum',
      group: 'appendage',
      kind: 'flagellum',
      color: '#a0e7a0',
      summary: 'One sheathed polar flagellum drives the darting motility.',
      description:
        'A single sheathed polar flagellum gives V. cholerae its characteristic rapid, darting motility (seen on wet mount) — distinct from the peritrichous arrangement of enteric rods.',
      geometry: { count: 1, radius: 0.7 },
      clickable: true,
    },
  ],

  antibiotics: [
    {
      id: 'vc-tetracycline',
      drugClass: 'Tetracyclines',
      examples: ['Doxycycline'],
      targetStructureId: 'vc-ribosomes',
      siteLabel: '30S subunit',
      mechanism: 'Block aminoacyl-tRNA binding at the 30S subunit; a single dose shortens illness and shedding.',
      effect: 'bacteriostatic',
      color: '#ffa94d',
    },
    {
      id: 'vc-macrolide',
      drugClass: 'Macrolides',
      examples: ['Azithromycin'],
      targetStructureId: 'vc-ribosomes',
      siteLabel: '50S subunit',
      mechanism: 'Bind the 50S subunit; preferred in children and pregnancy and where tetracycline resistance is common.',
      effect: 'bacteriostatic',
      color: '#ff922b',
    },
    {
      id: 'vc-betalactam',
      drugClass: 'β-lactams',
      examples: ['(limited role)'],
      targetStructureId: 'vc-peptidoglycan',
      siteLabel: 'PBP transpeptidase',
      mechanism: 'Inhibit wall cross-linking, but β-lactams are not first-line for cholera — rehydration and a ribosome-active agent are.',
      effect: 'bactericidal',
      color: '#4dabf7',
    },
  ],

  resistance: [
    {
      id: 'vc-sxt',
      name: 'SXT integrative conjugative element',
      gene: 'SXT/R391 ICE',
      type: 'enzymatic-inactivation',
      defeatsDrugIds: ['vc-tetracycline'],
      locusStructureId: 'vc-nucleoid',
      description:
        'A mobile integrative conjugative element carries a cassette of resistance genes (to trimethoprim-sulfamethoxazole, streptomycin, and often others) that has spread through epidemic lineages.',
      clinicalImpact: 'Drives multidrug resistance in outbreak strains and guides empiric choice by region.',
    },
    {
      id: 'vc-efflux',
      name: 'Tetracycline efflux',
      gene: 'tet(A/G)',
      type: 'efflux',
      defeatsDrugIds: ['vc-tetracycline'],
      locusStructureId: 'vc-membrane',
      description: 'Plasmid/ICE-borne efflux pumps export tetracyclines, raising MICs.',
      clinicalImpact: 'Where prevalent, azithromycin becomes the preferred agent.',
    },
  ],

  genomics: [
    {
      id: 'vc-gen-ctx',
      gene: 'ctxAB (CTXφ)',
      variation: 'Lysogenic conversion by the CTXφ bacteriophage',
      effect: 'Confers cholera-toxin production — the basis of the secretory diarrhoea.',
      treatmentChange:
        'Explains why management is fluid replacement first; antibiotics are adjuncts that reduce toxin-driven shedding.',
    },
    {
      id: 'vc-gen-o139',
      gene: 'O-antigen locus',
      variation: 'Emergence of the O139 serogroup from O1 El Tor',
      effect: 'A new capsular/O-antigen type able to evade existing immunity.',
      treatmentChange: 'Affects vaccine coverage and outbreak surveillance rather than antibiotic choice.',
    },
  ],

  agar: [
    {
      medium: 'TCBS agar',
      appearance: 'Large yellow colonies (sucrose fermentation lowers the pH)',
      colonyColor: '#f4e04d',
      mediumColor: '#1f7a4d',
      halo: { color: '#f4e04d', label: 'Acid (yellow) zone' },
      note: 'Thiosulfate-citrate-bile-sucrose agar is the selective/differential medium; yellow = sucrose fermenter (V. cholerae).',
    },
    {
      medium: 'Alkaline peptone water',
      appearance: 'Surface pellicle after enrichment (no colonies — a broth)',
      colonyColor: '#7fd3ff',
      mediumColor: '#12324a',
      note: 'High pH (~8.5) enrichment step suppresses competing flora before plating.',
    },
    {
      medium: 'Blood agar',
      appearance: 'Grey, moist colonies; El Tor biotype is β-haemolytic',
      colonyColor: '#cfc9b8',
      mediumColor: '#7c1e2b',
      note: 'Haemolysis on blood agar helps distinguish the El Tor biotype from Classical.',
    },
  ],

  gramStain: {
    category: 'gram-negative',
    resultColor: '#d6547f',
    microscopyAppearance: 'Pink, comma-shaped (curved) rods',
    explanation:
      'Like other Gram-negatives, the thin peptidoglycan cannot retain crystal violet after decolourisation, so the curved cells take up the pink safranin counterstain.',
  },
};
