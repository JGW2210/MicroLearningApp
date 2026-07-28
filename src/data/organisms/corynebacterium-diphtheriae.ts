import type { Organism } from '@/types/content';

/**
 * DEEP entry — Corynebacterium diphtheriae.
 *
 * The palisade organism. Corynebacteria divide by "snapping": the inner wall
 * layer splits while the tough outer layer holds, hinging the daughters apart
 * into V and L forms, and repeated divisions stack the rods side by side like a
 * fence. It is also the app's clearest example of a disease caused not by the
 * bacterium but by a gene a virus brought with it.
 */
export const corynebacteriumDiphtheriae: Organism = {
  id: 'corynebacterium-diphtheriae',
  name: 'Corynebacterium diphtheriae',
  shortName: 'C. diphtheriae',
  gramCategory: 'gram-positive',
  morphology: 'Gram-positive club-shaped rods in palisades and V/L "Chinese letter" forms',
  arrangement: 'palisades',
  body: { kind: 'club-rod', sizeUm: 3.5, radius: 0.85, length: 3.4 },
  clinicalNote:
    'Diphtheria: a pharyngeal pseudomembrane that can obstruct the airway, with toxin-mediated myocarditis and neuropathy. Vaccine-preventable, and re-emerging where coverage lapses.',
  depth: 'deep',

  tests: { catalase: 'positive', oxidase: 'negative', urease: 'negative', motility: 'negative' },
  haemolysis: 'gamma',

  structures: [
    {
      id: 'cdi-mycolic',
      name: 'Corynomycolic acid layer',
      shortLabel: 'Corynomycolates',
      group: 'envelope',
      kind: 'mycolic-acid',
      color: '#ffd08a',
      summary: 'Short mycolic acids — the same architecture as mycobacteria, scaled down.',
      description:
        'Corynebacteria carry mycolic acids like their mycobacterial relatives, but much shorter ones (22–36 carbons against 60–90). The layer is real but thin enough that the cell is not acid-fast and stains Gram-positive normally.',
      clinicalRelevance:
        'It is the tough outer layer that fails to split during division, producing the snapping that gives the palisade and V forms.',
      geometry: { radius: 0.98, thickness: 0.12, glow: 0.18 },
      clickable: true,
    },
    {
      id: 'cdi-peptidoglycan',
      name: 'Arabinogalactan–peptidoglycan wall',
      shortLabel: 'Peptidoglycan',
      group: 'envelope',
      kind: 'peptidoglycan',
      color: '#f0b64d',
      summary: 'Thick wall linked through arabinogalactan to the mycolate layer.',
      description:
        'As in mycobacteria, peptidoglycan is covalently linked through arabinogalactan to the mycolic acids, making one continuous covalent shell. It is thick enough to retain crystal violet.',
      geometry: { radius: 0.8, thickness: 0.16 },
      drugTargetIds: ['cdi-penicillin'],
      clickable: true,
    },
    {
      id: 'cdi-membrane',
      name: 'Cell membrane',
      shortLabel: 'Membrane',
      group: 'envelope',
      kind: 'cell-membrane',
      color: '#5cd6a8',
      summary: 'Bilayer; exports diphtheria toxin when iron is scarce.',
      description:
        'The plasma membrane carries transport and secretion machinery, including export of diphtheria toxin. Toxin production is repressed by the iron-bound DtxR regulator and switches on when iron runs low.',
      geometry: { radius: 0.62, thickness: 0.12 },
      clickable: true,
    },
    {
      id: 'cdi-volutin',
      name: 'Metachromatic (volutin) granules',
      shortLabel: 'Volutin granules',
      group: 'internal',
      kind: 'inclusion',
      color: '#b98cff',
      summary: 'Polyphosphate stores that stain a different colour from the cell.',
      description:
        'Polyphosphate accumulates in discrete granules, classically at the poles. With Albert’s or Loeffler’s methylene blue they take up a reddish-purple quite unlike the blue-green of the rest of the cell — metachromasia, staining in a colour other than the dye’s own.',
      clinicalRelevance:
        'Polar granules in a club-shaped rod arranged in palisades is the classic presumptive microscopy for diphtheria, made while toxin testing is pending.',
      geometry: { count: 4, radius: 0.17 },
      clickable: true,
    },
    {
      id: 'cdi-nucleoid',
      name: 'Nucleoid',
      shortLabel: 'Nucleoid',
      group: 'internal',
      kind: 'nucleoid',
      color: '#c58bff',
      summary: 'Chromosome; carries the tox gene only when lysogenised.',
      description:
        'The chromosome itself has no toxin gene. It is present only in strains lysogenised by corynebacteriophage beta, which integrates and brings tox with it.',
      geometry: { radius: 0.4 },
      drugTargetIds: [],
      clickable: true,
    },
    {
      id: 'cdi-ribosomes',
      name: 'Ribosomes',
      shortLabel: 'Ribosomes',
      group: 'internal',
      kind: 'ribosomes',
      color: '#ffd166',
      summary: 'Macrolide target; erythromycin is the alternative to penicillin.',
      description:
        'The 70S ribosome. Erythromycin binds the 50S subunit and is the standard alternative where penicillin cannot be used.',
      geometry: { count: 55, radius: 0.44 },
      drugTargetIds: ['cdi-erythromycin'],
      clickable: true,
    },
  ],

  antibiotics: [
    {
      id: 'cdi-penicillin',
      drugClass: 'Beta-lactams',
      examples: ['Benzylpenicillin', 'Procaine penicillin'],
      targetStructureId: 'cdi-peptidoglycan',
      siteLabel: 'Penicillin-binding proteins',
      mechanism:
        'Blocks peptidoglycan cross-linking. Clears the organism and stops further toxin production, but does nothing about toxin already bound to tissue.',
      effect: 'bactericidal',
      color: '#4dabf7',
    },
    {
      id: 'cdi-erythromycin',
      drugClass: 'Macrolides',
      examples: ['Erythromycin'],
      targetStructureId: 'cdi-ribosomes',
      siteLabel: '50S ribosomal subunit',
      mechanism: 'Binds 23S rRNA and stalls translation. First-line for eradicating carriage.',
      effect: 'bacteriostatic',
      color: '#e599f7',
    },
  ],

  resistance: [
    {
      id: 'cdi-erm',
      name: 'Macrolide resistance',
      gene: 'ermX',
      type: 'target-modification',
      defeatsDrugIds: ['cdi-erythromycin'],
      locusStructureId: 'cdi-ribosomes',
      description:
        'ermX methylates the 23S rRNA target site. Reported in some circulating lineages, usually on a mobile element shared with other corynebacteria.',
      clinicalImpact:
        'Erythromycin failure in carriage eradication; penicillin remains reliable.',
    },
    {
      id: 'cdi-antitoxin',
      name: 'Antibiotics do not neutralise toxin',
      type: 'target-bypass',
      defeatsDrugIds: ['cdi-penicillin', 'cdi-erythromycin'],
      locusStructureId: 'cdi-nucleoid',
      description:
        'Not resistance in the usual sense, but the same clinical consequence: the damage in diphtheria is done by a secreted toxin, which no antibacterial touches once it has bound its receptor.',
      clinicalImpact:
        'Diphtheria antitoxin must be given on clinical suspicion without waiting for culture — every hour of delay lets more toxin bind irreversibly.',
    },
  ],

  genomics: [
    {
      id: 'cdi-gen-tox',
      gene: 'tox (corynephage beta)',
      variation: 'Lysogenic conversion by bacteriophage beta',
      effect:
        'A non-toxigenic C. diphtheriae becomes toxigenic when the phage integrates. The gene is viral; the bacterium is the delivery vehicle.',
      treatmentChange:
        'Toxigenicity, not species identification, decides whether antitoxin is given — hence the Elek test or PCR for tox.',
    },
    {
      id: 'cdi-gen-dtxr',
      gene: 'dtxR',
      variation: 'Iron-responsive repressor controlling tox expression',
      effect:
        'Toxin is made only when iron is limiting — the condition the organism meets on a host mucosal surface.',
      treatmentChange:
        'Explains why disease follows colonisation of an iron-poor site rather than mere carriage.',
    },
  ],

  agar: [
    {
      medium: 'Loeffler’s serum slope',
      appearance: 'Rapid growth; granules develop well for staining',
      colonyColor: '#e6dfc8',
      mediumColor: '#c9b68a',
      note: 'A serum-rich medium that grows the organism fast and encourages the volutin granules used for presumptive microscopy.',
    },
    {
      medium: 'Tellurite (Hoyle / Tinsdale) agar',
      appearance: 'Black or grey-black colonies, with a brown halo on Tinsdale',
      colonyColor: '#2f2b33',
      mediumColor: '#b9a98c',
      halo: { color: '#6b4a2a', label: 'Brown halo (cystinase)' },
      note: 'Corynebacteria reduce potassium tellurite to metallic tellurium, turning colonies black; the medium is also selective against normal throat flora.',
    },
  ],

  gramStain: {
    category: 'gram-positive',
    resultColor: '#5b2a86',
    microscopyAppearance: 'Purple club-shaped rods in palisades and V/L "Chinese letter" forms',
    explanation:
      'The thick wall keeps the crystal violet, so the rods are purple, and one end swells into the club that names the genus. The arrangement comes from how the cell divides: the inner wall splits while the tough mycolate-linked outer layer holds, so the daughters hinge apart into a V or L rather than separating, and successive divisions stack them side by side into a palisade.',
  },
};
