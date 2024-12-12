import { useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { MaterialData } from '../types/scene.types';

export function useMaterial(
  materialData: MaterialData,
  viewMode: 'shaded' | 'wireframe' | 'surface'
): THREE.Material {
  // Create material with memoization to prevent unnecessary recreations
  const material = useMemo(() => {
    if (viewMode === 'surface') {
      return new THREE.MeshBasicMaterial({
        color: materialData.color,
        side: THREE.DoubleSide,
        transparent: false
      });
    }

    return new THREE.MeshStandardMaterial({
      color: materialData.color,
      wireframe: viewMode === 'wireframe',
      metalness: materialData.metalness ?? 0.5,
      roughness: materialData.roughness ?? 0.5,
      side: THREE.DoubleSide,
      transparent: false
    });
  }, []); // Empty deps array as we'll update properties in useEffect

  // Update material properties when they change
  useEffect(() => {
    if (material instanceof THREE.MeshStandardMaterial) {
      material.color.set(materialData.color);
      material.wireframe = viewMode === 'wireframe';
      if (materialData.metalness !== undefined) {
        material.metalness = materialData.metalness;
      }
      if (materialData.roughness !== undefined) {
        material.roughness = materialData.roughness;
      }
    } else if (material instanceof THREE.MeshBasicMaterial) {
      material.color.set(materialData.color);
    }
  }, [material, materialData, viewMode]);

  // Cleanup
  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  return material;
}