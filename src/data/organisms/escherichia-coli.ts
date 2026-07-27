import type { Organism } from '@/types/content';

/**
 * OVERVIEW entry — Escherichia coli (Gram-negative exemplar).
 *
 * Lighter than the deep S. aureus template but complete enough to demonstrate the
 * Gram-negative envelope (outer membrane + LPS + thin peptidoglycan) and category
 * appearance. Extend to `depth: 'deep'` by filling out resistance/genomics.
 */
export const escherichiaColi: Organism = {
  id: 'escherichia-coli',
  name: 'Escherichia coli',
  shortName: 'E. coli',
  gramCategory: 'gram-negative',
  morphology: 'Gram-negative bacilli (rods), often motile',
  clinicalNote:
    'Commensal and pathogen: UTIs, gastroenteritis, neonatal meningitis, and Gram-negative sepsis. A major reservoir of ESBL and carbapenemase resistance.',
  depth: 'overview',

  structures: [
    {
      id: 'ec-capsule',
      name: 'Capsule (K antigen)',
      shortLabel: 'Capsule',
      group: 'surface',
      kind: 'capsule',
      color: '#7fd3ff',
      summary: 'Anti-phagocytic polysaccharide layer; K1 is linked to neonatal meningitis.',
      description:
        'Polysaccharide capsule that resists complement and phagocytosis. The K1 serotype is strongly associated with neonatal meningitis and invasive disease.',
      geometry: { radius: 2.8, opacity: 0.16 },
      clickable: true,
    },
    {
      id: 'ec-outer-membrane',
      name: 'Outer membrane',
      shortLabel: 'Outer membrane',
      group: 'envelope',
      kind: 'outer-membrane',
      color: '#8e9bff',
      summary: 'Second lipid bilayer unique to Gram-negatives; contains porins and LPS.',
      description:
        'The outer membrane is an asymmetric bilayer with phospholipids on the inner leaflet and lipopolysaccharide on the outer leaflet. Porin channels (e.g. OmpF/OmpC) admit small hydrophilic molecules — including many antibiotics. Loss or mutation of porins reduces drug entry.',
      clinicalRelevance:
        'The outer membrane is a permeability barrier that makes Gram-negatives intrinsically resistant to several agents; porin loss adds acquired resistance.',
      geometry: { radius: 2.35, thickness: 0.16 },
      clickable: true,
    },
    {
      id: 'ec-lps',
      name: 'Lipopolysaccharide (endotoxin)',
      shortLabel: 'LPS / endotoxin',
      group: 'surface',
      kind: 'lps',
      color: '#ffb4a2',
      summary: 'Lipid A (endotoxin) + core + O-antigen; drives Gram-negative septic shock.',
      description:
        'LPS consists of lipid A (the endotoxic moiety), a core oligosaccharide, and the variable O-antigen. Released lipid A triggers TLR4 signalling and the cytokine cascade of Gram-negative sepsis. Polymyxins bind lipid A to disrupt the membrane.',
      clinicalRelevance:
        'Endotoxin drives septic shock; the target of last-line polymyxins (colistin), whose resistance (mcr-1) is now plasmid-borne.',
      geometry: { count: 70, radius: 2.5, glow: 0.2 },
      clickable: true,
    },
    {
      id: 'ec-peptidoglycan',
      name: 'Peptidoglycan (thin)',
      shortLabel: 'Peptidoglycan',
      group: 'envelope',
      kind: 'peptidoglycan',
      color: '#f0b64d',
      summary: 'A thin 1–2 layer wall in the periplasm — why Gram-negatives decolourise.',
      description:
        'Between the outer and inner membranes lies a thin peptidoglycan layer within the periplasmic space, which also houses β-lactamases. The thinness means the crystal violet–iodine complex washes out during decolourisation, so cells take up the counterstain.',
      clinicalRelevance:
        'Periplasmic β-lactamases (including ESBLs and carbapenemases) sit right where they can intercept β-lactams.',
      geometry: { radius: 1.95, thickness: 0.12 },
      clickable: true,
    },
    {
      id: 'ec-membrane',
      name: 'Inner (cytoplasmic) membrane',
      shortLabel: 'Inner membrane',
      group: 'envelope',
      kind: 'cell-membrane',
      color: '#5cd6a8',
      summary: 'The inner bilayer — transport, respiration, and biosynthesis.',
      description:
        'The inner membrane carries the respiratory chain and transport systems and defines the boundary of the cytoplasm. Together with the outer membrane it creates the periplasmic compartment.',
      geometry: { radius: 1.75, thickness: 0.14 },
      clickable: true,
    },
    {
      id: 'ec-nucleoid',
      name: 'Nucleoid + plasmids',
      shortLabel: 'Nucleoid',
      group: 'internal',
      kind: 'nucleoid',
      color: '#c58bff',
      summary: 'Circular chromosome plus resistance-carrying plasmids.',
      description:
        'Beyond the chromosome, E. coli frequently carries plasmids that ferry resistance genes (ESBLs, carbapenemases, mcr colistin resistance) between cells by conjugation — a principal engine of Gram-negative resistance spread.',
      geometry: { radius: 0.9 },
      clickable: true,
    },
    {
      id: 'ec-flagella',
      name: 'Flagella (H antigen)',
      shortLabel: 'Flagella',
      group: 'appendage',
      kind: 'flagellum',
      color: '#a0e7a0',
      summary: 'Rotary motility organelles; the basis of the H serotype.',
      description:
        'Peritrichous flagella propel the cell toward nutrients (chemotaxis). Their protein (flagellin) defines the H antigen used in serotyping (e.g. O157:H7).',
      geometry: { count: 4, radius: 2.4 },
      clickable: true,
    },
  ],

  antibiotics: [
    {
      id: 'ec-betalactam',
      drugClass: 'β-lactams / cephalosporins',
      examples: ['Ampicillin', 'Ceftriaxone', 'Piperacillin-tazobactam', 'Meropenem'],
      targetStructureId: 'ec-peptidoglycan',
      siteLabel: 'PBP transpeptidase',
      mechanism: 'Inhibit PBP-catalysed cross-linking; must first transit outer-membrane porins.',
      effect: 'bactericidal',
      color: '#4dabf7',
    },
    {
      id: 'ec-polymyxin',
      drugClass: 'Polymyxins',
      examples: ['Colistin', 'Polymyxin B'],
      targetStructureId: 'ec-lps',
      siteLabel: 'Lipid A of LPS',
      mechanism: 'Cationic binding to lipid A disrupts the outer membrane — a last-line agent.',
      effect: 'bactericidal',
      color: '#f783ac',
    },
    {
      id: 'ec-fluoroquinolone',
      drugClass: 'Fluoroquinolones',
      examples: ['Ciprofloxacin'],
      targetStructureId: 'ec-nucleoid',
      siteLabel: 'DNA gyrase',
      mechanism: 'Trap gyrase–DNA complexes, causing lethal breaks.',
      effect: 'bactericidal',
      color: '#da77f2',
    },
  ],

  resistance: [
    {
      id: 'ec-esbl',
      name: 'Extended-spectrum β-lactamase (ESBL)',
      gene: 'blaCTX-M, blaTEM, blaSHV',
      type: 'enzymatic-inactivation',
      defeatsDrugIds: ['ec-betalactam'],
      locusStructureId: 'ec-peptidoglycan',
      description:
        'Periplasmic enzymes that hydrolyse penicillins and most cephalosporins (including ceftriaxone). Plasmid-borne and readily transferred.',
      clinicalImpact:
        'Forces carbapenems or newer β-lactam/β-lactamase-inhibitor combinations for serious infection.',
    },
    {
      id: 'ec-carbapenemase',
      name: 'Carbapenemase (CRE)',
      gene: 'blaKPC, blaNDM, blaOXA-48',
      type: 'enzymatic-inactivation',
      defeatsDrugIds: ['ec-betalactam'],
      locusStructureId: 'ec-peptidoglycan',
      description:
        'Enzymes that hydrolyse carbapenems, the former last-resort β-lactams. NDM/metallo-enzymes resist most inhibitors.',
      clinicalImpact:
        'Defines carbapenem-resistant Enterobacterales (CRE); treatment relies on newer agents (ceftazidime-avibactam, cefiderocol) guided by the enzyme class.',
    },
    {
      id: 'ec-porin-loss',
      name: 'Porin loss / down-regulation',
      gene: 'ompF/ompC',
      type: 'porin-loss',
      defeatsDrugIds: ['ec-betalactam'],
      locusStructureId: 'ec-outer-membrane',
      description:
        'Reduced porin expression limits β-lactam entry across the outer membrane; combines with β-lactamases for higher-level resistance.',
      clinicalImpact: 'Raises MICs and can convert an otherwise-susceptible isolate to resistant.',
    },
    {
      id: 'ec-mcr',
      name: 'Plasmid colistin resistance',
      gene: 'mcr-1',
      type: 'target-modification',
      defeatsDrugIds: ['ec-polymyxin'],
      locusStructureId: 'ec-lps',
      description:
        'mcr-1 adds phosphoethanolamine to lipid A, reducing colistin binding — the first readily transferable colistin-resistance mechanism.',
      clinicalImpact: 'Threatens the last-line status of polymyxins in Gram-negative sepsis.',
    },
  ],

  genomics: [
    {
      id: 'ec-gen-ctxm',
      gene: 'blaCTX-M-15',
      variation: 'Global spread of the CTX-M-15 ESBL on epidemic plasmids/clones (ST131)',
      effect: 'Hydrolyses third-generation cephalosporins.',
      treatmentChange: 'Ceftriaxone excluded for serious infection; escalate to a carbapenem.',
    },
    {
      id: 'ec-gen-ndm',
      gene: 'blaNDM-1',
      variation: 'Acquisition of a metallo-β-lactamase',
      effect: 'Hydrolyses nearly all β-lactams including carbapenems; unaffected by classic inhibitors.',
      treatmentChange:
        'Requires cefiderocol or aztreonam–avibactam combinations; narrow, toxic options.',
    },
  ],

  agar: [
    {
      medium: 'MacConkey agar',
      appearance: 'Flat pink colonies (lactose fermenter) with a surrounding pink zone',
      colonyColor: '#d6547f',
      mediumColor: '#e7b7c4',
      halo: { color: '#c94f77', label: 'Bile-acid precipitation' },
      note: 'Selective (bile salts inhibit Gram-positives) and differential for lactose fermentation.',
    },
    {
      medium: 'Eosin methylene blue (EMB)',
      appearance: 'Colonies with a characteristic green metallic sheen',
      colonyColor: '#2f7d4f',
      mediumColor: '#7a3b6a',
      halo: { color: '#8ef0b0', label: 'Metallic sheen' },
      note: 'Strong acid production from vigorous lactose fermentation gives the classic E. coli sheen.',
    },
    {
      medium: 'Blood agar',
      appearance: 'Grey, moist, non-haemolytic (usually) colonies',
      colonyColor: '#cfc9b8',
      mediumColor: '#7c1e2b',
      note: 'Some uropathogenic/enterohaemorrhagic strains vary in haemolysis.',
    },
  ],

  gramStain: {
    category: 'gram-negative',
    resultColor: '#d6547f',
    microscopyAppearance: 'Pink-red bacilli (rods)',
    explanation:
      'The thin peptidoglycan cannot retain the crystal violet–iodine complex once the outer membrane is dissolved by alcohol, so the cells decolourise and take up the safranin counterstain (pink).',
  },
};
