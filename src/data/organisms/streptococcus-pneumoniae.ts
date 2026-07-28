import type { Organism } from '@/types/content';

/**
 * DEEP entry — Streptococcus pneumoniae.
 *
 * The lancet-shaped diplococcus: division in one plane, stopping at two. Its
 * capsule is the whole story here — the sole determinant of virulence, the
 * basis of both vaccines, and the reason a Gram film can be diagnostic.
 */
export const streptococcusPneumoniae: Organism = {
  id: 'streptococcus-pneumoniae',
  name: 'Streptococcus pneumoniae',
  shortName: 'S. pneumoniae',
  gramCategory: 'gram-positive',
  morphology: 'Gram-positive lancet-shaped diplococci (~0.8–1.2 µm)',
  arrangement: 'pairs',
  body: { kind: 'coccus', sizeUm: 1.0, radius: 2.6 },
  clinicalNote:
    'The commonest cause of community-acquired pneumonia, and a leading cause of bacterial meningitis and otitis media.',
  depth: 'deep',

  tests: { catalase: 'negative', oxidase: 'negative', urease: 'negative', motility: 'negative', optochin: 'positive' },
  haemolysis: 'alpha',

  structures: [
    {
      id: 'spn-capsule',
      name: 'Polysaccharide capsule',
      shortLabel: 'Capsule',
      group: 'envelope',
      kind: 'capsule',
      color: '#8ed0ff',
      summary: 'Over 100 serotypes; the single most important virulence factor.',
      description:
        'A thick polysaccharide capsule prevents complement deposition and phagocytosis. More than a hundred chemically distinct serotypes exist, and an unencapsulated pneumococcus is essentially avirulent — the classic demonstration of a single structure carrying virulence.',
      clinicalRelevance:
        'Both vaccines target it: PPSV23 uses purified polysaccharide, PCV13/15/20 conjugate it to protein for T-cell help in infants. Serotype replacement after vaccination is an ongoing problem.',
      geometry: { radius: 3.6, opacity: 0.2, glow: 0.15 },
      clickable: true,
    },
    {
      id: 'spn-peptidoglycan',
      name: 'Peptidoglycan wall',
      shortLabel: 'Peptidoglycan',
      group: 'envelope',
      kind: 'peptidoglycan',
      color: '#f0b64d',
      summary: 'Thick Gram-positive wall; PBPs here become mosaic under drug pressure.',
      description:
        'The thick wall gives the Gram-positive result and carries the penicillin-binding proteins. Unusually, pneumococcus is naturally competent — it takes up DNA from relatives and recombines it into its own PBP genes.',
      clinicalRelevance:
        'That natural transformation is exactly how mosaic, low-affinity PBPs arise, giving stepwise beta-lactam resistance without any acquired enzyme.',
      geometry: { radius: 2.9, thickness: 0.4 },
      drugTargetIds: ['spn-penicillin'],
      clickable: true,
    },
    {
      id: 'spn-teichoic',
      name: 'Teichoic acid (C polysaccharide)',
      shortLabel: 'Teichoic acid',
      group: 'surface',
      kind: 'teichoic-acid',
      color: '#ffb3c1',
      summary: 'Choline-containing wall polymer; the target of the urinary antigen test.',
      description:
        'Pneumococcal teichoic acid is unusual in containing phosphorylcholine, which anchors autolysin (LytA) and the choline-binding proteins. The C polysaccharide is also what the urinary antigen assay detects.',
      clinicalRelevance:
        'LytA-driven autolysis is the basis of bile solubility, a standard identification test, and releases the pneumolysin that drives inflammation.',
      geometry: { count: 60, radius: 3.0 },
      clickable: true,
    },
    {
      id: 'spn-membrane',
      name: 'Cell membrane',
      shortLabel: 'Membrane',
      group: 'envelope',
      kind: 'cell-membrane',
      color: '#5cd6a8',
      summary: 'Bilayer; site of pneumolysin release on autolysis.',
      description:
        'The plasma membrane carries transport and wall-synthesis machinery. Pneumolysin, a cholesterol-dependent cytolysin, is cytoplasmic and released when the cell autolyses.',
      geometry: { radius: 2.3, thickness: 0.2 },
      clickable: true,
    },
    {
      id: 'spn-nucleoid',
      name: 'Nucleoid',
      shortLabel: 'Nucleoid',
      group: 'internal',
      kind: 'nucleoid',
      color: '#c58bff',
      summary: 'Chromosome; naturally competent for transformation.',
      description:
        'The chromosome readily incorporates DNA taken up from other streptococci during natural competence — the mechanism Griffith used in 1928 to demonstrate that a "transforming principle" carried heredity.',
      geometry: { radius: 1.15 },
      clickable: true,
    },
    {
      id: 'spn-ribosomes',
      name: 'Ribosomes',
      shortLabel: 'Ribosomes',
      group: 'internal',
      kind: 'ribosomes',
      color: '#ffd166',
      summary: 'Macrolide target; resistance is common.',
      description: 'The 50S subunit binds macrolides, which are frequently defeated by ermB or mefE.',
      geometry: { count: 70, radius: 1.5 },
      drugTargetIds: ['spn-macrolide'],
      clickable: true,
    },
  ],

  antibiotics: [
    {
      id: 'spn-penicillin',
      drugClass: 'Beta-lactams',
      examples: ['Benzylpenicillin', 'Amoxicillin', 'Ceftriaxone'],
      targetStructureId: 'spn-peptidoglycan',
      siteLabel: 'PBP2x / PBP2b / PBP1a',
      mechanism: 'Blocks transpeptidase cross-linking of peptidoglycan.',
      effect: 'bactericidal',
      color: '#4dabf7',
    },
    {
      id: 'spn-macrolide',
      drugClass: 'Macrolides',
      examples: ['Clarithromycin', 'Azithromycin'],
      targetStructureId: 'spn-ribosomes',
      siteLabel: '50S ribosomal subunit',
      mechanism: 'Binds 23S rRNA and blocks the polypeptide exit tunnel.',
      effect: 'bacteriostatic',
      color: '#e599f7',
    },
  ],

  resistance: [
    {
      id: 'spn-pbp',
      name: 'Mosaic penicillin-binding proteins',
      gene: 'pbp2x / pbp2b / pbp1a',
      type: 'target-modification',
      defeatsDrugIds: ['spn-penicillin'],
      locusStructureId: 'spn-peptidoglycan',
      description:
        'Blocks of DNA from viridans streptococci recombine into the pbp genes, lowering beta-lactam affinity in steps. There is no enzyme and no plasmid — the target itself is rebuilt.',
      clinicalImpact:
        'Resistance is graded rather than all-or-nothing, so higher doses still work in pneumonia while meningitis needs ceftriaxone with vancomycin until susceptibility is known.',
    },
    {
      id: 'spn-erm',
      name: 'Macrolide resistance',
      gene: 'ermB / mefE',
      type: 'target-modification',
      defeatsDrugIds: ['spn-macrolide'],
      locusStructureId: 'spn-ribosomes',
      description:
        'ermB methylates the 23S rRNA binding site; mefE pumps the drug out. Both are widespread and often carried on the same mobile element as tetracycline resistance.',
      clinicalImpact:
        'Macrolide monotherapy for pneumococcal pneumonia is unreliable in most regions.',
    },
  ],

  genomics: [
    {
      id: 'spn-gen-serotype',
      gene: 'cps locus',
      variation: 'Capsular switching by recombination at the cps operon',
      effect:
        'A lineage can exchange its capsule type, escaping vaccine-induced immunity while keeping its genetic background.',
      treatmentChange:
        'Drives serotype replacement after conjugate vaccine rollout and shapes which valency the next vaccine needs.',
    },
  ],

  agar: [
    {
      medium: 'Blood agar',
      appearance: 'Small mucoid colonies, often draughtsman-shaped, with green alpha-haemolysis',
      colonyColor: '#dfe3d2',
      mediumColor: '#7c1e2b',
      halo: { color: '#6f8f5a', label: 'Alpha-haemolysis (partial, green)' },
      note: 'Hydrogen peroxide partially oxidises haemoglobin to green methaemoglobin. Autolysis leaves the older colony centre sunken — the draughtsman appearance.',
    },
    {
      medium: 'Blood agar with optochin disk',
      appearance: 'Zone of inhibition ≥14 mm around the optochin disk',
      colonyColor: '#dfe3d2',
      mediumColor: '#7c1e2b',
      halo: { color: '#cdd9e8', label: 'Optochin-susceptible' },
      note: 'Optochin susceptibility and bile solubility separate pneumococcus from the viridans streptococci, which share its alpha-haemolysis.',
    },
  ],

  gramStain: {
    category: 'gram-positive',
    resultColor: '#5b2a86',
    microscopyAppearance: 'Purple lancet-shaped diplococci, often with a clear capsular halo',
    explanation:
      'The thick wall retains crystal violet, so the cells are purple. They divide in one plane and stop at two, giving pairs whose opposed ends are drawn out into the lancet shape. The capsule excludes stain and can show as a clear halo around each pair.',
  },
};
