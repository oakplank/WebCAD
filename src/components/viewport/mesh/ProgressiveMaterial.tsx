import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { MaterialData } from '../../../types/scene.types';
import { textureService } from '../../../services/TextureService';

const LOADING_COLOR = '#e0e0e0'; // Neutral grey for loading state

interface ProgressiveMaterialProps {
  materialData: MaterialData;
  viewMode: 'shaded' | 'wireframe' | 'surface';
}

export function ProgressiveMaterial({ materialData, viewMode }: ProgressiveMaterialProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadedTextures, setLoadedTextures] = useState<Set<string>>(new Set());

  const material = useMemo(() => {
    const isOutlineMaterial = materialData.name?.toLowerCase().includes('outline');
    
    const materialOptions: any = {
      color: isLoading ? LOADING_COLOR : materialData.color,
      transparent: isOutlineMaterial,
      opacity: isOutlineMaterial ? 0.8 : 1,
      side: isOutlineMaterial ? THREE.BackSide : THREE.FrontSide,
      depthTest: true,
      depthWrite: !isOutlineMaterial,
      // Improved depth and transparency handling
      depthFunc: isOutlineMaterial ? THREE.GreaterEqualDepth : THREE.LessEqualDepth,
      // Prevent z-fighting
      polygonOffset: isOutlineMaterial,
      polygonOffsetFactor: isOutlineMaterial ? 1 : 0,
      polygonOffsetUnits: 1,
    };

    if (viewMode === 'surface') {
      return new THREE.MeshBasicMaterial({
        ...materialOptions,
        wireframe: false
      });
    }

    const standardMaterial = new THREE.MeshStandardMaterial({
      ...materialOptions,
      wireframe: viewMode === 'wireframe',
      metalness: materialData.metalness ?? 0.5,
      roughness: materialData.roughness ?? 0.5,
      envMapIntensity: 1.0,
      // Enable normal mapping for better detail
      normalScale: new THREE.Vector2(1, 1),
      // Improved material settings
      flatShading: false,
      vertexColors: false,
      fog: true
    });

    // Special handling for outline material
    if (isOutlineMaterial) {
      standardMaterial.blending = THREE.NormalBlending;
      standardMaterial.transparent = true;
      standardMaterial.renderOrder = -1; // Render outline first
    }

    return standardMaterial;
  }, [viewMode, isLoading, materialData]);

  useEffect(() => {
    let mounted = true;
    const texturesToLoad = new Set<string>();

    // Collect all texture URLs that need to be loaded
    if (materialData.map) texturesToLoad.add(materialData.map);
    if (materialData.normalMap) texturesToLoad.add(materialData.normalMap);
    if (materialData.roughnessMap) texturesToLoad.add(materialData.roughnessMap);
    if (materialData.metalnessMap) texturesToLoad.add(materialData.metalnessMap);

    if (texturesToLoad.size > 0) {
      setIsLoading(true);

      // Load all textures
      Promise.all(
        Array.from(texturesToLoad).map(async (url) => {
          try {
            if (url.startsWith('data:')) {
              await textureService.loadTextureFromDataUrl(url);
            } else {
              await textureService.loadTexture(url);
            }
            if (mounted) {
              setLoadedTextures(prev => new Set([...prev, url]));
            }
          } catch (error) {
            console.error('Failed to load texture:', error);
          }
        })
      ).finally(() => {
        if (mounted) {
          setIsLoading(false);
        }
      });
    }

    return () => {
      mounted = false;
    };
  }, [materialData]);

  useEffect(() => {
    if (material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshBasicMaterial) {
      // Update color only when not loading or when all textures are loaded
      if (!isLoading) {
        material.color.set(materialData.color);
      }

      // Apply textures with proper configuration
      if (materialData.map) {
        const texture = textureService.getTexture(materialData.map);
        if (texture) {
          material.map = texture;
          material.needsUpdate = true;
        }
      }

      if (material instanceof THREE.MeshStandardMaterial) {
        if (materialData.normalMap) {
          const texture = textureService.getTexture(materialData.normalMap);
          if (texture) {
            material.normalMap = texture;
            material.normalScale.set(1, 1);
            material.needsUpdate = true;
          }
        }

        if (materialData.roughnessMap) {
          const texture = textureService.getTexture(materialData.roughnessMap);
          if (texture) {
            material.roughnessMap = texture;
            material.needsUpdate = true;
          }
        }

        if (materialData.metalnessMap) {
          const texture = textureService.getTexture(materialData.metalnessMap);
          if (texture) {
            material.metalnessMap = texture;
            material.needsUpdate = true;
          }
        }
      }
    }
  }, [material, materialData, isLoading, loadedTextures]);

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  return <primitive object={material} attach="material" />;
}