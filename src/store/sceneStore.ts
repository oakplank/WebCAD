import { create } from 'zustand';
import { SceneState, SceneObject, ViewMode, HistoryState } from '../types/scene.types';

const MAX_HISTORY = 5;

const addToHistory = (state: HistoryState, history: HistoryState[], currentIndex: number) => {
  const newHistory = history.slice(0, currentIndex + 1);
  newHistory.push(state);
  if (newHistory.length > MAX_HISTORY) {
    newHistory.shift();
  }
  return newHistory;
};

export const useSceneStore = create<SceneState>((set, get) => ({
  objects: [],
  selectedObjectId: null,
  viewMode: 'shaded',
  history: [{ objects: [], selectedObjectId: null }],
  currentHistoryIndex: 0,
  
  addObject: (object) => set((state) => {
    const newObjects = [...state.objects, { 
      ...object, 
      id: crypto.randomUUID(),
      name: `${object.type}_${state.objects.length + 1}`,
      visible: true
    }];
    const newState = { objects: newObjects, selectedObjectId: state.selectedObjectId };
    const newHistory = addToHistory(newState, state.history, state.currentHistoryIndex);
    return {
      ...newState,
      history: newHistory,
      currentHistoryIndex: newHistory.length - 1
    };
  }),
  
  removeObject: (id) => set((state) => {
    const newObjects = state.objects.filter(obj => obj.id !== id);
    const newSelectedId = state.selectedObjectId === id ? null : state.selectedObjectId;
    const newState = { objects: newObjects, selectedObjectId: newSelectedId };
    const newHistory = addToHistory(newState, state.history, state.currentHistoryIndex);
    return {
      ...newState,
      history: newHistory,
      currentHistoryIndex: newHistory.length - 1
    };
  }),
  
  updateObject: (id, updates) => set((state) => {
    const newObjects = state.objects.map(obj => 
      obj.id === id ? { ...obj, ...updates } : obj
    );
    const newState = { objects: newObjects, selectedObjectId: state.selectedObjectId };
    const newHistory = addToHistory(newState, state.history, state.currentHistoryIndex);
    return {
      ...newState,
      history: newHistory,
      currentHistoryIndex: newHistory.length - 1
    };
  }),
  
  setSelectedObject: (id) => set({ selectedObjectId: id }),

  duplicateObject: (id) => set((state) => {
    const objectToDuplicate = state.objects.find(obj => obj.id === id);
    if (!objectToDuplicate) return state;

    const newObject = {
      ...objectToDuplicate,
      id: crypto.randomUUID(),
      name: `${objectToDuplicate.name}_copy`,
      position: [...objectToDuplicate.position] as [number, number, number]
    };

    const newObjects = [...state.objects, newObject];
    const newState = { objects: newObjects, selectedObjectId: state.selectedObjectId };
    const newHistory = addToHistory(newState, state.history, state.currentHistoryIndex);
    return {
      ...newState,
      history: newHistory,
      currentHistoryIndex: newHistory.length - 1
    };
  }),

  setViewMode: (mode: ViewMode) => set({ viewMode: mode }),

  undo: () => set((state) => {
    if (state.currentHistoryIndex > 0) {
      const newIndex = state.currentHistoryIndex - 1;
      const previousState = state.history[newIndex];
      return {
        ...previousState,
        history: state.history,
        currentHistoryIndex: newIndex,
        viewMode: state.viewMode
      };
    }
    return state;
  }),

  redo: () => set((state) => {
    if (state.currentHistoryIndex < state.history.length - 1) {
      const newIndex = state.currentHistoryIndex + 1;
      const nextState = state.history[newIndex];
      return {
        ...nextState,
        history: state.history,
        currentHistoryIndex: newIndex,
        viewMode: state.viewMode
      };
    }
    return state;
  }),

  canUndo: () => get().currentHistoryIndex > 0,
  canRedo: () => get().currentHistoryIndex < get().history.length - 1,
})); 