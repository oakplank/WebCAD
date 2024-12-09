import React from 'react';
import * as THREE from 'three';

interface CubeEdgesProps {
  color?: string;
}

export function CubeEdges({ color = '#000000' }: CubeEdgesProps) {
  const geometry = new THREE.BoxGeometry();
  const edges = new THREE.EdgesGeometry(geometry);
  
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