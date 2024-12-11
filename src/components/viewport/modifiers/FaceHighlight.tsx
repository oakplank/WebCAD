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
    
    // Create vertices array
    const vertices = face.vertices.map(v => [v.x, v.y, v.z]).flat();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    
    // Create triangles for the polygon using fan triangulation
    const indices = [];
    for (let i = 1; i < face.vertices.length - 1; i++) {
      indices.push(0, i, i + 1);
    }
    geo.setIndex(indices);
    
    // Set face normal for all vertices
    const normals = new Float32Array(vertices.length);
    for (let i = 0; i < vertices.length; i += 3) {
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