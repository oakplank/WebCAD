import React from 'react';
import { GeometryType, ViewMode } from '../../../types/scene.types';
import { CubeEdges } from './CubeEdges';
import { CylinderEdges } from './CylinderEdges';

interface ShapeEdgesProps {
  type: GeometryType;
  viewMode: ViewMode;
  isSelected: boolean;
  isHovered: boolean;
}

export function ShapeEdges({ 
  type, 
  viewMode, 
  isSelected, 
  isHovered
}: ShapeEdgesProps) {
  if (type === 'group' || type === 'imported' || type === 'sphere') return null;

  const showEdges = viewMode === 'surface' || ((isSelected || isHovered) && viewMode !== 'surface');
  if (!showEdges) return null;

  const color = viewMode === 'surface' ? '#000000' : (isSelected ? '#0066cc' : '#ffff00');

  return (
    <>
      {type === 'cube' && <CubeEdges color={color} />}
      {type === 'cylinder' && <CylinderEdges color={color} />}
    </>
  );
}