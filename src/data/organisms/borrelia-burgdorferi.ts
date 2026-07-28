import type { Organism } from '@/types/content';

/** Borrelia burgdorferi (spirochaete morphology). */
export const borreliaBurgdorferi: Organism = {
  id: 'borrelia-burgdorferi',
  name: 'Borrelia burgdorferi',
  shortName: 'B. burgdorferi',
  gramCategory: 'non-staining',
  morphology: 'Long, thin, loosely-coiled spirochaete (not seen on Gram stain)',
  arrangement: 'single',
  body: { kind: 'spirochete', sizeUm: 25, radius: 0.28, length: 7, turns: 5, amplitude: 1.05 },
  clinicalNote:
    'Cause of Lyme disease (transmitted by Ixodes ticks) — erythema migrans, then carditis, neuroborreliosis, and arthritis. Too thin to see on Gram stain; diagnosis is clinical and serologic.',
  depth: 'deep',

  tests: { catalase: 'negative', oxidase: 'negative', urease: 'negative', motility: 'positive' },
  haemolysis: 'not-applicable',

  structures: [
    {
      id: 'bb-outer-membrane',
      name: 'Outer membrane (Osp lipoproteins)',
      shortLabel: 'Outer membrane',
      group: 'envelope',
      kind: 'outer-membrane',
      color: '#8e9bff',
      summary: 'Bears surface lipoproteins (OspA/OspC) that switch with the life cycle.',
      description:
        'Unusually, the spirochaete outer membrane carries abundant surface lipoproteins (Osp) rather than classical LPS. OspA predominates in the tick; OspC is upregulated on transmission to the host — the basis of antigenic switching and immune evasion.',
      clinicalRelevance: 'OspA was the antigen of an earlier Lyme vaccine; Osp switching complicates immunity.',
      geometry: { radius: 0.34, thickness: 0.06 },
      clickable: true,
    },
    {
      id: 'bb-peptidoglycan',
      name: 'Peptidoglycan',
      shortLabel: 'Peptidoglycan',
      group: 'envelope',
      kind: 'peptidoglycan',
      color: '#f0b64d',
      summary: 'Thin wall; shed peptidoglycan contributes to Lyme arthritis.',
      description:
        'A thin peptidoglycan layer lies between the membranes. Shed peptidoglycan has been implicated in the persistent inflammatory arthritis of late Lyme disease.',
      geometry: { radius: 0.26, thickness: 0.05 },
      drugTargetIds: ['bb-betalactam'],
      clickable: true,
    },
    {
      id: 'bb-membrane',
      name: 'Inner membrane',
      shortLabel: 'Inner membrane',
      group: 'envelope',
      kind: 'cell-membrane',
      color: '#5cd6a8',
      summary: 'Encloses the protoplasmic cylinder; limited metabolism.',
      description:
        'The inner membrane bounds the protoplasmic cylinder. Borrelia has limited biosynthetic capacity and scavenges nutrients from its host and vector.',
      geometry: { radius: 0.2, thickness: 0.05 },
      clickable: true,
    },
    {
      id: 'bb-flagella',
      name: 'Periplasmic flagella (endoflagella)',
      shortLabel: 'Endoflagella',
      group: 'appendage',
      kind: 'flagellum',
      color: '#a0e7a0',
      summary: 'Flagella run *inside* the periplasm, driving corkscrew motility.',
      description:
        'Spirochaetes are unique in housing their flagella within the periplasmic space, wrapped around the protoplasmic cylinder. Their rotation flexes the whole cell into the characteristic corkscrew swimming that lets Borrelia bore through connective tissue.',
      geometry: { count: 2, radius: 0.3 },
      clickable: true,
    },
    {
      id: 'bb-nucleoid',
      name: 'Linear chromosome + plasmids',
      shortLabel: 'Genome',
      group: 'internal',
      kind: 'nucleoid',
      color: '#c58bff',
      summary: 'A rare linear chromosome plus many linear/circular plasmids.',
      description:
        'Borrelia has an unusual linear chromosome and an exceptionally large complement of plasmids that encode the Osp surface proteins and the machinery of antigenic variation (vlsE).',
      geometry: { radius: 0.14 },
      clickable: true,
    },
    {
      id: 'bb-ribosomes',
      name: 'Ribosomes (70S)',
      shortLabel: 'Ribosomes',
      group: 'internal',
      kind: 'ribosomes',
      color: '#ffd166',
      summary: '30S + 50S protein factories — where doxycycline, the first-line drug, acts.',
      description:
        'Doxycycline binds the 30S subunit and blocks the A site where charged tRNA docks, halting elongation. It is bacteriostatic, which is part of why Lyme disease is treated for weeks rather than days.',
      clinicalRelevance:
        'First-line oral therapy for early Lyme disease acts here — and doxycycline covers the tick-borne co-infections, such as anaplasmosis, at the same time.',
      geometry: { count: 40, radius: 0.17 },
      clickable: true,
    },
  ],

  antibiotics: [
    {
      id: 'bb-tetracycline',
      drugClass: 'Tetracyclines',
      examples: ['Doxycycline'],
      targetStructureId: 'bb-ribosomes',
      siteLabel: '30S subunit',
      mechanism: 'Blocks the 30S ribosome; first-line oral therapy for early Lyme disease and the agent used for tick-bite prophylaxis.',
      effect: 'bacteriostatic',
      color: '#ffa94d',
    },
    {
      id: 'bb-betalactam',
      drugClass: 'β-lactams',
      examples: ['Amoxicillin', 'Ceftriaxone'],
      targetStructureId: 'bb-peptidoglycan',
      siteLabel: 'PBP transpeptidase',
      mechanism: 'Inhibit wall synthesis; ceftriaxone is used for neuroborreliosis and Lyme carditis, amoxicillin in children/pregnancy.',
      effect: 'bactericidal',
      color: '#4dabf7',
    },
  ],

  resistance: [
    {
      id: 'bb-intrinsic',
      name: 'Antigenic variation (immune evasion, not drug resistance)',
      gene: 'vlsE',
      type: 'intrinsic',
      defeatsDrugIds: [],
      locusStructureId: 'bb-outer-membrane',
      description:
        'Borrelia has essentially no acquired antibiotic resistance; it remains reliably susceptible to doxycycline and β-lactams. Its survival trick is immune evasion — continuous VlsE surface-antigen variation — not drug resistance.',
      clinicalImpact:
        'Treatment failure is rare and usually reflects delayed diagnosis rather than resistance; "chronic" symptoms are generally post-infectious.',
    },
  ],

  genomics: [
    {
      id: 'bb-gen-vls',
      gene: 'vlsE',
      variation: 'Continuous recombination at the vls locus',
      effect: 'Generates a shifting surface antigen that evades antibody responses and enables persistence.',
      treatmentChange:
        'Does not change antibiotic choice, but underlies why immunity is incomplete and reinfection is possible.',
    },
    {
      id: 'bb-gen-ospc',
      gene: 'ospC',
      variation: 'OspC type correlates with invasiveness',
      effect: 'Certain OspC genotypes are more likely to disseminate beyond the skin.',
      treatmentChange: 'Prognostic rather than therapeutic — disseminated disease favours IV ceftriaxone.',
    },
  ],

  agar: [
    {
      medium: 'Barbour-Stoenner-Kelly (BSK) medium',
      appearance: 'Diffuse growth in a complex broth — no discrete colonies; very slow',
      colonyColor: '#7fd3ff',
      mediumColor: '#3a2f5a',
      note: 'A rich, undefined medium used mainly in research. Culture is slow and insensitive, so it is rarely used clinically.',
    },
    {
      medium: 'Darkfield / silver stain',
      appearance: 'Motile corkscrew spirochaetes on darkfield; black spirals on Warthin-Starry silver stain',
      colonyColor: '#e8eefb',
      mediumColor: '#0a0f1a',
      note: 'Because it will not Gram stain, Borrelia is visualised by darkfield microscopy or silver impregnation.',
    },
    {
      medium: 'Diagnosis in practice',
      appearance: 'Two-tier serology (ELISA then immunoblot); PCR of synovial fluid',
      colonyColor: '#3ddc97',
      mediumColor: '#12324a',
      note: 'Lyme disease is diagnosed clinically (erythema migrans) and serologically — not by routine culture.',
    },
  ],

  gramStain: {
    category: 'non-staining',
    resultColor: '#8a8f98',
    microscopyAppearance: 'Not visualised on Gram stain — too thin',
    explanation:
      'Although structurally Gram-negative (two membranes, thin peptidoglycan), spirochaetes are too slender to retain enough dye to be seen by light microscopy after Gram staining. They are detected instead by darkfield microscopy, silver stains, or serology.',
  },
};
