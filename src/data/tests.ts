import type { Haemolysis, TestId, TestOutcome } from '@/types/content';

/**
 * The bench tests that sit between a Gram result and a species.
 *
 * A stain and an arrangement narrow the field to a genus at best: "Gram-positive
 * cocci in clusters" is as far as microscopy gets you, and everything after that
 * is biochemistry. The app previously stopped at the stain, which left the most
 * commonly examined step in diagnostic microbiology missing entirely.
 *
 * Tests are defined once and organisms carry only their results, because the
 * chemistry of catalase does not change from organism to organism — only the
 * answer does.
 */
export interface TestDefinition {
  id: TestId;
  name: string;
  /** The question the test is actually asking. */
  question: string;
  /** How it works — the reaction you are reading. */
  principle: string;
  /** What a positive and a negative look like on the bench. */
  reads: { positive: string; negative: string };
  /** The separation it is classically used to make. */
  discriminates: string;
}

export const testDefinitions: TestDefinition[] = [
  {
    id: 'catalase',
    name: 'Catalase',
    question: 'Does the organism break down hydrogen peroxide?',
    principle:
      'Catalase converts hydrogen peroxide to water and oxygen. A colony mixed with 3% H₂O₂ on a slide fizzes visibly as oxygen comes off.',
    reads: { positive: 'Immediate brisk bubbling', negative: 'No bubbles' },
    discriminates:
      'The first split among Gram-positive cocci: staphylococci and micrococci are positive, streptococci and enterococci negative.',
  },
  {
    id: 'coagulase',
    name: 'Coagulase',
    question: 'Does it clot plasma?',
    principle:
      'Coagulase converts fibrinogen to fibrin, walling the organism off inside a clot. The slide test detects bound clumping factor; the tube test detects free coagulase.',
    reads: { positive: 'Plasma clots (tube) or cells clump (slide)', negative: 'Plasma stays fluid' },
    discriminates:
      'Separates S. aureus from every other staphylococcus — the single test that decides whether a Gram-positive coccus in clusters is the pathogen or a skin commensal.',
  },
  {
    id: 'oxidase',
    name: 'Oxidase',
    question: 'Does it have cytochrome c oxidase?',
    principle:
      'A reagent-soaked strip is oxidised by cytochrome c oxidase to a dark purple compound within seconds.',
    reads: { positive: 'Deep purple within 10–30 s', negative: 'No colour change' },
    discriminates:
      'Splits the Gram-negative rods: the Enterobacterales are uniformly negative, while Pseudomonas, Vibrio, Helicobacter, Campylobacter and Neisseria are positive.',
  },
  {
    id: 'urease',
    name: 'Urease',
    question: 'Does it hydrolyse urea?',
    principle:
      'Urease splits urea into ammonia and carbon dioxide. The ammonia raises the pH, turning the phenol red indicator from amber to bright pink.',
    reads: { positive: 'Medium turns pink', negative: 'Medium stays amber' },
    discriminates:
      'Strongly positive in H. pylori, which uses it to neutralise stomach acid around itself — the basis of both the breath test and the rapid urease test on biopsy.',
  },
  {
    id: 'indole',
    name: 'Indole',
    question: 'Does it split tryptophan?',
    principle:
      'Tryptophanase releases indole from tryptophan; Kovács reagent then forms a red ring at the surface.',
    reads: { positive: 'Red ring on adding reagent', negative: 'Reagent layer stays yellow' },
    discriminates:
      'Separates E. coli (positive) from Klebsiella and Enterobacter (negative) among the lactose-fermenting Gram-negative rods.',
  },
  {
    id: 'lactose',
    name: 'Lactose fermentation',
    question: 'Does it ferment lactose?',
    principle:
      'On MacConkey agar, acid from lactose fermentation drops the pH and turns the neutral red indicator — and the colony — pink.',
    reads: { positive: 'Pink colonies on MacConkey', negative: 'Pale, colourless colonies' },
    discriminates:
      'The first branch among enteric Gram-negative rods: E. coli and Klebsiella ferment lactose, Salmonella and Shigella do not.',
  },
  {
    id: 'motility',
    name: 'Motility',
    question: 'Can it swim?',
    principle:
      'Stabbed into semi-solid agar, a motile organism spreads out from the stab line as a diffuse haze; a non-motile one grows only along it.',
    reads: { positive: 'Diffuse growth away from the stab', negative: 'Growth confined to the stab line' },
    discriminates:
      'Non-motility is itself a clue: Klebsiella and B. anthracis are notably non-motile where their close relatives are not.',
  },
  {
    id: 'optochin',
    name: 'Optochin susceptibility',
    question: 'Is growth inhibited by optochin?',
    principle:
      'Optochin selectively lyses pneumococci by disrupting their membrane ATPase. A disk on blood agar produces a zone of no growth.',
    reads: { positive: 'Zone of inhibition ≥14 mm (susceptible)', negative: 'Growth up to the disk (resistant)' },
    discriminates:
      'Separates S. pneumoniae from the viridans streptococci, which look identical and share its alpha-haemolysis.',
  },
  {
    id: 'bacitracin',
    name: 'Bacitracin susceptibility',
    question: 'Is growth inhibited by low-dose bacitracin?',
    principle: 'A 0.04 U disk on blood agar; group A streptococci are uniquely susceptible at this dose.',
    reads: { positive: 'Any zone of inhibition (susceptible)', negative: 'Growth up to the disk' },
    discriminates:
      'Presumptively identifies S. pyogenes among the beta-haemolytic streptococci.',
  },
];

export function getTest(id: TestId): TestDefinition | undefined {
  return testDefinitions.find((t) => t.id === id);
}

export const OUTCOME_LABEL: Record<TestOutcome, string> = {
  positive: 'Positive',
  negative: 'Negative',
  variable: 'Variable',
  'not-applicable': 'Not applicable',
};

export const OUTCOME_COLOR: Record<TestOutcome, string> = {
  positive: '#4fd18b',
  negative: '#e05780',
  variable: '#e8b84d',
  'not-applicable': '#5c6478',
};

/**
 * Haemolysis is read off the blood agar plate rather than from a reagent, but it
 * belongs with the tests: it is the branch that comes immediately after catalase
 * for the streptococci, and it is the reason blood agar is a routine plate.
 */
export const HAEMOLYSIS_INFO: Record<Haemolysis, { label: string; detail: string; color: string }> = {
  alpha: {
    label: 'Alpha (partial, green)',
    detail:
      'Hydrogen peroxide partially oxidises haemoglobin to green methaemoglobin, leaving a hazy green zone. Seen with S. pneumoniae and the viridans streptococci.',
    color: '#6f8f5a',
  },
  beta: {
    label: 'Beta (complete, clear)',
    detail:
      'Haemolysins lyse red cells outright, clearing the agar to transparency around each colony. Seen with S. pyogenes and S. aureus.',
    color: '#f6efdc',
  },
  gamma: {
    label: 'Gamma (none)',
    detail:
      'No lysis and no colour change — the agar under and around the colony is unaltered. "Gamma-haemolytic" is a conventional way of saying non-haemolytic.',
    color: '#8d5a5a',
  },
  'not-applicable': {
    label: 'Not assessed',
    detail:
      'This organism is not routinely grown on blood agar, so haemolysis is not part of its identification.',
    color: '#5c6478',
  },
};
