import type { Organism } from '@/types/content';

/**
 * DEEP entry — Clostridium tetani.
 *
 * The counterpart to Bacillus in the app: an anaerobic spore-former whose spore
 * is terminal and wider than the rod that made it, distending the cell into the
 * drumstick. Set beside B. anthracis, the pair make the point that spore
 * position and whether it swells are read as identification features in their
 * own right.
 */
export const clostridiumTetani: Organism = {
  id: 'clostridium-tetani',
  name: 'Clostridium tetani',
  shortName: 'C. tetani',
  gramCategory: 'gram-positive',
  morphology: 'Gram-positive rods with terminal swelling spores — the drumstick appearance',
  arrangement: 'single',
  body: { kind: 'bacillus', sizeUm: 4, radius: 0.8, length: 4.0 },
  clinicalNote:
    'Tetanus: spastic paralysis from a toxin that blocks inhibitory neurotransmission. The organism stays in the wound; the toxin travels.',
  depth: 'deep',

  tests: { catalase: 'negative', oxidase: 'negative', urease: 'negative', motility: 'positive' },
  haemolysis: 'beta',

  structures: [
    {
      id: 'cte-peptidoglycan',
      name: 'Peptidoglycan wall',
      shortLabel: 'Peptidoglycan',
      group: 'envelope',
      kind: 'peptidoglycan',
      color: '#f0b64d',
      summary: 'Thick Gram-positive wall; stains variably in older cultures.',
      description:
        'A thick peptidoglycan wall gives the Gram-positive result, though clostridia frequently decolourise in older cultures and can be reported as Gram-variable — a known pitfall.',
      geometry: { radius: 0.9, thickness: 0.16 },
      drugTargetIds: ['cte-penicillin'],
      clickable: true,
    },
    {
      id: 'cte-membrane',
      name: 'Cell membrane',
      shortLabel: 'Membrane',
      group: 'envelope',
      kind: 'cell-membrane',
      color: '#5cd6a8',
      summary: 'Bilayer of a strict anaerobe — no catalase, no superoxide dismutase.',
      description:
        'C. tetani is a strict anaerobe: it lacks catalase and superoxide dismutase, so oxygen metabolites accumulate and kill it. This is why it only establishes in devitalised, poorly perfused tissue.',
      clinicalRelevance:
        'Deep puncture wounds with necrotic tissue create the low redox potential the organism needs — hence the classic association with rusty nails and contaminated soil.',
      geometry: { radius: 0.72, thickness: 0.14 },
      clickable: true,
    },
    {
      id: 'cte-endospore',
      name: 'Endospore (terminal, swelling)',
      shortLabel: 'Endospore',
      group: 'internal',
      kind: 'endospore',
      color: '#eaf3ff',
      summary: 'Terminal and wider than the cell — the drumstick.',
      description:
        'The spore forms at one pole and is broader than the mother cell, distending the wall around it. That combination — terminal plus swelling — produces the drumstick or tennis-racquet outline, and it is diagnostic enough to be worth reporting from a direct film.',
      clinicalRelevance:
        'Spores survive in soil and dust indefinitely and resist boiling. Tetanus is prevented by immunisation against the toxin, not by eradicating an organism that cannot be eradicated.',
      geometry: { radius: 0.92, position: 'terminal', glow: 0.32 },
      clickable: true,
    },
    {
      id: 'cte-flagellum',
      name: 'Peritrichous flagella',
      shortLabel: 'Flagella',
      group: 'appendage',
      kind: 'flagellum',
      color: '#9be7c4',
      summary: 'Motile in the vegetative form, giving swarming growth on agar.',
      description:
        'Vegetative cells carry flagella all over the surface and are actively motile, which is why colonies swarm across a blood agar plate as a fine film rather than forming discrete colonies.',
      geometry: { count: 6, radius: 0.9 },
      clickable: true,
    },
    {
      id: 'cte-nucleoid',
      name: 'Nucleoid',
      shortLabel: 'Nucleoid',
      group: 'internal',
      kind: 'nucleoid',
      color: '#c58bff',
      summary: 'Chromosome; the toxin gene sits on a plasmid, not here.',
      description:
        'The chromosome runs metabolism and the sporulation cascade. Tetanospasmin itself is encoded on a large plasmid, so toxigenicity travels separately from the species.',
      geometry: { radius: 0.42 },
      clickable: true,
    },
    {
      id: 'cte-plasmid',
      name: 'Tetanospasmin plasmid',
      shortLabel: 'Toxin plasmid',
      group: 'internal',
      kind: 'plasmid',
      color: '#7fd4e8',
      summary: 'Carries tent — the gene for one of the most potent toxins known.',
      description:
        'Tetanospasmin is a zinc metalloprotease that cleaves synaptobrevin in inhibitory interneurons, blocking release of glycine and GABA. Losing inhibition, not gaining excitation, is what produces the rigidity and spasms.',
      clinicalRelevance:
        'The toxin travels by retrograde axonal transport to the spinal cord. Once it is bound it cannot be neutralised, so antitoxin only mops up what is still circulating — which is why treatment is largely supportive.',
      geometry: { count: 1, radius: 0.26 },
      clickable: true,
    },
    {
      id: 'cte-ribosomes',
      name: 'Ribosomes',
      shortLabel: 'Ribosomes',
      group: 'internal',
      kind: 'ribosomes',
      color: '#ffd166',
      summary: 'Metronidazole and penicillin are preferred, but protein synthesis is targetable.',
      description: 'The 70S ribosome; clindamycin and metronidazole are both active against clostridia.',
      geometry: { count: 55, radius: 0.46 },
      clickable: true,
    },
  ],

  antibiotics: [
    {
      id: 'cte-metronidazole',
      drugClass: 'Nitroimidazoles',
      examples: ['Metronidazole'],
      targetStructureId: 'cte-nucleoid',
      siteLabel: 'DNA (after anaerobic reduction)',
      mechanism:
        'A prodrug reduced only in the low-redox cytoplasm of anaerobes; the radical formed fragments DNA. Its selectivity is the anaerobic metabolism itself.',
      effect: 'bactericidal',
      color: '#4dabf7',
    },
    {
      id: 'cte-penicillin',
      drugClass: 'Beta-lactams',
      examples: ['Benzylpenicillin'],
      targetStructureId: 'cte-peptidoglycan',
      siteLabel: 'Penicillin-binding proteins',
      mechanism: 'Blocks wall cross-linking in vegetative cells.',
      effect: 'bactericidal',
      color: '#63e6be',
    },
  ],

  resistance: [
    {
      id: 'cte-toxin',
      name: 'The toxin is the disease',
      type: 'target-bypass',
      defeatsDrugIds: ['cte-metronidazole', 'cte-penicillin'],
      locusStructureId: 'cte-plasmid',
      description:
        'Antibiotics clear a small, localised wound infection, but every clinical feature of tetanus comes from a toxin already released and bound at nerve terminals. Killing the organism changes none of it.',
      clinicalImpact:
        'Management is antitoxin, wound debridement, and supportive care through weeks of spasm — with immunisation the only intervention that actually works.',
    },
    {
      id: 'cte-spore',
      name: 'Spore resistance',
      type: 'reduced-permeability',
      defeatsDrugIds: ['cte-metronidazole', 'cte-penicillin'],
      locusStructureId: 'cte-endospore',
      description:
        'The dehydrated, coat-shielded spore is metabolically inert and impermeable, so no antibacterial reaches or affects it. It survives boiling and most disinfectants.',
      clinicalImpact:
        'Sterilisation of instruments requires autoclaving at 121 °C, a standard set by what it takes to kill bacterial spores rather than vegetative cells.',
    },
  ],

  genomics: [
    {
      id: 'cte-gen-tent',
      gene: 'tent (plasmid-borne)',
      variation: 'Presence of the tetanospasmin plasmid',
      effect:
        'Non-toxigenic C. tetani exists and causes no tetanus. Toxigenicity rides on a plasmid, as with the phage-borne diphtheria toxin.',
      treatmentChange:
        'Reinforces that prevention targets the toxin — the vaccine is a toxoid, not a killed organism.',
    },
  ],

  agar: [
    {
      medium: 'Anaerobic blood agar',
      appearance: 'Fine swarming film across the plate rather than discrete colonies; narrow beta-haemolysis',
      colonyColor: '#ded9cb',
      mediumColor: '#7c1e2b',
      note: 'Peritrichous motility makes it swarm, so there is often no countable colony — the growth appears as a thin translucent veil over the agar.',
    },
    {
      medium: 'Robertson’s cooked meat broth',
      appearance: 'Turbid growth with blackening and a foul odour',
      colonyColor: '#6b5a45',
      mediumColor: '#b08968',
      note: 'A classic anaerobic enrichment: the meat particles absorb oxygen and provide reducing conditions. Proteolytic clostridia blacken and digest the meat.',
    },
  ],

  gramStain: {
    category: 'gram-positive',
    resultColor: '#5b2a86',
    microscopyAppearance: 'Purple rods with a clear terminal spore swelling the end — drumsticks',
    explanation:
      'The thick wall retains crystal violet, though older cultures decolourise and can be misread as Gram-negative. The spore excludes stain entirely and appears as a clear gap; here it sits at one pole and is wider than the rod, so it distends the end into the drumstick that names the appearance.',
  },
};
