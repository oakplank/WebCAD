import { create } from 'zustand';
import { SceneState, SceneObject, ViewMode, HistoryState } from '../types/scene.types';

const MAX_HISTORY = 50;

const addToHistory = (state: HistoryState, history: HistoryState[], currentIndex: number) => {
  const newHistory = history.slice(0, currentIndex + 1);
  newHistory.push(state);
  if (newHistory.length > MAX_HISTORY) {
    newHistory.shift();
  }
  return newHistory;
};

const updateChildrenVisibility = (objects: SceneObject[], parentId: string, visible: boolean): SceneObject[] => {
  return objects.map(obj => {
    if (obj.parentId === parentId) {
      const updatedObj = { ...obj, visible };
      // Recursively update children if this is also a group
      if (obj.type === 'group' && obj.children.length > 0) {
        return updateChildrenVisibility(objects, obj.id, visible)[objects.findIndex(o => o.id === obj.id)];
      }
      return updatedObj;
    }
    return obj;
  });
};

export const useSceneStore = create<SceneState>((set, get) => ({
  objects: [],
  selectedObjectIds: [],
  viewMode: 'shaded' as ViewMode,
  history: [{ objects: [], selectedObjectIds: [] }],
  currentHistoryIndex: 0,
  hoveredObjectId: null,
  setHoveredObject: (id) => set({ hoveredObjectId: id }),
  
  saveState: () => set(state => {
    const newState = { 
      objects: state.objects, 
      selectedObjectIds: state.selectedObjectIds 
    };
    const newHistory = addToHistory(newState, state.history, state.currentHistoryIndex);
    return {
      history: newHistory,
      currentHistoryIndex: newHistory.length - 1
    };
  }),
  
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
    // First, remove all children recursively
    const getAllChildrenIds = (parentId: string): string[] => {
      const children = state.objects.filter(obj => obj.parentId === parentId);
      return children.reduce((acc, child) => [
        ...acc,
        child.id,
        ...getAllChildrenIds(child.id)
      ], [] as string[]);
    };

    const childrenIds = getAllChildrenIds(id);
    const idsToRemove = [id, ...childrenIds];

    const newObjects = state.objects.filter(obj => !idsToRemove.includes(obj.id));
    const newSelectedIds = state.selectedObjectIds.filter(selectedId => !idsToRemove.includes(selectedId));
    
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
  
  updateObject: (id, updates, saveToHistory = true) => set((state) => {
    let newObjects = [...state.objects];
    const objectIndex = newObjects.findIndex(obj => obj.id === id);
    
    if (objectIndex === -1) return state;

    // If updating visibility of a group, update all children recursively
    if ('visible' in updates && newObjects[objectIndex].type === 'group') {
      newObjects = updateChildrenVisibility(newObjects, id, updates.visible as boolean);
    }

    // Update the object itself
    newObjects[objectIndex] = { ...newObjects[objectIndex], ...updates };

    const newState = { objects: newObjects, selectedObjectIds: state.selectedObjectIds };
    
    if (!saveToHistory) {
      return { objects: newObjects };
    }
    
    const newHistory = addToHistory(newState, state.history, state.currentHistoryIndex);
    return {
      ...newState,
      history: newHistory,
      currentHistoryIndex: newHistory.length - 1
    };
  }),
  
  setSelectedObjects: (ids) => set({ selectedObjectIds: Array.isArray(ids) ? ids : [] }),
  setViewMode: (mode: ViewMode) => set({ viewMode: mode }),

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
    const newState = { objects: newObjects, selectedObjectIds: [newObject.id] };
    const newHistory = addToHistory(newState, state.history, state.currentHistoryIndex);
    return {
      ...newState,
      history: newHistory,
      currentHistoryIndex: newHistory.length - 1
    };
  }),

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
  })
}));