import { useState, useEffect } from 'react';
import * as THREE from 'three';
import { textureService, TextureOptions } from '../services/TextureService';

export function useTexture(
  dataUrl: string | undefined,
  options?: TextureOptions
): {
  texture: THREE.Texture | null;
  isLoading: boolean;
  error: Error | null;
} {
  const [state, setState] = useState<{
    texture: THREE.Texture | null;
    isLoading: boolean;
    error: Error | null;
  }>({
    texture: null,
    isLoading: false,
    error: null
  });

  useEffect(() => {
    if (!dataUrl) {
      setState(prev => ({
        ...prev,
        texture: null,
        isLoading: false,
        error: null
      }));
      return;
    }

    let mounted = true;
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    textureService
      .loadTexture(dataUrl, options)
      .then((loadedTexture) => {
        if (mounted) {
          setState({
            texture: loadedTexture,
            isLoading: false,
            error: null
          });
        }
      })
      .catch((err) => {
        if (mounted) {
          setState({
            texture: null,
            isLoading: false,
            error: err
          });
        }
      });

    return () => {
      mounted = false;
      // Don't dispose texture here as it's managed by TextureService
    };
  }, [dataUrl, options?.encoding, options?.flipY, options?.premultiplyAlpha]);

  return state;
}