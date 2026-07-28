import type { Organism } from '@/types/content';

/**
 * DEEP entry — Bacillus anthracis.
 *
 * The app's aerobic spore-former, and its example of a central, non-swelling
 * endospore: the rod stays straight-sided because the spore is narrower than
 * the cell that made it. Also unusual in having a protein capsule rather than
 * a polysaccharide one, and in owing essentially all of its virulence to two
 * plasmids.
 */
export const bacillusAnthracis: Organism = {
  id: 'bacillus-anthracis',
  name: 'Bacillus anthracis',
  shortName: 'B. anthracis',
  gramCategory: 'gram-positive',
  morphology: 'Large Gram-positive rods in chains, with central non-swelling spores',
  arrangement: 'chains',
  body: { kind: 'bacillus', sizeUm: 5, radius: 1.05, length: 4.6 },
  clinicalNote:
    'Anthrax: cutaneous, inhalational or gastrointestinal. Spores persist in soil for decades, which is what makes it both a zoonosis and a bioterrorism agent.',
  depth: 'deep',

  tests: { catalase: 'positive', oxidase: 'negative', urease: 'negative', motility: 'negative' },
  haemolysis: 'gamma',

  structures: [
    {
      id: 'ban-capsule',
      name: 'Poly-D-glutamic acid capsule',
      shortLabel: 'Capsule',
      group: 'envelope',
      kind: 'capsule',
      color: '#9fd8c8',
      summary: 'A protein capsule, not a polysaccharide one — and poorly immunogenic for it.',
      description:
        'Almost uniquely among bacteria, the anthrax capsule is a polypeptide: poly-D-glutamic acid. Being made of D-amino acids it resists proteolysis, and its monotonous negative charge makes it a poor antigen, so it blocks phagocytosis without provoking useful antibody.',
      clinicalRelevance:
        'Encoded on plasmid pXO2. Strains that lose it are attenuated — the basis of the Sterne veterinary vaccine strain.',
      geometry: { radius: 1.42, opacity: 0.18 },
      clickable: true,
    },
    {
      id: 'ban-peptidoglycan',
      name: 'Peptidoglycan wall',
      shortLabel: 'Peptidoglycan',
      group: 'envelope',
      kind: 'peptidoglycan',
      color: '#f0b64d',
      summary: 'Thick Gram-positive wall, with an S-layer anchored to it.',
      description:
        'A thick peptidoglycan sacculus retains crystal violet. Surface-layer proteins are tethered to it through S-layer homology domains, forming a paracrystalline coat outside the wall.',
      geometry: { radius: 1.18, thickness: 0.2 },
      drugTargetIds: ['ban-ciprofloxacin'],
      clickable: true,
    },
    {
      id: 'ban-membrane',
      name: 'Cell membrane',
      shortLabel: 'Membrane',
      group: 'envelope',
      kind: 'cell-membrane',
      color: '#5cd6a8',
      summary: 'Bilayer; exports the three toxin components.',
      description:
        'Protective antigen, lethal factor and oedema factor are all secreted across this membrane. None is toxic alone — protective antigen forms the pore that carries the other two into host cells.',
      geometry: { radius: 0.96, thickness: 0.16 },
      clickable: true,
    },
    {
      id: 'ban-endospore',
      name: 'Endospore (central, non-swelling)',
      shortLabel: 'Endospore',
      group: 'internal',
      kind: 'endospore',
      color: '#eaf3ff',
      summary: 'A dormant survival body — one per cell, so it is persistence, not reproduction.',
      description:
        'Under starvation the cell commits to sporulation: it copies its chromosome, engulfs one copy inside the other cell, and builds a dehydrated core packed with calcium dipicolinate and shielded by tough coat proteins. One mother cell yields exactly one spore, so this multiplies nothing — it is a way of waiting.',
      clinicalRelevance:
        'The spore is the infectious form. It survives heat, desiccation and disinfectants for decades in soil, resists standard autoclave times if wet heat cannot reach it, and is what makes decontamination after release so difficult.',
      geometry: { radius: 0.62, position: 'central', glow: 0.3 },
      clickable: true,
    },
    {
      id: 'ban-plasmid',
      name: 'Virulence plasmids pXO1 / pXO2',
      shortLabel: 'pXO1 / pXO2',
      group: 'internal',
      kind: 'plasmid',
      color: '#7fd4e8',
      summary: 'Toxin genes and capsule genes — lose them and the organism is harmless.',
      description:
        'pXO1 carries the three toxin genes, pXO2 the capsule biosynthesis operon. B. anthracis is otherwise near-identical to the harmless soil organism B. cereus; virtually its entire pathogenicity sits on these two plasmids.',
      clinicalRelevance:
        'The clearest case in the app of virulence being mobile rather than chromosomal — and of why plasmid content, not species name alone, determines danger.',
      geometry: { count: 2, radius: 0.3 },
      clickable: true,
    },
    {
      id: 'ban-nucleoid',
      name: 'Nucleoid',
      shortLabel: 'Nucleoid',
      group: 'internal',
      kind: 'nucleoid',
      color: '#c58bff',
      summary: 'Chromosome; carries the sporulation programme.',
      description:
        'The chromosome encodes the sigma-factor cascade that runs sporulation, and the gyrase targeted by ciprofloxacin.',
      geometry: { radius: 0.55 },
      drugTargetIds: ['ban-ciprofloxacin'],
      clickable: true,
    },
    {
      id: 'ban-ribosomes',
      name: 'Ribosomes',
      shortLabel: 'Ribosomes',
      group: 'internal',
      kind: 'ribosomes',
      color: '#ffd166',
      summary: 'Target of the protein-synthesis inhibitors added to block toxin production.',
      description:
        'Linezolid or clindamycin are added in systemic anthrax specifically to shut down toxin translation, since killing the organism does not remove toxin already made.',
      geometry: { count: 70, radius: 0.62 },
      drugTargetIds: ['ban-linezolid'],
      clickable: true,
    },
  ],

  antibiotics: [
    {
      id: 'ban-ciprofloxacin',
      drugClass: 'Fluoroquinolones',
      examples: ['Ciprofloxacin', 'Levofloxacin'],
      targetStructureId: 'ban-nucleoid',
      siteLabel: 'DNA gyrase / topoisomerase IV',
      mechanism:
        'Traps the gyrase–DNA complex, producing lethal double-strand breaks. First-line for treatment and for post-exposure prophylaxis.',
      effect: 'bactericidal',
      color: '#4dabf7',
    },
    {
      id: 'ban-linezolid',
      drugClass: 'Protein-synthesis inhibitors',
      examples: ['Linezolid', 'Clindamycin'],
      targetStructureId: 'ban-ribosomes',
      siteLabel: '50S ribosomal subunit',
      mechanism:
        'Blocks translation, which stops further toxin being made — added to a bactericidal agent in systemic disease for that reason rather than for killing.',
      effect: 'bacteriostatic',
      color: '#e599f7',
    },
    {
      id: 'ban-penicillin',
      drugClass: 'β-lactams',
      examples: ['Penicillin G', 'Amoxicillin'],
      targetStructureId: 'ban-peptidoglycan',
      siteLabel: 'PBP transpeptidase',
      mechanism:
        'Blocks wall cross-linking. Effective against susceptible strains, but the inducible β-lactamase below is why penicillin alone is not trusted for inhalational anthrax or post-exposure prophylaxis.',
      effect: 'bactericidal',
      color: '#4dabf7',
    },
  ],

  resistance: [
    {
      id: 'ban-penicillinase',
      name: 'Inducible β-lactamase',
      gene: 'bla1 / bla2',
      type: 'enzymatic-inactivation',
      defeatsDrugIds: ['ban-penicillin'],
      locusStructureId: 'ban-peptidoglycan',
      description:
        'Chromosomal beta-lactamases are usually silent but can be induced, so penicillin monotherapy is no longer recommended for systemic anthrax even though most isolates test susceptible.',
      clinicalImpact:
        'Empirical therapy moved to a fluoroquinolone; penicillin is used only after susceptibility is confirmed.',
    },
    {
      id: 'ban-spore',
      name: 'Spore dormancy defeats antibiotics entirely',
      type: 'target-bypass',
      defeatsDrugIds: ['ban-ciprofloxacin', 'ban-linezolid'],
      locusStructureId: 'ban-endospore',
      description:
        'Antibacterials act on processes of growth — wall synthesis, transcription, translation. A dormant spore is doing none of them, so it is untouched by every agent here without carrying a single resistance gene.',
      clinicalImpact:
        'Inhaled spores can germinate weeks later, which is why post-exposure prophylaxis runs for 60 days rather than a normal course.',
    },
  ],

  genomics: [
    {
      id: 'ban-gen-pxo',
      gene: 'pXO1 / pXO2',
      variation: 'Presence or loss of the two virulence plasmids',
      effect:
        'Loss of pXO2 gives the attenuated Sterne strain used as a veterinary vaccine; loss of both leaves an organism essentially indistinguishable from soil B. cereus.',
      treatmentChange:
        'Plasmid detection by PCR is how a suspicious Bacillus isolate is confirmed or cleared.',
    },
  ],

  agar: [
    {
      medium: 'Blood agar',
      appearance: 'Large, flat, grey-white colonies with irregular "Medusa head" edges; non-haemolytic',
      colonyColor: '#dcd8cc',
      mediumColor: '#7c1e2b',
      note: 'Being non-haemolytic separates it from B. cereus, which is strongly beta-haemolytic. The comma-like curling projections at the colony edge give the Medusa head appearance.',
    },
    {
      medium: 'Bicarbonate agar in CO₂',
      appearance: 'Mucoid colonies — capsule induced',
      colonyColor: '#e6e2d4',
      mediumColor: '#c8bfa8',
      note: 'The capsule is only expressed under bicarbonate and CO₂, conditions mimicking the host. On ordinary agar the organism looks unremarkable and unencapsulated.',
    },
  ],

  gramStain: {
    category: 'gram-positive',
    resultColor: '#5b2a86',
    microscopyAppearance: 'Large purple rods in chains, with clear central spores',
    explanation:
      'The thick wall keeps the crystal violet, so the rods are purple, and single-plane division without separation strings them into chains — streptobacilli. The spore takes no stain at all: its coat excludes the reagents, so it shows as a clear unstained gap inside a stained cell. Here it is central and narrower than the rod, so the outline stays straight-sided.',
  },
};
