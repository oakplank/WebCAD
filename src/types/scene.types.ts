import { Theme } from '../store/settingsStore';

export type ViewMode = 'shaded' | 'wireframe' | 'surface';

export type GeometryType = 'cube' | 'sphere' | 'cylinder' | 'imported' | 'group';

export interface MaterialData {
  color: string;
  metalness?: number;
  roughness?: number;
  map?: string;
  normalMap?: string;
  roughnessMap?: string;
  metalnessMap?: string;
  alphaMap?: string;
  aoMap?: string;
  emissiveMap?: string;
  envMap?: string;
}

export interface SceneObject {
  id: string;
  name: string;
  type: GeometryType;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  visible: boolean;
  parentId: string | null;
  children: string[];
  geometry?: {
    vertices: number[];
    indices: number[];
    normals: number[];
    uvs?: number[];
  };
  material?: MaterialData;
}

export interface HistoryState {
  objects: SceneObject[];
  selectedObjectIds: string[];
}

export interface SceneState {
  objects: SceneObject[];
  selectedObjectIds: string[];
  viewMode: ViewMode;
  history: HistoryState[];
  currentHistoryIndex: number;
  hoveredObjectId: string | null;
  setHoveredObject: (id: string | null) => void;
  saveState: () => void;
  addObject: (object: Omit<SceneObject, 'id' | 'name' | 'parentId' | 'children'>) => void;
  removeObject: (id: string) => void;
  updateObject: (id: string, updates: Partial<SceneObject>, saveToHistory?: boolean) => void;
  setSelectedObjects: (ids: string[]) => void;
  duplicateObject: (id: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setObjects: (objects: SceneObject[]) => void;
  groupObjects: (objectIds: string[]) => void;
  ungroupObjects: (groupId: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}