import { useState, useEffect } from 'react';
import * as THREE from 'three';
import { MaterialData } from '../types/scene.types';
import { textureService } from '../services/TextureService';

interface LoadingState {
  isLoading: boolean;
  progress: number;
  loadedTextures: Set<string>;
}

export function useProgressiveLoading(materialData: MaterialData) {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    progress: 0,
    loadedTextures: new Set()
  });

  // Track which textures are currently loading
  const [loadingQueue, setLoadingQueue] = useState<string[]>([]);

  useEffect(() => {
    const texturesToLoad = Object.entries(materialData)
      .filter(([key, value]) => key.includes('Map') && value)
      .map(([_, url]) => url as string);

    if (texturesToLoad.length === 0) return;

    let mounted = true;
    setState(prev => ({ ...prev, isLoading: true }));
    setLoadingQueue(texturesToLoad);

    const loadTexture = async (url: string, index: number) => {
      try {
        await textureService.loadTexture(url, {
          encoding: url.includes('normalMap') ? THREE.LinearEncoding : THREE.sRGBEncoding
        });

        if (!mounted) return;

        setState(prev => {
          const newLoadedTextures = new Set(prev.loadedTextures);
          newLoadedTextures.add(url);

          return {
            isLoading: newLoadedTextures.size < texturesToLoad.length,
            progress: (newLoadedTextures.size / texturesToLoad.length) * 100,
            loadedTextures: newLoadedTextures
          };
        });
      } catch (error) {
        console.error(`Failed to load texture: ${url}`, error);
      }
    };

    // Load textures sequentially with a small delay between each
    const loadTexturesProgressively = async () => {
      for (let i = 0; i < texturesToLoad.length; i++) {
        if (!mounted) break;
        await loadTexture(texturesToLoad[i], i);
        await new Promise(resolve => setTimeout(resolve, 50)); // Small delay between loads
      }
    };

    loadTexturesProgressively();

    return () => {
      mounted = false;
    };
  }, [materialData]);

  return state;
}