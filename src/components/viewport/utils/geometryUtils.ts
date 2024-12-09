import * as THREE from 'three';
import { GeometryType } from '../../../types/scene.types';

export function createGeometry(type: GeometryType): THREE.BufferGeometry {
  switch (type) {
    case 'cube': 
      return new THREE.BoxGeometry();
    case 'sphere': 
      return new THREE.SphereGeometry(1, 32, 32);
    case 'cylinder': 
      // Create cylinder standing upright (Y-axis)
      return new THREE.CylinderGeometry(1, 1, 2, 32);
    case 'group':
    case 'imported':
      return new THREE.BoxGeometry(); // Fallback for types that don't need geometry
    default: 
      return new THREE.BoxGeometry();
  }
}