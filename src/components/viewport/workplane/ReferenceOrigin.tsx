import React from 'react';
import * as THREE from 'three';
import { useSettingsStore } from '../../../store/settingsStore';

export function ReferenceOrigin() {
  const originVisible = useSettingsStore(state => state.originVisible);

  if (!originVisible) return null;

  const planeSize = 0.5; // Smaller size (0.5 units)
  const planeOpacity = 0.2; // Subtle opacity

  return (
    <group>
      {/* XY Plane (Blue) */}
      <mesh position={[planeSize/2, planeSize/2, 0]}>
        <planeGeometry args={[planeSize, planeSize]} />
        <meshBasicMaterial 
          color="#0000ff" 
          transparent
          opacity={planeOpacity}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* YZ Plane (Red) */}
      <mesh position={[0, planeSize/2, planeSize/2]} rotation={[0, Math.PI/2, 0]}>
        <planeGeometry args={[planeSize, planeSize]} />
        <meshBasicMaterial 
          color="#ff0000" 
          transparent
          opacity={planeOpacity}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* XZ Plane (Green) */}
      <mesh position={[planeSize/2, 0, planeSize/2]} rotation={[Math.PI/2, 0, 0]}>
        <planeGeometry args={[planeSize, planeSize]} />
        <meshBasicMaterial 
          color="#00ff00" 
          transparent
          opacity={planeOpacity}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Axes */}
      <group>
        {/* X Axis (Red) */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([0, 0, 0, planeSize, 0, 0])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#ff0000" linewidth={2} />
        </line>

        {/* Y Axis (Green) */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([0, 0, 0, 0, planeSize, 0])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#00ff00" linewidth={2} />
        </line>

        {/* Z Axis (Blue) */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([0, 0, 0, 0, 0, planeSize])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#0000ff" linewidth={2} />
        </line>
      </group>
    </group>
  );
}
