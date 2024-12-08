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
  selectedObjectIds: [],
  viewMode: 'shaded',
  history: [{ objects: [], selectedObjectIds: [] }],
  currentHistoryIndex: 0,
  hoveredObjectId: null,
  setHoveredObject: (id) => set({ hoveredObjectId: id }),
  
  addObject: (object) => set((state) => {
    const newObjects = [...state.objects, { 
      ...object, 
      id: crypto.randomUUID(),
      name: `${object.type}_${state.objects.length + 1}`,
      visible: true,
      parentId: null,
      children: []
    }];
    const newState = { objects: newObjects, selectedObjectIds: state.selectedObjectIds };
    const newHistory = addToHistory(newState, state.history, state.currentHistoryIndex);
    return {
      ...newState,
      history: newHistory,
      currentHistoryIndex: newHistory.length - 1
    };
  }),
  
  removeObject: (id) => set((state) => {
    const newObjects = state.objects.filter(obj => obj.id !== id);
    const newSelectedIds = state.selectedObjectIds.filter(selectedId => selectedId !== id);
    
    const newState = { 
      objects: newObjects, 
      selectedObjectIds: newSelectedIds
    };
    
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
    const newState = { objects: newObjects, selectedObjectIds: state.selectedObjectIds };
    const newHistory = addToHistory(newState, state.history, state.currentHistoryIndex);
    return {
      ...newState,
      history: newHistory,
      currentHistoryIndex: newHistory.length - 1
    };
  }),
  
  setSelectedObjects: (ids) => set({ selectedObjectIds: ids }),

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
    const newState = { objects: newObjects, selectedObjectIds: state.selectedObjectIds };
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

  setObjects: (objects) => set((state) => {
    const newState = { objects, selectedObjectIds: [] };
    const newHistory = addToHistory(newState, state.history, state.currentHistoryIndex);
    return {
      ...newState,
      history: newHistory,
      currentHistoryIndex: newHistory.length - 1
    };
  }),

  groupObjects: (objectIds) => set((state) => {
    const groupId = crypto.randomUUID();
    const newObjects = [...state.objects];
    
    const selectedObjects = objectIds.map(id => 
      state.objects.find(obj => obj.id === id)
    ).filter((obj): obj is SceneObject => obj !== undefined);

    const center = selectedObjects.reduce((acc, obj) => ({
      x: acc.x + obj.position[0],
      y: acc.y + obj.position[1],
      z: acc.z + obj.position[2]
    }), { x: 0, y: 0, z: 0 });

    const centerPosition: [number, number, number] = [
      center.x / selectedObjects.length,
      center.y / selectedObjects.length,
      center.z / selectedObjects.length
    ];

    const parentId = selectedObjects[0]?.parentId || null;

    newObjects.push({
      id: groupId,
      name: `Group_${state.objects.length + 1}`,
      type: 'group',
      position: centerPosition,
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: '#cccccc',
      visible: true,
      parentId: parentId,
      children: objectIds
    });

    objectIds.forEach(id => {
      const objIndex = newObjects.findIndex(obj => obj.id === id);
      if (objIndex !== -1) {
        const obj = newObjects[objIndex];
        const relativePosition: [number, number, number] = [
          obj.position[0] - centerPosition[0],
          obj.position[1] - centerPosition[1],
          obj.position[2] - centerPosition[2]
        ];

        newObjects[objIndex] = {
          ...obj,
          parentId: groupId,
          position: relativePosition
        };
      }
    });

    const newState = { 
      objects: newObjects, 
      selectedObjectIds: [groupId]
    };

    const newHistory = addToHistory(newState, state.history, state.currentHistoryIndex);
    return {
      ...newState,
      history: newHistory,
      currentHistoryIndex: newHistory.length - 1
    };
  }),

  ungroupObjects: (groupId) => set((state) => {
    const group = state.objects.find(obj => obj.id === groupId);
    if (!group || group.type !== 'group') return state;

    const groupWorldPosition = group.position;
    const groupRotation = group.rotation;
    const groupScale = group.scale;

    const newObjects = state.objects
      .filter(obj => obj.id !== groupId)
      .map(obj => {
        if (obj.parentId === groupId) {
          const worldPosition: [number, number, number] = [
            groupWorldPosition[0] + obj.position[0] * groupScale[0],
            groupWorldPosition[1] + obj.position[1] * groupScale[1],
            groupWorldPosition[2] + obj.position[2] * groupScale[2]
          ];

          return {
            ...obj,
            parentId: null,
            position: worldPosition,
            rotation: [
              obj.rotation[0] + groupRotation[0],
              obj.rotation[1] + groupRotation[1],
              obj.rotation[2] + groupRotation[2]
            ],
            scale: [
              obj.scale[0] * groupScale[0],
              obj.scale[1] * groupScale[1],
              obj.scale[2] * groupScale[2]
            ]
          };
        }
        return obj;
      });

    const newState = {
      objects: newObjects,
      selectedObjectIds: group.children
    };

    const newHistory = addToHistory(newState, state.history, state.currentHistoryIndex);
    return {
      ...newState,
      history: newHistory,
      currentHistoryIndex: newHistory.length - 1
    };
  }),

  getWorldTransform: (objectId: string) => {
    const state = get();
    const object = state.objects.find(obj => obj.id === objectId);
    if (!object) return null;

    let worldPosition = [...object.position];
    let worldRotation = [...object.rotation];
    let worldScale = [...object.scale];

    let currentObj = object;
    while (currentObj.parentId) {
      const parent = state.objects.find(obj => obj.id === currentObj.parentId);
      if (!parent) break;

      worldPosition = [
        worldPosition[0] * parent.scale[0] + parent.position[0],
        worldPosition[1] * parent.scale[1] + parent.position[1],
        worldPosition[2] * parent.scale[2] + parent.position[2]
      ];

      worldRotation = [
        worldRotation[0] + parent.rotation[0],
        worldRotation[1] + parent.rotation[1],
        worldRotation[2] + parent.rotation[2]
      ];

      worldScale = [
        worldScale[0] * parent.scale[0],
        worldScale[1] * parent.scale[1],
        worldScale[2] * parent.scale[2]
      ];

      currentObj = parent;
    }

    return {
      position: worldPosition as [number, number, number],
      rotation: worldRotation as [number, number, number],
      scale: worldScale as [number, number, number]
    };
  }
})); 