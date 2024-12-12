import { create } from 'zustand';
import { SceneState, SceneObject, ViewMode, HistoryState, GeometryData } from '../types/scene.types';
import { mergeGeometries } from '../utils/geometryUtils';
import * as THREE from 'three';

const MAX_HISTORY = 50;

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
  viewMode: 'shaded' as ViewMode,
  history: [{ objects: [], selectedObjectIds: [] }],
  currentHistoryIndex: 0,
  hoveredObjectId: null,

  setHoveredObject: (id) => set({ hoveredObjectId: id }),

  canUndo: () => get().currentHistoryIndex > 0,
  canRedo: () => get().currentHistoryIndex < get().history.length - 1,

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
    const newObject = {
      ...object,
      id: crypto.randomUUID(),
      name: `${object.type}_${state.objects.length + 1}`,
      visible: true,
      parentId: null,
      children: []
    };

    const newObjects = [...state.objects, newObject];
    const newState = { 
      objects: newObjects, 
      selectedObjectIds: [newObject.id]
    };

    const newHistory = addToHistory(newState, state.history, state.currentHistoryIndex);
    return {
      ...newState,
      history: newHistory,
      currentHistoryIndex: newHistory.length - 1
    };
  }),

  removeObject: (id) => set((state) => {
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
    const newObjects = [...state.objects];
    const objectIndex = newObjects.findIndex(obj => obj.id === id);
    
    if (objectIndex === -1) return state;

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

  setSelectedObjects: (ids) => set({ selectedObjectIds: ids }),
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
        ...state,
        objects: previousState.objects,
        selectedObjectIds: previousState.selectedObjectIds,
        currentHistoryIndex: newIndex
      };
    }
    return state;
  }),

  redo: () => set((state) => {
    if (state.currentHistoryIndex < state.history.length - 1) {
      const newIndex = state.currentHistoryIndex + 1;
      const nextState = state.history[newIndex];
      return {
        ...state,
        objects: nextState.objects,
        selectedObjectIds: nextState.selectedObjectIds,
        currentHistoryIndex: newIndex
      };
    }
    return state;
  }),

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
            parentId: group.parentId,
            position: worldPosition,
            rotation: [
              obj.rotation[0] + groupRotation[0],
              obj.rotation[1] + groupRotation[1],
              obj.rotation[2] + groupRotation[2]
            ] as [number, number, number],
            scale: [
              obj.scale[0] * groupScale[0],
              obj.scale[1] * groupScale[1],
              obj.scale[2] * groupScale[2]
            ] as [number, number, number]
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

  mergeObjects: (objectIds) => set((state) => {
    const objectsToMerge = state.objects.filter(obj => objectIds.includes(obj.id));
    if (objectsToMerge.length < 2) return state;

    try {
      const mergedGeometry = mergeGeometries(objectsToMerge);
      const geometryData: GeometryData = {
        vertices: Array.from(mergedGeometry.attributes.position.array),
        indices: Array.from(mergedGeometry.index?.array || []),
        normals: Array.from(mergedGeometry.attributes.normal.array),
        uvs: mergedGeometry.attributes.uv ? Array.from(mergedGeometry.attributes.uv.array) : undefined
      };

      const center = new THREE.Vector3();
      const box = new THREE.Box3().setFromBufferAttribute(mergedGeometry.attributes.position);
      box.getCenter(center);

      const newObject: SceneObject = {
        id: crypto.randomUUID(),
        name: `Merged_${state.objects.length + 1}`,
        type: 'merged',
        position: [center.x, center.y, center.z],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        color: objectsToMerge[0].color,
        visible: true,
        parentId: null,
        children: [],
        geometry: geometryData
      };

      const newObjects = state.objects.filter(obj => !objectIds.includes(obj.id));
      newObjects.push(newObject);

      const newState = {
        objects: newObjects,
        selectedObjectIds: [newObject.id]
      };

      const newHistory = addToHistory(newState, state.history, state.currentHistoryIndex);
      return {
        ...newState,
        history: newHistory,
        currentHistoryIndex: newHistory.length - 1
      };
    } catch (error) {
      console.error('Failed to merge objects:', error);
      return state;
    }
  })
}));
