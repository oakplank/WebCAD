import * as THREE from 'three';

class TextureService {
  private textureLoader: THREE.TextureLoader;
  private textureCache: Map<string, THREE.Texture>;

  constructor() {
    this.textureLoader = new THREE.TextureLoader();
    this.textureCache = new Map();
  }

  private configureTexture(texture: THREE.Texture) {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = false; // GLB textures are already in the correct orientation
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    texture.needsUpdate = true;
    return texture;
  }

  async loadTexture(url: string): Promise<THREE.Texture> {
    if (this.textureCache.has(url)) {
      return this.textureCache.get(url)!;
    }

    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (texture) => {
          const configuredTexture = this.configureTexture(texture);
          this.textureCache.set(url, configuredTexture);
          resolve(configuredTexture);
        },
        undefined,
        (error) => {
          console.error('Error loading texture:', error);
          reject(error);
        }
      );
    });
  }

  getTexture(url: string): THREE.Texture | null {
    return this.textureCache.get(url) || null;
  }

  async loadTextureFromDataUrl(dataUrl: string): Promise<THREE.Texture> {
    if (this.textureCache.has(dataUrl)) {
      return this.textureCache.get(dataUrl)!;
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Failed to get 2D context');
          }
          
          ctx.drawImage(img, 0, 0);
          
          const texture = new THREE.Texture(canvas);
          const configuredTexture = this.configureTexture(texture);
          
          // Force texture update
          configuredTexture.needsUpdate = true;
          
          this.textureCache.set(dataUrl, configuredTexture);
          resolve(configuredTexture);
        } catch (error) {
          console.error('Error processing texture:', error);
          reject(error);
        }
      };

      img.onerror = (error) => {
        console.error('Error loading texture from data URL:', error);
        reject(error);
      };

      // Set source after setting up event handlers
      img.src = dataUrl;
    });
  }

  disposeTexture(url: string) {
    const texture = this.textureCache.get(url);
    if (texture) {
      texture.dispose();
      this.textureCache.delete(url);
    }
  }

  clearCache() {
    this.textureCache.forEach(texture => texture.dispose());
    this.textureCache.clear();
  }
}

export const textureService = new TextureService();