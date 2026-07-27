import type { Organism, GramCategory } from '@/types/content';
import { staphylococcusAureus } from './staphylococcus-aureus';
import { escherichiaColi } from './escherichia-coli';
import { mycobacteriumTuberculosis } from './mycobacterium-tuberculosis';
import { mycoplasmaPneumoniae } from './mycoplasma-pneumoniae';
import { vibrioCholerae } from './vibrio-cholerae';
import { helicobacterPylori } from './helicobacter-pylori';
import { haemophilusInfluenzae } from './haemophilus-influenzae';
import { borreliaBurgdorferi } from './borrelia-burgdorferi';

/**
 * Central organism registry. Add a new organism by importing its data object and
 * appending it here — every module (structure explorer, gram staining, compare)
 * picks it up automatically.
 */
export const organisms: Organism[] = [
  staphylococcusAureus,
  escherichiaColi,
  vibrioCholerae,
  helicobacterPylori,
  haemophilusInfluenzae,
  mycobacteriumTuberculosis,
  mycoplasmaPneumoniae,
  borreliaBurgdorferi,
];

export function getOrganism(id: string | null): Organism | undefined {
  if (!id) return undefined;
  return organisms.find((o) => o.id === id);
}

export function organismsByCategory(category: GramCategory): Organism[] {
  return organisms.filter((o) => o.gramCategory === category);
}

export const gramCategoryMeta: Record<
  GramCategory,
  { label: string; color: string; blurb: string }
> = {
  'gram-positive': {
    label: 'Gram-positive',
    color: '#7c4dff',
    blurb: 'Thick peptidoglycan retains crystal violet → purple.',
  },
  'gram-negative': {
    label: 'Gram-negative',
    color: '#e05780',
    blurb: 'Thin wall + outer membrane → decolourises → pink.',
  },
  'acid-fast': {
    label: 'Acid-fast',
    color: '#e8590c',
    blurb: 'Waxy mycolic acids → red on Ziehl-Neelsen.',
  },
  'non-staining': {
    label: 'Non-staining / atypical',
    color: '#868e96',
    blurb: 'No wall or intracellular → not seen on Gram stain.',
  },
};
