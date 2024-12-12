import * as THREE from 'three';

interface TextureLoadingStats {
  total: number;
  loaded: number;
  failed: number;
  textureInfo: Map<string, {
    status: 'loading' | 'success' | 'error';
    error?: string;
    size?: { width: number; height: number };
    type?: string;
  }>;
}

class TextureLogger {
  private stats: TextureLoadingStats = {
    total: 0,
    loaded: 0,
    failed: 0,
    textureInfo: new Map()
  };

  logTextureAttempt(url: string) {
    this.stats.total++;
    this.stats.textureInfo.set(url, { status: 'loading' });
    console.log(`🔄 Loading texture: ${url}`);
  }

  logTextureSuccess(url: string, texture: THREE.Texture) {
    this.stats.loaded++;
    this.stats.textureInfo.set(url, {
      status: 'success',
      size: {
        width: texture.image.width,
        height: texture.image.height
      },
      type: texture.image.src?.split('.').pop() || 'unknown'
    });

    console.log(`✅ Texture loaded successfully:`, {
      url,
      size: `${texture.image.width}x${texture.image.height}`,
      type: texture.image.src?.split('.').pop() || 'unknown',
      encoding: texture.encoding === THREE.sRGBEncoding ? 'sRGB' : 'Linear'
    });
  }

  logTextureError(url: string, error: Error) {
    this.stats.failed++;
    this.stats.textureInfo.set(url, {
      status: 'error',
      error: error.message
    });

    console.error(`❌ Texture loading failed:`, {
      url,
      error: error.message
    });
  }

  printSummary() {
    const successRate = ((this.stats.loaded / this.stats.total) * 100).toFixed(1);
    
    console.group('📊 Texture Loading Summary');
    console.log(`Total textures: ${this.stats.total}`);
    console.log(`Successfully loaded: ${this.stats.loaded}`);
    console.log(`Failed to load: ${this.stats.failed}`);
    console.log(`Success rate: ${successRate}%`);
    
    if (this.stats.failed > 0) {
      console.group('Failed Textures');
      this.stats.textureInfo.forEach((info, url) => {
        if (info.status === 'error') {
          console.error(`${url}: ${info.error}`);
        }
      });
      console.groupEnd();
    }
    
    console.groupEnd();
  }

  reset() {
    this.stats = {
      total: 0,
      loaded: 0,
      failed: 0,
      textureInfo: new Map()
    };
  }
}

export const textureLogger = new TextureLogger();