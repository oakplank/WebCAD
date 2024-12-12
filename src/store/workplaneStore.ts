import { create } from 'zustand';
import { Workplane, WorkplaneType } from '../types/workplane.types';

interface WorkplaneState {
  workplanes: Workplane[];
  activeWorkplaneId: string | null;
  addWorkplane: (type: WorkplaneType, options?: Partial<Workplane>) => void;
  removeWorkplane: (id: string) => void;
  setActiveWorkplane: (id: string | null) => void;
  toggleWorkplaneVisibility: (id: string) => void;
  updateWorkplane: (id: string, updates: Partial<Workplane>) => void;
}

const DEFAULT_WORKPLANES: Record<WorkplaneType, Partial<Workplane>> = {
  XY: {
    name: 'Front',
    normal: [0, 0, 1],
    up: [0, 1, 0],
    origin: [0, 0, 0],
    isReference: true,
    size: 5, // smaller size for reference planes
    color: '#0000ff'
  },
  YZ: {
    name: 'Right',
    normal: [1, 0, 0],
    up: [0, 1, 0],
    origin: [0, 0, 0],
    isReference: true,
    size: 5,
    color: '#ff0000'
  },
  XZ: {
    name: 'Top',
    normal: [0, 1, 0],
    up: [0, 0, 1],
    origin: [0, 0, 0],
    isReference: true,
    size: 5,
    color: '#00ff00'
  },
  custom: {
    name: 'Custom Plane',
    normal: [0, 0, 1],
    up: [0, 1, 0],
    origin: [0, 0, 0],
    size: 20,
    color: '#666666'
  },
  face: {
    name: 'Face Plane',
    size: 20,
    color: '#666666'
  },
  threePoint: {
    name: 'Three Point Plane',
    size: 20,
    color: '#666666'
  },
  offset: {
    name: 'Offset Plane',
    size: 20,
    color: '#666666'
  }
};

export const useWorkplaneStore = create<WorkplaneState>((set) => ({
  workplanes: [],
  activeWorkplaneId: null,

  addWorkplane: (type, options = {}) => set((state) => {
    const baseWorkplane = DEFAULT_WORKPLANES[type];
    const newWorkplane: Workplane = {
      id: crypto.randomUUID(),
      name: baseWorkplane.name || 'New Workplane',
      origin: baseWorkplane.origin || [0, 0, 0],
      normal: baseWorkplane.normal || [0, 0, 1],
      up: baseWorkplane.up || [0, 1, 0],
      visible: true,
      size: baseWorkplane.size || 20,
      gridSize: 1,
      color: baseWorkplane.color || '#666666',
      isActive: false,
      isReference: baseWorkplane.isReference || false,
      ...options
    };

    return {
      workplanes: [...state.workplanes, newWorkplane]
    };
  }),

  removeWorkplane: (id) => set((state) => ({
    workplanes: state.workplanes.filter((wp) => wp.id !== id),
    activeWorkplaneId: state.activeWorkplaneId === id ? null : state.activeWorkplaneId
  })),

  setActiveWorkplane: (id) => set((state) => ({
    workplanes: state.workplanes.map((wp) => ({
      ...wp,
      isActive: wp.id === id
    })),
    activeWorkplaneId: id
  })),

  toggleWorkplaneVisibility: (id) => set((state) => ({
    workplanes: state.workplanes.map((wp) => 
      wp.id === id ? { ...wp, visible: !wp.visible } : wp
    )
  })),

  updateWorkplane: (id, updates) => set((state) => ({
    workplanes: state.workplanes.map((wp) =>
      wp.id === id ? { ...wp, ...updates } : wp
    )
  }))
}));
