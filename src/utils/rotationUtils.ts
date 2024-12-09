import * as THREE from 'three';

export function degreesToRadians(degrees: number): number {
  return degrees * Math.PI / 180;
}

export function radiansToDegrees(radians: number): number {
  return (radians * 180 / Math.PI) % 360;
}

export function rotationToDegrees(rotation: [number, number, number]): [number, number, number] {
  return rotation.map(rad => radiansToDegrees(rad)) as [number, number, number];
}

export function rotationToRadians(rotation: [number, number, number]): [number, number, number] {
  return rotation.map(deg => degreesToRadians(deg)) as [number, number, number];
}