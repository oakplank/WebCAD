import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Face } from '../../../types/scene.types';

interface FaceHighlightProps {
  face: Face;
  color: string;
  opacity?: number;
}

export function FaceHighlight({ face, color, opacity = 0.3 }: FaceHighlightProps) {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    
    // Get vertices in the correct order
    const vertices = face.vertices;
    const positions = new Float32Array(vertices.length * 3);
    
    // Create the face vertices
    for (let i = 0; i < vertices.length; i++) {
      positions[i * 3] = vertices[i].x;
      positions[i * 3 + 1] = vertices[i].y;
      positions[i * 3 + 2] = vertices[i].z;
    }
    
    // Set vertices
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    
    // Create triangulation indices for the polygon
    const indices = [];
    for (let i = 1; i < vertices.length - 1; i++) {
      indices.push(0, i, i + 1);
    }
    geo.setIndex(indices);
    
    // Set face normal for all vertices
    const normals = new Float32Array(positions.length);
    for (let i = 0; i < normals.length; i += 3) {
      normals[i] = face.normal.x;
      normals[i + 1] = face.normal.y;
      normals[i + 2] = face.normal.z;
    }
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));

    return geo;
  }, [face]);

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial
        color={color}
        transparent={true}
        opacity={opacity}
        side={THREE.DoubleSide}
        depthTest={false}
        polygonOffset={true}
        polygonOffsetFactor={-4}
        polygonOffsetUnits={-4}
      />
    </mesh>
  );
}
