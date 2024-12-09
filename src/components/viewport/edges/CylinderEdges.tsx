import React, { useMemo } from 'react';
import * as THREE from 'three';

interface CylinderEdgesProps {
  color?: string;
}

export function CylinderEdges({ color = '#000000' }: CylinderEdgesProps) {
  const edges = useMemo(() => {
    // Create top and bottom circles
    const circleGeometry = new THREE.CircleGeometry(1, 32);
    
    // Rotate circles to be horizontal (facing up/down)
    circleGeometry.rotateX(-Math.PI / 2);
    
    const topCircle = new THREE.EdgesGeometry(circleGeometry);
    const bottomCircle = new THREE.EdgesGeometry(circleGeometry);

    // Create vertices array for the complete edge geometry
    const positions: number[] = [];

    // Add top circle vertices (translated up)
    const topPositions = new Float32Array(topCircle.attributes.position.array);
    for (let i = 0; i < topPositions.length; i += 3) {
      positions.push(
        topPositions[i],
        topPositions[i + 1] + 1, // Translate up by 1
        topPositions[i + 2]
      );
    }

    // Add bottom circle vertices (translated down)
    const bottomPositions = new Float32Array(bottomCircle.attributes.position.array);
    for (let i = 0; i < bottomPositions.length; i += 3) {
      positions.push(
        bottomPositions[i],
        bottomPositions[i + 1] - 1, // Translate down by 1
        bottomPositions[i + 2]
      );
    }

    // Create the final geometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    
    return geometry;
  }, []);

  return (
    <lineSegments>
      <primitive object={edges} attach="geometry" />
      <lineBasicMaterial 
        color={color}
        linewidth={1}
        transparent={false}
        depthTest={true}
      />
    </lineSegments>
  );
}