import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { MaterialData } from '../../../types/scene.types';
import { useProgressiveLoading } from '../../../hooks/useProgressiveLoading';
import { textureService } from '../../../services/TextureService';

const LOADING_COLOR = '#e0e0e0'; // Neutral grey for loading state

interface ProgressiveMaterialProps {
  materialData: MaterialData;
  viewMode: 'shaded' | 'wireframe' | 'surface';
}

export function ProgressiveMaterial({ materialData, viewMode }: ProgressiveMaterialProps) {
  const { isLoading, loadedTextures } = useProgressiveLoading(materialData);

  const material = useMemo(() => {
    if (viewMode === 'surface') {
      return new THREE.MeshBasicMaterial({
        color: isLoading ? LOADING_COLOR : materialData.color,
        side: THREE.DoubleSide
      });
    }

    return new THREE.MeshStandardMaterial({
      color: isLoading ? LOADING_COLOR : materialData.color,
      wireframe: viewMode === 'wireframe',
      metalness: materialData.metalness ?? 0.5,
      roughness: materialData.roughness ?? 0.5,
      side: THREE.DoubleSide
    });
  }, [viewMode]);

  useEffect(() => {
    if (material instanceof THREE.MeshStandardMaterial) {
      // Update color only when not loading or when all textures are loaded
      if (!isLoading) {
        material.color.set(materialData.color);
      }

      // Apply textures as they load
      if (materialData.map && loadedTextures.has(materialData.map)) {
        material.map = textureService.getTexture(materialData.map);
      }
      if (materialData.normalMap && loadedTextures.has(materialData.normalMap)) {
        material.normalMap = textureService.getTexture(materialData.normalMap);
      }
      if (materialData.roughnessMap && loadedTextures.has(materialData.roughnessMap)) {
        material.roughnessMap = textureService.getTexture(materialData.roughnessMap);
      }
      if (materialData.metalnessMap && loadedTextures.has(materialData.metalnessMap)) {
        material.metalnessMap = textureService.getTexture(materialData.metalnessMap);
      }

      material.needsUpdate = true;
    }
  }, [material, materialData, isLoading, loadedTextures]);

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  return <primitive object={material} attach="material" />;
}