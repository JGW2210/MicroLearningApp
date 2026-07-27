import { create } from 'zustand';

export type ModuleId = 'home' | 'structure' | 'gram';

/** Which teaching overlay is active on the 3D cell. */
export type OverlayMode = 'none' | 'antibiotics' | 'resistance';

interface AppState {
  module: ModuleId;
  organismId: string | null;
  /** Currently focused structure (drives camera zoom + info panel). */
  selectedStructureId: string | null;
  hoveredStructureId: string | null;
  overlay: OverlayMode;
  /** Selected antibiotic/resistance detail id for the info panel. */
  selectedMechanismId: string | null;
  /** Index into the gram-stain walkthrough steps, -1 = not started. */
  gramStep: number;
  /** Compare mode: a second organism to show side-by-side. */
  compareOrganismId: string | null;

  goToModule: (module: ModuleId) => void;
  selectOrganism: (id: string | null) => void;
  selectStructure: (id: string | null) => void;
  hoverStructure: (id: string | null) => void;
  setOverlay: (overlay: OverlayMode) => void;
  selectMechanism: (id: string | null) => void;
  setGramStep: (step: number) => void;
  setCompareOrganism: (id: string | null) => void;
  reset: () => void;
}

export const useStore = create<AppState>((set) => ({
  module: 'home',
  organismId: null,
  selectedStructureId: null,
  hoveredStructureId: null,
  overlay: 'none',
  selectedMechanismId: null,
  gramStep: -1,
  compareOrganismId: null,

  goToModule: (module) =>
    set({
      module,
      selectedStructureId: null,
      selectedMechanismId: null,
      overlay: 'none',
      gramStep: module === 'gram' ? -1 : -1,
    }),
  selectOrganism: (id) =>
    set({
      organismId: id,
      selectedStructureId: null,
      selectedMechanismId: null,
      overlay: 'none',
    }),
  selectStructure: (id) => set({ selectedStructureId: id, selectedMechanismId: null }),
  hoverStructure: (id) => set({ hoveredStructureId: id }),
  setOverlay: (overlay) => set({ overlay, selectedMechanismId: null }),
  selectMechanism: (id) => set({ selectedMechanismId: id }),
  setGramStep: (step) => set({ gramStep: step }),
  setCompareOrganism: (id) => set({ compareOrganismId: id }),
  reset: () =>
    set({
      module: 'home',
      organismId: null,
      selectedStructureId: null,
      hoveredStructureId: null,
      overlay: 'none',
      selectedMechanismId: null,
      gramStep: -1,
      compareOrganismId: null,
    }),
}));
