import * as THREE from 'three';
import { textureLogger } from '../utils/textureLogger';

export interface TextureOptions {
  encoding?: THREE.TextureEncoding;
  flipY?: boolean;
  premultiplyAlpha?: boolean;
}

class TextureService {
  private textureLoader: THREE.TextureLoader;
  private textureCache: Map<string, THREE.Texture>;

  constructor() {
    this.textureLoader = new THREE.TextureLoader();
    this.textureCache = new Map();
  }

  async loadTexture(
    dataUrl: string, 
    options: TextureOptions = {}
  ): Promise<THREE.Texture | null> {
    try {
      // Generate cache key including options
      const cacheKey = this.generateCacheKey(dataUrl, options);

      // Check cache first
      if (this.textureCache.has(cacheKey)) {
        return this.textureCache.get(cacheKey)!;
      }

      textureLogger.logTextureAttempt(dataUrl);

      // Load new texture
      const texture = await new Promise<THREE.Texture>((resolve, reject) => {
        this.textureLoader.load(
          dataUrl,
          (texture) => {
            texture.encoding = options.encoding ?? THREE.sRGBEncoding;
            texture.flipY = options.flipY ?? false;
            texture.premultiplyAlpha = options.premultiplyAlpha ?? true;
            texture.needsUpdate = true;
            textureLogger.logTextureSuccess(dataUrl, texture);
            resolve(texture);
          },
          undefined,
          (error) => {
            textureLogger.logTextureError(dataUrl, error);
            reject(error);
          }
        );
      });

      // Cache the texture
      this.textureCache.set(cacheKey, texture);
      return texture;
    } catch (error) {
      console.error('Failed to load texture:', error);
      return null;
    }
  }

  getTexture(dataUrl: string): THREE.Texture | null {
    return this.textureCache.get(dataUrl) || null;
  }

  private generateCacheKey(dataUrl: string, options: TextureOptions): string {
    return `${dataUrl}-${options.encoding}-${options.flipY}-${options.premultiplyAlpha}`;
  }

  disposeTexture(dataUrl: string) {
    const texture = this.textureCache.get(dataUrl);
    if (texture) {
      texture.dispose();
      this.textureCache.delete(dataUrl);
    }
  }

  clearCache() {
    this.textureCache.forEach(texture => texture.dispose());
    this.textureCache.clear();
    textureLogger.reset();
  }
}

export const textureService = new TextureService();