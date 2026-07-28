import type { Organism } from '@/types/content';

/** OVERVIEW entry — Haemophilus influenzae (coccobacillus morphology). */
export const haemophilusInfluenzae: Organism = {
  id: 'haemophilus-influenzae',
  name: 'Haemophilus influenzae',
  shortName: 'H. influenzae',
  gramCategory: 'gram-negative',
  morphology: 'Small, pleomorphic Gram-negative coccobacilli',
  arrangement: 'single',
  body: { kind: 'coccobacillus', sizeUm: 1, radius: 0.9, length: 1.5 },
  clinicalNote:
    'Causes otitis media, sinusitis, and pneumonia; the encapsulated type b (Hib) caused meningitis and epiglottitis before routine vaccination. Requires X and V growth factors.',
  depth: 'overview',

  structures: [
    {
      id: 'hi-capsule',
      name: 'Polysaccharide capsule (type b = PRP)',
      shortLabel: 'Capsule',
      group: 'surface',
      kind: 'capsule',
      color: '#7fd3ff',
      summary: 'The type b polyribosylribitol phosphate capsule drives invasive disease.',
      description:
        'Encapsulated strains — especially type b (PRP capsule) — resist phagocytosis and cause invasive disease (meningitis, epiglottitis). The Hib conjugate vaccine targets this capsule and has nearly eliminated type b disease.',
      clinicalRelevance: 'PRP is the Hib vaccine antigen; nontypeable (unencapsulated) strains cause mucosal disease.',
      geometry: { radius: 1.05, opacity: 0.16 },
      clickable: true,
    },
    {
      id: 'hi-outer-membrane',
      name: 'Outer membrane',
      shortLabel: 'Outer membrane',
      group: 'envelope',
      kind: 'outer-membrane',
      color: '#8e9bff',
      summary: 'Porins and outer-membrane proteins used in typing.',
      description:
        'The Gram-negative outer membrane carries porins and outer-membrane proteins. Lipooligosaccharide (LOS, a shorter LPS lacking O-antigen) sits on its outer leaflet.',
      geometry: { radius: 0.86, thickness: 0.1 },
      clickable: true,
    },
    {
      id: 'hi-los',
      name: 'Lipooligosaccharide (LOS)',
      shortLabel: 'LOS',
      group: 'surface',
      kind: 'lps',
      color: '#ffb4a2',
      summary: 'A short LPS (no O-antigen) with host-mimicking sugars.',
      description:
        'Haemophilus expresses lipooligosaccharide — LPS truncated to lipid A plus a core, without a repeating O-antigen. Phase-variable sialylation mimics host glycans and aids immune evasion.',
      geometry: { count: 70, radius: 0.96, glow: 0.2 },
      clickable: true,
    },
    {
      id: 'hi-peptidoglycan',
      name: 'Peptidoglycan (thin)',
      shortLabel: 'Peptidoglycan',
      group: 'envelope',
      kind: 'peptidoglycan',
      color: '#f0b64d',
      summary: 'Thin wall with PBP3 — the target of the BLNAR phenotype.',
      description:
        'A thin periplasmic peptidoglycan layer. PBP3 (encoded by ftsI) is the key transpeptidase whose mutation produces β-lactamase-negative ampicillin resistance (BLNAR).',
      geometry: { radius: 0.72, thickness: 0.08 },
      drugTargetIds: ['hi-betalactam'],
      clickable: true,
    },
    {
      id: 'hi-membrane',
      name: 'Inner membrane',
      shortLabel: 'Inner membrane',
      group: 'envelope',
      kind: 'cell-membrane',
      color: '#5cd6a8',
      summary: 'Respiration and transport of the required X/V factors.',
      description:
        'The inner membrane handles respiration and imports the required haemin (X factor) and NAD (V factor) — the growth dependence that defines Haemophilus culture.',
      geometry: { radius: 0.6, thickness: 0.08 },
      clickable: true,
    },
    {
      id: 'hi-nucleoid',
      name: 'Nucleoid',
      shortLabel: 'Nucleoid',
      group: 'internal',
      kind: 'nucleoid',
      color: '#c58bff',
      summary: 'Naturally competent — takes up DNA at uptake-signal sequences.',
      description:
        'H. influenzae is naturally transformable, taking up environmental DNA bearing a specific uptake-signal sequence. This drives horizontal transfer of resistance and capsule genes. (It was the first free-living organism to have its genome fully sequenced.)',
      geometry: { radius: 0.4 },
      clickable: true,
    },
  ],

  antibiotics: [
    {
      id: 'hi-betalactam',
      drugClass: 'β-lactams',
      examples: ['Amoxicillin', 'Amoxicillin-clavulanate', 'Ceftriaxone'],
      targetStructureId: 'hi-peptidoglycan',
      siteLabel: 'PBP3 transpeptidase',
      mechanism: 'Inhibit wall cross-linking. Ceftriaxone is used for invasive disease; amoxicillin-clavulanate covers β-lactamase producers.',
      effect: 'bactericidal',
      color: '#4dabf7',
    },
    {
      id: 'hi-macrolide',
      drugClass: 'Macrolides',
      examples: ['Azithromycin'],
      targetStructureId: 'hi-nucleoid',
      siteLabel: '50S subunit',
      mechanism: 'Bind the 50S ribosome; an option in penicillin allergy, though intrinsic activity is modest.',
      effect: 'bacteriostatic',
      color: '#ff922b',
    },
  ],

  resistance: [
    {
      id: 'hi-blaTEM',
      name: 'β-lactamase (ampicillin resistance)',
      gene: 'blaTEM-1',
      type: 'enzymatic-inactivation',
      defeatsDrugIds: ['hi-betalactam'],
      locusStructureId: 'hi-peptidoglycan',
      description:
        'Plasmid-borne TEM-1 β-lactamase hydrolyses ampicillin/amoxicillin. It is the commonest resistance mechanism and is overcome by adding a β-lactamase inhibitor (clavulanate).',
      clinicalImpact: 'Drives empiric use of amoxicillin-clavulanate or a cephalosporin.',
    },
    {
      id: 'hi-blnar',
      name: 'BLNAR — altered PBP3',
      gene: 'ftsI',
      type: 'target-modification',
      defeatsDrugIds: ['hi-betalactam'],
      locusStructureId: 'hi-peptidoglycan',
      description:
        'β-lactamase-negative ampicillin-resistant strains carry ftsI mutations that lower PBP3 affinity — so a β-lactamase inhibitor does NOT restore activity.',
      clinicalImpact: 'Requires higher-generation cephalosporins; clavulanate alone will not help.',
    },
  ],

  genomics: [
    {
      id: 'hi-gen-cap',
      gene: 'cap b locus',
      variation: 'Presence/absence and copy number of the type b capsule locus',
      effect: 'Encapsulated type b causes invasive disease; loss yields nontypeable mucosal strains.',
      treatmentChange:
        'Shapes prevention (Hib vaccine) more than antibiotic choice; invasive disease still needs ceftriaxone.',
    },
    {
      id: 'hi-gen-ftsI',
      gene: 'ftsI',
      variation: 'PBP3 substitutions (BLNAR)',
      effect: 'Reduced β-lactam binding independent of β-lactamase.',
      treatmentChange: 'Escalate to third-generation cephalosporins; inhibitor combinations are ineffective.',
    },
  ],

  agar: [
    {
      medium: 'Chocolate agar',
      appearance: 'Small, grey, translucent colonies (needs X + V factors)',
      colonyColor: '#cdb79a',
      mediumColor: '#5a3826',
      note: 'Lysed-blood ("chocolate") agar releases haemin (X) and NAD (V), which Haemophilus cannot get from intact blood agar.',
    },
    {
      medium: 'Blood agar with S. aureus streak',
      appearance: 'Satellite colonies clustering around the staph streak',
      colonyColor: '#cfc9b8',
      mediumColor: '#7c1e2b',
      halo: { color: '#f2d7a0', label: 'Satellitism (V factor from staph)' },
      note: 'S. aureus releases NAD (V factor) and lyses red cells, so Haemophilus grows only as satellites near it — a classic identifying feature.',
    },
    {
      medium: 'X/V factor disks',
      appearance: 'Growth only where both X and V disks are close together',
      colonyColor: '#cbd3c0',
      mediumColor: '#d8cfc4',
      note: 'Requiring both factors distinguishes H. influenzae from other Haemophilus species that need only one.',
    },
  ],

  gramStain: {
    category: 'gram-negative',
    resultColor: '#d6547f',
    microscopyAppearance: 'Tiny pink coccobacilli (easily missed)',
    explanation:
      'A Gram-negative envelope means the small coccobacilli decolourise and take the pink counterstain; they are faint and pleomorphic, so are easily overlooked on smears.',
  },
};
