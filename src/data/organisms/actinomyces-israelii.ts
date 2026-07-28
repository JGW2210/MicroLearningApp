import type { Organism } from '@/types/content';

/**
 * Actinomyces israelii.
 *
 * The filamentous former: cells stay joined end to end and branch, growing as a
 * thread rather than as separate cells. It is the app's example of a bacterium
 * that looks like a fungus and was named as one — and of an infection whose
 * treatment is measured in months because the organism hides inside its own
 * aggregates.
 */
export const actinomycesIsraelii: Organism = {
  id: 'actinomyces-israelii',
  name: 'Actinomyces israelii',
  shortName: 'A. israelii',
  gramCategory: 'gram-positive',
  morphology: 'Gram-positive branching filaments, beaded and irregularly stained',
  arrangement: 'filaments',
  body: { kind: 'filament', sizeUm: 8, radius: 0.5, length: 4.6 },
  clinicalNote:
    'Actinomycosis: a slowly progressive, mass-forming infection of the cervicofacial, thoracic, abdominal or pelvic tissues that crosses tissue planes and discharges sulphur granules.',
  depth: 'deep',

  tests: { catalase: 'negative', oxidase: 'negative', urease: 'negative', motility: 'negative' },
  haemolysis: 'gamma',

  structures: [
    {
      id: 'ais-peptidoglycan',
      name: 'Peptidoglycan wall',
      shortLabel: 'Peptidoglycan',
      group: 'envelope',
      kind: 'peptidoglycan',
      color: '#f0b64d',
      summary: 'Thick Gram-positive wall that stains unevenly along the filament.',
      description:
        'A thick peptidoglycan wall gives the Gram-positive result, but stain uptake varies along the filament, producing the beaded appearance that helps distinguish Actinomyces from a true fungal hypha.',
      clinicalRelevance:
        'Unlike Nocardia, which it superficially resembles, Actinomyces is not acid-fast — a modified Ziehl-Neelsen separates the two and changes therapy completely.',
      geometry: { radius: 0.46, thickness: 0.12, glow: 0.15 },
      drugTargetIds: ['ais-penicillin'],
      clickable: true,
    },
    {
      id: 'ais-membrane',
      name: 'Cell membrane',
      shortLabel: 'Membrane',
      group: 'envelope',
      kind: 'cell-membrane',
      color: '#5cd6a8',
      summary: 'Bilayer of a fermentative anaerobe — no respiratory chain to speak of.',
      description:
        'Actinomyces is a facultative or strict anaerobe that ferments carbohydrates to lactate, acetate and succinate. It lacks catalase, which separates it from the aerobic Gram-positive rods.',
      geometry: { radius: 0.34, thickness: 0.1 },
      clickable: true,
    },
    {
      id: 'ais-fimbriae',
      name: 'Type 1 and 2 fimbriae',
      shortLabel: 'Fimbriae',
      group: 'appendage',
      kind: 'fimbriae',
      color: '#c3f0ca',
      summary: 'Bind tooth surfaces and other bacteria — the basis of dental plaque.',
      description:
        'Type 1 fimbriae bind salivary proline-rich proteins on the tooth surface; type 2 bind receptors on streptococci, letting Actinomyces coaggregate into plaque. It is a normal mouth commensal that turns pathogen only when mucosa is breached.',
      clinicalRelevance:
        'Cervicofacial actinomycosis characteristically follows dental work or jaw trauma, which is how a commensal reaches deep tissue.',
      geometry: { count: 60, radius: 0.5 },
      clickable: true,
    },
    {
      id: 'ais-nucleoid',
      name: 'Nucleoid',
      shortLabel: 'Nucleoid',
      group: 'internal',
      kind: 'nucleoid',
      color: '#c58bff',
      summary: 'High-GC chromosome shared along the filament.',
      description:
        'A high-GC genome typical of the Actinobacteria — the phylum that also contains Mycobacterium, Corynebacterium and the antibiotic-producing Streptomyces.',
      geometry: { radius: 0.24 },
      clickable: true,
    },
    {
      id: 'ais-ribosomes',
      name: 'Ribosomes',
      shortLabel: 'Ribosomes',
      group: 'internal',
      kind: 'ribosomes',
      color: '#ffd166',
      summary: 'Target of the tetracyclines used in penicillin allergy.',
      description: 'The 70S ribosome; doxycycline is the usual alternative agent.',
      geometry: { count: 45, radius: 0.26 },
      drugTargetIds: ['ais-doxycycline'],
      clickable: true,
    },
  ],

  antibiotics: [
    {
      id: 'ais-penicillin',
      drugClass: 'Beta-lactams',
      examples: ['Benzylpenicillin', 'Amoxicillin'],
      targetStructureId: 'ais-peptidoglycan',
      siteLabel: 'Penicillin-binding proteins',
      mechanism:
        'Blocks wall cross-linking. Actinomyces remains reliably susceptible — the difficulty is delivery into a fibrotic mass, not intrinsic resistance.',
      effect: 'bactericidal',
      color: '#4dabf7',
    },
    {
      id: 'ais-doxycycline',
      drugClass: 'Tetracyclines',
      examples: ['Doxycycline'],
      targetStructureId: 'ais-ribosomes',
      siteLabel: '30S ribosomal subunit',
      mechanism: 'Blocks aminoacyl-tRNA docking at the A site. The standard penicillin-allergy option.',
      effect: 'bacteriostatic',
      color: '#e599f7',
    },
    {
      id: 'ais-clindamycin',
      drugClass: 'Lincosamides',
      examples: ['Clindamycin'],
      targetStructureId: 'ais-ribosomes',
      siteLabel: '50S ribosomal subunit',
      mechanism:
        'Binds the 50S subunit and blocks peptide bond formation. The usual alternative when penicillin cannot be used, and it reaches the fibrotic, poorly perfused tissue actinomycosis creates.',
      effect: 'bacteriostatic',
      color: '#b197fc',
    },
  ],

  resistance: [
    {
      id: 'ais-granule',
      name: 'Sulphur granules as a physical sanctuary',
      type: 'reduced-permeability',
      defeatsDrugIds: ['ais-penicillin'],
      locusStructureId: 'ais-peptidoglycan',
      description:
        'The organism grows as dense aggregates of filaments encased in a mineralised protein matrix — the sulphur granules seen in pus. Antibiotic penetrates the surrounding fibrosis and the granule itself poorly, so susceptible organisms survive normal courses.',
      clinicalImpact:
        'This is why actinomycosis is treated with weeks of intravenous then months of oral penicillin, and why surgical debulking is often needed despite full in-vitro susceptibility.',
    },
    {
      id: 'ais-metronidazole',
      name: 'Metronidazole does not work here',
      type: 'intrinsic',
      defeatsDrugIds: [],
      description:
        'Metronidazole is a prodrug that has to be reduced by the low-potential electron transport of a strict anaerobe before it becomes active. Actinomyces is aerotolerant and does not carry out that reduction, so the drug is never switched on. This is not resistance the organism acquired — it is a reaction that never happens.',
      clinicalImpact:
        'Empirical anaerobic cover with metronidazole, which is otherwise a reasonable instinct for a deep abscess, fails completely. Actinomycosis needs prolonged penicillin instead, often for months.',
    },
  ],

  genomics: [
    {
      id: 'ais-gen-actinobacteria',
      gene: 'Whole genome',
      variation: 'High-GC Actinobacterial genome with extensive adhesin gene families',
      effect:
        'Large repertoires of fimbrial adhesins support coaggregation in dental plaque, its normal niche.',
      treatmentChange:
        'No direct effect on drug choice, but explains the dental origin that guides source control.',
    },
  ],

  agar: [
    {
      medium: 'Anaerobic blood agar (5–7 days)',
      appearance: 'White, rough, heaped "molar tooth" colonies',
      colonyColor: '#efe9dd',
      mediumColor: '#7c1e2b',
      note: 'Slow-growing and strictly anaerobic to microaerophilic. The heaped, irregular colony is likened to a molar tooth. Cultures are often reported negative because they are discarded before it appears.',
    },
    {
      medium: 'Brain-heart infusion, thioglycollate',
      appearance: 'Discrete "bread crumb" colonies down the broth column',
      colonyColor: '#e4dcc9',
      mediumColor: '#c2b48f',
      note: 'Growth below the surface in a reduced medium confirms the anaerobic requirement.',
    },
  ],

  gramStain: {
    category: 'gram-positive',
    resultColor: '#5b2a86',
    microscopyAppearance: 'Purple branching filaments, beaded, radiating from sulphur granules',
    explanation:
      'The thick wall retains crystal violet, so the filaments are purple, though uneven stain uptake makes them look beaded. Cells stay joined end to end and branch instead of separating, so the organism grows as a thread — which is why it was long mistaken for a fungus. In pus the filaments radiate outward from the centre of a sulphur granule.',
  },
};
