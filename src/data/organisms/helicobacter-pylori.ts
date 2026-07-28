import type { Organism } from '@/types/content';

/** OVERVIEW entry — Helicobacter pylori (helical / spiral morphology). */
export const helicobacterPylori: Organism = {
  id: 'helicobacter-pylori',
  name: 'Helicobacter pylori',
  shortName: 'H. pylori',
  gramCategory: 'gram-negative',
  morphology: 'Gram-negative helical rods with a polar tuft of sheathed flagella',
  arrangement: 'single',
  body: { kind: 'spirillum', sizeUm: 3.5, radius: 0.55, length: 3.8, turns: 1.6, amplitude: 0.9 },
  clinicalNote:
    'Colonises the gastric mucosa and causes chronic gastritis, peptic ulcers, and gastric adenocarcinoma/MALT lymphoma. Urease neutralises stomach acid to allow survival.',
  depth: 'overview',

  structures: [
    {
      id: 'hp-outer-membrane',
      name: 'Outer membrane',
      shortLabel: 'Outer membrane',
      group: 'envelope',
      kind: 'outer-membrane',
      color: '#8e9bff',
      summary: 'Carries adhesins (BabA/SabA) that grip gastric epithelium.',
      description:
        'The outer membrane bears adhesins such as BabA and SabA that anchor the organism to gastric mucus and epithelium, plus outer-membrane porins.',
      geometry: { radius: 0.66, thickness: 0.1 },
      clickable: true,
    },
    {
      id: 'hp-lps',
      name: 'Lipopolysaccharide',
      shortLabel: 'LPS',
      group: 'surface',
      kind: 'lps',
      color: '#ffb4a2',
      summary: 'LPS with Lewis-antigen mimicry that aids immune evasion.',
      description:
        'H. pylori LPS often mimics host Lewis blood-group antigens, contributing to immune tolerance and chronic persistent colonisation.',
      geometry: { count: 70, radius: 0.76, glow: 0.2 },
      clickable: true,
    },
    {
      id: 'hp-peptidoglycan',
      name: 'Peptidoglycan (thin)',
      shortLabel: 'Peptidoglycan',
      group: 'envelope',
      kind: 'peptidoglycan',
      color: '#f0b64d',
      summary: 'Thin wall; helical shape is maintained by cell-wall peptidases.',
      description:
        'A thin peptidoglycan layer; specific cell-shape-determining peptidoglycan hydrolases (csd genes) sculpt the helical form that aids corkscrewing through mucus.',
      geometry: { radius: 0.5, thickness: 0.08 },
      drugTargetIds: ['hp-betalactam'],
      clickable: true,
    },
    {
      id: 'hp-membrane',
      name: 'Inner membrane',
      shortLabel: 'Inner membrane',
      group: 'envelope',
      kind: 'cell-membrane',
      color: '#5cd6a8',
      summary: 'Respiration and transport; microaerophilic metabolism.',
      description:
        'The inner membrane supports a microaerophilic respiratory metabolism — H. pylori grows best at reduced oxygen tension.',
      geometry: { radius: 0.42, thickness: 0.08 },
      clickable: true,
    },
    {
      id: 'hp-nucleoid',
      name: 'Nucleoid',
      shortLabel: 'Nucleoid',
      group: 'internal',
      kind: 'nucleoid',
      color: '#c58bff',
      summary: 'Chromosome carrying the cag pathogenicity island and vacA.',
      description:
        'The chromosome carries the cag pathogenicity island (encoding a type IV secretion system that injects CagA) and the vacuolating toxin vacA — major determinants of ulcer and cancer risk.',
      geometry: { radius: 0.3 },
      drugTargetIds: ['hp-metronidazole'],
      clickable: true,
    },
    {
      id: 'hp-ribosomes',
      name: 'Ribosomes',
      shortLabel: 'Ribosomes',
      group: 'internal',
      kind: 'ribosomes',
      color: '#ffd166',
      summary: 'Target of the clarithromycin in triple therapy.',
      description:
        'The 50S ribosomal subunit is the target of clarithromycin — the linchpin (and commonest point of failure) of eradication regimens.',
      geometry: { count: 45, radius: 0.32 },
      drugTargetIds: ['hp-macrolide'],
      clickable: true,
    },
    {
      id: 'hp-flagella',
      name: 'Polar flagellar tuft',
      shortLabel: 'Flagella',
      group: 'appendage',
      kind: 'flagellum',
      color: '#a0e7a0',
      summary: 'A tuft of sheathed flagella at one pole for corkscrew motility.',
      description:
        'Multiple sheathed flagella at one pole drive corkscrewing motility that lets H. pylori burrow through gastric mucus toward the epithelial surface.',
      geometry: { count: 4, radius: 0.55 },
      clickable: true,
    },
  ],

  antibiotics: [
    {
      id: 'hp-macrolide',
      drugClass: 'Macrolides',
      examples: ['Clarithromycin'],
      targetStructureId: 'hp-ribosomes',
      siteLabel: '50S subunit (23S rRNA)',
      mechanism: 'Binds the 50S subunit to stall translation; the key agent in standard triple therapy.',
      effect: 'bacteriostatic',
      color: '#ff922b',
    },
    {
      id: 'hp-betalactam',
      drugClass: 'Aminopenicillins',
      examples: ['Amoxicillin'],
      targetStructureId: 'hp-peptidoglycan',
      siteLabel: 'PBP transpeptidase',
      mechanism: 'Inhibits wall cross-linking; resistance remains uncommon, so amoxicillin is a reliable regimen partner.',
      effect: 'bactericidal',
      color: '#4dabf7',
    },
    {
      id: 'hp-metronidazole',
      drugClass: 'Nitroimidazoles',
      examples: ['Metronidazole'],
      targetStructureId: 'hp-nucleoid',
      siteLabel: 'DNA (radical damage)',
      mechanism: 'Activated to reactive radicals that fragment DNA; used in bismuth quadruple therapy.',
      effect: 'bactericidal',
      color: '#da77f2',
    },
  ],

  resistance: [
    {
      id: 'hp-23s',
      name: 'Clarithromycin resistance',
      gene: '23S rRNA (A2142G/A2143G)',
      type: 'target-modification',
      defeatsDrugIds: ['hp-macrolide'],
      locusStructureId: 'hp-ribosomes',
      description:
        'Point mutations in 23S rRNA abolish clarithromycin binding. Now common enough that many guidelines drop clarithromycin-based triple therapy where resistance exceeds ~15%.',
      clinicalImpact: 'The leading cause of eradication failure; drives the shift to bismuth quadruple therapy.',
    },
    {
      id: 'hp-rdxA',
      name: 'Metronidazole resistance',
      gene: 'rdxA',
      type: 'target-bypass',
      defeatsDrugIds: ['hp-metronidazole'],
      locusStructureId: 'hp-nucleoid',
      description:
        'Loss-of-function mutations in the rdxA nitroreductase prevent prodrug activation, so DNA damage no longer occurs.',
      clinicalImpact: 'Common worldwide; can sometimes be overcome by higher doses/longer courses.',
    },
  ],

  genomics: [
    {
      id: 'hp-gen-cag',
      gene: 'cagA (cag PAI)',
      variation: 'Presence of the cag pathogenicity island',
      effect: 'Encodes a type IV secretion system injecting CagA, raising ulcer and gastric-cancer risk.',
      treatmentChange:
        'Signals higher-risk disease and stronger indication to eradicate, though not the antibiotic choice itself.',
    },
    {
      id: 'hp-gen-23s',
      gene: '23S rRNA',
      variation: 'A2142G / A2143G point mutations',
      effect: 'Clarithromycin resistance.',
      treatmentChange: 'Switch to bismuth quadruple or levofloxacin-based therapy; test-guided where available.',
    },
  ],

  agar: [
    {
      medium: 'Skirrow / selective agar',
      appearance: 'Small translucent grey colonies after 3–7 days, microaerophilic',
      colonyColor: '#cbd3c0',
      mediumColor: '#7c1e2b',
      note: 'Fastidious and slow; requires microaerophilic conditions. Antibiotics in the medium suppress gastric flora.',
    },
    {
      medium: 'Rapid urease (CLO) test',
      appearance: 'Medium turns pink as urease raises the pH',
      colonyColor: '#e05780',
      mediumColor: '#f4d06f',
      halo: { color: '#e05780', label: 'Urease-positive (pink)' },
      note: 'Not a growth medium but the classic bedside/biopsy test — strong urease is a hallmark of H. pylori.',
    },
    {
      medium: 'Diagnosis in practice',
      appearance: 'Urea breath test / stool antigen / biopsy — culture is rarely needed',
      colonyColor: '#7fd3ff',
      mediumColor: '#12324a',
      note: 'Non-invasive urea breath and stool-antigen tests are the usual diagnostics; culture is reserved for resistance testing.',
    },
  ],

  gramStain: {
    category: 'gram-negative',
    resultColor: '#d6547f',
    microscopyAppearance: 'Pink, curved/spiral (seagull-wing) rods',
    explanation:
      'A Gram-negative envelope means the helical cells decolourise and take the pink counterstain; on gastric biopsy they are often highlighted with silver or Giemsa stains.',
  },
};
