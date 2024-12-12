import * as THREE from 'three';
import { SceneObject } from '../types/scene.types';

export function generateVertexColors(geometry: THREE.BufferGeometry, color: string): Float32Array {
  const positions = geometry.attributes.position;
  const vertexColors = new Float32Array(positions.count * 3);
  const threeColor = new THREE.Color(color);

  for (let i = 0; i < positions.count; i++) {
    vertexColors[i * 3] = threeColor.r;
    vertexColors[i * 3 + 1] = threeColor.g;
    vertexColors[i * 3 + 2] = threeColor.b;
  }

  return vertexColors;
}

export function updateVertexColors(geometry: THREE.BufferGeometry, color: string): void {
  const vertexColors = generateVertexColors(geometry, color);
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(vertexColors, 3));
  geometry.attributes.color.needsUpdate = true;
}

export function interpolateVertexColors(
  geometry: THREE.BufferGeometry,
  colors: string[],
  interpolationFactor: number = 0.5
): void {
  const positions = geometry.attributes.position;
  const vertexColors = new Float32Array(positions.count * 3);
  const threeColors = colors.map(color => new THREE.Color(color));

  for (let i = 0; i < positions.count; i++) {
    const position = new THREE.Vector3();
    position.fromBufferAttribute(positions, i);

    // Calculate color based on vertex position and interpolation
    const normalizedHeight = (position.y + 1) / 2; // Normalize to 0-1 range
    const colorIndex = Math.floor(normalizedHeight * (threeColors.length - 1));
    const nextColorIndex = Math.min(colorIndex + 1, threeColors.length - 1);
    const colorFactor = normalizedHeight * (threeColors.length - 1) - colorIndex;

    const color = new THREE.Color();
    color.lerpColors(
      threeColors[colorIndex],
      threeColors[nextColorIndex],
      colorFactor * interpolationFactor
    );

    vertexColors[i * 3] = color.r;
    vertexColors[i * 3 + 1] = color.g;
    vertexColors[i * 3 + 2] = color.b;
  }

  geometry.setAttribute('color', new THREE.Float32BufferAttribute(vertexColors, 3));
  geometry.attributes.color.needsUpdate = true;
}