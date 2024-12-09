import * as THREE from 'three';
import { GeometryType } from '../../../types/scene.types';

export function createGeometry(type: GeometryType): THREE.BufferGeometry {
  switch (type) {
    case 'cube': 
      return new THREE.BoxGeometry();
    case 'sphere': 
      return new THREE.SphereGeometry(1, 32, 32);
    case 'cylinder': {
      const geometry = new THREE.CylinderGeometry(1, 1, 2, 32);
      geometry.rotateX(Math.PI / 2);
      return geometry;
    }
    case 'merged':
    case 'group':
    case 'imported':
      return new THREE.BufferGeometry();
    default: 
      return new THREE.BoxGeometry();
  }
}