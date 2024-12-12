import React from 'react';
import * as THREE from 'three';

interface GroupVisualizerProps {
  centroid: THREE.Vector3;
  isSelected: boolean;
  isHovered: boolean;
}

export function GroupVisualizer({ centroid, isSelected, isHovered }: GroupVisualizerProps) {
  const color = isSelected ? '#0066cc' : (isHovered ? '#ffff00' : '#666666');
  
  return (
    <group position={centroid}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={6}
            array={new Float32Array([
              -0.5, 0, 0, 0.5, 0, 0,
              0, -0.5, 0, 0, 0.5, 0,
              0, 0, -0.5, 0, 0, 0.5
            ])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={0.5}
          depthTest={false}
        />
      </lineSegments>
    </group>
  );
}
