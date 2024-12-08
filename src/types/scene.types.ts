export type ViewMode = 'shaded' | 'wireframe' | 'surface';

export interface SceneObject {
  id: string;
  name: string;
  type: 'cube' | 'sphere' | 'cylinder';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  visible: boolean;
}

export interface HistoryState {
  objects: SceneObject[];
  selectedObjectId: string | null;
}

export interface SceneState {
  objects: SceneObject[];
  selectedObjectId: string | null;
  viewMode: ViewMode;
  history: HistoryState[];
  currentHistoryIndex: number;
  addObject: (object: Omit<SceneObject, 'id' | 'name'>) => void;
  removeObject: (id: string) => void;
  updateObject: (id: string, updates: Partial<SceneObject>) => void;
  setSelectedObject: (id: string | null) => void;
  duplicateObject: (id: string) => void;
  setViewMode: (mode: ViewMode) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
} 