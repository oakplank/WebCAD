import * as THREE from 'three';
import { GeometryType, SceneObject } from '../types/scene.types';
import { rotationToRadians } from './rotationUtils';

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

export function mergeGeometries(objects: SceneObject[]): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];

  objects.forEach(obj => {
    const geometry = createGeometry(obj.type);
    if (!geometry) return;

    // Create a matrix to transform the geometry
    const matrix = new THREE.Matrix4();
    matrix.compose(
      new THREE.Vector3(...obj.position),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotationToRadians(obj.rotation))),
      new THREE.Vector3(...obj.scale)
    );

    // Apply the transformation to the geometry
    geometry.applyMatrix4(matrix);
    geometries.push(geometry);
  });

  // Merge all geometries
  const mergedGeometry = mergeBufferGeometries(geometries);
  if (!mergedGeometry) {
    throw new Error('Failed to merge geometries');
  }

  return mergedGeometry;
}

function mergeBufferGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry | null {
  let vertexCount = 0;
  let indexCount = 0;

  // Calculate total counts
  geometries.forEach(geometry => {
    vertexCount += geometry.attributes.position.count;
    if (geometry.index) {
      indexCount += geometry.index.count;
    }
  });

  // Create merged arrays
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const indices = new Uint32Array(indexCount);

  let vertexOffset = 0;
  let indexOffset = 0;

  // Merge geometries
  geometries.forEach(geometry => {
    const positionArray = geometry.attributes.position.array;
    const normalArray = geometry.attributes.normal.array;
    const indexArray = geometry.index?.array;

    // Copy positions and normals
    positions.set(positionArray, vertexOffset * 3);
    normals.set(normalArray, vertexOffset * 3);

    // Copy and offset indices
    if (indexArray) {
      for (let i = 0; i < indexArray.length; i++) {
        indices[indexOffset + i] = indexArray[i] + vertexOffset;
      }
      indexOffset += indexArray.length;
    }

    vertexOffset += geometry.attributes.position.count;
  });

  // Create merged geometry
  const mergedGeometry = new THREE.BufferGeometry();
  mergedGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  mergedGeometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  mergedGeometry.setIndex(new THREE.BufferAttribute(indices, 1));

  return mergedGeometry;
}
