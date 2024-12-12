import React from 'react';
import * as THREE from 'three';
import { Workplane } from '../../../types/workplane.types';

interface WorkplaneGridProps {
  workplane: Workplane;
}

export function WorkplaneGrid({ workplane }: WorkplaneGridProps) {
  const gridHelper = React.useMemo(() => {
    // Create a grid helper
    const size = workplane.size;
    const divisions = size / workplane.gridSize;
    const grid = new THREE.GridHelper(size, divisions, workplane.color, workplane.color);

    // Create rotation matrix from normal and up vectors
    const normal = new THREE.Vector3(...workplane.normal);
    const up = new THREE.Vector3(...workplane.up);
    const right = new THREE.Vector3().crossVectors(up, normal);
    const matrix = new THREE.Matrix4().makeBasis(right, up, normal);

    // Apply rotation and position
    grid.applyMatrix4(matrix);
    grid.position.set(...workplane.origin);

    return grid;
  }, [workplane]);

  return <primitive object={gridHelper} />;
}
