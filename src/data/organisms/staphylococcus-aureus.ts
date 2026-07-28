import type { Organism } from '@/types/content';

/**
 * DEEP EXEMPLAR — Staphylococcus aureus.
 *
 * This entry is authored end-to-end and serves as the template for every future
 * organism. It exercises every part of the schema: envelope structures, internal
 * contents, antibiotic targeting, resistance mechanisms, genomic variation, agar
 * appearance, and the gram-stain profile.
 */
export const staphylococcusAureus: Organism = {
  id: 'staphylococcus-aureus',
  name: 'Staphylococcus aureus',
  shortName: 'S. aureus',
  gramCategory: 'gram-positive',
  morphology: 'Gram-positive cocci in grape-like clusters (~0.5–1.5 µm)',
  arrangement: 'clusters',
  body: { kind: 'coccus', sizeUm: 1, radius: 2.75 },
  clinicalNote:
    'A leading cause of skin/soft-tissue infection, bacteraemia, endocarditis, and device infection. MRSA is a defining antimicrobial-resistance challenge.',
  depth: 'deep',

  structures: [
    {
      id: 'sa-capsule',
      name: 'Polysaccharide capsule',
      shortLabel: 'Capsule',
      group: 'surface',
      kind: 'capsule',
      color: '#7fd3ff',
      summary: 'Anti-phagocytic outer polysaccharide layer (serotypes 5 & 8 predominate).',
      description:
        'Many clinical S. aureus strains produce a polysaccharide microcapsule that impairs opsonophagocytosis, promoting immune evasion and persistence in the bloodstream. Not all strains express it strongly in vitro, so it is variably visible on standard media.',
      clinicalRelevance:
        'Contributes to virulence and vaccine target interest; masks surface antigens from the immune system.',
      geometry: { radius: 2.75, opacity: 0.18, glow: 0.15 },
      clickable: true,
    },
    {
      id: 'sa-peptidoglycan',
      name: 'Peptidoglycan cell wall (thick)',
      shortLabel: 'Peptidoglycan',
      group: 'envelope',
      kind: 'peptidoglycan',
      color: '#f0b64d',
      summary: 'Thick, multilayered murein sacculus — the hallmark of Gram-positive envelopes.',
      description:
        'S. aureus has a thick peptidoglycan wall (20–40 layers) built from alternating N-acetylglucosamine (NAG) and N-acetylmuramic acid (NAM) sugars cross-linked by peptide bridges. In staphylococci the cross-links use a characteristic pentaglycine bridge. Penicillin-binding proteins (PBPs) catalyse the final transpeptidation step that stitches these bridges together — the reaction β-lactams inhibit.',
      clinicalRelevance:
        'Thickness is why Gram-positive cells retain crystal violet (stain purple). Wall thickening also underlies vancomycin-intermediate resistance (VISA).',
      geometry: { radius: 2.35, thickness: 0.32, glow: 0.2 },
      drugTargetIds: ['sa-betalactam', 'sa-glycopeptide'],
      clickable: true,
    },
    {
      id: 'sa-teichoic',
      name: 'Teichoic & lipoteichoic acids',
      shortLabel: 'Teichoic acids',
      group: 'envelope',
      kind: 'teichoic-acid',
      color: '#ff9f68',
      summary: 'Anionic glycopolymers threading the wall (WTA) and anchored to the membrane (LTA).',
      description:
        'Wall teichoic acids (WTA) are covalently linked to peptidoglycan while lipoteichoic acids (LTA) are anchored in the cell membrane. They regulate cation homeostasis, autolysin activity, and adhesion, and are potent activators of innate immunity. WTA also positions the machinery for β-lactam resistance in MRSA.',
      clinicalRelevance:
        'WTA is required for full expression of methicillin resistance and is an emerging antibacterial target.',
      geometry: { count: 60, radius: 2.5, glow: 0.25 },
      clickable: true,
    },
    {
      id: 'sa-membrane',
      name: 'Cytoplasmic (cell) membrane',
      shortLabel: 'Cell membrane',
      group: 'envelope',
      kind: 'cell-membrane',
      color: '#5cd6a8',
      summary: 'Phospholipid bilayer — selective barrier, energy transduction, and drug target.',
      description:
        'The phospholipid bilayer houses the electron-transport chain, transport systems, and biosynthetic enzymes. Its net-negative surface charge is a target for cationic lipopeptides. S. aureus can remodel membrane charge (via mprF) to repel such drugs.',
      clinicalRelevance:
        'Daptomycin inserts into and depolarises this membrane; mprF-mediated charge repulsion drives daptomycin resistance.',
      geometry: { radius: 1.95, thickness: 0.14 },
      drugTargetIds: ['sa-lipopeptide'],
      clickable: true,
    },
    {
      id: 'sa-cytoplasm',
      name: 'Cytoplasm',
      shortLabel: 'Cytoplasm',
      group: 'internal',
      kind: 'cytoplasm',
      color: '#12324a',
      summary: 'Aqueous interior holding the genome, ribosomes, and metabolic machinery.',
      description:
        'The cytoplasm is the site of transcription, translation, and central metabolism. Several antibiotic classes must cross the envelope to reach their intracellular targets here.',
      geometry: { radius: 1.8, opacity: 0.35 },
      clickable: true,
    },
    {
      id: 'sa-nucleoid',
      name: 'Nucleoid (chromosomal DNA)',
      shortLabel: 'Nucleoid',
      group: 'internal',
      kind: 'nucleoid',
      color: '#c58bff',
      summary: 'Supercoiled circular chromosome; site of replication and transcription.',
      description:
        'The single circular chromosome is condensed into a nucleoid. DNA gyrase and topoisomerase IV manage supercoiling during replication (fluoroquinolone targets), while RNA polymerase transcribes genes (rifampicin target).',
      clinicalRelevance:
        'Fluoroquinolone resistance arises from gyrA/parC mutations; rifampicin resistance from rpoB mutations — both emerge rapidly on monotherapy.',
      geometry: { radius: 0.85, glow: 0.2 },
      drugTargetIds: ['sa-fluoroquinolone', 'sa-rifamycin'],
      clickable: true,
    },
    {
      id: 'sa-ribosomes',
      name: 'Ribosomes (70S)',
      shortLabel: 'Ribosomes',
      group: 'internal',
      kind: 'ribosomes',
      color: '#ffd166',
      summary: 'Protein-synthesis machines (30S + 50S) — a rich antibiotic target hub.',
      description:
        'Bacterial 70S ribosomes comprise a 30S and a 50S subunit. Their divergence from the human 80S ribosome makes them selectively druggable: aminoglycosides and tetracyclines hit the 30S; macrolides, lincosamides, and oxazolidinones hit the 50S.',
      clinicalRelevance:
        'Ribosomal methylation (erm genes → MLSb phenotype) confers cross-resistance to macrolides, lincosamides, and streptogramin B.',
      geometry: { count: 90, radius: 1.5 },
      drugTargetIds: ['sa-aminoglycoside', 'sa-macrolide', 'sa-oxazolidinone'],
      clickable: true,
    },
  ],

  antibiotics: [
    {
      id: 'sa-betalactam',
      drugClass: 'β-lactams',
      examples: ['Penicillin', 'Methicillin/Oxacillin', 'Cefazolin', 'Nafcillin'],
      targetStructureId: 'sa-peptidoglycan',
      siteLabel: 'PBP transpeptidase',
      mechanism:
        'Structurally mimic D-Ala-D-Ala and acylate penicillin-binding proteins (PBPs), blocking the transpeptidation cross-link and leaving a weakened, lysis-prone wall.',
      effect: 'bactericidal',
      color: '#4dabf7',
    },
    {
      id: 'sa-glycopeptide',
      drugClass: 'Glycopeptides',
      examples: ['Vancomycin', 'Teicoplanin'],
      targetStructureId: 'sa-peptidoglycan',
      siteLabel: 'D-Ala-D-Ala terminus',
      mechanism:
        'Bind the terminal D-Ala-D-Ala of peptidoglycan precursors, sterically blocking transglycosylation and transpeptidation. Acts one step upstream of the PBP reaction.',
      effect: 'bactericidal',
      color: '#9775fa',
    },
    {
      id: 'sa-lipopeptide',
      drugClass: 'Lipopeptides',
      examples: ['Daptomycin'],
      targetStructureId: 'sa-membrane',
      siteLabel: 'Cytoplasmic membrane',
      mechanism:
        'Calcium-dependent insertion into the membrane forms oligomeric pores, causing rapid depolarisation and cell death. (Inactivated by pulmonary surfactant — not for pneumonia.)',
      effect: 'bactericidal',
      color: '#63e6be',
    },
    {
      id: 'sa-aminoglycoside',
      drugClass: 'Aminoglycosides',
      examples: ['Gentamicin', 'Tobramycin'],
      targetStructureId: 'sa-ribosomes',
      siteLabel: '30S subunit',
      mechanism:
        'Bind the 30S subunit, causing mRNA misreading and blocking translocation. Uptake is oxygen-dependent; often paired with a cell-wall agent for synergy.',
      effect: 'bactericidal',
      color: '#ffa94d',
    },
    {
      id: 'sa-macrolide',
      drugClass: 'Macrolides / Lincosamides',
      examples: ['Erythromycin', 'Azithromycin', 'Clindamycin'],
      targetStructureId: 'sa-ribosomes',
      siteLabel: '50S subunit (23S rRNA)',
      mechanism:
        'Bind the 50S subunit near the peptide exit tunnel, stalling elongation. Bacteriostatic; subject to inducible MLSb resistance.',
      effect: 'bacteriostatic',
      color: '#ff922b',
    },
    {
      id: 'sa-oxazolidinone',
      drugClass: 'Oxazolidinones',
      examples: ['Linezolid', 'Tedizolid'],
      targetStructureId: 'sa-ribosomes',
      siteLabel: '50S (23S rRNA A-site)',
      mechanism:
        'Bind the 50S subunit and prevent formation of the functional 70S initiation complex. Retain activity against MRSA and VRE.',
      effect: 'bacteriostatic',
      color: '#ffc078',
    },
    {
      id: 'sa-fluoroquinolone',
      drugClass: 'Fluoroquinolones',
      examples: ['Ciprofloxacin', 'Levofloxacin', 'Moxifloxacin'],
      targetStructureId: 'sa-nucleoid',
      siteLabel: 'DNA gyrase / topoisomerase IV',
      mechanism:
        'Trap the enzyme–DNA complex during supercoil management, generating lethal double-strand breaks. Resistance arises quickly via target mutations.',
      effect: 'bactericidal',
      color: '#da77f2',
    },
    {
      id: 'sa-rifamycin',
      drugClass: 'Rifamycins',
      examples: ['Rifampicin'],
      targetStructureId: 'sa-nucleoid',
      siteLabel: 'RNA polymerase (rpoB)',
      mechanism:
        'Bind the β-subunit of RNA polymerase, blocking transcription initiation. Excellent tissue/biofilm penetration but never used alone — resistance emerges in a single step.',
      effect: 'bactericidal',
      color: '#e599f7',
    },
  ],

  resistance: [
    {
      id: 'sa-mecA',
      name: 'PBP2a — altered penicillin-binding protein (MRSA)',
      gene: 'mecA (also mecC)',
      type: 'target-modification',
      defeatsDrugIds: ['sa-betalactam'],
      locusStructureId: 'sa-peptidoglycan',
      description:
        'mecA encodes PBP2a, an alternative transpeptidase with very low affinity for β-lactams. Cross-linking continues even when native PBPs are saturated, so essentially all β-lactams fail — the definition of MRSA.',
      clinicalImpact:
        'Excludes the entire β-lactam class except the anti-MRSA cephalosporins (ceftaroline). Drives use of vancomycin, daptomycin, or linezolid.',
    },
    {
      id: 'sa-blaZ',
      name: 'β-lactamase (penicillinase)',
      gene: 'blaZ',
      type: 'enzymatic-inactivation',
      defeatsDrugIds: ['sa-betalactam'],
      locusStructureId: 'sa-peptidoglycan',
      description:
        'Secreted penicillinase hydrolyses the β-lactam ring of penicillin before it reaches its PBP target. Present in the large majority of S. aureus isolates.',
      clinicalImpact:
        'Renders plain penicillin useless; overcome by penicillinase-stable β-lactams (nafcillin/oxacillin) or β-lactamase inhibitor combinations — unless mecA is also present.',
    },
    {
      id: 'sa-vanA',
      name: 'D-Ala-D-Lac precursor remodelling (VRSA)',
      gene: 'vanA operon',
      type: 'target-modification',
      defeatsDrugIds: ['sa-glycopeptide'],
      locusStructureId: 'sa-peptidoglycan',
      description:
        'The vanA operon (acquired from enterococci via Tn1546) re-terminates peptidoglycan precursors as D-Ala-D-Lac, for which vancomycin has ~1000-fold lower affinity. Rare but fully resistant (VRSA).',
      clinicalImpact:
        'High-level vancomycin resistance; requires alternative agents (linezolid, daptomycin, ceftaroline).',
    },
    {
      id: 'sa-visa',
      name: 'Cell-wall thickening (VISA)',
      type: 'reduced-permeability',
      defeatsDrugIds: ['sa-glycopeptide'],
      locusStructureId: 'sa-peptidoglycan',
      description:
        'Regulatory mutations thicken the wall and increase decoy D-Ala-D-Ala targets, sequestering vancomycin in the periphery before it reaches the septum. Produces intermediate MICs (VISA/hVISA).',
      clinicalImpact:
        'Vancomycin failure despite "susceptible-ish" MICs; often detected only as clinical non-response.',
    },
    {
      id: 'sa-erm',
      name: 'Ribosomal methylation (MLSb)',
      gene: 'erm(A/C)',
      type: 'target-modification',
      defeatsDrugIds: ['sa-macrolide'],
      locusStructureId: 'sa-ribosomes',
      description:
        'erm methyltransferases dimethylate 23S rRNA, reducing binding of macrolides, lincosamides, and streptogramin B. May be constitutive or inducible (detected by the D-test).',
      clinicalImpact:
        'Inducible resistance can emerge on clindamycin therapy; a positive D-test warns against using clindamycin.',
    },
    {
      id: 'sa-mprF',
      name: 'Membrane charge repulsion',
      gene: 'mprF',
      type: 'reduced-permeability',
      defeatsDrugIds: ['sa-lipopeptide'],
      locusStructureId: 'sa-membrane',
      description:
        'Gain-of-function mprF mutations lysinylate membrane phospholipids, making the surface more positively charged and repelling cationic daptomycin.',
      clinicalImpact:
        'Daptomycin non-susceptibility, sometimes co-selected during prolonged vancomycin exposure ("see-saw" effect with β-lactams).',
    },
  ],

  genomics: [
    {
      id: 'sa-gen-sccmec',
      gene: 'mecA',
      variation: 'Acquisition of the SCCmec mobile genetic element',
      effect:
        'Integrates mecA (± additional resistance genes) into the chromosome, producing PBP2a. Different SCCmec types distinguish healthcare- vs community-associated MRSA lineages.',
      treatmentChange:
        'Confirms MRSA → drop all standard β-lactams; treat with vancomycin/daptomycin/linezolid or ceftaroline.',
    },
    {
      id: 'sa-gen-pvl',
      gene: 'lukS/lukF-PV',
      variation: 'Panton-Valentine leukocidin carriage (often CA-MRSA)',
      effect:
        'Encodes a pore-forming leukotoxin associated with severe skin abscesses and necrotising pneumonia.',
      treatmentChange:
        'Favours adding a toxin-suppressing agent (clindamycin or linezolid) alongside definitive therapy.',
    },
    {
      id: 'sa-gen-vanA',
      gene: 'vanA',
      variation: 'Horizontal transfer of the enterococcal vanA operon',
      effect: 'Remodels peptidoglycan termini to D-Ala-D-Lac (VRSA).',
      treatmentChange: 'Vancomycin excluded; use linezolid, daptomycin, or ceftaroline.',
    },
    {
      id: 'sa-gen-rpoB',
      gene: 'rpoB',
      variation: 'Point mutation in the rifampicin-binding pocket',
      effect: 'Abolishes rifampicin binding to RNA polymerase in a single step.',
      treatmentChange:
        'Explains why rifampicin is only ever used in combination (e.g. for prosthetic-device infection), never as monotherapy.',
    },
  ],

  agar: [
    {
      medium: 'Blood agar (5% sheep)',
      appearance: 'Round, smooth, golden-cream colonies with a zone of clear β-haemolysis',
      colonyColor: '#e9c46a',
      mediumColor: '#7c1e2b',
      halo: { color: '#f2d7a0', label: 'β-haemolysis (clearing)' },
      note: 'The species name aureus ("golden") reflects the carotenoid pigment staphyloxanthin, itself an antioxidant virulence factor.',
    },
    {
      medium: 'Mannitol salt agar (MSA)',
      appearance: 'Yellow colonies surrounded by a yellow zone — mannitol fermentation drops the pH',
      colonyColor: '#f4e04d',
      mediumColor: '#e26d5c',
      halo: { color: '#f4e04d', label: 'Acid (yellow) zone' },
      note: 'Selective (7.5% NaCl) and differential. S. epidermidis grows but does not ferment mannitol (stays pink).',
    },
    {
      medium: 'Baird-Parker agar',
      appearance: 'Black, shiny, convex colonies with a clear halo',
      colonyColor: '#1c1c1c',
      mediumColor: '#c9b98a',
      halo: { color: '#efe7cf', label: 'Lecithinase/lipase clearing' },
      note: 'Tellurite reduction (black) plus egg-yolk clearing — a classic confirmatory medium in food microbiology.',
    },
    {
      medium: 'CHROMagar Staph aureus',
      appearance: 'Mauve/rose-pink colonies',
      colonyColor: '#c86b98',
      mediumColor: '#d8cfc4',
      note: 'Chromogenic substrate cleavage gives a species-specific colour for rapid screening.',
    },
  ],

  gramStain: {
    category: 'gram-positive',
    resultColor: '#5b2a86',
    microscopyAppearance: 'Purple cocci in grape-like clusters',
    explanation:
      'The thick peptidoglycan wall dehydrates and traps the crystal violet–iodine complex during alcohol decolourisation, so the cells stay purple (Gram-positive).',
  },
};
