import type { Organism } from '@/types/content';

/**
 * DEEP entry — Streptococcus pyogenes (Lancefield group A).
 *
 * The app's exemplar of chain formation: division in a single plane with the
 * daughters never separating. Also the cleanest case of an organism that has
 * stayed universally susceptible to penicillin while acquiring resistance to
 * the drugs used when penicillin cannot be given.
 */
export const streptococcusPyogenes: Organism = {
  id: 'streptococcus-pyogenes',
  name: 'Streptococcus pyogenes',
  shortName: 'S. pyogenes',
  gramCategory: 'gram-positive',
  morphology: 'Gram-positive cocci in chains (~0.6–1.0 µm)',
  arrangement: 'chains',
  body: { kind: 'coccus', sizeUm: 0.9, radius: 2.6 },
  clinicalNote:
    'Group A Strep: pharyngitis, impetigo, cellulitis, necrotising fasciitis and toxic shock, plus the post-infectious sequelae of rheumatic fever and glomerulonephritis.',
  depth: 'deep',

  structures: [
    {
      id: 'spy-capsule',
      name: 'Hyaluronic acid capsule',
      shortLabel: 'Capsule',
      group: 'envelope',
      kind: 'capsule',
      color: '#7fd4e8',
      summary: 'Made of hyaluronan — chemically identical to host connective tissue.',
      description:
        'The capsule is hyaluronic acid, the same polymer found in human connective tissue. Because it is a self molecule the immune system raises no antibody against it, so the capsule is effectively invisible while still blocking phagocytosis.',
      clinicalRelevance:
        'Molecular mimicry by the capsule is one reason no capsule-based vaccine is feasible here, unlike pneumococcus.',
      geometry: { radius: 3.5, opacity: 0.16 },
      clickable: true,
    },
    {
      id: 'spy-peptidoglycan',
      name: 'Peptidoglycan wall',
      shortLabel: 'Peptidoglycan',
      group: 'envelope',
      kind: 'peptidoglycan',
      color: '#f0b64d',
      summary: 'Thick Gram-positive wall — the penicillin target, still fully susceptible.',
      description:
        'A thick, multilayered peptidoglycan sacculus retains crystal violet through decolourisation, giving the Gram-positive result. Penicillin-binding proteins cross-link it and are the target of the beta-lactams.',
      clinicalRelevance:
        'S. pyogenes has never developed penicillin resistance anywhere in the world — penicillin remains the drug of choice after seventy years of use.',
      geometry: { radius: 2.9, thickness: 0.42, glow: 0.18 },
      drugTargetIds: ['spy-penicillin'],
      clickable: true,
    },
    {
      id: 'spy-mprotein',
      name: 'M protein and lipoteichoic acid',
      shortLabel: 'M protein',
      group: 'surface',
      kind: 'teichoic-acid',
      color: '#ff9f68',
      summary: 'Anti-phagocytic surface fibrils; the basis of emm typing.',
      description:
        'M protein fibrils projecting through the wall bind host complement regulators, blocking opsonisation. Its hypervariable tip defines the emm type and is the antigen protective immunity is raised against — which is why repeat infection with a different type is common.',
      clinicalRelevance:
        'Certain M types are associated with rheumatic fever and with necrotising fasciitis; emm typing drives outbreak investigation.',
      geometry: { count: 70, radius: 3.0, glow: 0.2 },
      clickable: true,
    },
    {
      id: 'spy-membrane',
      name: 'Cell membrane',
      shortLabel: 'Membrane',
      group: 'envelope',
      kind: 'cell-membrane',
      color: '#5cd6a8',
      summary: 'Bilayer carrying transport and the streptolysin secretion machinery.',
      description:
        'The plasma membrane houses transport systems and exports the streptolysins O and S that lyse red cells, producing the wide clear beta-haemolysis seen on blood agar.',
      geometry: { radius: 2.3, thickness: 0.2 },
      clickable: true,
    },
    {
      id: 'spy-nucleoid',
      name: 'Nucleoid',
      shortLabel: 'Nucleoid',
      group: 'internal',
      kind: 'nucleoid',
      color: '#c58bff',
      summary: 'Chromosome carrying emm and the phage-encoded toxin genes.',
      description:
        'The circular chromosome carries emm and, in some lineages, lysogenic bacteriophages encoding the streptococcal pyrogenic exotoxins responsible for scarlet fever and toxic shock.',
      geometry: { radius: 1.15 },
      clickable: true,
    },
    {
      id: 'spy-ribosomes',
      name: 'Ribosomes',
      shortLabel: 'Ribosomes',
      group: 'internal',
      kind: 'ribosomes',
      color: '#ffd166',
      summary: '50S subunit — the macrolide and clindamycin target.',
      description:
        'The 70S ribosome is where macrolides and clindamycin bind the 50S subunit. Clindamycin also shuts down toxin translation, which is why it is added in toxin-driven disease.',
      geometry: { count: 70, radius: 1.5 },
      drugTargetIds: ['spy-macrolide'],
      clickable: true,
    },
  ],

  antibiotics: [
    {
      id: 'spy-penicillin',
      drugClass: 'Beta-lactams',
      examples: ['Benzylpenicillin', 'Amoxicillin'],
      targetStructureId: 'spy-peptidoglycan',
      siteLabel: 'Penicillin-binding proteins',
      mechanism:
        'Acylates the transpeptidase site of PBPs, halting peptidoglycan cross-linking so the wall fails as the cell grows.',
      effect: 'bactericidal',
      color: '#4dabf7',
    },
    {
      id: 'spy-macrolide',
      drugClass: 'Macrolides / lincosamides',
      examples: ['Erythromycin', 'Clarithromycin', 'Clindamycin'],
      targetStructureId: 'spy-ribosomes',
      siteLabel: '50S ribosomal subunit',
      mechanism:
        'Binds the 23S rRNA of the 50S subunit and blocks the exit tunnel, stalling translation. Clindamycin additionally suppresses exotoxin synthesis.',
      effect: 'bacteriostatic',
      color: '#e599f7',
    },
  ],

  resistance: [
    {
      id: 'spy-ermb',
      name: 'MLSb resistance',
      gene: 'ermB / ermTR',
      type: 'target-modification',
      defeatsDrugIds: ['spy-macrolide'],
      locusStructureId: 'spy-ribosomes',
      description:
        'A methylase dimethylates adenine 2058 of the 23S rRNA, so macrolides, lincosamides and streptogramin B all lose their binding site at once — the MLSb phenotype.',
      clinicalImpact:
        'Removes both erythromycin and clindamycin, the usual fallbacks in penicillin allergy. Inducible forms are unmasked by the D-test.',
    },
    {
      id: 'spy-mefa',
      name: 'Macrolide efflux',
      gene: 'mefA',
      type: 'efflux',
      defeatsDrugIds: ['spy-macrolide'],
      locusStructureId: 'spy-membrane',
      description:
        'A membrane pump exports 14- and 15-membered macrolides. Clindamycin is not a substrate, so it remains active.',
      clinicalImpact:
        'Erythromycin-resistant but clindamycin-susceptible isolates — the distinction that makes the D-test worth doing.',
    },
  ],

  genomics: [
    {
      id: 'spy-gen-emm',
      gene: 'emm',
      variation: 'Hypervariable 5′ sequence defining >200 emm types',
      effect:
        'Type-specific immunity means infection with one emm type gives no protection against the next.',
      treatmentChange:
        'No change to therapy, but emm typing underpins outbreak tracking and vaccine design.',
    },
    {
      id: 'spy-gen-spe',
      gene: 'speA / speC',
      variation: 'Lysogenic bacteriophage carrying pyrogenic exotoxin genes',
      effect:
        'Converts a strain to a superantigen producer, driving scarlet fever and streptococcal toxic shock syndrome.',
      treatmentChange:
        'Toxin-mediated disease warrants adding clindamycin to penicillin to shut down toxin translation.',
    },
  ],

  agar: [
    {
      medium: 'Blood agar',
      appearance: 'Small grey-white colonies with a wide clear zone of beta-haemolysis',
      colonyColor: '#e8e4d8',
      mediumColor: '#7c1e2b',
      halo: { color: '#f6efdc', label: 'Beta-haemolysis (complete lysis)' },
      note: 'Streptolysins O and S lyse red cells completely, clearing the agar around each colony — the first branch point in identifying a streptococcus.',
    },
    {
      medium: 'Blood agar with bacitracin disk',
      appearance: 'Zone of inhibition around the 0.04 U bacitracin disk',
      colonyColor: '#e8e4d8',
      mediumColor: '#7c1e2b',
      halo: { color: '#cdd9e8', label: 'Bacitracin-susceptible (group A)' },
      note: 'Bacitracin susceptibility separates group A from the other beta-haemolytic streptococci — a cheap presumptive identification still used widely.',
    },
  ],

  gramStain: {
    category: 'gram-positive',
    resultColor: '#5b2a86',
    microscopyAppearance: 'Purple cocci in chains',
    explanation:
      'The thick peptidoglycan wall traps the crystal violet–iodine complex through decolourisation, so the cells stay purple. Because the cell divides in one plane only and the daughters stay attached, they pay out into the chains that name the genus.',
  },
};
