import type { Organism } from '@/types/content';

/**
 * DEEP entry — Klebsiella pneumoniae.
 *
 * The plasmid/β-lactamase exemplar. Where S. aureus teaches target modification
 * (PBP2a), this entry teaches the Gram-negative resistance story: a chromosomal
 * β-lactamase, inducible AmpC, plasmid-borne ESBLs and carbapenemases, porin
 * loss, and how each one moves the treatment goalposts.
 */
export const klebsiellaPneumoniae: Organism = {
  id: 'klebsiella-pneumoniae',
  name: 'Klebsiella pneumoniae',
  shortName: 'K. pneumoniae',
  gramCategory: 'gram-negative',
  morphology: 'Plump, non-motile Gram-negative bacilli with a prominent capsule',
  arrangement: 'single',
  body: { kind: 'bacillus', sizeUm: 2.5, radius: 1.35, length: 3.6 },
  clinicalNote:
    'A leading cause of hospital-acquired pneumonia, UTI, and bacteraemia, and the organism in which carbapenem resistance (KPC) first became a global crisis. Hypervirulent strains also cause liver abscess in the community.',
  depth: 'deep',

  tests: { catalase: 'positive', oxidase: 'negative', urease: 'positive', indole: 'negative', lactose: 'positive', motility: 'negative' },
  haemolysis: 'gamma',

  structures: [
    {
      id: 'kp-capsule',
      name: 'Thick polysaccharide capsule',
      shortLabel: 'Capsule',
      group: 'surface',
      kind: 'capsule',
      color: '#7fd3ff',
      summary: 'A luxuriant capsule — the reason Klebsiella colonies look mucoid and string.',
      description:
        'Klebsiella produces an unusually thick polysaccharide capsule that blocks complement deposition and phagocytosis and gives the classic mucoid, glistening colony. Hypervirulent lineages (often K1/K2, rmpA-positive) overproduce it to the point that a colony can be drawn into a string several millimetres long — the positive "string test".',
      clinicalRelevance:
        'Drives invasive disease and the hypervirulent liver-abscess syndrome; also impedes antibody-mediated clearance.',
      geometry: { radius: 1.62, opacity: 0.18, glow: 0.15 },
      clickable: true,
    },
    {
      id: 'kp-outer-membrane',
      name: 'Outer membrane & porins (OmpK35/36)',
      shortLabel: 'Outer membrane',
      group: 'envelope',
      kind: 'outer-membrane',
      color: '#8e9bff',
      summary: 'The permeability barrier — and, when its porins are lost, a resistance mechanism.',
      description:
        'The outer membrane admits hydrophilic drugs only through porin channels, chiefly OmpK35 and OmpK36. Losing or narrowing these porins throttles how much β-lactam reaches the periplasm. On its own that raises MICs modestly; combined with a β-lactamase it can push an isolate all the way to carbapenem resistance.',
      clinicalRelevance:
        'Porin loss plus an ESBL or AmpC can produce carbapenem resistance with NO carbapenemase gene — a resistance pattern that molecular tests will miss.',
      geometry: { radius: 1.28, thickness: 0.14 },
      clickable: true,
    },
    {
      id: 'kp-lps',
      name: 'Lipopolysaccharide (endotoxin)',
      shortLabel: 'LPS',
      group: 'surface',
      kind: 'lps',
      color: '#ffb4a2',
      summary: 'Lipid A drives septic shock; its modification defeats colistin.',
      description:
        'Lipid A anchors LPS in the outer leaflet and is the endotoxin behind Gram-negative septic shock. It is also the binding site for polymyxins, so modifying its charge is how Klebsiella escapes last-line colistin.',
      clinicalRelevance:
        'mgrB inactivation (very common in K. pneumoniae) adds phosphoethanolamine to lipid A and confers colistin resistance.',
      geometry: { count: 90, radius: 1.44, glow: 0.2 },
      drugTargetIds: ['kp-polymyxin'],
      clickable: true,
    },
    {
      id: 'kp-periplasm',
      name: 'Periplasm & peptidoglycan',
      shortLabel: 'Periplasm / wall',
      group: 'envelope',
      kind: 'peptidoglycan',
      color: '#f0b64d',
      summary: 'Thin wall in the compartment where β-lactamases lie in wait.',
      description:
        'A thin peptidoglycan layer sits in the periplasmic space between the two membranes. Crucially, this is also where β-lactamases accumulate — so a β-lactam that has just crossed a porin meets the enzyme before it ever reaches its PBP target. Concentrating the defence in a small compartment is what makes Gram-negative β-lactamases so effective.',
      clinicalRelevance:
        'The interplay of porin entry versus periplasmic hydrolysis decides whether a β-lactam works.',
      geometry: { radius: 1.08, thickness: 0.11 },
      drugTargetIds: ['kp-betalactam', 'kp-carbapenem'],
      clickable: true,
    },
    {
      id: 'kp-membrane',
      name: 'Inner membrane',
      shortLabel: 'Inner membrane',
      group: 'envelope',
      kind: 'cell-membrane',
      color: '#5cd6a8',
      summary: 'Respiration, transport, and the efflux pumps that expel drugs.',
      description:
        'The inner membrane carries respiration and transport, and anchors RND-family efflux pumps (AcrAB-TolC) that span the whole envelope to expel drugs back out of the cell.',
      geometry: { radius: 0.94, thickness: 0.12 },
      clickable: true,
    },
    {
      id: 'kp-nucleoid',
      name: 'Nucleoid (supercoiled chromosome)',
      shortLabel: 'Nucleoid',
      group: 'internal',
      kind: 'nucleoid',
      color: '#c58bff',
      summary: 'The closed circular chromosome — and the home of the ampC gene.',
      description:
        'A single supercoiled circular chromosome. Beyond housekeeping genes it carries the chromosomal β-lactamase blaSHV (intrinsic to K. pneumoniae) and, in the wider Enterobacterales, the inducible ampC system whose regulation is described below.',
      clinicalRelevance:
        'Chromosomal resistance is inherited vertically and cannot be lost the way a plasmid can — it defines the species\' baseline susceptibility.',
      geometry: { radius: 0.56 },
      drugTargetIds: ['kp-fluoroquinolone'],
      clickable: true,
    },
    {
      id: 'kp-plasmids',
      name: 'Resistance plasmids',
      shortLabel: 'Plasmids',
      group: 'internal',
      kind: 'plasmid',
      color: '#ff9ad5',
      summary: 'Independent DNA circles carrying ESBL and carbapenemase genes between cells.',
      description:
        'Plasmids are closed DNA circles that replicate independently of the chromosome. Conjugative plasmids build a pilus and copy themselves into a neighbouring cell, so resistance spreads horizontally — between strains and across species — in hours rather than generations. K. pneumoniae is the archetypal plasmid reservoir: a single plasmid often carries blaCTX-M plus blaKPC plus aminoglycoside and sulfonamide genes together, so one transfer confers resistance to several classes at once.',
      clinicalRelevance:
        'This is why an outbreak strain can appear resistant to everything at once, and why infection control targets the plasmid as much as the organism.',
      geometry: { count: 3, radius: 0.3 },
      clickable: true,
    },
    {
      id: 'kp-ribosomes',
      name: 'Ribosomes (70S)',
      shortLabel: 'Ribosomes',
      group: 'internal',
      kind: 'ribosomes',
      color: '#ffd166',
      summary: 'Aminoglycoside target; defeated by plasmid-borne modifying enzymes.',
      description:
        'The 30S subunit is the aminoglycoside target. Plasmid-encoded aminoglycoside-modifying enzymes and 16S rRNA methyltransferases (armA, rmtB) travel alongside β-lactamase genes on the same elements.',
      geometry: { count: 85, radius: 0.66 },
      drugTargetIds: ['kp-aminoglycoside'],
      clickable: true,
    },
  ],

  antibiotics: [
    {
      id: 'kp-betalactam',
      drugClass: 'Penicillins & cephalosporins',
      examples: ['Amoxicillin-clavulanate', 'Ceftriaxone', 'Ceftazidime', 'Piperacillin-tazobactam'],
      targetStructureId: 'kp-periplasm',
      siteLabel: 'PBP transpeptidase',
      mechanism:
        'Block PBP-catalysed cross-linking of peptidoglycan. They must first cross a porin and then survive the periplasm — which is exactly where β-lactamases are waiting.',
      effect: 'bactericidal',
      color: '#4dabf7',
    },
    {
      id: 'kp-carbapenem',
      drugClass: 'Carbapenems',
      examples: ['Meropenem', 'Ertapenem', 'Imipenem'],
      targetStructureId: 'kp-periplasm',
      siteLabel: 'PBP transpeptidase',
      mechanism:
        'The most β-lactamase-stable β-lactams: they resist ESBLs and AmpC, which is why they became the reference treatment for ESBL infection — until carbapenemases appeared.',
      effect: 'bactericidal',
      color: '#63e6be',
    },
    {
      id: 'kp-newbl',
      drugClass: 'β-lactam / β-lactamase-inhibitor combinations',
      examples: ['Ceftazidime-avibactam', 'Meropenem-vaborbactam', 'Ceftolozane-tazobactam'],
      targetStructureId: 'kp-periplasm',
      siteLabel: 'β-lactamase + PBP',
      mechanism:
        'The inhibitor disables the β-lactamase so its partner β-lactam survives the periplasm and reaches the PBPs. Avibactam covers KPC and OXA-48 as well as ESBL/AmpC — but not the metallo-enzymes (NDM).',
      effect: 'bactericidal',
      color: '#9775fa',
    },
    {
      id: 'kp-aminoglycoside',
      drugClass: 'Aminoglycosides',
      examples: ['Gentamicin', 'Amikacin', 'Plazomicin'],
      targetStructureId: 'kp-ribosomes',
      siteLabel: '30S subunit',
      mechanism: 'Bind the 30S subunit, causing misreading and blocking translocation.',
      effect: 'bactericidal',
      color: '#ffa94d',
    },
    {
      id: 'kp-fluoroquinolone',
      drugClass: 'Fluoroquinolones',
      examples: ['Ciprofloxacin', 'Levofloxacin'],
      targetStructureId: 'kp-nucleoid',
      siteLabel: 'DNA gyrase / topoisomerase IV',
      mechanism:
        'Trap the gyrase–DNA complex that manages chromosomal supercoiling, producing lethal double-strand breaks.',
      effect: 'bactericidal',
      color: '#da77f2',
    },
    {
      id: 'kp-polymyxin',
      drugClass: 'Polymyxins',
      examples: ['Colistin', 'Polymyxin B'],
      targetStructureId: 'kp-lps',
      siteLabel: 'Lipid A of LPS',
      mechanism:
        'Cationic binding to the negatively charged lipid A disrupts the outer membrane. A toxic last-line agent reserved for extensively resistant isolates.',
      effect: 'bactericidal',
      color: '#f783ac',
    },
  ],

  resistance: [
    {
      id: 'kp-ampc',
      name: 'Inducible AmpC β-lactamase',
      gene: 'ampC (with ampR, ampD, ampG)',
      type: 'enzymatic-inactivation',
      defeatsDrugIds: ['kp-betalactam'],
      locusStructureId: 'kp-periplasm',
      description:
        'AmpC is a cephalosporinase whose expression is wired to cell-wall recycling. Normally ampC is nearly silent. When a β-lactam damages the wall, muropeptide fragments returning through AmpG accumulate, displace UDP-MurNAc-pentapeptide from the regulator AmpR, and flip AmpR from repressor to activator — inducing AmpC. Strong inducers that are themselves stable (cefoxitin, imipenem) reveal the enzyme; weaker inducers that are NOT stable (ceftriaxone, ceftazidime, piperacillin) are destroyed by it. A single mutation in ampD then locks the system permanently on ("stable derepression"), so the enzyme is made at high level all the time.',
      clinicalImpact:
        'An isolate can test susceptible to a third-generation cephalosporin, then fail on treatment as AmpC is induced or a derepressed mutant is selected. Classic in Enterobacter, Citrobacter freundii, Serratia and Hafnia; also acquired by K. pneumoniae on plasmids (blaDHA, blaCMY). Avoid third-generation cephalosporins for serious infection — use cefepime or a carbapenem.',
    },
    {
      id: 'kp-esbl',
      name: 'Extended-spectrum β-lactamase (ESBL)',
      gene: 'blaCTX-M-15, blaSHV-12',
      type: 'enzymatic-inactivation',
      defeatsDrugIds: ['kp-betalactam'],
      locusStructureId: 'kp-plasmids',
      description:
        'Plasmid-borne enzymes that hydrolyse penicillins and the oxyimino-cephalosporins (ceftriaxone, ceftazidime, cefepime). Unlike AmpC they ARE inhibited by clavulanate/tazobactam/avibactam — the basis of the confirmatory test.',
      clinicalImpact:
        'Forces a carbapenem (or a newer inhibitor combination) for serious infection. Now endemic worldwide, largely on the same plasmids as other resistance genes.',
    },
    {
      id: 'kp-kpc',
      name: 'KPC carbapenemase',
      gene: 'blaKPC (on Tn4401)',
      type: 'enzymatic-inactivation',
      defeatsDrugIds: ['kp-betalactam', 'kp-carbapenem'],
      locusStructureId: 'kp-plasmids',
      description:
        'A serine carbapenemase, first described in K. pneumoniae, carried on a transposon that hops between plasmids. It hydrolyses essentially all β-lactams including carbapenems, but is inhibited by avibactam and vaborbactam.',
      clinicalImpact:
        'Defines carbapenem-resistant K. pneumoniae (CRKP). Treat with ceftazidime-avibactam or meropenem-vaborbactam — a rare case where knowing the enzyme class directly picks the drug.',
    },
    {
      id: 'kp-ndm',
      name: 'NDM metallo-β-lactamase',
      gene: 'blaNDM-1',
      type: 'enzymatic-inactivation',
      defeatsDrugIds: ['kp-betalactam', 'kp-carbapenem', 'kp-newbl'],
      locusStructureId: 'kp-plasmids',
      description:
        'A zinc-dependent enzyme that hydrolyses nearly all β-lactams. Because it uses a metal ion rather than a serine, the serine-directed inhibitors (clavulanate, avibactam, vaborbactam) do not touch it. Aztreonam is stable to metallo-enzymes but is usually destroyed by co-carried ESBLs — hence aztreonam PLUS avibactam.',
      clinicalImpact:
        'The hardest phenotype to treat: options narrow to cefiderocol or aztreonam-avibactam. Distinguishing NDM from KPC changes the whole regimen.',
    },
    {
      id: 'kp-porin',
      name: 'Porin loss',
      gene: 'ompK35 / ompK36',
      type: 'porin-loss',
      defeatsDrugIds: ['kp-carbapenem'],
      locusStructureId: 'kp-outer-membrane',
      description:
        'Disruption of OmpK35/36 restricts drug entry. Alone it is modest; combined with an ESBL or AmpC it produces carbapenem resistance without any carbapenemase gene at all.',
      clinicalImpact:
        'Produces carbapenem-resistant isolates that are PCR-negative for carbapenemases — phenotype and genotype disagree, and the phenotype wins.',
    },
    {
      id: 'kp-mgrb',
      name: 'Colistin resistance',
      gene: 'mgrB inactivation (or mcr-1)',
      type: 'target-modification',
      defeatsDrugIds: ['kp-polymyxin'],
      locusStructureId: 'kp-lps',
      description:
        'Loss of the mgrB regulator de-represses PhoPQ, adding phosphoethanolamine/aminoarabinose to lipid A and reducing its negative charge so colistin no longer binds. The plasmid-borne mcr-1 gene achieves the same modification transferably.',
      clinicalImpact:
        'Removes the last-line agent, often emerging during colistin therapy for a carbapenem-resistant isolate.',
    },
  ],

  genomics: [
    {
      id: 'kp-gen-ampc-derepress',
      gene: 'ampD',
      variation: 'Loss-of-function mutation de-repressing ampC',
      effect:
        'The induction circuit locks on, so AmpC is produced constitutively at high level instead of only when provoked.',
      treatmentChange:
        'Explains treatment-emergent resistance: a cephalosporin-susceptible isolate becomes resistant mid-course. Switch to cefepime or a carbapenem rather than a third-generation cephalosporin.',
    },
    {
      id: 'kp-gen-plasmid',
      gene: 'blaCTX-M + blaKPC + armA',
      variation: 'Co-carriage of several resistance genes on one conjugative plasmid',
      effect:
        'A single transfer event hands the recipient resistance to cephalosporins, carbapenems, and aminoglycosides together.',
      treatmentChange:
        'Empiric cover must assume the whole package; definitive therapy waits on the carbapenemase class.',
    },
    {
      id: 'kp-gen-st258',
      gene: 'ST258 lineage',
      variation: 'Global spread of a high-risk clone carrying blaKPC',
      effect: 'A successful clonal background that maintains and disseminates carbapenemase plasmids.',
      treatmentChange:
        'Drives infection-control policy (screening, isolation) as much as antibiotic choice.',
    },
    {
      id: 'kp-gen-hvkp',
      gene: 'rmpA/rmpA2 (hypervirulence plasmid)',
      variation: 'Acquisition of a virulence plasmid causing capsule hyperproduction',
      effect: 'Hypervirulent Klebsiella — community liver abscess, endophthalmitis, meningitis.',
      treatmentChange:
        'Usually still antibiotic-susceptible, but needs source control/drainage; convergence of hypervirulence with KPC plasmids is an emerging threat.',
    },
  ],

  agar: [
    {
      medium: 'MacConkey agar',
      appearance: 'Large, domed, intensely pink and glistening mucoid colonies that may coalesce',
      colonyColor: '#e0699a',
      mediumColor: '#e7b7c4',
      halo: { color: '#cf5f8b', label: 'Bile precipitation' },
      note: 'A strong lactose fermenter. The mucoid, almost dripping appearance from the capsule distinguishes it from E. coli.',
    },
    {
      medium: 'Blood agar',
      appearance: 'Grey-white, very mucoid, non-haemolytic colonies; string test positive',
      colonyColor: '#dcd7c6',
      mediumColor: '#7c1e2b',
      note: 'Touching a hypervirulent colony with a loop and lifting draws a string >5 mm — the bedside marker of hypercapsulation.',
    },
    {
      medium: 'CHROMagar / chromogenic',
      appearance: 'Metallic blue colonies',
      colonyColor: '#4a7fc1',
      mediumColor: '#d8cfc4',
      note: 'Chromogenic media speed up separation of Klebsiella from other Enterobacterales in screening.',
    },
    {
      medium: 'Carbapenemase screening agar',
      appearance: 'Growth on a meropenem-containing selective plate',
      colonyColor: '#c96f8f',
      mediumColor: '#b9c9a8',
      note: 'Used for CPE surveillance; growth flags a carbapenem-resistant isolate for confirmatory enzyme typing.',
    },
  ],

  gramStain: {
    category: 'gram-negative',
    resultColor: '#d6547f',
    microscopyAppearance: 'Pink, plump bacilli, often with a clear halo of unstained capsule',
    explanation:
      'The thin peptidoglycan cannot retain crystal violet after decolourisation, so the cells take the pink safranin counterstain. The capsule does not take up either dye and can appear as a clear zone around the cell.',
  },
};
