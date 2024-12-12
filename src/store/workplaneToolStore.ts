import { create } from 'zustand';
import * as THREE from 'three';
import { WorkplaneCreationState } from '../types/workplane.types';

interface WorkplaneToolState {
  isActive: boolean;
  creationMethod: 'face' | 'threePoint' | 'offset' | null;
  creationState: WorkplaneCreationState;
  setActive: (active: boolean) => void;
  setCreationMethod: (method: 'face' | 'threePoint' | 'offset' | null) => void;
  updateCreationState: (updates: Partial<WorkplaneCreationState>) => void;
  reset: () => void;
}

const initialCreationState: WorkplaneCreationState = {
  mode: 'none',
  pointsCollected: [],
  offset: 0,
  angle: 0
};

export const useWorkplaneToolStore = create<WorkplaneToolState>((set) => ({
  isActive: false,
  creationMethod: null,
  creationState: initialCreationState,

  setActive: (active) => set({ isActive: active }),
  
  setCreationMethod: (method) => set((state) => ({
    creationMethod: method,
    creationState: {
      ...initialCreationState,
      mode: method === 'face' ? 'selecting-face' :
            method === 'threePoint' ? 'selecting-points' :
            method === 'offset' ? 'selecting-reference' : 'none'
    }
  })),

  updateCreationState: (updates) => set((state) => ({
    creationState: { ...state.creationState, ...updates }
  })),

  reset: () => set({
    isActive: false,
    creationMethod: null,
    creationState: initialCreationState
  })
}));
