import React from 'react';
import * as THREE from 'three';
import { GeometryType, ViewMode } from '../../../types/scene.types';
import { createGeometry } from '../utils/geometryUtils';

interface ShapeMeshProps {
  type: GeometryType;
  color: string;
  viewMode: ViewMode;
}

export function ShapeMesh({ type, color, viewMode }: ShapeMeshProps) {
  if (type === 'group' || type === 'imported') return null;
  
  const geometry = React.useMemo(() => createGeometry(type), [type]);

  return (
    <>
      <primitive object={geometry} attach="geometry" />
      {viewMode === 'surface' ? (
        <meshBasicMaterial 
          color={color}
          side={THREE.DoubleSide}
          transparent={false}
        />
      ) : (
        <meshStandardMaterial 
          color={color}
          wireframe={viewMode === 'wireframe'}
          roughness={0.5}
          metalness={0.5}
          side={THREE.DoubleSide}
          transparent={false}
        />
      )}
    </>
  );
}