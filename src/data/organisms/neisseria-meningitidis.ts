import type { Organism } from '@/types/content';

/**
 * DEEP entry — Neisseria meningitidis.
 *
 * The app's only Gram-negative coccus, and its example of kidney-bean pairs:
 * the flattened facing sides come from dividing in one plane and staying put.
 * Also the clearest case of an organism whose endotoxin, not its growth, is
 * what kills.
 */
export const neisseriaMeningitidis: Organism = {
  id: 'neisseria-meningitidis',
  name: 'Neisseria meningitidis',
  shortName: 'N. meningitidis',
  gramCategory: 'gram-negative',
  morphology: 'Gram-negative kidney-bean diplococci, often intracellular (~0.8 µm)',
  arrangement: 'pairs',
  body: { kind: 'coccus', sizeUm: 0.8, radius: 2.4 },
  clinicalNote:
    'Meningococcal meningitis and fulminant meningococcaemia — one of the few infections that can kill a healthy young adult within hours.',
  depth: 'deep',

  structures: [
    {
      id: 'nme-capsule',
      name: 'Polysaccharide capsule',
      shortLabel: 'Capsule',
      group: 'envelope',
      kind: 'capsule',
      color: '#9ad6f0',
      summary: 'Defines serogroups A, B, C, W, X and Y — and which vaccine works.',
      description:
        'The capsule blocks complement deposition and phagocytosis, and its sugar chemistry defines the serogroup. Group B is the exception that matters: its polysialic acid is identical to a sugar on human neural cell adhesion molecule, so it is poorly immunogenic.',
      clinicalRelevance:
        'Conjugate vaccines cover A, C, W and Y. Group B needed a completely different approach — reverse vaccinology against surface proteins — precisely because its capsule mimics self.',
      geometry: { radius: 3.3, opacity: 0.18 },
      clickable: true,
    },
    {
      id: 'nme-outer-membrane',
      name: 'Outer membrane',
      shortLabel: 'Outer membrane',
      group: 'envelope',
      kind: 'outer-membrane',
      color: '#6f7bdd',
      summary: 'Gram-negative bilayer; sheds blebs loaded with endotoxin.',
      description:
        'The outer membrane carries porins (PorA and PorB, used for serosubtyping) and, distinctively, sheds large numbers of outer-membrane vesicles during rapid growth.',
      clinicalRelevance:
        'Those blebs deliver endotoxin far beyond the bacteria themselves, which is why meningococcaemia can be so fulminant. Blebs are also the antigen in the outer-membrane-vesicle group B vaccines.',
      geometry: { radius: 2.9, thickness: 0.22 },
      clickable: true,
    },
    {
      id: 'nme-lps',
      name: 'Lipooligosaccharide (LOS)',
      shortLabel: 'LOS',
      group: 'surface',
      kind: 'lps',
      color: '#ffb37a',
      summary: 'Endotoxin without the long O-antigen — the driver of septic shock.',
      description:
        'Neisseria makes lipooligosaccharide rather than full LPS: the lipid A and core are there but the repeating O-antigen is absent. The lipid A is exceptionally potent at triggering TLR4.',
      clinicalRelevance:
        'Circulating LOS drives the cytokine storm, disseminated intravascular coagulation and purpura fulminans of meningococcal sepsis.',
      geometry: { count: 70, radius: 3.1, glow: 0.22 },
      clickable: true,
    },
    {
      id: 'nme-peptidoglycan',
      name: 'Peptidoglycan wall',
      shortLabel: 'Peptidoglycan',
      group: 'envelope',
      kind: 'peptidoglycan',
      color: '#f0b64d',
      summary: 'Thin wall — decolourises, so the cells stain pink.',
      description:
        'A single thin layer of peptidoglycan in the periplasm. Too thin to hold the crystal violet–iodine complex once the outer membrane is dissolved by alcohol, giving the Gram-negative result.',
      geometry: { radius: 2.5, thickness: 0.14 },
      drugTargetIds: ['nme-ceftriaxone'],
      clickable: true,
    },
    {
      id: 'nme-membrane',
      name: 'Inner membrane',
      shortLabel: 'Inner membrane',
      group: 'envelope',
      kind: 'cell-membrane',
      color: '#5cd6a8',
      summary: 'Cytoplasmic bilayer carrying respiration and transport.',
      description: 'The inner membrane holds the respiratory chain, transporters and wall-synthesis enzymes.',
      geometry: { radius: 2.15, thickness: 0.18 },
      clickable: true,
    },
    {
      id: 'nme-pili',
      name: 'Type IV pili',
      shortLabel: 'Type IV pili',
      group: 'appendage',
      kind: 'pili',
      color: '#c3f0ca',
      summary: 'Attach to nasopharyngeal epithelium and take up DNA.',
      description:
        'Retractile type IV pili mediate the initial attachment to non-ciliated nasopharyngeal epithelium and generate the force for twitching motility. They also form the DNA uptake apparatus behind natural competence.',
      clinicalRelevance:
        'Antigenic variation of the pilin subunit helps the organism evade mucosal antibody during carriage; competence lets whole capsule loci be swapped between strains.',
      geometry: { count: 12, radius: 2.9 },
      clickable: true,
    },
    {
      id: 'nme-nucleoid',
      name: 'Nucleoid',
      shortLabel: 'Nucleoid',
      group: 'internal',
      kind: 'nucleoid',
      color: '#c58bff',
      summary: 'Chromosome; highly recombinogenic.',
      description:
        'Natural competence makes the meningococcal chromosome unusually plastic — capsule switching between serogroups happens by homologous recombination at the capsule locus.',
      geometry: { radius: 1.05 },
      clickable: true,
    },
    {
      id: 'nme-ribosomes',
      name: 'Ribosomes',
      shortLabel: 'Ribosomes',
      group: 'internal',
      kind: 'ribosomes',
      color: '#ffd166',
      summary: 'Protein synthesis; chloramphenicol target where used.',
      description: 'The 70S ribosome; chloramphenicol remains an alternative in some settings.',
      geometry: { count: 60, radius: 1.4 },
      clickable: true,
    },
  ],

  antibiotics: [
    {
      id: 'nme-ceftriaxone',
      drugClass: 'Third-generation cephalosporins',
      examples: ['Ceftriaxone', 'Cefotaxime'],
      targetStructureId: 'nme-peptidoglycan',
      siteLabel: 'Penicillin-binding protein 2',
      mechanism:
        'Crosses the outer membrane through porins and acylates PBP2, halting wall cross-linking. Penetrates inflamed meninges well.',
      effect: 'bactericidal',
      color: '#4dabf7',
    },
    {
      id: 'nme-rifampicin',
      drugClass: 'Rifamycins (prophylaxis)',
      examples: ['Rifampicin', 'Ciprofloxacin'],
      targetStructureId: 'nme-nucleoid',
      siteLabel: 'RNA polymerase / DNA gyrase',
      mechanism:
        'Used to clear nasopharyngeal carriage in close contacts rather than to treat disease.',
      effect: 'bactericidal',
      color: '#e599f7',
    },
  ],

  resistance: [
    {
      id: 'nme-pena',
      name: 'Reduced penicillin susceptibility',
      gene: 'penA',
      type: 'target-modification',
      defeatsDrugIds: [],
      locusStructureId: 'nme-peptidoglycan',
      description:
        'Mosaic penA alleles acquired from commensal Neisseria lower PBP2 affinity for penicillin. Ceftriaxone generally remains active.',
      clinicalImpact:
        'Enough to have moved empirical therapy from penicillin to ceftriaxone in most guidelines.',
    },
  ],

  genomics: [
    {
      id: 'nme-gen-capsule',
      gene: 'cps (capsule locus)',
      variation: 'Capsule switching by homologous recombination',
      effect:
        'A strain can exchange a group C capsule for a group B one, keeping its virulent genetic background while escaping conjugate-vaccine immunity.',
      treatmentChange:
        'Does not change antibiotic choice, but drives surveillance and vaccine composition.',
    },
  ],

  agar: [
    {
      medium: 'Chocolate agar',
      appearance: 'Round, moist, grey-blue colonies; needs CO₂',
      colonyColor: '#c9cdd4',
      mediumColor: '#5a3826',
      note: 'Fastidious and requires enriched medium in 5% CO₂. Does not grow on plain blood agar the way many pathogens do.',
    },
    {
      medium: 'Thayer-Martin (selective)',
      appearance: 'Grey colonies; contaminating flora suppressed',
      colonyColor: '#c9cdd4',
      mediumColor: '#4a2f1f',
      note: 'Vancomycin, colistin and nystatin suppress Gram-positives, other Gram-negatives and fungi, letting Neisseria be recovered from heavily colonised sites.',
    },
  ],

  gramStain: {
    category: 'gram-negative',
    resultColor: '#d6547f',
    microscopyAppearance: 'Pink diplococci, characteristically inside neutrophils in CSF',
    explanation:
      'A thin peptidoglycan layer and an outer membrane dissolved by the decolouriser mean the crystal violet washes out and safranin colours the cells pink. Division in a single plane leaves them in pairs, with the facing sides flattened into the kidney-bean profile. Seeing them inside neutrophils on a CSF film is effectively diagnostic.',
  },
};
