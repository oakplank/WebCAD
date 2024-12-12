import { create } from 'zustand';
import { Face } from '../types/scene.types';

interface ModifyState {
  mode: 'none' | 'measure' | 'align';
  selectedFace1: Face | null;
  selectedFace2: Face | null;
  measurementResult: number | null;
  setMode: (mode: 'none' | 'measure' | 'align') => void;
  setSelectedFace1: (face: Face | null) => void;
  setSelectedFace2: (face: Face | null) => void;
  setMeasurementResult: (result: number | null) => void;
  clearSelection: () => void;
  reset: () => void;
}

export const useModifyStore = create<ModifyState>((set) => ({
  mode: 'none',
  selectedFace1: null,
  selectedFace2: null,
  measurementResult: null,

  setMode: (mode) => set({ mode }),
  
  setSelectedFace1: (face) => set((state) => {
    if (state.mode === 'none') return state;
    return { selectedFace1: face };
  }),
  
  setSelectedFace2: (face) => set((state) => {
    if (state.mode === 'none') return state;
    return { selectedFace2: face };
  }),
  
  setMeasurementResult: (result) => set({ measurementResult: result }),
  
  clearSelection: () => set({
    selectedFace1: null,
    selectedFace2: null,
    measurementResult: null
  }),

  reset: () => set({
    mode: 'none',
    selectedFace1: null,
    selectedFace2: null,
    measurementResult: null
  })
}));
