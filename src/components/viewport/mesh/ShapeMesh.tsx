import React, { forwardRef } from 'react';
import * as THREE from 'three';
import { GeometryType, ViewMode } from '../../../types/scene.types';
import { createGeometry } from '../utils/geometryUtils';
import { ThreeEvent } from '@react-three/fiber';

interface ShapeMeshProps {
  type: GeometryType;
  color: string;
  viewMode: ViewMode;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  onClick: (e: ThreeEvent<MouseEvent>) => void;
  onPointerOver: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut: (e: ThreeEvent<PointerEvent>) => void;
}

const ShapeMesh = forwardRef<THREE.Mesh, ShapeMeshProps>(({
  type,
  color,
  viewMode,
  position,
  rotation,
  scale,
  onClick,
  onPointerOver,
  onPointerOut
}, ref) => {
  if (type === 'group' || type === 'imported') return null;
  
  const geometry = createGeometry(type);

  return (
    <mesh
      ref={ref}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      geometry={geometry}
    >
      {viewMode === 'surface' ? (
        <meshBasicMaterial 
          color={color}
          side={THREE.DoubleSide}
        />
      ) : (
        <meshStandardMaterial 
          color={color}
          wireframe={viewMode === 'wireframe'}
          roughness={0.5}
          metalness={0.5}
          side={THREE.DoubleSide}
        />
      )}
    </mesh>
  );
});

ShapeMesh.displayName = 'ShapeMesh';

export { ShapeMesh };