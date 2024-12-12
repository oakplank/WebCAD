import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '../../../hooks/useTexture';
import { MaterialData } from '../../../types/scene.types';

interface TexturedMaterialProps {
  materialData: MaterialData;
  viewMode: 'shaded' | 'wireframe' | 'surface';
}

export function TexturedMaterial({ materialData, viewMode }: TexturedMaterialProps) {
  // Create material with memoization
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
  }, [viewMode]); // Only recreate if viewMode changes

  // Load textures
  const baseTexture = useTexture(materialData.map, { 
    encoding: THREE.sRGBEncoding 
  });
  const normalTexture = useTexture(materialData.normalMap, { 
    encoding: THREE.LinearEncoding 
  });
  const roughnessTexture = useTexture(materialData.roughnessMap, { 
    encoding: THREE.LinearEncoding 
  });
  const metalnessTexture = useTexture(materialData.metalnessMap, { 
    encoding: THREE.LinearEncoding 
  });

  // Update material properties
  useEffect(() => {
    if (material instanceof THREE.MeshStandardMaterial) {
      material.color.set(materialData.color);
      material.metalness = materialData.metalness ?? 0.5;
      material.roughness = materialData.roughness ?? 0.5;
      material.wireframe = viewMode === 'wireframe';

      // Only update textures if they're loaded
      if (baseTexture.texture) {
        material.map = baseTexture.texture;
      }
      if (normalTexture.texture) {
        material.normalMap = normalTexture.texture;
      }
      if (roughnessTexture.texture) {
        material.roughnessMap = roughnessTexture.texture;
      }
      if (metalnessTexture.texture) {
        material.metalnessMap = metalnessTexture.texture;
      }

      material.needsUpdate = true;
    } else if (material instanceof THREE.MeshBasicMaterial) {
      material.color.set(materialData.color);
      material.needsUpdate = true;
    }
  }, [
    material,
    materialData.color,
    materialData.metalness,
    materialData.roughness,
    viewMode,
    baseTexture.texture,
    normalTexture.texture,
    roughnessTexture.texture,
    metalnessTexture.texture
  ]);

  // Cleanup
  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  return <primitive object={material} attach="material" />;
}