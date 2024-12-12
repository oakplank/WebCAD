import React from 'react';
import * as THREE from 'three';
import { GeometryType, ViewMode } from '../../../types/scene.types';
import { createGeometry } from '../utils/geometryUtils';
import { ProgressiveMaterial } from './ProgressiveMaterial';

interface ShapeMeshProps {
  type: GeometryType;
  color: string;
  viewMode: ViewMode;
  geometry?: {
    vertices: number[];
    indices: number[];
    normals: number[];
    uvs?: number[];
  };
  material?: {
    color: string;
    metalness?: number;
    roughness?: number;
    map?: string;
    normalMap?: string;
    roughnessMap?: string;
    metalnessMap?: string;
  };
}

export function ShapeMesh({ type, color, viewMode, geometry, material }: ShapeMeshProps) {
  if (type === 'group') return null;
  
  const meshGeometry = React.useMemo(() => {
    if (type === 'imported' && geometry) {
      const importedGeometry = new THREE.BufferGeometry();
      importedGeometry.setAttribute('position', new THREE.Float32BufferAttribute(geometry.vertices, 3));
      if (geometry.indices.length > 0) {
        importedGeometry.setIndex(geometry.indices);
      }
      if (geometry.normals.length > 0) {
        importedGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(geometry.normals, 3));
      }
      if (geometry.uvs && geometry.uvs.length > 0) {
        importedGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(geometry.uvs, 2));
      }
      return importedGeometry;
    }
    return createGeometry(type);
  }, [type, geometry]);

  return (
    <>
      <primitive object={meshGeometry} attach="geometry" />
      <ProgressiveMaterial
        materialData={{
          color: material?.color || color,
          metalness: material?.metalness,
          roughness: material?.roughness,
          map: material?.map,
          normalMap: material?.normalMap,
          roughnessMap: material?.roughnessMap,
          metalnessMap: material?.metalnessMap
        }}
        viewMode={viewMode}
      />
    </>
  );
}