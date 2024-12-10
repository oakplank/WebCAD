import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Face } from '../../../store/modifyStore';

interface FaceHighlightProps {
  face: Face;
  color: string;
  opacity?: number;
}

export function FaceHighlight({ face, color, opacity = 0.3 }: FaceHighlightProps) {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    
    // Create vertices for the face
    const vertices = face.vertices.flatMap(v => [v.x, v.y, v.z]);
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    // Create triangles for the face
    if (vertices.length === 9) { // Single triangle
      geo.setIndex([0, 1, 2]);
    } else if (vertices.length === 12) { // Quad (two triangles)
      geo.setIndex([0, 1, 2, 0, 2, 3]);
    }

    // Set normals
    const normals = face.vertices.flatMap(() => [
      face.normal.x,
      face.normal.y,
      face.normal.z
    ]);
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));

    return geo;
  }, [face]);

  const material = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity,
      depthTest: false
    });
  }, [color, opacity]);

  return <mesh geometry={geometry} material={material} />;
} 