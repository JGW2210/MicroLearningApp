import type { Organism } from '@/types/content';

/**
 * OVERVIEW entry — Mycobacterium tuberculosis (acid-fast exemplar).
 *
 * Demonstrates the mycolic-acid–rich envelope that makes mycobacteria acid-fast
 * (Ziehl-Neelsen positive) and poorly Gram-stainable, plus its distinctive slow
 * growth on Löwenstein-Jensen medium.
 */
export const mycobacteriumTuberculosis: Organism = {
  id: 'mycobacterium-tuberculosis',
  name: 'Mycobacterium tuberculosis',
  shortName: 'M. tuberculosis',
  gramCategory: 'acid-fast',
  morphology: 'Acid-fast bacilli (slender rods), often in serpentine cords',
  arrangement: 'palisades',
  body: { kind: 'bacillus', sizeUm: 3, radius: 1.0, length: 4.8 },
  clinicalNote:
    'The cause of tuberculosis. A waxy, impermeable wall drives intrinsic drug resistance, slow growth, and the need for prolonged multidrug therapy.',
  depth: 'overview',

  structures: [
    {
      id: 'mtb-mycolic',
      name: 'Mycolic acid layer (mycomembrane)',
      shortLabel: 'Mycolic acids',
      group: 'envelope',
      kind: 'mycolic-acid',
      color: '#ffd08a',
      summary: 'Thick waxy long-chain fatty acids — the basis of acid-fastness.',
      description:
        'Long-chain mycolic acids esterified to arabinogalactan form an exceptionally hydrophobic, waxy outer layer (the "mycomembrane"). It resists decolourisation by acid-alcohol — the definition of acid-fastness — and blocks entry of many antibiotics and stains.',
      clinicalRelevance:
        'Synthesised by InhA/KasA — the targets of isoniazid and ethionamide. Its impermeability is why TB needs long combination therapy.',
      geometry: { radius: 1.12, thickness: 0.34, glow: 0.25 },
      drugTargetIds: ['mtb-isoniazid'],
      clickable: true,
    },
    {
      id: 'mtb-arabinogalactan',
      name: 'Arabinogalactan–peptidoglycan core',
      shortLabel: 'Arabinogalactan',
      group: 'envelope',
      kind: 'peptidoglycan',
      color: '#f0b64d',
      summary: 'Peptidoglycan cross-linked to arabinogalactan, anchoring the mycolic layer.',
      description:
        'A modified peptidoglycan is covalently linked through arabinogalactan to the mycolic acids, forming the mycolyl-arabinogalactan-peptidoglycan (mAGP) complex — the rigid core of the mycobacterial wall. Ethambutol blocks arabinogalactan synthesis (arabinosyltransferase, embB).',
      clinicalRelevance: 'Ethambutol target; embB mutations confer ethambutol resistance.',
      geometry: { radius: 0.9, thickness: 0.16 },
      drugTargetIds: ['mtb-ethambutol'],
      clickable: true,
    },
    {
      id: 'mtb-membrane',
      name: 'Plasma membrane',
      shortLabel: 'Membrane',
      group: 'envelope',
      kind: 'cell-membrane',
      color: '#5cd6a8',
      summary: 'Inner bilayer housing respiration and ATP synthesis.',
      description:
        'The plasma membrane carries the respiratory chain and ATP synthase. The newer agent bedaquiline targets mycobacterial ATP synthase here.',
      geometry: { radius: 0.78, thickness: 0.14 },
      clickable: true,
    },
    {
      id: 'mtb-nucleoid',
      name: 'Nucleoid',
      shortLabel: 'Nucleoid',
      group: 'internal',
      kind: 'nucleoid',
      color: '#c58bff',
      summary: 'Chromosome; site of rifampicin (rpoB) and fluoroquinolone action.',
      description:
        'Transcription by RNA polymerase (rifampicin/rpoB target) and DNA supercoiling (fluoroquinolone target) occur here. rpoB mutations define rifampicin resistance and are the basis of the rapid GeneXpert MTB/RIF test.',
      geometry: { radius: 0.5 },
      drugTargetIds: ['mtb-rifampicin'],
      clickable: true,
    },
    {
      id: 'mtb-lipid-bodies',
      name: 'Intracellular lipid inclusions',
      shortLabel: 'Lipid bodies',
      group: 'internal',
      kind: 'inclusion',
      color: '#ffb37a',
      summary: 'Triacylglycerol stores built up by dormant, non-replicating bacilli.',
      description:
        'M. tuberculosis accumulates triacylglycerol in discrete lipid bodies when it shifts into a non-replicating, dormant state inside granulomas. These stores are both a carbon reserve and a marker of the phenotype that makes latent infection so hard to clear.',
      clinicalRelevance:
        'Lipid-body-laden dormant bacilli tolerate drugs that need active growth to kill, which is a large part of why TB therapy runs for months rather than days.',
      geometry: { count: 5, radius: 0.11 },
      clickable: true,
    },
    {
      id: 'mtb-ribosomes',
      name: 'Ribosomes',
      shortLabel: 'Ribosomes',
      group: 'internal',
      kind: 'ribosomes',
      color: '#ffd166',
      summary: 'Target of streptomycin and amikacin (30S).',
      description:
        'The 70S ribosome is targeted by the aminoglycosides streptomycin and amikacin. rrs and rpsL mutations confer aminoglycoside resistance.',
      geometry: { count: 80, radius: 0.62 },
      clickable: true,
    },
  ],

  antibiotics: [
    {
      id: 'mtb-isoniazid',
      drugClass: 'Isoniazid',
      examples: ['Isoniazid (INH)'],
      targetStructureId: 'mtb-mycolic',
      siteLabel: 'InhA / mycolic acid synthesis',
      mechanism:
        'A prodrug activated by catalase-peroxidase (KatG); the active form inhibits InhA, blocking mycolic-acid synthesis.',
      effect: 'bactericidal',
      color: '#4dabf7',
    },
    {
      id: 'mtb-rifampicin',
      drugClass: 'Rifampicin',
      examples: ['Rifampicin (RIF)'],
      targetStructureId: 'mtb-nucleoid',
      siteLabel: 'RNA polymerase (rpoB)',
      mechanism: 'Binds the RNA polymerase β-subunit, halting transcription.',
      effect: 'bactericidal',
      color: '#e599f7',
    },
    {
      id: 'mtb-ethambutol',
      drugClass: 'Ethambutol',
      examples: ['Ethambutol (EMB)'],
      targetStructureId: 'mtb-arabinogalactan',
      siteLabel: 'Arabinosyltransferase (embB)',
      mechanism: 'Inhibits arabinogalactan synthesis, weakening wall assembly.',
      effect: 'bacteriostatic',
      color: '#63e6be',
    },
  ],

  resistance: [
    {
      id: 'mtb-katg',
      name: 'Isoniazid resistance',
      gene: 'katG / inhA promoter',
      type: 'target-modification',
      defeatsDrugIds: ['mtb-isoniazid'],
      locusStructureId: 'mtb-mycolic',
      description:
        'katG mutations impair prodrug activation; inhA-promoter mutations overproduce the target. Either abolishes isoniazid efficacy.',
      clinicalImpact: 'A core component of multidrug-resistant TB (MDR-TB) when combined with rpoB.',
    },
    {
      id: 'mtb-rpob',
      name: 'Rifampicin resistance',
      gene: 'rpoB (RRDR)',
      type: 'target-modification',
      defeatsDrugIds: ['mtb-rifampicin'],
      locusStructureId: 'mtb-nucleoid',
      description:
        'Point mutations in the rifampicin-resistance-determining region of rpoB abolish drug binding. Detected rapidly by GeneXpert MTB/RIF.',
      clinicalImpact:
        'Rifampicin resistance is a surrogate marker for MDR-TB and triggers second-line regimens.',
    },
    {
      id: 'mtb-wall',
      name: 'Intrinsic wall impermeability',
      type: 'reduced-permeability',
      defeatsDrugIds: [],
      locusStructureId: 'mtb-mycolic',
      description:
        'The waxy mycomembrane excludes many antibiotics outright, contributing to broad intrinsic resistance and the need for prolonged multidrug therapy.',
      clinicalImpact: 'Underlies 6+ month treatment courses and the limited usable drug set.',
    },
  ],

  genomics: [
    {
      id: 'mtb-gen-mdr',
      gene: 'katG + rpoB',
      variation: 'Co-occurring isoniazid and rifampicin resistance mutations',
      effect: 'Defines multidrug-resistant tuberculosis (MDR-TB).',
      treatmentChange:
        'Switch to a longer regimen with fluoroquinolones and newer agents (bedaquiline, linezolid).',
    },
    {
      id: 'mtb-gen-xdr',
      gene: 'gyrA + rrs',
      variation: 'Added fluoroquinolone and injectable resistance',
      effect: 'Extensively drug-resistant TB (XDR-TB).',
      treatmentChange: 'Rely on bedaquiline/pretomanid/linezolid (BPaL)-type regimens.',
    },
  ],

  agar: [
    {
      medium: 'Löwenstein-Jensen (egg-based)',
      appearance: 'Rough, buff, dry, "breadcrumb"/cauliflower colonies after 3–8 weeks',
      colonyColor: '#d8c187',
      mediumColor: '#2f7d4f',
      note: 'Slow growth (weeks) reflects the organism\'s long generation time; malachite green suppresses contaminants.',
    },
    {
      medium: 'Middlebrook 7H10/7H11 agar',
      appearance: 'Rough buff colonies; used with cord-factor microscopy',
      colonyColor: '#cbb787',
      mediumColor: '#c9d6b0',
      note: 'A defined agar allowing earlier microcolony detection and susceptibility testing.',
    },
    {
      medium: 'MGIT liquid culture',
      appearance: 'Fluorescence-based growth detection (no discrete colonies)',
      colonyColor: '#7fd3ff',
      mediumColor: '#12324a',
      note: 'The modern standard — detects growth in ~1–2 weeks, far faster than solid media.',
    },
  ],

  gramStain: {
    category: 'acid-fast',
    resultColor: '#c0392b',
    microscopyAppearance: 'Bright-red bacilli against a blue background (Ziehl-Neelsen)',
    explanation:
      'The waxy mycolic-acid wall resists Gram staining (weakly/"ghost" Gram-positive). Instead the Ziehl-Neelsen acid-fast stain is used: carbol fuchsin is retained through acid-alcohol decolourisation, so the bacilli appear red against a methylene-blue counterstain.',
  },
};
