import type { Organism } from '@/types/content';

/**
 * OVERVIEW entry — Mycoplasma pneumoniae (non-staining / atypical exemplar).
 *
 * Demonstrates an organism with NO cell wall: it cannot be Gram stained and is
 * intrinsically resistant to all cell-wall-active antibiotics. Included so the
 * gram module covers the "non-stainable / atypical" category honestly.
 */
export const mycoplasmaPneumoniae: Organism = {
  id: 'mycoplasma-pneumoniae',
  name: 'Mycoplasma pneumoniae',
  shortName: 'M. pneumoniae',
  gramCategory: 'non-staining',
  morphology: 'Pleomorphic, wall-less bacteria (no fixed shape)',
  body: { kind: 'coccus', radius: 2.0 },
  clinicalNote:
    'A leading cause of "atypical" (walking) pneumonia. The absence of a cell wall makes it invisible on Gram stain and immune to β-lactams.',
  depth: 'overview',

  structures: [
    {
      id: 'mp-membrane',
      name: 'Sterol-containing membrane (no wall)',
      shortLabel: 'Membrane (no wall)',
      group: 'envelope',
      kind: 'cell-membrane',
      color: '#5cd6a8',
      summary: 'The only boundary — a cholesterol-stabilised membrane with no peptidoglycan at all.',
      description:
        'Mycoplasma species have entirely lost the peptidoglycan cell wall. Their single membrane is uniquely stabilised by host-derived sterols (cholesterol), giving mechanical resilience without a wall. With no wall there is nothing for crystal violet or safranin to bind, so the organism does not Gram stain.',
      clinicalRelevance:
        'No wall = intrinsic resistance to ALL cell-wall agents (β-lactams, glycopeptides). Diagnosis relies on serology/PCR, not microscopy.',
      geometry: { radius: 2.0, thickness: 0.18, glow: 0.2 },
      clickable: true,
    },
    {
      id: 'mp-attachment',
      name: 'Attachment tip organelle (P1 adhesin)',
      shortLabel: 'Attachment tip',
      group: 'surface',
      kind: 'fimbriae',
      color: '#ffb4a2',
      summary: 'Specialised terminal organelle that grips respiratory epithelium.',
      description:
        'A polar attachment organelle rich in the P1 adhesin lets M. pneumoniae glide along and adhere tightly to ciliated respiratory epithelium, disrupting the mucociliary escalator and driving a persistent cough.',
      geometry: { count: 1, radius: 2.1 },
      clickable: true,
    },
    {
      id: 'mp-nucleoid',
      name: 'Genome (minimal)',
      shortLabel: 'Genome',
      group: 'internal',
      kind: 'nucleoid',
      color: '#c58bff',
      summary: 'One of the smallest known bacterial genomes.',
      description:
        'M. pneumoniae has a very small genome and limited biosynthetic capacity, making it dependent on the host and fastidious to culture.',
      geometry: { radius: 0.9 },
      clickable: true,
    },
    {
      id: 'mp-ribosomes',
      name: 'Ribosomes',
      shortLabel: 'Ribosomes',
      group: 'internal',
      kind: 'ribosomes',
      color: '#ffd166',
      summary: 'Target of macrolides — the first-line therapy.',
      description:
        'With cell-wall agents useless, treatment targets protein synthesis (macrolides) or DNA (tetracyclines, fluoroquinolones). Macrolides are first-line, especially in children.',
      geometry: { count: 60, radius: 1.4 },
      drugTargetIds: ['mp-macrolide'],
      clickable: true,
    },
  ],

  antibiotics: [
    {
      id: 'mp-macrolide',
      drugClass: 'Macrolides',
      examples: ['Azithromycin', 'Clarithromycin'],
      targetStructureId: 'mp-ribosomes',
      siteLabel: '50S subunit (23S rRNA)',
      mechanism: 'Bind the 50S subunit to stall protein synthesis — first-line for atypical pneumonia.',
      effect: 'bacteriostatic',
      color: '#ff922b',
    },
    {
      id: 'mp-tetracycline',
      drugClass: 'Tetracyclines',
      examples: ['Doxycycline'],
      targetStructureId: 'mp-ribosomes',
      siteLabel: '30S subunit',
      mechanism: 'Block aminoacyl-tRNA binding to the 30S subunit; useful in macrolide resistance.',
      effect: 'bacteriostatic',
      color: '#ffa94d',
    },
  ],

  resistance: [
    {
      id: 'mp-intrinsic',
      name: 'Intrinsic β-lactam resistance (no wall)',
      type: 'target-bypass',
      defeatsDrugIds: [],
      locusStructureId: 'mp-membrane',
      description:
        'With no peptidoglycan there is no PBP target, so every cell-wall-active antibiotic (penicillins, cephalosporins, carbapenems, vancomycin) is intrinsically ineffective.',
      clinicalImpact: 'Empiric β-lactams for "pneumonia" miss atypicals — hence macrolide/doxycycline cover.',
    },
    {
      id: 'mp-23s',
      name: 'Macrolide resistance',
      gene: '23S rRNA (A2063G)',
      type: 'target-modification',
      defeatsDrugIds: ['mp-macrolide'],
      locusStructureId: 'mp-ribosomes',
      description:
        'Point mutations in domain V of 23S rRNA reduce macrolide binding; now common in parts of Asia.',
      clinicalImpact: 'Switch to doxycycline or a respiratory fluoroquinolone.',
    },
  ],

  genomics: [
    {
      id: 'mp-gen-23s',
      gene: '23S rRNA',
      variation: 'A2063G / A2064G point mutations',
      effect: 'High-level macrolide resistance.',
      treatmentChange: 'Use doxycycline or levofloxacin/moxifloxacin instead of a macrolide.',
    },
  ],

  agar: [
    {
      medium: 'PPLO / SP4 agar',
      appearance: 'Tiny "fried-egg" colonies visible only under magnification after 1–3 weeks',
      colonyColor: '#f4e6b0',
      mediumColor: '#c9d6b0',
      note: 'Requires sterol-enriched special media; too fastidious and slow for routine diagnosis.',
    },
    {
      medium: 'Diagnosis in practice',
      appearance: 'Not cultured routinely — PCR of respiratory samples or paired serology',
      colonyColor: '#7fd3ff',
      mediumColor: '#12324a',
      note: 'Because microscopy and culture are impractical, nucleic-acid testing is the modern standard.',
    },
  ],

  gramStain: {
    category: 'non-staining',
    resultColor: '#8a8f98',
    microscopyAppearance: 'Not visualised — no cell wall to retain either dye',
    explanation:
      'The Gram stain relies on the peptidoglycan wall to trap or release crystal violet. With no wall at all, Mycoplasma cannot be Gram stained and is effectively invisible by this method — it must be detected by PCR or serology.',
  },
};
