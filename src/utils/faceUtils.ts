import * as THREE from 'three';
import { Face } from '../types/scene.types';

export function extractFaces(mesh: THREE.Mesh, objectId: string): Face[] {
  const geometry = mesh.geometry;
  
  // Ensure we have required attributes
  if (!geometry.attributes.position || !geometry.attributes.normal) {
    geometry.computeVertexNormals();
  }
  
  // Create index if not exists
  if (!geometry.index) {
    const indices = [];
    for (let i = 0; i < geometry.attributes.position.count; i += 3) {
      indices.push(i, i + 1, i + 2);
    }
    geometry.setIndex(indices);
  }

  // Get world matrix to transform vertices and normals
  mesh.updateWorldMatrix(true, false);
  const worldMatrix = mesh.matrixWorld;
  const normalMatrix = new THREE.Matrix3().getNormalMatrix(worldMatrix);

  const position = geometry.attributes.position;
  const normal = geometry.attributes.normal;
  const index = geometry.index!;

  // Map to store unique faces based on normal direction
  const faceMap = new Map<string, { vertices: Set<string>; normal: THREE.Vector3 }>();
  
  // Process all triangles
  for (let i = 0; i < index.count; i += 3) {
    // Get face normal from first vertex normal
    const idx = index.getX(i);
    const faceNormal = new THREE.Vector3(
      normal.getX(idx),
      normal.getY(idx),
      normal.getZ(idx)
    ).applyMatrix3(normalMatrix).normalize();

    // Create key for this normal direction (rounded to handle floating point precision)
    const key = [
      Math.round(faceNormal.x * 1000) / 1000,
      Math.round(faceNormal.y * 1000) / 1000,
      Math.round(faceNormal.z * 1000) / 1000
    ].join(',');

    // Get or create face data for this normal direction
    if (!faceMap.has(key)) {
      faceMap.set(key, {
        vertices: new Set(),
        normal: faceNormal
      });
    }

    // Add all vertices of this triangle
    const faceData = faceMap.get(key)!;
    for (let j = 0; j < 3; j++) {
      const vertexIndex = index.getX(i + j);
      const vertex = new THREE.Vector3(
        position.getX(vertexIndex),
        position.getY(vertexIndex),
        position.getZ(vertexIndex)
      ).applyMatrix4(worldMatrix);

      // Store vertex as string with reduced precision to help with merging
      const vertexKey = [
        Math.round(vertex.x * 1000) / 1000,
        Math.round(vertex.y * 1000) / 1000,
        Math.round(vertex.z * 1000) / 1000
      ].join(',');
      
      faceData.vertices.add(vertexKey);
    }
  }

  // Convert face map to Face objects
  const faces: Face[] = [];

  for (const [_, faceData] of faceMap.entries()) {
    // Convert vertex strings back to Vector3
    const vertices = Array.from(faceData.vertices).map(str => {
      const [x, y, z] = str.split(',').map(Number);
      return new THREE.Vector3(x, y, z);
    });

    // Calculate face center
    const center = new THREE.Vector3();
    vertices.forEach(v => center.add(v));
    center.divideScalar(vertices.length);

    // Sort vertices to create a convex polygon
    const sortedVertices = sortVerticesClockwise(vertices, center, faceData.normal);

    // Only create faces with 3 or more vertices
    if (sortedVertices.length >= 3) {
      faces.push({
        vertices: sortedVertices,
        normal: faceData.normal,
        center,
        objectId
      });
    }
  }

  return faces;
}

function sortVerticesClockwise(vertices: THREE.Vector3[], center: THREE.Vector3, normal: THREE.Vector3): THREE.Vector3[] {
  // Create a plane using the normal and center
  const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(normal, center);
  
  // Create basis vectors for the plane
  const basis1 = new THREE.Vector3(1, 0, 0);
  if (Math.abs(normal.dot(basis1)) > 0.9) {
    basis1.set(0, 1, 0);
  }
  const basis2 = new THREE.Vector3().crossVectors(normal, basis1).normalize();
  basis1.crossVectors(basis2, normal).normalize();

  // Project vertices onto plane and calculate angles
  return vertices.sort((a, b) => {
    const aLocal = a.clone().sub(center);
    const bLocal = b.clone().sub(center);
    
    const aAngle = Math.atan2(aLocal.dot(basis2), aLocal.dot(basis1));
    const bAngle = Math.atan2(bLocal.dot(basis2), bLocal.dot(basis1));
    
    return aAngle - bAngle;
  });
}
