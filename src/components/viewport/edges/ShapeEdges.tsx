import React from 'react';
import { GeometryType, ViewMode } from '../../../types/scene.types';
import { CubeEdges } from './CubeEdges';
import { CylinderEdges } from './CylinderEdges';

interface ShapeEdgesProps {
  type: GeometryType;
  viewMode: ViewMode;
  isSelected: boolean;
  isHovered: boolean;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export function ShapeEdges({ 
  type, 
  viewMode, 
  isSelected, 
  isHovered,
  position,
  rotation,
  scale
}: ShapeEdgesProps) {
  if (type === 'group' || type === 'imported') return null;

  const showEdges = viewMode === 'surface' || ((isSelected || isHovered) && viewMode !== 'surface');
  if (!showEdges) return null;

  const color = viewMode === 'surface' ? '#000000' : (isSelected ? '#0066cc' : '#ffff00');

  const EdgeComponent = type === 'cube' ? CubeEdges : type === 'cylinder' ? CylinderEdges : null;
  if (!EdgeComponent) return null;

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <EdgeComponent color={color} />
    </group>
  );
}