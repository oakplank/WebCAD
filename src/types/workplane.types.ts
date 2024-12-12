import * as THREE from 'three';

export interface Workplane {
  id: string;
  name: string;
  origin: [number, number, number];
  normal: [number, number, number];
  up: [number, number, number];
  visible: boolean;
  size: number;
  gridSize: number;
  color: string;
  isActive: boolean;
  isReference?: boolean;
  parentPlaneId?: string;
  offset?: number;
  angle?: number;
}

export type WorkplaneType = 'XY' | 'YZ' | 'XZ' | 'custom' | 'face' | 'threePoint' | 'offset';

export interface WorkplaneCreationState {
  mode: 'none' | 'selecting-face' | 'selecting-points' | 'selecting-reference';
  pointsCollected: THREE.Vector3[];
  selectedFace?: THREE.Face3;
  referenceWorkplaneId?: string;
  offset?: number;
  angle?: number;
}
